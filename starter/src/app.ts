import { FakeModelProvider, ProviderError, type ModelRequest } from "./provider.ts";
import { ContractError, parseTriageResult } from "./triage.ts";

export type RunState = "queued" | "streaming" | "validating" | "complete" | "failed";

export async function runTriage(input: string, failureMode?: ModelRequest["failureMode"]): Promise<RunState[]> {
  const states: RunState[] = ["queued"];
  const provider = new FakeModelProvider();
  try {
    states.push("streaming");
    const response = await provider.generate({ input, model: "fake-triage", modelVersion: "2026-07-17", maxInputTokens: 500, maxOutputTokens: 150, timeoutMs: 2_000, failureMode });
    states.push("validating");
    const result = parseTriageResult(response.text);
    console.log(JSON.stringify({ event: "triage.complete", result, telemetry: response }, null, 2));
    states.push("complete");
  } catch (error) {
    const known = error instanceof ProviderError || error instanceof ContractError;
    console.error(JSON.stringify({ event: "triage.failed", known, message: error instanceof Error ? error.message : "Unknown failure" }));
    states.push("failed");
  }
  return states;
}

if (process.argv[1]?.endsWith("app.ts")) {
  const states = await runTriage("Why is my synthetic transfer still pending?");
  console.log(`states: ${states.join(" -> ")}`);
}
