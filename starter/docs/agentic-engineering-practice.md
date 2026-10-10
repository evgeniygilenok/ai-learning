# Agentic engineering practice operating guide

This guide supports the [four-week practice course](../../courses/agentic-engineering-practice.html). Use the same synthetic support product for all 20 sessions. A recorded escalation is a local database row. No payment, email, customer account, or external write is connected.

## Setup

Use Node.js 22.13 or newer, npm, Git, and one coding-agent environment. The local path needs no Docker, hosted service, or API key. Node's SQLite module may print an experimental warning on supported versions.

Run commands at the repository root:

```bash
node --version
npm ci
npm test
npm run starter:practice:eval
npm run starter:mcp:check
```

The practice interface defaults to the fake provider. Each command is a separate process that opens the same SQLite database. Run without arguments for an interactive terminal:

```bash
npm run starter:practice
```

For scripting and reproducible evidence, pass a command after `--`:

```bash
npm run starter:practice -- add first-case Why is my pending transfer delayed?
npm run starter:practice -- run first-case
npm run starter:practice -- show first-case
npm run starter:practice -- effects
npm run starter:practice -- approve first-case
npm run starter:practice -- record first-case
```

After `run`, expect `awaiting-approval`, a pending proposal, policy evidence, and no effect for this case. After `approve`, expect `complete` and one synthetic effect. `show` displays both tool results and model explanation. `record` omits case text, model text, and tool arguments for a compact evidence record. Review even this record before sharing it.

The known transfer is `tr_001`, pending for three business days. The supplied policy permits escalation after two business days or a risk flag. Other transfer IDs return `not-found`. Retrieval uses a small lexical corpus and the saved support role; missing transfer-policy evidence ends the case before a model call. The model's explanation still needs human grounding review. Displayed evidence is not a proof that every generated claim follows from it.

## Commands and state

| Command | Behavior |
| --- | --- |
| `add ID case text` | Save one local event, its retrieved evidence, configuration, and trusted context |
| `run ID` | Advance one case until completion, failure, or an approval pause |
| `show ID` | Read the evidence, exact proposal, decision, tool results, uncertainty, and usage |
| `approve ID` | Save the local operator's decision and attempt the saved proposal |
| `reject ID` | Save rejection and end the paused case with no new effect |
| `list` | List case states and errors |
| `work N` | Process at most N eligible jobs, then exit; N is 1-20 |
| `cancel ID` | Cancel idle work without removing an existing effect |
| `effects` | Inspect durable synthetic effect records across cases |
| `record ID` | Print a compact run record with model identity and measured usage |
| `quit` | Close the interactive terminal |

Use the same stable event ID only for the same case text and transfer. Duplicate intake returns the existing job and does not reset decisions, attempts, or budgets. A changed payload under the same ID fails. Use a new ID for a deliberate new investigation. Two different event IDs are two logical cases, even if their words match.

A rejected case is terminal. A policy or exhausted-budget failure is terminal. A transient provider failure leaves its resumable workflow state and a retry timestamp, subject to attempt and call limits. A subsequent `run` or `work` after that timestamp retries it. The worker does not sleep or poll indefinitely. An undecided approval pause is skipped by `work`.

## Real-provider run

Before real calls, choose an API spend ceiling, check the model available to your API project, and look up its current input and output prices. Record the price review date with your evidence. This course does not prescribe a current default model or a static price.

Set these variables in your local shell. Replace example values with the model, prices, and ceiling you approved. Do not commit the key or shell history containing it.

```bash
export PRACTICE_PROVIDER=real
export OPENAI_MODEL="your-available-model"
export OPENAI_API_KEY="your-api-key"
export PRACTICE_SPEND_USD="your-positive-ceiling"
export PRACTICE_INPUT_USD_PER_MILLION="current-input-price"
export PRACTICE_OUTPUT_USD_PER_MILLION="current-output-price"
export PRACTICE_MAX_CALLS=6
export PRACTICE_MAX_ATTEMPTS=3
```

The adapter requests low reasoning effort and strict function schemas. Choose a model that supports that Responses API configuration. A provider rejection is a configuration finding to inspect, not a reason to widen permissions or remove validation.

