import { DEFAULT_OPENAI_MODEL, type ModelProvider } from "./provider.ts";
import type { WorkflowState } from "./workflow.ts";

export interface StateStore {
  load(runId: string): Promise<WorkflowState | undefined>;
  save(state: WorkflowState): Promise<void>;
}

export class InMemoryStateStore implements StateStore {
  #runs = new Map<string, WorkflowState>();
  async load(runId: string) { return structuredClone(this.#runs.get(runId)); }
  async save(state: WorkflowState) { this.#runs.set(state.runId, structuredClone(state)); }
}

export type ContextMessage = {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  required?: boolean;
};

export type ContextBudget = {
  maxInputTokens: number;
  reservedOutputTokens: number;
  recentMessageTokens: number;
};

export type ContextAssembly = {
  messages: ContextMessage[];
  summary?: ContextMessage;
  metrics: {
    tokensBefore: number;
    tokensAfter: number;
    tokensSaved: number;
    compactedMessages: number;
    budget: number;
  };
};

export type HistorySummarizer = (messages: ContextMessage[], maxTokens: number) => Promise<string>;

/**
 * Builds context just in time: required policy first, recent turns next, and a
 * provenance-preserving summary for older history when the step budget is exceeded.
 */
export async function assembleContext(
  history: ContextMessage[],
  budget: ContextBudget,
  summarize: HistorySummarizer
): Promise<ContextAssembly> {
  const usableBudget = budget.maxInputTokens - budget.reservedOutputTokens;
  if (usableBudget <= 0) throw new Error("Output reservation leaves no input budget");
  const tokensBefore = history.reduce((sum, message) => sum + estimateTokens(message.content), 0);
  if (tokensBefore <= usableBudget) {
    return {
      messages: structuredClone(history),
      metrics: { tokensBefore, tokensAfter: tokensBefore, tokensSaved: 0, compactedMessages: 0, budget: usableBudget }
    };
  }

  const required = history.filter((message) => message.required);
  const optional = history.filter((message) => !message.required);
  const recent: ContextMessage[] = [];
  let recentTokens = 0;
  for (const message of [...optional].reverse()) {
    const tokens = estimateTokens(message.content);
    if (recentTokens + tokens > budget.recentMessageTokens && recent.length > 0) break;
    recent.unshift(message);
    recentTokens += tokens;
  }
  const recentIds = new Set(recent.map((message) => message.id));
  const compactable = optional.filter((message) => !recentIds.has(message.id));
  const requiredTokens = required.reduce((sum, message) => sum + estimateTokens(message.content), 0);
  const summaryBudget = Math.max(64, usableBudget - requiredTokens - recentTokens);
  const summaryText = await summarize(compactable, summaryBudget);
  const summary: ContextMessage = {
    id: `summary-${compactable.at(-1)?.id ?? "empty"}`,
    role: "system",
    content: `History summary (${compactable.length} messages; retain cited IDs): ${summaryText}`,
    required: true
  };
  const messages = [...required, summary, ...recent];
  const tokensAfter = messages.reduce((sum, message) => sum + estimateTokens(message.content), 0);
  if (tokensAfter > usableBudget) throw new Error(`Compacted context still exceeds the ${usableBudget}-token input budget`);

  return {
    messages,
    summary,
    metrics: {
      tokensBefore,
      tokensAfter,
      tokensSaved: tokensBefore - tokensAfter,
      compactedMessages: compactable.length,
      budget: usableBudget
    }
  };
}

export function createModelSummarizer(provider: ModelProvider, model = process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL): HistorySummarizer {
  return async (messages, maxTokens) => {
    const response = await provider.generate({
      input: messages.map((message) => `[${message.id}] ${message.role}: ${message.content}`).join("\n"),
      instructions: "Summarize decisions, unresolved facts, tool results, and source message IDs. Do not invent details.",
      model,
      modelVersion: "context-summary-2026-07-20",
      maxInputTokens: 25_000,
      maxOutputTokens: maxTokens,
      timeoutMs: 30_000,
      reasoningEffort: "low"
    });
    return response.text;
  };
}

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
