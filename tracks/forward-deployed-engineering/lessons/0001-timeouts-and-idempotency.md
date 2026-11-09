# A timeout does not tell you what happened

25 to 35 minutes. Learn one thing: a lost response does not reveal whether the server committed the action. This is the first lesson because the same uncertainty appears in connectors, webhooks, jobs, and AI tools.

## Predict before reading

An operator clicks "create draft". The server stores draft D-1, but the response disappears. The operator retries. How many drafts exist? What information would you need to answer?

The correct first answer is "it depends on the server's retry contract". The client seeing a timeout does not establish that the server failed. The server may have committed the effect before the response was lost. HTTP defines idempotency in terms of the intended effect of repeated requests, not whether all responses arrive. [HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

## Trace the boundary

```text
Client sends operation OP-42
Server validates the request
Server commits a draft and its operation record
Response disappears
Client has an unknown outcome
Client retries OP-42
Server finds the completed operation and returns its recorded result
```

Without a stable logical identity and server enforcement, the retry may create another draft. With an in-memory record, a restart can erase the deduplication knowledge while leaving the draft in persistent storage. With a durable operation record committed atomically with the local effect, a restart preserves the information needed for this retry.

## The local transaction contract

For this exercise, store a unique combination of tenant, action, and operation ID. Bind it to a canonical payload hash. When committing the local database effect, store the matching completed result in the same transaction.

```text
BEGIN
claim unique operation key, coordinating concurrent duplicates
reject the key if it is already bound to a different payload
if completed, return the recorded result without repeating the effect
otherwise apply the local effect and store its result
COMMIT
```

This is design pseudocode. The implementation must handle a concurrent request, an in-progress operation, rollback, and key expiration. A check-then-insert outside a transaction is race-prone. Module 05 implements and tests the database behavior.

This transaction cannot atomically commit an unrelated external API. A remote effect needs its own idempotency contract or a reconciliation path. Stripe's documented key handling illustrates a real provider's contract and its retention limits. Do not assume another provider behaves the same way. [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests)

## Explore three cases

The local interactive version lets you choose no deduplication, memory-only deduplication, or durable deduplication. It simulates sequential requests and a response lost after a local commit. It does not simulate concurrent transactions, partial database commits, key expiration, or a remote side effect.

1. Send the first request and lose its response. Predict the effect count before retrying.
2. Reset. Send the request, restart the server, then retry. Compare memory-only and durable records.
3. With durable records, change the payload while reusing OP-42. Predict whether the server should reuse the old result, perform a new effect, or reject the conflict.

Write down the client observation separately from the server state. A client may not know a fact that the server can recover from durable storage.

## Check your understanding

1. A request times out. Can the client conclude the action did not happen?
2. A memory-only deduplication map works during one process lifetime. What breaks after restart?
3. Can the same operation key safely mean two different payloads?
4. If the effect is a remote API call, does a local database transaction solve the whole problem?

## Answer guide

1. No. Execution may have committed before the response was lost.
2. The persisted effect can survive while the deduplication map disappears. A retry can repeat the effect.
3. Bind the key to the intended payload and reject a conflict. A new logical action needs a new identity.
4. No. The remote system's execution and response delivery remain separate. Look up a durable remote result, use its idempotency support, or reconcile the unknown outcome.

## Practice artifact

Draw a six-step timeline for an AI tool that updates a ticket and loses its response. Mark durable state, the point of uncertainty, and the behavior on retry. Explain it aloud in 90 seconds. Bring the timeline to the tutor for feedback before treating this lesson as mastered.

Next, use module 01 for service boundaries and module 03 for integration policy. Module 05 implements durable execution, and module 10 applies it to agents.