Alternatively, copy `starter/.env.example` to the ignored `starter/.env`, edit it locally, and load it explicitly. npm does not load this file automatically:

```bash
node --env-file=starter/.env --experimental-strip-types starter/src/practice-cli.ts add real-baseline Why is my pending transfer delayed?
node --env-file=starter/.env --experimental-strip-types starter/src/practice-cli.ts run real-baseline
node --env-file=starter/.env --experimental-strip-types starter/src/practice-cli.ts show real-baseline
```

Read the pending reason and policy evidence before approving. Record a redacted genuine model failure separately from injected fixtures. If API access is unavailable, leave the real-model completion items pending and continue the deterministic exercises.

The application durably reserves a call before sending it, so crashes and retries consume the same cap. Each call requests at most 300 output tokens, including any reasoning tokens charged against that output limit. Local USD reservations use 15,000 estimated input tokens and 300 output tokens at the configured prices. Reservations are not refunded, including after a crash. `show` also reports an estimate based on measured token use.

These are local estimates, not a provider billing cutoff. Retained response history, tokenizer differences, cached-token pricing, and model-specific billing can differ. The adapter's character-based input check is approximate and does not cap the provider's retained history. Check the provider's actual billing and whether its dashboard budget is an alert or an enforced limit. Keep the application call and output caps even when using a provider budget.

## Configuration contract

| Variable | Default and behavior |
| --- | --- |
| `PRACTICE_PROVIDER` | `fake`; accepts only `fake` or `real` |
| `PRACTICE_DB` | `starter/.practice/course.sqlite`; process-local database path |
| `PRACTICE_TRANSFER_ID` | `tr_001`; intake selects a synthetic record, unknown IDs fail lookup |
| `PRACTICE_SCOPES` | `transfers:read,escalations:draft`; trusted local configuration, never model arguments |
| `PRACTICE_MAX_CALLS` | 6; positive integer, at most 12, including retries |
| `PRACTICE_MAX_ATTEMPTS` | 3; positive integer, at most 5 processing attempts |
| `PRACTICE_BATCH_SIZE` | 5; worker invocation bound, at most 20 |
| `OPENAI_MODEL` | Required at intake in real mode |
| `OPENAI_API_KEY` | Required when executing a saved real job; no fallback to fake |
| `PRACTICE_SPEND_USD` | Required positive local estimated ceiling in real mode |
| `PRACTICE_INPUT_USD_PER_MILLION` | Required positive reviewed input price in real mode |
| `PRACTICE_OUTPUT_USD_PER_MILLION` | Required positive reviewed output price in real mode |

Intake snapshots the provider mode, model, limits, evidence, and scopes. Relaunching with broader scopes does not widen an existing job. The actor is the local operator, and the tenant is the synthetic demo tenant. The process still supplies credentials and database path. Changing `PRACTICE_DB` opens a different store, including a separate estimated-budget ledger; it does not migrate saved work.

This is a trusted local operator application, without an authentication boundary between different people sharing the machine. Protect the database like other local project files. Do not expose this interface as a multi-user service without designing authentication and per-user authorization.

## Architecture and ownership

```text
Local event ID + case
       |
       v
Intake -> policy retrieval -> SQLite job with saved identity and limits
                                 |
                                 v
Finite worker -> lease claim -> model-driven workflow
                                 |             |
                                 |             v
                                 |       lookup -> model proposal
                                 |             |
                                 v             v
                           checkpoint    awaiting approval
                                               |
                                    local operator decision
                                               |
                                    durable synthetic effect
                                               |
                                    continuation + explanation
```

`practice.ts` integrates the shared loop, retrieval, configuration, and queue. `workflow.ts` handles proposals and transitions. `tools.ts` validates and authorizes. `practice-store.ts` owns transactions, worker claims, decisions, call reservations, and effects. `practice-cli.ts` exposes the operator journey. The coding agent's instructions and skills live in a separate learner-owned workflow and never become runtime authority.

The supplied fake provider is a fixed case fixture. It demonstrates the runtime path and is deliberately too small to establish model quality. Reviewer and coordination roles in sessions 09 and 18 are learner experiments with no execution authority. Retain them only if the comparison supports their cost.

