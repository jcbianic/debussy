---
type: competitor
subject: gsd
updated: 2026-03-19
status: draft
---

# GSD (Get Shit Done)

**URL:** https://github.com/gsd-build/get-shit-done
**Category:** Meta-prompting and spec-driven development

## What It Does

A meta-prompting and context engineering system that guides Claude Code through
discuss-plan-execute-verify phases, fighting context rot via fresh 200K-token
executor windows per task.

## Strengths

- Solves context rot with fresh context per executor — each task gets a clean
  200K-token window
- Atomic git commits per task with bisectable history
- Wave-based parallelization for independent tasks
- Context engineering via PROJECT.md/REQUIREMENTS.md/STATE.md files
- Works across 6+ runtimes
- 31K GitHub stars
- Quick mode for rapid iteration

## Weaknesses & User Frustrations

- No built-in code review orchestration or peer feedback loop post-execution
- No dashboard or visual progress tracking
- Minimal product planning integration — takes specs as input only
- UAT relies on manual testing with no structured review
- No cross-project context propagation

## Gap We Fill

Debussy provides browser-based structured review between execution steps,
visual workflow monitoring, and the product discovery pipeline that GSD does
not address. GSD's fresh-context approach to combating context rot is
complementary to Debussy's workflow orchestration.

## Key Features

| Feature | Notes |
|---|---|
| Multi-phase workflow | Discuss-plan-execute-verify — similar rhythm to our skills |
| Context engineering files | PROJECT.md/STATE.md — we use docs/strategy/ artifacts |
| Fresh executor windows | 200K tokens per task — addresses P4 differently than us |
| Wave-based parallelism | Independent task batches — we do sequential with gates |
| Quick mode | Rapid iteration — we don't have an equivalent yet |
