import { readFile, writeFile } from "node:fs/promises";
import { lessons, reviewed, stages } from "../assets/curriculum.mjs";

const root = new URL("../", import.meta.url);
const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));

for (const [index, lesson] of lessons.entries()) {
  const url = new URL(lesson.href, root);
  let html = await readFile(url, "utf8");
  html = html.replace(/<body(?: data-lesson-id="[^"]+")?>/, `<body data-lesson-id="${lesson.id}">`);
  if (!html.includes("../assets/course.css")) {
    html = html.replace("</head>", "  <link rel=\"stylesheet\" href=\"../assets/course.css\">\n</head>");
  }
  html = html.replace(/\n?\s*<!-- COURSE-CONTRACT:START -->[\s\S]*?<!-- COURSE-CONTRACT:END -->\n?/g, "\n");
  html = html.replace(/\n?\s*<!-- COURSE-DEPTH:START -->[\s\S]*?<!-- COURSE-DEPTH:END -->\n?/g, "\n");
  const headerEnd = html.indexOf("</header>");
  if (headerEnd === -1) throw new Error(`No header in ${lesson.href}`);
  const depth = renderDepthBrief(lesson.id);
  const insertion = `\n\n    <!-- COURSE-CONTRACT:START -->\n${renderContract(lesson, index)}\n    <!-- COURSE-CONTRACT:END -->${depth ? `\n\n    <!-- COURSE-DEPTH:START -->\n${depth}\n    <!-- COURSE-DEPTH:END -->` : ""}`;
  html = html.slice(0, headerEnd + 9) + insertion + html.slice(headerEnd + 9);
  await writeFile(url, html);
}

await writeFile(new URL("index.html", root), renderIndex());
await writeFile(new URL("courses/applied-ai-engineering.html", root), renderCourse());

function renderContract(lesson, index) {
  const { previous, next, alternate } = navigationFor(lesson, index);
  return `    <section class="course-contract" aria-labelledby="lesson-contract-title">
      <div class="course-contract__top">
        <div>
          <p class="course-contract__meta"><a href="../courses/applied-ai-engineering.html#${lesson.stage}">${escapeHtml(lesson.stageName)}</a> · ${escapeHtml(lesson.status)}</p>
          <h2 id="lesson-contract-title">Lesson contract</h2>
          <p>${lesson.readingMinutes} min reading · ${lesson.buildMinutes} min build · Artifact: <code>${escapeHtml(lesson.artifact)}</code></p>
        </div>
        <span class="course-contract__tag" data-depth="${lesson.depth}">${lesson.depth}</span>
      </div>
      <div class="course-contract__grid">
        <div><h3>Prerequisites</h3><ul>${prerequisitesFor(lesson).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
        <div><h3>Observable outcomes</h3><ul>${lesson.outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
        <div><h3>Done when</h3><p>${escapeHtml(lesson.doneWhen)}.</p><p><a href="${lesson.reference}">Open the stage companion reference</a>.</p></div>
      </div>
      <nav class="course-contract__nav" aria-label="Curriculum navigation">
        ${previous ? `<a rel="prev" href="../${previous.href}">← ${previous.id}: ${escapeHtml(previous.title)}</a>` : `<a href="../courses/applied-ai-engineering.html">← Main course</a>`}
        ${next ? `<a rel="next" href="../${next.href}">${next.id}: ${escapeHtml(next.title)} →</a>` : `<a href="../courses/applied-ai-engineering.html#completion">Completion gate →</a>`}
        ${alternate ? `<a href="../${alternate.href}">Optional branch: ${alternate.id} · ${escapeHtml(alternate.title)} ↗</a>` : ""}
      </nav>
    </section>`;
}

function navigationFor(lesson, index) {
  const byId = Object.fromEntries(lessons.map((candidate) => [candidate.id, candidate]));
  const overrides = {
    "0036": { previous: null, next: "0001" },
    "0001": { previous: "0036", next: "0002" },
    "0027": { previous: "0026", next: "0030", alternate: "0028" },
    "0028": { previous: "0027", next: "0029", alternate: "0030" },
    "0029": { previous: "0028", next: "0030" },
    "0030": { previous: "0027", next: "0039", alternate: "0031" },
    "0035": { previous: "0034", next: "0039", alternate: "0042" },
    "0039": { previous: "0030", next: "0040", alternate: "0031" },
    "0040": { previous: "0039", next: null, alternate: "0041" },
  };
  const override = overrides[lesson.id];
  if (!override) return { previous: lessons[index - 1], next: lessons[index + 1], alternate: null };
  return {
    previous: override.previous ? byId[override.previous] : null,
    next: override.next ? byId[override.next] : null,
    alternate: override.alternate ? byId[override.alternate] : null,
  };
}

function prerequisitesFor(lesson) {
  if (lesson.id === "0030") return ["Complete lessons 0026-0027", "Treat lessons 0028-0029 as optional design-transfer studios", "Keep the same flagship-project checkout and evidence bundle"];
  return lesson.prerequisites;
}

function renderDepthBrief(id) {
  const briefs = {
    "0008": ["Representative evidence beats a large convenient dataset", "Sample real task shapes and include common, high-risk, ambiguous, adversarial, stale, unauthorized, and unanswerable slices. Report retrieval recall and precision separately from answer quality; a single aggregate can hide a critical regression. Use confidence intervals or repeated resampling when a small score might be sampling noise, and keep a named failure taxonomy so each change targets a cause."],
    "0009": ["A trace is an operational record, not a prompt dump", "Capture stable run/model/version IDs, redacted inputs, retrieval IDs and scores, validation, tool decisions, latency, usage, retries, rate-limit events, and outcome. Set timeouts and retry budgets at span boundaries. A useful drift signal compares distributions or failure slices over time; it does not treat one unusual run as a trend."],
    "0012": ["Optimize in evidence order", "Start from an eval-defined baseline. Improve instructions/examples, then context or retrieval, then add a deterministic tool/check, then consider routing or a different model. Fine-tune only when the task is stable, the data is suitable, the baseline is reproducible, and measured benefit exceeds data, deployment, monitoring, and rollback cost."],
    "0016": ["A gate needs calibrated evidence and an explicit uncertain state", "Block exact contract, authorization, and safety regressions deterministically. Use representative slices for semantic quality, calibrate model graders against blinded human judgments, and route borderline or low-confidence results to review. Record who can override, why, for how long, and which follow-up case enters the suite."],
    "0017": ["Judge calibration is an experiment", "Blind and randomize examples, collect independent human labels, compare agreement overall and by slice, inspect disagreements, and state uncertainty. Do not let the same judge define the rubric, label the calibration set, and gate the release without independent checks; correlated errors can look like agreement."],
    "0018": ["Retries consume a shared reliability budget", "Set a per-attempt timeout and total retry budget, use exponential backoff with jitter, respect provider rate-limit headers, and cap concurrency. Define backpressure, load shedding, idempotency keys, dead-letter review, and replay behavior. A queue that accepts infinite work is delayed failure, not resilience."],
    "0020": ["Operate model versions like changing dependencies", "Name SLOs for task success, latency, availability, and authorization integrity. Roll out by stage or cohort, compare eval and production signals, keep a rollback path, and record model deprecation/retirement owners. Incident review should add or improve a case, trace field, alert, runbook, or boundary—not only blame a prompt."],
    "0025": ["Agent quality is a joint distribution over path and outcome", "Sample cases by workflow risk and production frequency. Score state transitions, tool selection/arguments, approvals, budgets, recovery, and result. Calibrate semantic scorers with humans and carry failed production traces back into offline suites; offline success is provisional until production slices agree."],
    "0034": ["Treat trace graders as fallible measurement instruments", "Version the task, rubric, grader, and model. Compare grader decisions with blinded human labels by failure slice, report uncertainty, and retain disagreements. Include success, recovery, refusal, budget exhaustion, duplicate-side-effect, and adversarial traces so the harness cannot pass by checking only polished happy paths."],
    "0035": ["MCP expands the authorization surface", "When tools arrive through MCP, prevent confused-deputy flows, token passthrough, SSRF, local-server compromise, session mix-ups, silent consent, and broad scopes. Validate schemas and destinations outside the model, bind authorization to the user and session, minimize scopes, add idempotency and timeout gates, and audit both denied and executed calls."],
    "0037": ["Read the distribution before the average", "Report counts, rates, and denominators; inspect distributions and slices; distinguish precision, recall, ranking, and task success; estimate sampling error or confidence; and state practical effect size. Multiple correlated examples do not create independent evidence, and a one-point aggregate change may be smaller than dataset uncertainty."],
    "0038": ["A provider decision is a controlled comparison", "Freeze the task, context, schema, cases, sampling settings, and scoring method. Measure quality by slice, latency distribution, cost per successful task, rate-limit behavior, portability, safety controls, data policy, observability, versioning, and retirement burden. Record the revisit trigger instead of declaring a permanent winner."],
    "0039": ["Deployment includes change and failure, not only startup", "Prove clean-checkout setup, health/readiness, secret and data handling, rate limits, SLOs, staged rollout, rollback, model/version retirement, drift signals, and an incident path. A reproducible local release is acceptable when external hosting is unnecessary, but the reviewer must be able to run the same checks."],
  };
  const brief = briefs[id];
  if (!brief) return "";
  return `    <section class="course-contract" aria-labelledby="depth-brief-${id}"><p class="course-contract__label">Technical depth</p><h2 id="depth-brief-${id}">${brief[0]}</h2><p>${brief[1]}</p></section>`;
}

function renderIndex() {
  const stageCards = stages.map((stage) => {
    const required = stage.lessons.map((id) => lessonCard(lessonById[id])).join("\n");
    const optional = (stage.optionalLessons ?? []).map((id) => lessonCard(lessonById[id], "optional")).join("\n");
    return `<section class="stage" id="${stage.id}">
      <div class="stage__head"><div><p class="eyebrow">${escapeHtml(stage.type)}</p><h2>${stage.order}. ${escapeHtml(stage.name)}</h2></div><p class="workload">${escapeHtml(stage.workload)}</p></div>
      <p>${escapeHtml(stage.outcome)}</p>
      <p class="gate"><strong>Gate:</strong> ${escapeHtml(stage.gate)}</p>
      <div class="grid">${required}${optional}</div>
    </section>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Applied AI Engineering Course</title>
<style>${indexCss()}</style></head><body><main>
<header><p class="eyebrow">Applied AI Engineering · reviewed ${reviewed}</p><h1>Build one reliable AI product, then prove it.</h1><p class="lede">The roadmap is organized by learning order, not lesson number. Follow the core stages sequentially; take supporting, career, and specialization tracks where marked.</p><div class="actions"><a href="courses/applied-ai-engineering.html">Open the complete course contract</a><a href="starter/README.md">Start the flagship project</a></div></header>
<section class="legend"><span>Core: sequential</span><span>Supporting: use when needed</span><span>Parallel: alongside the build</span><span>Advanced specialization: after the relevant core gate</span></section>
${stageCards}
<section><h2>Reference companions</h2><div class="grid">
${referenceCard("reference/ai-engineering-glossary.html","AI Engineering Glossary","Durable vocabulary for model, retrieval, eval, agent, and operations work.")}
${referenceCard("reference/agent-runtime-reference.html","Agent Runtime Reference","State, orchestration, memory, eval, and execution checklists.")}
${referenceCard("reference/agentic-workflow-reference.html","Agentic Workflow Reference","Blocks, gates, plans, review, and improvement loops.")}
${referenceCard("reference/ai-engineering-job-readiness.html","Job Readiness and Completion Record","Artifact rubric, evidence checklist, and interview proof.")}
</div></section>
<footer>Curriculum metadata lives in <code>assets/curriculum.mjs</code>. Run <code>npm run curriculum:render</code> after changing learning order or lesson contracts.</footer>
</main></body></html>`;
}

function renderCourse() {
  const rows = stages.map((stage) => `<tr id="${stage.id}"><td><strong>${stage.order}. ${escapeHtml(stage.name)}</strong><br><span class="pill">${escapeHtml(stage.type)}</span></td><td>${escapeHtml(stage.outcome)}</td><td>${escapeHtml(stage.milestone)}<br><code>${escapeHtml(stage.evidence)}</code></td><td>${escapeHtml(stage.gate)}</td><td>${escapeHtml(stage.workload)}</td></tr>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Course: Applied AI Engineering</title><style>${courseCss()}</style></head><body><main>
  <header><a class="back" href="../index.html">← Curriculum index</a><p class="eyebrow">Main course · last reviewed ${reviewed}</p><h1>Applied AI Engineering: from model call to production proof.</h1><p class="lede">A 12-16 week, self-paced course for an experienced TypeScript/product engineer. Build one regulated-domain support system in stages, test failure as deliberately as success, and finish with inspectable job-ready evidence.</p></header>
  <section class="grid"><article class="card"><h2>Prerequisites</h2><ul><li>Senior-level TypeScript and web/backend fundamentals.</li><li>Node.js 22+ and a local terminal.</li><li>Comfort with HTTP, schemas, async work, tests, and basic system design.</li><li>No ML research or advanced mathematics required.</li></ul></article><article class="card"><h2>Completion standard</h2><p>Pass every core stage gate, maintain the completion record, and deliver an end-to-end walkthrough from user need through feedback-driven improvement. Page views and easy drills do not count as mastery.</p></article></section>
  <section><h2>How the path works</h2><div class="grid"><article class="card"><h3>Core and sequential</h3><p>Stages 1-6 and 8 form the job-ready spine. Complete them in order.</p></article><article class="card"><h3>Supporting and parallel</h3><p>Use quantitative/provider tracks where the project needs them; run orientation and career proof alongside the build.</p></article><article class="card"><h3>Advanced specialization</h3><p>Agent runtime and workflow engineering deepen agent-heavy roles after their prerequisite core gates.</p></article><article class="card"><h3>Progressive depth</h3><p><strong>Introduce</strong> the model, <strong>implement</strong> it, <strong>harden</strong> failure behavior, then <strong>defend</strong> the decision with evidence.</p></article></div></section>
  <section><h2>Flagship project</h2><div class="callout"><p><strong>Default:</strong> a regulated-domain support and case-triage assistant over synthetic policy documents. It grows from structured model output into cited retrieval, controlled tools, resumable workflows, release gates, hardened operations, deployment, and adoption evidence.</p><p>Start in <a href="../starter/README.md"><code>starter/</code></a>. You may substitute another domain only if you document equivalent users, authoritative sources, permissions, risky actions, failure costs, and quality criteria.</p></div></section>
  <section><h2>Stage contracts</h2><div class="table-wrap"><table><thead><tr><th>Stage</th><th>Observable outcome</th><th>Milestone and evidence</th><th>Mastery gate</th><th>Workload</th></tr></thead><tbody>${rows}</tbody></table></div></section>
  <section><h2>Common evidence bundle</h2><div class="grid"><article class="card"><h3>Working behavior</h3><p>A reproducible command, UI path, test, or demo proving the increment works.</p></article><article class="card"><h3>Failed run</h3><p>A preserved failure, diagnosis from trace/eval evidence, and the resulting change.</p></article><article class="card"><h3>Quality result</h3><p>An eval or structured review with representative cases, slices, and stated uncertainty.</p></article><article class="card"><h3>Operational observation</h3><p>Latency, cost, rate-limit, queue, SLO, security, rollout, or user-feedback evidence.</p></article><article class="card"><h3>Decision record</h3><p>A concise tradeoff, alternatives considered, evidence, decision, and revisit trigger.</p></article></div></section>
  <section><h2>Artifact rubric</h2><div class="table-wrap"><table><thead><tr><th>Dimension</th><th>1 · Claim</th><th>2 · Partial</th><th>3 · Demonstrated</th><th>4 · Defensible</th></tr></thead><tbody><tr><td>Correctness and contract integrity</td><td>Happy-path description</td><td>Runs with implicit boundaries</td><td>Validated behavior and failure tests</td><td>Versioned contracts, negative tests, and recovery</td></tr><tr><td>Evidence and evaluation quality</td><td>Anecdote or demo</td><td>Small convenient sample</td><td>Representative cases, slices, and failure taxonomy</td><td>Human calibration, uncertainty, production feedback, and change history</td></tr><tr><td>Operational and security judgment</td><td>Risks named</td><td>Some controls</td><td>Measured SLO/limits and tested boundaries</td><td>Threats, detection, response, rollout, rollback, and incident learning</td></tr><tr><td>Explanation and tradeoff clarity</td><td>Technology list</td><td>Decision without evidence</td><td>Alternatives and evidence linked</td><td>Audience-aware defense with explicit revisit triggers</td></tr></tbody></table></div><p class="callout">Each core stage must score at least 3 in all four dimensions. The final gate requires at least two dimensions at level 4 and none below 3.</p></section>
  <section><h2>Challenging stage reviews</h2><ol><li><strong>Product foundations:</strong> the provider streams plausible but schema-invalid output while nearing a rate limit. Preserve useful UX and fail the contract safely.</li><li><strong>Grounded retrieval:</strong> aggregate retrieval improves while policy-version questions regress. Identify the misleading score and decide whether to ship.</li><li><strong>Controlled workflows:</strong> a write succeeds but the acknowledgment times out. Resume without duplicating the side effect.</li><li><strong>Production boundaries:</strong> a faster model lowers cost but changes refusal behavior for a regulated slice. Make and defend the release call.</li><li><strong>Enterprise hardening:</strong> a reranker improves relevance but exposes an unauthorized candidate in a trace. Diagnose the boundary failure.</li><li><strong>Portfolio gate:</strong> a reviewer challenges whether your evals resemble real use. Show sampling logic, limits, and the next evidence you would collect.</li><li><strong>Deployment and adoption:</strong> users bypass citations because they slow the task. Improve adoption without weakening trust controls.</li></ol></section>
  <section><h2>12-16 week pacing</h2><p>Weeks 1-2: orientation and foundations. Weeks 3-4: grounded retrieval. Week 5: controlled workflows. Weeks 6-8: production boundaries. Weeks 9-10: enterprise hardening. Weeks 11-12: portfolio gate. Weeks 13-14: deployment and feedback. Weeks 15-16 are buffer or specialization. A self-paced learner can stretch this sequence without changing the gates.</p></section>
  <section><h2>Optional extension briefs</h2><div class="grid"><article class="card"><h3>Multimodal documents</h3><p>Add one scanned or image-rich source. Preserve provenance, authorization, extraction confidence, citations, and modality-specific eval cases.</p></article><article class="card"><h3>Vision input</h3><p>Add one image-triage task with consent, retention, unsupported-content behavior, and calibrated human review.</p></article><article class="card"><h3>Voice/realtime</h3><p>Add turn-taking, interruption, latency budgets, confirmation before action, transcript policy, and replayable evals.</p></article><article class="card"><h3>Local/open model</h3><p>Repeat one fixed task and compare quality, hardware, privacy, latency, operations, and model-update responsibility.</p></article><article class="card"><h3>Fine-tuning experiment</h3><p>Only after a stable task and baseline: split suitable data, define success first, compare against prompt/retrieval/tool alternatives, and document rollback.</p></article></div></section>
  <section id="completion"><h2>Final completion gate</h2><div class="callout"><ul><li>All core lesson contracts and stage gates are complete.</li><li>The completion record links actual artifact locations.</li><li>A clean checkout can run the system and its representative eval suite.</li><li>The capstone walkthrough covers need, behavior, RAG, agents, evals, traces, security, operations, deployment, and post-feedback improvement.</li><li>The learner can show a failed run, diagnose it, change the system, and explain the measured result.</li><li>Sources and provider-specific claims carry review dates or versions.</li></ul></div></section>
  <footer>Source review: ${reviewed}. Source of truth: <code>assets/curriculum.mjs</code>. Companion references: <a href="../reference/ai-engineering-glossary.html">glossary</a>, <a href="../reference/agent-runtime-reference.html">agent runtime</a>, <a href="../reference/agentic-workflow-reference.html">workflow engineering</a>, and <a href="../reference/ai-engineering-job-readiness.html">job readiness</a>.</footer>
  </main></body></html>`;
}

function lessonCard(lesson, label = lesson.status) {
  return `<a class="lesson" href="${lesson.href}"><span class="number">${lesson.id} · ${escapeHtml(label)} · ${lesson.depth}</span><h3>${escapeHtml(lesson.title)}</h3><p>${lesson.readingMinutes} min read + ${lesson.buildMinutes} min build</p><code>${escapeHtml(lesson.artifact)}</code></a>`;
}

function referenceCard(href, title, copy) {
  return `<a class="lesson reference" href="${href}"><span class="number">Reference</span><h3>${title}</h3><p>${copy}</p></a>`;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function indexCss() {
  return `:root{color-scheme:light;--ink:#14202b;--muted:#5d6875;--line:#d7dee7;--paper:#f7f9fc;--panel:#fff;--teal:#0f766e;--blue:#2563eb;--amber:#b45309}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:var(--paper);line-height:1.55}main{max-width:1120px;margin:auto;padding:38px 22px 64px}header{padding-bottom:26px;border-bottom:2px solid var(--line)}h1{max-width:900px;margin:0;font-size:clamp(2.2rem,6vw,4.8rem);line-height:1.02}h2{margin:0;font-size:clamp(1.35rem,3vw,2rem)}h3{margin:0 0 8px}p{margin:8px 0}.lede{max-width:780px;color:var(--muted);font-size:1.08rem}.eyebrow,.number{color:var(--teal);font-size:.76rem;font-weight:800;letter-spacing:.07em;text-transform:uppercase}.actions,.legend{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.actions a,.legend span{padding:9px 12px;border-radius:999px;font-weight:700}.actions a{color:#fff;background:var(--blue);text-decoration:none}.legend span{border:1px solid var(--line);background:var(--panel);font-size:.86rem}.stage{margin:30px 0;padding-top:22px;border-top:1px solid var(--line)}.stage__head{display:flex;justify-content:space-between;gap:20px;align-items:end}.workload{white-space:nowrap;color:var(--muted);font-weight:700}.gate{max-width:900px;padding:10px 12px;border-left:4px solid var(--amber);background:#fff7ed}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:12px;margin-top:14px}.lesson{display:block;min-height:170px;padding:17px;border:1px solid var(--line);border-top:5px solid var(--teal);border-radius:8px;color:inherit;background:var(--panel);text-decoration:none}.lesson:hover{border-color:var(--blue);box-shadow:0 10px 26px rgba(20,32,43,.08)}.lesson p,.lesson code{color:var(--muted);font-size:.9rem}.reference{border-top-color:#6d28d9}footer{margin-top:34px;padding-top:18px;border-top:2px solid var(--line);color:var(--muted)}@media(max-width:650px){main{padding:26px 16px 46px}.stage__head{display:block}.lesson{min-height:0}}`;
}

function courseCss() {
  return `:root{color-scheme:light;--ink:#14202b;--muted:#5d6875;--line:#d7dee7;--paper:#f7f9fc;--panel:#fff;--teal:#0f766e;--blue:#2563eb;--amber:#b45309}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:var(--paper);line-height:1.6}main{max-width:1120px;margin:auto;padding:38px 22px 64px}header{padding-bottom:26px;border-bottom:2px solid var(--line)}.back,a{color:var(--blue);text-decoration-thickness:2px}.back{display:inline-block;margin-bottom:18px;font-weight:700}.eyebrow{color:var(--teal);font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}h1{max-width:940px;margin:0;font-size:clamp(2.2rem,6vw,4.6rem);line-height:1.02}h2{margin:0 0 12px;font-size:clamp(1.35rem,3vw,2rem)}h3{margin:0 0 8px}.lede{max-width:820px;color:var(--muted);font-size:1.08rem}section{margin:30px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:12px}.card,.callout{padding:18px;border:1px solid var(--line);border-radius:8px;background:var(--panel)}.card{border-top:5px solid var(--teal)}.callout{border-left:5px solid var(--amber);background:#fffaf2}.card p,.card ul,.callout p,.callout ul{margin-bottom:0}.table-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:8px}table{width:100%;border-collapse:collapse;background:var(--panel);font-size:.92rem}th,td{padding:12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}th{background:#eef4fb;color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}tr:last-child td{border-bottom:0}.pill{display:inline-block;margin-top:5px;color:var(--teal);font-size:.72rem;font-weight:800;text-transform:uppercase}code{font-size:.86em}footer{margin-top:34px;padding-top:18px;border-top:2px solid var(--line);color:var(--muted)}@media(max-width:650px){main{padding:26px 16px 46px}}@media print{body{background:#fff}.card,.callout{break-inside:avoid}}`;
}
