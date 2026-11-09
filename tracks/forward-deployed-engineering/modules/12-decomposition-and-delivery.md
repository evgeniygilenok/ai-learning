# 12. Decomposition, debugging, and delivery

40 hours plus a two-week usage observation period. The observation period can overlap normal study. Requires the prior module gates or equivalent independent evidence.

## Lesson 1. Convert an ambiguous request into a bounded system

Use a real small-team workflow with permission. If none is available, use a simulated customer brief and label the result as simulated. Do not invent discovery conversations, user adoption, quotes, or outcomes.

Start with "help our team handle exceptions faster". Ask who does the work, how often, what makes an exception, where the source data lives, who controls access, how mistakes are recovered, and what deployment constraints apply. Identify the smallest useful operation and the data and permission boundaries it crosses.

Write a one-page technical scope. Include inputs, outputs, source contracts, non-goals, identity model, correctness invariants, expected load, freshness, side effects, recovery, and a measurable result. Name uncertain assumptions and the cheapest experiment that resolves each. This is technical decomposition practiced through a customer problem.

Worked decision: if the main pain is finding the current record, reliable integration and search may deliver value before an agent. If drafting consumes the remaining time, add a model with a review step. Define the evidence that would justify autonomous execution later.

## Lesson 2. Debug from observations

Use an unfamiliar small repository or an unfamiliar part of an established open-source project. Pin the revision and get a clean baseline. Reproduce a bug, inspect the request path, form a specific hypothesis, and run the smallest discriminating experiment. Use stack inspection and breakpoints when they reduce uncertainty. [Python debugger](https://docs.python.org/3/library/pdb.html)

Practice on three bug classes: an incorrect join that duplicates work, a missing context field on a queued job, and a blocking call inside an async request path. If you seed the bugs yourself, say so. An independently supplied bug provides stronger transfer evidence.

Create a regression check that fails before your fix and passes after. Keep a short causal explanation. Measure the difference between symptom removal and restoration of the intended invariant. Use tracing across asynchronous work to connect the observations. [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/context-propagation/)

## Lesson 3. Deliver, observe, and hand off

Ship a narrow version, run it with the intended user, and measure the workflow outcome over two weeks. Record the baseline sample size, method, exclusions, failures, and user corrections. A before/after change in a small uncontrolled trial does not prove causation. Report what you observed and the plausible confounders.

Include a deployment procedure, rollback decision, restore rehearsal, access model, evaluation report, and support runbook. Set an initial user-relevant objective and an explicit response to missed reliability targets. [Google SRE on SLOs](https://sre.google/workbook/implementing-slos/)

Ask another engineer to follow the handoff. Record the first instruction they could not execute. Repair the document and repeat that step. The test is whether the system can be operated without relying on your memory.

## Capstone acceptance criteria

- The scoped workflow runs with representative synthetic data and, when permitted, the intended user data under the agreed access policy.
- Duplicate delivery, source drift, revoked access, and process restart have explicit tested behavior.
- The UI exposes freshness, pending work, failures, and required review where they affect the operator's decision.
- AI quality has a deterministic baseline, reviewed cases, a held-out report, and failure categories.
- Deployment, recovery, and a core incident can be reproduced from the handoff.
- A changed requirement forces a justified revision. Examples include a second tenant, delayed updates, or a downstream API without idempotency support.
- A real deployment includes consent and honest observed usage. A simulated deployment stays labeled simulated and leaves the real-user milestone open.

## Final mastery check

Use a 45-minute design exercise, a 60-minute unfamiliar-code bug hunt, and a 20-minute defense of your evaluation and recovery choices. Explain the system with the diagrams closed, then use evidence to answer challenges. Score mechanism, implementation, diagnosis, and transfer separately using the course rubric.

Questions: Which assumption would most change your architecture? Which failure can your system detect but not repair automatically? What would you remove if the user only needed half the workflow?

## Answer guide

A good answer connects assumptions to component boundaries, permissions, state, and recovery. It distinguishes measured evidence from estimates and unknowns. Removing unnecessary components is a positive result when the remaining system meets the user's requirement.

Ask the tutor to act as the incoming engineer and challenge your handoff with one changed requirement.
