# Debussy — Sequential Feature Intents

These intents are designed to be fed to IIKit's `/iikit-01-specify` one at a time,
in order. Each builds on the previous. Work on each intent in its own git worktree
branch (see CLAUDE.md for worktree workflow).

---

## Intent 001 — Claude Subprocess Pipe

**Branch**: `feat/001-subprocess-pipe`

Scaffold a Nuxt 3 application (Vue 3, TypeScript, Nitro server) that can spawn a
single `claude -p --output-format stream-json` subprocess and pipe its output to
the browser in real time.

The Nitro server exposes an SSE endpoint (`/api/session/stream`) that:
- Spawns `claude -p --output-format stream-json` as a child process
- Reads stdout line-by-line, parses each JSON message
- Pushes parsed events to the browser via Server-Sent Events

The Vue page (`/`) displays:
- A scrolling message feed showing Claude's responses as they stream in
- A text input at the bottom that sends user messages to the subprocess's stdin
  via a POST endpoint (`/api/session/send`)
- A start/stop button to spawn or kill the subprocess

No persistence, no session management, no multiple sessions. Just prove the
stdin/stdout/SSE pipe works end-to-end.

---

## Intent 002 — Session Management

**Branch**: `feat/002-session-management`

Add support for multiple concurrent Claude Code sessions. Each session is an
independent `claude -p` subprocess with its own SSE stream.

Server-side:
- A `SessionManager` class (in `server/lib/`) that tracks active sessions by ID
- REST endpoints: `POST /api/sessions` (create), `GET /api/sessions` (list),
  `DELETE /api/sessions/:id` (terminate), `GET /api/sessions/:id/stream` (SSE)
- `POST /api/sessions/:id/send` to pipe input to a specific session's stdin
- In-memory state only (sessions lost on server restart)

UI:
- Left sidebar listing active sessions with status indicator (running / idle / dead)
- Clicking a session switches the main panel to that session's stream
- "New session" button in the sidebar
- Session naming (auto-generated, user-editable)

---

## Intent 003 — IIKit Phase Model

**Branch**: `feat/003-iikit-phase-model`

Introduce the IIKit workflow as a data model. This intent adds the phase graph
and phase-awareness to the UI — but does NOT yet execute phases automatically.

Data model (`server/lib/workflow.ts`):
- Define the IIKit phase graph as a directed state machine:
  `00-constitution → 01-specify → 02-plan → [03-checklist] → 04-testify →
   05-tasks → [06-analyze] → 07-implement → [08-taskstoissues]`
- Phases marked optional: 03-checklist, 06-analyze, 08-taskstoissues
- Each phase has: id, name, slash command, description, required prior phases
- A `Workflow` type that tracks: target project path, feature name, current phase,
  phase completion history

State reading:
- Read `.specify/context.json` from the target project to determine current
  `feature_stage` and map it to the phase graph
- Read `specs/<feature>/` to detect which artifacts exist (spec.md, plan.md, etc.)

UI:
- A workflow creation form: pick a project directory, name a feature
- A horizontal phase progress bar component showing all phases, highlighting
  current position, greying out completed, marking optional phases distinctly
- Phase detail panel showing: phase description, expected artifacts, prerequisites

No subprocess execution in this intent — phase progression is read-only from
the filesystem state.

---

## Intent 004 — Workflow Runner

**Branch**: `feat/004-workflow-runner`

Connect the phase model to actual Claude Code execution. Running an IIKit phase
means spawning `claude -p` with the phase's slash command as the prompt, in the
target project's directory.

Server-side:
- `WorkflowRunner` class that:
  - Takes a workflow + phase, spawns `claude -p` in the target project's `cwd`
  - Passes the IIKit slash command (e.g., `/iikit-01-specify <feature desc>`)
    as the initial prompt
  - Streams output via SSE like a regular session
  - On subprocess exit, re-reads `.specify/context.json` to update phase state
