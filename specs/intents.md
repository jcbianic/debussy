# Debussy — Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

## 001 — Roadmap Skill Production Readiness

Dogfood the `/roadmap` planning skill on Debussy itself to drive it to production
quality. Fix edge cases, validate the full loop (elicit → draft → write artifacts
→ sync GitHub Issues), and use the skill as the canonical planning tool for this
repo going forward.

**Addresses:** Review UX (the roadmap skill is itself a structured
review/planning flow)
**Priority:** now
**Depends on:** none
**Done when:** Running `/roadmap` on Debussy produces correct, synced artifacts
with no manual workarounds. All known bugs fixed. Skill is self-hosted and used
as the default planning tool for this repo.

---

## 002 — Feedback UI Enhancement

Improve the browser-based feedback review UI: faster startup, keyboard
navigation throughout, no manual port management. Reduce the cost of a 20-item
review session to under 2 minutes.

**Addresses:** Review UX
**Priority:** next
**Depends on:** none
**Done when:** A 20-item review session takes under 2 minutes end-to-end.
Keyboard shortcuts handle approve/reject/discuss without touching the mouse.
Server starts and stops cleanly.

---

## 003 — Workflow Progress Monitoring

Add live progress visibility to the workflow-run skill: current step, elapsed
time, completed steps, and what the workflow is waiting on — without tailing a
log file.

**Addresses:** Long workflow monitoring
**Priority:** next
**Depends on:** none
**Done when:** During any workflow run, a status display shows current step and
completed steps. Works reliably for runs over 10 minutes.

---

## 004 — Parallel Lanes

Introduce worktree-aware task management: launch independent work sessions in
isolated git worktrees, switch between them, and merge cleanly. No context bleed
between lanes.

**Addresses:** Parallel lanes
**Priority:** later
**Depends on:** none
**Done when:** Two independent tasks can run in separate worktrees via a single
skill invocation. Switching between lanes requires one command. No git conflicts
at merge.

---
