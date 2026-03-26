---
name: Problems
icon: i-heroicons-exclamation-triangle
status: reviewed
---

## P1 — Review friction

The browser-based review UIs (feedback, strategy) require manual server startup, have no keyboard navigation, and are slow to load. A 5-item review takes several minutes when it should take seconds.

## P2 — Workflow opacity

Long-running workflow-run sessions have no live progress indicator. The developer must tail logs or wait blindly for completion.

## P3 — Lane management

Working across multiple git worktrees is powerful but unmanaged. There is no way to see all active worktrees, their pending reviews, or switch between them from a single interface.
