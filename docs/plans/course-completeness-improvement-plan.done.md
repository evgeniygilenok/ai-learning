# AI Engineering Course Completeness and Improvement Plan

**Prepared:** 2026-07-17  
**Scope:** Documentation and curriculum plan only; no course implementation is included in this change.

## Objective

Turn the current AI Engineering Roadmap from a strong collection of short lessons into a coherent, self-contained, job-ready applied AI engineering course for an experienced TypeScript/product engineer.

The requested outcome is a learner who can follow one visible path, build one working portfolio system in stages, prove mastery at each stage, and finish with current, defensible AI engineering judgment.

## Verdict: Is the Course Full?

**It is broad enough for the mission, but it is not yet a full course.**

The repository is already a strong roadmap and reference library:

- 49 lesson pages with 1,690 stated lesson minutes (about 28.2 hours before assignments).
- Approximately 21,300 words of visible lesson content, averaging about 435 words per lesson.
- 48 lessons with a build assignment or equivalent first-build target.
- 46 lessons with an interactive drill.
- Four reference guides and one well-structured eight-module specialization course.
- Strong coverage of the outcomes in `MISSION.md`: structured LLM features, RAG, controlled agents, evals, observability, security, production tradeoffs, portfolio packaging, and job readiness.

However, it is not yet self-contained or mastery-based:

- `index.html` presents 49 lessons as one flat numeric list even though the intended order is stage-based, partly optional, and partly parallel.
- Lesson 0030 says it finishes the roadmap, but 19 numbered lessons follow it.
- Lessons and notes still depend on deleted `plan-v*.md` files; lesson 0041 also uses Stage 4 and Stage 6 without defining those stages in the live site.
- Most assignments before the later specialization ask the learner to design, sketch, or write about a system rather than implement and run one.
- No lesson has an explicit learning-objectives section, only one lesson mentions a prerequisite, only one course has a completion gate, and only a small number of lessons contain a real rubric.
- The general roadmap has no single course page with prerequisites, stage outcomes, total workload, artifacts, optional tracks, and a final completion standard. The specialization course does have this structure and should become the model.
- Some sources are already entering a maintenance window. For example, OpenAI's current evaluation guide says its legacy Evals platform becomes read-only on 2026-10-31 and is scheduled to shut down on 2026-11-30, while many lessons still link to the older generic Evals pages.

The right framing is therefore: **keep the scope, strengthen the course system.** Adding many more disconnected lessons would make the main problem worse.

## Definition of a Full Course

For this repository, “full” should mean complete for the stated applied AI engineering mission—not exhaustive coverage of ML research, foundation-model training, every provider API, or GPU infrastructure.

The course is complete when:

1. A learner can see the core path, optional specializations, parallel job-search work, prerequisites, time expectations, and completion criteria from one page.
2. Every stage has observable learning outcomes, named portfolio artifacts, and a mastery gate.
3. The learner incrementally builds and operates one real system rather than completing mostly paper designs.
4. Lessons distinguish concept introduction, implementation practice, review, and proof.
5. The final capstone integrates product behavior, RAG, agents, evals, traces, security, deployment, and explanation.
6. Sources are versioned or review-dated so fast-moving APIs do not silently make the course stale.
7. Optional breadth—multimodal, voice, fine-tuning, local models, deeper infrastructure—is clearly separated from the job-ready core.

## Current-State Coverage Matrix

