---
name: Git Workflow
icon: i-heroicons-git-branch
status: draft
order: 2
---

# Git Workflow

## Branching Strategy

- **main** — Always deployable, stable release branch
- **dogfood** — Active development branch (protected)
- **Feature branches** — Work on feature/skill-name or fix/issue-name off main or dogfood

## Worktrees for Parallel Work

- **Use git worktrees** — For independent parallel features, use `git worktree add` to create isolated branches
- **Naming** — Keep worktree names short and descriptive (e.g., wt-feature-name)
- **Cleanup** — Remove worktrees with `git worktree remove` when complete
- **One worktree per feature** — Don't mix multiple features in one worktree

## Commits

- **Atomic commits** — Each commit logically complete
- **Conventional messages** — Use fix:, feat:, chore:, docs: prefixes
- **Author attribution** — Include `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`

## Pull Requests

- **Focused scope** — One feature/fix per PR
- **Clear description** — Explain *why*, not just *what*
- **No force push** — Preserve history after PR approval
