---
name: Landscape
icon: i-heroicons-globe-alt
status: reviewed
---

## Adjacent tools

Linear, GitHub Projects, and Notion address project management at a team level. They require configuration, have their own UIs, and are designed for collaboration — not for a single developer in a terminal.

Claude Code itself has no project management layer. MCP servers can extend it, but none currently address the review-loop or parallel-lane problem.

## Differentiation

Debussy lives inside Claude Code as a plugin. It has no database, no login, no cloud. The UX is the terminal and a lightweight local web view. The audience is a single developer who wants to move fast without managing infrastructure.

## Key competitors

GasTown (multi-agent orchestration, 20-30 parallel agents), Superpowers (structured methodology, TDD enforcement), and Claude-Mem (persistent vector memory) are the nearest differentiators in the Claude Code ecosystem.

None of them address the browser-based review loop, structured product discovery, or lane management that Debussy targets.
