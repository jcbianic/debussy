# Debussy — Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

## 001 — Product Strate

Define the product and shape the roadmap. Consumes strategy artifacts produced by the strategy strate (currently at pitch depth). The exact set of product artifacts remains to be defined as the strate matures.

**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** none (strategy at pitch depth already exists)
**Done when:** /product synthesizes from strategy artifacts, validates with user, and writes product definition artifacts.

---

## 002 — Inbox Review UX

A unified inbox where all lanes submit review items and the user approves, requests changes, or rejects each section from the browser UI. Feedback is captured and fed back to the agent.

**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** none
**Done when:** Any skill can submit items to the inbox, the user reviews in the Debussy UI, and structured decisions flow back to the skill.

---

## 003 — Workflow Monitoring

Track multi-step workflow runs in the Debussy UI. Show progress, surface blockers, and allow the user to intervene from the browser.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 002
**Done when:** Active workflows appear in the UI with step-by-step progress and the user can review/unblock from the browser.

---

## 004 — Parallel Lanes

Manage parallel branches on the repo to work on multiple intents simultaneously. Each lane is a git branch with its own worktree, visible in the Debussy UI with current task and status.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 003
**Done when:** User sees active lanes (branches) in the UI, each with its current intent. Lanes share a consistent view of project artifacts.

---

## 005 — Engineering Strate

Manage engineering governance — agent policies, architectural principles, and decision records. Three depth levels (lite, standard, full) as a progressive journey.

**Addresses:** P2: Documentation that agents need but humans can't maintain
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 001
**Done when:** /engineering runs end-to-end at lite depth — produces AGENTS.md and architecture.md under .debussy/engineering/.

---

## 006 — Status Line

Surface Debussy state in the Claude Code status line — current model, active intent, lane, and where human review is needed. A glanceable summary.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** none
**Done when:** Status line shows model, active intent, and pending review count.

---

## 007 — Unified Debussy UI

A single Nuxt app at localhost:4321 that serves all Debussy pages — inbox, lanes, workflow runs, product artifacts. Dark theme, semantic tokens, responsive layout.

**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** none
**Done when:** All Debussy pages are served from a single Nuxt app with consistent design.

---

## 008 — Strategy Depth Progression

Extend the strategy strate from pitch depth to foundation (vision + landscape + problem-space) and full (audiences, problems, competitors, allies, opportunities, strategy).

**Addresses:** P2: Documentation that agents need but humans can't maintain
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** none
**Done when:** /strategy at foundation depth produces vision.md, landscape.md, and problem-space.md from web research and user validation.

---

## 009 — Claude Setup Explorer

A UI page to explore your Claude Code setup — installed skills, active hooks, MCP servers, permissions. Makes the invisible visible.

**Addresses:** P3: Solo builders do it all — and Claude doesn't wait
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** 007
**Done when:** Setup page in the Debussy UI shows installed skills, hooks, and configuration.
