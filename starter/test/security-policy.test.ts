import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryAuthorizationStateStore,
  PolicyInputError,
  SecurityPolicyRuntime,
  type AuthorizationInput,
  type BoundApproval,
  type CanonicalActionProposal,
  type CanonicalProvenance,
  type ProvenanceClassificationInput,
  type JsonValue,
  type PreparedAction,
  type SecurityActionProposal,
  type TrustedContext,
  type TrustedContextClaims,
  type VerifiedCapability,
  type VerifiedCapabilityClaims
} from "../src/security-policy.ts";

const NOW = Date.parse("2026-07-27T16:00:00Z");
const CANARIES = ["CANARY_NORTHSTAR_7X", "CANARY_REDWOOD_9Q"] as const;

type HarnessOptions = {
  includeCounter?: boolean;
  counterMaxUses?: number;
  counterUsed?: number;
  classifyProvenance?: (input: ProvenanceClassificationInput) => unknown;
};

function harness(options: HarnessOptions = {}) {
  const identities = new WeakMap<object, unknown>();
  const capabilities = new WeakMap<object, unknown>();
  const clock = { now: NOW, mode: "ok" as "ok" | "throw" | "nonfinite", calls: 0 };
  const classifiedInputs: ProvenanceClassificationInput[] = [];
  const baseContext: TrustedContextClaims = {
    userId: "user:sam",
    agentId: "agent:support",
    tenantId: "northstar-demo",
    runId: "run:security-lab",
    audience: "support-tools",
    sandbox: {
      profileId: "sandbox:offline-disposable",
      isolated: true,
      disposable: true,
      network: "none",
      allowsHostFilesystem: false,
      secretsMounted: false
    }
  };
  const baseCapability: VerifiedCapabilityClaims = {
    capabilityId: "cap:security-7",
    userId: baseContext.userId,
    agentId: baseContext.agentId,
    tenantId: baseContext.tenantId,
    runId: baseContext.runId,
    audience: baseContext.audience,
    expiresAtMs: NOW + 60_000,
    scopes: ["tickets:read", "replies:draft", "replies:write", "jobs:execute", "status:draft", "webhooks:write"],
    tools: ["lookupTicket", "draftReply", "saveReply", "runOfflineJob", "postPublicStatus", "sendCaseWebhook"],
    objectIds: [
      "ticket:synthetic-42",
      "ticket:restricted-derived",
      "job:synthetic-7",
      ...CANARIES.map((canary) => `ticket:${Buffer.from(canary).toString("base64")}`)
    ],
    destinations: ["internal:case-system", "internal:none", "external:synthetic-status", "external:synthetic-webhook"],
    maxUses: 2
  };
  const state = new InMemoryAuthorizationStateStore({
    capabilityUses: options.includeCounter === false ? [] : [{
      capabilityId: baseCapability.capabilityId,
      runId: baseCapability.runId,
      maxUses: options.counterMaxUses ?? baseCapability.maxUses,
      used: options.counterUsed ?? 0
    }]
  });
  const runtime = new SecurityPolicyRuntime({
    authenticateIdentity(evidence) {
      return typeof evidence === "object" && evidence !== null ? identities.get(evidence) ?? null : null;
    },
    verifyCapability(evidence) {
      return typeof evidence === "object" && evidence !== null ? capabilities.get(evidence) ?? null : null;
    },
    classifyProvenance(input) {
      classifiedInputs.push(input);
      return options.classifyProvenance ? options.classifyProvenance(input) : classifyFixtureProvenance(input);
    },
    clock() {
      clock.calls += 1;
      if (clock.mode === "throw") throw new Error("synthetic clock failure");
      return clock.mode === "nonfinite" ? Number.NaN : clock.now;
    },
    authorizationState: state
  });
  function issueContext(overrides: Partial<TrustedContextClaims> = {}): TrustedContext {
    const evidence = {};
    identities.set(evidence, { ...baseContext, ...overrides });
    return runtime.establishTrustedContext(evidence);
  }
  function issueCapability(overrides: Partial<VerifiedCapabilityClaims> = {}): VerifiedCapability {
    const evidence = {};
    capabilities.set(evidence, { ...baseCapability, ...overrides });
    return runtime.establishVerifiedCapability(evidence);
  }
  const trusted = issueContext();
  const capability = issueCapability();
  const action = runtime.prepareAction(trusted, capability, saveProposal());
  clock.calls = 0;
  return {
    runtime, state, trusted, capability, action, baseContext, baseCapability,
    issueContext, issueCapability, clock, classifiedInputs
  };
}

