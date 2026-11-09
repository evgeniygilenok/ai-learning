# 07. Deploy and operate the integration app

18 hours. Ship milestone 1 and prove that you can recover it. Requires modules 05 to 06.

## Lesson 1. Trace the deployed request

Explain how DNS, TLS termination, ingress, the service process, connection pool, and PostgreSQL fit together. Bind to the correct interface, separate public and private endpoints, and keep credentials outside image layers. Use a reproducible image build with a small trusted base and deliberate cache boundaries. Docker's build guidance covers multi-stage builds, dependency choices, and image maintenance. [Docker build practices](https://docs.docker.com/build/building/best-practices/)

Worked example: a service answers inside its container but not from the browser. Check binding and port mapping before rewriting application logic. Then test a database connection from the service environment. Distinguish name resolution, reachability, TLS, authentication, and authorization failures through their evidence.

Choose one cloud that supports your existing environment and budget. Record its service-specific commands in your lab. The course does not assume free hosting or prescribe cloud prices.

## Lesson 2. A release includes data compatibility

Run lint, tests, database integration checks, and image builds in CI. Separate those from the deployment step. Prefer short-lived federated cloud credentials where supported. GitHub documents OIDC-based trust between Actions and cloud providers. [GitHub Actions OIDC](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-cloud-providers)

Deploy a version that supports an additive schema change, backfill, then tighten constraints when old writers are gone. A code rollback cannot automatically reverse destructive data changes. Write the recovery decision before performing the migration.

Distinguish liveness, readiness, and workflow usefulness. A process can be alive while ingestion is stale. Decide which dependency failures should remove an instance from traffic and which should appear as degraded capability.

## Lesson 3. Observe a user-visible operation

Carry correlation context through API requests, jobs, database work, and downstream calls. A trace connects spans into the path of a logical operation. Use structured logs for discrete events and metrics for aggregate behavior. Inspect what survives asynchronous boundaries. [OpenTelemetry traces](https://opentelemetry.io/docs/concepts/signals/traces/), [context propagation](https://opentelemetry.io/docs/concepts/context-propagation/)

Define an SLI as a measurable user-relevant outcome, then choose an initial SLO and document why. For this lab, track successful ticket reads, source freshness, and completed processing within a deadline. Google SRE explains how SLOs and an error-budget policy guide reliability decisions. [Implementing SLOs](https://sre.google/workbook/implementing-slos/)

Course example, not a customer promise: define freshness success as an expected update reaching the canonical view within 60 seconds under your fixed test workload. Measure actual behavior before claiming this target is suitable.

## Lab and failure drill

Deploy the API, worker, PostgreSQL, and minimal UI. Use a synthetic seed and a documented teardown path. Run a load profile with specified concurrency, request count, and duration. Record failures as well as successful-request latency.

Inject three incidents: wrong database credentials, a worker that stops while HTTP stays healthy, and a failed release. Diagnose each using telemetry. Restore a backup to a separate test database, verify the restored data, and record the observed recovery time and data gap. A backup file alone is not restore evidence.

## Mastery gate

Deliver a live synthetic demo or recorded deployment proof, CI configuration, release/rollback steps, trace, freshness measurement, restore result, and two incident write-ups. Transfer the deployment to a changed secret or recreated service instance without manual data repair.

Questions: Why can HTTP availability hide a broken workflow? What does a code rollback fail to restore? Which evidence proves a backup is useful?

## Answer guide

Request success measures only the path exercised. Workers and freshness need their own signals. Rollback may leave incompatible data or schema. A verified restore shows usable recovery, with measured limits. Diagnose the failed boundary before changing unrelated code.

Ask the tutor to walk through your runbook as an engineer who did not build the service.