| Area | Current coverage | Assessment | Improvement needed |
| --- | --- | --- | --- |
| LLM product foundations | 0001-0005 | Good introductory coverage | Add a real running vertical slice, error/rate-limit behavior, context/token budgeting, and an explicit stage gate. |
| RAG and search | 0006-0009, 0021-0023, 0027 | One of the strongest areas | Connect both passes into one implemented ingestion/retrieval system and clarify core versus advanced depth. |
| Evals and observability | 0008-0009, 0016-0017, 0025, 0034, 0037 | Broad but repetitive | Add dataset design, human calibration, online/offline feedback, failure taxonomy, and one cumulative eval report. |
| Agents and tool execution | 0005, 0010-0011, 0024-0025, 0031-0035, 0042-0049 | Very strong breadth | Remove overlap through an explicit basic-to-runtime-to-workflow-specialization progression. |
| Security and governance | 0013-0014, 0019, 0022, 0035, 0038 | Good boundaries, shallow practice | Update to OWASP 2025, add MCP-specific threats, red-team practice, and a lightweight NIST AI RMF mapping. |
| Production operations | 0009, 0012, 0018-0020, 0039 | Important topics are present | Add rate limits, backpressure, timeouts, SLOs, staged rollout, incident response, model retirement, and operational drift. |
| Model optimization choices | Scattered; optional fine-tuning only existed in deleted plans | Incomplete | Teach how to choose among prompting, retrieval, tools, model changes, and fine-tuning after an eval-defined baseline. |
| Quantitative foundations | 0008, 0017, 0037 | Too implicit | Add practical precision/recall, distributions, confidence intervals or uncertainty, sampling, and experiment interpretation without turning into an ML-math detour. |
| Portfolio and hiring proof | 0015, 0026-0030, 0036, 0039-0041 | Strong content | Repair ordering, remove deleted-plan dependencies, and connect every stage artifact to the final package. |
| Multimodal and voice | Not covered | Optional gap | Add only as a clearly optional extension after the core capstone is sound. |

## Ordered Implementation Plan

### 1. Establish One Live Curriculum Source of Truth

**Priority:** P0  
**Affected components:** `MISSION.md`, `index.html`, proposed `courses/applied-ai-engineering.html`, `courses/agentic-workflow-engineering.html`, `NOTES.md`, lessons 0015, 0020, 0030, 0036, 0038, and 0041.

1. Create a new main course page at the proposed path `courses/applied-ai-engineering.html` using the existing specialization page as the structural model.
2. Move the stage map that previously lived in the deleted roadmap plans into this tracked course page. Label every stage as one of:
   - core and sequential;
   - advanced specialization;
   - optional extension;
   - parallel career activity.
3. Reorganize `index.html` around stage cards instead of one flat 0001-0049 grid. Preserve all existing lesson URLs.
4. Put lesson 0036 in orientation, lessons 0037-0038 in named supporting tracks, lessons 0039-0040 after portfolio packaging, lesson 0041 in a parallel job-search track, and lessons 0042-0049 under their specialization.
5. Rename or reframe lesson 0030 so it is the core-path portfolio gate rather than the literal end of the entire roadmap. A title such as “Core Portfolio and Interview Gate” would match its actual role.
6. Remove all learner-facing references to `plan-v1.md`, `plan-v2.md`, and `plan-v4.md`. Replace them with links to the live main course page or with the actual information the learner needs.
7. Replace undefined “Stage 4/Stage 6” references in lesson 0041 with linked stage names.
8. Decide whether `NOTES.md` is internal authoring context or learner-facing documentation. If internal, make that explicit and remove dependencies on deleted files.

**Done when:** a learner can determine the correct path and stage meaning without access to git history or deleted plan files.

### 2. Add a Consistent Learning Contract to Every Stage and Lesson

**Priority:** P0  
**Affected components:** `courses/applied-ai-engineering.html`, `lessons/*.html`, and the four files in `reference/`.

1. Define a standard lesson contract with:
   - prerequisites;
   - 2-4 observable learning outcomes;
   - estimated reading time and separate build time;
   - the artifact modified by the lesson;
   - “done when” criteria;
   - a short self-check or review rubric;
   - next lesson and alternate/optional branches.
2. Add a stage contract to the main course page with:
   - stage outcome;
   - lesson list;
   - implementation milestone;
   - evidence artifact;
   - mastery gate;
   - expected cumulative workload.
3. Use progressive depth labels—**introduce**, **implement**, **harden**, and **defend**—to explain intentional repetition, especially across RAG, evals, memory, agents, and tool execution.
4. Turn the existing references into active stage companions by linking the relevant glossary or checklist section from each lesson.

**Done when:** every lesson makes clear what the learner will do, what evidence it produces, and how to know whether the work is adequate.

### 3. Make One Executable Flagship Project the Course Spine

