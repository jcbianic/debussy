# Debussy

A meta-plugin to help you manage projects as a solo builder, from idea to shippable features. Claude Code is awesome but pushing it to its limits strains your cognitive resources. Debussy is here to bring a disciplined approach to building fast while keeping a grip on what and how you're building it.

## Skills

### Product Skills

**Init** — Bootstrap a new project with Debussy. Starts a browser-based configuration UI where you pick strategy depth (pitch, foundation, full) and optional engineering strate, then scaffolds the documentation hierarchy.

```
/debussy:init
```

**Strategy** — Research-first product discovery. Investigates the space — vision, problems, audiences, landscape, competitors, allies, feature space, and positioning — then produces structured artifacts under `.debussy/strategy/` with a browser-based review UI. Supports three progressive depth levels.

```
/debussy:strategy                          # Full run: research -> synthesize -> validate -> write
/debussy:strategy --refresh competitors    # Re-research one artifact type
/debussy:strategy --review                 # Open browser review UI for existing artifacts
```

**Roadmap** — Consume strategy artifacts, produce implementation intents with cross-references (P{N}, A{N}), and sync to GitHub Issues.

```
/debussy:roadmap                           # Full run: read strategy -> synthesize intents -> sync
/debussy:roadmap --sync-issues             # Re-sync specs/intents.md -> GitHub Issues
/debussy:roadmap --update-intent 001       # Update a single intent
```

### Engineering Skills

**Component Design** — Design or review Vue 3 / Nuxt components using the Orchestration-Presentation principle. Classifies components into tiers (data / orchestration / presentation) and flags violations.

```
/debussy:component-design <description>
/debussy:component-design --review <path>
```

**Component Inventory** — Scan all Vue components and composables, build a persistent health inventory at `.debussy/component-inventory.json`, and review all items for violations.

```
/debussy:component-inventory               # Full scan and review
/debussy:component-inventory --browse      # Browse inventory
/debussy:component-inventory --status      # Show health summary
```

**Component Test** — Generate Vitest tests for Vue 3 / Nuxt components and composables. Tier-aware: pure unit tests for composables, component tests for presenters, integration tests for orchestrators.

```
/debussy:component-test <path>
/debussy:component-test --untested         # Find and test untested components
```

### Utility Skills

**Feedback** — Collect structured user feedback via a browser UI. Show a list of items, let users approve/reject/discuss each one, get back structured responses.

```
/debussy:feedback request.json
```

**Workflow-Run** — Execute multi-step workflows (`.yaml` files) with interactive review gates. Run steps, collect artifacts, present review UI, block on user decisions.

```
/debussy:workflow-run workflow.yml
/debussy:workflow-run --resume [run_id]
/debussy:workflow-run --status
```

## Install

```bash
# Via Claude Code plugin system
npx claude code --install-plugin jcbianic/debussy
```

Or clone and link locally:
```bash
git clone https://github.com/jcbianic/debussy
cd debussy
npm link
```

## Source

```
.claude/skills/init/                # Init skill
.claude/skills/strategy/            # Strategy skill
.claude/skills/roadmap/             # Roadmap skill
.claude/skills/component-design/    # Component Design skill
.claude/skills/component-inventory/ # Component Inventory skill
.claude/skills/component-test/      # Component Test skill
.claude/skills/feedback/            # Feedback skill
.claude/skills/workflow-run/        # Workflow-Run skill
```
