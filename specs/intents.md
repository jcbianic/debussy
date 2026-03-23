---
title: Debussy — Roadmap Intents
---

## — Plugin scaffold and distribution model

**id:** —
**release:** r0
**releaseName:** Release 0.x
**releaseTheme:** Early exploration
**state:** done
**addresses:** Foundation
**issue:** 29

Strip repo to plugin-only core, define distribution model via .claude-plugin/.

**doneWhen:** Plugin installs cleanly via npx claude code --install-plugin.

---

## — Strategy skill — research + artifact generation

**id:** —
**release:** r0
**releaseName:** Release 0.x
**releaseTheme:** Early exploration
**state:** done
**addresses:** P1: Review Friction
**issue:** 30

First end-to-end skill: research the landscape and audiences, generate vision/landscape/product artifacts, serve a browser review UI.

**doneWhen:** Running /strategy produces all three artifacts without manual prompting.

---

## — Roadmap skill — intents + GitHub Issue sync

**id:** —
**release:** r0
**releaseName:** Release 0.x
**releaseTheme:** Early exploration
**state:** done
**addresses:** P1: Review Friction
**issue:** 32

**doneWhen:** Running /roadmap produces intents.md and syncs each intent to a GitHub Issue.

---

## — GitHub Pages project site

**id:** —
**release:** r0
**releaseName:** Release 0.x
**releaseTheme:** Early exploration
**state:** done
**addresses:** Distribution
**issue:** 33

**doneWhen:** docs/ site live at jcbianic.github.io/debussy.

---

## 001 — Roadmap Skill Iteration

**id:** 001
**release:** r1
**releaseName:** Release 1.0
**releaseTheme:** Foundation
**state:** done
**priority:** now
**addresses:** P1: Documentation Artifact Review Friction
**issue:** 34

Dogfood the roadmap skill on debussy, fix known bugs, validate the full loop works without manual workarounds.

**doneWhen:** The skill runs end-to-end on debussy with no manual workarounds.

---

## 002 — Feedback UI Enhancement

**id:** 002
**release:** r1
**releaseName:** Release 1.0
**releaseTheme:** Foundation
**state:** in-progress
**priority:** next
**addresses:** P1: Documentation Artifact Review Friction
**issue:** 38
**lane:** feat/feedback-ui
**laneId:** wt-feedback

Faster startup, keyboard navigation, no manual port management. Reduce a 20-item review to under 2 minutes.

**doneWhen:** A 20-item review session takes under 2 minutes. Keyboard shortcuts handle approve/reject/discuss.

---

## 003 — Workflow Progress Monitoring

**id:** 003
**release:** r1
**releaseName:** Release 1.0
**releaseTheme:** Foundation
**state:** open
**priority:** next
**addresses:** P2: Workflow Observability
**issue:** 40

Add live progress visibility: current step, elapsed time, what it's waiting on — without tailing a log file.

**doneWhen:** During any workflow run, a status display shows current step and completed steps. Works for runs over 10 minutes.

---

## 004 — Unified UI

**id:** 004
**release:** r1
**releaseName:** Release 1.0
**releaseTheme:** Foundation
**state:** in-progress
**priority:** next
**addresses:** P1–P3: All friction points
**issue:** 42
**lane:** feat/42-unified-ui
**laneId:** root

Replace per-skill browser UIs with a single Nuxt 4 app. Consolidates feedback review, workflow monitoring, roadmap, and product views.

**doneWhen:** All existing skill UIs are replaced by routes in the unified app. Per-skill HTML files removed.

---

## 005 — Parallel Lanes

**id:** 005
**release:** r2
**releaseName:** Release 2.0
**releaseTheme:** Parallel Work
**state:** open
**priority:** later
**addresses:** P3: Worktree Staging and Session Tracking
**issue:** 43

Worktree-aware task management: launch independent work in isolated git worktrees, switch between them, merge cleanly.

**doneWhen:** Two independent tasks run in separate worktrees. Switching requires one command. No git conflicts at merge.

---

## 006 — Structured Project Documentation

**id:** 006
**release:** r2
**releaseName:** Release 2.0
**releaseTheme:** Parallel Work
**state:** open
**priority:** later
**addresses:** P4: Structured Project Documentation

Standardized documentation structure covering features, architecture decisions, and testing strategy.

**doneWhen:** After context compaction, Claude resumes correctly from the docs alone — no re-briefing required.

---

## 007 — Claude Setup Observability

**id:** 007
**release:** r2
**releaseName:** Release 2.0
**releaseTheme:** Parallel Work
**state:** open
**priority:** later
**addresses:** P5: Claude Setup Observability

Single command listing all loaded plugins, skills, agents, hooks, and their active status. Detects conflicts.

**doneWhen:** Running the command lists all active Claude Code extensions with context footprint. Conflicts detected and reported.

---

## 008 — Plugin compatibility management

**id:** 008
**release:** r2
**releaseName:** Release 2.0
**releaseTheme:** Parallel Work
**state:** open
**priority:** later
**addresses:** Gap: Plugin conflicts

Detect and report conflicts between installed plugins. Suggest resolutions for common incompatibilities.

---

## — Persistent preference learning from feedback loops

**id:** —
**release:** backlog
**releaseName:** Backlog
**releaseTheme:** Not yet scoped
**state:** out-of-scope
**addresses:** Gap: Human-to-agent feedback

---

## — Cost predictability and budget controls

**id:** —
**release:** backlog
**releaseName:** Backlog
**releaseTheme:** Not yet scoped
**state:** out-of-scope
**addresses:** Gap: Cost opacity

---

## — Plugin update mechanism

**id:** —
**release:** backlog
**releaseName:** Backlog
**releaseTheme:** Not yet scoped
**state:** out-of-scope
**addresses:** Gap: Plugin updates

---

## — Workflow audit trails

**id:** —
**release:** backlog
**releaseName:** Backlog
**releaseTheme:** Not yet scoped
**state:** out-of-scope
**addresses:** Gap: Observability

---

## — Collaborative multi-user workflows

**id:** —
**release:** backlog
**releaseName:** Backlog
**releaseTheme:** Not yet scoped
**state:** out-of-scope
**addresses:** Gap: Collaboration
