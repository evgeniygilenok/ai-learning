import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { PracticeStore } from "../src/practice-store.ts";
import { enqueueCase, practiceConfig, processCase, workBatch } from "../src/practice.ts";
import { FakeModelProvider, OpenAIResponsesProvider, ProviderError } from "../src/provider.ts";

function fixture(t: { after: (cleanup: () => void) => void }) {
  const directory = mkdtempSync(join(tmpdir(), "practice-test-"));
  const path = join(directory, "cases.sqlite");
  const store = new PracticeStore(path);
  t.after(() => { store.close(); rmSync(directory, { recursive: true, force: true }); });
  return { store, path };
}
const fake = () => practiceConfig({ PRACTICE_PROVIDER: "fake" });
const request = "Why is my pending transfer delayed?";

test("intake deduplicates exact events and rejects changed payloads without resetting authority", async t => {
  const { store } = fixture(t);
  enqueueCase(store, { ...fake(), scopes: ["transfers:read"] }, "duplicate", request);
  const repeated = enqueueCase(store, fake(), "duplicate", request);
  assert.deepEqual(repeated.context.scopes, ["transfers:read"]);
  assert.throws(() => enqueueCase(store, fake(), "duplicate", "Different pending transfer question"), /different case/);
  assert.throws(() => enqueueCase(store, fake(), "duplicate", request, "tr_missing"), /different case/);
  assert.equal(store.list().length, 1);
  const denied = await processCase(store, "duplicate");
  assert.equal(denied.state.status, "failed");
  assert.match(denied.error!, /Missing escalations:draft/);
  assert.throws(() => store.decide("duplicate", "approve", "test-operator"), /pending proposal/);
  assert.equal(store.effects().length, 0);
});

test("approval persists exact proposal and rejection is terminal with no effect", async t => {
  const { store } = fixture(t);
  enqueueCase(store, fake(), "reject", request);
  const paused = await processCase(store, "reject");
  assert.equal(paused.state.status, "awaiting-approval");
  assert.match(String(paused.state.pendingToolCall?.arguments.reason), /chunk-transfer-pending/);
  assert.equal(store.effects().length, 0);
  store.decide("reject", "reject", "test-operator");
  assert.throws(() => store.decide("reject", "approve", "test-operator"), /already recorded/);
  const rejected = await processCase(store, "reject");
  assert.equal(rejected.state.status, "rejected");
  assert.equal(rejected.state.approved, false);
  assert.equal(store.effects().length, 0);
  assert.throws(() => store.decide("reject", "approve", "test-operator"), /pending proposal/);
});

test("finite worker skips approval pauses, observes cancellation, and honors shutdown", async t => {
  const { store } = fixture(t);
  for (const id of ["one", "two", "cancelled"]) enqueueCase(store, fake(), id, request);
  store.cancel("cancelled");
  const first = await workBatch(store, 1);
  assert.equal(first.length, 1);
  assert.equal(first[0].eventId, "one");
  assert.equal(first[0].state.status, "awaiting-approval");
  const second = await workBatch(store, 20);
  assert.deepEqual(second.map(job => job.eventId), ["two"]);
  const stop = new AbortController(); stop.abort();
  assert.deepEqual(await workBatch(store, 20, stop.signal), []);
  assert.equal(store.load("cancelled").calls, 0);
  assert.equal(store.effects().length, 0);
  await assert.rejects(workBatch(store, 21), /Batch limit/);
});

test("transient errors reserve calls durably and retry from the saved lookup continuation", async t => {
  const { store } = fixture(t);
  enqueueCase(store, fake(), "retry", request);
  let count = 0;
  const provider = {
    async generate() {
      if (++count === 2) throw new ProviderError("synthetic throttle", true, "rate_limit", 429);
      return { text: "", model: "injected", modelVersion: "test", responseId: "read-id", usage: { inputTokens: 10, outputTokens: 2 }, latencyMs: 1,
        toolCalls: [{ callId: "read", name: "lookupTransfer", arguments: { tenantId: "demo-bank", transferId: "tr_001" } }] };
    }
  };
  const retry = await processCase(store, "retry", provider);
  assert.equal(retry.calls, 2);
  assert.equal(retry.state.continuation?.responseId, "read-id");
  assert.ok(retry.nextAttemptAt > Date.now());
  assert.equal((await processCase(store, "retry")).calls, 2);
  const owner = store.claim("retry");
  retry.nextAttemptAt = 0; store.save(retry, owner); store.release("retry", owner);
  const resumed = await processCase(store, "retry");
  assert.equal(resumed.state.status, "awaiting-approval");
  assert.equal(resumed.calls, 3);
  assert.equal(resumed.state.toolResults?.length, 1);
});

