export type ToolRequest = { name: "lookupTransfer" | "draftEscalation"; args: Record<string, unknown> };
export type ToolDecision = { allowed: boolean; requiresApproval: boolean; reason: string };
export type ToolResult = { status: "dry-run" | "executed"; auditId: string; output: Record<string, unknown> };

export function authorizeTool(request: ToolRequest): ToolDecision {
  if (request.name === "lookupTransfer") return { allowed: true, requiresApproval: false, reason: "Read-only synthetic lookup" };
  return { allowed: true, requiresApproval: true, reason: "Creates an external-facing draft" };
}

export function executeTool(request: ToolRequest, options: { approved?: boolean; dryRun?: boolean } = {}): ToolResult {
  const decision = authorizeTool(request);
  if (!decision.allowed) throw new Error(`Tool blocked: ${decision.reason}`);
  if (decision.requiresApproval && !options.approved) throw new Error("Explicit approval is required");
  const dryRun = options.dryRun ?? true;
  return {
    status: dryRun ? "dry-run" : "executed",
    auditId: `audit-${request.name}-001`,
    output: request.name === "lookupTransfer" ? { status: "pending", synthetic: true } : { drafted: true, synthetic: true }
  };
}
