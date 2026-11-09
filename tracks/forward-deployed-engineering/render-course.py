"""Render this track's restricted Markdown into offline, self-contained pages."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent
CSS = """
:root{color-scheme:dark;--bg:#1c3648;--panel:#23485c;--ink:#d0e0e6;--muted:#aac4ce;--line:#426479;--accent:#a5d4c4}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.7 system-ui,-apple-system,sans-serif}
main{max-width:920px;margin:auto;padding:38px 24px 80px}a{color:var(--accent);text-underline-offset:4px}a:hover{text-decoration-thickness:2px}
nav{display:flex;flex-wrap:wrap;gap:12px 24px;margin-bottom:32px;font-size:15px}h1{font-size:clamp(2rem,5vw,3.5rem);line-height:1.12;letter-spacing:-.03em;margin:20px 0 28px}h2{font-size:1.6rem;line-height:1.25;margin:44px 0 16px}h3{font-size:1.15rem;margin-top:28px}
p{margin:16px 0}li{margin:8px 0}code{font:0.9em/1.6 ui-monospace,monospace;background:#173044;padding:2px 5px;border-radius:4px}pre{background:#122b3d;padding:20px;overflow:auto;border-radius:10px}pre code{padding:0;background:none}
.table-wrap{overflow:auto;margin:24px 0}table{border-collapse:collapse;width:100%;font-size:15px}td,th{border-bottom:1px solid var(--line);padding:12px;text-align:left;vertical-align:top}th{background:var(--panel)}
.module-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:22px 0}.module-card{display:block;background:var(--panel);padding:20px;border:1px solid var(--line);border-radius:10px;text-decoration:none}.module-card span{display:block;font-size:14px;color:var(--muted)}.module-card strong{font-size:19px;font-weight:600}
button,select{font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:7px;padding:9px 13px}button{cursor:pointer}button:hover{border-color:var(--accent)}button:disabled{opacity:.45;cursor:default}button:focus-visible,a:focus-visible,select:focus-visible{outline:3px solid var(--accent);outline-offset:4px}
.sim{background:#173044;border:1px solid var(--line);padding:24px;border-radius:12px;margin:28px 0}.sim h3{margin:0 0 14px}.controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.controls label{display:block;width:100%}.readouts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:20px 0}.readouts div{background:var(--panel);padding:14px;border-radius:8px}.readouts strong{display:block;font-size:26px}.readouts span{font-size:14px;color:var(--muted)}#timeline{padding-left:24px}.notice{color:var(--muted);font-size:15px}.quiz-choice{display:block;width:100%;text-align:left;margin:10px 0}.feedback{min-height:2em;color:var(--accent)}footer{border-top:1px solid var(--line);margin-top:45px;padding-top:18px;font-size:14px;color:var(--muted)}
@media(max-width:620px){main{padding:22px 18px 50px}.module-grid{grid-template-columns:1fr}.sim{padding:16px}.readouts{grid-template-columns:1fr}.readouts div{display:flex;gap:15px;align-items:center}h2{font-size:1.35rem}}
@media print{:root{color-scheme:light}body{background:white;color:#14202b;font-size:11pt}main{max-width:none;padding:0}a{color:#163d53}pre,code,.module-card,th,.sim,.readouts div{background:#f1f4f6;color:#14202b}nav,.controls,button,.quiz-panel{display:none}h1{font-size:28pt}h2{break-after:avoid;font-size:18pt}pre,tr,.module-card{break-inside:avoid}}
"""

def inline(value):
    value = html.escape(value)
    tokens = []
    def token(markup):
        tokens.append(markup)
        return f"@@TOKEN{len(tokens)-1}@@"
    value = re.sub(r"`([^`]+)`", lambda m: token("<code>" + m[1] + "</code>"), value)
    value = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: token(f'<a href="{m[2]}">{m[1]}</a>'), value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)
    for i, markup in enumerate(tokens):
        value = value.replace(f"@@TOKEN{i}@@", markup)
    return value

def markdown(text):
    lines = text.splitlines()
    out = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("```"):
            code = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                code.append(lines[i]); i += 1
            out.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
            i += 1
            continue
        heading = re.match(r"^(#{1,4}) (.+)", line)
        if heading:
            n = len(heading[1])
            out.append(f"<h{n}>" + inline(heading[2]) + f"</h{n}>")
            i += 1
            continue
        if line.startswith("| "):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [x.strip() for x in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", x.replace(" ", "")) for x in cells):
                    rows.append(cells)
                i += 1
            out.append('<div class="table-wrap"><table><thead><tr>' + "".join("<th scope=\"col\">" + inline(x) + "</th>" for x in rows[0]) + "</tr></thead><tbody>")
            out.extend("<tr>" + "".join("<td>" + inline(x) + "</td>" for x in row) + "</tr>" for row in rows[1:])
            out.append("</tbody></table></div>")
            continue
        if re.match(r"^(?:- |\d+\. )", line):
            ordered = bool(re.match(r"^\d+\.", line))
            tag = "ol" if ordered else "ul"
            out.append("<" + tag + ">")
            pattern = r"^\d+\. " if ordered else r"^- "
            while i < len(lines) and re.match(pattern, lines[i]):
                out.append("<li>" + inline(re.sub(pattern, "", lines[i])) + "</li>")
                i += 1
            out.append("</" + tag + ">")
            continue
        paragraph = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r"^(#|```|\||- |\d+\. )", lines[i]):
            paragraph.append(lines[i]); i += 1
        out.append("<p>" + inline(" ".join(paragraph)) + "</p>")
    return "\n".join(out)

def page(title, body, depth=0, extra=""):
    prefix = "../" * depth
    nav = f'<nav aria-label="Course navigation"><a href="{prefix}index.html">Course home</a><a href="{prefix}modules/08-llm-system-contracts.html">Start with LLM contracts</a><a href="{prefix}00-entry-assessment.html">Optional gap review</a><a href="{prefix}reference/system-boundaries.html">Reference</a><a href="https://app.notion.com/p/4104ac599693812bac7ced2e34a09582">Open course in Notion</a></nav>'
    return f'<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title><style>{CSS}</style></head><body><main>{nav}{body}<footer>FDE hard-skills course. Sources reviewed 2026-11-06. Gates require demonstrated behavior. Ask the tutor for feedback on your explanation and failure evidence.</footer></main>{extra}</body></html>\n'

SIM = """
<section class="sim" aria-labelledby="sim-title">
<h3 id="sim-title">Response loss and retry</h3>
<p>Predict the effect count. Send OP-42, restart if you choose, then retry.</p>
<div class="controls"><label for="strategy">Server deduplication</label><select id="strategy"><option value="none">No deduplication</option><option value="memory">Memory only</option><option value="durable" selected>Durable operation record</option></select><button id="reset" type="button">Reset experiment</button></div>
<div class="readouts" aria-label="Server state"><div><strong id="effect-count">0</strong><span>persisted drafts</span></div><div><strong id="memory-count">0</strong><span>memory records</span></div><div><strong id="durable-count">0</strong><span>durable records</span></div></div>
<div class="controls"><button id="send" type="button">Send and lose response</button><button id="restart" type="button" disabled>Restart server</button><button id="retry" type="button" disabled>Retry same request</button><button id="conflict" type="button" disabled>Retry changed payload</button></div>
<ol id="timeline" aria-live="polite" aria-relevant="additions"></ol>
<p class="notice">This model covers sequential retries and response loss after a local commit. Concurrent requests, partial writes, retention, and remote effects need the later database labs.</p>
</section>
<section class="sim quiz-panel" aria-labelledby="quiz-title"><h3 id="quiz-title">What can the client conclude after a timeout?</h3><button class="quiz-choice" type="button" data-correct="false">The server definitely rolled back.</button><button class="quiz-choice" type="button" data-correct="true">Execution may have committed. The outcome needs lookup or a defined retry contract.</button><button class="quiz-choice" type="button" data-correct="false">A new random operation ID makes the retry safe.</button><p id="quiz-feedback" class="feedback" role="status"></p></section>
"""
JS = """
<script>
(() => {
  const byId = id => document.getElementById(id);
  let state;
  function note(message) { const li=document.createElement('li'); li.textContent=message; byId('timeline').append(li); }
  function draw() { byId('effect-count').textContent=state.effects; byId('memory-count').textContent=state.memory ? 1 : 0; byId('durable-count').textContent=state.durable ? 1 : 0; for(const id of ['restart','retry','conflict']) byId(id).disabled=!state.sent; byId('send').disabled=state.sent; }
  function reset() { state={effects:0,memory:null,durable:null,sent:false}; byId('timeline').replaceChildren(); draw(); }
  function execute(changed,lose) {
    const strategy=byId('strategy').value, payload=changed ? 'draft:B' : 'draft:A';
    const record=strategy==='durable' ? state.durable : strategy==='memory' ? state.memory : null;
    let result;
    if(record && record.payload!==payload) result='Rejected: OP-42 is already bound to a different payload. No new draft.';
    else if(record) result='Returned recorded draft D-'+record.number+'. No new draft.';
    else { state.effects++; const saved={payload,number:state.effects}; if(strategy==='durable') state.durable=saved; if(strategy==='memory') state.memory=saved; result='Committed new draft D-'+state.effects+'.'; }
    note('Server: '+result);
    note(lose ? 'Client: response lost. The client cannot infer the server outcome.' : 'Client: received the server result.');
    draw();
  }
  byId('send').addEventListener('click',()=>{state.sent=true;execute(false,true);});
  byId('retry').addEventListener('click',()=>execute(false,false));
  byId('conflict').addEventListener('click',()=>execute(true,false));
  byId('restart').addEventListener('click',()=>{state.memory=null;note('Server restarted. Drafts and durable records survived; memory records were erased.');draw();});
  byId('reset').addEventListener('click',reset); byId('strategy').addEventListener('change',reset);
  for(const button of document.querySelectorAll('.quiz-choice')) button.addEventListener('click',()=>{byId('quiz-feedback').textContent=button.dataset.correct==='true' ? 'Correct. Response receipt and effect commit are separate events.' : 'Try again. A lost response does not undo a committed effect, and a new ID can create a second action.';});
  reset();
})();
</script>
"""

def main():
    modules = sorted((ROOT / "modules").glob("*.md"))
    for file in [ROOT / "COURSE.md", ROOT / "00-entry-assessment.md", ROOT / "RESOURCES.md", *modules, ROOT / "reference/system-boundaries.md", ROOT / "lessons/0001-timeouts-and-idempotency.md"]:
        text = file.read_text()
        body = markdown(text)
        depth = 1 if file.parent.name in {"modules", "reference", "lessons"} else 0
        extra = ""
        if file.name == "COURSE.md":
            cards = ['<h2>Open the course pages</h2><div class="module-grid">']
            cards.append('<a class="module-card" href="00-entry-assessment.html"><strong>00. Optional gap review</strong><span>Use existing work or a short challenge to choose what needs review.</span></a>')
            for module in modules:
                title = module.read_text().splitlines()[0][2:]
                description = "Optional ecosystem checklist. Look up details while building." if module.name.startswith("01-") else "Lesson notes, implementation lab, failure drill, and mastery gate."
                cards.append(f'<a class="module-card" href="modules/{module.stem}.html"><strong>{html.escape(title)}</strong><span>{description}</span></a>')
            cards.append('</div><p><a href="RESOURCES.html">Browse the primary reading set</a></p>')
            at = body.index('<h2>What changes')
            body = body[:at] + "\n".join(cards) + body[at:]
            output = ROOT / "index.html"
        else:
            output = file.with_suffix(".html")
        if file.parent.name == "lessons":
            body = body.replace('<h2>Check your understanding</h2>', SIM + '<h2>Check your understanding</h2>')
            extra = JS
        title = text.splitlines()[0][2:]
        output.write_text(page(title, body, depth, extra))
    experiment = page("Response loss and retry", SIM, 1, JS)
    experiment = re.sub(r'<nav.*?</nav>', '', experiment, flags=re.S)
    (ROOT / "lessons/retry-experiment.html").write_text(experiment)
    print(f"Rendered {len(modules)} course sections, course home, optional gap review, resources, reference, and interactive lesson.")

if __name__ == "__main__":
    main()
