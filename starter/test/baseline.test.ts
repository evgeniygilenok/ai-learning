import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { MemorySaver } from "@langchain/langgraph";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { runDeterministicTriage } from "../src/app.ts";
import { buildLangGraphWorkflow, resumeLangGraphWorkflow } from "../src/langgraph-workflow.ts";
import { createMcpServer, createMcpToolHandlers } from "../src/mcp-server.ts";
import { FakeModelProvider, OpenAIResponsesProvider } from "../src/provider.ts";
import { QdrantVectorStore, retrieve, type Chunk } from "../src/retrieval.ts";
import { assembleContext, type ContextMessage } from "../src/state.ts";
import { InMemoryToolExecutionStore, ToolPolicyError, executeTool } from "../src/tools.ts";
import { runModelDrivenWorkflow, nextState, type WorkflowState } from "../src/workflow.ts";

test("triage exposes success and contract-failure states", async () => {
  assert.deepEqual(await runDeterministicTriage("pending transfer"), ["queued", "streaming", "validating", "complete"]);
  assert.deepEqual(await runDeterministicTriage("pending transfer", "invalid-output"), ["queued", "streaming", "validating", "failed"]);
});

test("real provider maps Responses API structured output and telemetry", async () => {
  let sent: Record<string, unknown> | undefined;
  const provider = new OpenAIResponsesProvider({
    apiKey: "test-key",
    fetch: async (_input, init) => {
      sent = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({
        id: "resp_1",
        model: "gpt-5.6-terra",
        output: [{ type: "message", content: [{ type: "output_text", text: "{\"ok\":true}" }] }],
        usage: { input_tokens: 12, output_tokens: 5 }
      }), { status: 200, headers: { "x-request-id": "request_1" } });
    }
  });
  const response = await provider.generate({
    input: "hello",
    model: "gpt-5.6-terra",
    modelVersion: "test",
    maxInputTokens: 100,
    maxOutputTokens: 20,
    timeoutMs: 1_000,
    outputSchema: { name: "answer", schema: { type: "object", properties: { ok: { type: "boolean" } }, required: ["ok"], additionalProperties: false } }
  });
  assert.equal(response.text, "{\"ok\":true}");
  assert.equal(response.requestId, "request_1");
  assert.deepEqual(response.usage, { inputTokens: 12, outputTokens: 5 });
  assert.equal((sent?.text as { format: { strict: boolean } }).format.strict, true);
  assert.equal(sent?.store, false);
});

test("real provider maps function calls and tool-result continuations", async () => {
  const bodies: Record<string, any>[] = [];
  const provider = new OpenAIResponsesProvider({
    apiKey: "test-key",
    fetch: async (_input, init) => {
      bodies.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({
        id: `resp_${bodies.length}`,
        model: "gpt-5.6-terra",
        output: bodies.length === 1
          ? [{ type: "function_call", call_id: "call_1", name: "lookupTransfer", arguments: "{\"transferId\":\"tr_001\",\"tenantId\":\"demo-bank\"}" }]
          : [{ type: "message", content: [{ type: "output_text", text: "done" }] }],
        usage: { input_tokens: 10, output_tokens: 4 }
      }), { status: 200 });
    }
  });
  const base = {
    input: "look up transfer",
    model: "gpt-5.6-terra",
    modelVersion: "test",
    maxInputTokens: 100,
    maxOutputTokens: 50,
    timeoutMs: 1_000,
    tools: [{ name: "lookupTransfer", description: "lookup", parameters: { type: "object" as const, properties: {}, additionalProperties: false } }]
  };
  const first = await provider.generate(base);
  assert.deepEqual(first.toolCalls[0], { callId: "call_1", name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "demo-bank" } });
  const second = await provider.generate({ ...base, previousResponseId: first.responseId, toolOutputs: [{ callId: "call_1", output: "{\"status\":\"pending\"}" }] });
  assert.equal(second.text, "done");
  assert.equal(bodies[0].store, true);
  assert.equal(bodies[1].previous_response_id, "resp_1");
  assert.equal(bodies[1].input[0].type, "function_call_output");
});

test("write tool requires approval, scope, validation, and idempotency", () => {
  const request = { name: "draftEscalation" as const, args: { transferId: "tr_001", tenantId: "demo-bank", reason: "Pending beyond expected window" } };
  assert.throws(() => executeTool(request), ToolPolicyError);
  assert.equal(executeTool(request, { approved: true }).status, "dry-run");
  assert.throws(() => executeTool(request, { approved: true, dryRun: false }), /idempotency/);

  const store = new InMemoryToolExecutionStore();
  assert.equal(executeTool(request, { approved: true, dryRun: false, idempotencyKey: "run:call", store }).status, "executed");
  assert.equal(executeTool(request, { approved: true, dryRun: false, idempotencyKey: "run:call", store }).status, "replayed");
});

test("retrieval filters unauthorized candidates before scoring", async () => {
  const chunks = JSON.parse(await readFile(new URL("../data/documents.json", import.meta.url), "utf8")) as Chunk[];
  assert.equal(retrieve("pending transfer", chunks, { tenantId: "demo-bank", roles: ["guest"] }).length, 0);
  assert.equal(retrieve("pending transfer", chunks, { tenantId: "demo-bank", roles: ["support-agent"] })[0]?.sourceId, "policy-transfer-status-2026-01");
});