- Each phase run is a separate subprocess (fresh context per phase)
- Endpoint: `POST /api/workflows/:id/run-phase` triggers the next valid phase

UI:
- "Run next phase" button on the workflow view (enabled only when prerequisites met)
- The phase progress bar updates in real-time as phases complete
- The streaming output panel shows the current phase's Claude output
- After a phase completes, the UI shows a summary: artifacts created/modified,
  phase duration
- User can provide additional context/instructions before running a phase
  (appended to the slash command prompt)

---

## Intent 005 — Permission Prompt Routing

**Branch**: `feat/005-permission-routing`

Surface Claude Code's tool permission prompts in the browser UI instead of
silently hanging or auto-approving everything.

Server-side:
- Launch `claude -p` with `--permission-prompt-tool stdio` flag
- Detect permission request JSON messages in the stdout stream (they have a
  distinct `type` field in the stream-json protocol)
- When a permission request arrives, push it to the browser via the existing SSE
  stream as a special event type
- Expose `POST /api/sessions/:id/permission` endpoint that writes the
  approval/denial response back to the subprocess's stdin

UI:
- When a permission event arrives, display a modal or inline banner showing:
  the tool name, the operation it wants to perform, relevant file paths
- Approve / Deny buttons
- A session-level toggle for "auto-approve read-only tools" (Glob, Grep, Read,
  NotebookRead) — writes are always surfaced
- Visual indicator on the session list when a session is waiting for permission

---

## Intent 006 — Artifact Viewer

**Branch**: `feat/006-artifact-viewer`

Display and browse the artifacts produced by IIKit phases. The user should be
able to review what each phase produced without leaving Debussy.

Server-side:
- Endpoint `GET /api/workflows/:id/artifacts` scans `specs/<feature>/` and
  returns the artifact tree (file names, sizes, last modified)
- Endpoint `GET /api/workflows/:id/artifacts/:path` returns file content
- Detect artifact types: markdown (spec.md, plan.md, tasks.md), gherkin
  (.feature), JSON (context.json), and generic text

UI:
- An "Artifacts" tab on the workflow view alongside the stream output
- File tree in the left panel of the artifacts tab
- Main panel renders the selected artifact:
  - Markdown files: rendered as HTML
  - Gherkin .feature files: syntax-highlighted
  - context.json: formatted key-value display showing feature stage, hash, etc.
  - tasks.md: rendered with checkbox state visible
- After each phase completes, the artifacts tab auto-refreshes and highlights
  newly created or modified files

---

## Intent 007 — Git Worktree Isolation

**Branch**: `feat/007-worktree-isolation`

Each workflow session runs in its own git worktree so concurrent workflows on
the same project don't conflict on file changes.

Server-side:
- When creating a workflow, create a git worktree:
  `git worktree add <path> -b debussy/<feature-name>`
- The `claude -p` subprocess for that workflow runs with `cwd` set to the
  worktree path
- On workflow completion or cleanup, offer to merge the worktree branch back
  and remove the worktree
- Track worktree paths in the workflow state

UI:
- Workflow creation form shows the worktree branch that will be created
- Workflow view shows the worktree path and branch name
- "Merge & cleanup" button when a workflow is complete
- Warning if a worktree's branch has diverged significantly from main

---

## Intent 008 — Cost and Context Monitoring

**Branch**: `feat/008-cost-monitoring`

Track and display token consumption and context window usage per session and
per workflow phase.

Server-side:
- Parse token usage from the stream-json output (Claude's streaming protocol
  includes `usage` fields with input/output token counts)
- Accumulate per-session and per-phase totals
- Estimate cost based on the model being used (read model from session metadata)
- Track context window fill percentage from usage data

UI:
- Token counter in the session header (input tokens / output tokens / total)
- Per-phase cost breakdown on the workflow view
- A small context window gauge showing how full the context is
- Color coding: green (<50%), yellow (50-80%), red (>80%) context usage
- Workflow total cost summary
