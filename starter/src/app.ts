import {
  createDemoProvider,
  DEFAULT_OPENAI_MODEL,
  FakeModelProvider,
  ProviderError,
  TRIAGE_SCHEMA,
  type ModelProvider,
  type ModelRequest
} from "./provider.ts";
import { ContractError, parseTriageResult } from "./triage.ts";

export type RunState = "queued" | "streaming" | "validating" | "complete" | "failed";

export type TriageRunOptions = {
  provider?: ModelProvider;
  failureMode?: ModelRequest["failureMode"];
  model?: string;
};

export async function runTriage(input: string, options: TriageRunOptions = {}): Promise<RunState[]> {
  const states: RunState[] = ["queued"];
  const provider = options.provider ?? createDemoProvider();
  try {
    states.push("streaming");
    const response = await provider.generate({
      input,
      instructions: "Classify this synthetic support request. Return only the requested JSON fields.",
      model: options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
      modelVersion: "course-default-2026-07-20",
      maxInputTokens: 500,
      maxOutputTokens: 150,
      timeoutMs: 20_000,
      reasoningEffort: "low",
      outputSchema: { name: "triage_result", schema: TRIAGE_SCHEMA },
      failureMode: options.failureMode
    });
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

export async function runDeterministicTriage(input: string, failureMode?: ModelRequest["failureMode"]): Promise<RunState[]> {
  return runTriage(input, { provider: new FakeModelProvider(), failureMode, model: "fake-triage" });
}

if (process.argv[1]?.endsWith("app.ts")) {
  const states = await runTriage("Why is my synthetic transfer still pending?");
  console.log(`states: ${states.join(" -> ")}`);
}
