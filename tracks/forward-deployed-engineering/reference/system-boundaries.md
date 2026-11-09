# System boundaries reference

A printable companion for the course. Use these definitions consistently when explaining failures.

| Term | Meaning in this course | Question to ask |
| --- | --- | --- |
| Invariant | A property that must remain true across allowed operations | Which component enforces it under concurrency? |
| Atomicity | A defined group of changes commits together or rolls back | Which writes are inside the same transaction? |
| Idempotency | Repeating a logical operation preserves its intended effect | How does the receiver recognize the operation? |
| Unknown outcome | The caller cannot determine whether execution completed | Where can the durable result be looked up? |
| Deduplication | Recognition and handling of repeated operation identities | What survives restart and for how long? |
| Checkpoint | A durable claim about completed progress | Can replay recover the last incomplete unit? |
| Reconciliation | Comparison and repair of state across sources | What detects a missed update or delete? |
| At-least-once delivery | A transport contract that permits repeated delivery | Is the consumer's effect replay-safe? |
| Lease | Time-bounded ownership of work | Can an expired worker still act? |
| Outbox | Local durable event intent stored with a business update | What handles duplicate publication? |
| Authentication | Verification of identity under an accepted protocol | Who issued this credential and for whom? |
| Authorization | Permission for an actor to perform an action on a resource | Is this actor allowed right now? |
| Tenant isolation | Enforcement of separation between customer data and actions | Can another tenant reach this path? |
| Structured output | Output constrained by a supported schema | Is the content also true and permitted? |
| Retrieval | Selection of candidate evidence for a query | Was relevant permitted evidence available and selected? |
| Grounded answer | An answer whose claims have support in its provided evidence | Does each claim follow from its citation? |
| Tool call | A proposed invocation that application code may execute | Who validates, authorizes, and records the effect? |
| Evaluation oracle | A rule or judgment defining expected behavior | Can two reviewers apply it consistently? |
| Held-out case | A case reserved from tuning for later evaluation | Have changes already been selected using it? |
| SLI | A measured service outcome | Does it represent the user's workflow? |
| SLO | A target for an SLI over a stated interval | What happens when the target is missed? |

## Debugging sequence

Reproduce the symptom. State the violated invariant. Trace the operation across its boundaries. Locate the last known durable fact. Form a hypothesis that predicts an observation. Run a small discriminating experiment. Repair the cause. Reproduce the original failure and a changed case. Record what the fix cannot guarantee.

## Four distinctions to keep clear

- An acknowledged message is not necessarily a completed business effect. Check the placement of acknowledgement.
- A validated object is not necessarily correct or authorized. Check domain rules and policy separately.
- A successful HTTP response is not necessarily fresh source data. Measure the age of incorporated updates.
- A benchmark score is evidence about its tested distribution. It does not establish behavior for every tenant or workflow.

## Reading anchors

Use [HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2), [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [AWS outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [OIDC](https://openid.net/specs/openid-connect-core-1_0.html), and [MCP architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) for the matching mechanisms. The module pages contain the full reading set and implementation exercises. Reviewed 2026-11-06.
