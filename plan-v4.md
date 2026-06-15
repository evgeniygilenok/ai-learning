# AI Engineering Roadmap v4

Current as of 2026-06-15.

This version keeps the lesson sequence from `plan-v3.md`, but turns it into a job-landing plan. The target is still AI Engineer / AI Product Engineer, using your senior TypeScript and product-engineering background. The improvement is that every stage now has visible proof, completion gates, interview material, and job-search actions.

The core principle: build one cumulative AI product system that proves you can ship, measure, secure, operate, and explain AI features. Do not collect disconnected demos.

## What v4 Fixes From v3

`plan-v3.md` is strong on technical sequence. Its main gaps are around employability and proof.

- No explicit timeline or pacing options.
- No clear "done when" gates per stage.
- Not enough focus on deployment, reproducibility, CI, and operational polish.
- Not enough market calibration around applied evals, forward-deployed AI work, enterprise adoption, and workflow integration.
- No job-search track that starts before the curriculum is finished.
- No resume, GitHub, LinkedIn, demo, or interview-story deliverables.
- No role targeting across AI Product Engineer, Applied AI Engineer, Forward-Deployed AI Engineer, AI Platform Engineer, and ML Engineer.
- Not enough practical Python / data handling for evals, ingestion, and analysis.
- Not enough user feedback or domain validation.
- Optional topics like multimodal, fine-tuning, MCP, and provider comparison were not placed in the lesson path.

## Market Calibration

The 2026 hiring bar for applied AI engineering is less about "I can call an LLM" and more about:

- Building useful AI workflows into real products.
- Designing evals that define "good" for a specific use case.
- Shipping guardrails, human review, and tool permissions.
- Debugging traces, latency, cost, and retrieval failures.
- Integrating with existing business systems and domain workflows.
- Explaining risks: prompt injection, data leakage, excessive agency, RAG poisoning, insecure output handling, and operational drift.

External signals used for this v4:

- OpenAI's eval guidance treats evals as an essential component for reliable applications, especially when changing prompts or models: https://developers.openai.com/api/docs/guides/evals
- OpenAI's production guidance emphasizes API key safety, staging projects, rate limits, scaling, latency, cost monitoring, MLOps, and security/compliance: https://developers.openai.com/api/docs/guides/production-best-practices
- OpenAI's Agents SDK guidance positions agent work around orchestration, tool execution, approvals, state, traces, and evaluation: https://developers.openai.com/api/docs/guides/agents
- OWASP's GenAI Security Project keeps the LLM Top 10 as a core security reference for LLM applications: https://owasp.org/www-project-top-10-for-large-language-model-applications/
- NIST's AI Risk Management Framework and Generative AI Profile are useful for regulated or fintech-style risk language: https://www.nist.gov/itl/ai-risk-management-framework
- Recent AI hiring coverage highlights forward-deployed engineering and applied evals as practical enterprise adoption roles, not just model research roles:
  - https://www.businessinsider.com/openai-forward-deployed-engineers-accelerate-ai-projects-2025-7
  - https://www.businessinsider.com/openai-new-applied-evals-team-signal-ai-talent-shift-2025-9

## Target Role

Optimize for these roles first:

- AI Engineer
- AI Product Engineer
- Applied AI Engineer
- Forward-Deployed AI Engineer
- Product-minded Full-Stack Engineer, AI
- AI Platform Engineer for product teams

Do not optimize first for:

- Research Scientist
- Core ML Training Engineer
- GPU Infrastructure Engineer
- Deep Learning Research Engineer

You can still learn ML theory and infrastructure later, but your fastest path to employability is applied AI systems on top of your existing software engineering strength.

## Time Budget

Use one of these tracks.

| Weekly time | Core job-ready path | With agent runtime specialization | Best use |
| --- | --- | --- | --- |
| 5 hours/week | 5-6 months | 6-8 months | Sustainable side project pace |
| 8-10 hours/week | 12-16 weeks | 16-20 weeks | Recommended default |
| 15 hours/week | 8-10 weeks | 12-14 weeks | Focused sprint |

Start job-market activity before the plan is finished:

- After Stage 2: start warm conversations and collect job descriptions.
- After Stage 4: start selective applications.
- After Stage 6: apply consistently.
- After Stage 8: target senior or stronger AI roles with a polished proof package.

