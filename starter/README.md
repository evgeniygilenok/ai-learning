# Flagship Project: Regulated Support Assistant

This TypeScript starter grows from deterministic contracts into a real, model-driven agent stack. The fake provider remains the test/eval path; after Stage 1, the default demos use a real OpenAI Responses API provider and synthetic data only.

## Prerequisites and spend guardrail

- Node.js 22+ and `npm install`.
- An OpenAI API key for real-model and embedding paths.
- Docker for the local Postgres and Qdrant paths.
- A hosted OTLP/HTTP trace endpoint for the observability gate.

Set a **$15 course hard stop** in the provider dashboard before the first real run. Use `gpt-5.6-terra` by default, keep the supplied token/step caps, and stop to review the cost-per-success signal before raising either. Pricing changes, so the dashboard limit—not a static per-run estimate—is authoritative.

```bash
cp starter/.env.example starter/.env
export OPENAI_API_KEY="..."
npm run starter:demo
npm run starter:agent
```

`npm run starter:demo` is intentionally a real-provider path and fails clearly without `OPENAI_API_KEY`. Use `npm run starter:demo:fake` and `npm run starter:test` for deterministic work.

## Runnable paths

| Command | What it proves | External dependency |
| --- | --- | --- |
| `npm run starter:demo` | Real structured model output behind `ModelProvider` | OpenAI API |
| `npm run starter:demo:fake` | Deterministic provider/contract path | None |
| `npm run starter:agent` | Model-proposed lookup and write, paused at application-owned approval | OpenAI API |
| `AGENT_DECISION=approve npm run starter:agent` | Resume, idempotent write, and final model response | OpenAI API |
| `npm run starter:langgraph` | Same pause/resume flow on LangGraph with a Postgres checkpointer | OpenAI API + Postgres |
| `npm run starter:mcp` | Least-scope MCP server over stdio | MCP client |
| `npm run starter:vector` | OpenAI embeddings and ACL-filtered Qdrant retrieval | OpenAI API + Qdrant |
| `npm run starter:eval:hosted` | Agent release gate exported with OTLP GenAI attributes | Hosted OTLP endpoint |
| `REAL_MODEL_EVAL=1 npm run starter:eval:hosted` | The hosted gate against the real model | OpenAI API + hosted OTLP endpoint |

Start local stateful services with:

```bash
docker compose -f starter/docker-compose.yml up -d
export POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/agent_course"
export QDRANT_URL="http://localhost:6333"
```

## What the implementation contains

- `src/provider.ts`: deterministic and real Responses API adapters, strict structured output, function calls, timeouts, usage, request IDs, and typed provider failures.
- `src/workflow.ts`: a model-driven loop where the LLM proposes calls and the runtime owns ordering, validation, authorization, approval, idempotency, execution, and termination.
- `src/langgraph-workflow.ts`: the same workflow rebuilt with LangGraph interrupts and a Postgres-backed checkpointer.
- `src/mcp-server.ts`: the two flagship tools over MCP stdio; tenant and scope come from trusted server configuration, never model arguments.
- `src/retrieval.ts`: the Stage 2 lexical seam plus Stage 5 OpenAI embeddings and Qdrant payload-filtered search.
- `src/trace.ts`: redacted OTLP/HTTP JSON export using the OpenTelemetry GenAI 1.42 schema URL.
- `src/state.ts`: just-in-time context assembly, per-step budgeting, and provenance-preserving history compaction.
- `evals/*.json`: local and hosted release-gate cases to expand with representative real-model failures.

## MCP client setup and security gate

Build the local server command into a real client using `starter/mcp-client.example.json`. The default server scope is read-only. A draft remains blocked until the server is relaunched with both the narrow write scope and a trusted approval mode:

```bash
MCP_SCOPES="transfers:read,escalations:draft" \
MCP_WRITE_MODE="dry-run-approved" \
npm run starter:mcp
```

Use `MCP_WRITE_MODE=approved` only for the explicit execution test. The tool arguments cannot grant approval, change the configured tenant, or widen scope. Record a mismatched-tenant denial and a missing-scope denial for lesson 0051.

## Hosted trace gate

Configure one hosted OTLP receiver, then keep it for the course rather than sampling multiple platforms:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://your-hosted-collector.example"
export OTEL_EXPORTER_OTLP_HEADERS="authorization=Bearer ..."
npm run starter:eval:hosted
```

The exporter removes content and authorization attributes. Verify the backend shows run/model IDs, token usage, latency, status, and the failed release case without raw prompt content.

## Stage evidence rule

Every core stage leaves working behavior, one preserved failure, an eval/review result, an operational observation, and a decision record. Starting with Stage 2, **working behavior must include at least one real-model run and redacted real trace alongside deterministic tests**. Link both paths from `evidence/completion-record.md`.

| Stage | Running increment | Evidence directory |
| --- | --- | --- |
| Product foundations | Real provider graduation plus validated triage and bounded tools | `evidence/stage-1/` |
| Grounded retrieval | Local corpus, citations, retrieval cases, and first real trace | `evidence/stage-2/` |
| Controlled workflows | Real model proposals, approval, persistence, and safe resume | `evidence/stage-3/` |
| Production boundaries | Threat/data policies, release gate, queues, SLOs, and budgets | `evidence/stage-4/` |
| Enterprise hardening | Qdrant hybrid retrieval, ACLs, failure analysis, and recovery | `evidence/stage-5/` |
| Portfolio gate | Public case study, demo, video, deep dive, and interview package | `evidence/stage-6/` |
| Agent runtime | Hardened state, memory, orchestration, eval, and tools | `evidence/specialization-agent-runtime/` |
| Real agent stack | LangGraph, MCP, hosted traces/evals, and context tradeoff | `evidence/specialization-real-agent-stack/` |
| Deployment/adoption | Hosted or reproducible release and feedback-driven change | `evidence/stage-8/` |

## Domain substitution rule

The sample resembles fintech/regulated support because consequences, permissions, provenance, and escalation are visible. You may replace it only if the product brief defines equivalent users, authoritative sources, access boundaries, risky actions, failure costs, quality measures, and refusal/escalation behavior.

Implementation examples reviewed 2026-07-20. Provider, framework, MCP, vector-store, and telemetry examples must be rechecked quarterly through `RESOURCES.md`.