function saveProposal(body = "Synthetic offline reply", tenantId = "northstar-demo"): SecurityActionProposal {
  return {
    tool: "saveReply",
    tenantId,
    destination: "internal:case-system",
    arguments: { ticketId: "ticket:synthetic-42", body }
  };
}

function classifyFixtureProvenance(input: ProvenanceClassificationInput): CanonicalProvenance {
  const proposal = input.proposal;
  const strings = collectStrings(proposal.arguments);
  const detectedCanaries = CANARIES.filter((canary) => {
    const base64 = Buffer.from(canary).toString("base64");
    const base64url = Buffer.from(canary).toString("base64url");
    return strings.some((value) => value.includes(canary) || value.includes(base64) || value.includes(base64url));
  });
  const objectId = String(proposal.arguments.ticketId ?? proposal.arguments.jobId ?? "unknown");
  const restricted = objectId === "ticket:restricted-derived" || detectedCanaries.length > 0;
  return {
    sensitivity: restricted ? "restricted" : "public",
    sourceIds: [restricted ? "source:restricted-derived" : "source:verified-public-fixture"],
    detectedCanaries
  };
}

function collectStrings(value: JsonValue): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(collectStrings);
  return [];
}

function approvalFor(runtime: SecurityPolicyRuntime, action: PreparedAction, overrides: Partial<BoundApproval> = {}): BoundApproval {
  return {
    approvalId: "approval:security-lab-1",
    nonce: "nonce:single-use-1",
    approvedByUserId: "user:sam",
    runId: "run:security-lab",
    capabilityId: "cap:security-7",
    actionDigest: runtime.digestAction(action),
    expiresAtMs: NOW + 30_000,
    ...overrides
  };
}

function reason(runtime: SecurityPolicyRuntime, input: AuthorizationInput): string {
  return runtime.authorize(input).reason;
}

test("exact action, approval, and capability use commit once", () => {
  const h = harness();
  const approval = approvalFor(h.runtime, h.action);
  h.state.registerApproval(approval);
  const input = { trusted: h.trusted, capability: h.capability, action: h.action, approval };

  assert.equal(h.runtime.authorize(input).kind, "allow");
  assert.equal(h.state.approvalConsumed(approval.approvalId), true);
  assert.equal(h.state.used(h.capability.capabilityId, h.capability.runId), 1);
  assert.equal(reason(h.runtime, input), "APPROVAL_REPLAYED");
  assert.equal(h.state.used(h.capability.capabilityId, h.capability.runId), 1);
});

test("approval and capability use validate together before either state changes", () => {
  const exhausted = harness({ counterUsed: 2 });
  const approval = approvalFor(exhausted.runtime, exhausted.action);
  exhausted.state.registerApproval(approval);
  assert.equal(reason(exhausted.runtime, {
    trusted: exhausted.trusted, capability: exhausted.capability, action: exhausted.action, approval
  }), "CAPABILITY_USE_LIMIT");
  assert.equal(exhausted.state.approvalConsumed(approval.approvalId), false);

  const missingApproval = harness();
  const unknown = approvalFor(missingApproval.runtime, missingApproval.action);
  assert.equal(reason(missingApproval.runtime, {
    trusted: missingApproval.trusted, capability: missingApproval.capability, action: missingApproval.action, approval: unknown
  }), "APPROVAL_NOT_FOUND");
  assert.equal(missingApproval.state.used(missingApproval.capability.capabilityId, missingApproval.capability.runId), 0);
});

test("fresh runtime clock expires capabilities and first-use approvals", () => {
  const expiredCapability = harness();
  expiredCapability.clock.now = NOW + 60_000;
  assert.equal(reason(expiredCapability.runtime, {
    trusted: expiredCapability.trusted,
    capability: expiredCapability.capability,
    action: expiredCapability.action
  }), "CAPABILITY_EXPIRED");

  const expiredApproval = harness();
  const approval = approvalFor(expiredApproval.runtime, expiredApproval.action);
  expiredApproval.state.registerApproval(approval);
  expiredApproval.clock.now = approval.expiresAtMs;
  assert.equal(reason(expiredApproval.runtime, {
    trusted: expiredApproval.trusted,
    capability: expiredApproval.capability,
    action: expiredApproval.action,
    approval
  }), "APPROVAL_EXPIRED");
  assert.equal(expiredApproval.state.approvalConsumed(approval.approvalId), false);
  assert.equal(expiredApproval.state.used(expiredApproval.capability.capabilityId, expiredApproval.capability.runId), 0);
});

