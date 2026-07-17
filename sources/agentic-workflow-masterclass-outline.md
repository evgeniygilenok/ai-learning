# Source Note: Agentic Workflow Masterclass Outline

## Provenance

The course `courses/agentic-workflow-engineering.html` and lessons 0042-0049 were
synthesized from an "agentic workflow masterclass outline" provided as a chat
attachment during their creation. The original attachment is unavailable. The
reconstructed outline below, corroborated by the named primary sources, is now the
permanent source basis for this specialization rather than a placeholder.

**Source basis adopted:** 2026-07-17. Review public corroborating sources quarterly.

## Reconstructed Outline

The outline described an eight-module practice course treating agentic workflow
as an engineered system rather than a prompting style.

1. **Concept of agentic workflow** - blocks, workflow graphs, quality gates,
   human-in-the-loop checkpoints, and local vs remote execution platforms.
2. **Tools inside the harness** - skills, commands, hooks, subagents, team
   patterns, and native workflow capabilities of coding agents.
3. **Tools outside the harness** - one-shot CLI runs, structured JSON outputs,
   code generation, MCP, external CLI tools, and project context.
4. **Implementation phase** - direct implementation, goal loops, verification
   loops, templates, slopwatch checks, and final handoff checklists.
5. **Planning on steroids** - planning readiness, Definition of Done,
   missing-requirement discovery, consensus planning, and research spikes.
6. **Review and everything after** - self-review, automated quality tools,
   doom-loop diagnosis, team review, and post-merge observability.
7. **Continuous improvement** - write-ahead logs, workflow evals,
   retrospectives, structural refactors, and agentified research.
8. **Next operating layer** - token economics, team rollout, documentation
   boundaries, weakly structured documents, and human responsibility.

## Corroborating External Sources

The reconstructed claims are grounded in these public sources (also tracked in
`RESOURCES.md`):

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) -
  workflow patterns (prompt chaining with gates, routing, evaluator-optimizer
  loops, orchestrator-workers) and the case for simplicity.
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) -
  attention budgets, just-in-time context, compaction, and structured note-taking.
- [Anthropic: Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) -
  tool contracts, token-efficient outputs, and eval-driven tool improvement.
- [Claude Code docs: Skills](https://code.claude.com/docs/en/skills),
  [Hooks](https://code.claude.com/docs/en/hooks-guide),
  [Subagents](https://code.claude.com/docs/en/sub-agents) - concrete harness
  asset mechanics.
- [Cursor docs: Headless CLI](https://cursor.com/docs/cli/headless) and
  [Output format](https://cursor.com/docs/cli/reference/output-format) -
  scriptable one-shot agent runs with structured output.
- [Google eng-practices: The standard of code review](https://google.github.io/eng-practices/review/reviewer/standard.html)
  and [What to look for](https://google.github.io/eng-practices/review/reviewer/looking-for.html) -
  review discipline that lessons 0047 adapts to AI-assisted changes.
