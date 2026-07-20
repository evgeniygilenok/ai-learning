export type ModelUsage = { inputTokens: number; outputTokens: number };

export type JsonSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
};

export type ModelToolDefinition = {
  name: string;
  description: string;
  parameters: JsonSchema;
};

export type ModelToolCall = {
  callId: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type ModelToolOutput = { callId: string; output: string };

export type ModelRequest = {
  input: string;
  instructions?: string;
  model: string;
  modelVersion: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  timeoutMs: number;
  reasoningEffort?: "none" | "low" | "medium" | "high";
  outputSchema?: { name: string; schema: JsonSchema };
  tools?: ModelToolDefinition[];
  toolChoice?: "auto" | "none" | "required";
  previousResponseId?: string;
  toolOutputs?: ModelToolOutput[];
  failureMode?: "transient" | "permanent" | "invalid-output";
};

export type ModelResponse = {
  text: string;
  model: string;
  modelVersion: string;
  usage: ModelUsage;
  latencyMs: number;
  responseId?: string;
  requestId?: string;
  toolCalls: ModelToolCall[];
};

export class ProviderError extends Error {
  readonly retryable: boolean;
  readonly code: string;
  readonly status?: number;

  constructor(message: string, retryable: boolean, code: string, status?: number) {
    super(message);
    this.retryable = retryable;
    this.code = code;
    this.status = status;
  }
}

export interface ModelProvider {
  generate(request: ModelRequest): Promise<ModelResponse>;
}

export type ScriptedModelStep = Pick<ModelResponse, "text" | "toolCalls"> & Partial<ModelResponse>;

/** Deterministic provider for tests, eval fixtures, and the pre-graduation path. */
export class FakeModelProvider implements ModelProvider {
  readonly #steps: ScriptedModelStep[];

  constructor(steps: ScriptedModelStep[] = []) {
    this.#steps = [...steps];
  }

  async generate(request: ModelRequest): Promise<ModelResponse> {
    if (request.input.length > request.maxInputTokens * 4) {
      throw new ProviderError("Input exceeds the declared token budget", false, "context_limit");
    }
    if (request.failureMode === "transient") {
      throw new ProviderError("Synthetic rate limit", true, "rate_limit", 429);
    }
    if (request.failureMode === "permanent") {
      throw new ProviderError("Synthetic invalid credentials", false, "authentication", 401);
    }

    const scripted = this.#steps.shift();
    if (scripted) {
      return {
        text: scripted.text,
        toolCalls: scripted.toolCalls,
        model: scripted.model ?? request.model,
        modelVersion: scripted.modelVersion ?? request.modelVersion,
        usage: scripted.usage ?? usageFor(request.input, scripted.text),
        latencyMs: scripted.latencyMs ?? 12,
        responseId: scripted.responseId ?? `fake-response-${this.#steps.length}`,
        requestId: scripted.requestId ?? "fake-request"
      };
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
      usage: usageFor(request.input, text),
      latencyMs: 12,
      responseId: "fake-response-triage",
      requestId: "fake-request",
      toolCalls: []
    };
  }
}

type FetchLike = typeof fetch;

/**
 * Real provider using the OpenAI Responses API without coupling the course to an SDK.
 * The boundary remains portable and the HTTP shape is isolated in this adapter.
 */
export class OpenAIResponsesProvider implements ModelProvider {
  readonly #apiKey: string;
  readonly #baseUrl: string;
  readonly #fetch: FetchLike;

  constructor(options: { apiKey: string; baseUrl?: string; fetch?: FetchLike }) {
    if (!options.apiKey.trim()) throw new ProviderError("OPENAI_API_KEY is required for a real-model run", false, "missing_api_key");
    this.#apiKey = options.apiKey;
    this.#baseUrl = (options.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.#fetch = options.fetch ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): OpenAIResponsesProvider {
    return new OpenAIResponsesProvider({
      apiKey: env.OPENAI_API_KEY ?? "",
      baseUrl: env.OPENAI_BASE_URL
    });
  }

  async generate(request: ModelRequest): Promise<ModelResponse> {
    if (request.input.length > request.maxInputTokens * 4) {
      throw new ProviderError("Input exceeds the declared token budget", false, "context_limit");
    }

    const started = performance.now();
    let response: Response;
    try {
      response = await this.#fetch(`${this.#baseUrl}/responses`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.#apiKey}`,
          "content-type": "application/json"
        },
        body: JSON.stringify(toOpenAIRequest(request)),
        signal: AbortSignal.timeout(request.timeoutMs)
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new ProviderError(`Provider timed out after ${request.timeoutMs}ms`, true, "timeout");
      }
      throw new ProviderError(error instanceof Error ? error.message : "Provider request failed", true, "network");
    }

    const payload = await response.json().catch(() => ({})) as OpenAIResponsePayload;
    if (!response.ok) {
      const message = payload.error?.message ?? `Provider returned HTTP ${response.status}`;
      throw new ProviderError(message, isRetryableStatus(response.status), payload.error?.code ?? `http_${response.status}`, response.status);
    }

    const text = payload.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text ?? "")
      .join("") ?? "";
    const toolCalls = payload.output
      ?.filter((item) => item.type === "function_call")
      .map((item) => parseToolCall(item)) ?? [];

    return {
      text,
      toolCalls,
      model: payload.model ?? request.model,
      modelVersion: payload.model ?? request.modelVersion,
      usage: {
        inputTokens: payload.usage?.input_tokens ?? 0,
        outputTokens: payload.usage?.output_tokens ?? 0
      },
      latencyMs: Math.round(performance.now() - started),
      responseId: payload.id,
      requestId: response.headers.get("x-request-id") ?? undefined
    };
  }
}

