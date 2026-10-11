import { mkdir, writeFile } from "node:fs/promises";
import { lessons, practiceCourse as course, practiceSessions as sessions, practiceStudios as studios } from "../assets/curriculum.mjs";
import { practiceDiagrams, practiceProductDiagram } from "../assets/practice-diagrams.mjs";

const root = new URL("../", import.meta.url);
const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
const escape = value => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const list = values => `<ul>${values.map(value => `<li>${escape(value)}</li>`).join("")}</ul>`;
const paragraphs = values => values.map(value => `<p>${escape(value)}</p>`).join("\n");

function renderDiagram(diagram, id) {
  if (!diagram) throw new Error(`Missing teaching diagram for ${id}`);
  const groups = diagram.groups.map(group => {
    const content = group.kind === "schema"
      ? `<dl class="diagram-fields">${group.fields.map(([field, description]) => `<div><dt>${escape(field)}</dt><dd>${escape(description)}</dd></div>`).join("")}</dl>`
      : `<${group.kind === "flow" ? "ol" : "ul"} class="diagram-nodes diagram-nodes--${group.kind}">${group.nodes.map(node => `<li class="diagram-node">${node.owner ? `<span class="diagram-owner">${escape(node.owner)}</span>` : ""}<strong>${escape(node.title)}</strong><p>${escape(node.detail)}</p></li>`).join("")}</${group.kind === "flow" ? "ol" : "ul"}>`;
    return `<div class="diagram-group"><h3>${escape(group.label)}</h3>${content}</div>`;
  }).join("\n");
  return `<figure class="teaching-diagram" aria-labelledby="${id}-title" aria-describedby="${id}-caption"><h2 id="${id}-title">${escape(diagram.title)}</h2>${groups}<figcaption id="${id}-caption">${escape(diagram.caption)}</figcaption></figure>`;
}

function page(title, body, prefix) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Build and operate a bounded synthetic support assistant in 20 practical sessions."><title>${escape(title)} | Agentic engineering practice</title><link rel="stylesheet" href="${prefix}assets/practice.css"></head>
<body><a class="skip" href="#main">Skip to content</a><main id="main">${body}
<footer><p>Source review: ${course.reviewed}. Original explanations and exercises. Curriculum source: <a href="${prefix}assets/practice.mjs">practice metadata</a>, exported through <a href="${prefix}assets/curriculum.mjs">curriculum.mjs</a>.</p><p>Executable examples use the local terminal path. Recheck provider, MCP, and coding-environment documentation when changing those examples.</p></footer></main></body></html>\n`;
}

function sessionPage(session, index) {
  const module = course.modules[session.module - 1];
  const previous = sessions[index - 1];
  const next = sessions[index + 1];
  const prerequisiteLinks = session.prerequisites.map(id => id.startsWith("practice-") && id !== "practice-setup"
    ? `<a href="${id}.html">${escape(id)}</a>`
    : `<a href="../agentic-engineering-practice.html#${id === "practice-setup" ? "setup" : id}">${escape(id)}</a>`).join(", ");
  return page(session.title, `
