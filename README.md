# Debussy

A Claude Code plugin with two reusable skills.

## Skills

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

- Feedback skill: `.claude/skills/feedback/`
- Workflow-run skill: `.claude/skills/workflow-run/`
