export type ModelUsage = { inputTokens: number; outputTokens: number };

export type ModelRequest = {
  input: string;
  model: string;
  modelVersion: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  timeoutMs: number;
  failureMode?: "transient" | "permanent" | "invalid-output";
};

export type ModelResponse = {
  text: string;
  model: string;
  modelVersion: string;
  usage: ModelUsage;
  latencyMs: number;
};

export class ProviderError extends Error {
  readonly retryable: boolean;
  readonly code: string;

  constructor(message: string, retryable: boolean, code: string) {
    super(message);
    this.retryable = retryable;
    this.code = code;
  }
}

export interface ModelProvider {
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export class FakeModelProvider implements ModelProvider {
  async generate(request: ModelRequest): Promise<ModelResponse> {
    if (request.input.length > request.maxInputTokens * 4) {
      throw new ProviderError("Input exceeds the declared token budget", false, "context_limit");
    }
    if (request.failureMode === "transient") {
      throw new ProviderError("Synthetic rate limit", true, "rate_limit");
    }
    if (request.failureMode === "permanent") {
      throw new ProviderError("Synthetic invalid credentials", false, "authentication");
    }

    const text = request.failureMode === "invalid-output"
      ? JSON.stringify({ summary: "Missing required fields" })
      : JSON.stringify({
          summary: "Customer asks why a transfer is pending.",
          category: "transfer-status",
          urgency: "normal",
          requiresHumanReview: false
        });

    return {
      text,
      model: request.model,
      modelVersion: request.modelVersion,
      usage: { inputTokens: Math.ceil(request.input.length / 4), outputTokens: Math.ceil(text.length / 4) },
      latencyMs: 12
    };
  }
}
