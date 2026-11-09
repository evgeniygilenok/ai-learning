# Forward deployed engineering: build, explain, operate

A practical course for an experienced engineer with strong TypeScript skills and a stronger current understanding of systems. The main learning focus is production AI, enterprise integration, and the difficult reliability and security cases in customer deployments. Python is a short reference checklist. Use existing engineering work to skip familiar systems material.

The course contains 11 written modules with 33 lesson units, an optional Python checklist, a short gap review, worked examples, implementation labs, failure drills, answer guides, and an interactive reference lesson. Use the labs to build or extend a project. Familiar material can be reviewed through its failure drill without repeating the full module.

## What changes from the career plan

The source plan is strong on scope. It connects learning to shipped systems, evaluation, operations, and customer outcomes. Its main weakness for your goal is depth. A checklist such as "learn retries, transactions, RAG" does not specify the causal model you should understand or the evidence that proves it.

This course makes five changes:

- Use your existing software and systems knowledge immediately. Refer to a Python checklist while building. Keep TypeScript for the UI.
- Identify gaps by topic. Reuse an existing implementation or try a module's failure drill before deciding whether its lessons are useful.
- Trace a request through every boundary. Explain what each component knows, what it stores, what it trusts, and what happens when it stops.
- Use one evolving system for the first two portfolio milestones. Reuse its ingestion, identity, data, and deployment work when adding AI. Transfer the skills to a second workflow in the capstone.
- Budget 15 or more hours per week. The full route contains about 241 hours, including a 4-hour allowance for optional Python review, up to 90 minutes for the gap review, 3 hours for the week-1 target and domain decision, and 6 hours for the real-user discovery pipeline. Stakeholder-delivery artifacts and the domain lens are produced inside the existing build and capstone hours, not as extra projects. At 15 hours per week, plan around 16 weeks of core work and another 3 to 4 weeks for repairs and deeper experiments. Reusing familiar systems work shortens this. These are planning estimates, not a hiring timeline.

The source plan's posting counts describe its sample. This course does not independently re-audit those postings or treat their counts as a complete measure of the job market. Eligibility, applications, and interview strategy remain in the career plan. This course concentrates on technical competence.

## Choose the target segment and domain in week 1

Forward deployed engineering is not one job. Spend up to 3 hours in week 1 on a written decision, then revisit it for 30 minutes each month against 15 to 20 current postings. Record each posting's company, role, location, date accessed, and direct source. Deduplicate mirrored recruiter copies. Cluster what repeats. Do not treat the counts as a market statistic; use them to decide where your evidence should be strongest.

| Segment | Typical centre of gravity | What this core already proves | Decision it forces |
| --- | --- | --- | --- |
| AI-lab or applied-AI FDE | Production agents, tools, MCP, evaluation, customer discovery | Modules 08 to 12, governed execution, held-out evaluation | Weight the AI workflow and evaluation report most heavily |
| SaaS or platform FDE | Migrations, integrations, data quality, rollout, handoff | Modules 02 to 07 and 12, reconciliation, recovery, runbooks | Weight data correctness, rollout, and reusable delivery patterns most heavily |
| Infrastructure or data-platform FDE | Customer environments, data platforms, deployment constraints | Modules 02 to 07 provide the foundation only | Decide explicitly whether the optional depth after the core is required before targeting these roles |

Apply an eligibility and constraints filter before falling in love with a segment. Record location and work authorisation, travel range you can actually accept, on-site or hybrid requirements, customer-site work, clearance eligibility where a posting requires it, and any language or domain prerequisite. Write down non-targets as well as targets. A role you cannot accept is not evidence about what to study.

In the same week-1 decision, choose one domain wedge for the workbench. Good candidates have a repeated workflow, policy documents that genuinely govern decisions, a costly and recognisable failure, data you can reach through people you can talk to, and a result you can measure. Examples are regulated financial operations, healthcare administration, public-sector casework, and B2B software support. Change the vocabulary, actor roles, permissions, policy corpus, data sensitivity, retention constraints, failure cost, and success metric to match the domain. Renaming tickets is not a domain choice. Keep the same architecture and synthetic data unless a real user consents to more.

Deliverable: a one-page segment and domain decision with the dated posting sample, eligibility filter, chosen domain, rejected alternatives, the evidence this route will weight most heavily, and a revisit date. Module 12 cannot start until this page exists and names the domain the capstone will use.

## What you will build

Build an operations workbench for a fictional B2B support team, viewed through the domain lens chosen in week 1. It imports customer accounts from a paginated API, tickets from CSV, ticket updates from signed webhooks, and versioned policy documents. Use synthetic records for the course.

An operator can see stale data, investigate a ticket, read a policy answer with citations, and approve a draft update. The system keeps tenants separate. AI can propose an action, while application code validates and authorizes execution.

Start with a modular service, a worker, PostgreSQL, and a React/TypeScript UI. Use a local fake upstream for repeatable failures. Add one model provider behind an adapter, PostgreSQL text search, and pgvector when the retrieval experiment justifies it. Deploy on one cloud. Add other services only after identifying a concrete limitation.

The milestones align with the source plan's projects:

1. After module 07, deliver the operational integration app. Include migrations, authentication, CI, deployment, telemetry, a runbook, and recovery evidence.
2. After module 11, deliver the evaluated AI workflow on top of it. Include retrieval measurements, tools, an MCP adapter, a bounded execution loop, and an evaluation report.
3. In module 12, deliver a small deployment for a real consenting user found through the discovery pipeline defined there and started in week 1. If no user has consented by the end of module 11, record a simulated customer exercise honestly, label the real-user milestone still open, and keep working the pipeline. A simulated exercise never closes this milestone.

## How to study

