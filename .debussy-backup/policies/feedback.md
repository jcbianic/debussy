---
name: Feedback
icon: i-heroicons-chat-bubble-left-right
status: draft
order: 3
---

## Human-in-the-Loop

The agent must request human review before:

- Merging or pushing code to a shared branch
- Deleting files, branches, or data that cannot be easily recovered
- Making architectural decisions that affect multiple modules
- Executing destructive operations (force-push, reset, drop)

## Review Gates

Skills that produce artifacts (strategy, roadmap) include a browser-based review step. The agent presents artifacts for review and waits for explicit approval before proceeding.

Review feedback is structured: each item gets an accept/reject/revise decision with optional comments. The agent incorporates feedback before finalizing.

## Autonomy Boundaries

The agent can act autonomously for:

- Reading files, searching code, running tests
- Creating or editing files in the working branch
- Running linters, type-checkers, and build commands
- Creating draft artifacts for review

The agent must confirm before:

- Any action visible to others (push, PR, comment)
- Any irreversible action (delete, force-push)
- Scope changes that deviate from the original request
