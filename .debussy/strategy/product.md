---
name: Product
icon: i-heroicons-cube
status: draft
---

## Core capabilities (draft)

Review loop: serve review items from any skill session in a browser UI with keyboard navigation, group hierarchy, and approve/reject/discuss actions.

Workflow monitoring: show live progress for /workflow-run sessions — current step, elapsed time, what it's waiting on.

Lane management: launch independent work in git worktrees, switch between them, stage a branch to root, and see cross-lane inbox.

## Open questions

What is the right persistence model for review decisions? File-based? Git notes?

Should lane management require a running server, or can it be purely file-driven?
