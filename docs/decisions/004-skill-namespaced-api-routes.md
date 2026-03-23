---
id: "004"
shortTitle: Skill-Namespaced API Routes
status: Proposed
date: 2026-03-21
affectedPrinciples: ["2", "7"]
---

# 004 — Skill-Namespaced API Route Conventions

**Status:** Proposed
**Date:** 2026-03-21

---

## Context

As more skills gain UI pages, server API routes will multiply. Today they
are ad-hoc (e.g., `/api/files`, `/api/watch`). With four or more active
skills, route naming collisions become a maintenance risk and the flat
namespace gives no signal about which skill owns which endpoint.

---

## Proposed Decision

Namespace all routes as `/api/{skill}/{resource}` — e.g.,
`/api/roadmap/releases`, `/api/feedback/sessions`,
`/api/strategy/artifacts`, `/api/ui/watch`. Each skill owns its subtree.
Shared infrastructure (file watching, generic file reads) lives under
`/api/ui/`.

---

## Open Questions

Does this require a skill registration mechanism, or is the directory
convention enough?

How do we handle cross-skill resources — e.g., roadmap reading a strategy
artifact? Does the roadmap page call `/api/strategy/artifacts` or does it
have its own route that reads the same file?

Should the convention be enforced in CI (e.g., a lint rule) or documented
only?
