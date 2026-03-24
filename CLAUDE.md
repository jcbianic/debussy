# Debussy — Project Instructions

@AGENTS.md follow the [agent rules](AGENTS.md)

## What is this

Debussy is a Claude Code plugin that provides five skills:

- **Init skill**: Bootstrap a new project with Debussy documentation hierarchy (vision, product, landscape, audiences, problems, roadmap, architecture) and start the UI
- **Strategy skill**: Research-first product discovery — map the space, produce structured artifacts under `docs/strategy/`, review in a browser UI
- **Roadmap skill**: Consume strategy artifacts, produce intents with P{N}/A{N} cross-refs, sync GitHub Issues
- **Feedback skill**: Collect structured user feedback via a browser UI with configurable review workflows
- **Workflow-run skill**: Execute multi-step IIKit workflows with interactive review gates

## Distribution

Install as a Claude Code plugin via marketplace or GitHub:

```bash
# Via Claude Code plugin system
npx claude code --install-plugin jcbianic/debussy

# Or copy .claude-plugin/plugin.json to Claude's plugin directory
```

## Structure

```
.claude-plugin/    # Plugin metadata (plugin.json, marketplace.json)
.claude/skills/    # Installed skills (init, strategy, roadmap, feedback, workflow-run)
README.md          # Getting started
CLAUDE.md          # This file
AGENTS.md          # Agent rules
```

## Next Steps

Dogfood `/debussy:strategy` on Debussy itself, then use `/debussy:roadmap` to consume the artifacts and shape the roadmap.
