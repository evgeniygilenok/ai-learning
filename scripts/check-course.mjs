import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { lessons, stages } from "../assets/curriculum.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const forbidden = [/plan-v\d+\.md/i, /developers\.openai\.com\/api\/docs\/guides\/evals(?:["'#?]|$)/, /owasp\.org\/www-project-top-10-for-large-language-model-applications/];

if (lessons.length !== 53) errors.push(`Expected 53 lesson records, found ${lessons.length}`);
if (stages.length !== 13) errors.push(`Expected 13 stage/track records, found ${stages.length}`);
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

for (const relative of ["index.html", "courses/applied-ai-engineering.html", "courses/agentic-workflow-engineering.html", "reference/ai-engineering-glossary.html", "reference/agent-runtime-reference.html", "reference/agentic-workflow-reference.html", "reference/ai-engineering-job-readiness.html", "RESOURCES.md", "NOTES.md"]) {
  const path = resolve(root, relative);
  const text = await readFile(path, "utf8");
  checkForbidden(relative, text);
  if (relative.endsWith(".html")) await checkLinks(path, text);
}

const course = await readFile(resolve(root, "courses/applied-ai-engineering.html"), "utf8");
for (const phrase of ["experienced-engineer agentic track", "10-12 weeks", "redacted real-model run/trace", "public proof package"]) {
  if (!course.toLowerCase().includes(phrase)) errors.push(`Course page missing upgrade contract: ${phrase}`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Course checks passed: ${lessons.length} lessons, ${stages.length} stage/track contracts, local links resolved.`);

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
