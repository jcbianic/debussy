# Debussy

Solo building with Claude Code is fast. It's also easy to lose the
plot — shipping features nobody asked for, accumulating decisions
nobody wrote down, never pausing to check if the direction still
makes sense.

Debussy adds structure around the build loop so you can move fast
without losing the thread.

## Strates

Four strates cover the loop from discovery to delivery.

**Strategy** — Does the research: vision, audience, landscape,
competitors. Writes to `.debussy/strategy/` and opens a review UI
so you can push back before anything gets built.

```text
/debussy:strategy
```

**Product** — Reads the strategy artifacts and turns them into
intents: a prioritized list of what to build, each synced to a
GitHub Issue.

```text
/debussy:product
```

**Engineering** — Writes down how the project should be built:
agent policies, architectural principles, decision records. Three
levels: lite, standard, full.

```text
/debussy:engineering
```

**Work** — Always on. Runs multi-step workflows and collects
structured feedback via a browser UI.

```text
/debussy:workflow-run workflow.yml
/debussy:feedback request.json
```

## Getting started

Run this first:

```text
/debussy:init
```

Opens a browser UI to pick your strates and depth levels, then
scaffolds the documentation stubs.

## Install

```text
/plugin marketplace add jcbianic/debussy
/plugin install debussy@jcbianic-debussy
```

## Structure

```text
.claude-plugin/    # Plugin metadata (plugin.json, marketplace.json)
.claude/skills/    # Installed skills
README.md
CLAUDE.md
AGENTS.md
```
