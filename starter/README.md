# Flagship Project: Regulated Support Assistant

This is a deliberately small TypeScript starting point for the course. It removes setup friction without supplying the finished portfolio solution. The initial vertical slice uses a deterministic fake provider, so you can run it without an API key and learn the application contracts before choosing a vendor.

## Run the baseline

From the repository root:

```bash
npm run starter:demo
npm run starter:test
```

Requires Node.js 22 or newer. The project uses Node's built-in TypeScript type stripping and has no install step or third-party runtime dependency.

## What exists at the start

- `src/provider.ts`: provider adapter boundary with typed transient/permanent failures, model version, token budget, and usage.
- `src/triage.ts`: validated structured output for a synthetic support case.
- `src/app.ts`: visible queued/streaming/validating/complete/failed states.
- `src/tools.ts`: mock read/write tools; writes default to dry-run and require approval.
- `src/retrieval.ts`, `src/workflow.ts`, and `src/state.ts`: intentionally small seams for later stages.
- `data/documents.json`: synthetic regulated-domain policy documents—not real customer data or legal advice.
- `evals/*.json`: initial shapes to extend with representative cases.
- `docs/` and `evidence/`: authoritative decisions and proof, not duplicate homework documents.

## How every stage changes this system

| Stage | Running increment | Evidence directory |
| --- | --- | --- |
| Product foundations | Validated triage output, streaming states, bounded mock tools | `evidence/stage-1/` |
| Grounded retrieval | Local corpus, citations, retrieval cases, and traces | `evidence/stage-2/` |
| Controlled workflows | Explicit state, approval, persistence, and safe resume | `evidence/stage-3/` |
| Production boundaries | Threat/data policies, release gate, queues, SLOs, and budgets | `evidence/stage-4/` |
| Enterprise hardening | ACL-aware hybrid retrieval, failure analysis, and recovery | `evidence/stage-5/` |
| Portfolio gate | Defensible product, architecture, eval, and interview package | `evidence/stage-6/` |
| Agent runtime specialization | Hardened state, memory, orchestration, eval, and tools | `evidence/specialization-agent-runtime/` |
| Deployment/adoption | Reproducible release and real-user feedback change | `evidence/stage-8/` |

## Domain substitution rule

The default corpus resembles fintech/regulated support because consequences, permissions, provenance, and escalation are visible. You may replace it if your product brief defines equivalent users, authoritative sources, access boundaries, risky actions, failure costs, quality measures, and refusal/escalation behavior.

## Evidence rule

Every core stage leaves five things: working behavior, one preserved failure, an eval/review result, an operational observation, and a short decision record. Link them from `evidence/completion-record.md`.