**Priority:** P0  
**Affected components:** lessons 0001-0035 and 0037-0040, the proposed main course page, and a proposed starter-project location that must be chosen before implementation.

1. Choose a project distribution strategy:
   - recommended: a small companion starter repository that learners fork into their portfolio; or
   - alternative: a new, clearly separated `starter/` area in this repository.
2. Provide only enough starter structure to remove setup friction: a TypeScript app shell, provider adapter boundary, fake domain documents, mock read/write tools, sample inputs, and an initial eval-data shape. Do not provide a finished portfolio solution.
3. Map each stage to a running increment:
   - Stage 1: product triage flow with validated structured output and visible streaming states;
   - Stage 2: ingested local corpus, citations, retrieval cases, and traces;
   - Stage 3: explicit workflow state, dry-run tools, approval, and resume behavior;
   - Stage 4: threat model, data policy, release gate, queues, and cost/latency budgets;
   - Stage 5: ACL-aware hybrid retrieval, failure analysis, and agent recovery;
   - Stage 6: documented and defensible portfolio package;
   - Stage 7: hardened agent runtime;
   - Stage 8: reproducible deployment and real-user feedback.
4. Replace “mentally,” “sketch,” and purely hypothetical assignments with either an implementation step or a named design artifact that directly controls a later implementation step.
5. Require each stage to leave a small evidence bundle: working behavior, one failure case, an eval or review result, one operational observation, and a short decision record.
6. Keep the fintech/regulated-domain material as the recommended sample corpus, while allowing learners to substitute a domain if they can define equivalent users, risks, and quality criteria.

**Done when:** the course can be completed by incrementally changing one runnable system, and the final portfolio is the accumulated result rather than a separate end-of-course exercise.

### 4. Consolidate Repetition Into Deliberate Depth

**Priority:** P1  
**Affected components:** lessons 0006-0009, 0010-0011, 0015-0017, 0021-0025, 0030-0035, and 0042-0049.

1. Keep both RAG passes, but define the first as “minimum viable grounded retrieval” and the second as “enterprise retrieval hardening.”
2. Keep both agent passes, but define:
   - 0010-0011 as controlled workflow concepts;
   - 0024-0025 as reliability and evaluation;
   - 0031-0035 as runtime implementation;
   - 0042-0049 as engineering-process specialization.
3. Merge duplicated artifact requests. For example, one agent state design should evolve across lessons rather than being recreated in several formats.
4. Use lesson 0015 as an interim architecture review, lesson 0030 as the core portfolio gate, and lessons 0039-0040 as deployment/adoption proof.
5. Add cross-links that say what prior artifact is being upgraded and what new property is introduced.

**Done when:** repeated topics feel cumulative and no assignment asks the learner to redesign an artifact whose authoritative version is unclear.

### 5. Close the Core Technical Depth Gaps

**Priority:** P1  
**Affected components:** primarily lessons 0002, 0008-0009, 0012, 0014, 0016-0020, 0025, 0034-0039; add a new lesson only if the material cannot fit coherently into an existing stage.

1. Expand model-call foundations in lesson 0002 with context/token budgeting, parameter choices, transient versus permanent failures, rate limits, and model/version change awareness.
2. Add a practical optimization decision framework near lessons 0012/0038:
   - improve instructions/examples;
   - improve context or retrieval;
   - add a deterministic tool;
   - change model or routing;
   - fine-tune only with a stable task, suitable data, and eval-defined success.
3. Deepen evals across lessons 0008, 0016-0017, 0025, 0034, and 0037 with representative sampling, failure taxonomies, scorer calibration against human judgment, confidence/uncertainty, and offline-to-production feedback.
4. Deepen production operations across lessons 0009, 0018, 0020, and 0039 with timeouts, retry budgets, backpressure, rate limits, SLOs, rollout/rollback, model deprecation, incident review, and drift signals.
5. Update lesson 0014 and the tool lessons for current security practice:
   - map threats to OWASP Top 10 for LLM Applications 2025;
   - add red-team scenarios and misuse cases;
   - add MCP confused-deputy, token-passthrough, SSRF, local-server, session, and scope-minimization risks;
   - add a lightweight NIST AI RMF Govern/Map/Measure/Manage mapping for regulated-industry communication.
