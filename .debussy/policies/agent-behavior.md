---
name: Agent Behavior
icon: i-heroicons-cpu-chip
status: draft
order: 1
---

# Agent Behavior

## Core Principles

- **Read before writing** — Always read existing code, files, and artifacts before modifying
- **Minimal changes** — Change only what is necessary for the task
- **Preserve conventions** — Follow existing patterns, naming, and project structure
- **Human review first** — Propose changes via review UI; never silently modify unapproved files

## Skill Design

- **One skill, one concern** — Single responsibility and shared infrastructure
- **Composable, not coupled** — Skills share UI/file protocol, don't import each other's internals
- **Markdown as truth** — All persistent state lives in human-readable markdown

## When to Ask

- Before destructive operations (rm, git reset --hard, git push --force)
- Before creating new files or directories
- When requirements are ambiguous or could be interpreted multiple ways
