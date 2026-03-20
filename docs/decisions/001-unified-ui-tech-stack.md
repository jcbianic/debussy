# 001 — Unified UI Tech Stack: Nuxt 4 + Nitro

**Status:** Accepted
**Date:** 2026-03-20
**Issue:** [#42 — Unified Debussy UI](https://github.com/jcbianic/debussy/issues/42)

---

## Context

Debussy currently ships per-skill browser UIs — `feedback.html` served by
`feedback-server.py`, and `strategy-review.html` served by
`strategy-server.py`. Each is a self-contained Python stdlib server + single
HTML file. This approach works for simple review flows but breaks down as
requirements grow:

- **File watching** — the UI must react live to markdown files changing on
  disk (workflow state, feedback decisions).
- **File writes** — the UI must write decisions back (approve/reject,
  comments) to files that Claude then reads.
- **Shared infrastructure** — three separate skill UIs duplicate server
  setup, CSS, and interaction patterns with no shared code.

A unified UI consolidating Feedback, Strategy, Workflow, and Roadmap views
into a single application is now the target (Intent 007).

---

## Decision

Use **Nuxt 4 + @nuxt/ui v3 + @nuxtjs/i18n v10** as the frontend framework,
built with **`nuxt build`** (Nitro SSR mode, not static generation).

The same stack is already used for the Debussy project site (`docs/`), so
patterns, config, and i18n conventions are already established in this repo.

### Why Nitro over static generation

Static generation (`nuxt generate`) produces a `dist/` with no server. File
watching and writes would require a separate Python or Node server — two
processes, two ports, CORS concerns. Nitro SSR mode (`nuxt build`) produces
a single `.output/server/index.mjs` that:

- Serves the compiled frontend
- Exposes server API routes (Nitro's `server/api/` directory) for file I/O
- Runs SSE endpoints for live file-change streaming

One command, one process, one port.

### Why Nuxt over vanilla HTML + Python

The unified UI has meaningful complexity: multiple views (Feedback, Strategy,
Workflow, Roadmap), shared navigation, live state updates, and keyboard
navigation requirements. A component framework with a proper design system
(`@nuxt/ui`) removes the maintenance burden of bespoke CSS and JS.

### Distribution

The built `.output/` directory is committed to the repository so that plugin
users have zero build-step at install time. Skills launch the server with:

```bash
node ui/.output/server/index.mjs
```

Node.js is a safe runtime assumption for Claude Code users.

---

## Alternatives Considered

| Option | Rejected because |
|---|---|
| Python + single HTML files (status quo) | Cannot support live file watching, SSE, or write-back without significant bespoke infrastructure that would replicate Nitro |
| Static Nuxt + Python API server | Two processes, two ports; no benefit over Nitro which handles both |
| Vue + Vite without Nuxt | Loses Nitro server routes — file I/O API would need a separate server |
| React / SvelteKit | No familiarity advantage; Nuxt is already established in this repo |

---

## Consequences

- Node.js is a runtime dependency for the skill server (acceptable)
- `.output/` must be rebuilt and committed before each plugin release
- Nitro server routes in `ui/server/api/` own all file I/O logic
- Per-skill HTML files (`feedback.html`, `strategy-review.html`) are
  superseded by this UI and can be removed once the unified UI is stable
