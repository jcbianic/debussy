# Debussy — Intent Document

## What is Debussy?

Debussy is a local-first web UI for orchestrating Claude Code sessions with
workflow awareness. It gives developers a visual interface to manage, monitor,
and coordinate the work Claude Code does on their codebase — replacing the
current workflow of juggling terminal tabs, manually switching workflow phases,
and losing track of session history.

Debussy is built on Nuxt 4 (Vue 3 + Nitro), providing subprocess management,
SSE streaming, session lifecycle, and terminal access. It adds IIKit workflow
orchestration, artifact review, worktree isolation, and cost monitoring.

## Why Debussy?

Three concrete friction points in daily Claude Code use:

**1. Review UX is broken.** When a workflow produces a 20-item checklist or
validation report, you have to read through the entire list while simultaneously
typing your response in a terminal. There's no UI to go item by item, no way to
approve, flag, or skip with a click. Every review session is a context-switching
nightmare.

**2. Long workflows need unattended running + visibility.** A full IIKit cycle
can take 30–60 minutes. You shouldn't have to babysit it — but you also can't
leave it blind. You need to start a workflow, walk away, and come back to a clear
picture of where it is, what it produced, and whether it's waiting on you.

**3. Parallel work creates chaos.** Running two features simultaneously means
either sequential serialization (slow) or branch conflicts and filesystem
collisions (painful). There's no built-in concept of isolated lanes that let you
context-switch cleanly between concurrent workstreams.

---

The Claude Code ecosystem has 150+ tools, yet none address these three problems
together. The current landscape is fragmented:

- **Session management** (recall, claude-history) is TUI/CLI-only — no web UI, no filtering, no tagging
- **Workflow orchestration** (IIKit, Ralph, GSD) requires manual phase switching via the terminal
- **Artifact review** (claude-code-viewer) is read-only — you can browse but not approve, edit, or validate
- **Multi-session monitoring** (claude-squad) depends on tmux — powerful but not visual
- **Cost tracking** (ccusage) is a separate CLI tool with no integration into the session workflow

Debussy bridges this gap by combining session management with a workflow
intelligence layer.

## Core Use Cases

### 1. Session Dashboard
Browse, search, filter, and resume Claude Code sessions from a web UI. See
real-time status across multiple concurrent sessions. Fork, archive, and resume
sessions. Permission prompts surfaced in the browser.

### 2. Workflow Runner (Debussy's core addition)
Define and execute structured workflows (IIKit phases, Ralph loops, custom
pipelines) from the UI. Visualize phase progression, auto-switch between phases
when exit criteria are met, and surface validation results at each checkpoint.

### 3. Artifact Manager
View, edit, and validate artifacts produced by Claude Code sessions — specs,
plans, task lists, test definitions, generated code. Review what each IIKit
phase produced. Validate assertion integrity hashes.

### 4. Cost & Monitoring Panel
Track token consumption, burn rate, and cost per session/workflow. Surface
context window usage in real-time. Alert when sessions are approaching limits.

## Architecture Decisions

### Nuxt 4 unified framework

Debussy uses Nuxt 4 (Vue 3 + Nitro server) as a single framework for both
frontend and backend. Nitro handles API routes, WebSocket connections, and serves
the SPA — one process, one port.

| Layer | Technology |
|---|---|
| **Frontend** | Vue 3 + Nuxt UI 3 (Radix Vue + Tailwind CSS 4) |
| **Backend** | Nitro server (API routes + WebSocket) |
| **Terminal** | xterm.js + node-pty |
| **Database** | SQLite via better-sqlite3 |
| **Subprocess** | `claude -p --output-format stream-json` via `@anthropic-ai/claude-code` SDK |
| **Streaming** | SSE + WebSocket |
| **Testing** | Vitest 3.2 (unit + integration + E2E) |

### Subprocess-based, not SDK-based

Debussy uses the `@anthropic-ai/claude-code` SDK which wraps `claude -p`
subprocess spawning. This works with Claude Max subscriptions (OAuth) without
requiring a separate API key. The subprocess flags include
`--output-format stream-json`, `--verbose`, and model/tool configuration.

### Local-first

Debussy runs entirely on the developer's machine. No cloud, no telemetry, no
accounts. Session data is read from `~/.claude/projects/` (the standard Claude
Code storage location). Debussy's own metadata lives in SQLite at
`~/.debussy/`.

### Web UI, not desktop app