## Roadmap At A Glance

| Stage | Time | Lessons | Focus | Job Proof |
| --- | --- | --- | --- | --- |
| 0 | 1-2 days | 0001, 0036 | Orientation and role targeting | Target-role brief |
| 1 | 1-2 weeks | 0002-0005 | LLM product foundations | Product triage assistant |
| 2 | 2-3 weeks | 0006-0009 | RAG, retrieval evals, tracing | Cited knowledge assistant |
| 3 | 1-2 weeks | 0010-0012 | Controlled workflow agents | Dry-run coding workflow |
| 4 | 2-3 weeks | 0013-0020 | Production readiness | Design docs, threat model, eval gates |
| 5 | 2-3 weeks | 0021-0025 | Advanced RAG and agent reliability | Measured enterprise assistant |
| 6 | 1-2 weeks | 0026-0030 | System design and interview packaging | Portfolio proof package |
| 7 | 2-4 weeks | 0031-0035 | Agent runtime specialization | Resumable tool-using runtime |
| 8 | 1-2 weeks | 0039-0040 | Deployment and adoption | Live/reproducible demo plus feedback |
| 9 | Ongoing | 0041 | Job search and interview loop | Applications, referrals, interviews |

## Portfolio North Star

Build one flagship repository with three visible slices:

1. Product Triage Assistant
   - Shows model calls, streaming, structured outputs, tool boundaries, UX states, and cost awareness.

2. Enterprise Knowledge Assistant
   - Shows ingestion, RAG, citations, retrieval evals, ACLs, tracing, data retention, and security controls.

3. Controlled Workflow Agent Runtime
   - Shows orchestration, state, memory, approvals, validated tool execution, recovery, and agent evals.

The repository should prove four things:

- Demo proof: a reviewer can run or watch it.
- Quality proof: evals show what improved and what regressed.
- Operations proof: traces, logs, latency, cost, queues, and deployment choices are visible.
- Security proof: threat model, data boundaries, redaction, tool permissions, and human approvals are documented.

## Stage 0: Orientation And Job Targeting

Lessons:

- 0001: AI Engineering Map
- 0036: Target Role Skill Matrix

Build:

- Create a short `docs/target-role.md` in the portfolio repo.
- Pick 2-3 target job titles.
- Save 10 real job descriptions or summaries.
- Extract recurring requirements into a skill matrix.

Learn:

- What changes when software includes probabilistic model calls.
- The six product contracts: input, context, model, output, action, quality/safety.
- Where your existing senior engineering background transfers directly.

Done when:

- You can explain why you are targeting AI Product Engineer / Applied AI Engineer rather than ML Research.
- You have a personal skill matrix with columns: requirement, proof artifact, status, next action.

Job action:

- Create a short positioning sentence:
  "Senior TypeScript/product engineer moving into applied AI systems: RAG, evals, agents, observability, security, and production workflows."

## Stage 1: LLM Product Foundations

Lessons:

- 0002: Anatomy Of A Model Call
- 0003: Structured Outputs
- 0004: Streaming UX
- 0005: Tool Calling Boundaries

Build:

- Product triage assistant.
- Input: messy product request.
- Output: structured brief with summary, assumptions, risks, next question, suggested next action, and confidence.
- Add streaming UI states.
- Add a dry-run tool boundary for actions like "create ticket" or "search docs".
- Add basic request logging: model, latency, token estimate, cost estimate, validation success, failure reason.

Learn:

- Model calls as application boundaries.
- Schemas as product contracts.
- Streaming as UX, not just decoration.
- Tool calling as a model request, while tool execution remains application-owned.

Done when:

- The app runs from a clean setup command.
- Structured outputs are validated.
- Tool calls cannot execute side effects without an application check.
- At least 20 saved examples exist, including messy, ambiguous, and adversarial inputs.
- The README explains the input, output, action, and quality contracts.

Job proof:

- Screenshot or short demo clip.
- `docs/architecture-stage-1.md`.
- `evals/product-triage-cases.jsonl` with expected fields and pass/fail criteria.

## Stage 2: RAG, Retrieval Evals, And Tracing

Lessons:

- 0006: Semantic Search Starts With Chunks
- 0007: RAG Context Packets
- 0008: Retrieval Evals
- 0009: Tracing AI Runs

