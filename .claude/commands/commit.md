---
description: "Create a well-structured git commit following conventional commits"
allowed-tools: "Bash, Read, Grep, Glob"
delegates-to: " "
---

# Commit Command

Create a clean, well-structured git commit.

## Commit policy

**Commit early and often.** Every coherent change deserves its own commit —
don't batch unrelated work, don't wait for "clean" state. Small commits are
cheap; lost work is not.

**Artifact commits** use the `wip(artifacts)` type for generated or temporary
files (specs, plans, debug traces, snapshots, generated outputs) that may be
squashed or dropped before merging the branch. This keeps the history
navigable without polluting it with noise that outlives the feature.

## 1. Assess the situation

Run these in parallel:

- `git status` to see all changed files
- `git diff --cached` to see staged changes
- `git diff` to see unstaged changes
- `git log --oneline -5` to see recent commit style

## 2. Stage changes

- If nothing is staged, review all changes and suggest what to stage
- Group related changes into one commit; separate artifact-only changes
  into a `wip(artifacts)` commit
- Never stage files that contain secrets
- Prefer `git add <specific files>` over `git add .`

## 3. Draft the commit message

Follow conventional commits: `type(scope): description`

Types: feat, fix, refactor, chore, docs, test, style, perf, ci, **wip**

- `wip(artifacts): <description>` — for generated/temporary files meant
  to be cleaned before merge
- Keep the subject line under 72 characters
- Focus on **why**, not **what**
- Use imperative mood ("add" not "added")

If the user provided an intent as argument, use it to guide the message.

## 4. Commit

- Never use `--no-verify` or skip hooks
- Never amend unless explicitly asked
- Pass the message via HEREDOC for proper formatting

## 5. Confirm

Show the result with `git log --oneline -1` and `git status`.
