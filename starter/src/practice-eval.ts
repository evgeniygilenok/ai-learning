import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { FakeModelProvider } from "./provider.ts";
import { PracticeStore } from "./practice-store.ts";
import { enqueueCase, practiceConfig, processCase } from "./practice.ts";

const cases = JSON.parse(readFileSync(new URL("../evals/practice-cases.json", import.meta.url), "utf8")) as Array<{
  id: string; slice: string; request: string; decision?: "approve" | "reject";
  scopes?: string[]; maxCalls?: number; fixture?: string; transferId?: string;
  expectedStatus: string; expectedEffects: number;
}>;
const directory = mkdtempSync(join(tmpdir(), "practice-eval-"));
const store = new PracticeStore(join(directory, "eval.sqlite"));
try {
  const results = [];
  for (const item of cases) {
    const config = { ...practiceConfig({ PRACTICE_PROVIDER: "fake" }), ...(item.scopes ? { scopes: item.scopes } : {}), ...(item.maxCalls ? { maxCalls: item.maxCalls } : {}) };
    enqueueCase(store, config, item.id, item.request, item.transferId);
    const provider = item.fixture === "malformed" ? new FakeModelProvider([
      { text: "", responseId: "malformed-read", toolCalls: [{ callId: "lookup", name: "lookupTransfer", arguments: { transferId: "tr_001", tenantId: "demo-bank" } }] },
      { text: "", responseId: "malformed-write", toolCalls: [{ callId: "draft", name: "draftEscalation", arguments: { transferId: "tr_001", tenantId: "demo-bank", reason: 7 } }] }
    ]) : undefined;
    let job = await processCase(store, item.id, provider);
    if (item.decision && job.state.status === "awaiting-approval") {
      store.decide(item.id, item.decision, "eval-operator");
      job = await processCase(store, item.id);
    }
    const effects = store.effects().filter(result => result.idempotencyKey?.startsWith(`practice-${item.id}:`)).length;
    results.push({
      id: item.id, slice: item.slice, status: job.state.status, effects,
      calls: job.calls, usage: job.state.usage ?? null, error: job.error ?? job.state.deviations?.at(-1)?.code ?? null,
      passed: job.state.status === item.expectedStatus && effects === item.expectedEffects
    });
  }
  console.log(JSON.stringify({ provider: "fake", evidenceType: "deterministic and injected, not real-model reliability", results }, null, 2));
  if (results.some(result => !result.passed)) process.exitCode = 1;
} finally { store.close(); rmSync(directory, { recursive: true, force: true }); }
