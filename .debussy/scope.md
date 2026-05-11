# Intent 011 — Release Orchestration

> Issue #59

Group lanes into a release for batch planning and review.

## Model

A release is a branch (`release/vX.Y`) with a PR targeting main. It groups multiple lanes whose draft PRs target the release branch.

## Phases

### Plan
- List open issues, present in Inbox for triage
- User selects which issues enter the release

### Setup
- Create release branch + PR → main
- For each selected issue: create lane (branch, draft PR → release branch, worktree, scope.md)

### Review
- Pick up PRs marked "ready for review"
- Automated code review + security review
- Advise: merge, request changes, or close
- Squash-merge approved lanes into release branch

## Breaks chain at

review bottleneck — small, scoped PRs replace the monster PR

## Depends on

- Intent 010 — Lane Lifecycle Management

## Done when

User can plan a release from open issues, scaffold all lanes in one command, and review/merge completed lanes into the release branch.
