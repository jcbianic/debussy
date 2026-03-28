# Debussy — Project Instructions

@AGENTS.md follow the [agent rules](AGENTS.md)

## What is this

A meta-plugin to help you manage projects as a solo builder, from idea to shippable features. Claude Code is awesome but pushing it to its limits strains your cognitive resources. Debussy brings a disciplined approach to building fast while keeping a grip on what and how you're building it.

Debussy is a Claude Code plugin organized around four strates:

- **Strategy** (`/debussy:strategy`): Research-first product discovery — map the space, produce structured artifacts under `.debussy/strategy/`, review in a browser UI. Three depth levels: pitch, foundation, full.
- **Product** (`/debussy:product`): Define the product and shape the roadmap — consumes strategy artifacts, produces product definition and intents under `.debussy/product/`, syncs GitHub Issues. No own research.
- **Engineering** (`/debussy:engineering`): Manage engineering governance — agent policies, architectural principles, decision records. Three depth levels: lite, standard, full.
- **Work**: Operational layer — Lanes, Workflow runs (`/debussy:workflow-run`), Feedback inbox (`/debussy:feedback`). Always enabled.

Additional skills:
- **Init** (`/debussy:init`): Bootstrap a new project — configure strates, scaffold stubs, start the UI.

## Distribution

Inside Claude Code, add the marketplace and install the plugin:

```
/plugin marketplace add jcbianic/debussy
/plugin install debussy@jcbianic-debussy
```

## Structure

```
.claude-plugin/    # Plugin metadata (plugin.json, marketplace.json)
.claude/skills/    # Installed skills (init, strategy, product, engineering, feedback, workflow-run)
README.md          # Getting started
CLAUDE.md          # This file
AGENTS.md          # Agent rules
```

## Next Steps

Dogfood `/debussy:strategy` on Debussy itself, then use `/debussy:product` to define the product and shape the roadmap.
