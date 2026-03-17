# Debussy — Project Instructions

@AGENTS.md follow the [agent rules](AGENTS.md)

## What is this

Debussy is a Claude Code plugin that provides two key skills:

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
.claude/skills/    # Installed skills (feedback, workflow-run)
README.md          # Getting started
CLAUDE.md          # This file
AGENTS.md          # Agent rules
```

## Next Steps

After this scope reset, focus shifts to a **planning skill** — strategic product design / roadmap shaping — to dogfood on Debussy itself.
