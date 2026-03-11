# Debussy Premise

## What

Debussy is a local-first web UI for orchestrating Claude Code sessions
with workflow awareness. It gives developers a visual interface to
manage, monitor, and coordinate the work Claude Code does on their
codebase — replacing the current workflow of juggling terminal tabs,
manually switching workflow phases, and losing track of session history.
It layers IIKit workflow orchestration, artifact review, worktree
isolation, and cost monitoring on top of a Nuxt 4 foundation.

## Who

Individual developers and small teams using Claude Code for
specification-driven development. Primarily users of structured
workflows (IIKit, Ralph Loop, RIPER, GSD) who need visual orchestration
rather than manual CLI phase-switching. Secondary audience: any Claude
Code user who wants a web-based session dashboard with real-time
monitoring.

## Why

The Claude Code ecosystem lacks a unified web interface that combines
session management, workflow orchestration, artifact review, and cost
visibility. Session management tools are CLI/TUI-only. Workflow tools
require manual terminal phase-switching. Artifact viewers are read-only.
Cost tracking is a separate CLI tool with no integration. Debussy bridges
this gap by layering workflow intelligence on top of a proven session
management foundation.

## Domain

Developer tooling for AI-assisted software engineering. Key terms:
- **Session**: a Claude Code subprocess invocation with streaming output
- **Workflow**: a structured sequence of phases (e.g., IIKit's 7-phase
  Specify > Plan > Checklist > Testify > Tasks > Analyze > Implement)
- **Phase**: a discrete step in a workflow with entry/exit criteria
- **Artifact**: a file produced by a workflow phase (spec, plan, tasks)
- **Worktree**: a git worktree providing filesystem isolation for
  concurrent workflows
- **Assertion integrity**: hash-based verification that test assertions
  have not been tampered with

## Scope

**In scope:**
- Web-based session dashboard
- Workflow phase model and phase-aware UI
- Workflow runner (execute phases via subprocess)
- Artifact viewer/editor for workflow-produced files
- Git worktree isolation for concurrent workflows
- Token usage and cost tracking per session/workflow

**Out of scope:**
- Multi-model support (Claude-only, no Codex/Gemini/OpenCode)
- Cloud deployment or SaaS offering (local-first only)
- Code editing IDE features (manages artifacts, not a general editor)
- Replacing Claude Code CLI (wraps and orchestrates, does not replace)
