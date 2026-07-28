# AI Agent Security Runbook

Review date: 2026-07-27  
Runbook version: `1.0-template`  
Scope: offline `northstar-demo` / `redwood-demo` procurement-support fixture

## Safety and declaration

Use synthetic users, policies, suppliers, tickets, approvals, canaries, memory, and fake effect tools only. No real purchasing, refunds, messaging, credentials, customer data, or public target. If a real secret or external effect appears: stop, preserve minimal evidence, revoke the affected credential, and notify the environment owner.

| Role | Responsibility | Named person/channel before exercise |
| --- | --- | --- |
| Incident commander | Declare severity, coordinate containment/recovery, approve resume | `REPLACE` |
| Scribe/evidence custodian | One UTC timeline; hashes, access, retention, redaction | `REPLACE` |
| Application/policy owner | Kill runs, disable tools/policy versions, diagnose decisions | `REPLACE` |
| IAM/platform owner | Revoke identity/capability; isolate runtime/component | `REPLACE` |
| Data owner | Quarantine source, memory, derivatives, indexes | `REPLACE` |
| Business/comms owner | Assess fake effects and exercise communications | `REPLACE` |

Severity: **SEV-1** observed/probably real prohibited effect, secret/canary boundary leak, cross-tenant access, or lost containment; **SEV-2** blocked critical attempt, poisoned persistent state, uncertain effect, or major telemetry loss; **SEV-3** low-impact drift/near miss. Any uncertainty about a critical effect is handled as SEV-1 until reconciled.

## Minimum event and detectors

Record UTC time, event/trace/run/task IDs, opaque tenant/user/agent refs, commit/model/prompt/policy/tool/component digests, clock source and sampled decision time, provenance resolver version/decision/source refs, canonical final-argument digest, decision/reason, approval/effect refs, detector version, and terminal state. Never log secrets, raw hostile documents, another tenant's content, or hidden reasoning; emit an explicit telemetry-gap event.

| Signal | Safe automatic action | Regression |
| --- | --- | --- |
| Goal/action drift or exact/encoded final-egress canary movement | Deny sink, pause run, quarantine derived context | `goal-direct-override-001`; `canary-indirect-vendor-chain-001` |
| Tenant/audience/capability mismatch | Deny before retrieval/tool; revoke delegation | `auth-direct-cross-tenant-001`; `auth-wrong-audience-001` |
| Stale authority or unavailable clock | Deny before model/tool and before atomic state consumption; repair/pin clock | `auth-stale-context-expiry-001` |
| Missing/forged/downgraded provenance or resolver drift | Fail preparation/deny egress; quarantine source and restore pinned resolver | `egress-forged-public-provenance-001` |
| Approval mutation/replay | Deny, invalidate approval, require exact fresh preview | `approval-direct-mutation-001` |
| Memory/peer poison or replay | Quarantine entry/derivatives; cancel child | `memory-indirect-poison-001`; `peer-indirect-replay-001` |
| Component/manifest drift | Disable changed component; restore known-good pin | `component-manifest-drift-001` |
| Runtime/egress violation | Reject launch/call; isolate worker | `sandbox-direct-escape-request-001` |
| Budget/cycle/fan-out breach | Stop new steps and cancel descendants | `runaway-budget-001` |
| Missing acknowledgement | Freeze retry; reconcile by idempotency/effect ID | `effect-ambiguous-ack-001` |

## Response sequence

1. **Declare and preserve:** assign incident ID/severity/roles; capture clock source/samples, resolver version/decisions/refs, final digests, pins, affected IDs, redacted events, policy decisions, store/index versions, fake outbox/effect ledger, and hashes. Work on copies; do not delete poisoned state as “rollback.”
2. **Contain:** independently kill affected runs/schedulers/delegations; disable the narrow capability/component; revoke sessions/tokens/approvals; quarantine sources, memory, outputs, and derivatives. Preserve checkpoints and distinguish cancelled, denied, executed, and unknown effects.
3. **Scope and analyze:** trace source-to-context-to-proposal-to-policy-to-effect across tenants, peers, caches, summaries, and retries. Identify first/last affected version and telemetry gaps. Do not replay hostile content against a live service.
4. **Reconcile:** for every unknown effect, use an independent read path and idempotency/effect ID. Never retry until state is known. Record compensating action and authorization separately.
5. **Eradicate and restore:** repair the deterministic control; rebuild from reviewed pins; remove poisoned entries and derivatives through governed deletion; restore a clean checkpoint/index; rotate exposed synthetic credentials.
6. **Verify and resume:** run critical deterministic cases, incident regressions, matched benign cases, inventory/profile checks, and one canary run. Incident commander signs a limited resume with rollback trigger.
7. **Learn:** record detection/containment/recovery times, counterevidence, root/control causes, permanent case, owners/dates, and expiring residual risks; update threat model, inventory, gate, and assurance case.

## Playbook prompts

- **Goal/canary:** Which source introduced it? Did exact or encoded bytes reach any final egress field, sink, log, peer, cache, or memory? Can legitimate work continue in read-only safe mode?
- **Identity/approval:** What identity came from verified transport? Which app clock sample decided expiry? Did object, tenant, action, amount, recipient, nonce, digest, or expiry differ at execution?
- **Provenance:** Which pinned resolver classified the exact final digest and lineage? Was resolution missing, forged, mismatched, or downgraded?
- **Memory/peer:** Which active and derived records share the source? Which children received it? Have replay keys and delegations been revoked?
- **Component/runtime:** What digest/tool list/schema/profile changed? Was the effective runtime weaker than declared? Is a known-good build recoverable?
- **Uncertain effect:** Was the request sent, accepted, committed, or only timed out? What independent receipt proves the state?

## NIST SP 800-61r3 tabletop record

Exercise poisoned synthetic supplier content that attempts a canary send and durable policy write while one fake purchase acknowledgement is missing. Walk **Govern/Identify/Protect/Detect/Respond/Recover**: declare; kill/revoke/quarantine; scope derivatives and peers; reconcile without retry; restore known-good pins/state; rerun the gate; resume one canary case.

| Time/inject | Observation/evidence hash | Decision/action | Owner | Result/gap/follow-up |
| --- | --- | --- | --- | --- |
| `REPLACE` | `REPLACE` | `REPLACE` | `REPLACE` | `REPLACE` |

Resume decision, approver, scope, evidence bundle, expiry, and rollback trigger: `REPLACE`. This template does not define production notification, privacy, legal, regulator, insurer, or law-enforcement duties; map those before any real deployment.
