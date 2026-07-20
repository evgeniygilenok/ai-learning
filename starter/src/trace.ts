import { randomBytes } from "node:crypto";

export type Span = {
  name: string;
  startedAt: string;
  durationMs: number;
  status: "ok" | "error";
  attributes: Record<string, string | number | boolean>;
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
};

export const GENAI_SCHEMA_URL = "https://opentelemetry.io/schemas/gen-ai/1.42.0";

export function safeSpan(span: Span): Span {
  const attributes = Object.fromEntries(
    Object.entries(span.attributes).filter(([key]) => !/[Pp]rompt|content|secret|authorization/.test(key))
  );
  return { ...span, attributes };
}

export function modelSpan(input: {
  operation: "chat" | "invoke_agent";
  provider: string;
  requestModel: string;
  responseModel: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  errorType?: string;
  runId: string;
}): Span {
  return {
    name: `${input.operation} ${input.requestModel}`,
    startedAt: new Date(Date.now() - input.durationMs).toISOString(),
    durationMs: input.durationMs,
    status: input.errorType ? "error" : "ok",
    attributes: {
      "gen_ai.operation.name": input.operation,
      "gen_ai.provider.name": input.provider,
      "gen_ai.request.model": input.requestModel,
      "gen_ai.response.model": input.responseModel,
      "gen_ai.usage.input_tokens": input.inputTokens,
      "gen_ai.usage.output_tokens": input.outputTokens,
      "agent.run.id": input.runId,
      ...(input.errorType ? { "error.type": input.errorType } : {})
    }
  };
}

export interface TraceExporter {
  export(spans: Span[]): Promise<void>;
}

/** Sends redacted spans to any hosted backend with an OTLP/HTTP JSON endpoint. */
export class OtlpHttpTraceExporter implements TraceExporter {
  readonly #endpoint: string;
  readonly #headers: Record<string, string>;
  readonly #fetch: typeof fetch;

  constructor(options: { endpoint: string; headers?: Record<string, string>; fetch?: typeof fetch }) {
    if (!options.endpoint.trim()) throw new Error("An OTLP endpoint is required");
    this.#endpoint = options.endpoint.endsWith("/v1/traces")
      ? options.endpoint
      : `${options.endpoint.replace(/\/$/, "")}/v1/traces`;
    this.#headers = options.headers ?? {};
    this.#fetch = options.fetch ?? fetch;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env): OtlpHttpTraceExporter {
    return new OtlpHttpTraceExporter({
      endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "",
      headers: parseHeaderList(env.OTEL_EXPORTER_OTLP_HEADERS ?? "")
    });
  }

  async export(spans: Span[]): Promise<void> {
    const response = await this.#fetch(this.#endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...this.#headers },
      body: JSON.stringify(toOtlpPayload(spans.map(safeSpan))),
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`OTLP export failed with HTTP ${response.status}`);
  }
}

export function toOtlpPayload(spans: Span[]): Record<string, unknown> {
  return {
    resourceSpans: [{
      resource: {
        attributes: [
          { key: "service.name", value: { stringValue: "regulated-support-assistant" } },
          { key: "deployment.environment.name", value: { stringValue: "course" } }
        ]
      },
      scopeSpans: [{
        scope: { name: "ai-roadmap.starter", version: "2026-07-20" },
        schemaUrl: GENAI_SCHEMA_URL,
        spans: spans.map((span) => {
          const start = BigInt(new Date(span.startedAt).getTime()) * 1_000_000n;
          const end = start + BigInt(Math.max(0, span.durationMs)) * 1_000_000n;
          return {
            traceId: span.traceId ?? randomBytes(16).toString("hex"),
            spanId: span.spanId ?? randomBytes(8).toString("hex"),
            parentSpanId: span.parentSpanId,
            name: span.name,
            kind: 3,
            startTimeUnixNano: start.toString(),
            endTimeUnixNano: end.toString(),
            status: { code: span.status === "ok" ? 1 : 2 },
            attributes: Object.entries(span.attributes).map(([key, value]) => ({ key, value: otlpValue(value) }))
          };
        })
      }]
    }]
  };
}

function otlpValue(value: string | number | boolean): Record<string, unknown> {
  if (typeof value === "boolean") return { boolValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
  return { stringValue: value };
}

function parseHeaderList(value: string): Record<string, string> {
  return Object.fromEntries(value.split(",").filter(Boolean).map((entry) => {
    const [key, ...rest] = entry.split("=");
    return [key.trim(), rest.join("=").trim()];
  }));
}
