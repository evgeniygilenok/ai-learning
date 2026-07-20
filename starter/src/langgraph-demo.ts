import { createPostgresLangGraphWorkflow, resumeLangGraphWorkflow } from "./langgraph-workflow.ts";
import { createDemoProvider } from "./provider.ts";

const provider = createDemoProvider();
const graph = await createPostgresLangGraphWorkflow(provider);
const threadId = process.env.LANGGRAPH_THREAD_ID ?? `course-${Date.now()}`;
const config = { configurable: { thread_id: threadId } };
const decision = process.env.AGENT_DECISION;
if (decision === "approve" || decision === "reject") {
  const result = await resumeLangGraphWorkflow(graph, threadId, decision);
  console.log(JSON.stringify({ event: "langgraph.resumed", threadId, decision, result }, null, 2));
} else {
  const result = await graph.invoke({
    runId: threadId,
    userRequest: "Escalate synthetic transfer tr_001 because it is still pending.",
    status: "research",
    approved: false,
    pendingToolCall: undefined,
    lastResponseId: undefined,
    lookupResult: undefined,
    draftResult: undefined,
    finalText: undefined,
    completedEffectIds: []
  }, config);
  console.log(JSON.stringify({ event: "langgraph.paused", threadId, result }, null, 2));
  console.log("Postgres checkpoint saved. Re-run with the same LANGGRAPH_THREAD_ID and AGENT_DECISION=approve|reject to resume.");
}
