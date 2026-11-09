# Forward deployed engineering resources

Primary technical sources checked on 2026-11-06. Read the named sections while doing the matching module. Pin the versions actually used in labs. Dynamic links may change after this review.

## Knowledge

- [Python asyncio tasks](https://docs.python.org/3/library/asyncio-task.html). Module 01. Read cancellation and TaskGroup to reason about bounded concurrent work and cleanup.
- [Pydantic models](https://pydantic.dev/docs/validation/latest/concepts/models/). Module 01. Distinguish parsing, conversion, and output-model guarantees.
- [FastAPI concurrency](https://fastapi.tiangolo.com/async/). Module 01. Trace synchronous and asynchronous request behavior before choosing clients.
- [Pytest monkeypatch](https://docs.pytest.org/en/stable/how-to/monkeypatch.html). Module 01. Replace dependencies deliberately and preserve cleanup.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html). Modules 02 and 04. Enforce key scope, references, and row invariants.
- [PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html). Module 02. Keep row identity while ranking or aggregating over partitions.
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html). Module 02. Interpret plans and measured execution rather than guessing about indexes.
- [HTTP semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html). Module 03. Read method semantics and idempotency.
- [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests). Module 03 and lesson 0001. Study a concrete provider contract, including retention and mismatched inputs.
- [Stripe webhooks](https://docs.stripe.com/webhooks). Module 03. Study raw-body signatures, duplicates, ordering, and delivery/processing boundaries.
- [AWS timeouts, retries, and jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/). Modules 03 and 05. Reason about deadlines, load amplification, and side effects.
- [PostgreSQL isolation](https://www.postgresql.org/docs/current/transaction-iso.html). Modules 04 to 05. Reproduce concurrency behavior with two sessions.
- [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html). Modules 04 to 05. Concrete delivery contract for replay-safe consumers.
- [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html). Modules 05 and 10. Separate local atomicity from remote delivery and effects.
- [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html). Module 06. Explain identity, ID tokens, clients, and resource access.
- [OAuth security BCP, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html). Module 06. Check current flow and token-handling guidance.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html). Modules 06 and 09. Test application roles, owner bypass, and policy scope.
- [OWASP prompt injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). Modules 06 and 10. Identify direct and indirect instruction attacks and enforce permissions in code.
- [Docker build practices](https://docs.docker.com/build/building/best-practices/). Module 07. Build reproducible images and maintain deliberate dependency boundaries.
- [GitHub Actions OIDC](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers). Module 07. Configure cloud trust for short-lived deployment credentials.
- [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/) and [context propagation](https://opentelemetry.io/docs/concepts/context-propagation/). Modules 07 and 12. Connect API, worker, database, and provider activity.
- [Google SRE, implementing SLOs](https://sre.google/workbook/implementing-slos/). Modules 07 and 12. Define user-relevant signals and reliability decisions.
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). Module 08. Learn supported schema constraints and the limits of syntactic correctness.
- [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling). Modules 08 and 10. Separate model proposals, application execution, and tool results.
- [Anthropic, building effective agents](https://www.anthropic.com/research/building-effective-agents). Module 08. Foundational workflow/agent distinctions. Its tooling discussion is historical; use current SDK documentation for implementation.
- [PostgreSQL text search](https://www.postgresql.org/docs/current/textsearch-intro.html). Module 09. Build a lexical baseline before adding retrieval components.
- [pgvector](https://github.com/pgvector/pgvector). Module 09. Compare exact and approximate retrieval and inspect filtered-query behavior.
- [MCP architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture) and [MCP security](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices). Module 10. Dated documentation reached by current redirects at review time. Match the SDK and negotiated protocol at implementation time.
- [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices). Module 11. Use task-specific cases, human calibration, and repeated evaluation. The guide includes a hosted Evals-platform deprecation notice, so the course uses a local runner.
- [NIST proportion confidence intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm). Module 11. Interpret binomial success-rate uncertainty and Wilson intervals.
- [SciPy bootstrap](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html). Module 11. Study paired resampling and its assumptions.
- [Prometheus histograms](https://prometheus.io/docs/practices/histograms/). Module 11. Understand latency aggregation and quantile-estimation limits.
- [Python debugger](https://docs.python.org/3/library/pdb.html). Module 12. Use breakpoints and stack inspection for hypothesis-driven debugging.

## Wisdom

Bring a concrete artifact to a working engineer or project maintainer: a failing reproduction, design decision, evaluation report, or handoff. Ask them to challenge one assumption. Contributing a small justified fix to a project you already use is a practical way to test unfamiliar-code skills. No community membership is required for this course.

## Gaps

The user confirmed 15 or more hours per week and stronger systems understanding. Python is a reference checklist. Specific gaps can be identified while building or through a short optional review. Cloud/provider choices, capstone user, budget, and target-company specialization can be settled during the matching module.
