import { Annotation, Command, END, START, StateGraph, interrupt } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { DEFAULT_OPENAI_MODEL, type ModelProvider, type ModelToolCall } from "./provider.ts";
import { InMemoryToolExecutionStore, executeTool, syntheticToolContext, toolDefinitions, validateToolRequest, type ToolResult } from "./tools.ts";

const GraphState = Annotation.Root({
  runId: Annotation<string>,
  userRequest: Annotation<string>,
  status: Annotation<"research" | "awaiting-approval" | "execute" | "complete" | "rejected">,
  approved: Annotation<boolean>,
  pendingToolCall: Annotation<ModelToolCall | undefined>,
  lastResponseId: Annotation<string | undefined>,
  lookupResult: Annotation<ToolResult | undefined>,
  draftResult: Annotation<ToolResult | undefined>,
  finalText: Annotation<string | undefined>,
  completedEffectIds: Annotation<string[]>({
    reducer: (left, right) => [...new Set([...(left ?? []), ...(right ?? [])])],
    default: () => []
  })
});

export type LangGraphWorkflowInput = typeof GraphState.State;

export async function createPostgresLangGraphWorkflow(
  provider: ModelProvider,
  options: { connectionString?: string; setup?: boolean } = {}
) {
  const connectionString = options.connectionString ?? process.env.POSTGRES_URL;
  if (!connectionString) throw new Error("POSTGRES_URL is required for the LangGraph checkpointer");
  const checkpointer = PostgresSaver.fromConnString(connectionString);
  if (options.setup ?? true) await checkpointer.setup();
  return buildLangGraphWorkflow(provider, checkpointer);
}

export function buildLangGraphWorkflow(provider: ModelProvider, checkpointer: any) {
  const executionStore = new InMemoryToolExecutionStore();

  const research = async (state: typeof GraphState.State) => {
    const response = await provider.generate(modelRequest(state.userRequest, undefined, undefined, "required"));
    const call = oneToolCall(response.toolCalls);
    if (call.name !== "lookupTransfer") throw new Error(`Expected lookupTransfer, received ${call.name}`);
    const lookupResult = executeTool(
      { name: "lookupTransfer", args: call.arguments, callId: call.callId },
      { context: syntheticToolContext, dryRun: false }
    );
    return { lookupResult, lastResponseId: response.responseId, pendingToolCall: call };
  };

  const proposeDraft = async (state: typeof GraphState.State) => {
    if (!state.lastResponseId || !state.pendingToolCall || !state.lookupResult) throw new Error("Lookup continuation state is incomplete");
    const response = await provider.generate(modelRequest(
      state.userRequest,
      state.lastResponseId,
      { callId: state.pendingToolCall.callId, output: JSON.stringify(state.lookupResult.output) },
      "required"
    ));
    const call = oneToolCall(response.toolCalls);
    if (call.name !== "draftEscalation") throw new Error(`Expected draftEscalation, received ${call.name}`);
    validateToolRequest({ name: "draftEscalation", args: call.arguments, callId: call.callId });
    return { status: "awaiting-approval" as const, pendingToolCall: call, lastResponseId: response.responseId };
  };

  const approval = (state: typeof GraphState.State) => {
    const decision = interrupt({
      action: "approve-or-reject",
      tool: state.pendingToolCall?.name,
      arguments: state.pendingToolCall?.arguments,
      reason: "External-facing drafts require explicit human approval"
    }) as "approve" | "reject";
    return { approved: decision === "approve", status: decision === "approve" ? "execute" as const : "rejected" as const };
  };

  const executeDraft = (state: typeof GraphState.State) => {
    if (!state.pendingToolCall) throw new Error("No approved tool call is available");
    const idempotencyKey = `${state.runId}:${state.pendingToolCall.callId}`;
    const draftResult = executeTool(
      { name: "draftEscalation", args: state.pendingToolCall.arguments, callId: state.pendingToolCall.callId },
      { context: syntheticToolContext, approved: state.approved, dryRun: false, idempotencyKey, store: executionStore }
    );
    return { draftResult, completedEffectIds: [idempotencyKey] };
  };

  const finalize = async (state: typeof GraphState.State) => {
    if (!state.lastResponseId || !state.pendingToolCall || !state.draftResult) throw new Error("Draft continuation state is incomplete");
    const response = await provider.generate(modelRequest(
      state.userRequest,
      state.lastResponseId,
      { callId: state.pendingToolCall.callId, output: JSON.stringify(state.draftResult.output) },
      "none"
    ));
    if (!response.text.trim()) throw new Error("Model did not return a final response");
    return { status: "complete" as const, finalText: response.text, pendingToolCall: undefined };
  };

  return new StateGraph(GraphState)
    .addNode("research", research)
    .addNode("proposeDraft", proposeDraft)
    .addNode("approval", approval)
    .addNode("executeDraft", executeDraft)
    .addNode("finalize", finalize)
    .addNode("reject", () => ({ status: "rejected" as const, pendingToolCall: undefined }))
    .addEdge(START, "research")
    .addEdge("research", "proposeDraft")
    .addEdge("proposeDraft", "approval")
    .addConditionalEdges("approval", (state) => state.approved ? "execute" : "reject", {
      execute: "executeDraft",
      reject: "reject"
    })
    .addEdge("executeDraft", "finalize")
    .addEdge("finalize", END)
    .addEdge("reject", END)
    .compile({ checkpointer });
}

export async function resumeLangGraphWorkflow(graph: ReturnType<typeof buildLangGraphWorkflow>, threadId: string, decision: "approve" | "reject") {
  return graph.invoke(new Command({ resume: decision }), { configurable: { thread_id: threadId } });
}

function modelRequest(
  input: string,
  previousResponseId?: string,
  toolOutput?: { callId: string; output: string },
  toolChoice: "required" | "none" = "required"
) {
  return {
    input,
    instructions: "For synthetic transfer tr_001 in demo-bank, look up status, propose a draft escalation, then summarize after execution. The runtime owns approval.",
    model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
    modelVersion: "langgraph-course-2026-07-20",
    maxInputTokens: 1_500,
    maxOutputTokens: 300,
    timeoutMs: 30_000,
    reasoningEffort: "low" as const,
    tools: toolDefinitions,
    toolChoice,
    previousResponseId,
    toolOutputs: toolOutput ? [toolOutput] : undefined
  };
}

function oneToolCall(calls: ModelToolCall[]): ModelToolCall {
  if (calls.length !== 1) throw new Error(`Expected exactly one model-proposed tool call, received ${calls.length}`);
  return calls[0];
}
