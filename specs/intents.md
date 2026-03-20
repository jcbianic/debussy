# Debussy — Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

## 001 — Roadmap Skill Iteration

Do a few targeted iterations on the `/roadmap` skill: dogfood it on
Debussy, fix known bugs found during the run, and validate that the full
loop (elicit → draft → write artifacts → sync GitHub Issues) works without
manual workarounds.

**Addresses:** P1: Documentation Artifact Review Friction
**Target audience:** A1: Solo Builders
**Priority:** now
**Depends on:** none
**Done when:** The skill runs end-to-end on Debussy with no manual
workarounds. Known bugs found during dogfooding are fixed and committed.

---

## 002 — Feedback UI Enhancement

Improve the browser-based feedback review UI: faster startup, keyboard
navigation throughout, no manual port management. Reduce the cost of a
20-item review session to under 2 minutes.

**Addresses:** P1: Documentation Artifact Review Friction
**Target audience:** A1: Solo Builders
**Priority:** next
**Depends on:** none
**Done when:** A 20-item review session takes under 2 minutes end-to-end.
Keyboard shortcuts handle approve/reject/discuss without touching the
mouse. Server starts and stops cleanly.

---

## 003 — Workflow Progress Monitoring

Add live progress visibility to the workflow-run skill: current step,
elapsed time, completed steps, and what the workflow is waiting on —
without tailing a log file.

**Addresses:** P2: Workflow Observability and Organisation
**Target audience:** A1: Solo Builders
**Priority:** next
**Depends on:** none
**Done when:** During any workflow run, a status display shows current step
and completed steps. Works reliably for runs over 10 minutes.

---

## 004 — Parallel Lanes

Introduce worktree-aware task management: launch independent work
sessions in isolated git worktrees, switch between them, and merge
cleanly. No context bleed between lanes.

**Addresses:** P3: Worktree Staging and Session Tracking
**Target audience:** A1: Solo Builders
**Priority:** later
**Depends on:** none
**Done when:** Two independent tasks can run in separate worktrees via a
single skill invocation. Switching between lanes requires one command.
No git conflicts at merge.

---

## 005 — Structured Project Documentation

Define and enforce a standardized documentation structure that covers
features, architecture decisions, and testing strategy. Documentation
must be granular and searchable enough that Claude can reconstruct
project context after compaction without manual re-briefing.

**Addresses:** P4: Structured Project Documentation
**Target audience:** A1: Solo Builders
**Priority:** later
**Depends on:** none
**Done when:** A single skill produces a complete, standardized docs set
for a project. After context compaction, Claude resumes correctly from
the docs alone — no re-briefing required.

---

## 006 — Claude Setup Observability

Provide a single command that shows all loaded plugins, skills, agents,
hooks, and their active status. Detect conflicts and flag skills consuming
disproportionate context budget.

**Addresses:** P5: Claude Setup Observability
**Target audience:** A1: Solo Builders
**Priority:** later
**Depends on:** none
**Done when:** Running the command lists all active Claude Code extensions
with their context footprint. Conflicts between plugins are detected and
reported with actionable suggestions.

---

## 007 — Unified Debussy UI

Build a single browser-based UI that covers all Debussy skill interactions:
feedback review, workflow progress monitoring, strategy artifact browsing,
and roadmap intent tracking. Replace the current per-skill HTML files with
one cohesive interface.

**Addresses:** P1: Documentation Artifact Review Friction, P2: Workflow Observability and Organisation
**Target audience:** A1: Solo Builders
**Priority:** later
**Depends on:** 002, 003
**Done when:** A single command opens a browser interface showing live
workflow status, pending feedback items, and navigable strategy/roadmap
artifacts. No per-skill HTML files required.

---
