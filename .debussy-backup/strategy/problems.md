---
name: Problems
icon: i-heroicons-exclamation-triangle
status: draft
---

## P1: Review Friction

**Severity:** Critical
**Affects:** A1, A2, A3

AI generates code faster than humans can review it. PRs generated with AI assistance are 18% larger on average. Change failure rates increased ~30%, incident frequency per PR up ~24%. 45% of AI-generated code contains security flaws; logic errors appear 1.75x more frequently than human code.

### Evidence

- "I don't read much code anymore. I watch the stream and sometimes look at key parts." — Peter Steinberger, cited by Addy Osmani
- An OCaml maintainer rejected a 13,000-line AI-generated PR because "reviewing such massive changes is more taxing than human code"
- XSS vulnerabilities occur at 2.74x higher rates in AI-generated code (State of AI Code Review, Dev.to)

### Current Workarounds

Browser-based review UIs require manual server startup, have no keyboard navigation, and are slow to load. Terminal-based review loses visual structure. Most developers simply approve without reading.

---

## P2: Workflow Opacity

**Severity:** Critical
**Affects:** A1, A2

Long-running agent sessions are a black box. No visibility into context window usage, active tools, running agents, or task progress. The Claude HUD plugin emerged in March 2026 specifically to fill this gap.

### Evidence

- "A full afternoon's work — four hours of debugging evaporated upon session restart. The git commits remained but the why was gone." — DEV Community
- "When an auditor asks why the system was built this way, the reasoning is either lost or scattered across dozens of conversations." — McKinsey/QuantumBlack, Feb 2026
- Rate limits interrupt mid-workstream with no visibility into why or when access resumes

### Current Workarounds

Tail logs manually. Wait blindly for completion. No structured progress tracking.

---

## P3: Lane Management

**Severity:** High
**Affects:** A1

Working across multiple git worktrees is powerful but unmanaged. Most developers find 3-5 parallel worktrees is a practical ceiling before context-switching overhead becomes problematic.

### Evidence

- "Ease of confusing worktrees and making changes in wrong directories or branches" — multiple worktree guides
- Each Claude Code session in a separate worktree has no knowledge of other sessions — contradictory architectural decisions surface only at merge time
- Resource consumption: running multiple Claude Code instances is intensive in CPU, memory, and API costs

### Current Workarounds

Manual tmux/terminal management. No cross-worktree visibility. Careful scope management of each session to avoid overlap.

---

## P4: Session Amnesia

**Severity:** Critical
**Affects:** A1, A2, A3

Claude Code has no persistent memory across sessions by default. Every new conversation starts blank. Developers lose all accumulated context — debugging rationale, architectural decisions, code conventions.

### Evidence

- GitHub issue #14227 "Feature Request: Persistent Memory Between Sessions" with significant engagement
- Reddit post about claude-mem received 729 upvotes — indicating widespread pain
- "Between 10 and 30 minutes at the start of each session rebuilding context, which over a work week adds up to several hours" — DEV Community
- CLAUDE.md files require discipline; one developer reports skipping them "40% of the time"

### Current Workarounds

CLAUDE.md files (fragile, require discipline). Claude-Mem plugin (SQLite + vector embeddings, 40K stars). Git commit messages as implicit memory. None are complete solutions.

---

## P5: Comprehension Debt

**Severity:** High
**Affects:** A1, A3

Sustained AI-assisted development without governance produces codebases that increasingly no one understands. Comprehension debt accumulates when you ship code you did not write and do not deeply understand.

### Evidence

- GitClear 2025 report: eightfold increase in duplicated code blocks
- arXiv paper (2510.10165): AI-assisted programming decreases productivity of experienced developers by 19% once maintenance burden is factored in
- Developer trust dropped from 43% to 29% in 18 months even as usage rose to 84%
- Unmanaged AI-generated code can drive maintenance costs to 4x traditional levels by year two

### Current Workarounds

Code review (which P1 makes harder). Architecture Decision Records (manual). Periodic refactoring sessions. No systematic governance for AI-generated code quality.

---

## P6: Cost and Rate Limit Unpredictability

**Severity:** Moderate
**Affects:** A1, A3

AI coding costs are unpredictable and rate limits interrupt workflows without useful information. Anthropic's rate limit system has three independent, overlapping constraints that don't communicate in the interface.

### Evidence

- Weekly rate limits introduced July 2025 targeting continuous Claude Code background users
- "The $20 plan that interrupts workflow 2-3 times a day costs more in lost productivity than the price difference to the next tier" — Medium, March 2026
- Installing 10+ MCP-heavy plugins causes Claude's effective working memory to shrink, leading to worse output
- Token variance across agentic runs: up to 10x difference for the same task

### Current Workarounds

Upgrade to Max plan ($100-200/month). Reduce concurrent agent sessions. Manifest plugin tracks usage post-hoc but provides no predictive budgets.
