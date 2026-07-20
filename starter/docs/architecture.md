# Architecture Decision Story

Keep this as the authoritative evolving architecture—not a new diagram per lesson.

1. User need and explicit product contract.
2. Real Responses API and fake adapters behind `ModelProvider`, with validated triage output and bounded usage.
3. Authorized ingestion, Qdrant payload-filtered retrieval, just-in-time context, and citations.
4. Real model tool proposals through explicit workflow state, approval, idempotent tools, and resume.
5. Hand-rolled control baseline plus a LangGraph/Postgres rebuild of the same approval contract.
6. Least-scope MCP stdio surface whose trusted tenant/scope/approval state remains server-owned.
7. Local evals plus redacted OpenTelemetry GenAI spans in one hosted OTLP backend.
8. Public deployment/proof package, rollout/rollback, feedback, and version/schema revisit triggers.

Link every claim to code, a test/eval, a preserved trace, or a decision record.
