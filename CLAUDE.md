# Debussy — Project Instructions

@AGENTS.md follow the [agent rules](AGENTS.md)

## What is this

Debussy is a local-first web UI for orchestrating Claude Code sessions and IIKit
workflows. See `INTENT.md` for full context and `specs/intents.md` for the
feature backlog.

## Tech Stack

- **Framework**: Nuxt 4 (Vue 3 + Nitro server)
- **UI**: Nuxt UI 3 (Radix Vue + Tailwind CSS 4)
- **Terminal**: xterm.js + node-pty
- **Database**: SQLite via better-sqlite3
- **Subprocess**: `claude -p --output-format stream-json` via `@anthropic-ai/claude-code` SDK
- **Real-time**: SSE (Nitro) + WebSocket (h3, for terminal)
- **Testing**: Vitest 3.2 (unit + integration + E2E)
- **Language**: TypeScript throughout
- **Distribution**: npm package with `bin` entry (`npx debussy`)

## Worktree Workflow

Each feature intent is developed in its own git worktree. This allows parallel
work on multiple intents without branch conflicts.

### Creating a worktree for an intent

```bash
# From the main repo root
git worktree add .worktrees/<NNN>-<short-name> -b feat/<NNN>-<short-name>

# Example for Intent 001:
git worktree add .worktrees/001-subprocess-pipe -b feat/001-subprocess-pipe

# cd into the worktree to work
cd .worktrees/001-subprocess-pipe
```

Worktrees live inside `.worktrees/` (gitignored). Each is a full working copy
of the repo on a dedicated branch.

### Working in a worktree

- Install dependencies in the worktree: `npm install` (or whatever the package
  manager ends up being)
- Run the dev server from the worktree directory
- Commits go to the worktree's branch (`feat/001-subprocess-pipe`, etc.)
- IIKit commands run inside the worktree directory, targeting the worktree's
  own codebase

### Running IIKit in a worktree

```bash
cd .worktrees/001-subprocess-pipe
# IIKit is vendored in .tessl/ — no install needed in worktrees
/iikit-01-specify "<paste the intent text from specs/intents.md>"
/iikit-02-plan
/iikit-04-testify
/iikit-05-tasks
/iikit-07-implement
```

Feed the intent description from `specs/intents.md` as the input to
`/iikit-01-specify`. Follow the IIKit phase sequence for each intent.

### Merging back

```bash
# From main repo root
git checkout main
git merge feat/001-subprocess-pipe
git worktree remove .worktrees/001-subprocess-pipe
```

### Parallel work

Multiple worktrees can exist simultaneously:

```bash
git worktree add .worktrees/001-subprocess-pipe -b feat/001-subprocess-pipe
git worktree add .worktrees/002-session-management -b feat/002-session-management
git worktree add .worktrees/003-iikit-phase-model -b feat/003-iikit-phase-model

# List active worktrees
git worktree list
```

Intents are designed to be sequential (each builds on the previous), but you
can start research/planning on a later intent while implementing an earlier one.
Merge intents in order: 001 → 002 → 003 → etc.

### Worktree conventions

- Directory naming: `.worktrees/<NNN>-<short-name>` (inside repo, gitignored)
- Branch naming: `feat/<NNN>-<short-name>` matching the intent number
- One worktree per intent, one intent per worktree
- Clean up worktrees after merge: `git worktree remove .worktrees/<NNN>-<short-name>`

## Code Conventions

- Pages in `pages/` (Nuxt file-based routing)
- Components in `components/` (auto-imported by Nuxt)
- Layouts in `layouts/`
- Server API routes in `server/api/` (Nitro)
- Server WebSocket routes in `server/routes/`
- Server utilities in `server/utils/`
- Types co-located or in `types/`

## Intent Sequencing

See `specs/intents.md` for the full list. The order matters:

0. **000 — Project Bootstrap**: scaffold Nuxt 4 app, verify foundation
1. **001 — IIKit Phase Model**: workflow data model and phase-aware UI
2. **002 — Workflow Runner**: execute IIKit phases via subprocess
3. **003 — Review UI**: item-by-item interactive review with structured output
4. **004 — Artifact Viewer**: browse and validate IIKit-produced files
5. **005 — Worktree Isolation**: isolate concurrent workflows via git worktrees
6. **006 — Cost Monitoring**: token usage and cost tracking