A self-hosted web server (localhost) rather than Electron/Tauri. Reasons:
- Lighter weight — no 200MB+ Electron bundle
- Accessible from any browser, including mobile for monitoring
- Easier to develop and iterate on
- The ecosystem already has desktop apps (opcode, AionUi, CodePilot) — none have succeeded

### Git worktree isolation

Each concurrent workflow runs in its own git worktree, following the pattern
proven by claude-squad and Claude Code's native `--worktree` flag. This
prevents workflows from stepping on each other's file changes.

## Distribution

Debussy is distributed as an npm package. Users launch it with `npx debussy`
from any repository. The CLI entry point starts the Nitro server and opens the
browser to `http://localhost:3333`.

## Ecosystem References

### Patterns to study (not fork)

| Tool | What to learn from |
|---|---|
| **Vibe Kanban** | Diff review UX, inline commenting, worktree-per-workspace lifecycle |
| **claude-code-viewer** | JSONL session parsing, git diff rendering |
| **claude-hud** | JSONL transcript parsing for context usage and active tools |
| **ccusage** | Token/cost analytics from local JSONL files |
| **Codeman** | SSE backpressure (16ms batching + rAF sync), permission prompt UX |
| **claude-code-webui** | Permission dialog patterns (MIT, clean reference) |

### Workflow Templates to Support

| Workflow | Source | Pattern |
|---|---|---|
| **IIKit** (Specify > Plan > Checklist > Testify > Tasks > Analyze > Implement) | tessl.io | 7-phase TDD-first with assertion integrity |
| **Ralph Loop** (autonomous iteration with exit gates) | ralph-claude-code | Continuous loop with dual-condition exit detection |
| **RIPER** (Research > Innovate > Plan > Execute > Review) | claude-code-riper-5 | 5-mode strict separation |
| **GSD** (atomic planning + fresh context per phase) | get-shit-done | Context rot prevention via phase isolation |
| **Custom** | User-defined | YAML/JSON workflow definitions |

## What Debussy is NOT

- **Not a Claude Code replacement** — it wraps and orchestrates Claude Code, it doesn't replace the CLI
- **Not a multi-model tool** — focused on Claude Code specifically, not Codex/Gemini/OpenCode
- **Not a cloud service** — local-first, no SaaS, no accounts
- **Not a code editor** — it manages the artifacts Claude produces, not a general-purpose IDE
- **Not a fork** — it's an original project built from scratch on Nuxt 4

## Gap Analysis vs. Existing Tools

| Existing Tool | What it does well | What Debussy adds |
|---|---|---|
| **claude-squad** | Multi-agent tmux + worktree isolation | Web UI instead of tmux; workflow awareness; artifact review |
| **claude-code-viewer** | Session browsing, diff viewing, search | Editing, validation, approval gates; real-time monitoring |
| **Vibe Kanban** | Kanban + code review for agent work | Workflow orchestration; phase sequencing; cost tracking |
| **claudecodeui** | Feature-rich web UI, plugin system | IIKit-native workflow model; worktree isolation |
| **IIKit** | Rigorous 7-phase TDD workflow | Visual phase runner; auto-switching; no manual `/phase` commands |

## Resolved Questions

1. **Tech stack** — Nuxt 4 (Vue 3 + Nitro), Nuxt UI 3, xterm.js, SQLite
2. **Real-time communication** — SSE for streaming, WebSocket for terminal
3. **Session storage** — SQLite at `~/.debussy/`
4. **Distribution** — npm package, `npx debussy` launches server + browser
5. **UI framework** — Vue 3 / Nuxt UI 3 (not React)

## Open Questions

1. **Workflow definition format** — YAML? JSON? Markdown with frontmatter? Should be human-readable and version-controllable.
2. **Permission model** — How to surface Claude Code's tool permission prompts in the browser UI.
3. **Plugin vs. web app** — Debussy may need to become a Claude Code **plugin** (not just a standalone npm package). A plugin can bundle multiple skills (`/debussy:review`, `/debussy:run`, etc.), agents, hooks, and MCP servers under a single namespaced, versioned, distributable unit. The web UI would be a component launched by a skill or hook. This allows skills like `workflow-run` to be first-class Claude Code commands while the server component handles the review UX. See [Claude Code plugin docs](https://code.claude.com/docs/en/plugins.md) for the manifest format.

## Project Status

**Phase: POC validated, ready to scaffold the real app.**

Nuxt 4 selected after evaluating React/Express (too much boilerplate for a
local tool), Electron (too heavy), and Tauri (too complex for npx distribution).
Nuxt's unified server+client architecture, Nitro API routes, and Nuxt UI 3
component library match Debussy's requirements exactly.
