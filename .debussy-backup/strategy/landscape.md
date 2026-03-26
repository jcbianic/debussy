---
name: Landscape
icon: i-heroicons-globe-alt
status: draft
---

## Market Overview

The Claude Code plugin ecosystem has exploded to 834+ plugins across 43 marketplaces, with 101 in the official Anthropic marketplace (33 from Anthropic directly). The AI coding tools market reached $12.8B in 2026, up from $5.1B in 2024. The dominant shift is from autocomplete to autonomous agents: 84% of developers use AI tools, 22% of merged code is AI-authored.

Two macro trends define the landscape: (1) autonomous loops are commoditized — every major tool has them, so differentiation has moved up the stack to workflow structure and governance; (2) Anthropic is playing in the plugin space directly with feature-dev (89K installs), code-review, and commit-commands, occupying low-hanging workflow fruit.

## Competitors

| Tool | Stars | What it does | Strengths | Gap we fill |
|---|---|---|---|---|
| Superpowers | 115K | 7-phase agentic methodology (brainstorm -> TDD -> review) | Dominant methodology, v5 visual brainstorming, multi-platform | No product discovery, no browser review UI, engineering-only |
| GSD v1 | 42K | Meta-prompting + spec-driven dev with fresh context per task | Solves context rot, atomic commits, wave parallelism | No review gates, no visual progress, no product planning |
| GSD v2 | 3.3K | TypeScript CLI on Pi SDK, single-writer state engine | Programmable agent harness, offline mode, web UI | Same gaps as v1, higher complexity |
| Ralph | 13.8K | Autonomous agent loop until PRD complete | Fire-and-forget, crash recovery | No human oversight, concept commoditized |
| feature-dev | 89K installs | Anthropic official 7-phase workflow | First-party distribution, massive adoption | Engineering-only, no strategy/product layer |
| Plannotator | 3.6K | Visual plan annotation + code review in browser | Browser-based, privacy-first (AES-256), multi-agent | No structured triage, no workflow orchestration |
| GasTown | 13K | Federated multi-agent coordination ("Wasteland") | 20-30 parallel agents, enterprise scale | Different target (teams), high complexity |
| Claude Squad | 5.6K | Terminal app managing multiple agents in tmux | Multi-agent visibility, worktree isolation | No product/strategy layer, operational only |

## Allies & Complements

| Tool | Stars | Relationship | Integration opportunity |
|---|---|---|---|
| Claude-Mem | 40K | Persistent memory (SQLite + vectors) | Persist workflow state, index strategy artifacts, recall preferences |
| IIKit | 27 | Intent integrity via cryptographic verification | Reference architecture for engineering governance |
| rpikit | 8 | Research-Plan-Implement methodology | RPI phases as workflow-run steps, complementary scopes |
| Claude HUD | New | Real-time monitoring of context/agents | Complement to our workflow observability (SI-2) |
| PM Skills | 100+ | Composable PM skills collection | Same domain (product), different approach (skills vs. pipeline) |

## Ecosystem Dynamics

**Commoditization layer:** Autonomous loops (Ralph pattern), conventional commits, basic code review. Every tool has these — not differentiating.

**Active battleground:** Spec-driven development (GSD, BMAD, Kiro, GitHub Spec Kit), visual review (Plannotator, Debussy), multi-agent coordination (GasTown, Claude Squad).

**Underserved:** Product discovery feeding engineering, cross-session audit trails, policy-gated autonomy, non-technical builder support.

**Anthropic's play:** Vertical integration from agent outward (feature-dev, code-review, commit-commands). Third-party plugins must operate at higher abstraction or in more opinionated niches.

## Differentiation

Debussy lives inside Claude Code as a plugin. No database, no login, no cloud. The UX is terminal + lightweight local browser view. The unique position: the only tool spanning strategy -> product -> engineering -> work as a coherent pipeline for solo builders.
