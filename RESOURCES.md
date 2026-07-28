# AI Engineering Resources
**Last reviewed:** 2026-07-27
**Review policy:** Recheck official links, versions, renamed APIs, deprecations, and framework changes quarterly. Provider examples are illustrations; the course contracts remain vendor-neutral.

## Knowledge

- [OpenAI API docs: Current model guidance](https://developers.openai.com/api/docs/guides/latest-model)
  Use for the real-provider default and quarterly model review. The starter uses `gpt-5.6-terra` as the balanced course default reviewed 2026-07-20; preserve the provider boundary and rerun evals before changing it.
- [OpenAI API docs: Text generation](https://developers.openai.com/api/docs/guides/text)
  Use for the core request/response mental model, message inputs, and the Responses API surface.
- [OpenAI API docs: Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
  Use when lessons involve JSON schemas, typed outputs, or model responses that feed product code.
- [OpenAI API docs: Function calling](https://developers.openai.com/api/docs/guides/function-calling)
  Use for tool calling, agent boundaries, and the difference between model decisions and app execution.
- [OpenAI API docs: Streaming API responses](https://developers.openai.com/api/docs/guides/streaming-responses)
  Use for streaming UX, event handling, partial text rendering, and deciding what should wait until a final response.
- [OpenAI API docs: Embeddings](https://developers.openai.com/api/docs/guides/embeddings)
  Use for semantic search, similarity, clustering, and the first pass at RAG.
- [OpenAI API docs: Agents SDK](https://developers.openai.com/api/docs/guides/agents)
  Use once basic tool calling is clear and the work moves into multi-step workflows.
- [OpenAI Agents SDK docs: MCP](https://openai.github.io/openai-agents-python/mcp/)
  Use for Model Context Protocol integration choices, tool filtering, hosted MCP tools, approvals, caching, and tracing.
- [OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
  Use for representative datasets, task-specific graders, calibration, regression checks, and moving beyond "it feels good." This replaces the legacy generic Evals learning path.
- [OpenAI API docs: Production best practices](https://developers.openai.com/api/docs/guides/production-best-practices)
  Use for reliability, deployment, observability, rate limits, and operating AI features.
- [OpenAI API docs: Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices)
  Use for abuse prevention, user safety, and API-facing safeguards.
- [Anthropic docs: Prompt engineering overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
  Use for the discipline of defining success criteria and evals before endlessly tweaking prompts.
- [Anthropic docs: Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
  Use as a provider-neutral comparison point for client tools, server tools, and the agentic loop.
- [Google AI for Developers: Gemini API docs](https://ai.google.dev/gemini-api/docs)
  Use to stay provider-literate and avoid learning only one vendor surface.
- [LangGraph TypeScript docs: Overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
  Use for long-running, stateful agents, human-in-the-loop workflows, persistence, and graph orchestration.
- [LangGraph TypeScript docs: Interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts)
  Use for dynamic approval pauses, checkpoint/thread identity, restart/resume behavior, and interrupt safety rules.
- [LangGraph PostgresSaver reference](https://reference.langchain.com/javascript/langchain-langgraph-checkpoint-postgres/index/PostgresSaver)
  Starter version reviewed: `@langchain/langgraph` 1.4.7 and `@langchain/langgraph-checkpoint-postgres` 1.0.4. Use for the durable framework module and rerun the approval-resume tests on upgrade.
- [Model Context Protocol docs](https://modelcontextprotocol.io/docs/getting-started/intro)
  Use for provider-neutral understanding of MCP as a standard for connecting AI applications to external data sources, tools, and workflows.
- [MCP TypeScript v1 server guide](https://ts.sdk.modelcontextprotocol.io/server)
  Starter version reviewed: `@modelcontextprotocol/sdk` 1.29.0 with Zod 4.4.3. The official SDK's v1 line is used for the runnable local server while v2 is pre-release; review the migration only after a stable v2 release.
- [Model Context Protocol: Security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
  Use for confused-deputy, token-passthrough, SSRF, local-server, session, consent, and least-scope controls around MCP clients and servers.
- [Qdrant documentation](https://qdrant.tech/documentation/)
  Use for vector search, filtering, hybrid retrieval, indexing, and RAG search engineering.
- [Qdrant search and filtering](https://qdrant.tech/documentation/search/)
  Use for Stage 5's real vector query, score interpretation, payload return, and tenant/role filters. The local course image is pinned to Qdrant 1.18.2.
- [pgvector on GitHub](https://github.com/pgvector/pgvector)
  Use when the simplest useful architecture is Postgres plus vector similarity search.
- [Braintrust docs: Evaluate systematically](https://www.braintrust.dev/docs/evaluate)
  Use for eval loops, experiments, production scoring, and turning traces into test datasets.
- [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai)
  Use for lesson 0052's portable hosted trace fields. The starter emits the dated `https://opentelemetry.io/schemas/gen-ai/1.42.0` schema and treats GenAI conventions as review-dated rather than stable forever.
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
  Version taught: 2025. Use for prompt injection, sensitive information disclosure, supply chain, data/model poisoning, improper output handling, excessive agency, system prompt leakage, vector/embedding weaknesses, misinformation, and unbounded consumption.
- [NIST AI Resource Center and AI RMF](https://airc.nist.gov/)
  Version taught: AI RMF 1.0, identified explicitly because it is under revision. Use Govern/Map/Measure/Manage for regulated-industry communication.
- [NIST AI 600-1: Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
  Use as the generative-AI companion to AI RMF 1.0 for risks and actions; record the publication/version when citing it in an artifact.

### AI agent security (course: lessons 0054-0061; reviewed 2026-07-27)

**Threats, requirements, and operations**

- [OWASP Top 10 for Agentic Applications for 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
  Use ASI01-ASI10 to organize agent-specific threat paths; it is a risk-awareness list, not a complete verification standard.
- [OWASP Artificial Intelligence Security Verification Standard (AISVS) 1.0](https://owasp.org/www-project-artificial-intelligence-security-verification-standard-aisvs-docs/)
  Use versioned v1.0 requirement IDs for testable controls, especially agent orchestration, MCP, access, memory, supply chain, and monitoring.
- [NIST AI Risk Management Framework 1.0](https://www.nist.gov/itl/ai-risk-management-framework) and [NIST AI 600-1: Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1)
  Use Govern, Map, Measure, and Manage for the assurance argument and the GenAI profile for risk-specific actions; record the publication version.
- [NIST AI 100-2e2025: Adversarial Machine Learning](https://doi.org/10.6028/NIST.AI.100-2e2025)
  Use the March 2025 edition for current attack/mitigation terminology; note its published errata when citing details.
- [NIST SP 800-61 Rev. 3](https://doi.org/10.6028/NIST.SP.800-61r3)
  Final April 2025. Use its CSF 2.0 community profile to integrate preparation, detection, response, recovery, and lessons learned.
- [MITRE ATLAS](https://atlas.mitre.org/)
  Use the living AI threat knowledge base for technique/case cross-checks; record technique ID/name and review date because the catalog changes.

**MCP protocol and security**

- [MCP specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
  Stable baseline taught by this path; pin the negotiated protocol and SDK rather than linking only to latest.
- [MCP Security Best Practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
  Use for confused-deputy, token audience/passthrough, SSRF, local-server, session, consent, and scope-minimization controls.
- [MCP 2026-07-28 specification release candidate](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/)
  **Emerging, not stable as of the 2026-07-27 review.** Do not treat it as the deployed baseline; confirm final publication, changelog, SDK support, and migration tests first.

**Evaluation tools**

- [AgentDojo](https://agentdojo.spylab.ai/) — tool-using agent utility and prompt-injection security tasks.
- [Inspect AI](https://inspect.aisi.org.uk/) — composable datasets, agents, sandboxed tools, scorers, logs, and eval orchestration.
- [PyRIT](https://microsoft.github.io/PyRIT/) — risk-identification and red-team scenario orchestration.
- [garak](https://github.com/NVIDIA/garak) — probe/detector-based model and dialogue-system vulnerability scanning.

Pin any chosen tool/package and suite commit, run it only against authorized synthetic or isolated targets, and retain project-specific authorization, effect, isolation, and benign-utility oracles as the final gate.

### Agentic workflow practice (course: lessons 0042-0049)

- [Anthropic engineering: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
  Use for workflow patterns (prompt chaining with gates, routing, evaluator-optimizer loops, orchestrator-workers) and for the discipline of keeping agent designs simple.
- [Anthropic engineering: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
  Use for attention budgets, just-in-time context, compaction, and structured note-taking that survives across runs.
- [Anthropic engineering: Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
  Use for tool contracts, token-efficient tool outputs, and improving tools through evals instead of intuition.
- [Claude Code docs: Skills](https://code.claude.com/docs/en/skills)
  Use for the SKILL.md standard, invocation control, and packaging repeatable process as a harness asset.
- [Claude Code docs: Hooks guide](https://code.claude.com/docs/en/hooks-guide)
  Use for deterministic, event-triggered behavior around agent lifecycle events.
- [Claude Code docs: Subagents](https://code.claude.com/docs/en/sub-agents)
  Use for bounded specialists with scoped context, preloaded skills, and isolated context windows.
- [Cursor docs: Headless CLI](https://cursor.com/docs/cli/headless)
  Use for scripting one-shot agent runs in shell scripts and CI.
- [Cursor docs: CLI output format](https://cursor.com/docs/cli/reference/output-format)
  Use for the json and stream-json contracts that make one-shot runs machine-checkable.
- [Google eng-practices: The standard of code review](https://google.github.io/eng-practices/review/reviewer/standard.html)
  Use for review judgment: code health over perfection, and principles over preference.
- [Google eng-practices: What to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
  Use for the review checklist baseline that lesson 0047 extends with AI-specific checks.
- [Retromat: retrospective formats](https://retromat.org/en/)
  Use for structuring workflow retrospectives so they end in one measurable change.

## Wisdom (Communities)

- [OpenAI Developer Community](https://community.openai.com/)
  Use for API issues, examples from builders, and current product-specific patterns.
- [LangChain Forum](https://forum.langchain.com/)
  Use for LangGraph/LangSmith implementation patterns and agent workflow critique.
- [Qdrant Discord](https://qdrant.to/discord)
  Use for search and vector database implementation questions once the RAG project starts.

## Gaps

- Pick one fintech or regulated-industry AI community after the first project, so security and compliance instincts are tested against practitioners.
- Add one high-quality course or book only after the first two lessons reveal whether more structure is useful.

## Quarterly Source Review Checklist

- Check every external URL and replace redirects or dead links with the current primary source.
- Review provider API names, default models, SDK examples, and announced deprecations.
- Review OWASP, NIST AI RMF/GenAI Profile, and MCP security guidance for version changes.
- Mark provider-specific lesson examples with a reviewed date; preserve vendor-neutral contracts in prose.
- Search the repository for `legacy`, `deprecated`, old eval URLs, old OWASP URLs, and deleted-plan references.
- Record the review date here and in the footer of each reference companion.
