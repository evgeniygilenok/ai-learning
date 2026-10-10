import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { resolve } from "node:path";
import { PracticeStore, type PracticeJob } from "./practice-store.ts";
import { enqueueCase, practiceConfig, processCase, workBatch } from "./practice.ts";

function display(job: PracticeJob) {
  const usage = job.state.usage;
  return {
    eventId: job.eventId, status: job.cancelled ? "cancelled" : job.state.status,
    case: job.request, transferId: job.transferId, provider: job.config.mode,
    model: job.state.modelIdentity ?? job.config.model,
    evidence: job.evidence.map(({ id, sourceId, text }) => ({ id, sourceId, text })),
    pendingProposal: job.state.pendingToolCall ?? null,
    humanDecision: job.decision ?? "none", decisionBy: job.decisionBy ?? null,
    effects: job.state.completedEffectIds,
    toolResults: job.state.toolResults ?? [],
    explanation: job.state.finalText ?? "No completed explanation yet.",
    error: job.error ?? job.state.deviations?.at(-1)?.detail ?? null,
    calls: job.calls, attempts: job.attempts, retryAfter: job.nextAttemptAt ? new Date(job.nextAttemptAt).toISOString() : null,
    usage: usage ?? null,
    estimatedUsageUsd: usage ? (usage.inputTokens * job.config.inputPrice + usage.outputTokens * job.config.outputPrice) / 1_000_000 : 0,
    reservedUsd: job.reservedUsd
  };
}

async function main() {
  const store = new PracticeStore(resolve(process.env.PRACTICE_DB ?? "starter/.practice/course.sqlite"));
  const stop = new AbortController();
  const onStop = () => stop.abort();
  process.on("SIGINT", onStop);
  process.on("SIGTERM", onStop);
  const print = (value: unknown) => console.log(JSON.stringify(value, null, 2));
  const execute = async (args: string[]) => {
    const [command, id, ...rest] = args;
    if (command === "add") print(display(enqueueCase(store, practiceConfig(), id ?? "", rest.join(" "), process.env.PRACTICE_TRANSFER_ID)));
    else if (command === "show") print(display(store.load(id)));
    else if (command === "list") print(store.list().map(job => ({ eventId: job.eventId, status: job.cancelled ? "cancelled" : job.state.status, error: job.error })));
    else if (command === "run") print(display(await processCase(store, id)));
    else if (command === "approve" || command === "reject") {
      store.decide(id, command, "local-operator");
      print(display(await processCase(store, id)));
    } else if (command === "cancel") print(display(store.cancel(id)));
    else if (command === "effects") print(store.effects());
    else if (command === "work") {
      const batchSize = id === undefined ? Number(process.env.PRACTICE_BATCH_SIZE ?? 5) : Number(id);
      print((await workBatch(store, batchSize, stop.signal)).map(display));
    } else if (command === "record") {
      const job = store.load(id);
      print({
        eventId: job.eventId, runId: job.state.runId, provider: job.config.mode,
        model: job.state.modelIdentity ?? job.config.model, status: job.state.status,
        cancelled: Boolean(job.cancelled), calls: job.calls, attempts: job.attempts,
        usage: job.state.usage ?? null, reservedUsd: job.reservedUsd,
        sourceIds: job.evidence.map(item => item.sourceId),
        effects: job.state.completedEffectIds, decision: job.decision ?? null,
        deviations: job.state.deviations?.map(item => item.code) ?? [],
        toolResults: job.state.toolResults?.map(({ callId, result }) => ({ callId, status: result.status, auditId: result.auditId })) ?? []
      });
    } else if (command !== "quit") {
      console.log("Commands: add ID case text | run ID | show ID | approve ID | reject ID | cancel ID | list | effects | work [1-20] | record ID | quit");
    }
    return command !== "quit";
  };
  try {
    if (process.argv.length > 2) { await execute(process.argv.slice(2)); return; }
    console.log("Synthetic support practice. Proposals need your explicit approve or reject command.");
    await execute(["help"]);
    const terminal = createInterface({ input: stdin, output: stdout });
    try {
      while (!stop.signal.aborted) {
        const line = await terminal.question("practice> ", { signal: stop.signal }).catch(() => "quit");
        try { if (!await execute(line.trim().split(/\s+/))) break; }
        catch (error) { console.error(error instanceof Error ? error.message : "Command failed"); }
      }
    } finally { terminal.close(); }
  } finally {
    process.off("SIGINT", onStop); process.off("SIGTERM", onStop); store.close();
  }
}

if (process.argv[1]?.endsWith("practice-cli.ts")) {
  main().catch(error => { console.error(error instanceof Error ? error.message : "Practice failed"); process.exitCode = 1; });
}
