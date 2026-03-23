---
id: "002"
shortTitle: Committed .output/ Build
status: Accepted
date: 2026-03-20
affectedPrinciples: ["3"]
---

# 002 — Commit .output/ Build Artifacts to the Repository

**Status:** Accepted
**Date:** 2026-03-20

---

## Context

Plugin users install Debussy by copying `.claude/` into their project. They
should not be expected to have Node.js available, run `npm install`, or
execute a build step. The plugin must be usable immediately after
installation.

The Nuxt build produces `.output/server/index.mjs` — a self-contained Node
server with no external dependencies beyond the Node.js runtime, which all
Claude Code users already have.

---

## Decision

Remove `.output/` from `.gitignore`. Commit the build output to the
repository. The start command (`node ui/.output/server/index.mjs`) is the
only thing a plugin user ever runs.

---

## Consequences

- The repository is heavier (~10 MB) than a source-only repo.
- Every UI change requires a rebuild and a second commit before the plugin
  release.
- Contributors must not delete `.output/` from their local clone — this
  would break the plugin for anyone who installs from that commit.