## Recovery runbook

1. Use `show ID` and `effects` before retrying. Preserve the event ID, proposal, and saved decision. Avoid copying the case into a new ID to make an error disappear.
2. For a normal approval pause, read the exact pending proposal and use approve or reject. A repeated approve cannot replace a prior rejection or approve a changed proposal.
3. For a transient provider failure, inspect `retryAfter` and remaining calls and attempts. Run the same ID after that time. Permanent provider and policy failures end visibly.
4. For a crashed process, wait for the five-minute lease to expire, then run the same ID. Claims check ownership before checkpoints and effects. Do not clear leases manually during ordinary operation.
5. For shutdown, use Ctrl-C or SIGTERM. The finite worker stops taking new jobs and finishes the current bounded call or case before exiting. A provider call times out after 30 seconds; a complete case may use several calls. A forced kill leaves durable work for lease-expiry recovery.
6. For cancellation, use `cancel ID` while idle. If a worker owns it, stop the worker first. Existing effects remain recorded. There is no remote undo operation.
7. For a final explanation failure after an effect, inspect the effect and saved execute continuation. A retryable provider failure can resume the summary without executing another draft. A terminal failure requires a learner-owned recovery decision; do not claim the already recorded effect vanished.

| Interruption point | Saved facts | Recovery |
| --- | --- | --- |
| Before a lookup completes | Job and reserved call | Retry within the same call/attempt caps |
| After lookup checkpoint | Lookup result and continuation | Continue toward a proposal |
| Before operator decision | Exact pending call | Remain paused |
| After decision, before effect | Pending call and operator decision | Execute that saved proposal |
| After effect commit, before checkpoint | Durable effect plus approved pending call | Replay the same key, then continue |
| After execute checkpoint | Effect result and continuation | Generate the final explanation |
| After terminal state | Complete or rejected result | Return that state without another call |

The synthetic effect is a SQLite row. Its insertion is the consequence, so the unique key and transaction establish one logical local effect across replay. An external write would require a downstream idempotency key or reconciliation protocol. The optional LangGraph demo retains its own in-memory effect store; the practice route does not change that limitation.

## Evaluation and handoff

`starter:practice:eval` runs seven deterministic cases, labels them as fake or injected, and reports state, effect count, calls, and measured usage. Extend the pack with learner-owned real failures. The automated checks cover malformed arguments, denied access, missing evidence, step exhaustion, rejection, and missing records. Human review still checks whether the explanation is useful and grounded.

The process-crash tests terminate a child process on both sides of the effect commit and reopen the database in another process. Tests expire the crashed lease to simulate elapsed time; the runbook requires waiting for actual expiry. The tests also check that an obsolete worker owner cannot save over a new claim.

Keep one compact record per module in `starter/evidence/agentic-engineering-practice/`. Each contains a working increment, a preserved failure, a redacted run record, a decision, and a next limitation. The handoff template includes the seven completion gates. Templates start pending and must never masquerade as completed learner evidence.

Use the four-hour handoff allocation across weeks 2-4. Prepare the architecture and runbook in week 2, fresh setup and demonstration script in week 3, then demonstrate and update the final recovery design in week 4. Public hosting is optional.

## Source review

Reviewed October 10, 2026. Provider calls continue through the existing Responses adapter; this course does not silently update the model. Function calls carry call IDs and application-supplied results, and retained response IDs continue the tool interaction. See [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling) and [conversation state](https://developers.openai.com/api/docs/guides/conversation-state).

Codex instructions and skill examples use the current documented [AGENTS.md discovery](https://developers.openai.com/codex/guides/agents-md) and [repository skill layout](https://developers.openai.com/codex/skills). Host permissions remain separate. The read-only client uses the repository's installed TypeScript MCP SDK and the official [MCP client workflow](https://modelcontextprotocol.io/docs/develop/build-client). The store uses the [Node SQLite API](https://nodejs.org/api/sqlite.html), with a minimum version of 22.13 for this route. Review these sources again when changing executable instructions. Supporting lessons retain their own review dates.
