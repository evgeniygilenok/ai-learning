# Operations and Reliability

Define measurable SLOs, per-attempt timeout, total retry budget, provider rate-limit behavior, queue backpressure, idempotency, dead-letter handling, cost and latency budgets, staged rollout, rollback, model/version retirement, incident review, and drift signals.

| Signal | Target | Alert/review trigger | Response owner |
| --- | --- | --- | --- |
| Contract pass rate | TBD | TBD | TBD |
| p95 end-to-end latency | TBD | TBD | TBD |
| Authorization failures | 100% blocked | Any leak | TBD |
| Cost per successful task | TBD | TBD | TBD |

## Course operating defaults

- Provider spend hard stop: $15 until the learner records a cost-per-success baseline and explicitly revises the budget.
- Default model: `gpt-5.6-terra`, reviewed 2026-07-20; preserve model/version in traces and rerun representative evals on change.
- Agent step budget: 6; model-call timeout: 30 seconds; write retries: zero unless idempotency and acknowledgement semantics are proven.
- Postgres and Qdrant run locally for the framework/vector modules; pin versions and record migrations before deployment.
- One hosted OTLP backend receives redacted spans. Export failure must not bypass the local deterministic release gate.
- New MCP deployments start read-only. Write scope and trusted approval mode are enabled only for the explicit test window.
