# 05. Transactions, jobs, and distributed state

22 hours. Make a small system reliable when two workers act and either can stop. Requires modules 02 to 04.

## Lesson 1. Concurrency changes what "correct" means

Read-then-write code can be correct in one execution and wrong when requests overlap. PostgreSQL's default Read Committed isolation gives each statement a view of committed data, with additional rules for concurrent updates. It does not make a sequence of business decisions serializable. Serializable transactions can abort and require retry. [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

Worked example:

```sql
UPDATE work_item
SET owner = :worker_id
WHERE id = :item_id AND owner IS NULL
RETURNING id;
```

For this lab's single-row claim, the conditional update allows one winner. Seed the table yourself. Run two clients concurrently and assert exactly one returned row across both. Then design claim expiry so a crashed worker does not own the item forever. A lease introduces another question: can an expired worker still perform an external action?

## Lesson 2. Durable job state is a state machine

Define queued, claimed, running, succeeded, retryable-failed, and terminal-failed states. Record attempt count, lease deadline, next-attempt time, and logical operation ID. A queue message does not equal a completed effect. Acknowledging before durable completion can lose work; acknowledging after completion can cause redelivery.

Implement a minimal job table first. Explain ownership, timeout, backpressure, poison records, and manual replay. Use explicit limits on concurrent work and attempts. SQS's documented duplicate-delivery behavior provides a concrete reason consumers need replay-safe effects. [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html)

Do not hold a database transaction open during a slow model request. Commit the durable intent, perform the remote step, then record its outcome with a recovery policy.

## Lesson 3. The outbox closes one gap

Writing a database row and publishing an event are two writes. Either can succeed alone. An outbox puts the business update and pending event in one local transaction. A publisher later delivers the event. It can publish and crash before marking delivery, so consumers still need deduplication. The pattern does not provide universal exactly-once execution. [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)

Trace an operation across application storage, outbox publisher, transport, and destination. Mark the transaction boundary around only the local writes. If the destination lacks idempotency, describe the reconcile-or-manual-recovery step for an unknown outcome. Retry policy must account for side effects. [AWS retry guidance](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)

## Lab and failure drill

Run two workers against 100 jobs. Introduce crashes before claim commit, after claim, after local effect commit, after remote effect, and before acknowledgement. Retain a separate durable effect ledger to check the outcome.

First reproduce a duplicate using an in-memory "already processed" set. Replace it with a database-enforced operation identity. Test simultaneous duplicates as well as sequential retries. Then implement an outbox and deliberately redeliver an event.

## Mastery gate

Deliver a state-transition table, concurrent claim test, crash/restart matrix, and effect-count assertions. Explain which effects share a transaction and which do not. Transfer the design to a remote system with a shorter idempotency-key retention window than your replay window.

Questions: Does an outbox eliminate duplicate delivery? Does a successful queue acknowledgement prove the business operation completed? What happens if the original worker wakes after its lease expired?

## Answer guide

The outbox preserves local update-plus-intent consistency. Acknowledgement semantics depend on where you place it. Lease expiry allows recovery but can create concurrent stale workers. Use destination-side idempotency, conditional updates or fencing where supported, and explicit reconciliation where guarantees end.

Ask the tutor to challenge one "exactly once" claim in your design.
