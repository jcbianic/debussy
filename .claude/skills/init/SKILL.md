---
description: >-
  Bootstrap a new project with Debussy: scaffold the documentation hierarchy
  based on the selected strategy depth, engineering depth, and enabled strates,
  then start the Debussy UI. Run once when starting a new project.
license: MIT
metadata:
  author: jcbianic
  version: "0.4.0"
---

# Init Skill

Bootstrap a new project with Debussy. This skill starts the Debussy UI and opens
a configuration page in the browser where the user chooses project info, strategy
depth level, engineering depth level, and which strates to enable. Once the user
submits, the skill reads the saved config and scaffolds the appropriate
documentation stubs.

## When to Activate

- First time setting up Debussy on a new project
- User invokes `/debussy:init`
- User wants to bootstrap documentation stubs and start the UI

## Usage

```
/debussy:init                          # Bootstrap and start UI
```

---

## Step 1: Detect Context

Check if a previous init has been completed by looking for `.debussy/config.yaml`.

```bash
if [ -f ".debussy/config.yaml" ]; then
  echo "CONFIGURED"
elif [ -d ".debussy" ]; then
  echo "DIR_ONLY"
else
  echo "NOTFOUND"
fi
```

### CONFIGURED — previous init completed

Ask via AskUserQuestion:

```
.debussy/ already exists with a saved configuration. Would you like to:
- "re-configure" -- open the configuration UI to update strate selection, then create missing stubs
- "abort" -- stop without making changes
```

If "abort", print a message and EXIT.
If "re-configure", proceed with Step 2.

### DIR_ONLY — directory exists but no config (interrupted init or manual creation)

Treat as a fresh start — proceed with Step 2.

### NOTFOUND — clean slate

Proceed with Step 2.

---

## Step 2: Start the UI Server

Find the Debussy UI server entry point:

1. Check `ui/.output/server/index.mjs` in the current working directory
2. Check `~/.claude/plugins/debussy/ui/.output/server/index.mjs` (plugin install path)
3. Search `~/.claude` for `debussy/ui/.output/server/index.mjs` as fallback

Once found, start the server:

```bash
PORT=4321 node <found-path> &
sleep 1
```

If the server is not found, print instructions and EXIT:

```
Could not locate Debussy UI server. Please start it manually:

  PORT=4321 node <path-to-debussy>/ui/.output/server/index.mjs

Then re-run /debussy:init.
```

---

## Step 3: Open Configuration Page

Open the browser to the configuration page:

```bash
open "http://localhost:4321/configure" 2>/dev/null || \
xdg-open "http://localhost:4321/configure" 2>/dev/null || \
echo "Open in browser: http://localhost:4321/configure"
```

Print status:

```
DEBUSSY INIT

Configuration UI: http://localhost:4321/configure

Fill in the project name, description, and select which strates to enable.
Click "Save configuration" when done.

Waiting for configuration...
```

---

## Step 4: Wait for Configuration (Zero Token Consumption)

Run a bash command that blocks until `.debussy/config.yaml` is written or updated:

```bash
CONFIG=".debussy/config.yaml"
BEFORE=""
if [ -f "$CONFIG" ]; then
  BEFORE=$(stat -f %m "$CONFIG" 2>/dev/null || stat -c %Y "$CONFIG" 2>/dev/null)
fi
end=$((SECONDS + 600))
while [ $SECONDS -lt $end ]; do
  if [ -f "$CONFIG" ]; then
    AFTER=$(stat -f %m "$CONFIG" 2>/dev/null || stat -c %Y "$CONFIG" 2>/dev/null)
    if [ "$BEFORE" != "$AFTER" ]; then
      cat "$CONFIG"
      exit 0
    fi
  fi
  sleep 2
done
echo "__TIMEOUT__"
```

Use the Bash tool with `timeout: 610000`.

### Timeout handling

If the output is `__TIMEOUT__`:
- Print: "Configuration not received within 10 minutes."
- Print: "The UI is still running at http://localhost:4321/configure. Submit when ready, then re-run `/debussy:init`."
- EXIT

Otherwise, parse the YAML output to extract project info, product enabled,
engineering enabled, and work enabled. Depth is NOT configured here — each
strate starts at its shallowest level (pitch for strategy, lite for
engineering) and deepens progressively when the user runs the strate skill.

---

## Step 5: Create Directory Structure

Based on the config:

