# Agentic engineering through one working product

Prepared October 10, 2026. Status: course design, ready for lesson authoring.

## Purpose

Build an independent, practical course inspired by the four-part structure in [the saved MEGA outline](../../mega-dev-course-program.md). The [official program](https://mega.dev/#program) supplies the topic sequence. The project, exercises, workload, and completion requirements below are our own design. This plan does not reproduce MEGA's paid lessons or promise access to its instructors or workshops.

The learner is an experienced TypeScript engineer who wants to build useful agents and direct coding agents effectively. Completion means being able to explain, change, operate, and debug the resulting system without relying on an agent to explain its own work.

## Course outcome

Build a support operations assistant using synthetic transfer records and policy documents. A support operator submits a case, receives a grounded explanation, reviews an escalation proposal, and decides whether to approve it. The assistant can later process queued cases within explicit limits.

Two kinds of agent work run through the course. A coding agent helps the learner develop the product. The product's runtime agent reads evidence and proposes actions. Keep their instructions, permissions, and records separate.

By the end, the learner can:

- Diagnose model mistakes using the actual request, context, tool results, and runtime decisions.
- Give a coding agent a bounded task with an inspectable result.
- Build a model-driven workflow with application-owned authorization and approval.
- Turn an ambiguous user need into a small product increment and defend its release.
- Resume interrupted background work, prevent repeated effects, and improve behavior from recorded failures.

## What the workspace already provides

The repository has 61 lesson records in `assets/curriculum.mjs`, a main course, workflow and security specializations, and a runnable TypeScript starter. Use them as supporting material rather than assigning the entire existing curriculum again.

| Existing component | Use in this course |
| --- | --- |
| `starter/src/provider.ts` | `ModelProvider`, fake behavior, and a real-provider adapter |
| `starter/src/workflow.ts` | `runModelDrivenWorkflow` and application-owned transitions |
| `starter/src/tools.ts` | `lookupTransfer`, `draftEscalation`, authorization, and effect records |
| `starter/src/retrieval.ts`, `starter/data/documents.json` | Evidence selection and citations |
| `starter/src/state.ts` | `StateStore`, context assembly, and compaction |
| `starter/src/langgraph-workflow.ts` | Optional framework comparison and Postgres checkpoints |
| `starter/src/mcp-server.ts` | Existing tools exposed through MCP |
| `starter/src/trace.ts`, `starter/src/hosted-eval.ts` | Run records and evaluation reporting |
| `starter/docs/product-brief.md`, `starter/docs/runbook.md` | Starting product and operating contracts |
| `lessons/0042-0049-*.html` | Existing instruction on engineering with agents |

Important gaps remain for this particular course. The inspected default state and effect stores are in memory. The LangGraph path has Postgres checkpoints but creates an in-memory effect store. A checkpoint alone does not establish durable prevention of repeated actions. Treat restart-safe effects, event intake, worker supervision, and the product's review screen as later learner work, not completed starter capabilities.

## Scope and setup

Use TypeScript, the existing provider interface, one coding-agent environment, and the supplied synthetic corpus. Start with one model and one runtime agent. Add a second role only for the coordination lessons, then decide whether to retain it.

Keep retrieval local initially. MCP enters after direct tools work. A vector database, hosted observability platform, framework migration, and public hosting are optional extensions. They do not block course completion.

Prerequisites are TypeScript, async code, HTTP, Git, and basic command-line use. The setup session covers the repository's Node requirement, local configuration, a fake-provider run, and a bounded real-provider run. Recheck the existing provider example and current official documentation before authoring executable API instructions. Do not treat the starter's July review date as fresh verification.

Use synthetic effects throughout. Set a learner-approved API spend ceiling before real calls and record model identity, usage, and estimated cost. A provider dashboard budget may be an alert rather than an enforced cutoff, so check its behavior and keep application-side run limits.

## Pace and lesson format

Chosen pace: four intensive weeks at 10-12 hours per week, 44 hours total. Dates are relative to the learner's start; the source course's cohort dates do not control this plan.

| Work | Hours |
| --- | ---: |
| Setup and baseline capture | 2 |
| 20 lessons at 90 minutes | 30 |
| Four integration studios at 2 hours | 8 |
| Demonstration and handoff preparation across weeks 2-4 | 4 |
| Total | 44 |

Reserve 15 minutes of each lesson for explanation, 55 for building or investigating, and 20 for reviewing the result and explaining the decision. These are budgets, not proof that a concept has been learned. If a prerequisite fails, use the next session to resolve it.

| Week | Sessions and supporting work | Working milestone | Hours |
| --- | --- | --- | ---: |
| 1 | Setup, 01-05, studio 1 | A reproducible coding-agent workflow | 11.5 |
| 2 | 06-10, studio 2, 1.5 hours on architecture and operating notes | A bounded support agent | 11 |
| 3 | 11-15, studio 3, 1.5 hours on setup instructions and the demonstration script | A useful operator workflow | 11 |
| 4 | 16-20, studio 4, 1 hour for the final demonstration and handoff | A recoverable background service | 10.5 |

A typical week has one 90-minute lesson each weekday and a two-hour integration studio on the weekend. Use the remaining time for setup or handoff work as listed above. Prepare the handoff incrementally so week 4 stays within the chosen workload. Update earlier notes when the final recovery and worker design changes them.

## Module 1: Understand and direct agent work

Prerequisite: finish setup and capture one baseline support case. Outcome: direct a coding agent using a small, reliable engineering workflow.

### 01. Inspect a model interaction

Distinguish instructions, input evidence, generated output, and facts the model cannot know. Inspect one real support-triage call and compare it with the fake-provider path.

Build a request-and-result record with model identity, output validity, latency, usage, and one observed limitation. Finish when you can explain a failure without attributing hidden knowledge or intentions to the model.

Existing support: lessons 0002-0003 and `starter/src/provider.ts`.

### 02. Change context deliberately

Learn how context selection changes behavior. Run the same task with missing policy, excessive unrelated material, and a concise relevant packet. Hold the model and task constant.

Produce a comparison of the three outputs and revise the context packet. Finish when you can point to the evidence behind the improvement and identify which input remains untrusted.

Existing support: lessons 0007 and 0053; `assembleContext` in `starter/src/state.ts`.

### 03. Organize project knowledge

Separate stable product rules, design decisions, task instructions, and temporary research. Build a small project knowledge index using the existing product brief and architecture notes.

Give the coding agent a task through that index. Finish when a fresh session finds the relevant rule and its source without requiring the full conversation history. Record how stale or conflicting rules should be handled.

Existing support: lessons 0033 and 0046; `starter/docs/`.

### 04. Configure one coding-agent environment

Define working-directory boundaries, available commands, scoped instructions, and permission limits. Package one repeated repository task as a reusable skill or equivalent supported by the chosen environment.

Run it from a fresh session. Finish when it produces the expected artifact and stops clearly when a required input is missing. Keep configuration specific to the selected environment.

Existing support: lessons 0043-0044.

### 05. Build a repeatable development workflow

Connect a small brief, implementation, review, and completion decision. Use the coding agent to improve a bounded behavior in the support assistant.

Record inputs, outputs, owner, and stopping condition for each step. Finish when the learner can explain the change, identify an unresolved issue, and reproduce the workflow without rewriting the entire prompt.

Existing support: lessons 0042 and 0045-0047.

### Studio 1: Fresh-session handoff

Complete a second small change using only the project knowledge and workflow artifacts. Capture where the handoff failed and repair one instruction. The module passes when the result is inspectable and the learner can explain every consequential change.

## Module 2: Build a bounded runtime agent

Prerequisite: studio 1. Outcome: a real model can investigate a synthetic case and propose an escalation while the application controls execution.

### 06. Trace the agent loop

Follow request, model proposal, tool result, updated context, and termination through `runModelDrivenWorkflow`. Draw the actual sequence for one lookup and one escalation proposal.

Finish when the record distinguishes model choices from runtime decisions and shows which condition stops a repeated or incomplete run.

Existing support: lessons 0010, 0031, and 0035.

### 07. Make tools narrow and predictable

Inspect `lookupTransfer` and `draftEscalation`. Explain argument validation, trusted identity, authorization, result shape, and failure behavior. Improve one confusing contract and observe its effect on the agent.

Finish when an invalid or unauthorized proposal produces an explicit denial and the agent cannot grant itself access by changing its arguments.

Existing support: lessons 0005, 0014, and 0035; `starter/src/tools.ts`.

### 08. Choose the right capability mechanism

Compare project instructions, reusable coding-agent skills, direct runtime tools, and MCP. Connect the existing MCP server to one client and invoke a read-only tool.

Write a short decision on when the protocol is useful for this project. Finish when you can trace where permissions come from and show that the client cannot widen them through model text.

Existing support: lessons 0043 and 0051; `starter/src/mcp-server.ts`.

### 09. Delegate one bounded responsibility

Give a separate reviewer role the evidence needed to assess an escalation draft. Define its input, output, allowed information, and failure behavior. Sequential delegation is sufficient.

Compare the single-role and delegated paths for usefulness, extra calls, and review effort. Finish with a decision to retain or remove delegation. No new agent-to-agent protocol is required.

Existing support: lessons 0031 and 0045.

### 10. Diagnose agent reliability

Create a small learner-owned evaluation pack covering answerable cases, missing evidence, malformed proposals, denied access, and exhausted step budgets. Inspect at least one actual model failure and its trace.

Record outcome quality, completion, usage, and latency. Finish when another reader can reconstruct why the failure happened and which layer should handle it. Small samples describe this exercise; they do not establish production reliability.

Existing support: lessons 0025 and 0034; `starter/evals/agent-cases.json` and `starter/src/trace.ts`.

### Studio 2: Investigate, propose, approve

Demonstrate a complete case, a denied case, and a rejected escalation. The module passes when the application preserves the approval boundary, the user sees the pending action, and the run leaves enough evidence to explain its outcome.

## Module 3: Deliver a useful product increment

Prerequisite: studio 2. Outcome: an operator can use the assistant and understand its limits.

### 11. Choose the user problem

Rewrite the existing product brief around one operator task. Define what successful resolution looks like, when the assistant should defer, and what the operator must see before approving an action.

Finish with a narrow user journey and a deliberate list of deferred features. Explain why this task benefits from a model rather than fixed rules alone.

Existing support: lessons 0026 and 0046; `starter/docs/product-brief.md`.

### 12. Turn intent into bounded work

Translate one vague request, such as making escalation clearer, into observable behavior, constraints, and small implementation tasks. Give the coding agent one task with only its necessary context.

Finish when a reviewer can determine whether the requested behavior exists without inferring your intent. Separate required behavior from optional polish.

Existing support: lessons 0042 and 0046.

### 13. Build the operator's smallest complete flow

Build a minimal local interface for case input, evidence, proposed action, approval or rejection, and completion or failure. Reuse the existing agent loop. Choose a basic web page or terminal interface and keep that choice for the course.

Finish when someone can complete the task without editing source files between steps. A generated draft must remain visibly distinct from an executed action.

Existing support: lessons 0004, 0026, and 0045; `starter/src/app.ts` as a starting reference.

### 14. Review the result against the promise

Inspect the implementation against the brief, not only its diff. Walk through missing evidence, rejected approval, and an interrupted request from the operator's perspective.

Produce a release decision with one retained limitation and its consequence. Finish when each claim has an inspectable example or run record.

Existing support: lessons 0016 and 0047.

### 15. Learn from use

Observe a peer attempting three synthetic cases. If a peer is unavailable, conduct a structured walkthrough and label it as self-review. Record confusion, abandonment, and unnecessary manual correction.

Make one targeted product change and repeat the same tasks. Finish with a before-and-after observation that supports the change without inventing user research.

Existing support: lessons 0040 and 0048.

### Studio 3: Operator acceptance review

Run the complete task with a person unfamiliar with the implementation, or a clearly labeled self-review fallback. The module passes when the operator can distinguish evidence, uncertainty, a pending proposal, and an executed result, and can recover from a failed interaction.

## Module 4: Operate with bounded autonomy

Prerequisite: studio 3. Outcome: the same assistant can process queued work and recover without relying on uninterrupted execution.

### 16. Persist work and recover after interruption

Replace or extend the in-memory seams with durable run state and effect records. A local transactional store is sufficient. Define what happens if execution stops immediately before or after an effect is recorded.

Finish with a restart walkthrough showing one logical synthetic effect and a recoverable run. Explain why saving a checkpoint alone does not prevent a repeated external effect. Do not claim exactly-once delivery to an external service without a supporting service contract.

Existing support: lessons 0011, 0024, and 0032. Lesson 0050 is an optional framework comparison.

### 17. Make configuration portable

Separate model selection, tool policy, context sources, and run limits from task code. Document required configuration and the behavior when it is absent.

Finish when the product runs from a fresh local environment using documented setup and synthetic data. Keep credentials outside committed artifacts and require no remembered chat instructions.

Existing support: lessons 0038, 0039, and 0049.

### 18. Coordinate work without losing ownership

Extend the reviewer role from session 09 into two separately owned tasks with an explicit handoff. Define context visibility, conflict handling, aggregate budget, and who makes the final decision.

Compare this flow with the single-agent baseline. Finish with a measured reason to keep or remove the additional role. Multi-agent structure is an exercise, not a graduation requirement for the final architecture.

Existing support: lessons 0031, 0045, and 0059.

### 19. Start work from events

Add one local event source and a bounded worker for synthetic support cases. Give events stable IDs, define retries and cancellation, and show when human approval pauses processing.

Finish when duplicate intake does not produce another logical escalation, a worker can stop cleanly, and a paused case resumes without widening its authority. No live email, payments, or production account integration is needed.

Existing support: lessons 0018, 0024, and 0044. Event intake and worker code are proposed additions.

### 20. Improve behavior without silent promotion

Select a recorded failure, propose a prompt, context, or workflow change, and compare it with the previous behavior on the same evaluation pack. Preserve the previous version and document the tradeoff.

Finish when a human can approve or reject the proposed change and restore the prior behavior. The system may prepare improvements; it cannot grant itself broader permissions or promote new behavior without review.

Existing support: lessons 0016, 0034, and 0048.

### Studio 4: Operate through failure

Process a short batch containing an ordinary case, a duplicate event, missing evidence, an approval pause, and an interruption. The module passes when every case has an explainable final or paused state, consequential effects have durable records, and the operator can stop processing and recover it.

## Evidence and completion

Proposed location for learner records: `starter/evidence/agentic-engineering-practice/`. Create it during course implementation, not as part of this planning change.

Keep one compact record per module containing the working increment, a preserved failure, a redacted run record, a decision, and the next limitation to address. Link code and demonstrations rather than copying long logs into Markdown.

The four-hour handoff budget is spread across weeks 2-4. It produces a short demonstration, a reproducible setup guide, an architecture sketch, a runbook, and one before-and-after improvement record. Week 4 reserves one hour to demonstrate the final system and complete the handoff. Public publication is optional.

Completion requires all of the following:

- A real-model run performs the bounded support task using the synthetic corpus.
- The learner can explain the context, tool proposal, authorization, and approval decisions.
- Denied access and rejected approval stop the intended action visibly.
- Duplicate intake and a process restart preserve one logical synthetic effect.
- A run record explains one genuine model failure and its handling.
- A measured change improves a named outcome or documents why the change was rejected.
- A fresh session can run the product and follow the operating instructions.

Use four levels for review: missing, works only with prompting, works and is explained independently, and handles a changed case with a defended tradeoff. Every completion item must reach the third level. Extra frameworks, longer prompts, and more agents do not raise the score by themselves.

## Authoring and repository integration

This change saves only the plan. Implement the course later in this order:

1. Author the course landing page at proposed `courses/agentic-engineering-practice.html`, covering the project, pace, prerequisites, session order, and completion gate. Keep the existing main course intact.
2. Add a proposed practice-session export to `assets/curriculum.mjs`. Give sessions separate identifiers such as `practice-01`; reference existing lesson IDs rather than adding 20 duplicate lesson records. Store objectives, exercise, prerequisites, time budget, artifact, and completion requirement for each session.
3. Extend `scripts/render-curriculum.mjs` to publish the new route and expose it through the learning hub. Generated pages must derive from that source. The current catalog checker assumes 61 lessons and 14 stage records, so keep the practice route separate from those collections.
4. Write original explanations and guided exercises for gaps in the existing material. Each lesson needs a worked example, a learner task with less guidance, a failure to investigate, and an exit explanation. Do not ship a page that merely sends the learner to several existing lessons.
5. Add only the missing project capabilities as their sessions are authored: operator interface, durable effects, event intake, and bounded worker coordination. Use proposed `starter/evidence/agentic-engineering-practice/` for evidence and proposed `starter/docs/agentic-engineering-practice.md` for the course-specific operating guide. Keep optional frameworks and hosted services outside the required path.
6. Walk through the complete route from setup to handoff. Check workload estimates, prerequisite ordering, local links, source review dates, and whether each completion requirement has a concrete exercise. Revise the course where the walkthrough exposes missing instruction.

## Decisions and limits

- Use one evolving product so work on tools, context, product behavior, and operations accumulates.
- Reuse the synthetic support domain because the workspace already supplies its data and contracts. Domain substitution must preserve the boundaries described in `starter/README.md`.
- Use the learner's chosen four-week intensive pace at 10-12 hours per week. Completion depends on demonstrated behavior, not calendar attendance.
- Do not make the current starter a solution the learner only runs. Exercises must require explaining it, changing it, and diagnosing failures.
- Keep runtime evaluation inside the course because it is a learning outcome. This document does not propose repository test changes or run implementation checks.
- Treat the 44-hour estimate as a first-pass budget. Durable recovery is the largest likely overrun; optional breadth should yield before recovery or approval work does.
- Review provider, MCP, framework, and agent-environment instructions against current official documentation when writing those lessons. Record review dates alongside executable examples.

No unresolved decision blocks authoring. Pace, interface choice, and optional hosting can change without changing the course's core project or completion requirements.
