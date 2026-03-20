# Debussy

A Claude Code plugin with four reusable skills.

## Skills

### Strategy Skill
Research-first product discovery. Investigates the space — vision, problems, audiences, landscape, competitors, allies, feature space, and positioning — then produces structured artifacts under `docs/strategy/` with a browser-based review UI.

```
/strategy                          # Full run: research -> synthesize -> validate -> write
/strategy --refresh competitors    # Re-research one artifact type
/strategy --review                 # Open browser review UI for existing artifacts
```

### Roadmap Skill
Consume strategy artifacts, produce implementation intents with cross-references (P{N}, A{N}), and sync to GitHub Issues.

```
/roadmap                           # Full run: read strategy -> synthesize intents -> sync
/roadmap --sync-issues             # Re-sync specs/intents.md -> GitHub Issues
/roadmap --update-intent 001       # Update a single intent
```

### Feedback Skill
Collect structured user feedback via a browser UI. Show a list of items, let users approve/reject/discuss each one, get back structured responses.

```
/feedback request.json
```

### Workflow-Run Skill
Execute multi-step workflows (`.yaml` files) with interactive review gates. Run steps, collect artifacts, present review UI, block on user decisions.

```
/workflow-run workflow.yml
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

- Strategy skill: `.claude/skills/strategy/`
- Roadmap skill: `.claude/skills/roadmap/`
- Feedback skill: `.claude/skills/feedback/`
- Workflow-run skill: `.claude/skills/workflow-run/`