Build:

- Upgrade into a knowledge assistant over a small local document corpus.
- Use a corpus that supports your job target. Fintech-style docs are a good fit: policies, product docs, onboarding guides, mock compliance notes, or support playbooks.
- Add ingestion records: source, chunk id, title, section, permissions, timestamp, checksum.
- Add cited answers with answerability behavior.
- Add retrieval evals with golden questions and expected source ids.
- Add traces for model call, retrieval, context packet, validation, and final answer.

Learn:

- Chunking, metadata, embeddings, context packets, citations, retrieval evals, and trace debugging.
- Why RAG reduces some hallucination risks but does not magically guarantee truth.

Done when:

- At least 50 chunks exist with metadata.
- At least 30 golden questions exist.
- You can report hit rate, citation correctness, answerability handling, p50/p95 latency, and rough cost per query.
- You have at least 5 documented failure cases and fixes.

Job proof:

- `docs/rag-design.md`.
- `docs/retrieval-eval-report.md`.
- Trace screenshots or exported JSON for 3 successful and 3 failed runs.

## Stage 3: Controlled Workflow Agents

Lessons:

- 0010: Controlled Workflow Agents
- 0011: Memory And Persistence
- 0012: Model Routing And Caching

Build:

- Add a dry-run coding workflow agent:
  - read a ticket
  - ask clarifying questions
  - plan changes
  - identify likely files
  - suggest tests
  - prepare a PR checklist
- Persist workflow state and decisions.
- Add simple model routing for cheap, normal, and high-reasoning steps.
- Add safe caching for deterministic or low-risk steps only.

Learn:

- Agent behavior as explicit workflow/state machine design.
- Memory as governed state, not a vague chat transcript.
- Routing by cost, latency, risk, and required intelligence.

Done when:

- A workflow can pause and resume.
- Every tool/action has permission scope, input validation, and dry-run output.
- The system has stop conditions and retry limits.
- At least 15 workflow test cases cover happy path, ambiguity, unsafe action, timeout, and invalid tool output.

Job proof:

- `docs/workflow-agent-design.md`.
- State diagram.
- Demo of a paused/resumed run.

## Stage 4: Production Readiness

Lessons:

- 0013: Multi-Tenant AI Architecture
- 0014: AI Security Threat Model
- 0015: Portfolio System Design Story
- 0016: Eval Release Gates
- 0017: LLM-As-Judge Tradeoffs
- 0018: Queues And Background Jobs
- 0019: Data Retention And Redaction
- 0020: AI Infrastructure Decisions

Build:

- Add a system design story for the cumulative app.
- Add a threat model using OWASP LLM categories where relevant.
- Add eval release gates for prompts, retrieval, and tool behavior.
- Move ingestion, eval runs, or long workflows into background jobs.
- Add data retention and redaction policy.
- Add staging vs production configuration, even if production is simulated.
- Add CI that runs unit tests, schema tests, and a small eval smoke test.

Learn:

- Tenant isolation across prompts, retrieval, memory, traces, caches, tools, and jobs.
- Prompt injection, sensitive information disclosure, excessive agency, RAG poisoning, insecure output handling, and unbounded consumption.
- Eval gates that can block a release.
- Queues, cost controls, latency budgets, and operational tradeoffs.

Done when:

- `npm test` or equivalent runs core checks.
- A small eval gate fails the build on a known bad prompt/retrieval/tool variant.
- Secrets are not in code.
- Data retention and redaction rules are documented and applied to traces/logs.
- You can explain what would change for a real multi-tenant SaaS or fintech environment.

Job proof:

- `docs/system-design-story.md`.
- `docs/threat-model.md`.
- `docs/eval-release-gates.md`.
- `docs/data-retention-redaction.md`.
- CI screenshot or logs.

## Stage 5: Advanced RAG And Agent Reliability

Lessons:

- 0021: Ingestion Pipeline Design
- 0022: Metadata Filters And ACL
- 0023: Hybrid Search And Reranking
- 0024: Agent Retry And Recovery
- 0025: Agent Evaluation

Build:

- Harden the knowledge assistant:
  - ingestion status
  - metadata filters
  - ACL-aware retrieval before context enters the prompt
  - hybrid search or reranking
  - stale-source handling
