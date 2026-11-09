# 03. HTTP and integration contracts

16 hours. Make remote calls whose behavior you can explain under delay, duplication, and failure. Requires modules 01 to 02.

## Lesson 1. A response is evidence, and a missing response is uncertainty

Trace DNS resolution, connection establishment, TLS, HTTP routing, application execution, and database commit. A client timeout can occur before execution, during execution, or after a commit. The client usually cannot identify which point from the timeout alone. HTTP defines method semantics, including idempotency, but your application must honor its contract. [HTTP semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2)

Worked example: a ticket-update request commits, its response disappears, and the client retries. A fresh operation ID can apply the effect twice. A stable operation ID plus durable server enforcement can make retry safe within the stated retention period. Check whether an upstream actually supports this behavior. Stripe is a concrete API example, with documented key lifetime and parameter-matching behavior, not a universal rule for every service. [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)

Open interactive lesson 0001 and predict the effect count before each retry. Explain why restarting a process exposes the weakness of memory-only deduplication.

## Lesson 2. Retries spend a budget

Classify failures before retrying. Invalid credentials, malformed requests, and an exhausted deadline need different handling from a temporary connection failure. Follow an API's retry guidance, honor Retry-After where applicable, and keep a bounded overall deadline. Add backoff and jitter to spread retries. Retrying at every layer can multiply load. [AWS Builders' Library on retries](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)

Course experiment: send 20 requests to a fake service that returns temporary failures for one second. Compare immediate retries with bounded jittered backoff. Record attempted calls, completed logical operations, elapsed time, and peak concurrency. A lower error count can hide excessive load, so keep both.

For pagination, explain whether a cursor denotes a snapshot or a moving collection. Test insertion and deletion between pages. A stable sort with a tie-breaker helps, but the source's documented pagination contract determines correctness.

## Lesson 3. A webhook is untrusted until verified and still may repeat

Verify the signature using the provider's prescribed raw-body procedure. Handle timestamp tolerance and secret rotation according to its contract. Persist accepted events durably before acknowledging them. Separate delivery from processing. Test duplicate and out-of-order deliveries. Stripe documents both behaviors and its signature-verification requirements. [Stripe webhooks](https://docs.stripe.com/webhooks)

A verified event establishes an authenticated delivery under that protocol. It does not establish that its business state is newer than your current record. Compare source versions or reconcile against the source when ordering is uncertain.

## Lab and failure drill

Build a fake paginated source and a signed webhook receiver. Add modes for rate limiting, response loss after a write, a repeated cursor, an expired token, and a duplicated event. Write an explicit terminal result for deadline exhaustion.

Inject response loss after a fake upstream write. Prove that retries preserve the logical identity. Rotate the webhook secret and demonstrate the intended overlap. Reject a tampered body. Do not use real financial operations for this exercise.

## Mastery gate

Deliver request timelines, retry classification tests, webhook verification tests, and replay evidence. Diagnose an unknown-outcome write without assuming failure. Then transfer your policy to an API with no idempotency support. Explain whether you must reconcile, disable automatic retry, or change the product behavior.

Questions: Why can a retry be unsafe after a timeout? Does a signature prevent replay? Why can retrying three times at three independent layers create far more than three calls?

## Answer guide

Remote execution and response receipt are separate events. A signature alone does not supply your application's durable replay policy. Nested retries can multiply attempts. Safe behavior follows the upstream contract, application effect, and deadline, rather than status-code folklore.

Ask the tutor to choose a crash point you have not yet tested.
