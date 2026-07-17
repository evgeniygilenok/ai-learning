// Central curriculum source of truth. Run `npm run curriculum:render` after edits.
export const reviewed = "2026-07-17";

export const stages = [
  { id: "orientation", order: 0, name: "Orientation and proof plan", type: "orientation", outcome: "Choose target roles, inspect the flagship system, and define the evidence you need.", milestone: "A role-to-proof matrix and a passing starter-project check.", evidence: "evidence/orientation/", gate: "Explain the chosen role, project domain, and proof gaps in five minutes.", workload: "2-3 hours", lessons: ["0036"] },
  { id: "foundations", order: 1, name: "Product foundations", type: "core", outcome: "Ship a product-triage vertical slice with validated output, visible streaming states, and bounded tools.", milestone: "A runnable triage flow behind a provider boundary.", evidence: "evidence/stage-1/", gate: "Show one successful run, one invalid-output failure, and the recovery path.", workload: "8-12 hours", lessons: ["0001", "0002", "0003", "0004", "0005"] },
  { id: "grounded-retrieval", order: 2, name: "Minimum viable grounded retrieval", type: "core", outcome: "Ingest a local corpus, retrieve evidence, cite sources, evaluate search, and trace the run.", milestone: "A cited answer path over the regulated-domain sample corpus.", evidence: "evidence/stage-2/", gate: "Run representative retrieval cases and diagnose at least one miss from its trace.", workload: "10-14 hours", lessons: ["0006", "0007", "0008", "0009"] },
  { id: "controlled-workflows", order: 3, name: "Controlled workflows", type: "core", outcome: "Add explicit workflow state, dry-run tools, approval, persistence, and resume behavior.", milestone: "A controlled case-resolution workflow with a human approval boundary.", evidence: "evidence/stage-3/", gate: "Pause before a write, resume safely, and prove the tool is not executed twice.", workload: "7-10 hours", lessons: ["0010", "0011"] },
  { id: "production-boundaries", order: 4, name: "Production boundaries", type: "core", outcome: "Set quality, tenancy, security, queue, retention, cost, latency, and infrastructure policies.", milestone: "A threat model, release gate, queue policy, and operating budget applied to the system.", evidence: "evidence/stage-4/", gate: "Defend a release decision using eval, trace, security, and operational evidence.", workload: "18-24 hours", lessons: ["0012", "0013", "0014", "0015", "0016", "0017", "0018", "0019", "0020"] },
  { id: "enterprise-hardening", order: 5, name: "Enterprise retrieval and agent hardening", type: "core", outcome: "Harden ingestion, ACL-aware hybrid retrieval, recovery, and trace-based agent evaluation.", milestone: "An ACL-aware retrieval pipeline and recoverable workflow evaluated against failures.", evidence: "evidence/stage-5/", gate: "Show an authorization test, a retrieval tradeoff, and a recovered agent failure.", workload: "12-18 hours", lessons: ["0021", "0022", "0023", "0024", "0025"] },
  { id: "portfolio-gate", order: 6, name: "Core portfolio and interview gate", type: "core", outcome: "Package the cumulative support assistant as a defensible product and system-design story.", milestone: "A documented portfolio package with an end-to-end walkthrough.", evidence: "evidence/stage-6/", gate: "Demonstrate user need, behavior, retrieval, workflow, eval, trace, security boundary, and tradeoffs.", workload: "10-16 hours", lessons: ["0026", "0027", "0030"], optionalLessons: ["0028", "0029"] },
  { id: "agent-runtime", order: 7, name: "Hardened agent runtime", type: "advanced specialization", outcome: "Implement orchestration, resumable state, governed memory, trace evals, and gated tool execution.", milestone: "A hardened agent runtime upgrade to the flagship workflow.", evidence: "evidence/specialization-agent-runtime/", gate: "Recover from an interrupted or failed tool run without duplicating side effects.", workload: "16-22 hours", lessons: ["0031", "0032", "0033", "0034", "0035"] },
  { id: "deployment", order: 8, name: "Deployment and adoption proof", type: "core", outcome: "Make the system reproducible, roll it out safely, collect feedback, and improve it from evidence.", milestone: "A deployed or reproducibly local release with real-user feedback.", evidence: "evidence/stage-8/", gate: "Reproduce the release from a clean checkout and show one feedback-driven measured change.", workload: "8-14 hours", lessons: ["0039", "0040"] },
  { id: "supporting", order: 9, name: "Supporting technical tracks", type: "supporting", outcome: "Strengthen quantitative judgment and provider portability when the core project needs them.", milestone: "An eval analysis notebook/report and a provider decision record.", evidence: "evidence/supporting/", gate: "Explain uncertainty in a score and defend a provider choice using the same task.", workload: "6-10 hours", lessons: ["0037", "0038"] },
  { id: "career", order: 10, name: "Parallel career loop", type: "parallel", outcome: "Translate project proof into targeted applications and interview feedback.", milestone: "A living application tracker and revised proof matrix.", evidence: "evidence/career/", gate: "Use interview or application evidence to make one specific portfolio improvement.", workload: "1-2 hours weekly", lessons: ["0041"] },
  { id: "workflow-specialization", order: 11, name: "Agentic workflow engineering", type: "advanced specialization", outcome: "Turn AI-assisted engineering into blocks, gates, reusable harness behavior, reviews, and improvement loops.", milestone: "A reproducible team agent workflow.", evidence: "evidence/specialization-workflows/", gate: "A new teammate can run the workflow and obtain equivalent checked evidence.", workload: "18-26 hours", lessons: ["0042", "0043", "0044", "0045", "0046", "0047", "0048", "0049"] }
];

