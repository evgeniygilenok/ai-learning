# AI Engineering Roadmap v3

This version treats the updated lesson catalog as the source of truth. `plan-v2.md` described the conceptual path; `plan-v3.md` maps that path onto the actual lessons now in `./lessons`.

The core idea is unchanged: become an AI Engineer / AI Product Engineer by building reliable AI product systems, not by collecting disconnected AI demos. The shape is now more explicit: first learn the contracts, then build RAG, then add evals, security, infrastructure, system design, and finally a deeper agent runtime.

## What Changed From v2

- Use the numbered lesson structure as the roadmap spine.
- Split the first 30 lessons into a complete AI engineering path, then treat lessons 0031-0035 as an agent runtime specialization.
- Make portfolio work continuous, not a final cleanup step.
- Keep evaluation, tracing, security, and data controls close to the features they protect.
- Treat "agents" in two passes: first as controlled workflows, then as resumable runtimes with state, memory, evals, and tool execution.

## Roadmap At A Glance

| Stage | Lessons | Focus | Portfolio Artifact |
| --- | --- | --- | --- |
| 0 | 0001 | Orientation | AI product contract map |
| 1 | 0002-0005 | LLM product foundations | Thin product triage assistant |
| 2 | 0006-0009 | RAG, retrieval evals, tracing | Knowledge assistant slice |
| 3 | 0010-0012 | Controlled agents, memory, routing | Dry-run workflow agent |
| 4 | 0013-0020 | Architecture, security, eval gates, ops | Production readiness package |
| 5 | 0021-0025 | Advanced RAG and agent reliability | Measured enterprise assistant |
| 6 | 0026-0030 | System design and interview packaging | Portfolio narrative |
| 7 | 0031-0035 | Agent runtime specialization | Resumable tool-using agent runtime |

## Stage 0: Orientation

Lessons:
- 0001: AI Engineering Map

Learn:
- What changes when software includes probabilistic model calls.
- The six product contracts: input, context, model, output, action, quality/safety.
- How the roadmap fits the target role: AI Engineer / AI Product Engineer.

Outcome:
- You can explain the difference between "calling an LLM" and shipping an AI product feature.
- The glossary becomes the shared vocabulary for later lessons.

## Stage 1: LLM Product Foundations

Lessons:
- 0002: Anatomy of a Model Call
- 0003: Structured Outputs
- 0004: Streaming UX
- 0005: Tool Calling Boundaries

Learn:
- Model calls as application boundaries.
- Request shape, instructions, parameters, output handling, and telemetry.
- Structured outputs as product data contracts.
- Streaming states and failure recovery.
- Tool calling as a request from the model, not permission to act.

Portfolio build:
- Build a product triage assistant.
- It should accept a messy product request and return a structured brief with summary, assumptions, risks, next question, and suggested next action.
- Add streaming for user experience.
- Add a dry-run tool boundary for actions like "create ticket" or "search docs".

Outcome:
- A small TypeScript app that feels like product software rather than a notebook.

## Stage 2: RAG, Retrieval Evals, And Tracing

Lessons:
- 0006: Semantic Search Starts With Chunks
- 0007: RAG Context Packets
- 0008: Retrieval Evals
- 0009: Tracing AI Runs

Learn:
- Chunk records, metadata, and embedding-ready document structure.
- Context packets with evidence, citations, permissions, and answer rules.
- Golden questions and source expectations for retrieval quality.
- Tracing prompts, retrieved chunks, validation, latency, and usage.

Portfolio build:
- Upgrade the assistant into a small knowledge assistant over local docs.
- Add cited answers.
- Add a tiny retrieval eval set.
- Add traces for model call, retrieval, validation, and final answer.

Outcome:
- You can tell whether retrieval improved, degraded, or merely felt better.

## Stage 3: Controlled Workflow Agents

Lessons:
- 0010: Controlled Workflow Agents
- 0011: Memory And Persistence
- 0012: Model Routing And Caching

Learn:
- Agent behavior as explicit state machines.
- Approval gates, stop conditions, and scoped autonomy.
- Memory as persisted state with purpose, provenance, visibility, and retention.
- Routing by risk, latency, cost, and required intelligence.
- Caching only where reuse is safe.

Portfolio build:
- Add a dry-run coding workflow agent:
  - read a ticket
  - ask clarifying questions
  - plan changes
  - identify likely files
  - suggest tests
  - prepare a PR checklist
- Persist workflow state and decisions.
- Add simple model routing for cheap versus expensive steps.

Outcome:
- A controlled workflow system, not a loose chatbot with tools.

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

Learn:
- Tenant isolation across prompts, retrieval, memory, traces, caches, tools, and jobs.
- AI-specific threat modeling.
- Eval gates that can ship, block, or route to review.
- When LLM judges help and when exact code checks are better.
- Queueing slow AI work out of the request path.
- Retaining enough data to debug without hoarding sensitive data.
- Choosing managed APIs, gateways, containers, or self-hosting based on constraints.

