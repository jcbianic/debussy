---
type: competitor
subject: gsd
updated: 2026-03-26
status: draft
---

# GSD v1 (Get Shit Done)

**URL:** https://github.com/gsd-build/get-shit-done
**Category:** Meta-prompting and spec-driven development
**Stars:** ~42K (up from ~31K). JavaScript. Last updated March 2026.

## What It Does

A meta-prompting and context engineering system that guides Claude Code through
discuss-plan-execute-verify phases, fighting context rot via fresh 200K-token
executor windows per task. The dominant spec-driven development framework.

## Strengths

- Solves context rot with fresh context per executor — each task gets a clean
  200K-token window
- Atomic git commits per task with bisectable history
- Wave-based parallelization for independent tasks
- Context engineering via PROJECT.md/REQUIREMENTS.md/STATE.md files
- Works across 6+ runtimes
- 42K GitHub stars — second largest in ecosystem
- Quick mode for rapid iteration
- Confirmed adoption at Amazon, Google, Shopify, Webflow
- Spawned gsd-pro fork (~30K stars) positioning as Cursor Composer alternative

## Weaknesses & User Frustrations

- No built-in code review orchestration or peer feedback loop post-execution
- No dashboard or visual progress tracking
- Minimal product planning integration — takes specs as input only
- UAT relies on manual testing with no structured review
- No cross-project context propagation
- v1 (JavaScript) is prompt-only — no programmatic control over session lifecycle

## Gap We Fill

Debussy provides browser-based structured review between execution steps,
visual workflow monitoring, and the product discovery pipeline that GSD does
not address. GSD's fresh-context approach to context rot is complementary to
Debussy's workflow orchestration and review gates.

## Key Features

| Feature | Notes |
|---|---|
| Multi-phase workflow | Discuss-plan-execute-verify — similar rhythm to our skills |
| Context engineering files | PROJECT.md/STATE.md — we use .debussy/ artifacts |
| Fresh executor windows | 200K tokens per task — addresses context rot |
| Wave-based parallelism | Independent task batches — we do sequential with gates |
| Quick mode | Rapid iteration — we don't have an equivalent yet |
