---
type: competitor
subject: superpowers
updated: 2026-03-19
status: draft
---

# Superpowers

**URL:** https://github.com/obra/superpowers
**Category:** Agentic development workflow framework

## What It Does

A 7-phase agentic skills framework that guides coding agents through structured
software development — from Socratic brainstorming through TDD implementation
and two-stage code review.

## Strengths

- Brainstorming-first spec refinement via Socratic questioning before any code
- Mandatory RED-GREEN-REFACTOR TDD cycle enforcement
- Subagent-driven task execution with two-stage review (spec compliance + code quality)
- Git worktree isolation for parallel work
- Multi-platform: Claude Code, Cursor, Codex, Gemini CLI
- 95.9K GitHub stars — largest in the ecosystem
- Included in official Anthropic marketplace

## Weaknesses & User Frustrations

- Code review happens in conversation with no dashboard or visual collaboration
- No progress tracking interface for multi-hour autonomous runs
- No product planning or roadmap management capabilities
- Steep learning curve for skill triggers and phase transitions
- Methodology-heavy — can feel prescriptive for experienced developers

## Gap We Fill

Debussy provides the visual review layer that Superpowers lacks: browser-based
structured triage UI, workflow monitoring dashboards, and the product discovery
pipeline (strategy + roadmap) that Superpowers does not address. The two are
complementary — Superpowers provides development methodology, Debussy provides
the human judgment infrastructure.

## Key Features

| Feature | Notes |
|---|---|
| Brainstorming skill | Socratic questioning before coding — we don't compete here |
| Plan generation | 2-5 min task decomposition — similar to our workflow steps |
| Subagent dispatch | Multi-agent execution — we use single-principal per step |
| TDD enforcement | RED-GREEN-REFACTOR — we defer to Superpowers/rpikit |
| Branch completion | Auto-PR workflow — we do GitHub Issue sync instead |