Portfolio build:
- Write a system design story for the cumulative app.
- Add a threat model.
- Add release gates for prompts, retrieval, and tool behavior.
- Move ingestion, eval runs, or long workflows into background jobs.
- Add a data retention and redaction policy.

Outcome:
- The portfolio starts to show senior engineering judgment: reliability, safety, operations, and tradeoffs.

## Stage 5: Advanced RAG And Agent Reliability

Lessons:
- 0021: Ingestion Pipeline Design
- 0022: Metadata Filters And ACL
- 0023: Hybrid Search And Reranking
- 0024: Agent Retry And Recovery
- 0025: Agent Evaluation

Learn:
- Source-to-index ingestion pipelines.
- Access control before evidence enters the prompt.
- Hybrid retrieval and reranking.
- Bounded recovery for timeouts, validation failures, partial success, and unsafe retries.
- Agent evaluation by trace path, not just final answer.

Portfolio build:
- Harden the knowledge assistant:
  - add ingestion status
  - add metadata filters
  - add ACL-aware retrieval
  - add hybrid search or reranking
- Harden the workflow agent:
  - add retry budgets
  - add recovery paths
  - add trace-based evals

Outcome:
- A measured enterprise assistant that can defend search quality, permissions, and workflow reliability.

## Stage 6: System Design And Interview Packaging

Lessons:
- 0026: AI Support Assistant Design
- 0027: Enterprise RAG Design
- 0028: Coding Copilot Design
- 0029: Personal Assistant Agent Design
- 0030: Final Portfolio And Interview Drill

Learn:
- How to whiteboard common AI systems.
- How trust, escalation, citations, account safety, context selection, permissions, and memory change by product domain.
- How to turn implementation work into interview evidence.

Portfolio build:
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

Outcome:
- You can present the work as a senior AI product system, not just a feature tour.

## Stage 7: Agent Runtime Specialization

Lessons:
- 0031: Agent Orchestration Patterns
- 0032: Agent State Management
- 0033: Agent Memory Design
- 0034: Agent Evaluation Harness
- 0035: Tool Execution Runtime

Reference:
- `reference/agent-runtime-reference.html`

Learn:
- When to use explicit workflows, manager tools, handoffs, or background runs.
- Run ledgers for state, facts, approvals, budgets, and trace pointers.
- Memory policy by scope, source, visibility, retention, and retrieval.
- Harnesses that evaluate transitions, tools, approvals, memory writes, recovery, budgets, and output.
- Tool execution as backend code: validate, authorize, approve, execute idempotently, audit.

Portfolio build:
- Turn the dry-run workflow agent into a small runtime:
  - resumable runs
  - explicit orchestration choice
  - persisted state ledger
  - memory write policy
  - trace-based eval harness
  - validated tool execution path

Outcome:
- You can discuss agent systems at the runtime level: orchestration, state, memory, tools, evaluation, and operational safety.

## Recommended Build Cadence

For each lesson:
- Spend 20-45 minutes on the lesson.
- Add one small change to the portfolio project.
- Add or update one eval, trace, policy, or design note.
- Capture non-obvious insights as learning records when they change your judgment.

Weekly rhythm:
- Two focused build sessions.
- One short reading session from `RESOURCES.md`.
- One eval/reflection pass: what failed, what improved, and what is now measurable?

## Portfolio North Star

Build one cumulative system with three visible slices:

1. Product Triage Assistant
   Shows model calls, streaming, structured outputs, tool boundaries, and product UX.

2. Enterprise Knowledge Assistant
   Shows ingestion, RAG, citations, retrieval evals, ACLs, tracing, and security controls.

3. Controlled Workflow Agent Runtime
   Shows orchestration, state, memory, approvals, tool execution, recovery, and agent evals.

## Interview Readiness Checklist

You should be able to explain:
- What changes when software contains probabilistic model calls.
- Why structured outputs are product contracts.
- RAG versus fine-tuning.
- Chunking, embeddings, hybrid search, reranking, and retrieval evaluation.
- How citations and context packets reduce unsupported answers.
- How tracing makes AI failures debuggable.
- Tool calling versus tool execution.
- Agent loops versus explicit workflows.
- State, memory, persistence, and resumability.
- Eval gates and LLM-as-judge tradeoffs.
- Prompt injection, data leakage, RAG poisoning, excessive agency, and tool abuse.
- Latency, cost, model routing, caching, queues, and graceful degradation.
- Multi-tenant boundaries across retrieval, memory, traces, jobs, and tools.

## How To Use This Plan

Use `index.html` as the lesson launcher and this file as the sequencing guide. When a lesson creates a practical artifact, attach it to the cumulative portfolio system rather than starting a new throwaway demo.

The finish line is not "completed 35 lessons." The finish line is being able to show a working AI system and defend its product contracts, evals, traces, security choices, and runtime design.