const rawLessons = [
  ["0001","AI Engineering Map",20,"foundations","introduce","MISSION.md and starter/README.md","Map model uncertainty to product contracts","a marked architecture map names the product, retrieval, workflow, eval, operations, and security boundaries"],
  ["0002","Anatomy of a Model Call",25,"foundations","implement","starter/src/provider.ts","Add token budgets, timeout/error classes, rate-limit behavior, and model-version telemetry","the fake provider demonstrates success plus transient and permanent failure handling"],
  ["0003","Structured Outputs",30,"foundations","implement","starter/src/triage.ts","Validate model output before the product consumes it","valid input passes and malformed output produces a typed failure"],
  ["0004","Streaming UX",25,"foundations","implement","starter/src/app.ts","Expose queued, streaming, validating, complete, and failed states","a run visibly traverses states and recovers from an injected stream failure"],
  ["0005","Tool Calling Boundaries",30,"foundations","defend","starter/src/tools.ts","Separate model requests from policy, approval, execution, and audit","write tools default to dry-run and cannot execute without explicit approval"],
  ["0006","Semantic Search Starts With Chunks",25,"grounded-retrieval","introduce","starter/data/documents.json","Create source-aware chunks with stable IDs and metadata","every chunk traces to a source and carries fields required for filtering"],
  ["0007","RAG Context Packets",30,"grounded-retrieval","implement","starter/src/retrieval.ts","Assemble evidence, permissions, citations, and answer rules","answers cite only authorized retrieved chunks and decline without sufficient evidence"],
  ["0008","Retrieval Evals",30,"grounded-retrieval","implement","starter/evals/retrieval-cases.json","Measure recall, precision, ranking, and answerability on representative cases","the report includes slices, failure categories, uncertainty, and a before/after comparison"],
  ["0009","Tracing AI Runs",30,"grounded-retrieval","harden","starter/src/trace.ts","Trace model, retrieval, validation, latency, usage, and failure spans","one failed run can be diagnosed without reproducing it from memory"],
  ["0010","Controlled Workflow Agents",35,"controlled-workflows","implement","starter/src/workflow.ts","Encode workflow states, stop conditions, approvals, and tool transitions","a risky action pauses for approval and a rejected action reaches a safe terminal state"],
  ["0011","Memory And Persistence",30,"controlled-workflows","harden","starter/src/state.ts","Persist purpose-limited state with provenance, visibility, and retention","an interrupted run resumes from saved state without replaying completed effects"],
  ["0012","Model Routing And Caching",30,"production-boundaries","harden","starter/docs/optimization-decision.md","Choose among prompts, retrieval, tools, routing, model changes, and fine-tuning from eval evidence","the decision record compares quality, cost, latency, risk, and cache safety"],
  ["0013","Multi-Tenant AI Architecture",35,"production-boundaries","defend","starter/docs/tenant-boundaries.md","Apply tenant identity through retrieval, tools, memory, traces, caches, and jobs","cross-tenant negative tests fail closed at every named boundary"],
  ["0014","AI Security Threat Model",35,"production-boundaries","defend","starter/docs/threat-model.md","Model OWASP 2025, MCP, SSRF, confused-deputy, session, and scope risks","each high-risk misuse case has a prevention, detection, and response control"],
  ["0015","Portfolio System Design Story",35,"production-boundaries","defend","starter/docs/architecture.md","Update one authoritative architecture story with implemented evidence","the story links claims to code, evals, traces, and explicit tradeoffs"],
  ["0016","Eval Release Gates",30,"production-boundaries","harden","starter/evals/release-gate.json","Turn exact and semantic checks into ship, block, or review decisions","a known regression blocks release while an uncertain result requests review"],
  ["0017","LLM-As-Judge Tradeoffs",30,"production-boundaries","harden","starter/evals/judge-calibration.json","Calibrate semantic scorers against blinded human judgments","agreement, disagreements, slices, and limits are reported before the judge gates a release"],
  ["0018","Queues And Background Jobs",30,"production-boundaries","harden","starter/docs/operations.md","Set idempotency, retry budgets, backpressure, rate limits, and dead-letter handling","a duplicate job is harmless and overload has an explicit shedding or delay policy"],
  ["0019","Data Retention And Redaction",30,"production-boundaries","defend","starter/docs/data-policy.md","Define collection, redaction, access, retention, and deletion per artifact","sample traces preserve diagnostic value without retaining prohibited content"],
  ["0020","AI Infrastructure Decisions",35,"production-boundaries","defend","starter/docs/operations.md","Define SLOs, timeouts, rollout, rollback, incident review, deprecation, and drift signals","the system has measurable service targets and a tested rollback decision"],
  ["0021","Ingestion Pipeline Design",30,"enterprise-hardening","implement","starter/src/ingestion.ts","Build an idempotent source-to-index pipeline with provenance and deletion handling","re-ingestion is safe and a source update or deletion reaches every derived chunk"],
  ["0022","Metadata Filters And ACL",30,"enterprise-hardening","defend","starter/src/retrieval.ts","Enforce authorization before and during retrieval","unauthorized documents never enter candidates, context, citations, caches, or traces"],
  ["0023","Hybrid Search And Reranking",35,"enterprise-hardening","harden","starter/src/retrieval.ts","Compare lexical, semantic, hybrid, and reranked retrieval on the same cases","a tradeoff table supports the selected retrieval strategy by slice"],
  ["0024","Agent Retry And Recovery",30,"enterprise-hardening","harden","starter/src/workflow.ts","Classify retryable failures and recover without duplicating side effects","timeout, invalid result, and partial tool failure scenarios reach intentional outcomes"],
  ["0025","Agent Evaluation",35,"enterprise-hardening","defend","starter/evals/agent-cases.json","Evaluate path quality, tools, approvals, budgets, state, and final results","the suite catches an incorrect path even when the final prose looks acceptable"],
  ["0026","AI Support Assistant Design",35,"portfolio-gate","defend","starter/docs/product-brief.md","Tie trust, escalation, and source control to a real support workflow","the brief names users, risks, success measures, refusal behavior, and evidence"],
  ["0027","Enterprise RAG Design",35,"portfolio-gate","defend","starter/docs/architecture.md","Integrate source authority, ingestion, retrieval, security, evals, and observability","the architecture walkthrough follows one query and one deletion end to end"],
  ["0028","Coding Copilot Design",35,"portfolio-gate","defend","starter/docs/optional-coding-copilot.md","Transfer the course contracts to a coding-assistant context","the design constrains context, patches, execution, permissions, and evaluation"],
  ["0029","Personal Assistant Agent Design",35,"portfolio-gate","defend","starter/docs/optional-personal-assistant.md","Transfer memory and permission policies to a personal-assistant context","the design distinguishes read, draft, approval, write, retention, and revocation"],
  ["0030","Core Portfolio and Interview Gate",45,"portfolio-gate","defend","starter/evidence/completion-record.md","Assemble the cumulative evidence and rehearse an end-to-end defense","the completion record links working behavior, a failure, an eval, an operational observation, and a decision record for every core stage"],
  ["0031","Agent Orchestration Patterns",35,"agent-runtime","implement","starter/src/workflow.ts","Choose deterministic, routed, delegated, or handoff control per transition","the runtime makes control ownership and termination explicit"],
  ["0032","Agent State Management",35,"agent-runtime","harden","starter/src/state.ts","Version resumable state and protect transitions with idempotency","a stale or duplicated transition is detected and handled safely"],
  ["0033","Agent Memory Design",35,"agent-runtime","defend","starter/docs/data-policy.md","Govern working, episodic, semantic, and profile memory by purpose","memory writes have provenance, consent, retention, visibility, and deletion behavior"],
  ["0034","Agent Evaluation Harness",40,"agent-runtime","defend","starter/evals/agent-cases.json","Score traces, state transitions, tools, approvals, budgets, and outcomes","representative traces expose path regressions and support a release decision"],
  ["0035","Tool Execution Runtime",40,"agent-runtime","defend","starter/src/tools.ts","Add schema validation, policy, approval, idempotency, timeout, and audit gates","malicious, duplicated, timed-out, and unauthorized calls fail predictably"],
  ["0036","Target Role Skill Matrix",35,"orientation","introduce","starter/evidence/orientation/role-proof-matrix.md","Convert repeated job requirements into inspectable proof gaps","the matrix names target titles, evidence locations, current strength, and next build"],
  ["0037","Practical Eval Data Analysis",40,"supporting","harden","starter/evals/analysis.md","Interpret distributions, sampling error, confidence, slices, and tradeoffs","the report avoids over-reading one aggregate score and states uncertainty"],
  ["0038","Provider Comparison And Tool Ecosystem",45,"supporting","defend","starter/docs/provider-decision.md","Compare providers on one fixed task and durable contract","the decision uses measured quality, latency, cost, portability, safety, and operational fit"],
  ["0039","Deployable AI Portfolio",45,"deployment","defend","starter/docs/runbook.md","Make setup, secrets, data, health, SLOs, rollout, rollback, and retirement reproducible","a reviewer can start and verify the system from a clean checkout"],
  ["0040","Adoption Feedback Loop",35,"deployment","defend","starter/evidence/stage-8/feedback-report.md","Turn observed user friction into categorized evidence and an eval-backed change","one real feedback item produces a scoped change with a before/after result"],
  ["0041","AI Job Search Loop",45,"career","defend","starter/evidence/career/application-tracker.md","Use targeted applications and interviews as a portfolio feedback system","the tracker links each market signal to a specific proof update or deliberate no-change"],
  ["0042","Workflow Blocks And Quality Gates",35,"workflow-specialization","implement","starter/docs/workflow-graph.md","Decompose an agentic engineering process into blocks with checked contracts","each block names input, output, owner, failure behavior, and gate"],
  ["0043","Harness Skills Hooks And Subagents",40,"workflow-specialization","harden","starter/.codex/skills/","Encode one repeated task as scoped reusable harness behavior","the skill receives only needed context and its verification can fail"],
  ["0044","Scriptable Agent Blocks",40,"workflow-specialization","harden","starter/scripts/","Emit machine-checkable block output and validate it deterministically","invalid output exits nonzero and valid output composes with the next block"],
  ["0045","Agent Implementation Strategies",40,"workflow-specialization","defend","starter/docs/implementation-strategy.md","Choose direct, verification-loop, or orchestrator-worker execution by risk","the comparison ties strategy to coupling, checks, cost, latency, and recovery"],
  ["0046","Agentic Planning Definition Of Done",40,"workflow-specialization","defend","starter/docs/executable-plan.md","Translate ambiguous work into observable behavior, tests, evals, rollout, and non-goals","an independent reviewer can determine completion without inferring intent"],
  ["0047","AI-Assisted Code Review System",40,"workflow-specialization","defend","starter/docs/review-checklist.md","Review diffs against intent, evidence, security, and operational impact","every retained finding cites a file, requirement, or failed check"],
  ["0048","Workflow Continuous Improvement Loop",40,"workflow-specialization","defend","starter/evidence/specialization-workflows/retrospective.md","Turn write-ahead notes and eval failures into measured workflow changes","one change improves a repeated check without hiding a regression elsewhere"],
  ["0049","Team Agent Workflow Rollout",40,"workflow-specialization","defend","starter/docs/team-rollout.md","Package onboarding, permissions, fallbacks, ownership, and reproducibility","a new teammate can execute the workflow and produce equivalent evidence"],
];