```bash
# Always
mkdir -p .debussy

# Strategy (always -- depth determines what goes inside)
mkdir -p .debussy/strategy

# If strategy depth is full, also create subdirectories
mkdir -p .debussy/strategy/competitors .debussy/strategy/allies

# Product (if enabled)
mkdir -p .debussy/product

# Engineering (if enabled)
mkdir -p .debussy/policies

# Engineering standard or full
mkdir -p docs/architecture

# Engineering full
mkdir -p docs/decisions

# Intents (if product enabled)
# (intents live inside .debussy/product/)
```

---

## Step 6: Write Stub Files

Write all files using the Write tool. Skip any file that already exists (when in
re-configure mode).

### Strategy stubs by depth

#### Pitch depth -> 1 file

**`.debussy/strategy/pitch.md`**

```yaml
---
name: Pitch
icon: i-heroicons-rocket-launch
status: draft
---
# {project name from config}

## Vision
> {project description from config}

What change does this project create in the world?

## The Problem

### P1: First Problem
**Affects:** A1
Describe the first problem here.

## The Product

- **For:** Describe your target audience
- **Nature:** CLI / SaaS / lib / etc.
- **Distribution:** npm / marketplace / self-hosted

## What We're NOT Doing
- Define your non-goals

## Landscape
Describe alternatives and where you fit.
```

#### Foundation depth -> 3 files

**`.debussy/strategy/vision.md`**

```yaml
---
name: Vision
icon: i-heroicons-eye
status: draft
---
# Vision

> {project description from config}

## Why We're Building This
_What change does this project create in the world?_

## North Star
_The one metric or outcome that matters most._

## Success Criteria
1. _Observable outcome 1_
2. _Observable outcome 2_
3. _Observable outcome 3_
```

**`.debussy/strategy/problem-space.md`**

```yaml
---
name: Problem Space
icon: i-heroicons-puzzle-piece
status: draft
---
# Problem Space

## A1: First Audience
**Size:** _estimation_
**Profile:** _description_

### Problems
- **P1: First Problem** -- _description, severity_

### Current Workflow
_How they solve the problem today._
```

**`.debussy/strategy/landscape.md`**

```yaml
---
name: Landscape
icon: i-heroicons-map
status: draft
---
# Landscape

## Market Overview
_Describe the market context and trends._

## Competitors

| Tool | What it does | Strengths | Gap we fill |
|---|---|---|---|
| _name_ | _description_ | _strengths_ | _gap_ |

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
| _name_ | _relationship_ | _opportunity_ |
```

#### Full depth -> 7+ files

All Foundation files (vision.md, landscape.md) PLUS:

**`.debussy/strategy/strategy.md`** (replaces problem-space.md)

```yaml
---
name: Strategy
icon: i-heroicons-adjustments-horizontal
status: draft
---
# Strategy

## Where We Play
_Markets, segments, channels chosen -- and those we exclude._

## How We Win
_Our competitive advantage._

## Strategic Intents
### SI-1: First Intent
_Business challenge blocking the vision._

## Key Bets
_Testable hypotheses we're betting on._

## What We're NOT Doing
_Explicit exclusion choices._
```

**`.debussy/strategy/audiences.md`** (instead of problem-space.md)

```yaml
---
name: Audiences
icon: i-heroicons-users
status: draft
---
# Audiences

## A1: First Audience
**Size:** _estimation_
**Profile:** _description_

### Current Workflow
_Step by step._

### Pain Points
_Reference P{N}._

### Where They Congregate
_Communities, forums._

### Switching Trigger
_What would make them switch._
```

**`.debussy/strategy/problems.md`** (instead of problem-space.md)

```yaml
---
name: Problems
icon: i-heroicons-exclamation-triangle
status: draft
---
# Problems

## P1: First Problem
**Severity:** _critical / high / medium_
**Affects:** A1

### Evidence
_Concrete data._

### Current Workarounds
_How people cope today._
```

**`.debussy/strategy/opportunities.md`**

```yaml
---
name: Opportunities
icon: i-heroicons-light-bulb
status: draft
---
# Opportunity Map

## Table Stakes
_What every tool in this market must have._

## Differentiators
_Where we can stand out._

## Gaps
_Opportunities nobody covers -- reference P{N}, A{N}._

## Anti-Patterns
_Features that seem good but frustrate users._
```

