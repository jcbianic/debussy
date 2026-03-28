# Ecosystem Map: Debussy

## Competitors

| Tool | What it does | Strengths | Gap we fill |
|---|---|---|---|
| Superpowers (v5.0.6) | Agentic skills framework: TDD, brainstorming, subagent-driven dev, worktrees. Cross-platform. | 13+ skills, methodology enforcement, cross-platform (Claude Code, Cursor, Codex, OpenCode, Gemini CLI) | No browser review UI; no product-thinking layer; no workflow monitoring dashboard |
| Plannotator | Visual plan annotation: intercepts ExitPlanMode, opens browser for PR-style diff review | Privacy-first, visual annotations, lightweight | Reviews plans only — not product artifacts, not strategy, not intents |
| Shipyard | Superpowers for enterprise: adds infra-as-code and security auditing | Enterprise compliance, security gates | Same gaps as Superpowers plus enterprise focus far from solo builder |
| GSD (get-shit-done) | Meta-prompting, spec-driven dev via npx | Lightweight, fast install | No review UI; no workflow monitoring; no parallel lanes; no product layer |

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
| IIKit | Debussy wraps and extends IIKit workflows | workflow-run skill is the runtime layer for IIKit workflows |
| rpikit | Complementary skills; many imported into Debussy | Review and workflow skills complement rpikit patterns |
| ship | Commit-to-production workflow | Could sequence after Debussy's intent-to-code flow |
| connect-apps (Composio) | Orchestration across 500+ services | Notification layer for workflow completion events |
| GitHub / GitHub Issues | Roadmap artifacts sync to GH Issues | `gh` CLI used in roadmap skill |

## Inspiration

| Tool | What we're learning from |
|---|---|
| Plannotator | Browser-based review UX, privacy-first architecture, hook-based interception |
| Superpowers | Skill composability, cross-platform distribution, auto-invocation |
| Context7 | Version-specific docs injection — could apply to Debussy's own documentation layer |

## Audience Snapshot

Claude Code is the most-used AI coding agent, with $2.5B run-rate by early 2026. 73% of engineering teams use AI coding tools daily (up from 41% in 2025). Startup adoption is at 75%. The plugin ecosystem has 9,000+ plugins (101 official). Solo devs handle review friction by typing inline, monitor workflows by watching terminals, and manage parallel work by manually juggling git branches. No existing plugin addresses the product-thinking upstream layer.
