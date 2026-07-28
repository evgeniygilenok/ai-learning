import { createHash } from "node:crypto";

export const SECURITY_POLICY_VERSION = "security-policy-v4";

export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export type SandboxProfile = Readonly<{
  profileId: string;
  isolated: boolean;
  disposable: boolean;
  network: "none" | "allowlisted";
  allowsHostFilesystem: boolean;
  secretsMounted: boolean;
}>;
export type TrustedContextClaims = Readonly<{
  userId: string;
  agentId: string;
  tenantId: string;
  runId: string;
  audience: string;
  sandbox: SandboxProfile;
}>;
export type VerifiedCapabilityClaims = Readonly<{
  capabilityId: string;
  userId: string;
  agentId: string;
  tenantId: string;
  runId: string;
  audience: string;
  expiresAtMs: number;
  scopes: readonly string[];
  tools: readonly string[];
  objectIds: readonly string[];
  destinations: readonly string[];
  maxUses: number;
}>;

declare const trustedContextBrand: unique symbol;
declare const verifiedCapabilityBrand: unique symbol;
declare const preparedActionBrand: unique symbol;
export type TrustedContext = Readonly<TrustedContextClaims & { readonly [trustedContextBrand]: true }>;
export type VerifiedCapability = Readonly<VerifiedCapabilityClaims & { readonly [verifiedCapabilityBrand]: true }>;
export type CanonicalProvenance = Readonly<{
  sensitivity: "public" | "internal" | "restricted";
  sourceIds: readonly string[];
  detectedCanaries: readonly string[];
}>;

type PreparedActionShape = {
  tool: string;
  requiredScope: string;
  tenantId: string;
  runId: string;
  objectIds: readonly string[];
  destination: string;
  destinationKind: "internal" | "external";
  effect: "read" | "draft" | "write" | "execute";
  inputSensitivity: "public" | "internal" | "restricted";
  requiresSandbox: boolean;
  arguments: Readonly<Record<string, JsonValue>>;
  provenance: CanonicalProvenance;
};
export type PreparedAction = Readonly<PreparedActionShape & { readonly [preparedActionBrand]: true }>;
export type SecurityActionProposal = Readonly<{
  tool: string;
  tenantId: string;
  destination: string;
  arguments: Readonly<Record<string, JsonValue>>;
}>;
export type CanonicalActionProposal = SecurityActionProposal;
export type ProvenanceClassificationInput = Readonly<{
  proposal: CanonicalActionProposal;
  tenantId: string;
  runId: string;
}>;

type ActionSpec = Readonly<{
  requiredScope: string;
  effect: PreparedActionShape["effect"];
  destination: string;
  destinationKind: PreparedActionShape["destinationKind"];
  inputSensitivity: PreparedActionShape["inputSensitivity"];
  requiresSandbox: boolean;
  argumentKeys: readonly string[];
  objectArgument: string;
  objectPrefix: string;
}>;

const ACTION_SPECS = deepFreeze({
  lookupTicket: spec("tickets:read", "read", "internal:case-system", "internal", "restricted", false, ["ticketId"], "ticketId", "ticket:"),
  draftReply: spec("replies:draft", "draft", "internal:case-system", "internal", "restricted", false, ["body", "ticketId"], "ticketId", "ticket:"),
  saveReply: spec("replies:write", "write", "internal:case-system", "internal", "restricted", false, ["body", "ticketId"], "ticketId", "ticket:"),
  runOfflineJob: spec("jobs:execute", "execute", "internal:none", "internal", "internal", true, ["jobId"], "jobId", "job:"),
  postPublicStatus: spec("status:draft", "draft", "external:synthetic-status", "external", "public", true, ["body", "ticketId"], "ticketId", "ticket:"),
  sendCaseWebhook: spec("webhooks:write", "write", "external:synthetic-webhook", "external", "restricted", true, ["body", "ticketId"], "ticketId", "ticket:")
} satisfies Record<string, ActionSpec>);

export type BoundApproval = Readonly<{
  approvalId: string;
  nonce: string;
  approvedByUserId: string;
  runId: string;
  capabilityId: string;
  actionDigest: string;
  expiresAtMs: number;
}>;
export type CapabilityUseRecord = Readonly<{ capabilityId: string; runId: string; maxUses: number; used?: number }>;
type AuthorizationTransition = Readonly<{
  capability: Readonly<{ capabilityId: string; runId: string; maxUses: number }>;
  approval?: BoundApproval;
}>;
export type AuthorizationTransitionResult =
  | "consumed" | "capability-missing" | "capability-mismatch" | "capability-exhausted"
  | "approval-missing" | "approval-mismatch" | "approval-replayed";