Note: At Full depth, do NOT create `problem-space.md`. Create `audiences.md`
and `problems.md` instead.

### Product stubs (if enabled)

**`.debussy/product/product.md`**

```yaml
---
name: Product
icon: i-heroicons-cube
status: draft
---
# Product

## One-Liner
_{project description from config}_

## Positioning
_How the product is positioned relative to alternatives._

## Target User
_Reference A{N} from strategy artifacts._

## Nature
- **License**: _license_
- **Distribution**: _distribution method_
- **Source**: _open / closed_

## Non-Goals
- _Define your non-goals_
```

**`.debussy/product/intents.md`**

```markdown
## 001 -- First Feature

Describe the first feature intent here.

**Addresses:** P1: Problem name
**Target audience:** A1: Audience name
**Priority:** now
**Depends on:** none
**Done when:** Describe acceptance criteria here.
```

### Engineering stubs (if enabled, by depth)

#### Lite depth: policies only

**`.debussy/policies/agent-behavior.md`**

```yaml
---
name: Agent Behavior
icon: i-heroicons-cpu-chip
status: draft
order: 1
---
# Agent Behavior

## General Rules

- **Read before writing** -- always read existing code before modifying
- **Minimal changes** -- only change what is necessary for the task
- **Preserve conventions** -- follow existing patterns in the codebase
```

#### Standard depth: policies + principles

Everything from Lite, plus:

**`docs/architecture/principles.md`**

```markdown
---
title: Architecture Principles
---

## 1 -- First Principle

**num:** 1

Describe your first architectural principle here.
```

#### Full depth: policies + principles + decisions

Everything from Standard, plus:

**`docs/decisions/001-initial-decision.md`**

```markdown
# ADR 001 -- Initial Decision

## Status

Accepted

## Context

_What is the context for this decision?_

## Decision

_What was decided?_

## Consequences

_What are the consequences?_
```

---

## Step 6b: Install Status Line (if enabled)

If the parsed config has `options.statusline` set to `true` (or absent — default is true):

1. **Locate the template**: find `templates/statusline.sh` relative to this
   skill file. Search paths in order:
   - `{skill-dir}/templates/statusline.sh` (where skill-dir is the directory
     containing this SKILL.md)
   - `~/.claude/plugins/debussy/.claude/skills/init/templates/statusline.sh`

2. **Copy to project**: copy the template to `.claude/statusline.sh` in the
   project root. Make it executable:

   ```bash
   cp "{found-template}" .claude/statusline.sh
   chmod +x .claude/statusline.sh
   ```

3. **Configure settings.local.json**: read `.claude/settings.local.json` (create
   if missing). Merge in the `statusLine` key, preserving any existing settings:

   ```bash
   SETTINGS=".claude/settings.local.json"
   if [ -f "$SETTINGS" ]; then
     EXISTING=$(cat "$SETTINGS")
   else
     EXISTING="{}"
   fi
   echo "$EXISTING" | jq '. + {"statusLine": {"type": "command", "command": ".claude/statusline.sh"}}' > "$SETTINGS"
   ```

If `options.statusline` is `false`, skip this step entirely.

---

## Step 7: Summary

Print a formatted summary of what was created:

```
DEBUSSY BOOTSTRAP COMPLETE

Project: {project-name}
Description: {project-description}

Strates:
  Strategy:    {pitch / foundation / full}
  Product:     {enabled / disabled}
  Engineering: {lite / standard / full / disabled}
  Work:        enabled

Options:
  Status line: {enabled / disabled}

Files created:
{table of files created, grouped by strate}

Debussy UI is running at:
  -> http://localhost:4321

Next steps:
1. Browse http://localhost:4321 to see your project
2. Edit the strategy artifacts to shape your vision
3. Run /debussy:strategy to research and enrich your artifacts
4. Run /debussy:product to define your product and roadmap
5. Run /debussy:engineering to set up governance
```

---

## Error Handling

| Situation | Action |
|---|---|
| `.debussy/` already exists, user chooses "re-configure" | Open config UI with existing values pre-filled, skip files that exist, create only missing ones |
| `.debussy/` already exists, user chooses "abort" | Print confirmation and EXIT |
| UI server not found | Print manual start instructions, EXIT |
| Configuration timeout (10 min) | Print check instructions, EXIT |
| File write fails | Print error, EXIT |
| Depth change during re-configure | Create new files for the new depth, do not delete old files |