test("concurrent claims and expired worker ownership cannot overwrite state or effects", t => {
  const { store, path } = fixture(t);
  enqueueCase(store, fake(), "claimed", request);
  const oldOwner = store.claim("claimed");
  const peer = new PracticeStore(path);
  try {
    assert.throws(() => peer.claim("claimed"), /busy/);
    store.db.prepare("UPDATE jobs SET lease_until=0 WHERE id=?").run("claimed");
    const newOwner = peer.claim("claimed");
    assert.throws(() => store.save(store.load("claimed"), oldOwner), /lease/);
    assert.throws(() => store.executionStore("claimed", oldOwner).set("effect", { status: "executed", auditId: "test", output: {} }), /lease/);
    store.release("claimed", oldOwner);
    assert.throws(() => store.claim("claimed"), /busy/);
    peer.release("claimed", newOwner);
  } finally { peer.close(); }
});

for (const boundary of ["before", "after"] as const) {
  test(`process crash ${boundary} effect commit resumes with one logical effect`, async t => {
    const { store, path } = fixture(t);
    enqueueCase(store, fake(), "crash", request);
    await processCase(store, "crash");
    store.decide("crash", "approve", "test-operator");
    const moduleUrl = new URL("../src/practice-store.ts", import.meta.url).href;
    const serviceUrl = new URL("../src/practice.ts", import.meta.url).href;
    const child = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
      import { PracticeStore } from ${JSON.stringify(moduleUrl)};
      import { processCase } from ${JSON.stringify(serviceUrl)};
      const store = new PracticeStore(process.argv[1]);
      const original = store.executionStore.bind(store);
      store.executionStore = (id, owner) => {
        const execution = original(id, owner);
        return { get: execution.get, set: (key, result) => {
          if (${JSON.stringify(boundary)} === 'before') process.exit(77);
          execution.set(key, result);
          process.exit(77);
        }};
      };
      await processCase(store, 'crash');
    `, path], { encoding: "utf8", timeout: 10_000 });
    assert.equal(child.status, 77, child.stderr);
    assert.equal(store.effects().length, boundary === "after" ? 1 : 0);
    assert.equal(store.load("crash").state.status, "awaiting-approval");
    // Simulate the clock reaching lease expiry. Production waits five minutes.
    store.db.prepare("UPDATE jobs SET lease_until=0 WHERE id=?").run("crash");
    const cli = fileURLToPath(new URL("../src/practice-cli.ts", import.meta.url));
    const resumed = spawnSync(process.execPath, ["--experimental-strip-types", cli, "run", "crash"], {
      env: { ...process.env, PRACTICE_DB: path }, encoding: "utf8", timeout: 10_000
    });
    assert.equal(resumed.status, 0, resumed.stderr);
    assert.equal(JSON.parse(resumed.stdout).status, "complete");
    assert.equal(store.effects().length, 1);
    assert.equal(store.load("crash").state.completedEffectIds.length, 1);
    assert.equal(store.load("crash").state.toolResults?.at(-1)?.result.status, boundary === "after" ? "replayed" : "executed");
    assert.match(String(store.effects()[0].output.reason), /policy window/);
  });
}

test("real provider HTTP seam carries evidence and resumes the approved saved call", async t => {
  const { store } = fixture(t);
  const bodies: any[] = [];
  const responses = [
    { id: "real-read", model: "available-model-version", output: [{ type: "function_call", call_id: "read", name: "lookupTransfer", arguments: '{"transferId":"tr_001","tenantId":"demo-bank"}' }] },
    { id: "real-draft", model: "available-model-version", output: [{ type: "function_call", call_id: "draft", name: "draftEscalation", arguments: '{"transferId":"tr_001","tenantId":"demo-bank","reason":"Three days exceeds two-day policy [chunk-transfer-pending-v1]"}' }] },
    { id: "real-final", model: "available-model-version", output: [{ type: "message", content: [{ type: "output_text", text: "Recorded, still pending. [chunk-transfer-pending-v1]" }] }] }
  ];
  const provider = new OpenAIResponsesProvider({ apiKey: "synthetic-key", fetch: async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ ...responses.shift(), usage: { input_tokens: 100, output_tokens: 30 } }), { status: 200 });
  } });
  enqueueCase(store, { ...fake(), mode: "real", model: "available-model" }, "http-seam", request);
  assert.equal((await processCase(store, "http-seam", provider)).state.status, "awaiting-approval");
  assert.match(bodies[0].input, /chunk-transfer-pending-v1/);
  assert.equal(bodies[1].previous_response_id, "real-read");
  store.decide("http-seam", "approve", "test-operator");
  const completed = await processCase(store, "http-seam", provider);
  assert.equal(completed.state.status, "complete");
  assert.equal(bodies[2].previous_response_id, "real-draft");
  assert.equal(bodies[2].input[0].call_id, "draft");
  assert.equal(completed.state.modelIdentity, "available-model-version");
  assert.equal(completed.state.usage?.inputTokens, 300);
});

test("configuration fails clearly and reserved spend survives a failed provider call", async t => {
  assert.throws(() => practiceConfig({ PRACTICE_PROVIDER: "typo" }), /fake or real/);
  assert.throws(() => practiceConfig({ PRACTICE_PROVIDER: "real" }), /OPENAI_MODEL/);
  assert.throws(() => practiceConfig({ PRACTICE_MAX_CALLS: "0" }), /positive/);
  assert.throws(() => practiceConfig({ PRACTICE_MAX_CALLS: "1.5" }), /integer/);
  assert.throws(() => practiceConfig({ PRACTICE_SCOPES: "admin" }), /Unknown practice scope/);
  const { store } = fixture(t);
  enqueueCase(store, { ...fake(), mode: "real", inputPrice: 1, outputPrice: 1, spendCeiling: .02 }, "spend", request);
  let calls = 0;
  const failure = { generate: async () => { calls++; throw new ProviderError("test", true, "timeout"); } };
  const failed = await processCase(store, "spend", failure);
  assert.equal(failed.calls, 1);
  assert.equal(failed.reservedUsd, .0153);
  const owner = store.claim("spend");
  failed.nextAttemptAt = 0; store.save(failed, owner); store.release("spend", owner);
  const capped = await processCase(store, "spend", failure);
  assert.equal(capped.state.status, "failed");
  assert.match(capped.error!, /spend ceiling/);
  assert.equal(calls, 1);
});

test("missing evidence and unknown records never produce a synthetic draft", async t => {
  const { store } = fixture(t);
  enqueueCase(store, fake(), "evidence", "Unrelated question with no useful policy");
  const missing = await processCase(store, "evidence");
  assert.equal(missing.state.status, "failed");
  assert.equal(missing.calls, 0);
  enqueueCase(store, fake(), "unknown", request, "tr_missing");
  const unknown = await processCase(store, "unknown");
  assert.equal(unknown.state.status, "failed");
  assert.equal(unknown.state.toolResults?.[0].result.output.status, "not-found");
  assert.equal(store.effects().length, 0);
});

test("a model cannot change the trusted case or propose a second effect after approval", async t => {
  const { store } = fixture(t);
  enqueueCase(store, fake(), "wrong-object", request);
  const wrongObject = new FakeModelProvider([{ text: "", toolCalls: [
    { callId: "wrong", name: "lookupTransfer", arguments: { tenantId: "demo-bank", transferId: "tr_other" } }
  ] }]);
  const denied = await processCase(store, "wrong-object", wrongObject);
  assert.equal(denied.state.status, "failed");
  assert.match(denied.error!, /trusted case/);
  enqueueCase(store, fake(), "second-draft", request);
  await processCase(store, "second-draft");
  store.decide("second-draft", "approve", "test-operator");
  const repeated = new FakeModelProvider([{ text: "", toolCalls: [
    { callId: "second-write", name: "draftEscalation", arguments: { tenantId: "demo-bank", transferId: "tr_001", reason: "Another proposal after execution" } }
  ] }]);
  const failed = await processCase(store, "second-draft", repeated);
  assert.equal(failed.state.status, "failed");
  assert.match(failed.error!, /already recorded/);
  assert.equal(failed.state.pendingToolCall, undefined);
  assert.equal(store.effects().length, 1);
  await processCase(store, "second-draft");
  assert.equal(store.effects().length, 1);
});

test("final-summary timeout resumes the execute continuation without repeating the effect", async t => {
  const { store } = fixture(t);
  enqueueCase(store, fake(), "summary-retry", request);
  await processCase(store, "summary-retry");
  store.decide("summary-retry", "approve", "test-operator");
  const interrupted = await processCase(store, "summary-retry", {
    generate: async () => { throw new ProviderError("Synthetic final timeout", true, "timeout"); }
  });
  assert.equal(interrupted.state.status, "execute");
  assert.equal(interrupted.state.continuation?.responseId, "fake-draft");
  assert.equal(store.effects().length, 1);
  const owner = store.claim("summary-retry");
  interrupted.nextAttemptAt = 0; store.save(interrupted, owner); store.release("summary-retry", owner);
  const completed = await processCase(store, "summary-retry");
  assert.equal(completed.state.status, "complete");
  assert.equal(completed.calls, 4);
  assert.equal(store.effects().length, 1);
});
