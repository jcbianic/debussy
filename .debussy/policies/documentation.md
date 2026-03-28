---
name: Documentation
icon: i-heroicons-document-text
status: draft
order: 5
---

# Documentation

## What to Document

- **Why, not what** — Explain design decisions and constraints
- **Gotchas** — Unexpected behaviors, performance considerations
- **Non-obvious patterns** — Why a particular approach was chosen
- **API routes** — Request/response shapes, side effects

## Where

- **Markdown files** — `docs/` for user-facing; `ARCHITECTURE.md` for system
- **Code comments** — Only when logic isn't self-evident
- **ADRs** — Document significant architectural decisions in `docs/decisions/`
- **README** — Project overview, getting started, quick links

## Format

- **Markdown** — All docs are human-readable markdown
- **No docstrings** — Unless explaining complex logic
- **Prefer code clarity** — Self-documenting code > documentation