test("Qdrant query applies tenant and role filters inside the vector request", async () => {
  let body: Record<string, any> | undefined;
  const store = new QdrantVectorStore({
    url: "http://qdrant.test",
    fetch: async (_input, init) => {
      body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ result: { points: [] } }), { status: 200 });
    }
  });
  await store.search([0.1, 0.2], { tenantId: "demo-bank", roles: ["support-agent"] });
  assert.equal(body?.filter.must[0].match.value, "demo-bank");
  assert.deepEqual(body?.filter.must[1].match.any, ["support-agent"]);
});

test("legacy state machine still pauses before execution", () => {
  const initial: WorkflowState = { runId: "run-1", status: "research", approved: false, completedEffectIds: [] };
  const paused = nextState(initial, "researched");
  assert.equal(paused.status, "awaiting-approval");
  assert.equal(nextState(paused, "approve").status, "execute");
});

test("model-driven workflow executes reads but pauses before a proposed write", async () => {
  const provider = agentProvider();
  const initial: WorkflowState = { runId: "run-agent", status: "research", approved: false, completedEffectIds: [] };
  const paused = await runModelDrivenWorkflow({ provider, userRequest: "Escalate transfer", state: initial });
  assert.equal(paused.status, "awaiting-approval");
  assert.equal(paused.toolResults?.length, 1);
  assert.equal(paused.completedEffectIds.length, 0);
  const complete = await runModelDrivenWorkflow({ provider, userRequest: "Escalate transfer", state: paused, decision: "approve" });
  assert.equal(complete.status, "complete");
  assert.equal(complete.completedEffectIds.length, 1);
});

test("LangGraph rebuild persists an approval interrupt and resumes once", async () => {
  const graph = buildLangGraphWorkflow(agentProvider(), new MemorySaver());
  const threadId = "langgraph-test";
  const first = await graph.invoke({
    runId: threadId,
    userRequest: "Escalate transfer",
    status: "research",
    approved: false,
    pendingToolCall: undefined,
    lastResponseId: undefined,
    lookupResult: undefined,
    draftResult: undefined,
    finalText: undefined,
    completedEffectIds: []
  }, { configurable: { thread_id: threadId } });
  assert.equal(first.status, "awaiting-approval");
  assert.equal(first.completedEffectIds.length, 0);
  const final = await resumeLangGraphWorkflow(graph, threadId, "approve");
  assert.equal(final.status, "complete");
  assert.equal(final.completedEffectIds.length, 1);
});

test("MCP handlers fail closed for confused-deputy and least-scope calls", () => {
  const handlers = createMcpToolHandlers({ MCP_TENANT_ID: "demo-bank", MCP_SCOPES: "transfers:read", MCP_WRITE_MODE: "disabled" });
  assert.throws(() => handlers.lookupTransfer({ transferId: "tr_001", tenantId: "other-bank" }), /Tenant/);
  assert.throws(() => handlers.draftEscalation({ transferId: "tr_001", tenantId: "demo-bank", reason: "Pending beyond expected window", idempotencyKey: "mcp-call-001" }), /scope/);
});

test("MCP SDK client lists and invokes the least-scope server over protocol transport", async () => {
  const server = createMcpServer({ MCP_TENANT_ID: "demo-bank", MCP_SCOPES: "transfers:read", MCP_WRITE_MODE: "disabled" });
  const client = new Client({ name: "course-test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  const listed = await client.listTools();
  assert.deepEqual(listed.tools.map((tool) => tool.name).sort(), ["draftEscalation", "lookupTransfer"]);
  const result = await client.callTool({ name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "demo-bank" } });
  assert.equal(result.isError, undefined);
  assert.match(JSON.stringify(result.structuredContent), /pending/);
  await client.close();
  await server.close();
});

test("context assembly compacts old history under a per-step token budget", async () => {
  const history: ContextMessage[] = [
    { id: "policy", role: "system", content: "Never execute writes without approval.", required: true },
    ...Array.from({ length: 12 }, (_, index) => ({ id: `turn-${index}`, role: "user" as const, content: `Message ${index} ${"detail ".repeat(30)}` }))
  ];
  const assembled = await assembleContext(history, { maxInputTokens: 260, reservedOutputTokens: 60, recentMessageTokens: 80 }, async (messages) => `Earlier IDs: ${messages.map((message) => message.id).join(", ")}`);
  assert.ok(assembled.metrics.tokensSaved > 0);
  assert.ok(assembled.metrics.tokensAfter <= assembled.metrics.budget);
  assert.ok(assembled.summary?.content.includes("turn-0"));
});

function agentProvider() {
  return new FakeModelProvider([
    { text: "", responseId: "response-lookup", toolCalls: [{ callId: "call-lookup", name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "demo-bank" } }] },
    { text: "", responseId: "response-draft", toolCalls: [{ callId: "call-draft", name: "draftEscalation", arguments: { transferId: "tr_001", tenantId: "demo-bank", reason: "Pending beyond expected window" } }] },
    { text: "Escalation draft created after approval.", responseId: "response-final", toolCalls: [] }
  ]);
}
