# Reproducible and Public Runbook

## Local verification

1. Install Node.js 22+ and run `npm install`.
2. Copy `starter/.env.example`; never commit real credentials.
3. Run `npm test` and `npm run starter:demo:fake` without external services.
4. Set a $15 provider-dashboard hard stop, export `OPENAI_API_KEY`, then run `npm run starter:demo` and `npm run starter:agent`.
5. Start Postgres/Qdrant with `docker compose -f starter/docker-compose.yml up -d`; run `npm run starter:langgraph` and `npm run starter:vector`.
6. Configure one hosted OTLP receiver and run `REAL_MODEL_EVAL=1 npm run starter:eval:hosted`.
7. Configure `starter/mcp-client.example.json` in a real MCP client and run the least-scope negative tests.

Record model IDs, dependency/container versions, synthetic dataset version, run IDs, latency/token usage, and exit codes in each stage evidence bundle.

## Health and readiness

- App: deterministic tests pass and the real provider returns valid structured output.
- Postgres: `pg_isready` passes and a LangGraph thread resumes after restart.
- Qdrant: collection responds and an authorized query returns the expected source; unauthorized roles return no points.
- OTLP: the hosted backend shows a redacted test span by run ID.
- MCP: the client lists both tools; the default server scope can invoke only the read tool.

## Public proof release

The portfolio release is incomplete until one recruiter link reaches:

- a public GitHub repo with a case-study README;
- a hosted, synthetic-data demo (authentication or strict usage limits are acceptable);
- a 3-minute demo video;
- one written technical deep dive on the eval or recovery story.

The case study must link the architecture, real run, preserved failure, eval gate, hosted trace, security boundary, LangGraph comparison, MCP denial, context tradeoff, costs, and known limits. Do not publish API keys, provider request content, customer data, or hosted trace credentials.

## Rollout, rollback, and retirement

- Roll out model/provider changes to deterministic contracts, offline real evals, then the hosted demo.
- Block on schema, authorization, approval, duplicate-effect, or representative quality regressions.
- Roll back the model/prompt/runtime version together and keep the prior eval/trace comparison.
- Review provider model aliases, SDK/framework versions, Qdrant image, MCP SDK line, and OTLP GenAI schema quarterly through `RESOURCES.md`.
- Stop the demo or switch it to recorded mode if cost, abuse, authorization, or provider availability breaches the stated limits.
