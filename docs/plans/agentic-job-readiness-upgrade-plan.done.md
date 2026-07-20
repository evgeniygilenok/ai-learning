# Agentic Job-Readiness Course Upgrade Plan

**Prepared:** 2026-07-20
**Scope:** Documentation and curriculum plan only; no course implementation is included in this change.
**Learner profile:** 8 years of software engineering experience (TypeScript, frontend architecture, some backend), basic agentic AI knowledge, targeting agentic AI / AI agent engineering roles.

## Objective

Upgrade the existing Applied AI Engineering course so that completing it produces a hireable agentic AI engineer, not just a well-read one. The course must graduate from deterministic simulations to real models, add the framework and protocol experience that 2026 job postings screen for, surface the work publicly, and re-sequence the path so agentic content arrives early for an experienced engineer.

## Verdict on the Current Course

The course is conceptually excellent and current (last reviewed 2026-07-17). Its topic coverage maps almost one-to-one onto what agentic hiring loops probe: eval design and golden datasets (lessons 0008, 0016-0017, 0025, 0034), tool-call guardrails with retries/timeouts/idempotency (0005, 0024, 0035), state and checkpointing (0011, 0032), orchestration patterns (0031), OWASP LLM 2025 and MCP threat modeling (0014), cost and routing (0012). The stage-gate structure, evidence bundles, artifact rubric, and completion record in `courses/applied-ai-engineering.html` are stronger than most paid courses.

The fatal flaw for the job-search goal: **the entire course can be completed without ever calling a real LLM, using a real agent framework, or shipping anything publicly visible.** The portfolio it produces is exactly the "toy demo" hiring managers say they screen out.

## Current-State Findings

1. **No real model anywhere.** `starter/src/provider.ts` contains only `FakeModelProvider`, which returns canned JSON deterministically. No lesson swaps in a real provider. `starter/README.md` frames the fake provider as the starting point, but the course never graduates from it.
2. **The "agent" has no model in the loop.** `starter/src/workflow.ts` is an 11-line hand-written state machine; transitions are driven by hardcoded events, never by model output. The learner never experiences non-determinism, a real tool-calling loop, real latency/token costs, prompt iteration, or an actual hallucination.
3. **No named framework.** The course is deliberately vendor-neutral. 2026 market data (reviewed 2026-07): LangGraph appears in ~22% of agentic postings and is the enterprise default for stateful agents; OpenAI Agents SDK ~12%; MCP integration ~18% and climbing fastest. Framework-agnostic seniors command the top pay band, but only on the strength of production experience the learner does not yet have.
4. **MCP is prose-only.** MCP appears in `RESOURCES.md` and lesson 0014's threat model, but nothing is ever built with it. MCP server authoring carries a +$15-35K salary signal.
5. **Agentic content arrives too late.** Agent runtime is stage 7 and workflow specialization is stage 11 in `assets/curriculum.mjs`, behind ~85-120 hours of core. Much of stage 4 (queues 0018, infra 0020, multi-tenancy 0013) is standard senior engineering an 8-year engineer already knows.
6. **Nothing is publicly visible.** All evidence lands in `starter/evidence/` markdown files. Lesson 0039 covers reproducibility, not visibility. No requirement for a public repo, hosted demo, demo video, or written deep dives.
7. **Hand-rolled tooling only.** `starter/src/trace.ts` is custom. Postings name LangSmith, Braintrust, Langfuse, Arize, and OpenTelemetry GenAI conventions. Braintrust is already listed in `RESOURCES.md` but never used.
8. **Context engineering is under-taught.** Cited in lesson 0043 via the Anthropic article, but no lesson implements compaction, history summarization, or per-step token budgeting.
9. **Retrieval has no real backing store.** `starter/src/retrieval.ts` is an intentionally small in-memory seam over `starter/data/documents.json`. Postings name pgvector, Qdrant, and Pinecone.
10. **Orientation matrix is a stub.** `starter/evidence/orientation/role-proof-matrix.md` has two placeholder rows and defers posting collection to the learner without making it a gate.
11. **TypeScript-only is an unexamined default.** It matches the learner's background and the AI Product Engineer role family, and LangGraph has a solid TS SDK, but a large share of agentic postings are Python-first.

