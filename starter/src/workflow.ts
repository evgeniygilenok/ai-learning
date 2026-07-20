import {
  DEFAULT_OPENAI_MODEL,
  type ModelProvider,
  type ModelResponse,
  type ModelToolCall
} from "./provider.ts";
import {
  InMemoryToolExecutionStore,
  executeTool,
  syntheticToolContext,
  toolDefinitions,
  validateToolRequest,
  type ToolRequest,
  type ToolResult
} from "./tools.ts";

export type WorkflowStatus = "triage" | "research" | "awaiting-approval" | "execute" | "complete" | "rejected" | "failed";
export type WorkflowDeviation = { code: "wrong-tool" | "malformed-args" | "premature-termination" | "multiple-tools"; detail: string };
export type WorkflowState = {
  runId: string;
  status: WorkflowStatus;
  approved: boolean;
  completedEffectIds: string[];
  pendingToolCall?: ModelToolCall;
  lastResponseId?: string;
  stepCount?: number;
  finalText?: string;
  deviations?: WorkflowDeviation[];
  toolResults?: Array<{ callId: string; result: ToolResult }>;
  usage?: { inputTokens: number; outputTokens: number; latencyMs: number };
};

export function nextState(state: WorkflowState, event: "researched" | "approve" | "reject" | "executed"): WorkflowState {
  const transitions: Record<WorkflowStatus, Partial<Record<typeof event, WorkflowStatus>>> = {
    triage: {},
    research: { researched: "awaiting-approval" },
    "awaiting-approval": { approve: "execute", reject: "rejected" },
    execute: { executed: "complete" },
    complete: {},
    rejected: {},
    failed: {}
  };
  const status = transitions[state.status][event];
  if (!status) throw new Error(`Invalid transition: ${state.status} + ${event}`);
  return { ...state, status, approved: event === "approve" ? true : state.approved };
}

export type ModelDrivenWorkflowOptions = {
  provider: ModelProvider;
  userRequest: string;
  state: WorkflowState;
  decision?: "approve" | "reject";
  model?: string;
  maxSteps?: number;
  executionStore?: InMemoryToolExecutionStore;
};

/**
 * Runs until completion, a policy failure, or an external approval boundary.
 * The model proposes transitions; application code owns sequence, authorization,
 * approval, idempotency, execution, and termination.
 */
