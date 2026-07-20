import { readFile } from "node:fs/promises";
import { createDemoProvider, FakeModelProvider, type ModelProvider } from "./provider.ts";
import { modelSpan, OtlpHttpTraceExporter } from "./trace.ts";
import { runModelDrivenWorkflow, type WorkflowState } from "./workflow.ts";

type AgentCase = {
  id: string;
  input: string;
  expected: { mustPauseForApproval: boolean; mustNotExecuteTwice: boolean };
  slice: string;
};

const cases = JSON.parse(await readFile(new URL("../evals/agent-cases.json", import.meta.url), "utf8")) as AgentCase[];
const exporter = OtlpHttpTraceExporter.fromEnv();
const realModel = process.env.REAL_MODEL_EVAL === "1";
let failures = 0;

for (const evalCase of cases) {
  const provider = realModel ? createDemoProvider() : deterministicAgentProvider();
  const initial: WorkflowState = { runId: evalCase.id, status: "research", approved: false, completedEffectIds: [] };
  const started = performance.now();
  let state: WorkflowState;
  let errorType: string | undefined;
  try {
    state = await runModelDrivenWorkflow({ provider, userRequest: evalCase.input, state: initial });
  } catch (error) {
    state = { ...initial, status: "failed" };
    errorType = error instanceof Error ? error.name : "unknown";
  }
  const passed = (!evalCase.expected.mustPauseForApproval || state.status === "awaiting-approval")
    && (!evalCase.expected.mustNotExecuteTwice || state.completedEffectIds.length === new Set(state.completedEffectIds).size);
  if (!passed) failures += 1;
  const span = modelSpan({
    operation: "invoke_agent",
    provider: realModel ? "openai" : "fake",
    requestModel: process.env.OPENAI_MODEL ?? (realModel ? "gpt-5.6-terra" : "fake-agent"),
    responseModel: process.env.OPENAI_MODEL ?? (realModel ? "gpt-5.6-terra" : "fake-agent"),
    inputTokens: state.usage?.inputTokens ?? Math.ceil(evalCase.input.length / 4),
    outputTokens: state.usage?.outputTokens ?? 0,
    durationMs: Math.round(performance.now() - started),
    errorType: errorType ?? (passed ? undefined : "eval_regression"),
    runId: evalCase.id
  });
  span.attributes = {
    ...span.attributes,
    "eval.case.id": evalCase.id,
    "eval.slice": evalCase.slice,
    "eval.passed": passed,
    "agent.status": state.status,
    "agent.step_count": state.stepCount ?? 0,
    "agent.tool_result_count": state.toolResults?.length ?? 0,
    "agent.completed_effect_count": state.completedEffectIds.length,
    "agent.deviation.codes": state.deviations?.map((deviation) => deviation.code).join(",") ?? "none"
  };
  await exporter.export([span]);
  console.log(JSON.stringify({ evalId: evalCase.id, slice: evalCase.slice, passed, status: state.status }));
}

if (failures) throw new Error(`Hosted release gate blocked: ${failures} agent eval regression(s)`);
console.log(`Hosted release gate passed: ${cases.length} case(s) exported.`);

function deterministicAgentProvider(): ModelProvider {
  return new FakeModelProvider([
    {
      text: "",
      responseId: "response-lookup",
      toolCalls: [{ callId: "call-lookup", name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "demo-bank" } }]
    },
    {
      text: "",
      responseId: "response-draft",
      toolCalls: [{ callId: "call-draft", name: "draftEscalation", arguments: { transferId: "tr_001", tenantId: "demo-bank", reason: "Pending beyond expected window" } }]
    }
  ]);
}
