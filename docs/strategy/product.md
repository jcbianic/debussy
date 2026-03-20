---
type: product
updated: 2026-03-20
status: draft
---

# Product Definition: Debussy

## One-Liner

From idea to shipping quality: automation of complex workflows that keep you
in the loop.

## Positioning

Debussy helps you reduce cognitive load while pushing Claude Code to its
limits. The faster you move with AI-assisted development, the more cognitive
debt accumulates — threads you're pulling, artifacts you need to review,
workflows you've kicked off. Debussy manages that debt with structured
workflows, review UIs, and observability.

The positioning is still being validated through dogfooding. What's clear is
the structural advantage: browser-based review UIs, zero-token-consumption
waiting (bash filewatch), and the strategy→roadmap→implementation pipeline.

## Target User

A1: Solo Builders — developers who manage a project end-to-end and want both
AI-assisted speed and human oversight at every stage. They use Claude Code
through the entire lifecycle from idea to shipping and want discipline without
friction.

## Nature

- **License**: MIT
- **Distribution**: Claude Code plugin marketplace
  (`npx claude code --install-plugin jcbianic/debussy`); also installable via
  git clone + link
- **Hosting model**: Local-first (runs entirely on the user's machine)
- **Source**: Open source

## Non-Goals

- Not a multi-agent orchestration system (GasTown owns this niche)
- Not an IDE replacement or full dev environment
- Not a multi-user collaboration platform — state lives in git issues and
  local files
- Framework-agnostic — supports different workflows and methodologies, but
  always surfaces human review as the constant
- Not prescriptive about development methodology — Debussy is plumbing, not
  opinion

## Key Dependencies

- Claude Code CLI (required runtime)
- GitHub CLI (`gh`) for roadmap issue sync
- Python 3 (review server for feedback, strategy, and workflow-run skills)
- Git (worktree management)