## Ordered Implementation Plan

### P0-1: Graduate to a Real Provider

**Affected:** `starter/src/provider.ts`, lesson 0002, stage contracts in `assets/curriculum.mjs`, `courses/applied-ai-engineering.html`, `starter/README.md`.

1. Add a Stage 1 exit milestone: implement a real `ModelProvider` (OpenAI or Anthropic) behind the existing `ModelProvider` interface, with env-based key handling and a small documented spend budget.
2. Keep `FakeModelProvider` for deterministic tests; the real provider becomes the default demo path.
3. From Stage 2 onward, require every stage gate and evidence bundle to include at least one real-model run and trace alongside the deterministic tests.
4. Update the evidence-bundle definition ("working behavior") in the course page to state that working behavior means real-model behavior once Stage 1 is passed.

**Done when:** a clean checkout with an API key runs the triage flow against a real model, and every stage-2+ evidence bundle contains a real trace.

### P0-2: Put the Model in the Agent Loop

**Affected:** `starter/src/workflow.ts`, `starter/src/tools.ts`, lessons 0010, 0024, 0031, 0035.

1. Rework the Stage 3 and Stage 7 builds so the LLM proposes tool calls and the runtime enforces the existing policy/approval/idempotency gates. The taught contracts stay identical; they get exercised by a real, misbehaving model.
2. Update lesson 0010's build assignment to require one observed real-model deviation (wrong tool, malformed args, or premature termination) captured as the preserved failure.

**Done when:** the controlled workflow's transitions are driven by real model output and the approval boundary has blocked at least one real proposed write.

### P0-3: Publish an Agentic-First Traversal Order

**Affected:** `courses/applied-ai-engineering.html` (new section), optionally `index.html`.

1. Add an "experienced-engineer agentic track" alongside the default pacing: orientation → foundations (compressed) → controlled workflows → agent runtime (0031-0035) → framework/MCP modules (P1 below) → agent evaluation (0025, 0034, 0037) → portfolio gate → deployment.
2. Mark lessons 0013, 0018, and 0020 as "diff what's AI-specific" reviews for senior engineers rather than full builds; keep their gates.
3. Keep all existing lesson URLs and stage definitions; this is an overlay, not a restructure.

**Done when:** a senior learner can see the compressed agentic-first order and its expected ~10-12 week / 8-10 h-week workload from the course page.

### P1-4: Framework Immersion Module (LangGraph)

**Affected:** new lesson (suggested 0050), `assets/curriculum.mjs`, `courses/agentic-workflow-engineering.html` or a new specialization slot, `RESOURCES.md`.

1. Rebuild the flagship controlled workflow on LangGraph with a Postgres-backed checkpointer.
2. Produce a decision record comparing the hand-rolled runtime to the framework build: state persistence, interrupts/approvals, recovery, observability, and cost of adoption. This doubles as an interview story.
3. Decide language here (see open question 1); LangGraph supports both TS and Python.

**Done when:** the same approval-pause-resume gate from Stage 3 passes on the LangGraph build, and the decision record scores level 3+ on the course rubric.

### P1-5: MCP Server Authoring Module

**Affected:** new lesson (suggested 0051), `starter/src/tools.ts`, lesson 0014 cross-links, `RESOURCES.md`.

1. Wrap the existing `lookupTransfer` and `draftEscalation` tools as an MCP server, preserving dry-run and approval semantics.
2. Connect it to a real client (Claude Desktop/Code or Cursor).
3. Run the confused-deputy and scope-minimization tests from lesson 0014 against the live server and record results.

**Done when:** a real MCP client invokes the flagship tools, and an unauthorized or over-scoped call fails closed with evidence.

### P1-6: Hosted Observability and Evals

**Affected:** `starter/src/trace.ts`, lessons 0009 and 0034, `starter/evals/*.json`.

1. Export existing traces via OpenTelemetry GenAI conventions or wire the flagship into Braintrust or LangSmith (one, not all).
2. Port one existing eval suite (`starter/evals/agent-cases.json` or `retrieval-cases.json`) to the hosted platform and gate one release decision on it.

**Done when:** a failed real-model run can be diagnosed in the hosted tool, and one eval regression is caught there.