Each full module has three focused lesson units. For familiar systems topics, start with the failure drill or reuse a comparable implementation. Read the lessons when the exercise exposes a gap. For new AI topics, read the explanation, predict a worked example, then implement the lab. Use the answer guide after your first attempt.

Spend about half your study time implementing and debugging, a quarter on reading and experiments, and a quarter on explanations, evidence, and spaced review. These are starting proportions. Increase the debugging time when a gate exposes a gap.

AI coding tools are allowed during implementation. Before accepting generated code, predict the failure cases and review its data access and side effects. For mastery checks, write the causal explanation and the small core algorithm yourself. Then use tools to test it. Keep outside help in your evidence notes so the result remains interpretable.

## Sequence and workload

| Section | Topics | Hours | Prerequisites |
| --- | --- | --- | --- |
| 00 | Optional gap review and routing | Up to 1.5 | Existing development experience |
| 01 | Optional Python checklist | Up to 4 | Existing programming experience |
| 02 | Relational invariants; analytical SQL; query plans | 18 | 01 |
| 03 | HTTP contracts; retry policy; webhook trust | 16 | 01, 02 |
| 04 | Raw and canonical data; incremental sync; reconciliation | 16 | 02, 03 |
| 05 | Concurrent transactions; durable jobs; outbox and recovery | 22 | 02, 03, 04 |
| 06 | Identity and tokens; authorization; tenant isolation | 18 | 02, 03, 05 |
| 07 | Containers and network paths; safe releases; recovery | 18 | 05, 06 |
| 08 | Model requests; structured outputs; explicit workflows | 14 | 01, 03, 06 |
| 09 | Search baselines; retrieval evaluation; permission-safe RAG | 20 | 02, 04, 06, 08 |
| 10 | Tool execution; durable agent state; MCP adaptation | 24 | 05, 06, 08, 09 |
| 11 | Evaluation design; uncertainty; cost and operational quality | 22 | 07, 08, 09, 10 |
| 12 | Decomposition; unfamiliar-code debugging; customer deployment | 40 | 01 to 11 or equivalent gates |

Your default starting point is module 08. Use modules 02 to 07 for targeted review and to fill gaps found while building. An existing integration and deployment can supply milestone 1. If you are building it from scratch, use those modules to establish its data, identity, and recovery behavior before adding write-capable AI. Begin finding a capstone user during the first two weeks.

## Pace at 15 or more hours per week

Use the 16-week budget as an upper starting allocation for the full route. Move unused review time into AI experiments or the capstone.

| Weeks | Full-route allocation |
| --- | --- |
| 1 to 4 | Week-1 segment and domain decision, Python checklist as needed, SQL and integration drills, ingestion, the first transaction exercise, and the first discovery conversations |
| 5 to 8 | Transaction recovery, authorization, deployment, and the start of LLM work |
| 9 to 12 | LLM contracts, retrieval experiments, agent execution, MCP, and the start of evaluation |
| 13 to 16 | Evaluation comparisons, capstone delivery, usage observation, and handoff |

For your route, begin LLM work in week 1 and bring forward the later blocks as familiar systems work is credited. Keep a weekly split of about 8 hours building and debugging, 4 hours reading and controlled experiments, and 3 hours evaluating, explaining decisions, and reviewing results. Spend additional available hours on the weakest technical topic. Reserve weeks 17 to 20 when the work needs them.

## Mastery standard

Score each dimension separately from 0 to 3. Zero means no working evidence. One means you complete a happy path with help. Two means you implement independently and explain the result. Three means you handle an unfamiliar variation and diagnose an injected failure.

The dimensions are mechanism, implementation, diagnosis, and transfer. For new material, aim for at least 2 in every dimension and 3 in diagnosis. Existing work or a short targeted challenge can supply evidence for familiar topics. A working tenant escape, duplicate external write after retry, or silent data loss needs repair before the affected workflow is ready. These are course criteria, not an industry certification.

Keep one evidence folder per module with the exact command, input seed, relevant package versions, result, explanation, and remaining limitation. Include one changed assumption, such as a second worker or delayed events, so the gate tests transfer. A week later, repeat one explanation and one failure without notes. Reopen the module if you cannot reproduce the reasoning.

## Reuse existing learning materials

The existing AI course can supply extra practice. Its ingestion, ACL, evaluation, runtime, and security lessons overlap with modules 04 and 08 to 11. Existing artifacts can satisfy a gate when they show the same behavior under the new failure drill. Do not count a page visit or a completed tutorial as evidence.

Keep TypeScript as the default UI language. Use Python for selected service and connector work to build role-relevant familiarity. Look up syntax and ecosystem details as needed. There is no separate language-learning gate.

## Start here

1. Write the one-page segment and domain decision. Name the target segment, the eligibility constraints, and the domain wedge for the capstone.
2. Start module 08 and choose an existing app or the course workbench as the base. Open the real-user pipeline in the same week: list 10 named teams or people in the chosen domain, and book the first discovery conversations.
3. Skim the Python checklist and look up unfamiliar items during implementation.
4. Use the optional gap review and systems failure drills when deciding what to revisit. The timeout lesson is available as a reference if that behavior needs review.
5. Bring your first model-backed workflow, its deterministic baseline, and observed failures to the next learning session.

## Optional depth after the core

Choose an extension when a target role or measured problem requires it. Infrastructure FDE work can add Linux networking, Kubernetes, Helm, private-cloud installation, and upgrade recovery. Data-platform work can add Spark execution, partitioning, and batch/stream processing. ML-platform work can add training pipelines, model serving, and GPU scheduling. Each deserves its own project and additional workload. They are outside the core workload estimate.

Technical reading links are in each module and RESOURCES.md. The concepts and exercises were prepared against primary documentation checked on 2026-11-06. Recheck API, SDK, and protocol details when starting a lab. Pin what you actually run.
