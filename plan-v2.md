# AI Engineering Roadmap v2

This keeps the spirit of `plan-v1.md`, but changes the shape: ship a thin vertical AI app early, then deepen the same app through RAG, evals, agents, security, and system design.

## What Changed From v1

- Keep the target role: AI Engineer / AI Product Engineer.
- Move evaluation and security earlier. They should show up from the first app, not after everything else.
- Add a "thin vertical slice" before heavy RAG. You need a working LLM product loop before optimizing retrieval.
- Treat tools as interchangeable. Learn concepts first, then use OpenAI, Anthropic, Gemini, LangGraph, Qdrant, pgvector, Braintrust, or LangSmith when they fit.
- Use TypeScript as the default implementation language.
- Build one cumulative portfolio system instead of three disconnected demos.

## Phase 0: Orientation and Vocabulary

Time: 1-3 days

Learn:
- What AI engineering is and is not.
- Tokens, context windows, model calls, prompts, structured outputs, tool calls, embeddings, RAG, agents, evals.
- The six AI product contracts: input, context, model, output, action, quality/safety.

Outcome:
- Finish Lesson 0001.
- Keep a glossary you can revisit.

## Phase 1: Thin LLM Product Slice

Time: 1-2 weeks

Learn:
- Basic model API calls.
- Streaming responses.
- Prompt structure.
- Structured outputs with schemas.
- Error handling, retries, rate limits, and simple logging.
- Cost and latency basics.

Project:
- Product triage assistant: input a vague feature request, return a structured product brief with summary, assumptions, risks, next question, and suggested next action.

Outcome:
- A small deployed or locally runnable chat app that feels like a product, not a notebook.

## Phase 2: Prompt and Tool Contracts

Time: 1-2 weeks

Learn:
- Prompts as interface contracts.
- Few-shot examples.
- Tool calling and function schemas.
- Human approval before external side effects.
- Basic prompt injection awareness.

Project upgrade:
- Add tools such as search over local docs, ticket lookup, calendar/task mock APIs, or issue creation in dry-run mode.

Outcome:
- A tool-using assistant where the model proposes actions and the application executes only allowed actions.

## Phase 3: RAG and Search Engineering

Time: 3-4 weeks

Learn:
- Ingestion pipelines.
- Chunking.
- Embeddings.
- Vector search.
- Metadata filtering.
- Hybrid search.
- Reranking.
- Citations.
- Retrieval evaluation.
- Access-control boundaries.

Project upgrade:
- Turn the assistant into an enterprise knowledge assistant over a small docs corpus.

Outcome:
- A production-shaped RAG system with measured retrieval quality, source citations, and clear failure behavior.

## Phase 4: Evals and Observability

Time: 2 weeks, then ongoing

Learn:
- Golden datasets.
- Task-specific metrics.
- LLM-as-judge tradeoffs.
- Regression tests for prompts, retrieval, and tools.
- Tracing, cost tracking, latency tracking, and production feedback loops.

Project upgrade:
- Add an eval harness that runs on saved scenarios before prompt or retrieval changes are accepted.

Outcome:
- You can explain whether the system improved, degraded, or merely felt better.

## Phase 5: Agents and Workflows

Time: 3-5 weeks

Learn:
- Agent loops.
- State machines.
- Planning versus workflow orchestration.
- Memory and persistence.
- Human-in-the-loop review.
- Tool permissions.
- Retry and recovery.
- Multi-step workflow design.

Project upgrade:
- Build a Jira-style coding workflow in dry-run mode: read ticket, ask clarifying questions, plan changes, identify files, propose tests, and prepare a PR checklist.

Outcome:
- A stateful workflow system with controlled autonomy, not a loose chatbot.

## Phase 6: AI System Design

Time: 2-3 weeks

Learn:
- Multi-tenant architecture.
- Queues and background jobs.
- Model routing.
- Caching and prompt caching.
- Latency budgets.
- Cost controls.
- Data retention.
- Observability.
- Graceful degradation.

Practice designs:
- AI support assistant.
- Enterprise RAG assistant.
- Coding copilot.
- Personal assistant agent.

Outcome:
- You can whiteboard senior-level AI architectures and defend tradeoffs.

## Phase 7: AI Security

Time: ongoing, plus 2 focused weeks

Learn:
- Prompt injection.
- Sensitive data leakage.
- RAG poisoning.
- Insecure output handling.
- Excessive agency.
- Tool abuse.
- Secrets handling.
- Least privilege.
- Audit trails.

Outcome:
- Every portfolio project has a threat model and at least a minimal mitigation plan.

## Phase 8: Optional AI Infrastructure

Time: optional

Learn:
- Docker and deployment basics if needed.
- vLLM and self-hosted inference.
- GPU basics.
- AI gateways.
- Kubernetes only if the target jobs demand it.

Outcome:
- You understand how production inference runs, but without letting infrastructure swallow the main product path.

## Portfolio Shape

Build one cumulative system and present it in three slices:

1. Product Triage Assistant
   Shows model calls, streaming, structured outputs, and product UX.
2. Enterprise Knowledge Assistant
   Shows RAG, retrieval quality, citations, security boundaries, and evals.
3. Controlled Workflow Agent
   Shows tool use, state, human approval, and system design maturity.

## Weekly Cadence

- 2 focused build sessions.
- 1 short reading session from `RESOURCES.md`.
- 1 eval/reflection pass: what failed, what improved, what is now measurable?

## Interview Readiness Checklist

You should be able to explain:
- What changes when software contains probabilistic model calls.
- RAG versus fine-tuning.
- Embeddings and vector search.
- Chunking and retrieval evaluation.
- Structured outputs and tool calling.
- Agent loops versus explicit workflows.
- Memory and context management.
- How to reduce hallucinations.
- How to evaluate an AI feature.
- How to secure tools and retrieved context.
- How to design an AI assistant under latency, cost, and tenant isolation constraints.