<header><nav aria-label="Breadcrumb"><a href="../../index.html">Learning hub</a><span>/</span><a href="../agentic-engineering-practice.html">Practice course</a></nav>
<p class="eyebrow">Week ${session.module} · ${escape(module.title)}</p><h1>${String(session.number).padStart(2, "0")}. ${escape(session.title)}</h1>
<p class="lede">${session.minutes.explain} minutes explanation · ${session.minutes.build} minutes building · ${session.minutes.review} minutes review</p></header>
<div class="session-layout"><aside aria-label="Session guide"><p>Prerequisites: ${prerequisiteLinks}.</p><nav aria-label="Page sections"><a href="#understand">Understand</a><a href="#diagram">Diagram and schema</a><a href="#example">Worked example</a><a href="#guided">Guided build</a><a href="#exercise">Your task</a><a href="#failure">Failure investigation</a><a href="#exit">Exit explanation</a></nav><p>Record the result in <a href="../../starter/evidence/agentic-engineering-practice/module-${session.module}.md"><code>${escape(session.artifact)}</code></a>.</p></aside>
<article data-practice-id="${session.id}">
<section class="contract"><h2>What you will demonstrate</h2>${list(session.objectives)}<p>${escape(session.doneWhen)}</p></section>
<section id="understand"><h2>Understand the mechanism</h2>${paragraphs(session.explanation)}</section>
<section id="diagram">${renderDiagram(practiceDiagrams[session.id], session.id)}<p class="diagram-prompt">Trace the diagram against the worked example. Explain who owns each decision and what evidence reaches the next step.</p></section>
<section id="example"><h2>Worked example</h2><p>${escape(session.workedExample)}</p><pre><code>${escape(session.example)}</code></pre><p class="muted">Run shell examples at the repository root. Commented sketches describe learner code to write; they are not additional installed commands.</p></section>
<section id="guided"><h2>Guided build · 30 minutes</h2><ol>${session.guided.map(item => `<li>${escape(item)}</li>`).join("")}</ol></section>
<section id="exercise"><h2>Your task · 15 minutes</h2><p>${escape(session.exercise)}</p></section>
<section id="failure" class="failure"><h2>Failure investigation · 10 minutes</h2><p>${escape(session.failure)}</p><p>Before running, predict the state, evidence, and effect count. Then compare your prediction with the record and name the responsible layer.</p></section>
<section id="exit"><h2>Exit explanation · 20 minutes</h2><p>${escape(session.exit)}</p><p>Explain the result in your own words and link the supporting command, code change, or redacted record. A missing prerequisite uses the next session's time.</p></section>
<section><h2>Supporting material</h2><p>Use these only where the current exercise needs more depth.</p><ul>${session.supportingLessons.map(id => { const lesson = lessonById.get(id); return `<li><a href="../../${lesson.href}">${id}: ${escape(lesson.title)}</a></li>`; }).join("")}</ul><p><a href="../../starter/docs/agentic-engineering-practice.md">Operating guide and source-review notes</a></p></section>
</article></div>
<nav class="next-prev" aria-label="Session navigation">${previous ? `<a rel="prev" href="${previous.id}.html">Previous: ${escape(previous.title)}</a>` : '<a href="../agentic-engineering-practice.html#setup">Setup</a>'}${session.number % 5 === 0 ? `<a href="../agentic-engineering-practice.html#studio-${session.module}">Pass studio ${session.module} before continuing</a>` : ""}${next ? `<a rel="next" href="${next.id}.html">Next: ${escape(next.title)}</a>` : '<a href="../agentic-engineering-practice.html#completion">Completion review</a>'}</nav>`, "../../");
}

function coursePage() {
  const modules = course.modules.map((module, index) => {
    const number = index + 1;
    const studio = studios[index];
    return `<section id="module-${number}"><div class="module-head"><p class="eyebrow">Week ${number} · ${course.weeklyHours[index]} hours</p><h2>${number}. ${escape(module.title)}</h2><p>${escape(module.outcome)}. Prerequisite: ${escape(module.prerequisite)}.</p></div>
<div class="session-grid">${sessions.filter(session => session.module === number).map(session => `<a class="session-card" href="practice/${session.id}.html"><span>Session ${String(session.number).padStart(2, "0")} · 90 minutes</span><h3>${escape(session.title)}</h3><p>${escape(session.objectives[0])}.</p></a>`).join("")}</div>
<article class="studio" id="${studio.id}"><p class="eyebrow">Integration studio ${number} · ${studio.minutes / 60} hours</p><h3>${escape(studio.title)}</h3><p>${escape(studio.task)}</p>${list(studio.cases)}<p><strong>Pass when</strong> ${escape(studio.doneWhen)}</p><p>Record evidence in <a href="../starter/evidence/agentic-engineering-practice/module-${number}.md">module ${number}'s record</a>.</p></article>
${course.handoffMinutes[index] ? `<p class="handoff">Reserve ${course.handoffMinutes[index]} minutes this week for ${number === 2 ? "architecture and operating notes" : number === 3 ? "fresh setup instructions and the demonstration script" : "the final demonstration and handoff"}. This time is included in the weekly total.</p>` : ""}</section>`;
  }).join("\n");
  return page(course.title, `
