# AI Engineering Resources

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
- [OpenAI API docs: Evals](https://developers.openai.com/api/docs/guides/evals)
  Use for test datasets, graders, regression checks, and moving beyond "it feels good."
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
- [Qdrant documentation](https://qdrant.tech/documentation/)
  Use for vector search, filtering, hybrid retrieval, indexing, and RAG search engineering.
- [pgvector on GitHub](https://github.com/pgvector/pgvector)
  Use when the simplest useful architecture is Postgres plus vector similarity search.
- [Braintrust docs: Evaluate systematically](https://www.braintrust.dev/docs/evaluate)
  Use for eval loops, experiments, production scoring, and turning traces into test datasets.
- [OWASP Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
  Use for prompt injection, sensitive information disclosure, excessive agency, supply chain, and other LLM-specific risks.

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
