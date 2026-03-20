# Ecosystem Map: Debussy

## Competitors

| Tool | What it does | Strengths | Gap we fill |
|---|---|---|---|
| GasTown | Multi-agent workspace manager: parallel Claude Code workers, git-backed state, automated merging | Powerful parallel agent orchestration; persistent work state | Heavy setup; assumes multi-repo; no browser review UI or workflow monitoring |
| Superpowers (obra) | Complete agentic dev workflow: brainstorming, TDD, subagent patterns | Comprehensive, methodologically deep | No browser review UI; no worktree orchestration; guidance not tooling |
| GSD (get-shit-done) | Meta-prompting, context engineering, spec-driven dev via npx | Lightweight, fast install | No review UI; no workflow monitoring; no parallel lanes |
| Cursor / Antigravity | AI-native editors with rich GUI and deep editor integration | Rich UI, integrated debugging | Not terminal-first; outside Claude Code model |

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
| IIKit | Debussy wraps and extends IIKit workflows | workflow-run skill is the runtime layer for IIKit workflows |
| rpikit | Complementary skills; many imported into Debussy | Debussy's review and workflow skills complement rpikit patterns |
| gsd | Adjacent philosophy, different execution layer | Debussy can serve as execution layer for gsd-defined processes |
| claude-code-workflows (shinpr) | Coding methodology and recipe skills | Debussy can wrap or sequence shinpr recipe skills |
| GitHub / GitHub Issues | Roadmap artifacts sync to GH Issues | `gh` CLI used in roadmap and workflow-run skills |

## Inspiration

| Tool | What we're learning from |
|---|---|
| OpenClaw | Pragmatic cron and triggers in Claude Code plugins |
| IIKit | Artifact-driven design; structured phases with verification criteria |
| context-mode | 98% context reduction via subprocess sandboxing |

## Audience Snapshot

Claude Code launched May 2025 and reached $1B ARR by November 2025 — the fastest
enterprise software ramp on record. Debussy's target users — solo devs who live in Claude Code
— handle review friction by typing inline, monitor workflows by watching terminals scroll,
and manage parallel work by manually juggling git branches.
