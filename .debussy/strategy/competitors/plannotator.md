---
type: competitor
subject: plannotator
updated: 2026-03-19
status: draft
---

# Plannotator

**URL:** https://github.com/backnotprop/plannotator
**Category:** Visual plan annotation and review

## What It Does

Browser-based visual annotation and review of AI agent plans and code diffs,
with structured feedback routed back to coding agents.

## Strengths

- Browser-based visual markup — similar surface to Debussy's review UI
- Strong privacy: AES-256-GCM encryption for sharing
- Closed-loop feedback to agents
- Open-source and self-hostable
- Plan diff comparison (before/after)
- Multi-agent support: Claude Code, OpenCode, Pi, Codex
- 3.3K stars, 57 releases — actively maintained

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
annotation; Debussy does structured decision-making.

## Key Features

| Feature | Notes |
|---|---|
| Visual plan review | Browser-based — similar surface to our feedback skill |
| Plan diff comparison | Before/after views — we don't have this yet |
| Code review annotation | File-level markup — our review is item/section-level |
| Encrypted sharing | AES-256-GCM — we are local-only, no sharing |
| Multi-agent support | 6+ agents — we are Claude Code-focused |
