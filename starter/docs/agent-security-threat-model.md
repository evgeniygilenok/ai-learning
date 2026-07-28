# AI Agent Security Threat Model

Framework review: 2026-07-27  
Artifact version: `1.0-template`  
Scope: offline synthetic procurement/support agent for `northstar-demo` and `redwood-demo`

## Safety and system boundary

Use synthetic tickets, policies, catalog entries, fake approvals, inert canaries, in-process tools, and `.invalid` destinations only. No live identity, credential, customer data, browser, shell, payment/email service, or default network. Stop if a real secret or external effect appears.

```text
S1 operator + S2 ticket/attachment/catalog (content is untrusted)
 -> B1 trusted identity/session binding
 -> B2 authorized retrieval + app-issued provenance bound to exact digest/lineage
 -> D1 model proposal (never authority)
 -> B3 canonical tool policy + fresh decision clock + exact approval
 -> B4 sandbox + final-argument egress/DLP + budgets
 -> K1 fake read/purchase/refund/send/close tools
 -> B5 idempotency receipt + redacted audit + governed memory
```

## Assets and effects

| Asset/property | Objective | Failure impact |
| --- | --- | --- |
| Tenant data and canaries | Isolation/confidentiality | Cross-tenant disclosure or synthetic exfiltration |
| Goal, policy, identity, capability, approval | Integrity and least privilege | Wrong object, recipient, action, or effect |
| Tool/component registry and runtime | Provenance and containment | Poisoned behavior, host access, or runaway use |
| Context, memory, peer messages | Provenance, TTL, bounded delegation | Persistent poison, replay, or trust laundering |
| Effect ledger and audit | Reconciliation and evidence integrity | Duplicate effect or false recovery |

Allowed effects are tenant-scoped synthetic reads and drafts. Fake purchase/refund/send/close requires an exact fresh approval and idempotency key. Credential access, arbitrary URL/file/process/code, bank-detail changes, cross-tenant access, and real external effects are prohibited.

## Invariants and abuse cases

| Threat | Source -> sink | Invariant / enforcement | Detection and response | Owner / regression / residual |
| --- | --- | --- | --- | --- |
| T-001 / ASI01 Goal Hijack | untrusted content -> altered action | Only trusted control changes goal; authorize every sink | Goal/action drift; deny and quarantine source | App / `goal-direct-override-001` / unsafe proposals remain possible |
| T-002 / ASI02 Tool Misuse | proposal/class claim -> wrong tool/object or sensitive egress | Strict schema; canonical final args; app resolver binds provenance to payload/tool/destination/tenant/run/digest/lineage; exact/encoded canary scan at every sink | Fail preparation or deny egress before atomic use; quarantine source | Policy / `egress-forged-public-provenance-001`, `canary-indirect-vendor-chain-001` / resolver or normalization defects |
| T-003 / ASI03 Identity & Privilege Abuse | forged tenant/token or stale context -> protected data/effect | Server-owned identity, audience/scope, attenuated capability; application clock sampled once per authorization, never context-carried authority time | Deny before retrieval/state consumption; revoke session | IAM / `auth-wrong-audience-001`, `auth-stale-context-expiry-001` / issuer or clock compromise out of scope |
| T-004 / ASI04 Supply Chain | drifted metadata/package -> changed behavior | Inventory, digest/provenance, fail-closed drift | Inventory diff; disable and restore pin | Platform / `component-manifest-drift-001` / publisher compromise |
| T-005 / ASI05 Unexpected Code Execution (RCE) | code-like data -> host/network | No interpreter/general HTTP; sandbox and deny egress | Process/mount/egress alert; kill and quarantine | Platform / `sandbox-direct-escape-request-001` / shared kernel |
| T-006 / ASI06 Memory & Context Poisoning | low-trust text -> durable instruction | Typed writes, lineage, validation, TTL, rollback | Quarantine entry and derivatives | Data / `memory-indirect-poison-001` / semantic poison |
| T-007 / ASI07 Insecure Inter-Agent Communication | forged/replayed peer -> delegated sink | Verified sender/audience, nonce/expiry/digest; local auth | Reject replay; revoke and cancel child | Orchestration / `peer-indirect-replay-001` / verifier defects |
| T-008 / ASI08 Cascading Failures | retries/cycle/fan-out -> duplicate/cost | Monotonic budgets, visited path, breaker, idempotency | Cancel graph; reconcile independently | Ops / `effect-ambiguous-ack-001` / cancel-effect race |
| T-009 / ASI09 Human-Agent Trust Exploitation | deceptive summary -> approval | Exact preview/digest, differences, expiry, no bundling | Invalidate mismatched approval | Product / `approval-direct-mutation-001` / reviewer fatigue |
| T-010 / ASI10 Rogue Agents | drift/persistence -> undeclared actions | Lifecycle owner, no self-grant/spawn, independent kill | Kill/revoke/quarantine/rollback | Ops / `runaway-budget-001` / telemetry gaps |

## NIST AI RMF and evidence

- **Govern:** owners, prohibited uses, risk acceptance, incident roles, version/source review.
- **Map:** data/effect flow, identities, dependencies, affected actors, impacts, assumptions.
- **Measure:** deterministic boundary cases plus repeated goal-integrity and matched-benign suites, with denominators and uncertainty.
- **Manage:** release gate, sandbox, least authority, detectors, response exercise, effect reconciliation, and expiring residual risks.

Before review, replace `REPLACE` pins for commit, model snapshot/timestamp, prompt/policy/tool/case digests; link `agent-component-inventory.md`, `agent-sandbox-profile.md`, `context-integrity-policy.md`, the security evals, and the runbook. Every high-risk row must have prevention, detection, response, owner, runnable/tabletop test, and an explicit residual-risk decision.
