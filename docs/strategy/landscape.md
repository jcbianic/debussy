---
type: landscape
updated: 2026-03-20
status: reviewed
---

# Landscape

## Market Overview

The Claude Code plugin ecosystem has grown rapidly: 9,000+ plugins across
multiple community marketplaces, with top plugins reaching 50K-96K installs.
Claude Code itself has 18.9M MAU. Most plugins are thin wrappers around
single-task prompts — deeper workflow tooling is rare.

Multi-agent orchestration is converging as a common capability (Anthropic's
Agent Teams, GasTown, Superpowers). Structured human review of AI-produced
artifacts and product-level planning are areas where few plugins operate.
More research is needed to confirm whether this is truly uncontested or
simply underexplored.

## Competitors

| Tool | What it does | Our gap | Detail |
|---|---|---|---|
| Superpowers | 7-phase agentic dev workflow with TDD and brainstorming | No browser review UI, no product planning, no workflow monitoring | [profile](competitors/superpowers.md) |
| GasTown | Multi-agent orchestration with 4-30 workers | CLI-only, no review UX, steep onboarding, no planning | [profile](competitors/gastown.md) |
| GSD | Meta-prompting with fresh context windows per executor | No review UI, no dashboard, no product planning | [profile](competitors/gsd.md) |
| Plannotator | Visual plan annotation and review in browser | No approval workflows, no workflow orchestration, no planning | [profile](competitors/plannotator.md) |
| Ralph | Autonomous agent loop until PRD complete | No human oversight during execution, no review gates | [profile](competitors/ralph.md) |
| Claude-Task-Master | AI-powered task decomposition and management | Task management only, no execution or review | — |
| Cursor / Antigravity | AI-native editors with rich GUI | Not terminal-first, outside Claude Code model | — |

## Allies & Complements

| Tool | Relationship | Integration | Detail |
|---|---|---|---|
| IIKit | Debussy wraps IIKit workflows | workflow-run is the runtime layer for IIKit | [profile](allies/iikit.md) |
| rpikit | Complementary skills (RPI framework) | rpikit phases could be steps in Debussy workflows | [profile](allies/rpikit.md) |
| Claude-Mem | Persistent memory across sessions (37.2K stars) | Could persist workflow state and review decisions | [profile](allies/claude-mem.md) |
| claude-code-workflows | Production-ready dev agent workflows | Agent roles could map to Debussy workflow steps | — |
| Claude-HUD | Terminal statusline (context, tools, agents) | Could show workflow progress in terminal | — |
| GitHub / GitHub Issues | Roadmap artifact sync target | `gh` CLI used in roadmap and workflow-run skills | — |

## Trends

- **Multi-agent is table stakes**: Anthropic's Agent Teams, GasTown, Claude
  Flow all converge on multi-agent. Solo-agent workflows are becoming legacy.
- **Context engineering is the battleground**: GSD (fresh windows), Claude-Mem
  (persistent memory), Superpowers (state files) attack context rot differently.
  Tools that handle this automatically have an advantage.
- **Plugin explosion with quality gap**: 9K+ plugins but only 50-100 are
  production-ready. The bar for quality plugins is low — opportunity for depth.
- **Review UX is nascent**: Plannotator is the only dedicated plan review UI.
  No tool provides configurable, structured review workflows for arbitrary
  agent outputs.
- **Product-level planning is absent**: Every competitor focuses on
  implementation. None provides product discovery, strategy research, or
  roadmap shaping.
- **Browser UI is rare**: The ecosystem is overwhelmingly terminal-native.
  Browser-based UX for review/monitoring is underserved.

## Opportunities

- **Structured review for non-code artifacts**: Plans, specs, strategy docs all
  need human review. No tool provides configurable triage UI for these.
- **Idea-to-shipping pipeline**: The chain from product discovery through intent
  creation through GitHub sync through workflow execution — with human review
  gates at each stage.
- **Workflow observability**: Browser-based dashboards showing workflow progress,
  artifact summaries, and review history for long-running multi-step tasks.
- **Worktree orchestration**: Session tracking and staging rotation for parallel
  workstreams — a layer above basic worktree isolation.