export function createDemoProvider(env: NodeJS.ProcessEnv = process.env): ModelProvider {
  return OpenAIResponsesProvider.fromEnv(env);
}

export const DEFAULT_OPENAI_MODEL = "gpt-5.6-terra";

export const TRIAGE_SCHEMA: JsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string", minLength: 5 },
    category: { type: "string", enum: ["transfer-status", "account-access", "unknown"] },
    urgency: { type: "string", enum: ["normal", "urgent"] },
    requiresHumanReview: { type: "boolean" }
  },
  required: ["summary", "category", "urgency", "requiresHumanReview"]
};

function toOpenAIRequest(request: ModelRequest): Record<string, unknown> {
  const input = request.toolOutputs?.length
    ? request.toolOutputs.map((item) => ({ type: "function_call_output", call_id: item.callId, output: item.output }))
    : request.input;
  const body: Record<string, unknown> = {
    model: request.model,
    input,
    instructions: request.instructions,
    max_output_tokens: request.maxOutputTokens,
    // Stateful tool continuations need a retained response ID. Course inputs are synthetic.
    store: Boolean(request.tools?.length || request.previousResponseId)
  };
  if (request.reasoningEffort) body.reasoning = { effort: request.reasoningEffort };
  if (request.previousResponseId) body.previous_response_id = request.previousResponseId;
  if (request.outputSchema) {
    body.text = {
      format: {
        type: "json_schema",
        name: request.outputSchema.name,
        strict: true,
        schema: request.outputSchema.schema
      }
    };
  }
  if (request.tools?.length) {
    body.tools = request.tools.map((tool) => ({
      type: "function",
      name: tool.name,
      description: tool.description,
      strict: true,
      parameters: tool.parameters
    }));
    body.tool_choice = request.toolChoice ?? "auto";
  }
  return Object.fromEntries(Object.entries(body).filter(([, value]) => value !== undefined));
}

type OpenAIOutputItem = {
  type?: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  content?: Array<{ type?: string; text?: string }>;
};

type OpenAIResponsePayload = {
  id?: string;
  model?: string;
  output?: OpenAIOutputItem[];
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string; code?: string };
};

function parseToolCall(item: OpenAIOutputItem): ModelToolCall {
  if (!item.call_id || !item.name) throw new ProviderError("Provider returned an incomplete tool call", false, "invalid_tool_call");
  let args: unknown;
  try {
    args = JSON.parse(item.arguments ?? "{}");
  } catch {
    throw new ProviderError("Provider returned malformed tool arguments", false, "invalid_tool_arguments");
  }
  if (!isObject(args)) throw new ProviderError("Tool arguments must be an object", false, "invalid_tool_arguments");
  return { callId: item.call_id, name: item.name, arguments: args };
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function usageFor(input: string, output: string): ModelUsage {
  return { inputTokens: Math.ceil(input.length / 4), outputTokens: Math.ceil(output.length / 4) };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
