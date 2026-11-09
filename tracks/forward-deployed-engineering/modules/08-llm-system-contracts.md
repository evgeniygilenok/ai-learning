# 08. LLM system contracts

14 hours. Add AI at a boundary you can test and replace. Requires modules 01, 03, and 06. Reuse existing AI lessons if they satisfy the gate.

## Lesson 1. A model request is a system boundary

Draw the inputs, context construction, provider request, response parsing, domain validation, and final rendering. Record prompt version, model identifier, request configuration, elapsed time, and usage where available. Keep sensitive source text out of general logs. Use one provider adapter so the rest of the application depends on your domain result, not raw provider events.

Define the first task narrowly: classify a ticket and draft a response. Before calling a model, implement a deterministic baseline for the same task. Keep the same input set and scoring rule for comparison. This exercise tests whether the added variability produces useful value.

Study the provider's actual request/response documentation when implementing. This course leaves model and SDK selection to the lab start rather than fixing a model name that may change.

## Lesson 2. A schema constrains shape

Structured Outputs can constrain a response to a supported JSON schema. Shape validity still cannot establish that a classification is correct, a cited document exists, or an action is authorized. Handle refusal, incomplete output, and provider errors as explicit application outcomes. Check support for the exact model and schema you select. [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

Worked example:

```json
{
  "category": "billing",
  "ticket_id": "T-7",
  "recommended_action": "close",
  "policy_document_id": "policy-9"
}
```

This object can fit a schema and still be wrong. The ticket may belong to another tenant, the cited policy may be obsolete, and closure may require approval. Validate those claims against trusted state. Build the response type with a separate "needs_review" or abstention outcome rather than inventing missing facts.

## Lesson 3. Choose explicit control flow first

Start with classify, retrieve permitted evidence, draft, validate, and present for review. Make transitions visible. Add dynamic tool selection only when the workflow needs it. Anthropic's agent-pattern article distinguishes code-directed workflows from model-directed agents. Its original tooling discussion is historical; use current provider documentation for implementation. [Building effective agents](https://www.anthropic.com/research/building-effective-agents)

For tool calls, the model proposes a call and application code executes it. The application owns validation, permissions, deadlines, and effect control. Preserve call/result association in the provider's required format. [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling)

Do not execute partial streamed arguments. A visible draft and a committed action have different correctness requirements. Streaming improves perceived responsiveness, but the application still needs a final validated result before side effects.

## Lab and failure drill

Create 30 labeled development tickets. Compare the deterministic baseline with one model implementation. Record classification correctness, abstentions, malformed/incomplete outputs, latency, and usage. Keep the adapter replaceable with deterministic fake responses for CI.

Inject a schema-valid but unsupported action and an incomplete response. Verify that neither reaches the execution path. Change the provider adapter's response format and keep the domain tests unchanged.

## Mastery gate

Deliver the request boundary diagram, adapter, result schema, domain checks, baseline comparison, and failure traces. Explain one improvement and one regression. Transfer the workflow to a new ticket category without broadening tool permissions.

Questions: Does valid JSON establish a correct answer? Who executes a tool call? When should a workflow become an agent?

## Answer guide

Syntax and schema checks do not establish truth. Application code executes model-proposed calls under its own policy. Use dynamic control flow when it solves a demonstrated requirement, then measure the added failure modes.

Ask the tutor to give you a valid object that your application must reject.
