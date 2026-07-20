import { createHash } from "node:crypto";
import type { ModelToolDefinition } from "./provider.ts";

export type ToolName = "lookupTransfer" | "draftEscalation";
export type ToolRequest = { name: ToolName; args: Record<string, unknown>; callId?: string };
export type ToolContext = { actorId: string; tenantId: string; scopes: string[]; sessionId: string };
export type ToolDecision = { allowed: boolean; requiresApproval: boolean; reason: string };
export type ToolResult = {
  status: "dry-run" | "executed" | "replayed";
  auditId: string;
  output: Record<string, unknown>;
  idempotencyKey?: string;
};

export class ToolPolicyError extends Error {
  readonly code: "invalid_arguments" | "unauthorized" | "approval_required" | "idempotency_required";

  constructor(code: "invalid_arguments" | "unauthorized" | "approval_required" | "idempotency_required", message: string) {
    super(message);
    this.code = code;
  }
}

export class InMemoryToolExecutionStore {
  readonly #results = new Map<string, ToolResult>();

  get(key: string): ToolResult | undefined {
    const result = this.#results.get(key);
    return result ? structuredClone(result) : undefined;
  }

  set(key: string, result: ToolResult): void {
    this.#results.set(key, structuredClone(result));
  }
}

export const toolDefinitions: ModelToolDefinition[] = [
  {
    name: "lookupTransfer",
    description: "Read the synthetic status of one transfer after tenant authorization.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        transferId: { type: "string", minLength: 3 },
        tenantId: { type: "string", minLength: 3 }
      },
      required: ["transferId", "tenantId"]
    }
  },
  {
    name: "draftEscalation",
    description: "Create a synthetic external-facing escalation draft. The runtime, not the model, requires approval.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        transferId: { type: "string", minLength: 3 },
        tenantId: { type: "string", minLength: 3 },
        reason: { type: "string", minLength: 8 }
      },
      required: ["transferId", "tenantId", "reason"]
    }
  }
];

export const syntheticToolContext: ToolContext = {
  actorId: "course-learner",
  tenantId: "demo-bank",
  scopes: ["transfers:read", "escalations:draft"],
  sessionId: "course-session"
};

export function validateToolRequest(request: ToolRequest): void {
  if (!toolDefinitions.some((tool) => tool.name === request.name)) {
    throw new ToolPolicyError("invalid_arguments", `Unknown tool: ${String(request.name)}`);
  }
  const allowed = request.name === "lookupTransfer"
    ? new Set(["transferId", "tenantId"])
    : new Set(["transferId", "tenantId", "reason"]);
  if (Object.keys(request.args).some((key) => !allowed.has(key))) {
    throw new ToolPolicyError("invalid_arguments", "Tool arguments contain an unknown property");
  }
  for (const key of allowed) {
    if (key === "reason" && request.name !== "draftEscalation") continue;
    const value = request.args[key];
    const minimum = key === "reason" ? 8 : 3;
    if (typeof value !== "string" || value.trim().length < minimum) {
      throw new ToolPolicyError("invalid_arguments", `${key} is required`);
    }
  }
}

export function authorizeTool(request: ToolRequest, context: ToolContext = syntheticToolContext): ToolDecision {
  validateToolRequest(request);
  if (request.args.tenantId !== context.tenantId) {
    return { allowed: false, requiresApproval: false, reason: "Tenant does not match the authorized session" };
  }
  if (request.name === "lookupTransfer") {
    return context.scopes.includes("transfers:read")
      ? { allowed: true, requiresApproval: false, reason: "Authorized read-only synthetic lookup" }
      : { allowed: false, requiresApproval: false, reason: "Missing transfers:read scope" };
  }
  return context.scopes.includes("escalations:draft")
    ? { allowed: true, requiresApproval: true, reason: "Authorized scope; external-facing draft still requires approval" }
    : { allowed: false, requiresApproval: false, reason: "Missing escalations:draft scope" };
}

export function executeTool(
  request: ToolRequest,
  options: {
    context?: ToolContext;
    approved?: boolean;
    dryRun?: boolean;
    idempotencyKey?: string;
    store?: InMemoryToolExecutionStore;
  } = {}
): ToolResult {
  const context = options.context ?? syntheticToolContext;
  const decision = authorizeTool(request, context);
  if (!decision.allowed) throw new ToolPolicyError("unauthorized", `Tool blocked: ${decision.reason}`);
  if (decision.requiresApproval && !options.approved) throw new ToolPolicyError("approval_required", "Explicit approval is required");

  const dryRun = options.dryRun ?? true;
  const idempotencyKey = options.idempotencyKey;
  if (request.name === "draftEscalation" && !dryRun && !idempotencyKey) {
    throw new ToolPolicyError("idempotency_required", "An idempotency key is required for write execution");
  }
  if (idempotencyKey && options.store?.get(idempotencyKey)) {
    return { ...options.store.get(idempotencyKey)!, status: "replayed" };
  }

  const output = request.name === "lookupTransfer"
    ? { transferId: request.args.transferId, status: "pending", synthetic: true }
    : { transferId: request.args.transferId, drafted: true, synthetic: true };
  const result: ToolResult = {
    status: dryRun ? "dry-run" : "executed",
    auditId: auditIdFor(request, context, idempotencyKey),
    output,
    idempotencyKey
  };
  if (idempotencyKey) options.store?.set(idempotencyKey, result);
  return result;
}

function auditIdFor(request: ToolRequest, context: ToolContext, idempotencyKey?: string): string {
  const digest = createHash("sha256")
    .update(JSON.stringify([request.name, request.args, context.actorId, context.sessionId, idempotencyKey]))
    .digest("hex")
    .slice(0, 12);
  return `audit-${digest}`;
}
