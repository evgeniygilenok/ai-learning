import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, stages, practiceCourse, practiceSessions, practiceStudios } from "../assets/curriculum.mjs";
import { practicePages } from "./render-practice.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const forbidden = [/plan-v\d+\.md/i, /developers\.openai\.com\/api\/docs\/guides\/evals(?:["'#?]|$)/, /owasp\.org\/www-project-top-10-for-large-language-model-applications/];

if (lessons.length !== 61) errors.push(`Expected 61 lesson records, found ${lessons.length}`);
if (stages.length !== 14) errors.push(`Expected 14 stage/track records, found ${stages.length}`);
const ids = new Set();
for (const lesson of lessons) {
  if (ids.has(lesson.id)) errors.push(`Duplicate lesson ID ${lesson.id}`);
  ids.add(lesson.id);
  for (const field of ["title", "stage", "depth", "artifact", "doneWhen"]) if (!lesson[field]) errors.push(`${lesson.id} missing ${field}`);
  if (lesson.outcomes.length < 2 || lesson.outcomes.length > 4) errors.push(`${lesson.id} needs 2-4 outcomes`);
  if (!lesson.prerequisites.length) errors.push(`${lesson.id} needs prerequisites`);
  const path = resolve(root, lesson.href);
  const html = await readFile(path, "utf8").catch(() => "");
  if (!html) { errors.push(`Missing ${lesson.href}`); continue; }
  if (!html.includes(`data-lesson-id="${lesson.id}"`)) errors.push(`${lesson.href} missing lesson ID`);
  if (!html.includes("<!-- COURSE-CONTRACT:START -->")) errors.push(`${lesson.href} missing generated contract`);
  if (!html.includes("Source review:")) errors.push(`${lesson.href} missing source review date`);
  await checkLinks(path, html);
  checkForbidden(lesson.href, html);
}

for (const stage of stages) {
  for (const id of [...stage.lessons, ...(stage.optionalLessons ?? [])]) if (!ids.has(id)) errors.push(`${stage.id} references unknown lesson ${id}`);
}

for (const relative of ["index.html", "courses/applied-ai-engineering-roadmap.html", "courses/applied-ai-engineering.html", "courses/agentic-workflow-engineering.html", "courses/ai-agent-security.html", "reference/ai-engineering-glossary.html", "reference/agent-runtime-reference.html", "reference/agentic-workflow-reference.html", "reference/ai-agent-security-reference.html", "reference/ai-engineering-job-readiness.html", "tracks/vpn-engineering/index.html", "tracks/vpn-engineering/lessons/0001-one-packet-two-journeys.html", "tracks/vpn-engineering/reference/networking-vpn-glossary.html", "tracks/vpn-engineering/MISSION.md", "tracks/vpn-engineering/RESOURCES.md", "tracks/vpn-engineering/NOTES.md", "RESOURCES.md", "NOTES.md"]) {
  const path = resolve(root, relative);
  const text = await readFile(path, "utf8");
  checkForbidden(relative, text);
  if (relative.endsWith(".html")) await checkLinks(path, text);
}

const hub = await readFile(resolve(root, "index.html"), "utf8");
if (!hub.includes('href="courses/agentic-engineering-practice.html"')) errors.push("Learning hub missing practice route");
for (const phrase of ["Applied AI Engineering", "VPN &amp; Network Engineering", "tracks/vpn-engineering/index.html"]) {
  if (!hub.includes(phrase)) errors.push(`Learning hub missing track contract: ${phrase}`);
}

const vpnLesson = await readFile(resolve(root, "tracks/vpn-engineering/lessons/0001-one-packet-two-journeys.html"), "utf8");
for (const phrase of ["data-lesson-id=\"0001\"", "Inner packet", "Outer packet", "Source review:", "Exit ticket"]) {
  if (!vpnLesson.includes(phrase)) errors.push(`VPN lesson 0001 missing teaching contract: ${phrase}`);
}

