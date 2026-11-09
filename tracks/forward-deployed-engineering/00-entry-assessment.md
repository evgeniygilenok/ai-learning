# Optional gap review

Budget 60 to 90 minutes if a placement review would help. Your current systems knowledge is the starting point. You can begin module 08 directly and use these questions when a project exposes a gap. Existing work can answer them. There is no Python placement exercise.

## Systems review, optional 20 minutes

Pick one familiar system. Explain its transaction boundaries, concurrency control, replay behavior, tenant isolation, and recovery after a lost response. Point to code, tests, or a failure you have already diagnosed. If one area feels unclear, try the relevant failure drill in modules 02 to 07.

A useful challenge: two workers claim the same unassigned ticket, one loses its response, and the process restarts. Explain which state survives and what prevents a repeated effect. Reuse your preferred language. Only implement a new reproduction if the behavior is uncertain.

## Integration and operations, optional 20 minutes

Sketch a connector with pagination, webhook updates, and a durable checkpoint. Explain how it handles a duplicate event, an older update, a source delete, and a crash halfway through a batch.

Then consider a service returning HTTP 200 while its source data is two days old. Identify the evidence you would inspect and the failure boundary you would test first. Use existing operational experience rather than rebuilding a deployment just for placement.

## AI failure boundaries, 40 minutes if new

Design a policy assistant for two tenants. It can search documents and propose ticket updates. Give one schema-valid but wrong answer, one passage that must never reach the model, and one prompt injection in a document. Specify where application code blocks each failure.

Write 10 evaluation cases covering answerable and unanswerable requests, conflicting versions, unauthorized access, and a repeated tool action after a timeout. Separate retrieval, answer, and execution errors. Explain how you would compare two versions without tuning on the final test cases. Use the result to choose where to spend time in modules 08 to 11.

## Technical decomposition, optional 10 minutes

A team asks for an agent to reduce time spent switching between systems. List the unknowns that would change your architecture. Propose the smallest useful version and the evidence needed to add further automation.

## Answer guide

- A conditional database claim can coordinate concurrent workers. A durable operation identity and the destination's execution contract determine retry behavior. Identify remote effects that cannot share the local transaction.
- A checkpoint must not claim uncommitted progress. Replay needs safe writes. Reconciliation detects missed updates and deletes. Freshness is separate from HTTP availability.
- Enforce access before constructing model context and again at action execution. Score evidence support separately from JSON shape. Reserve reviewed held-out cases before tuning.
- A technical design follows the workflow, source contracts, permissions, failure costs, and user outcome. Dynamic agent behavior needs a useful reason and measurable benefit.

The module readings provide implementation detail for any unfamiliar area. Ask the tutor to review the specific failure you find difficult to explain.

## Choose your route

Begin module 08 unless you already have equivalent AI work to reuse. Consult the Python checklist during implementation. Use modules 02 to 07 selectively. Keep the advanced cases that challenge you, and move familiar material into reference use. Record demonstrated gaps and useful existing evidence without assigning yourself a single overall score.
