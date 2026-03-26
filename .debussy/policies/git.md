---
name: Git
icon: i-heroicons-code-bracket-square
status: defined
order: 1
---

## Branching

Branch naming follows the pattern `type/slug`:

- `feat/<issue-id>-<slug>` — New features and enhancements
- `fix/<issue-id>-<slug>` — Bug fixes
- `chore/<slug>` — Maintenance, deps, config
- `docs/<slug>` — Documentation only

Branches are created from main. Feature branches must pass CI before merging. Branches are deleted after merge. Worktrees follow the same naming conventions.

## Commits

Commit messages follow Conventional Commits:

- `feat(scope): description` — New feature
- `fix(scope): description` — Bug fix
- `chore(scope): description` — Maintenance
- `docs(scope): description` — Docs only
- `refactor(scope): description` — No behavior change

Scope is the affected skill or module (e.g., strategy, roadmap, feedback, workflow-run, ui). Breaking changes use `!` suffix: `feat(api)!: change response format`. Issue references go in the PR description, not the commit message.

## Pull Requests

One PR per intent or issue. The PR description includes a summary, test plan, and issue reference. Draft PRs are used for work-in-progress that needs early feedback.