6. Make practical quantitative foundations explicit in lesson 0037 and the RAG/eval lessons: precision, recall, ranking metrics, distributions, sampling error, tradeoff tables, and how not to over-read a single aggregate score.

**Done when:** a learner can not only describe the architecture, but also diagnose quality, operational, and security failures with measured evidence.

### 6. Replace Easy Drills With Mastery Evidence

**Priority:** P1  
**Affected components:** `lessons/*.html`, the proposed main course page, and `reference/ai-engineering-job-readiness.html`.

1. Keep the short interactive cards as retrieval practice, but do not treat them as proof of mastery.
2. Add one challenging scenario per stage with incomplete requirements, plausible distractors, and a required written or implemented decision.
3. Create a common artifact rubric with four dimensions:
   - correctness and contract integrity;
   - evidence and evaluation quality;
   - operational and security judgment;
   - explanation and tradeoff clarity.
4. Add stage review prompts that make the learner show a failed run, diagnose it, change the system, and explain the result.
5. Make the final capstone require an end-to-end walkthrough from user need through implementation, evaluation, trace diagnosis, security boundary, deployment, and post-feedback improvement.
6. Add a completion record or checklist that points to the actual artifact locations rather than relying on lesson completion alone.

**Done when:** completion means demonstrated capability, not clicking through 49 pages.

### 7. Separate Core, Specialization, and Optional Breadth

**Priority:** P2  
**Affected components:** the proposed main course page, `index.html`, `courses/agentic-workflow-engineering.html`, lessons 0031-0038 and 0042-0049, and `RESOURCES.md`.

1. Define a job-ready core that stops after deployment/adoption and portfolio proof.
2. Keep agent runtime and agentic workflow engineering as linked specializations rather than making all 13 advanced agent lessons mandatory.
3. Keep provider comparison and practical Python/data analysis as supporting tracks with explicit placement.
4. Add optional extension briefs—not mandatory core lessons—for multimodal documents, image/vision input, voice/realtime interaction, local/open models, and a small fine-tuning experiment.
5. Require every optional extension to preserve the same contract/eval/security discipline as the core.

**Done when:** learners can finish a credible course without completing every specialist topic, while advanced learners still have a clear continuation path.

### 8. Create a Source Freshness and Deprecation Process

**Priority:** P1  
**Affected components:** `RESOURCES.md`, all lesson footers, reference pages, and `sources/agentic-workflow-masterclass-outline.md`.

1. Add “last reviewed” dates and, where relevant, version labels to external source groups.
2. Replace legacy OpenAI Evals links with the current evaluation best-practices and supported evaluation workflow pages; preserve vendor-neutral concepts in the lesson text.
3. Update OWASP references to the 2025 LLM/GenAI list and record which lesson covers each relevant category.
4. Add the official MCP security-best-practices page to the security/tool sections.
5. Add the NIST AI RMF Generative AI Profile and note that AI RMF 1.0 is currently being revised, so the course should identify the version it teaches.
6. Resolve the source-note TODO by recovering the original agentic workflow outline if available. If it is unavailable, label the reconstructed outline as the permanent source basis instead of leaving an indefinite TODO.
7. Add a lightweight quarterly source review checklist covering dead links, renamed APIs, deprecations, security framework changes, and provider-specific examples.

**Current primary references for this refresh:**

