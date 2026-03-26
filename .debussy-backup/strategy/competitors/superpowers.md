---
type: competitor
subject: superpowers
updated: 2026-03-26
status: draft
---

# Superpowers

**URL:** https://github.com/obra/superpowers
**Category:** Agentic development workflow framework
**Stars:** ~115K (up from ~96K). Forks: 9.2K. Latest: v5.0.6 (March 2026).

## What It Does

A 7-phase agentic skills framework that guides coding agents through structured
software development — from Socratic brainstorming through TDD implementation
and two-stage code review. Now maintained by Prime Radiant (Jesse Vincent's
company, founded January 2026).

## Strengths

- Brainstorming-first spec refinement via Socratic questioning before any code
- v5: Visual Brainstorming generates interactive HTML mockups in browser
- v5: Spec Review Loop validates planning docs for completeness
- Subagent-driven development is now the default workflow
- Cost optimization: instructs subagents to use cheapest capable model per task
- Interface-driven design: file structure precedes task decomposition
- Respects user's CLAUDE.md/AGENTS.md over Superpowers internals
- Multi-platform: Claude Code, Cursor, Codex, Gemini CLI
- 115K GitHub stars — largest in the ecosystem
- Included in official Anthropic marketplace (January 2026)
- Backed by Prime Radiant company with dedicated development

## Weaknesses & User Frustrations

- Code review happens in conversation — no dashboard or visual collaboration
- No progress tracking interface for multi-hour autonomous runs
- No product planning or roadmap management capabilities
- Steep learning curve for skill triggers and phase transitions
- Methodology-heavy — can feel prescriptive for experienced developers
- v5 visual brainstorming pushes closer to product territory but without research

## Gap We Fill

Debussy provides the visual review layer that Superpowers lacks: browser-based
structured triage UI, workflow monitoring dashboards, and the product discovery
pipeline (strategy + product) that Superpowers does not address. Complementary:
Superpowers provides development methodology, Debussy provides human judgment
infrastructure and the upstream product layer.

## Key Features

| Feature | Notes |
|---|---|
| Visual Brainstorming (v5) | Interactive HTML mockups — we don't compete here |
| Spec Review Loop (v5) | Validates planning docs — similar to our review UI approach |
| Subagent dispatch | Multi-agent default — we use single-principal per step |
| TDD enforcement | RED-GREEN-REFACTOR — we defer to Superpowers/rpikit |
| Cost optimization | Cheapest model per task — we don't have this yet |