- Harden the workflow agent:
  - retry budgets
  - recovery paths
  - partial success handling
  - trace-based evals

Learn:

- Search quality as a measurable system property.
- Permissions before prompt construction.
- Agent reliability by trace path, not only final answer.

Done when:

- Retrieval evals compare at least two retrieval strategies.
- ACL tests prove unauthorized chunks do not enter the context packet.
- Agent evals check transitions, tool calls, approvals, memory writes, and recovery.
- You can show a before/after table with quality, latency, and cost tradeoffs.

Job proof:

- `docs/search-experiment-report.md`.
- `docs/agent-reliability-report.md`.
- A metrics table in the README.

## Stage 6: System Design And Interview Packaging

Lessons:

- 0026: AI Support Assistant Design
- 0027: Enterprise RAG Design
- 0028: Coding Copilot Design
- 0029: Personal Assistant Agent Design
- 0030: Final Portfolio And Interview Drill

Build:

- Package the project into four kinds of proof:
  - demo proof
  - quality proof
  - operations proof
  - security proof
- Prepare system design walkthroughs for:
  - AI support assistant
  - enterprise RAG assistant
  - coding copilot
  - personal assistant agent
- Create a 3-minute demo script and a 10-minute deep-dive script.
- Update resume, LinkedIn, and GitHub profile around the portfolio evidence.

Learn:

- How to whiteboard AI systems under latency, cost, trust, permissions, and quality constraints.
- How to turn project work into interview evidence.

Done when:

- The README has a clear "Why this matters", "Architecture", "Evals", "Security", "Run locally", and "Demo" section.
- You can explain 3 technical tradeoffs without reading notes.
- You have 6 STAR stories:
  - ambiguous requirement
  - production failure/debugging
  - quality regression
  - security/risk decision
  - product tradeoff
  - leadership/collaboration

Job proof:

- Resume bullets tied to metrics and artifacts.
- Portfolio README.
- Demo video or runnable deployment.
- Interview answer bank.

## Stage 7: Agent Runtime Specialization

Lessons:

- 0031: Agent Orchestration Patterns
- 0032: Agent State Management
- 0033: Agent Memory Design
- 0034: Agent Evaluation Harness
- 0035: Tool Execution Runtime

Reference:

- `reference/agent-runtime-reference.html`

Build:

- Turn the dry-run workflow agent into a small runtime:
  - resumable runs
  - explicit orchestration choice
  - persisted state ledger
  - memory write policy
  - trace-based eval harness
  - validated tool execution path
  - approval gates for risky actions
  - idempotency and audit logs

Learn:

- When to use explicit workflows, manager tools, handoffs, or background runs.
- Run ledgers for state, facts, approvals, budgets, and trace pointers.
- Tool execution as backend code.

Done when:

- A failed run can resume without losing approved state.
- Tool execution is authorized, validated, idempotent, audited, and test-covered.
- The eval harness can replay at least 10 traces.
- You can explain when not to use an autonomous agent.

Job proof:

- `docs/agent-runtime-design.md`.
- `docs/tool-execution-safety.md`.
- Replayable traces.

## Stage 8: Deployment And Adoption Sprint

This is new in v4. It exists because employers trust shipped proof more than local-only proof.

Lessons:

- 0039: Deployable AI Portfolio
- 0040: Adoption Feedback Loop

Build:

- Deploy the app or provide a frictionless local run path with Docker.
- Add seed data and a demo mode that does not require private API keys for every screen.
- Add health checks and basic observability.
- Add a small admin/debug page or exported report showing recent runs, eval results, cost, latency, and failures.
- Ask 3-5 engineers or product people to try it.
- Record feedback and fix the top 3 issues.

Done when:

- A reviewer can understand the project in 5 minutes.
- A reviewer can run it in 15 minutes.
- The demo does not depend on fragile hidden state.
- At least 3 external feedback notes are captured.
- The top 3 confusing UX or setup issues are fixed.

Job proof:

- `docs/adoption-feedback.md`.
- Deployed link or Docker instructions.
- Final demo video.

## Stage 9: Job Search And Interview Loop

This runs in parallel after Stage 2.

Lessons:

- 0041: AI Job Search Loop

Weekly actions:

