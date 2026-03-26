---
type: competitor
subject: plannotator
updated: 2026-03-26
status: draft
---

# Plannotator

**URL:** https://github.com/backnotprop/plannotator
**Category:** Visual plan annotation and code review
**Stars:** ~3.6K (up from ~3.3K). Forks: 222. 64 releases, 46 contributors.

## What It Does

Browser-based visual annotation and review of AI agent plans and code diffs,
with structured feedback routed back to coding agents. Recently expanded from
plan annotation to code review (view git diffs, remote PRs, annotate code).

## Strengths

- Browser-based visual markup — the closest surface to Debussy's review UI
- Strong privacy: AES-256-GCM end-to-end encryption for sharing
- Closed-loop feedback to agents
- Open-source and self-hostable, zero-knowledge storage, 7-day auto-deletion
- Plan diff comparison (before/after)
- Code review capabilities (git diffs, remote PRs, file-level annotation)
- Multi-agent support: Claude Code, OpenCode, Pi, Codex
- 3.6K stars, 64 releases — actively maintained

## Weaknesses & User Frustrations

- No formal sign-off workflows, approval gates, or audit trails
- No workflow monitoring or progress tracking
- No product planning integration
- No team role management or permission hierarchies
- Peer-to-peer sharing only — no structured triage workflow
- Annotation-only — no configurable actions (approve/reject/discuss)

## Gap We Fill

Debussy provides configurable review workflows with approval/revision/rejection
gates and structured triage actions, multi-step workflow orchestration with
monitoring, and the product discovery/roadmap pipeline. Plannotator does
annotation and visual markup; Debussy does structured decision-making. More
ally than competitor — complementary review surfaces.

## Key Features

| Feature | Notes |
|---|---|
| Visual plan review | Browser-based — similar surface to our feedback skill |
| Code review annotation | File-level markup on diffs — we are item/section-level |
| Plan diff comparison | Before/after views — we don't have this yet |
| Encrypted sharing | AES-256-GCM — we are local-only, no sharing |
| Multi-agent support | 6+ agents — we are Claude Code-focused |
