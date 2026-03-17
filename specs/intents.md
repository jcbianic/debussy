# Debussy — Feature Intents

Intents are ordered implementation milestones. Each builds on the previous.
Work in dedicated git worktrees (`feat/<NNN>-<short-name>`).

---

## 000 — Project Bootstrap

Scaffold the Nuxt 4 application, configure Nuxt UI 3, set up Vitest, and verify
the foundation runs with `npx debussy`. No features — just a working skeleton
with routing, layout, and a health-check API route.

**Done when:** `npx debussy` starts a server on port 3333, opens the browser to
a blank dashboard page, and `vitest run` passes.

---

## 001 — IIKit Phase Model

Define the workflow data model: phases, transitions, entry/exit criteria. Build
the phase-aware UI components (phase stepper, phase card, phase status badges).
No execution yet — UI + data model only.

**Addresses:** workflow visibility (pain point 2)
**Done when:** a workflow with 7 IIKit phases renders in the UI with correct
status display and phase navigation.

---

## 002 — Workflow Runner

Execute IIKit phases via Claude Code subprocess. SSE streaming of output to the
browser. Auto-advance to the next phase when exit criteria are met. Manual
override to advance or repeat a phase.

**Addresses:** workflow visibility (pain point 2) — unattended execution
**Done when:** a full IIKit workflow runs from Specify → Implement via the UI
with real-time streaming output and phase auto-advance.

---

## 003 — Review UI

Replace the terminal-based review flow with an interactive browser UI. Display
review items one at a time. Support approve / flag / skip actions per item.
Produce a structured response that feeds back into the workflow.

**Addresses:** review friction (pain point 1) — the core Debussy differentiator
**Done when:** a 20-item checklist from an IIKit phase can be reviewed entirely
in the browser, item by item, producing a structured decision record without
typing in the terminal.

---

## 004 — Artifact Viewer

Browse, view, and edit the files produced by workflow phases: spec.md, plan.md,
tasks.md, .feature files, generated code. Validate assertion integrity hashes.
Diff view for code artifacts.

**Addresses:** review friction (pain point 1) — artifact inspection side
**Done when:** all IIKit artifact types render correctly with syntax highlighting,
and assertion hash validation runs on .feature files.

---

## 005 — Worktree Isolation

Create and manage git worktrees for concurrent workflows. Each workflow lane gets
its own worktree. UI shows active lanes, their branches, and conflict status.
Switch between lanes without context loss.

**Addresses:** parallel lanes (pain point 3)
**Done when:** two concurrent IIKit workflows run in separate worktrees without
filesystem conflicts, with per-lane status visible in the dashboard.

---

## 006 — Cost & Monitoring Panel

Track token consumption, burn rate, and cost per session and workflow. Surface
context window usage in real-time. Alert when sessions are approaching limits.
Read from `~/.claude/projects/` JSONL files.

**Addresses:** workflow visibility (pain point 2) — cost side
**Done when:** token usage and estimated cost display per session, updating in
real-time during an active workflow.

---

## Future — Plugin Architecture

Explore packaging Debussy as a Claude Code **plugin** (`.claude-plugin/`) that
bundles multiple skills (`/debussy:review`, `/debussy:run`, `/debussy:status`)
under a single namespaced, versioned distribution unit. The web server becomes
a component started by a hook or skill rather than a standalone npm binary.

This is not a current implementation intent — it's a direction to keep in mind
when making distribution decisions.