test("clock is sampled once per call and clock failure never mutates authorization state", () => {
  const h = harness();
  const approval = approvalFor(h.runtime, h.action);
  h.state.registerApproval(approval);
  h.clock.mode = "throw";
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: h.action, approval }), "CLOCK_UNAVAILABLE");
  assert.equal(h.clock.calls, 1);
  h.clock.mode = "nonfinite";
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: h.action, approval }), "CLOCK_UNAVAILABLE");
  assert.equal(h.clock.calls, 2);
  assert.equal(h.state.approvalConsumed(approval.approvalId), false);
  assert.equal(h.state.used(h.capability.capabilityId, h.capability.runId), 0);
});

test("preparation rejects stale, cross-tenant, unknown, and ungranted references before classification", () => {
  const h = harness();
  const before = h.classifiedInputs.length;
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, saveProposal("Synthetic", "redwood-demo")), PolicyInputError);
  const ungranted = h.issueCapability({ objectIds: ["job:synthetic-7"] });
  assert.throws(() => h.runtime.prepareAction(h.trusted, ungranted, saveProposal()), PolicyInputError);
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "unknownTool", tenantId: "northstar-demo", destination: "internal:case-system", arguments: {}
  }), PolicyInputError);
  const crossTenantCapability = h.issueCapability({ tenantId: "redwood-demo" });
  assert.throws(() => h.runtime.prepareAction(h.trusted, crossTenantCapability, saveProposal()), PolicyInputError);
  h.clock.now = h.capability.expiresAtMs;
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, saveProposal()), PolicyInputError);
  assert.equal(h.classifiedInputs.length, before);
});

test("descriptor snapshots reject getter TOCTOU, symbols, and non-enumerable fields", () => {
  const h = harness();
  let getterReads = 0;
  const getterArguments: Record<string, unknown> = { body: "Synthetic" };
  Object.defineProperty(getterArguments, "ticketId", {
    enumerable: true,
    get() {
      getterReads += 1;
      return getterReads === 1 ? "ticket:synthetic-42" : "ticket:redwood-900";
    }
  });
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, { ...saveProposal(), arguments: getterArguments }), PolicyInputError);
  assert.equal(getterReads, 0);

  const symbolProposal = { ...saveProposal() } as Record<PropertyKey, unknown>;
  symbolProposal[Symbol("hidden-policy")] = "read";
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, symbolProposal), PolicyInputError);

  const hiddenProposal = { ...saveProposal() };
  Object.defineProperty(hiddenProposal, "hidden", { value: "read", enumerable: false });
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, hiddenProposal), PolicyInputError);
  assert.throws(() => h.runtime.prepareAction(h.trusted, h.capability, {
    ...saveProposal(),
    provenance: { sensitivity: "public", sourceIds: ["model:claim"], detectedCanaries: [] }
  }), PolicyInputError);

  let authorizationReads = 0;
  const accessorInput: Record<string, unknown> = { capability: h.capability, action: h.action };
  Object.defineProperty(accessorInput, "trusted", {
    enumerable: true,
    get() { authorizationReads += 1; return h.trusted; }
  });
  assert.equal(h.runtime.authorize(accessorInput as unknown as AuthorizationInput).reason, "MALFORMED_AUTHORIZATION_INPUT");
  assert.equal(authorizationReads, 0);

  const mutableArguments = { ticketId: "ticket:synthetic-42", body: "Snapshot me" };
  const prepared = h.runtime.prepareAction(h.trusted, h.capability, { ...saveProposal(), arguments: mutableArguments });
  mutableArguments.ticketId = "ticket:redwood-900";
  assert.equal(prepared.objectIds[0], "ticket:synthetic-42");
  assert.equal(prepared.arguments.ticketId, "ticket:synthetic-42");
});

