---
name: Product
icon: i-heroicons-cube
status: reviewed
---
# Product: Debussy

## One-Liner
A Claude Code meta-plugin that gives solo builders a disciplined approach from idea to shippable feature — without losing the thread.

## Positioning
Claude Code's raw capability creates a trap: the monster branch. You throw ideas at it, the branch grows, the PR becomes unreviewable, and you end up rescoping — losing the velocity you gained. Debussy breaks this loop at every link: strategy and product strates scope the work upstream with full context, engineering governance prevents scope creep, the inbox captures your feedback on artifacts where it counts, and parallel lanes make multi-session work visible and manageable.

## Target User
A1: Solo builders and indie developers using Claude Code who carry every role at once — product thinker, architect, developer, reviewer.

## Nature
- **License**: MIT
- **Distribution**: Claude Code plugin system / GitHub
- **Source**: Open

## Non-Goals
- Not an IDE or editor — lives inside Claude Code
- Not a code generation tool — Claude Code handles that
- Not a team collaboration platform — optimized for the solo builder
- Not a sprint/board/velocity tool — but does manage a roadmap of intents and their lifecycle

## Key Dependencies
- Claude Code (CLI)
- GitHub CLI (`gh`) for issue sync

_(Nuxt 4 UI is a build-time dependency of the plugin, not a user-facing dependency)_
