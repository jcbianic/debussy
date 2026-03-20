---
type: audiences
updated: 2026-03-20
status: reviewed
---

# Audiences

## A1: Solo Builders

**Size:** Estimated 500K-1M Claude Code users (based on 18.9M MAU, ~3-5%
power-user ratio from developer surveys)
**Profile:** Technical founders, freelance developers, and indie hackers who
manage a project end-to-end — from idea through implementation to shipping.
They use Claude Code through the entire pipeline and want both speed and
discipline: they move fast with AI assistance but want grip on the internals
of what they're building.

### Current Workflow

- Multiple Claude Code sessions per day, each scoped to a task
- Plan-then-execute pattern: review the plan before letting Claude code
- Maintain `.claude/` directories with CLAUDE.md and reference docs
- Use git branches and worktrees for parallel work

### Pain Points

- No structured way to review artifacts produced by multi-step workflows.
  See P1.
- Long-running workflows are opaque — no progress visibility. See P2.
- Managing parallel worktrees is manual and error-prone. See P3.
- Project knowledge scatters across conversations and compacts away. See P4.

### Where They Congregate

- r/ClaudeAI (612K members)
- Hacker News
- Indie Hackers forums
- Twitter/X dev community

### Switching Trigger

A plugin that saves time on review workflows, provides workflow visibility,
or helps manage project knowledge. Very low tolerance for configuration
complexity — must install in one command and show value in the first session.