test("trusted identity, verified capabilities, and actions are frozen and runtime-bound", () => {
  const h = harness();
  const structuralContext = { ...h.trusted, authenticated: true } as unknown as TrustedContext;
  const structuralCapability = { ...h.capability, verified: true } as unknown as VerifiedCapability;
  const structuralAction = { ...h.action } as unknown as PreparedAction;
  assert.equal(reason(h.runtime, { trusted: structuralContext, capability: h.capability, action: h.action }), "UNTRUSTED_CONTEXT");
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: structuralCapability, action: h.action }), "UNVERIFIED_CAPABILITY");
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: structuralAction }), "MALFORMED_ACTION");

  const other = harness();
  assert.equal(reason(other.runtime, { trusted: h.trusted, capability: other.capability, action: other.action }), "UNTRUSTED_CONTEXT");
  assert.equal(reason(other.runtime, { trusted: other.trusted, capability: other.capability, action: h.action }), "MALFORMED_ACTION");
  assert.ok(Object.isFrozen(h.trusted) && Object.isFrozen(h.trusted.sandbox));
  assert.ok(Object.isFrozen(h.capability) && Object.isFrozen(h.capability.scopes));
  assert.ok(Object.isFrozen(h.action) && Object.isFrozen(h.action.arguments) && Object.isFrozen(h.action.objectIds));
  assert.ok(Object.isFrozen(h.action.provenance) && Object.isFrozen(h.action.provenance.sourceIds));
});

test("public status uses trusted provenance, offline sandbox enforcement, and encoded canary DLP", () => {
  const h = harness();
  for (const canary of CANARIES) {
    const action = h.runtime.prepareAction(h.trusted, h.capability, {
      tool: "postPublicStatus",
      tenantId: "northstar-demo",
      destination: "external:synthetic-status",
      arguments: { ticketId: "ticket:synthetic-42", body: `Synthetic status ${canary}` }
    });
    assert.equal(action.inputSensitivity, "public");
    assert.equal(action.requiresSandbox, true);
    assert.deepEqual(action.provenance.detectedCanaries, [canary]);
    assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action }), "DLP_CANARY_DETECTED");
  }
  for (const canary of CANARIES) {
    const encoded = Buffer.from(canary).toString("base64");
    const action = h.runtime.prepareAction(h.trusted, h.capability, {
      tool: "postPublicStatus",
      tenantId: "northstar-demo",
      destination: "external:synthetic-status",
      arguments: { ticketId: "ticket:synthetic-42", body: `Synthetic encoded status ${encoded}` }
    });
    assert.deepEqual(action.provenance.detectedCanaries, [canary]);
    assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action }), "DLP_CANARY_DETECTED");
  }
  const encodedObjectCanary = CANARIES[0];
  const encodedObjectId = `ticket:${Buffer.from(encodedObjectCanary).toString("base64")}`;
  const canaryOutsideBody = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "postPublicStatus",
    tenantId: "northstar-demo",
    destination: "external:synthetic-status",
    arguments: { ticketId: encodedObjectId, body: "Synthetic clean body" }
  });
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: canaryOutsideBody }), "DLP_CANARY_DETECTED");
  assert.ok(h.classifiedInputs.every((input) => Object.isFrozen(input)
    && Object.isFrozen(input.proposal) && Object.isFrozen(input.proposal.arguments)
    && input.tenantId === "northstar-demo" && input.runId === "run:security-lab"));

  const unsafe = h.issueContext({ sandbox: { ...h.baseContext.sandbox, network: "allowlisted" } });
  const benign = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "postPublicStatus",
    tenantId: "northstar-demo",
    destination: "external:synthetic-status",
    arguments: { ticketId: "ticket:synthetic-42", body: "Synthetic public status" }
  });
  assert.equal(reason(h.runtime, { trusted: unsafe, capability: h.capability, action: benign }), "SANDBOX_REQUIRED");
});

test("unknown provenance fails closed and provenance is bound into the digest", () => {
  assert.throws(() => harness({ classifyProvenance: () => null }), PolicyInputError);
  assert.throws(() => harness({ classifyProvenance: () => ({
    sensitivity: "unknown", sourceIds: [], detectedCanaries: []
  }) }), PolicyInputError);

  const publicRuntime = harness();
  const differentLineage = harness({
    classifyProvenance(input) {
      const resolved = classifyFixtureProvenance(input);
      return { ...resolved, sourceIds: ["source:different-authoritative-lineage"] };
    }
  });
  assert.notEqual(
    publicRuntime.runtime.digestAction(publicRuntime.action),
    differentLineage.runtime.digestAction(differentLineage.action)
  );
});

