---
type: competitor
subject: gastown
updated: 2026-03-26
status: draft
---

# GasTown

**URL:** https://github.com/steveyegge/gastown
**Category:** Federated multi-agent orchestration network
**Stars:** ~13K (up from ~3K, 4x growth). Forks: 1.1K. 6,659+ commits, 450+ PR contributors.

## What It Does

Federated multi-agent workspace manager coordinating 4-30 worker agents via a
Mayor/worker architecture with git-backed state. Evolving into "The Wasteland"
— a reputation-and-work exchange layer where multiple GasTown instances
interconnect via a Wanted Board, validator stamps, and portable reputation.

## Strengths

- Persistent agent identity (Polecats) surviving crashes and restarts
- Scales to 20-30 parallel agents with enterprise orchestration
- Git worktree-based storage and isolation
- Multiple runtimes: Claude Code, Codex, Cursor, Gemini
- Real-time activity feed (`gt feed`)
- TOML-defined reusable formulas for workflows
- Evolving into federated network ("Wasteland") for inter-instance coordination
- Strong CLI tooling with comprehensive commands

## Weaknesses & User Frustrations

- Steep onboarding curve: Rigs, Hooks, Polecats, Convoys, Beads — many
  concepts to learn before productive use
- CLI-only — no web UI for visual review
- Limited observability: no traces, metrics, or error aggregation beyond
  the activity feed
- Complex setup: Go, Git, Dolt, Beads, SQLite, tmux all required
- No structured review workflow — agents execute without human review gates
- Pivoting toward enterprise/team-scale — diverging from solo builder needs

## Gap We Fill

GasTown has pivoted to federated enterprise orchestration — a different target
market than Debussy. We provide browser-based review UX, workflow monitoring
with review gates, product planning capabilities, and dramatically lower barrier
to entry (install one plugin vs. set up Go + Dolt + tmux). No longer a close
competitor; different audience.

## Key Features

| Feature | Notes |
|---|---|
| Mayor coordinator | Orchestrates agents — we use single-step execution |
| Polecats (persistent workers) | Agent identity across sessions — we don't persist agents |
| Convoys (batch assignments) | Parallel task batches — we do sequential with review gates |
| Wasteland (federation) | Inter-instance coordination — we are single-instance |
| Formulas (TOML workflows) | Reusable templates — we use YAML workflow definitions |