### P1-7: Context Engineering Lesson

**Affected:** lesson 0033 (extend) or new lesson, `starter/src/state.ts`.

1. Implement compaction/summarization on an agent run long enough to need it: history summarization, per-step token budgeting, just-in-time context assembly.
2. Measure the tradeoff: tokens saved versus outcome quality on the same eval cases.

**Done when:** the agent completes a task that exceeds a single context window, with measured before/after token and quality numbers.

### P2-8: Public Portfolio Deliverables

**Affected:** lessons 0039 and 0041, stage 6 and 8 gates in `assets/curriculum.mjs`, `reference/ai-engineering-job-readiness.html`.

1. Add required public deliverables: public GitHub repo with a case-study README, hosted demo (auth-gated is acceptable), a 3-minute demo video, and one written deep dive (the eval or recovery story is the strongest material).
2. Add these to the proof-package checklist in the job-readiness reference.

**Done when:** a recruiter with only a link can watch the demo, read the case study, and inspect the repo.

### P2-9: Real Posting-Driven Orientation

**Affected:** lesson 0036, `starter/evidence/orientation/role-proof-matrix.md`.

1. Make the orientation gate require collecting 15-20 live postings for AI Agent Engineer / Agentic AI Engineer / AI Product Engineer (agents) titles and re-deriving the matrix from them.
2. Replace the two placeholder rows with the derived requirements.

**Done when:** every matrix row cites a real posting requirement with a date and source.

### P2-10: Real Vector Store in Enterprise Retrieval

**Affected:** `starter/src/retrieval.ts`, lessons 0021-0023.

1. Back the Stage 5 hybrid-retrieval work with pgvector or Qdrant instead of the in-memory seam.
2. Keep the in-memory path for the Stage 2 minimum-viable pass.

**Done when:** the Stage 5 retrieval tradeoff table is produced against a real vector store.

## Decisions and Assumptions

- **Decision:** Keep the fake provider for deterministic tests and early lessons; add the real provider as a graduation step rather than replacing it.
- **Decision:** Keep the regulated/fintech flagship domain; it carries a hiring premium for agentic roles in regulated industries.
- **Decision:** Keep the vendor-neutral contracts in lesson prose; framework and platform work are additive modules with review dates, consistent with the existing quarterly source review policy in `RESOURCES.md`.
- **Decision:** Prefer LangGraph for framework immersion (largest enterprise share for stateful agents); OpenAI Agents SDK is the fallback if the learner's target employers run it.
- **Assumption:** Existing lesson URLs and stage IDs in `assets/curriculum.mjs` remain stable; new lessons append as 0050+.
- **Assumption:** A small real-API spend budget (tens of dollars over the course) is acceptable.

## Risks

- Real-provider dependence makes lessons vulnerable to API changes; mitigate by keeping the provider boundary and the existing quarterly review checklist.
- Adding framework/MCP/platform modules grows total workload; the agentic-first traversal and "diff what's AI-specific" reviews must offset this, or the course silently becomes 200+ hours.
- Hosted platforms (Braintrust/LangSmith) have free-tier limits and changing UIs; teach the exported-trace concepts as durable, treat the platform steps as review-dated examples.

## Open Questions

1. **Language for framework immersion:** TypeScript (matches background and course default, narrower job funnel) or Python (wider agentic-posting funnel, new toolchain). Recommendation: decide after the posting collection in P2-9; if 15+ of 20 collected postings are Python-first, do the LangGraph module in Python.
2. **Where new lessons live:** extend the agent-runtime specialization (stage 7) or create a new "real-world agent stack" specialization stage. Recommendation: new stage, so the existing stage gates stay unchanged.

## Final Completion Gate

The upgrade is complete when:

- Every core stage from Stage 2 onward has real-model evidence in its bundle.
- The flagship workflow is driven by real model output through the existing policy gates.
- The learner has one framework build (with decision record), one working MCP server, and one hosted-platform eval/trace integration.
- The portfolio is publicly reachable: repo, demo, video, and one deep dive.
- The role-proof matrix is derived from real, dated postings.
- The agentic-first traversal is documented on the course page with realistic workload numbers.
