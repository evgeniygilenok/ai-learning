import { createDemoProvider } from "./provider.ts";
import { InMemoryToolExecutionStore } from "./tools.ts";
import { runModelDrivenWorkflow, type WorkflowState } from "./workflow.ts";

const provider = createDemoProvider();
const executionStore = new InMemoryToolExecutionStore();
const initial: WorkflowState = {
  runId: `agent-${Date.now()}`,
  status: "research",
  approved: false,
  completedEffectIds: []
};

let state = await runModelDrivenWorkflow({
  provider,
  userRequest: "Escalate synthetic transfer tr_001 because it is still pending.",
  state: initial,
  executionStore
});
console.log(JSON.stringify({ event: "agent.paused", state }, null, 2));

const decision = process.env.AGENT_DECISION;
if (state.status === "awaiting-approval" && (decision === "approve" || decision === "reject")) {
  state = await runModelDrivenWorkflow({
    provider,
    userRequest: "Escalate synthetic transfer tr_001 because it is still pending.",
    state,
    decision,
    executionStore
  });
  console.log(JSON.stringify({ event: "agent.resumed", decision, state }, null, 2));
} else if (state.status === "awaiting-approval") {
  console.log("Approval boundary reached. Re-run with AGENT_DECISION=approve or AGENT_DECISION=reject to exercise the boundary.");
}
