# Debussy — Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

## 001 — Product Strate

Define the product and shape the roadmap. Consumes strategy artifacts produced by the strategy strate (currently at pitch depth).

**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** none
**Done when:** /product synthesizes from strategy artifacts, validates with user, and writes product definition artifacts.

---

## 002 — Inbox Review UX

A unified inbox where all lanes submit review items and the user approves, requests changes, or rejects each section from the browser UI.

**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** none
**Done when:** Any skill can submit items to the inbox, the user reviews in the Debussy UI, and structured decisions flow back to the skill.

---

## 003 — Workflow Monitoring

Track multi-step workflow runs in the Debussy UI. Show progress, surface blockers, allow user to intervene from the browser.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 002
**Done when:** Active workflows appear in the UI with step-by-step progress and the user can review/unblock from the browser.

---

## 004 — Parallel Lanes

Manage parallel branches to work on multiple intents simultaneously. Each lane is a git branch with its own worktree, visible in the Debussy UI.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 003
**Done when:** User sees active lanes in the UI, each with its current intent. Lanes share a consistent view of project artifacts.

---

## 005 — Engineering Strate

Manage engineering governance — agent policies, architectural principles, and decision records. Three depth levels (lite, standard, full).

**Addresses:** P2: Documentation that agents need but humans can't maintain
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 001
**Done when:** /engineering runs end-to-end at lite depth — produces AGENTS.md and architecture.md under .debussy/engineering/.

---

## 006 — Status Line

Surface Debussy state in the Claude Code status line — current model, active intent, lane, and pending review count.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** none
**Done when:** Status line shows model, active intent, and pending review count.

---

## 007 — Unified Debussy UI

A single Nuxt app at localhost:4321 that serves all Debussy pages — inbox, lanes, workflow runs, product artifacts.

**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** none
**Done when:** All Debussy pages are served from a single Nuxt app with consistent design.

---

## 008 — Strategy Depth Progression

Extend the strategy strate from pitch depth to foundation and full.

**Addresses:** P2: Documentation that agents need but humans can't maintain
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** none
**Done when:** /strategy at foundation depth produces vision.md, landscape.md, and problem-space.md from web research and user validation.

---

## 009 — Claude Setup Explorer

A UI page to explore your Claude Code setup — installed skills, active hooks, MCP servers, permissions.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** 007
**Done when:** Setup page in the Debussy UI shows installed skills, hooks, and configuration.
