---
type: competitor
subject: gastown
updated: 2026-03-19
status: draft
---

# GasTown

**URL:** https://github.com/steveyegge/gastown
**Category:** Multi-agent orchestration system

## What It Does

Multi-agent workspace manager for Claude Code with persistent work tracking,
coordinating 4-30 worker agents via a Mayor/worker architecture with
git-backed state.

## Strengths

- Persistent agent identity (Polecats) surviving crashes and restarts
- Scales to 20-30 parallel agents
- Git worktree-based storage and isolation
- Multiple runtimes: Claude Code, Codex, Cursor, Gemini
- Real-time activity feed (`gt feed`)
- TOML-defined reusable formulas for workflows
- Strong CLI tooling with comprehensive commands

## Weaknesses & User Frustrations

- Steep onboarding curve: Rigs, Hooks, Polecats, Convoys, Beads — many
  concepts to learn before productive use
- CLI-only — no web UI for non-technical stakeholders or visual review
- Limited observability: no traces, metrics, or error aggregation beyond
  the activity feed
- Complex setup: Go, Git, Dolt, Beads, SQLite, tmux all required
- No structured review workflow — agents execute without human review gates

## Gap We Fill

Debussy provides browser-based review UX accessible without terminal access,
workflow monitoring with review gates between steps, product planning
capabilities, and a dramatically lower barrier to entry (install one plugin vs.
set up Go + Dolt + tmux).

## Key Features

| Feature | Notes |
|---|---|
| Mayor coordinator | Orchestrates agents — we use single-step execution |
| Polecats (persistent workers) | Agent identity across sessions — we don't persist agents |
| Convoys (batch assignments) | Parallel task batches — we do sequential with review gates |
| Beads (work item IDs) | Tracking units — we use intent numbers (NNN) |
| Formulas (TOML workflows) | Reusable templates — we use YAML workflow definitions |
