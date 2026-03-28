---
name: Intents
icon: i-heroicons-flag
status: reviewed
---
# Debussy — Intents

Intents are ordered implementation milestones. Each builds on the previous. Every intent is linked to the monster branch causal chain it breaks: scope creep → branch bloat → review bottleneck → velocity trap → attention drain.

---

## 001 — Product Strate

Define the product and shape the roadmap. Consumes strategy artifacts produced by the strategy strate (currently at pitch depth). The exact set of product artifacts remains to be defined as the strate matures.

**Breaks chain at:** scope creep — scopes work upstream before the monster branch forms
**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** none (strategy at pitch depth already exists)
**Done when:** /product synthesizes from strategy artifacts, validates with user, and writes product definition artifacts.

---

## 002 — Inbox Review UX

A unified inbox where all lanes submit review items and the user approves, requests changes, or rejects each section from the browser UI. Feedback is captured and fed back to the agent.

**Breaks chain at:** review bottleneck, attention drain — structured review surface that captures feedback
**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** none
**Done when:** Any skill can submit items to the inbox, the user reviews in the Debussy UI, and structured decisions flow back to the skill.

---

## 003 — Workflow Monitoring

Track multi-step workflow runs in the Debussy UI. Show progress, surface blockers, and allow the user to intervene from the browser.

**Breaks chain at:** velocity trap — makes parallel work visible so you can intervene early
**Addresses:** P3: Parallelism without visibility
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 002
**Done when:** Active workflows appear in the UI with step-by-step progress and the user can review/unblock from the browser.

---

## 004 — Parallel Lanes

Manage parallel branches on the repo to work on multiple intents simultaneously. Each lane is a git branch with its own worktree, visible in the Debussy UI with current task and status.

**Breaks chain at:** velocity trap — managed parallelism instead of chaotic multi-session juggling
**Addresses:** P3: Parallelism without visibility
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 003
**Done when:** User sees active lanes (branches) in the UI, each with its current intent. Lanes share a consistent view of project artifacts.

---

## 005 — Engineering Strate

Manage engineering governance — agent policies, architectural principles, and decision records. Three depth levels (lite, standard, full) as a progressive journey.

**Breaks chain at:** branch bloat — governance and policies prevent scope creep before it starts
**Addresses:** P2: Documentation that agents need but humans can't maintain
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 001
**Done when:** /engineering runs end-to-end at lite depth — produces AGENTS.md and architecture.md under .debussy/engineering/.

---

## 006 — Status Line

Surface Debussy state in the Claude Code status line — current model, active intent, lane, and where human review is needed. A glanceable summary.

**Breaks chain at:** velocity trap, attention drain — glanceable state across lanes
**Addresses:** P3: Parallelism without visibility
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** none
**Done when:** Status line shows model, active intent, and pending review count.

---

## 007 — Unified Debussy UI

A single Nuxt app at localhost:4321 that serves all Debussy pages — inbox, lanes, workflow runs, product artifacts. Dark theme, semantic tokens, responsive layout.

**Breaks chain at:** attention drain — navigable surface for all artifacts and state
**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** none
**Done when:** All Debussy pages are served from a single Nuxt app with consistent design.

---

## 008 — Strategy Depth Progression

Extend the strategy strate from pitch depth to foundation (vision + landscape + problem-space) and full (audiences, problems, competitors, allies, opportunities, strategy).

**Breaks chain at:** scope creep — deeper upstream context means sharper scoping
**Addresses:** P2: Documentation that agents need but humans can't maintain
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** none
**Done when:** /strategy at foundation depth produces vision.md, landscape.md, and problem-space.md from web research and user validation.

---

## 009 — Claude Setup Explorer

A UI page to explore your Claude Code setup — installed skills, active hooks, MCP servers, permissions. Makes the invisible visible.

**Breaks chain at:** velocity trap — visibility into what the agent has available
**Addresses:** P3: Parallelism without visibility
**Target audience:** A1: solo builders
**Priority:** later
**Depends on:** 007
**Done when:** Setup page in the Debussy UI shows installed skills, hooks, and configuration.

---

## 010 — Lane Lifecycle Management

Active management of lanes as the atomic unit of work. A lane binds one GitHub issue to one branch, one draft PR, one worktree, and one `scope.md` briefing file. Each lane follows a state machine: created → working → staged → qa → ready → merged (with a rework loop from qa back to working). Commands to create a lane from an issue, launch a configurable workflow (research → plan → implement → verify), stage for QA, handle rework, and mark ready.

**Breaks chain at:** branch bloat, velocity trap — atomic scoped units of work replace the monster branch
**Addresses:** P3: Parallelism without visibility
**Target audience:** A1: solo builders
**Priority:** now
**Depends on:** 004, 003
**Done when:** User can create a lane from a GitHub issue (branch + draft PR + worktree + scope.md), agent executes a workflow in the worktree, and the lane transitions through states via explicit commands.

---

## 011 — Release Orchestration

Group lanes into a release. A release is a branch (`release/vX.Y`) with a PR targeting main. The user triages open issues in the Inbox to select which ones enter the release. Setup scaffolds all selected lanes at once (branches, draft PRs targeting release branch, worktrees). A review task picks up PRs marked ready, runs automated code review, and advises merge or changes. Merged lanes are squash-merged into the release branch.

**Breaks chain at:** review bottleneck — small, scoped PRs replace the monster PR
**Addresses:** P3: Parallelism without visibility
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 010
**Done when:** User can plan a release from open issues, scaffold all lanes in one command, and review/merge completed lanes into the release branch.

---

## 012 — QA Staging Loop

Stage a lane to root for manual testing. Staging means: verify clean state, push to remote, detach the worktree, and checkout the branch on the root repo. The root serves exclusively for QA and coordination — one lane at a time. A test plan is presented in the Inbox. The user tests, then either approves (PR marked ready, root returns to default branch) or requests rework (worktree recreated, feedback appended to `scope.md`, lane returns to working state).

**Breaks chain at:** review bottleneck, attention drain — structured QA with feedback that flows back to the agent
**Addresses:** P1: Feedback lost, attention scattered
**Target audience:** A1: solo builders
**Priority:** next
**Depends on:** 010, 002
**Done when:** User can stage a lane to root, review a test plan in the Inbox, and approve or rework with structured feedback that flows back to the agent.