test("non-canary restricted derived text cannot use a public external sink", () => {
  const h = harness();
  const action = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "postPublicStatus",
    tenantId: "northstar-demo",
    destination: "external:synthetic-status",
    arguments: { ticketId: "ticket:restricted-derived", body: "Benign derived summary without a canary" }
  });
  assert.equal(action.inputSensitivity, "public");
  assert.equal(action.provenance.sensitivity, "restricted");
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action }), "SENSITIVE_EGRESS_DENIED");
  assert.equal(h.state.used(h.capability.capabilityId, h.capability.runId), 0);
});

test("run binding is carried into classifier input, action, digest, and authorization", () => {
  const h = harness();
  const otherContext = h.issueContext({ runId: "run:other" });
  const otherCapability = h.issueCapability({ runId: "run:other" });
  const otherAction = h.runtime.prepareAction(otherContext, otherCapability, saveProposal());
  assert.equal(otherAction.runId, "run:other");
  assert.equal(h.classifiedInputs.at(-1)?.runId, "run:other");
  assert.notEqual(h.runtime.digestAction(otherAction), h.runtime.digestAction(h.action));
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: otherAction }), "RUN_MISMATCH");
});

test("approved verified-public postPublicStatus reaches ALLOW exactly once", () => {
  const h = harness();
  const action = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "postPublicStatus",
    tenantId: "northstar-demo",
    destination: "external:synthetic-status",
    arguments: { ticketId: "ticket:synthetic-42", body: "Synthetic public status" }
  });
  const pending = h.runtime.authorize({ trusted: h.trusted, capability: h.capability, action });
  assert.equal(pending.kind, "require_approval");
  assert.equal(pending.reason, "APPROVAL_REQUIRED");
  const approval = approvalFor(h.runtime, action);
  h.state.registerApproval(approval);
  const input = { trusted: h.trusted, capability: h.capability, action, approval };
  assert.equal(h.runtime.authorize(input).kind, "allow");
  assert.equal(reason(h.runtime, input), "APPROVAL_REPLAYED");
  assert.equal(h.state.used(h.capability.capabilityId, h.capability.runId), 1);
});

test("read capability counters are atomic and fail closed", () => {
  const h = harness({ counterUsed: 1 });
  const action = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "lookupTicket", tenantId: "northstar-demo", destination: "internal:case-system",
    arguments: { ticketId: "ticket:synthetic-42" }
  });
  const input = { trusted: h.trusted, capability: h.capability, action };
  assert.equal(h.runtime.authorize(input).kind, "allow");
  assert.equal(reason(h.runtime, input), "CAPABILITY_USE_LIMIT");

  const missing = harness({ includeCounter: false });
  const missingRead = missing.runtime.prepareAction(missing.trusted, missing.capability, {
    tool: "lookupTicket", tenantId: "northstar-demo", destination: "internal:case-system",
    arguments: { ticketId: "ticket:synthetic-42" }
  });
  assert.equal(reason(missing.runtime, { trusted: missing.trusted, capability: missing.capability, action: missingRead }), "CAPABILITY_USE_COUNTER_MISSING");

  const mismatch = harness({ counterMaxUses: 1 });
  const mismatchRead = mismatch.runtime.prepareAction(mismatch.trusted, mismatch.capability, {
    tool: "lookupTicket", tenantId: "northstar-demo", destination: "internal:case-system",
    arguments: { ticketId: "ticket:synthetic-42" }
  });
  assert.equal(reason(mismatch.runtime, { trusted: mismatch.trusted, capability: mismatch.capability, action: mismatchRead }), "CAPABILITY_USE_BINDING_MISMATCH");
});

