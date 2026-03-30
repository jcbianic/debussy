# Intent 012 — QA Staging Loop

> Issue #60

Stage a lane to root for manual testing with structured feedback.

## Staging Flow

1. **Stage**: Verify clean state → push to remote → detach worktree → checkout branch on root
2. **QA**: Test plan presented in Inbox. User tests on root (one lane at a time)
3. **Decide**:
   - **Approve** → PR marked ready, root returns to default branch
   - **Rework** → Worktree recreated, feedback appended to scope.md, lane returns to working

## Root Constraint

The root repo serves exclusively for QA and coordination — no development. This avoids devserver/DB complexity in worktrees. Only one lane can be staged for QA at a time.

## Breaks chain at

review bottleneck, attention drain — structured QA with feedback that flows back to the agent

## Depends on

- Intent 010 — Lane Lifecycle Management
- #36 (Intent 002 — Inbox Review UX)

## Done when

User can stage a lane to root, review a test plan in the Inbox, and approve or rework with structured feedback that flows back to the agent.