const stageById = Object.fromEntries(stages.map((stage) => [stage.id, stage]));

export const lessons = rawLessons.map(([id, title, readingMinutes, stage, depth, artifact, practice, doneWhen], index) => ({
  id,
  title,
  readingMinutes,
  buildMinutes: Math.max(45, readingMinutes * 2),
  stage,
  stageName: stageById[stage].name,
  depth,
  status: stageById[stage].type,
  artifact,
  prerequisites: index === 0 ? ["Read MISSION.md", "Node.js 22+ for the flagship starter"] : prerequisiteFor(id, stage),
  outcomes: [
    `Explain the decision boundary behind ${title.toLowerCase()}.`,
    `${practice}.`,
    `Produce inspectable evidence in ${artifact}.`
  ],
  doneWhen,
  reference: referenceFor(stage),
  href: `lessons/${id}-${slugFor(id)}.html`
}));

function prerequisiteFor(id, stage) {
  const sameStage = rawLessons.filter((lesson) => lesson[3] === stage).map((lesson) => lesson[0]);
  const position = sameStage.indexOf(id);
  if (position > 0) return [`Complete lesson ${sameStage[position - 1]}`, "Keep the same flagship-project checkout and evidence bundle"];
  const stageInfo = stageById[stage];
  if (stageInfo.type === "core" && stageInfo.order > 1) return [`Pass the ${stages.find((candidate) => candidate.type === "core" && candidate.order < stageInfo.order && candidate.order === Math.max(...stages.filter((s) => s.type === "core" && s.order < stageInfo.order).map((s) => s.order)))?.name ?? "previous core"} gate`];
  return ["Complete the orientation and relevant core-stage prerequisites"];
}

