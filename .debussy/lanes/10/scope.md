# Lane Lifecycle Management

> Issue #10

## Summary

Implement the lane system — a structured workflow for managing
parallel feature development in Debussy. Each lane wraps a
GitHub issue with its own git branch, worktree, and state
machine.

## Scope

- **Lane creation**: Create a lane from a GitHub issue —
  branch, worktree, draft PR, lane record
- **State machine**:
  created → working → staged → qa → ready ��� merged
- **Git operations**: push, pull, stage (move to root),
  to-worktree (move back), restore orphaned
- **Orphan detection**: Detect when a worktree is removed
  but the record persists — offer restore or delete
- **Scope tab**: Display the lane's intent/scope as a
  rendered markdown tab
- **Start Work button**: Write a work-request file and
  copy the workflow command to clipboard

## Done When

- Lanes can be created, transitioned through all states,
  and merged from the UI
- Lane detail page shows Scope, Inbox, Workflow, and
  Commits tabs
- Start Work button creates a work request and copies
  the command

---
*Lane for the lane system itself.*