const course = await readFile(resolve(root, "courses/applied-ai-engineering.html"), "utf8");
for (const phrase of ["experienced-engineer agentic track", "10-12 weeks", "redacted real-model run/trace", "public proof package"]) {
  if (!course.toLowerCase().includes(phrase)) errors.push(`Course page missing upgrade contract: ${phrase}`);
}

// Practice sessions are a separate route, not additional lesson or stage records.
if (practiceSessions.length !== 20 || practiceStudios.length !== 4) errors.push("Practice route needs 20 sessions and four studios");
const practiceIds = new Set(["practice-setup", ...practiceStudios.map(studio => studio.id)]);
for (const [index, session] of practiceSessions.entries()) {
  if (practiceIds.has(session.id) || ids.has(session.id)) errors.push(`Duplicate practice ID ${session.id}`);
  for (const prerequisite of session.prerequisites) if (!practiceIds.has(prerequisite)) errors.push(`${session.id} unknown or later prerequisite ${prerequisite}`);
  practiceIds.add(session.id);
  if (session.module !== Math.ceil((index + 1) / 5)) errors.push(`${session.id} has the wrong module`);
  if (Object.values(session.minutes).reduce((sum, value) => sum + value, 0) !== 90) errors.push(`${session.id} must budget 90 minutes`);
  for (const field of ["title", "exercise", "workedExample", "example", "failure", "exit", "doneWhen", "artifact"]) if (!session[field]) errors.push(`${session.id} missing ${field}`);
  if (session.explanation.length < 2 || session.guided.length < 3 || session.objectives.length < 2) errors.push(`${session.id} missing teaching depth`);
  for (const id of session.supportingLessons) if (!ids.has(id)) errors.push(`${session.id} references unknown lesson ${id}`);
}
const practiceMinutes = practiceCourse.setupMinutes + practiceCourse.handoffMinutes.reduce((sum, value) => sum + value, 0)
  + practiceSessions.reduce((sum, session) => sum + Object.values(session.minutes).reduce((a,b) => a+b,0), 0)
  + practiceStudios.reduce((sum, studio) => sum + studio.minutes, 0);
if (practiceMinutes !== practiceCourse.hours * 60 || practiceCourse.weeklyHours.reduce((a,b) => a+b,0) !== practiceCourse.hours) errors.push("Practice workload must total 44 hours");
for (const [index, hours] of practiceCourse.weeklyHours.entries()) {
  const expected = 5 * 90 + practiceStudios[index].minutes + practiceCourse.handoffMinutes[index] + (index === 0 ? practiceCourse.setupMinutes : 0);
  if (hours * 60 !== expected) errors.push(`Practice week ${index+1} has an inconsistent workload`);
}
for (const [relative, expected] of practicePages()) {
  const path = resolve(root, relative);
  const html = await readFile(path, "utf8").catch(() => "");
  if (html !== expected) errors.push(`${relative} is stale; run npm run curriculum:render`);
  checkForbidden(relative, html);
  await checkLinks(path, html);
  if (relative.includes("/practice/")) {
    for (const section of ["understand", "example", "guided", "exercise", "failure", "exit"]) if (!html.includes(`id="${section}"`)) errors.push(`${relative} missing ${section}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Course checks passed: ${lessons.length} lessons, ${stages.length} stage/track contracts, ${practiceSessions.length} practice sessions, 44-hour workload, generated pages and local links resolved.`);

function checkForbidden(file, text) {
  for (const pattern of forbidden) if (pattern.test(text)) errors.push(`${file} contains forbidden stale reference ${pattern}`);
}

async function checkLinks(file, html) {
  const links = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  for (const href of links) {
    if (/^(?:https?:|mailto:|#)/.test(href)) continue;
    const target = resolve(dirname(file), decodeURIComponent(href.split("#")[0].split("?")[0]));
    await access(target).catch(() => errors.push(`${file.slice(root.length + 1)} has missing local link ${href}`));
  }
}