test("user, agent, tenant, run, audience, and expiry bindings are exact", () => {
  const h = harness();
  const cases: [AuthorizationInput, string][] = [
    [{ trusted: h.trusted, capability: h.issueCapability({ userId: "user:other" }), action: h.action }, "USER_MISMATCH"],
    [{ trusted: h.trusted, capability: h.issueCapability({ agentId: "agent:other" }), action: h.action }, "AGENT_MISMATCH"],
    [{ trusted: h.trusted, capability: h.issueCapability({ runId: "run:other" }), action: h.action }, "RUN_MISMATCH"],
    [{ trusted: h.trusted, capability: h.issueCapability({ audience: "admin-tools" }), action: h.action }, "AUDIENCE_MISMATCH"],
    [{ trusted: h.trusted, capability: h.issueCapability({ expiresAtMs: NOW }), action: h.action }, "CAPABILITY_EXPIRED"]
  ];
  for (const [input, expected] of cases) assert.equal(reason(h.runtime, input), expected);
});

test("scope, tool, object, and destination grants are independently constrained", () => {
  const h = harness();
  const cases: [VerifiedCapability, string][] = [
    [h.issueCapability({ scopes: ["tickets:read"] }), "SCOPE_MISSING"],
    [h.issueCapability({ tools: ["lookupTicket"] }), "TOOL_NOT_ALLOWED"],
    [h.issueCapability({ objectIds: ["job:synthetic-7"] }), "OBJECT_NOT_ALLOWED"],
    [h.issueCapability({ destinations: ["internal:none"] }), "DESTINATION_NOT_ALLOWED"]
  ];
  for (const [capability, expected] of cases) {
    assert.equal(reason(h.runtime, { trusted: h.trusted, capability, action: h.action }), expected);
  }
});

test("static egress sensitivity and sandbox rules fail closed", () => {
  const h = harness();
  const external = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "sendCaseWebhook", tenantId: "northstar-demo", destination: "external:synthetic-webhook",
    arguments: { ticketId: "ticket:synthetic-42", body: "Synthetic restricted case" }
  });
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: external }), "SENSITIVE_EGRESS_DENIED");

  const execute = h.runtime.prepareAction(h.trusted, h.capability, {
    tool: "runOfflineJob", tenantId: "northstar-demo", destination: "internal:none",
    arguments: { jobId: "job:synthetic-7" }
  });
  const unsafe = h.issueContext({ sandbox: { ...h.baseContext.sandbox, allowsHostFilesystem: true } });
  assert.equal(reason(h.runtime, { trusted: unsafe, capability: h.capability, action: execute }), "SANDBOX_REQUIRED");
});

test("approval metadata binds approver, run, capability, nonce, and expiry", () => {
  const h = harness();
  const cases: [Partial<BoundApproval>, string][] = [
    [{ approvedByUserId: "user:other" }, "APPROVER_MISMATCH"],
    [{ runId: "run:other" }, "APPROVAL_RUN_MISMATCH"],
    [{ capabilityId: "cap:other" }, "APPROVAL_CAPABILITY_MISMATCH"],
    [{ nonce: "" }, "APPROVAL_NONCE_MISSING"],
    [{ expiresAtMs: NOW }, "APPROVAL_EXPIRED"]
  ];
  for (const [override, expected] of cases) {
    const approval = approvalFor(h.runtime, h.action, override);
    assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: h.action, approval }), expected);
  }
});

test("post-approval changes invalidate the exact digest without consuming state", () => {
  const h = harness();
  const approval = approvalFor(h.runtime, h.action);
  h.state.registerApproval(approval);
  const changed = h.runtime.prepareAction(h.trusted, h.capability, saveProposal("Changed after review"));
  assert.equal(reason(h.runtime, { trusted: h.trusted, capability: h.capability, action: changed, approval }), "ARGUMENTS_CHANGED");
  assert.equal(h.state.approvalConsumed(approval.approvalId), false);
  assert.equal(h.state.used(h.capability.capabilityId, h.capability.runId), 0);
});

test("prepared snapshots remain deeply frozen after ALLOW", () => {
  const h = harness();
  const approval = approvalFor(h.runtime, h.action);
  h.state.registerApproval(approval);
  const digest = approval.actionDigest;
  assert.equal(h.runtime.authorize({ trusted: h.trusted, capability: h.capability, action: h.action, approval }).kind, "allow");
  assert.throws(() => Object.assign(h.action.arguments as Record<string, JsonValue>, { body: "Changed" }), TypeError);
  assert.equal(h.runtime.digestAction(h.action), digest);
});
