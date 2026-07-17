import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runTriage } from "../src/app.ts";
import { retrieve, type Chunk } from "../src/retrieval.ts";
import { executeTool } from "../src/tools.ts";
import { nextState, type WorkflowState } from "../src/workflow.ts";

test("triage exposes success and contract-failure states", async () => {
  assert.deepEqual(await runTriage("pending transfer"), ["queued", "streaming", "validating", "complete"]);
  assert.deepEqual(await runTriage("pending transfer", "invalid-output"), ["queued", "streaming", "validating", "failed"]);
});

test("write tool requires approval and defaults to dry-run", () => {
  assert.throws(() => executeTool({ name: "draftEscalation", args: {} }), /approval/);
  assert.equal(executeTool({ name: "draftEscalation", args: {} }, { approved: true }).status, "dry-run");
});

test("retrieval filters unauthorized candidates before scoring", async () => {
  const chunks = JSON.parse(await readFile(new URL("../data/documents.json", import.meta.url), "utf8")) as Chunk[];
  assert.equal(retrieve("pending transfer", chunks, { tenantId: "demo-bank", roles: ["guest"] }).length, 0);
  assert.equal(retrieve("pending transfer", chunks, { tenantId: "demo-bank", roles: ["support-agent"] })[0]?.sourceId, "policy-transfer-status-2026-01");
});

test("workflow pauses before execution", () => {
  const initial: WorkflowState = { runId: "run-1", status: "research", approved: false, completedEffectIds: [] };
  const paused = nextState(initial, "researched");
  assert.equal(paused.status, "awaiting-approval");
  assert.equal(nextState(paused, "approve").status, "execute");
});
