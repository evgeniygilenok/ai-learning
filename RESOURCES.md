# AI Engineering Resources

**Last reviewed:** 2026-07-17  
**Review policy:** Recheck official links, versions, renamed APIs, deprecations, and framework changes quarterly. Provider examples are illustrations; the course contracts remain vendor-neutral.

## Knowledge

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
- [Model Context Protocol docs](https://modelcontextprotocol.io/docs/getting-started/intro)
  Use for provider-neutral understanding of MCP as a standard for connecting AI applications to external data sources, tools, and workflows.
- [Model Context Protocol: Security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)
  Use for confused-deputy, token-passthrough, SSRF, local-server, session, consent, and least-scope controls around MCP clients and servers.
- [Qdrant documentation](https://qdrant.tech/documentation/)
  Use for vector search, filtering, hybrid retrieval, indexing, and RAG search engineering.
- [pgvector on GitHub](https://github.com/pgvector/pgvector)
  Use when the simplest useful architecture is Postgres plus vector similarity search.
- [Braintrust docs: Evaluate systematically](https://www.braintrust.dev/docs/evaluate)
  Use for eval loops, experiments, production scoring, and turning traces into test datasets.
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
  Version taught: 2025. Use for prompt injection, sensitive information disclosure, supply chain, data/model poisoning, improper output handling, excessive agency, system prompt leakage, vector/embedding weaknesses, misinformation, and unbounded consumption.
- [NIST AI Resource Center and AI RMF](https://airc.nist.gov/)
  Version taught: AI RMF 1.0, identified explicitly because it is under revision. Use Govern/Map/Measure/Manage for regulated-industry communication.
- [NIST AI 600-1: Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
  Use as the generative-AI companion to AI RMF 1.0 for risks and actions; record the publication/version when citing it in an artifact.

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