export interface AuthorizationStateStore {
  consumeAtomically(transition: AuthorizationTransition): AuthorizationTransitionResult;
}

/** One synchronous validation-and-commit boundary for approval and capability use. */
export class InMemoryAuthorizationStateStore implements AuthorizationStateStore {
  readonly #approvals = new Map<string, { approval: BoundApproval; consumed: boolean }>();
  readonly #uses = new Map<string, { maxUses: number; used: number }>();

  constructor(seed: Readonly<{
    approvals?: readonly BoundApproval[];
    capabilityUses?: readonly CapabilityUseRecord[];
  }> = {}) {
    for (const approval of seed.approvals ?? []) this.registerApproval(approval);
    for (const record of seed.capabilityUses ?? []) this.registerCapability(record);
  }

  registerApproval(value: BoundApproval): void {
    const approval = canonicalApproval(value);
    if (this.#approvals.has(approval.approvalId)) throw new Error("Approval IDs must be unique");
    this.#approvals.set(approval.approvalId, { approval, consumed: false });
  }

  registerCapability(value: CapabilityUseRecord): void {
    const record = canonicalUseRecord(value);
    const key = capabilityKey(record);
    if (this.#uses.has(key)) throw new Error("Capability-use records must be unique");
    this.#uses.set(key, { maxUses: record.maxUses, used: record.used });
  }

  consumeAtomically(transition: AuthorizationTransition): AuthorizationTransitionResult {
    const use = this.#uses.get(capabilityKey(transition.capability));
    if (!use) return "capability-missing";
    if (use.maxUses !== transition.capability.maxUses) return "capability-mismatch";
    if (use.used >= use.maxUses) return "capability-exhausted";

    const storedApproval = transition.approval ? this.#approvals.get(transition.approval.approvalId) : undefined;
    if (transition.approval && !storedApproval) return "approval-missing";
    if (transition.approval && storedApproval && !sameApproval(storedApproval.approval, transition.approval)) return "approval-mismatch";
    if (storedApproval?.consumed) return "approval-replayed";

    use.used += 1;
    if (storedApproval) storedApproval.consumed = true;
    return "consumed";
  }

  approvalConsumed(approvalId: string): boolean { return this.#approvals.get(approvalId)?.consumed ?? false; }
  used(capabilityId: string, runId: string): number | undefined { return this.#uses.get(capabilityKey({ capabilityId, runId }))?.used; }
}

export type DenialReason =
  | "CLOCK_UNAVAILABLE" | "MALFORMED_AUTHORIZATION_INPUT" | "UNTRUSTED_CONTEXT" | "UNVERIFIED_CAPABILITY" | "MALFORMED_ACTION"
  | "USER_MISMATCH" | "AGENT_MISMATCH" | "TENANT_MISMATCH" | "RUN_MISMATCH" | "AUDIENCE_MISMATCH"
  | "CAPABILITY_EXPIRED" | "CAPABILITY_USE_COUNTER_MISSING" | "CAPABILITY_USE_BINDING_MISMATCH" | "CAPABILITY_USE_LIMIT"
  | "SCOPE_MISSING" | "TOOL_NOT_ALLOWED" | "OBJECT_NOT_ALLOWED" | "DESTINATION_NOT_ALLOWED"
  | "SENSITIVE_EGRESS_DENIED" | "DLP_CANARY_DETECTED" | "SANDBOX_REQUIRED" | "APPROVAL_MALFORMED"
  | "APPROVAL_NONCE_MISSING" | "APPROVER_MISMATCH" | "APPROVAL_RUN_MISMATCH"
  | "APPROVAL_CAPABILITY_MISMATCH" | "APPROVAL_EXPIRED" | "ARGUMENTS_CHANGED"
  | "APPROVAL_NOT_FOUND" | "APPROVAL_BINDING_MISMATCH" | "APPROVAL_REPLAYED";
export type PolicyDecision =
  | Readonly<{ kind: "allow"; reason: "ALLOW_EXACT_CAPABILITY"; actionDigest: string }>
  | Readonly<{ kind: "require_approval"; reason: "APPROVAL_REQUIRED"; actionDigest: string }>
  | Readonly<{ kind: "deny"; reason: DenialReason; actionDigest?: string }>;

export type AuthorizationInput = Readonly<{
  trusted: TrustedContext;
  capability: VerifiedCapability;
  action: PreparedAction;
  approval?: BoundApproval;
}>;
export type SecurityPolicyRuntimeOptions = Readonly<{
  authenticateIdentity: (evidence: unknown) => unknown | null;
  verifyCapability: (evidence: unknown) => unknown | null;
  /** Production resolvers must use authoritative lineage/classification, never model-provided labels. */
  classifyProvenance: (input: ProvenanceClassificationInput) => unknown;
  clock: () => number;
  authorizationState: AuthorizationStateStore;
}>;

export class SecurityPolicyRuntime {
  readonly #authenticateIdentity: SecurityPolicyRuntimeOptions["authenticateIdentity"];
  readonly #verifyCapability: SecurityPolicyRuntimeOptions["verifyCapability"];
  readonly #classifyProvenance: SecurityPolicyRuntimeOptions["classifyProvenance"];
  readonly #clock: SecurityPolicyRuntimeOptions["clock"];
  readonly #authorizationState: AuthorizationStateStore;
  readonly #trustedContexts = new WeakSet<object>();
  readonly #verifiedCapabilities = new WeakSet<object>();
  readonly #preparedActions = new WeakSet<object>();

  constructor(options: SecurityPolicyRuntimeOptions) {
    this.#authenticateIdentity = options.authenticateIdentity;
    this.#verifyCapability = options.verifyCapability;
    this.#classifyProvenance = options.classifyProvenance;
    this.#clock = options.clock;
    this.#authorizationState = options.authorizationState;
  }

  establishTrustedContext(evidence: unknown): TrustedContext {
    const verified = this.#authenticateIdentity(evidence);
    if (verified === null) throw new PolicyInputError("Identity evidence was not authenticated");
    const context = canonicalTrustedContext(verified);
    this.#trustedContexts.add(context);
    return context as TrustedContext;
  }

  establishVerifiedCapability(evidence: unknown): VerifiedCapability {
    const verified = this.#verifyCapability(evidence);
    if (verified === null) throw new PolicyInputError("Capability evidence did not verify");
    const capability = canonicalCapability(verified);
    this.#verifiedCapabilities.add(capability);
    return capability as VerifiedCapability;
  }

  prepareAction(trusted: TrustedContext, capability: VerifiedCapability, value: unknown): PreparedAction {
    if (!isObject(trusted) || !this.#trustedContexts.has(trusted)) throw new PolicyInputError("Untrusted preparation context");
    if (!isObject(capability) || !this.#verifiedCapabilities.has(capability)) throw new PolicyInputError("Unverified preparation capability");
    if (capability.userId !== trusted.userId || capability.agentId !== trusted.agentId
      || capability.tenantId !== trusted.tenantId || capability.runId !== trusted.runId
      || capability.audience !== trusted.audience) {
      throw new PolicyInputError("Preparation identity and capability bindings do not match");
    }
    let currentTime: number;
    try {
      currentTime = this.#clock();
    } catch {
      throw new PolicyInputError("Preparation clock unavailable");
    }
    if (!Number.isFinite(currentTime)) throw new PolicyInputError("Preparation clock unavailable");
    if (currentTime >= capability.expiresAtMs) throw new PolicyInputError("Preparation capability expired");

    const proposal = snapshotDataObject(value, "proposal");
    requireExactKeys(proposal, ["arguments", "destination", "tenantId", "tool"], "proposal");
    const tool = requirePolicyString(proposal.tool, "tool");
    const tenantId = requirePolicyString(proposal.tenantId, "tenant");
    const destination = requirePolicyString(proposal.destination, "destination");
    const actionSpec = ACTION_SPECS[tool as keyof typeof ACTION_SPECS];
    if (!actionSpec) throw new PolicyInputError(`Unknown tool: ${tool}`);
    if (tenantId !== trusted.tenantId) throw new PolicyInputError("Proposal tenant does not match trusted context");
    if (destination !== actionSpec.destination || !capability.destinations.includes(destination)) {
      throw new PolicyInputError("Destination is not granted for preparation");
    }
    if (!capability.tools.includes(tool) || !capability.scopes.includes(actionSpec.requiredScope)) {
      throw new PolicyInputError("Tool or scope is not granted for preparation");
    }

    const argumentSnapshot = snapshotDataObject(proposal.arguments, "arguments");
    requireExactKeys(argumentSnapshot, actionSpec.argumentKeys, "arguments");
    const argumentsCopy: Record<string, JsonValue> = Object.create(null);
    for (const key of actionSpec.argumentKeys) argumentsCopy[key] = requireNonEmptyString(argumentSnapshot[key], `argument ${key}`);
    const body = argumentsCopy.body;
    if (typeof body === "string" && body.length > 2_000) throw new PolicyInputError("Body exceeds the 2,000 character lab limit");
    const objectId = argumentsCopy[actionSpec.objectArgument];
    if (typeof objectId !== "string" || !objectId.startsWith(actionSpec.objectPrefix) || !validPolicyValue(objectId)) {
      throw new PolicyInputError("Object ID does not match the registered tool contract");
    }
    if (!capability.objectIds.includes(objectId)) throw new PolicyInputError("Object is not granted for preparation");

    const canonicalProposal: CanonicalActionProposal = deepFreeze({
      tool,
      tenantId,
      destination: actionSpec.destination,
      arguments: argumentsCopy
    });
    const classificationInput: ProvenanceClassificationInput = deepFreeze({
      proposal: canonicalProposal,
      tenantId: trusted.tenantId,
      runId: trusted.runId
    });
    let rawProvenance: unknown;
    try {
      rawProvenance = this.#classifyProvenance(classificationInput);
    } catch {
      throw new PolicyInputError("Authoritative provenance classification failed");
    }
    const provenance = canonicalProvenance(rawProvenance);
    const action = deepFreeze({
      tool,
      requiredScope: actionSpec.requiredScope,
      tenantId,
      runId: trusted.runId,
      objectIds: [objectId],
      destination: actionSpec.destination,
      destinationKind: actionSpec.destinationKind,
      effect: actionSpec.effect,
      inputSensitivity: actionSpec.inputSensitivity,
      requiresSandbox: actionSpec.requiresSandbox,
      arguments: canonicalProposal.arguments,
      provenance
    });
    this.#preparedActions.add(action);
    return action as PreparedAction;
  }

  digestAction(action: PreparedAction): string {
    if (!isObject(action) || !this.#preparedActions.has(action)) throw new PolicyInputError("Action belongs to a different policy runtime");
    const canonical = canonicalJson({ policyVersion: SECURITY_POLICY_VERSION, action });
    return `sha256:${createHash("sha256").update(canonical).digest("hex")}`;
  }

  authorize(value: AuthorizationInput): PolicyDecision {
    let currentTime: number;
    try {
      currentTime = this.#clock();
    } catch {
      return deny("CLOCK_UNAVAILABLE");
    }
    if (!Number.isFinite(currentTime)) return deny("CLOCK_UNAVAILABLE");

    let input: Record<string, unknown>;
    try {
      input = snapshotDataObject(value, "authorization input");
      requireAllowedKeys(input, ["action", "capability", "trusted"], ["approval"], "authorization input");
    } catch {
      return deny("MALFORMED_AUTHORIZATION_INPUT");
    }
    const trusted = input.trusted as TrustedContext;
    const capability = input.capability as VerifiedCapability;
    const action = input.action as PreparedAction;
    if (!isObject(trusted) || !this.#trustedContexts.has(trusted)) return deny("UNTRUSTED_CONTEXT");
    if (!isObject(capability) || !this.#verifiedCapabilities.has(capability)) return deny("UNVERIFIED_CAPABILITY");
    if (!isObject(action) || !this.#preparedActions.has(action)) return deny("MALFORMED_ACTION");

    if (capability.userId !== trusted.userId) return deny("USER_MISMATCH");
    if (capability.agentId !== trusted.agentId) return deny("AGENT_MISMATCH");
    if (capability.tenantId !== trusted.tenantId || action.tenantId !== trusted.tenantId) return deny("TENANT_MISMATCH");
    if (capability.runId !== trusted.runId || action.runId !== trusted.runId) return deny("RUN_MISMATCH");
    if (capability.audience !== trusted.audience) return deny("AUDIENCE_MISMATCH");
    if (currentTime >= capability.expiresAtMs) return deny("CAPABILITY_EXPIRED");
    if (!capability.scopes.includes(action.requiredScope)) return deny("SCOPE_MISSING");
    if (!capability.tools.includes(action.tool)) return deny("TOOL_NOT_ALLOWED");
    if (!action.objectIds.every((objectId) => capability.objectIds.includes(objectId))) return deny("OBJECT_NOT_ALLOWED");
    if (!capability.destinations.includes(action.destination)) return deny("DESTINATION_NOT_ALLOWED");
    if (action.provenance.detectedCanaries.length > 0) return deny("DLP_CANARY_DETECTED");
    if (action.destinationKind === "external"
      && (action.inputSensitivity !== "public" || action.provenance.sensitivity !== "public")) {
      return deny("SENSITIVE_EGRESS_DENIED");
    }
    if ((action.requiresSandbox || action.effect === "execute") && !safeSandbox(trusted.sandbox)) return deny("SANDBOX_REQUIRED");

    const actionDigest = this.digestAction(action);
    let approval: BoundApproval | undefined;
    if (action.effect !== "read") {
      if (!input.approval) return { kind: "require_approval", reason: "APPROVAL_REQUIRED", actionDigest };
      try { approval = canonicalApproval(input.approval); } catch { return deny("APPROVAL_MALFORMED", actionDigest); }
      if (!nonEmpty(approval.nonce) || !nonEmpty(approval.approvalId)) return deny("APPROVAL_NONCE_MISSING", actionDigest);
      if (approval.approvedByUserId !== trusted.userId) return deny("APPROVER_MISMATCH", actionDigest);
      if (approval.runId !== trusted.runId) return deny("APPROVAL_RUN_MISMATCH", actionDigest);
      if (approval.capabilityId !== capability.capabilityId) return deny("APPROVAL_CAPABILITY_MISMATCH", actionDigest);
      if (currentTime >= approval.expiresAtMs) return deny("APPROVAL_EXPIRED", actionDigest);
      if (approval.actionDigest !== actionDigest) return deny("ARGUMENTS_CHANGED", actionDigest);
    }

    const result = this.#authorizationState.consumeAtomically({
      capability: { capabilityId: capability.capabilityId, runId: capability.runId, maxUses: capability.maxUses },
      approval
    });
    return transitionDecision(result, actionDigest);
  }
}

export class PolicyInputError extends Error {
  constructor(message: string) { super(message); this.name = "PolicyInputError"; }
}

function transitionDecision(result: AuthorizationTransitionResult, actionDigest: string): PolicyDecision {
  const reasons: Record<Exclude<AuthorizationTransitionResult, "consumed">, DenialReason> = {
    "capability-missing": "CAPABILITY_USE_COUNTER_MISSING",
    "capability-mismatch": "CAPABILITY_USE_BINDING_MISMATCH",
    "capability-exhausted": "CAPABILITY_USE_LIMIT",
    "approval-missing": "APPROVAL_NOT_FOUND",
    "approval-mismatch": "APPROVAL_BINDING_MISMATCH",
    "approval-replayed": "APPROVAL_REPLAYED"
  };
  return result === "consumed"
    ? { kind: "allow", reason: "ALLOW_EXACT_CAPABILITY", actionDigest }
    : deny(reasons[result], actionDigest);
}

function canonicalProvenance(value: unknown): CanonicalProvenance {
  const data = snapshotDataObject(value, "provenance");
  requireExactKeys(data, ["detectedCanaries", "sensitivity", "sourceIds"], "provenance");
  if (data.sensitivity !== "public" && data.sensitivity !== "internal" && data.sensitivity !== "restricted") {
    throw new PolicyInputError("Provenance sensitivity must be known");
  }
  return deepFreeze({
    sensitivity: data.sensitivity,
    sourceIds: snapshotPolicyList(data.sourceIds, "provenance source IDs"),
    detectedCanaries: snapshotPolicyList(data.detectedCanaries, "detected canaries", true)
  });
}

function canonicalTrustedContext(value: unknown): TrustedContextClaims {
  const data = snapshotDataObject(value, "trusted context");
  requireExactKeys(data, ["agentId", "audience", "runId", "sandbox", "tenantId", "userId"], "trusted context");
  const sandbox = snapshotDataObject(data.sandbox, "sandbox");
  requireExactKeys(sandbox, ["allowsHostFilesystem", "disposable", "isolated", "network", "profileId", "secretsMounted"], "sandbox");
  if (![sandbox.isolated, sandbox.disposable, sandbox.allowsHostFilesystem, sandbox.secretsMounted].every((item) => typeof item === "boolean")) {
    throw new PolicyInputError("Sandbox flags must be booleans");
  }
  if (sandbox.network !== "none" && sandbox.network !== "allowlisted") throw new PolicyInputError("Invalid sandbox network mode");
  return deepFreeze({
    userId: requirePolicyString(data.userId, "user"),
    agentId: requirePolicyString(data.agentId, "agent"),
    tenantId: requirePolicyString(data.tenantId, "tenant"),
    runId: requirePolicyString(data.runId, "run"),
    audience: requirePolicyString(data.audience, "audience"),
    sandbox: {
      profileId: requirePolicyString(sandbox.profileId, "sandbox profile"),
      isolated: sandbox.isolated as boolean,
      disposable: sandbox.disposable as boolean,
      network: sandbox.network,
      allowsHostFilesystem: sandbox.allowsHostFilesystem as boolean,
      secretsMounted: sandbox.secretsMounted as boolean
    }
  });
}

function canonicalCapability(value: unknown): VerifiedCapabilityClaims {
  const data = snapshotDataObject(value, "capability");
  requireExactKeys(data, ["agentId", "audience", "capabilityId", "destinations", "expiresAtMs", "maxUses", "objectIds", "runId", "scopes", "tenantId", "tools", "userId"], "capability");
  if (typeof data.expiresAtMs !== "number" || !Number.isFinite(data.expiresAtMs)) throw new PolicyInputError("Capability expiry must be finite");
  if (typeof data.maxUses !== "number" || !Number.isInteger(data.maxUses) || data.maxUses <= 0) throw new PolicyInputError("Capability maxUses must be positive");
  return deepFreeze({
    capabilityId: requirePolicyString(data.capabilityId, "capability ID"),
    userId: requirePolicyString(data.userId, "user"),
    agentId: requirePolicyString(data.agentId, "agent"),
    tenantId: requirePolicyString(data.tenantId, "tenant"),
    runId: requirePolicyString(data.runId, "run"),
    audience: requirePolicyString(data.audience, "audience"),
    expiresAtMs: data.expiresAtMs,
    scopes: snapshotPolicyList(data.scopes, "scopes"),
    tools: snapshotPolicyList(data.tools, "tools"),
    objectIds: snapshotPolicyList(data.objectIds, "object IDs"),
    destinations: snapshotPolicyList(data.destinations, "destinations"),
    maxUses: data.maxUses
  });
}

function canonicalApproval(value: unknown): BoundApproval {
  const data = snapshotDataObject(value, "approval");
  requireExactKeys(data, ["actionDigest", "approvalId", "approvedByUserId", "capabilityId", "expiresAtMs", "nonce", "runId"], "approval");
  if (typeof data.expiresAtMs !== "number" || !Number.isFinite(data.expiresAtMs)) throw new PolicyInputError("Approval expiry must be finite");
  return deepFreeze({
    approvalId: requireNonEmptyString(data.approvalId, "approval ID"),
    nonce: requireNonEmptyString(data.nonce, "approval nonce", true),
    approvedByUserId: requirePolicyString(data.approvedByUserId, "approver"),
    runId: requirePolicyString(data.runId, "approval run"),
    capabilityId: requirePolicyString(data.capabilityId, "approval capability"),
    actionDigest: requireNonEmptyString(data.actionDigest, "action digest"),
    expiresAtMs: data.expiresAtMs
  });
}

function canonicalUseRecord(value: unknown): Required<CapabilityUseRecord> {
  const data = snapshotDataObject(value, "capability-use record");
  requireAllowedKeys(data, ["capabilityId", "maxUses", "runId"], ["used"], "capability-use record");
  const used = data.used ?? 0;
  if (typeof data.maxUses !== "number" || !Number.isInteger(data.maxUses) || data.maxUses <= 0
    || typeof used !== "number" || !Number.isInteger(used) || used < 0 || used > data.maxUses) {
    throw new PolicyInputError("Invalid capability-use counter");
  }
  return deepFreeze({
    capabilityId: requirePolicyString(data.capabilityId, "capability-use ID"),
    runId: requirePolicyString(data.runId, "capability-use run"),
    maxUses: data.maxUses,
    used
  });
}

function snapshotDataObject(value: unknown, label: string): Record<string, unknown> {
  if (!isPlainObject(value)) throw new PolicyInputError(`${label} must be a plain data object`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const snapshot: Record<string, unknown> = Object.create(null);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string") throw new PolicyInputError(`${label} cannot contain symbol keys`);
    const descriptor = descriptors[key];
    if (!descriptor.enumerable || !("value" in descriptor)) throw new PolicyInputError(`${label} cannot contain accessors or non-enumerable fields`);
    Object.defineProperty(snapshot, key, { value: descriptor.value, enumerable: true, writable: false, configurable: false });
  }
  return Object.freeze(snapshot);
}

function snapshotPolicyList(value: unknown, label: string, allowEmpty = false): readonly string[] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) throw new PolicyInputError(`${label} must be a plain array`);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.some((key) => typeof key !== "string")) throw new PolicyInputError(`${label} cannot contain symbols`);
  const length = descriptors.length?.value;
  if (!Number.isInteger(length) || length < 0 || (!allowEmpty && length === 0) || keys.length !== length + 1) {
    throw new PolicyInputError(`${label} must be dense${allowEmpty ? "" : " and non-empty"}`);
  }
  const result: string[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = descriptors[String(index)];
    if (!descriptor?.enumerable || !("value" in descriptor)) throw new PolicyInputError(`${label} cannot contain accessors or holes`);
    result.push(requirePolicyString(descriptor.value, label));
  }
  if (new Set(result).size !== result.length) throw new PolicyInputError(`${label} cannot contain duplicates`);
  return Object.freeze(result);
}

function requireExactKeys(value: Record<string, unknown>, expected: readonly string[], label: string): void {
  requireAllowedKeys(value, expected, [], label);
}

function requireAllowedKeys(value: Record<string, unknown>, required: readonly string[], optional: readonly string[], label: string): void {
  const actual = Object.keys(value).sort();
  const allowed = new Set([...required, ...optional]);
  if (required.some((key) => !Object.hasOwn(value, key)) || actual.some((key) => !allowed.has(key))) {
    throw new PolicyInputError(`${label} has missing or unexpected fields`);
  }
}

function spec(
  requiredScope: string,
  effect: ActionSpec["effect"],
  destination: string,
  destinationKind: ActionSpec["destinationKind"],
  inputSensitivity: ActionSpec["inputSensitivity"],
  requiresSandbox: boolean,
  argumentKeys: readonly string[],
  objectArgument: string,
  objectPrefix: string
): ActionSpec {
  return { requiredScope, effect, destination, destinationKind, inputSensitivity, requiresSandbox, argumentKeys, objectArgument, objectPrefix };
}

function requirePolicyString(value: unknown, label: string): string {
  const result = requireNonEmptyString(value, label);
  if (result === "*") throw new PolicyInputError(`${label} cannot be a wildcard`);
  return result;
}
function requireNonEmptyString(value: unknown, label: string, allowEmpty = false): string {
  if (typeof value !== "string" || (!allowEmpty && value.trim().length === 0)) throw new PolicyInputError(`${label} must be a non-empty string`);
  return value;
}
function validPolicyValue(value: unknown): value is string { return nonEmpty(value) && value !== "*"; }
function nonEmpty(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }
function isObject(value: unknown): value is object { return value !== null && typeof value === "object"; }
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value) || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function safeSandbox(sandbox: SandboxProfile): boolean {
  return sandbox.isolated && sandbox.disposable && sandbox.network === "none" && !sandbox.allowsHostFilesystem && !sandbox.secretsMounted;
}
function sameApproval(left: BoundApproval, right: BoundApproval): boolean {
  return left.approvalId === right.approvalId && left.nonce === right.nonce
    && left.approvedByUserId === right.approvedByUserId && left.runId === right.runId
    && left.capabilityId === right.capabilityId && left.actionDigest === right.actionDigest
    && left.expiresAtMs === right.expiresAtMs;
}
function capabilityKey(value: { capabilityId: string; runId: string }): string { return JSON.stringify([value.capabilityId, value.runId]); }
function deny(reason: DenialReason, actionDigest?: string): PolicyDecision {
  return actionDigest === undefined ? { kind: "deny", reason } : { kind: "deny", reason, actionDigest };
}
function deepFreeze<T>(value: T): T {
  if (isObject(value) && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}
function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new PolicyInputError("Canonical JSON requires finite numbers");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  }
  throw new PolicyInputError("Canonical JSON accepts only plain JSON data");
}