- Save 5 job descriptions and update the skill matrix.
- Contact 3 people: AI engineers, hiring managers, founders, ex-colleagues, or community members.
- Apply to 3-5 targeted roles once Stage 4 is complete.
- Apply to 8-12 targeted roles once Stage 6 is complete.
- Do one interview drill: system design, eval debugging, project walkthrough, or behavioral story.

Search terms:

- AI Engineer
- Applied AI Engineer
- AI Product Engineer
- Forward-Deployed AI Engineer
- Full-Stack AI Engineer
- GenAI Engineer
- LLM Engineer
- AI Platform Engineer
- RAG Engineer
- Agent Engineer
- Developer Productivity AI Engineer

Application filter:

- Strong fit: product engineering plus LLMs, RAG, evals, agents, workflow automation, enterprise tools, fintech, developer tools, support automation, knowledge systems.
- Medium fit: ML platform with some app work.
- Weak fit for this plan: model training, CUDA kernels, research publications, data science-only dashboards.

Resume positioning:

- Lead with senior software engineering plus applied AI systems.
- Avoid overclaiming ML research depth.
- Show shipped system qualities: evals, tracing, security, cost, latency, state, approvals, deployment.

Interview loop:

- 10-minute portfolio walkthrough.
- 45-minute AI system design.
- 30-minute RAG/evals debugging drill.
- 30-minute agents/tool safety drill.
- Standard senior software interview refresh as needed.

## Skill Gap Remediation

These are not full detours. They are "learn enough to support the portfolio" tracks.

### Practical Python

Why:

- Many AI eval, data, and notebook tools are Python-first.

Lesson:

- 0037: Practical Eval Data Analysis

Learn enough to:

- Parse JSONL/CSV.
- Run simple eval scripts.
- Analyze failures with pandas or equivalent.
- Call model APIs.
- Generate reports.

Done when:

- One eval report is generated by a Python script, even if the main app is TypeScript.

### SQL And Data Modeling

Why:

- RAG, traces, memory, evals, jobs, and tenants all become data modeling problems.

Learn enough to:

- Model runs, messages, chunks, sources, eval cases, tool calls, approvals, memories, and tenants.
- Query failures by prompt version, model, retrieval strategy, user, or tenant.

Done when:

- You can answer "what changed?" using stored traces and eval data.

### Deployment And CI

Why:

- A job-ready project needs reproducibility.

Learn enough to:

- Containerize the app.
- Configure env vars safely.
- Run tests in CI.
- Separate local, staging, and production config.
- Add rate/cost safeguards.

Done when:

- A clean machine can run the project from documented steps.

### Product And Domain Depth

Why:

- Applied AI roles reward people who define "good" in context.

Learn enough to:

- Pick a realistic workflow.
- Define business/user success criteria.
- Explain what risk is unacceptable.
- Write eval rubrics from domain expectations.

Done when:

- Your evals are not generic. They reflect a specific workflow and user type.

### Provider Literacy And Tool Ecosystem

Why:

- AI engineers need to avoid being locked into one vendor's mental model, while still shipping with one default stack.

Lesson:

- 0038: Provider Comparison And Tool Ecosystem

Learn enough to:

- Compare OpenAI, Anthropic, Gemini, and one local/open model on the same small task.
- Record quality, latency, cost, structured-output reliability, tool-calling behavior, and developer ergonomics.
- Understand when MCP or connector-style tools are useful, and what new security boundaries they introduce.

Done when:

- You have a `docs/provider-comparison.md` note with one practical recommendation for your portfolio system.
- You can explain why you chose the default model/provider and what would make you switch.

### Optional Multimodal Or Voice Extension

Why:

- Useful signal, but only after the core system is strong.

Good options:

- Add document screenshot/image ingestion with citation constraints.
- Add voice input for the triage assistant.
- Add speech output for summaries.

Done when:

- The feature has one eval or quality check and does not distract from the main portfolio.

### Optional Fine-Tuning Or Customization

Why:

- Interviewers may ask when to fine-tune versus use RAG or prompting.

Do this only after Stage 5:

- Write a decision memo comparing prompting, RAG, reranking, fine-tuning, and tool use.
- Optionally run a tiny fine-tuning experiment if it directly improves classification, extraction, or style.

Done when:

- You can explain why fine-tuning was or was not the right tool.

## Weekly Cadence

