# Context Integrity, Memory, and Multi-Agent Trust Policy

Review date: 2026-07-27  
Policy version: `1.0-template`  
Scope: two fictional tenants, in-memory stores, pre-verified identity fixtures, and a no-network fake bus

Do not connect live memory, messaging, A2A/MCP, identity, or customer systems. Do not design production cryptography in this lab; use reviewed libraries and verified transport identity in a real implementation.

## Context envelope and assembly rules

Every context item and derived summary must carry: `contextId`, `contentRef`, `sourceKind`, `sourceId`, `trust`, `tenantId`, `subjectRef`, `sessionId`, `purpose`, received `dataClasses` claims, `createdAt`, `expiresAt`, `parentRefs`, `contentDigest`, and an application-issued `resolvedClassificationRef` that binds resolver version/decision to the exact content digest and lineage.

- Authorize sources before retrieval/model assembly; absent or conflicting tenant, trust, purpose, fresh expiry, lineage, or locally resolved classification fails closed.
- Only the trusted control-plane path may write policy, system instructions, run identity, or the allowed task graph.
- User, retrieved, tool, memory, and peer content remains untrusted data even when relevant, signed, approved, or summarized.
- Received tool/peer/memory trust and data-class labels are claims, not authority. A pinned application resolver reclassifies the exact body/artifact and binds its decision to `contentDigest`, all parent lineage, tenant, purpose, and resolver version; missing, forged, mismatched, or downgraded resolution denies.
- A transform creates a new envelope and retains every parent. Derived content inherits the most restrictive tenant, trust, app-resolved data class, purpose, and expiry unless a named non-model validation process changes one property.
- Cache, trace, scorer, checkpoint, and memory enforce the same authorization boundary and do not store raw secrets or hidden reasoning.
- Compaction preserves decisions, denials, approvals, effect IDs, budgets, provenance, and expiry—not prose alone.

| Zone | Scope/lifetime | Allowed | Prohibited |
| --- | --- | --- | --- |
| Control | versioned policy | application policy, trusted run identity, enforcement versions | writes from model/content/memory/peer |
| Step | one tenant/run/step | minimum authorized facts and tool results | automatic carry-forward or lost labels |
| Session | one agent/session | pending decision, effect IDs, budgets, scoped summary | cross-tenant/user/agent reuse without policy |
| Durable memory | tenant/subject/purpose + TTL | validated typed facts/preferences with source/version | credentials, approvals, policy, roles, identity claims, commands |
| Peer exchange | one delegation + short expiry | minimal references and bounded requested result | parent token, ambient tools, expanded authority |

## Governed memory lifecycle

`candidate -> validated -> active -> expired/deleted`; any non-final state may move to `quarantined -> restored/deleted`.

1. The model may propose a typed candidate but cannot write directly.
2. A trusted resolver classifies the exact content digest and lineage; deterministic policy samples application-owned fresh time and checks writer, tenant, subject, purpose, type, source, TTL, resolved data class, and prohibited content. Sensitive durable classes require named review.
3. Activation versions the record and indexes. Retrieval returns the envelope with content, never naked text.
4. Every read re-resolves the exact body/artifact and is re-authorized with receiver-owned fresh time for the current tenant, subject/session, purpose, and agent. A reusable context timestamp carries no authority.
5. Quarantine/delete removes active retrieval immediately, retains a minimal governed tombstone, finds derived summaries/indexes, and rebuilds them.
6. Rollback selects a known-good version and reruns the poisoned-content regression to prove later sessions are clean.

## Delegation envelope and receiver checks

Require `messageId`, transport-verified `senderAgentId`, `audienceAgentId`, `tenantId`, `userDelegationRef`, root/parent/task/session IDs, `allowedSkills`, audience-bound `capabilityRef`, `dataClasses`, remaining depth/fan-out/steps/time/tokens/spend, `expiresAt`, `nonce`, `bodyDigest`, and `transportAuthRef`.

The receiver authenticates outside message content; samples its own fresh time; validates schema/version, audience, tenant, expiry, nonce/replay state, and body digest; binds user/session/task to trusted state; re-resolves classification for the exact body/artifact and lineage; locally authorizes skill/action/object/data; and treats the body/artifacts and labels as untrusted claims. Never accept “I am the system agent,” “still current,” or “public data” from the payload.

Child authority is the intersection of parent grant, local policy, requested skill/action/object/destination/data, audience, purpose, and expiry. Every budget only shrinks. Atomically reserve fan-out; decrement depth; keep a visited path; reject cycles/repeated IDs; share parent retry totals; cancel descendants with the parent; and reconcile uncertain effects before any retry.

## Required safe tests

| Case | Expected oracle |
| --- | --- |
| Benign scoped preference | Activate/retrieve only for matching tenant/subject/purpose; expire on time |
| Low-trust request to store policy/role/approval/secret/instruction | Deny or quarantine; absent from later context |
| Cross-tenant/session read or summary/cache laundering | Deny before model/trace; derived record retains restrictive parents |
| Poisoned entry influenced summaries | Quarantine entry and derivatives; restore known-good index; regression passes |
| Authenticated one-hop delegation | Exact skill/data allowed; bounded schema-valid result; no ambient tool |
| Old branded context with newly expired envelope/capability | Receiver-owned fresh clock rejects before model/tool and before state consumption |
| Missing/forged/downgraded provenance or digest/lineage mismatch | Local resolution fails or retains restrictive class; zero model/sink bytes |
| Forged sender, wrong audience/tenant, expired/replayed nonce, changed body | Reject before model/tool; zero child/effect |
| Privilege expansion, excess depth/fan-out, cycle, retry storm | Reject/stop at first limit; descendants cancel; graph and effects stay bounded |

## Review record

- Envelope/schema, clock implementation/config, and provenance resolver/policy/config digests: `sha256:REPLACE`
- Memory/index version and rollback evidence: `REPLACE`
- Transport verifier/protocol pin and replay-store retention: `REPLACE`
- Test report, owner, exception expiry: `REPLACE`
- Decision: `not release-ready until every REPLACE is resolved`
