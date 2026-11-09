# 12. Decomposition, debugging, and delivery

40 hours plus a two-week usage observation period. The observation period can overlap normal study. Requires the prior module gates or equivalent independent evidence. The pipeline below starts in week 1 of the course, not at this module; this module is where it pays off.

## Before you build: run a real-user pipeline

Do not wait until the capstone to look for a user. Allow about 6 hours across the course, mostly before module 11 ends.

1. Build a target list in week 1: 10 named teams, operators, or team leads in the domain chosen in the course overview. Note who owns the workflow, who owns the data, and who could approve a small pilot. Keep an outreach log with dates and outcomes, including refusals and non-replies. Silence is information about access, not a reason to quietly switch to a simulated customer.
2. Hold at least five discovery conversations before capstone build begins. Do not pitch an AI solution. Ask who does the work today, how often, what makes a case an exception, which systems they move between, where the authoritative data lives, who controls access, what a mistake costs, how mistakes are found and undone, and what a useful result would look like. Ask to observe the workflow or see a worked example, with permission. Record assumptions each conversation confirms or destroys.
3. Map the workflow and measure the baseline before writing capstone code: steps, handoffs, volumes, time spent, error and rework rates, and how each number was sampled. A baseline you cannot describe cannot support a before-and-after claim.
4. Climb a commitment ladder, one named step at a time: discovery conversation, workflow observation, feedback on a synthetic-data demo, then pilot consent from a named owner for one operator, bounded data, and a defined period. Record consent, the data owner, what data may be used, retention, and how consent can be revoked. Start with synthetic or de-identified data unless the owner agrees otherwise in writing.
5. Review the pipeline weekly for 15 minutes. If no pilot consent exists by the end of module 11, run the capstone as a clearly labelled simulated exercise, keep the real-user milestone open, and keep the pipeline running. If access to the chosen domain stays impossible, record that as a finding against the domain choice and revisit the week-1 decision rather than inventing adoption.

Gate: capstone planning cannot begin until the workflow map, the measured baseline, and either pilot consent or an explicit simulated-exercise label exist.

## Lesson 1. Convert an ambiguous request into a bounded system

Use a real small-team workflow with permission. If none is available, use a simulated customer brief and label the result as simulated. Do not invent discovery conversations, user adoption, quotes, or outcomes.

Start with "help our team handle exceptions faster". Ask who does the work, how often, what makes an exception, where the source data lives, who controls access, how mistakes are recovered, and what deployment constraints apply. Identify the smallest useful operation and the data and permission boundaries it crosses.

Write a one-page technical scope. Include inputs, outputs, source contracts, non-goals, identity model, correctness invariants, expected load, freshness, side effects, recovery, and a measurable result. Name uncertain assumptions and the cheapest experiment that resolves each. This is technical decomposition practiced through a customer problem.

Write a one-page domain brief alongside the scope, in the language of the chosen domain: the actors and who can authorise what, a short glossary of the terms operators actually use, the authoritative sources for policy decisions, the data-sensitivity and retention constraints, the failure that costs the most, and the metric the team already trusts. Have a practitioner from the discovery conversations correct it. A brief no practitioner has corrected is a guess, however tidy it looks.

Worked decision: if the main pain is finding the current record, reliable integration and search may deliver value before an agent. If drafting consumes the remaining time, add a model with a review step. Define the evidence that would justify autonomous execution later.

## Lesson 2. Debug from observations

Use an unfamiliar small repository or an unfamiliar part of an established open-source project. Pin the revision and get a clean baseline. Reproduce a bug, inspect the request path, form a specific hypothesis, and run the smallest discriminating experiment. Use stack inspection and breakpoints when they reduce uncertainty. [Python debugger](https://docs.python.org/3/library/pdb.html)

Practice on three bug classes: an incorrect join that duplicates work, a missing context field on a queued job, and a blocking call inside an async request path. If you seed the bugs yourself, say so. An independently supplied bug provides stronger transfer evidence.

Create a regression check that fails before your fix and passes after. Keep a short causal explanation. Measure the difference between symptom removal and restoration of the intended invariant. Use tracing across asynchronous work to connect the observations. [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/context-propagation/)

## Lesson 3. Deliver, observe, and hand off

Ship a narrow version, run it with the intended user, and measure the workflow outcome over two weeks. Record the baseline sample size, method, exclusions, failures, and user corrections. A before/after change in a small uncontrolled trial does not prove causation. Report what you observed and the plausible confounders.

Include a deployment procedure, rollback decision, restore rehearsal, access model, evaluation report, and support runbook. Set an initial user-relevant objective and an explicit response to missed reliability targets. [Google SRE on SLOs](https://sre.google/workbook/implementing-slos/)

Ask another engineer to follow the handoff. Record the first instruction they could not execute. Repair the document and repeat that step. The test is whether the system can be operated without relying on your memory.

### Stakeholder delivery packet

Keep these artifacts from the first week of the capstone. They are the delivery, not paperwork after it.

- Stakeholder map: the decision maker, data owner, security or compliance reviewer, operator, and end users, with what each one can approve, block, or break.
- Decision log: each material decision with date, options considered, who decided, and the evidence that would reopen it. Scope changes are recorded here, never absorbed silently.
- Risk register: the top delivery risks with owner, earliest observable warning sign, mitigation, and the decision needed if the risk materialises.
- Weekly one-page status: the outcome metric and its latest value, progress against the next milestone, top risks, decisions you need from stakeholders, and what happens next. Send it on a fixed day whether or not there is good news.
- Scope-change protocol: request, effect on invariants, evaluation, schedule, and permissions, your recommendation, and the stakeholder decision. Practice it on the changed requirement in the acceptance criteria below and keep the written exchange.
- Product-feedback memo: what the deployment taught you about the underlying product or platform, separated into observed user behaviour, your interpretation, and the change you would propose. Write it even when the reader is only your future self.
- Reusable playbook: one pattern from this deployment written so another engineer could apply it elsewhere: context where it works, steps, failure modes, and when not to reuse it. Prove it by applying it to the second workflow in this capstone and recording what it saved or prevented. An unapplied playbook is a draft, not evidence of leverage.

## Capstone acceptance criteria

- The discovery evidence exists: outreach log, at least five conversation records, a practitioner-corrected domain brief, a workflow map, and a measured baseline taken before the build.
- The stakeholder delivery packet is complete: stakeholder map, decision log, risk register, weekly status updates, one scope change handled through the protocol, a product-feedback memo, and a reusable playbook proven on a second workflow.
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
