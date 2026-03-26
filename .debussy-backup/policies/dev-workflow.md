---
name: Dev Workflow
icon: i-heroicons-arrow-path
status: draft
order: 0
---

## Pipeline

The development workflow defines how work flows from intent to shipped code. Each project configures its pipeline as a YAML workflow file (`.claude/workflows/*.yml`) that chains phases, review gates, and skill invocations.

## Phases

A typical pipeline covers:

- **Discovery** — Research the problem space, map landscape, define audiences (Debussy strategy skills)
- **Specification** — Turn an intent into a structured spec with acceptance criteria
- **Planning** — Break the spec into an implementation plan with ordered tasks
- **Implementation** — Execute the plan: write code, run tests, iterate
- **Review** — Human review of artifacts and code before merge
- **Ship** — Merge, release, close the intent

Not every intent needs every phase. A bug fix skips discovery and specification. A refactor may skip discovery. The workflow YAML defines which phases apply.

## Workflow Selection

The active workflow depends on the scope of work:

- **Full pipeline** — New features driven by a roadmap intent
- **Lightweight** — Bug fixes and small improvements that start at implementation
- **Exploration** — Research-only work that stops after discovery

## Artifacts

Each phase produces artifacts that feed the next:

- Discovery → `.debussy/strategy/*.md`
- Specification → spec document with requirements and scenarios
- Planning → plan with ordered tasks and dependencies
- Implementation → code, tests, commits on a feature branch
- Review → feedback records, approval status
- Ship → merged PR, release tag, changelog entry
