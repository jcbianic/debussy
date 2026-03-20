---
type: problems
updated: 2026-03-20
status: draft
---

# Problems

## P1: Documentation Artifact Review Friction

**Severity:** critical
**Affects:** A1

Multi-step workflows like research→plan→implement produce documentation
artifacts at each stage — specs, plans, strategy docs, checklists. This is
powerful, but only if the human can review those artifacts without excessive
friction. Today, reviewing documentation in the terminal means scrolling
through long outputs, losing track of what you've already read, and having
no way to annotate or track review state.

The bottleneck isn't generation — it's the documentation review loop. If
reviewing specs and plans is painful, the workflow loses most of its edge.
Structured review needs spatial separation (browser, not terminal),
per-section status tracking, and persistence across sessions.

### Evidence

- Dogfooding the strategy skill on Debussy itself: reviewing 14 strategy
  documents with 76 sections required a dedicated browser UI with auto-save,
  seen tracking, and group-level skip — terminal review was not viable.

### Current Workarounds

- Reading long markdown outputs in the terminal
- Copy-pasting sections into a text editor for comparison
- Losing review state on session restart

---

## P2: Workflow Observability and Organisation

**Severity:** high
**Affects:** A1

Long-running multi-step workflows lack visibility and require unnecessary
manual intervention. You want to know where the workflow is and what stage
it's at. You don't want to have to intervene when your intervention has no
value — like typing `/clear` or `/next-phase` just to keep things moving.
But you do want to review what matters before the workflow moves on.

The goal is observability and organisation: see what's happening, get notified
when your input is needed, and skip the busywork in between.

### Evidence

- Developers describe using background agents "for observability purposes" as
  a workaround, not a native feature.
- Faros AI: "Multi-step task failures: Agents struggle with complex refactors,
  looping behavior, and incomplete repo-wide changes."

### Current Workarounds

- Manually watching terminal output
- Splitting long tasks into smaller sessions for more frequent checkpoints
- Using tmux/background-agents setups for basic monitoring

---

## P3: Worktree Staging and Session Tracking

**Severity:** high
**Affects:** A1

Working on multiple subjects in parallel using git worktrees works — the
isolation is real. But two things are painful:

1. **Session tracking**: Which Claude Code session is in which worktree? There's
   no dashboard or overview. You lose track.

2. **Staging process**: When worktree C is ready for review, you want to "stage"
   it — bring it to the root folder as a regular branch, do the review, run
   tests. Then push it back and bring worktree B forward. This rotation process
   is entirely manual today.

### Evidence

- Anthropic shipped native worktree support (`--worktree` flag), but it only
  covers creation and auto-cleanup. No dashboard, no staging, no rotation.
- Multiple guides document the feature, but none address the orchestration
  layer above basic isolation.

### Current Workarounds

- Native `--worktree` flag for basic isolation
- Manual git branch management and `cd` between worktrees
- Manually tracking which worktree has which task (notes, naming conventions)

---

## P4: Structured Project Documentation

**Severity:** critical
**Affects:** A1

As a project grows, knowledge about it scatters: architecture decisions live
in commit messages, feature descriptions in PRDs, testing strategy in
conversations, purpose in README fragments. After context compaction, Claude
loses the "why" behind decisions and proposes different approaches.

The goal is highly detailed, granular, and searchable documentation that
describes everything in the codebase: features, architecture decisions,
purpose, testing strategy. A standardized organization prevents document
inflation and makes the documentation usable both by humans and by Claude
across sessions.

### Evidence

- GitHub Issue #28984 (6 comments, OPEN): context compaction retains only
  20-30% of original detail, losing architectural decisions and prior
  agreements.
- Developers maintain `.claude/` directories with 30+ reference docs as a
  workaround — but without standardization, this becomes its own maintenance
  burden.

### Current Workarounds

- Manual `plan.md`/`context.md`/`tasks.md` documentation
- Layered CLAUDE.md files per subdirectory
- Aggressive subagent delegation to get fresh context windows
- Git worktree isolation to reduce per-agent context load

---

## P5: Claude Setup Observability

**Severity:** medium
**Affects:** A1

As your Claude Code setup grows — plugins, skills, commands, agents, hooks,
MCP servers — you lose visibility into what's loaded, what's active, and how
things interact. There's no dashboard or inventory of your setup. Debugging
unexpected behavior means grepping through config files.

### Evidence

- Claude Code allocates a 2% context budget for skills. Installing plugins
  consumes this budget invisibly.
- Plugin conflicts are documented in GitHub issues (#29047, #9426) but there's
  no tooling to detect or manage them.

### Current Workarounds

- Progressive skill loading (only loading relevant skills)
- Keeping skill frontmatter minimal
- Uninstalling plugins that aren't in active use
- Manually reading `.claude/` config files to understand what's loaded