Recommended 8-10 hour week:

- 2 hours: one lesson plus notes.
- 4 hours: build one portfolio increment.
- 1 hour: eval, trace, or security improvement.
- 1 hour: documentation and interview story capture.
- 1 hour: market scan, outreach, or application prep.

Each week must produce at least one of:

- working feature
- eval case/report
- trace/debugging note
- design doc
- security control
- deployment improvement
- interview artifact

## Evidence Matrix

Use this matrix to make the project legible to hiring teams.

| Job requirement | Portfolio evidence |
| --- | --- |
| LLM API integration | Product triage assistant with validated structured outputs |
| Streaming UX | Streaming states and failure recovery |
| RAG | Knowledge assistant with chunks, metadata, citations |
| Retrieval quality | Golden questions, expected source ids, hit-rate report |
| Observability | Traces for retrieval, model calls, validation, tool calls |
| Evals | CI eval gate and before/after reports |
| Agents | Controlled workflow with state, approvals, retries |
| Tool safety | Validated, authorized, audited tool execution |
| Security | OWASP-style threat model and mitigations |
| Multi-tenancy | Tenant boundary design across retrieval, memory, traces, jobs |
| Cost/latency | Metrics table and routing/caching decisions |
| Production readiness | Deployment, Docker or hosted demo, CI, env config |
| Product judgment | Domain workflow, user feedback, adoption notes |
| Senior communication | System design docs and interview walkthroughs |

## Interview Readiness Checklist

You should be able to explain:

- What changes when software contains probabilistic model calls.
- Why structured outputs are product contracts.
- RAG versus fine-tuning versus prompt engineering.
- Chunking, embeddings, hybrid search, reranking, and retrieval evaluation.
- Why citations help but do not guarantee correctness.
- How tracing makes AI failures debuggable.
- Tool calling versus tool execution.
- Agent loops versus explicit workflows.
- State, memory, persistence, and resumability.
- Eval gates and LLM-as-judge tradeoffs.
- Prompt injection, data leakage, RAG poisoning, excessive agency, insecure output handling, and tool abuse.
- Latency, cost, model routing, caching, queues, and graceful degradation.
- Multi-tenant boundaries across retrieval, memory, traces, jobs, and tools.
- How you would scale the system from demo to production.
- What you would not automate with an LLM.

You should also be able to perform:

- Debug a bad RAG answer from trace to root cause.
- Design an eval for a new workflow.
- Decide whether to use RAG, fine-tuning, tools, or a workflow.
- Threat-model an agent with write access.
- Explain a cost/latency tradeoff.
- Walk through a production incident involving model behavior drift.

## First 7 Days

Day 1:

- Re-read `MISSION.md`.
- Read Lesson 0001.
- Write the target-role sentence.

Day 2:

- Collect 10 job descriptions.
- Create the skill matrix.
- Pick the portfolio domain.

Day 3:

- Start Lesson 0002.
- Scaffold the product triage assistant.

Day 4:

- Add structured output schema.
- Save 10 messy product requests as examples.

Day 5:

- Add streaming UX states.
- Add basic logging.

Day 6:

- Add dry-run tool boundary.
- Write the first README section.

Day 7:

- Review what is unclear.
- Create the first eval cases.
- Write a short learning record if your understanding of AI engineering changed.

## Decision Rules

- Prefer TypeScript for the main app.
- Use Python only where it improves evals, data analysis, or tooling.
- Use one vector database first. Do not compare five.
- Use managed model APIs first. Do not self-host until a job target requires it.
- Add frameworks when the app needs them. Do not let framework learning replace product learning.
- Every new AI feature gets at least one eval, trace, or security note.
- Every major portfolio claim needs evidence in the repo.
- Start applying before you feel fully ready. Use interviews as feedback, not as final exams.

## Finish Line

The finish line is not "completed 35 lessons."

The finish line is:

- A working AI product system.
- A clean portfolio repo.
- A demo that makes sense quickly.
- Evals that define and measure quality.
- Traces that debug failures.
- Security controls that show judgment.
- Deployment or reproducible local setup.
- Interview stories that connect your senior engineering background to AI product work.
- A steady job-search loop with targeted applications and human conversations.

When those are true, you are no longer only learning AI engineering. You are presenting yourself as someone already doing applied AI engineering.