<header><nav aria-label="Breadcrumb"><a href="../index.html">Learning hub</a><span>/</span><a href="applied-ai-engineering-roadmap.html">Full AI roadmap</a></nav><p class="eyebrow">Four weeks · 20 sessions · one evolving product</p><h1>Build it. Explain it. Recover it.</h1><p class="lede">Use a coding agent to develop a support assistant. Build its runtime agent, give an operator a clear approval decision, and recover queued work after interruption.</p><div class="actions"><a href="#setup">Start with setup</a><a href="#module-1">Browse the sessions</a><a href="../starter/docs/agentic-engineering-practice.md">Open the operating guide</a></div></header>
<section class="intro-grid"><article class="contract"><h2>The working product</h2><p>A local support operator submits a synthetic transfer case, reads policy evidence, reviews an escalation proposal, and approves or rejects it. Later, the same assistant processes a finite queue with durable state and synthetic effects.</p><p>Keep the coding agent's project instructions separate from the runtime agent's inputs and authority. The application owns authorization and approval.</p></article><article class="contract"><h2>Who this is for</h2><p>Experienced TypeScript engineers comfortable with async code, HTTP, Git, and a terminal. Use Node.js 22.13 or newer and one coding-agent environment. The required product interface is a terminal; local retrieval and SQLite keep the setup small.</p><p>Framework comparison, hosted observability, vector databases, and public hosting are optional. The existing main course remains a separate path.</p></article></section>
<section id="product-map">${renderDiagram(practiceProductDiagram, "practice-product")}</section>
<section id="pace"><h2>44 hours over four weeks</h2><p>Expect 10-12 hours per week. Each weekday has one 90-minute lesson; each weekend has a two-hour integration studio. Reserve 15 minutes for explanation, 55 for building and investigation, and 20 for review. Resolve a failed prerequisite before moving on.</p><div class="table-wrap"><table><thead><tr><th>Work</th><th>Hours</th></tr></thead><tbody><tr><td>Setup and baseline</td><td>2</td></tr><tr><td>20 lessons</td><td>30</td></tr><tr><td>Four studios</td><td>8</td></tr><tr><td>Demonstration and handoff across weeks 2-4</td><td>4</td></tr><tr><th>Total</th><th>44</th></tr></tbody></table></div><p>The estimate needs learner feedback. Durable recovery is the largest likely overrun; reduce optional breadth before cutting recovery or approval work.</p></section>
<section id="setup"><p class="eyebrow">Setup · 2 hours</p><h2>Capture a baseline before changing code</h2><ol><li>Use 20 minutes to check Node, install dependencies with <code>npm ci</code>, and run <code>npm test</code>.</li><li>Use 30 minutes to follow the fake case in the operating guide. Inspect the approval pause and effect count.</li><li>Use 30 minutes to configure one coding-agent environment and locate the project brief, runtime, tools, and local corpus.</li><li>Use 40 minutes to choose a learner-approved real API spend ceiling, check current model access and prices, configure the explicit real mode, and capture one bounded baseline. A dashboard alert may not enforce a cutoff. Keep the application call caps.</li></ol><pre><code>npm ci\nnpm run starter:practice -- add setup Why is my pending transfer delayed?\nnpm run starter:practice -- run setup\nnpm run starter:practice -- show setup</code></pre><p><a href="../starter/docs/agentic-engineering-practice.md#real-provider-run">Real-provider setup</a> explains the required settings and record. Without API access, continue deterministic implementation, but leave real-model completion items pending.</p><p>Inspect and change the supplied implementation. Every module requires a learner-owned decision or code change and an independently explained result.</p></section>
<nav class="module-nav" aria-label="Module navigation">${course.modules.map((module,index) => `<a href="#module-${index + 1}">Week ${index + 1}: ${escape(module.title)}</a>`).join("")}</nav>
${modules}
<section id="completion"><p class="eyebrow">Completion review</p><h2>Demonstrate the behavior</h2>${list(course.completion)}<div class="table-wrap"><table><thead><tr><th>Level</th><th>Evidence</th></tr></thead><tbody><tr><td>1 · Missing</td><td>No inspectable result</td></tr><tr><td>2 · Prompted</td><td>Works only with explanation or repeated help</td></tr><tr><td>3 · Independent</td><td>Works and the learner explains it independently</td></tr><tr><td>4 · Defended</td><td>Handles a changed case with an explained tradeoff</td></tr></tbody></table></div><p>Every completion item must reach level 3. Preserve a working increment, a failure, a redacted record, a decision, and the next limitation in each module record. Templates are blank evidence forms, not proof of learner completion.</p><p>The handoff includes a short demonstration, reproducible setup, architecture sketch, runbook, and one before-and-after improvement record. <a href="../starter/evidence/agentic-engineering-practice/handoff.md">Use the handoff checklist</a>. Extra frameworks and agent roles do not increase the score by themselves.</p></section>
<section id="sources"><h2>Sources and scope</h2><p>This independent course uses a four-part topic sequence inspired by the <a href="https://mega.dev/#program">MEGA program outline</a>. Its project, explanations, exercises, and completion requirements are original. It includes no paid MEGA lessons, instructors, or workshops.</p><p>Executable examples reviewed ${course.reviewed} against the official sources below and the installed repository dependencies. This date does not update the review date of supporting lessons.</p><ul>${course.sources.map(source => `<li><a href="${source.href}">${escape(source.title)}</a></li>`).join("")}</ul></section>`, "../");
}

export function practicePages() {
  return new Map([
    ["courses/agentic-engineering-practice.html", coursePage()],
    ...sessions.map((session, index) => [session.href, sessionPage(session, index)])
  ]);
}

export async function renderPracticeCourse() {
  await mkdir(new URL("courses/practice/", root), { recursive: true });
  for (const [href, html] of practicePages()) await writeFile(new URL(href, root), html);
}
