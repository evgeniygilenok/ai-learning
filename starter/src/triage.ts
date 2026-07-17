export type TriageResult = {
  summary: string;
  category: "transfer-status" | "account-access" | "unknown";
  urgency: "normal" | "urgent";
  requiresHumanReview: boolean;
};

export class ContractError extends Error {}

export function parseTriageResult(text: string): TriageResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new ContractError("Provider output was not JSON");
  }
  if (!isObject(value)) throw new ContractError("Triage result must be an object");
  if (typeof value.summary !== "string" || value.summary.trim().length < 5) throw new ContractError("summary is required");
  if (!["transfer-status", "account-access", "unknown"].includes(String(value.category))) throw new ContractError("category is invalid");
  if (!["normal", "urgent"].includes(String(value.urgency))) throw new ContractError("urgency is invalid");
  if (typeof value.requiresHumanReview !== "boolean") throw new ContractError("requiresHumanReview is required");
  return value as TriageResult;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