function referenceFor(stage) {
  if (["controlled-workflows", "enterprise-hardening", "agent-runtime"].includes(stage)) return "../reference/agent-runtime-reference.html";
  if (stage === "workflow-specialization") return "../reference/agentic-workflow-reference.html";
  if (["orientation", "portfolio-gate", "deployment", "career"].includes(stage)) return "../reference/ai-engineering-job-readiness.html";
  return "../reference/ai-engineering-glossary.html";
}

function slugFor(id) {
  const slugs = {
    "0001":"ai-engineering-map","0002":"anatomy-of-a-model-call","0003":"structured-outputs","0004":"streaming-ux","0005":"tool-calling-boundaries","0006":"semantic-search-starts-with-chunks","0007":"rag-context-packets","0008":"retrieval-evals","0009":"tracing-ai-runs","0010":"controlled-workflow-agents","0011":"memory-and-persistence","0012":"model-routing-and-caching","0013":"multi-tenant-ai-architecture","0014":"ai-security-threat-model","0015":"portfolio-system-design-story","0016":"eval-release-gates","0017":"llm-as-judge-tradeoffs","0018":"queues-and-background-jobs","0019":"data-retention-and-redaction","0020":"ai-infrastructure-decisions","0021":"ingestion-pipeline-design","0022":"metadata-filters-and-acl","0023":"hybrid-search-and-reranking","0024":"agent-retry-and-recovery","0025":"agent-evaluation","0026":"ai-support-assistant-design","0027":"enterprise-rag-design","0028":"coding-copilot-design","0029":"personal-assistant-agent-design","0030":"final-portfolio-and-interview-drill","0031":"agent-orchestration-patterns","0032":"agent-state-management","0033":"agent-memory-design","0034":"agent-evaluation-harness","0035":"tool-execution-runtime","0036":"target-role-skill-matrix","0037":"practical-eval-data-analysis","0038":"provider-comparison-and-tool-ecosystem","0039":"deployable-ai-portfolio","0040":"adoption-feedback-loop","0041":"ai-job-search-loop","0042":"workflow-blocks-and-quality-gates","0043":"harness-skills-hooks-and-subagents","0044":"scriptable-agent-blocks","0045":"agent-implementation-strategies","0046":"agentic-planning-definition-of-done","0047":"ai-assisted-code-review-system","0048":"workflow-continuous-improvement-loop","0049":"team-agent-workflow-rollout"
  };
  return slugs[id];
}