export async function runModelDrivenWorkflow(options: ModelDrivenWorkflowOptions): Promise<WorkflowState> {
  const executionStore = options.executionStore ?? new InMemoryToolExecutionStore();
  const maxSteps = options.maxSteps ?? 6;
  let state: WorkflowState = {
    ...structuredClone(options.state),
    stepCount: options.state.stepCount ?? 0,
    deviations: options.state.deviations ?? [],
    toolResults: options.state.toolResults ?? []
  };
  let continuation: { responseId: string; callId: string; output: string } | undefined;

  if (state.status === "awaiting-approval") {
    if (!options.decision) return state;
    if (options.decision === "reject") {
      return { ...state, status: "rejected", approved: false, pendingToolCall: undefined };
    }
    if (!state.pendingToolCall || !state.lastResponseId) return fail(state, "malformed-args", "Approval state has no preserved model tool call");
    const request = asToolRequest(state.pendingToolCall);
    const idempotencyKey = `${state.runId}:${state.pendingToolCall.callId}`;
    const result = executeTool(request, {
      context: syntheticToolContext,
      approved: true,
      dryRun: false,
      idempotencyKey,
      store: executionStore
    });
    state = {
      ...state,
      status: "execute",
      approved: true,
      pendingToolCall: undefined,
      completedEffectIds: unique([...state.completedEffectIds, idempotencyKey]),
      toolResults: [...(state.toolResults ?? []), { callId: request.callId!, result }]
    };
    continuation = { responseId: state.lastResponseId, callId: request.callId!, output: JSON.stringify(result.output) };
  } else if (state.status !== "research") {
    return state;
  }

  while ((state.stepCount ?? 0) < maxSteps) {
    const response = await options.provider.generate({
      input: options.userRequest,
      instructions: agentInstructions,
      model: options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      modelVersion: "course-agent-2026-07-20",
      maxInputTokens: 1_500,
      maxOutputTokens: 300,
      timeoutMs: 30_000,
      reasoningEffort: "low",
      tools: toolDefinitions,
      toolChoice: continuation ? "auto" : "required",
      previousResponseId: continuation?.responseId,
      toolOutputs: continuation ? [{ callId: continuation.callId, output: continuation.output }] : undefined
    });
    state = {
      ...state,
      stepCount: (state.stepCount ?? 0) + 1,
      lastResponseId: response.responseId ?? state.lastResponseId,
      usage: {
        inputTokens: (state.usage?.inputTokens ?? 0) + response.usage.inputTokens,
        outputTokens: (state.usage?.outputTokens ?? 0) + response.usage.outputTokens,
        latencyMs: (state.usage?.latencyMs ?? 0) + response.latencyMs
      }
    };

    if (response.toolCalls.length > 1) return fail(state, "multiple-tools", "The controlled workflow accepts one proposed tool call per step");
    if (response.toolCalls.length === 0) return finishFromModel(state, response);

    const call = response.toolCalls[0];
    if (!isKnownTool(call.name)) return fail(state, "wrong-tool", `Model proposed unknown tool ${call.name}`);
    let request: ToolRequest;
    try {
      request = asToolRequest(call);
      validateToolRequest(request);
    } catch (error) {
      return fail(state, "malformed-args", error instanceof Error ? error.message : "Malformed tool arguments");
    }

    if (request.name === "draftEscalation") {
      if (!hasLookupResult(state)) return fail(state, "wrong-tool", "Model proposed a write before the required read-only lookup");
      return { ...state, status: "awaiting-approval", pendingToolCall: call, approved: false };
    }
    if (hasLookupResult(state)) return fail(state, "wrong-tool", "Model repeated lookupTransfer instead of advancing");

    let result: ToolResult;
    try {
      result = executeTool(request, { context: syntheticToolContext, dryRun: false });
    } catch (error) {
      return fail(state, "malformed-args", error instanceof Error ? error.message : "Tool request failed validation");
    }
    state = {
      ...state,
      toolResults: [...(state.toolResults ?? []), { callId: request.callId!, result }]
    };
    if (!response.responseId) return fail(state, "premature-termination", "Provider did not return a resumable response ID");
    continuation = { responseId: response.responseId, callId: request.callId!, output: JSON.stringify(result.output) };
  }
  return fail(state, "premature-termination", `Step budget of ${maxSteps} was exhausted`);
}

const agentInstructions = [
  "Resolve a synthetic pending-transfer support request.",
  "First call lookupTransfer with transferId tr_001 and tenantId demo-bank.",
  "After reading its result, call draftEscalation with the same IDs and a useful reason.",
  "The application will pause for human approval before the draft executes.",
  "After the draft result, return a short final summary and do not call another tool."
].join(" ");

function finishFromModel(state: WorkflowState, response: ModelResponse): WorkflowState {
  if (!hasExecutedDraft(state)) {
    return fail(state, "premature-termination", "Model terminated before the approved draft was executed");
  }
  if (!response.text.trim()) return fail(state, "premature-termination", "Model returned neither a tool call nor a final response");
  return { ...state, status: "complete", finalText: response.text };
}

function asToolRequest(call: ModelToolCall): ToolRequest {
  if (!isKnownTool(call.name)) throw new Error(`Unknown tool ${call.name}`);
  return { name: call.name, args: call.arguments, callId: call.callId };
}

function isKnownTool(name: string): name is ToolRequest["name"] {
  return name === "lookupTransfer" || name === "draftEscalation";
}

function hasLookupResult(state: WorkflowState): boolean {
  return Boolean(state.toolResults?.some(({ result }) => result.output.status === "pending"));
}

function hasExecutedDraft(state: WorkflowState): boolean {
  return Boolean(state.toolResults?.some(({ result }) => result.output.drafted === true && result.status !== "dry-run"));
}

function fail(state: WorkflowState, code: WorkflowDeviation["code"], detail: string): WorkflowState {
  return { ...state, status: "failed", deviations: [...(state.deviations ?? []), { code, detail }] };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
