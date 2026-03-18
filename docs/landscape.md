# Ecosystem Map: Debussy

## Competitors

| Tool | Strengths | Gap we fill |
|---|---|---|
| GasTwon | More feature-rich Claude Code plugin | Too complex for solo devs who want lightweight, composable skills |
| Generic IDE assistants (Antigravity, Cursor, etc.) | Deep editor integration, rich UI | Don't work within Claude Code's terminal-first model; may already solve adjacent problems from a different angle |

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
| IIKit | Debussy wraps and extends IIKit workflows | workflow-run skill is the runtime layer for IIKit-defined workflows |
| gsd | Complementary workflow/productivity skill set | Debussy skills can serve as the execution layer for gsd-defined processes |
| rpikit | Complementary agents and skills collection | Debussy's structured review and workflow skills complement rpikit's agent patterns |
| GitHub / GitHub Issues | Roadmap artifacts sync to GitHub Issues | `gh` CLI used in roadmap skill for issue creation and updates |

## Inspiration

| Tool | What we're learning from |
|---|---|
| OpenClaw | Pragmatic approach to cron, scheduling, and automated triggers within Claude Code plugins |
| IIKit | Artifact-driven workflow design; structured phases with explicit verification criteria |