- [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)
- [OpenAI production best practices](https://developers.openai.com/api/docs/guides/production-best-practices)
- [OpenAI Agents SDK guide](https://developers.openai.com/api/docs/guides/agents)
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- [NIST AI Resource Center and AI RMF resources](https://airc.nist.gov/)
- [Model Context Protocol security best practices](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices)

**Done when:** every external dependency has a review date and the course contains no known soon-to-be-retired primary learning path.

### 9. Reduce Static-Site Maintenance Cost

**Priority:** P2  
**Affected components:** all HTML files; proposed shared assets and curriculum metadata.

1. Define a proposed central curriculum manifest containing lesson ID, title, stage, core/optional status, prerequisites, reading time, build time, artifact, and next links.
2. Generate or render the roadmap navigation from that manifest so numeric order cannot silently diverge from learning order.
3. Move repeated inline presentation rules and repeated interaction behavior into shared assets while preserving the current no-build accessibility if desired.
4. Add stage breadcrumbs, previous/next navigation, core/optional labels, and printable artifact checklists.
5. Consider local progress tracking only after the curriculum structure is stable; progress must be stage/artifact based, not page-view based.

**Done when:** stage changes and metadata updates can be made once instead of manually across dozens of standalone pages.

## Recommended Rollout

### Milestone A: Integrity Release

- Complete Steps 1 and 8's urgent link/deprecation work.
- Publish the main course page and stage-aware index.
- Remove deleted-plan dependencies and undefined stages.
- Reframe lesson 0030.

This produces an honest, navigable roadmap without waiting for new content.

### Milestone B: Course Contract Release

- Complete Step 2 for the core path first.
- Define stage artifacts, rubrics, build time, and completion gates.
- Publish the flagship project distribution decision.

### Milestone C: Hands-On Core Release

- Complete Step 3 for Stages 1-6 and deployment/adoption.
- Consolidate assignments under Step 4.
- Upgrade mastery scenarios under Step 6.

### Milestone D: Technical Depth Release

- Complete Step 5 and the remaining source refresh.
- Add optional extension briefs.
- Update agent runtime and workflow specializations to the common contract.

### Milestone E: Maintainability Release

- Introduce the curriculum manifest and shared assets.
- Add stage/artifact-based progress support if still useful.

## Decisions and Assumptions

- **Assumption:** “full” means job-ready applied AI engineering for the learner described in `MISSION.md`, not a comprehensive ML engineering or AI research degree.
- **Decision:** Keep one cumulative portfolio product as the teaching spine.
- **Decision:** Improve depth, execution, and evidence before adding more lesson count.
- **Decision:** Keep TypeScript as the main implementation language and use Python only for practical data/eval work.
- **Decision:** Keep security and evaluation inside every stage instead of isolating them at the end.
- **Decision:** Treat agent runtime and agentic workflow engineering as specializations, not mandatory breadth for every applied AI role.
- **Assumption:** Existing lesson URLs should remain stable.
- **Assumption:** The site can remain static during the curriculum repair; shared metadata/assets are a later maintainability improvement.

## Risks and Dependencies

- A hands-on course depends on choosing where the starter project lives. Splitting it into a companion repository improves portfolio realism but adds version coordination.
- Converting all 49 lessons at once risks inconsistent metadata and assignment churn. Apply the new contract stage by stage, beginning with the core.
- Provider documentation changes rapidly. Course prose should teach durable contracts, while provider-specific code and links should be review-dated examples.
- A fintech-specific capstone gives stronger domain depth but may narrow general appeal. Use regulated-industry sample data as the default while permitting equivalent domains.
- The original source attachment for the agentic workflow specialization is unavailable in the repository. Recover it if possible; otherwise preserve and explicitly own the reconstructed outline.
- Adding optional breadth before the core project is executable would recreate the current “wide but not full” problem.

## Material Questions to Resolve Before Step 3

1. Should the starter project live in this repository or in a separate learner-facing companion repository? **Recommendation:** separate companion repository, versioned together with the course.
2. Is fintech the default capstone domain or only one example? **Recommendation:** default regulated/fintech-style corpus with a documented substitution rule.
3. Should completion target a 12-16 week guided path or a self-paced reference experience? **Recommendation:** design for a 12-16 week core path while keeping individual lessons independently useful.

## Final Completion Gate

The course improvement is complete when:

- One main course page defines the entire learning path.
- No live page depends on deleted plans or undefined stage names.
- Core, specialization, optional, and parallel work are visibly distinct.
- Every core lesson has outcomes, prerequisites, build time, artifact, and done criteria.
- Every core stage changes a runnable flagship project and produces inspectable evidence.
- Repeated topics have explicit depth progression rather than duplicate assignments.
- The capstone demonstrates product behavior, retrieval, agents, evals, traces, security, operations, deployment, and explanation.
- Current official sources are linked and review-dated.
- A learner can finish using only tracked course materials and the chosen starter-project distribution.

