---
description: >-
  Bootstrap a new project with Debussy: configure which strates to manage
  (strategy, engineering), scaffold the selected documentation hierarchy, and
  start the Debussy UI. Run once when starting a new project.
license: MIT
metadata:
  author: jcbianic
  version: "0.2.0"
---

# Init Skill

Bootstrap a new project with Debussy. This skill starts the Debussy UI and opens
a configuration page in the browser where the user chooses project info and which
strates (layers) to manage. Once the user submits, the skill reads the saved
config and scaffolds only the selected documentation stubs.

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

Check if `.debussy/` already exists in the project root.

```bash
if [ -d ".debussy" ]; then
  echo "FOUND"
else
  echo "NOTFOUND"
fi
```

If found, ask via AskUserQuestion:

```
.debussy/ already exists. Would you like to:
- "re-configure" -- open the configuration UI to update strate selection, then create missing stubs
- "abort" -- stop without making changes
```

If "abort", print a message and EXIT.
If "re-configure" or "NOTFOUND", proceed with Step 2.

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

Fill in the project name, description, and select which strates to manage.
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

Otherwise, parse the YAML output to extract project info and strate selection.

---

## Step 5: Create Directory Structure

Based on the strates enabled in `.debussy/config.yaml`, create directories:

```bash
# Always
mkdir -p .debussy

# If strategy enabled
mkdir -p .debussy/strategy specs

# If engineering enabled
mkdir -p docs/architecture docs/decisions
```

---

## Step 6: Write Stub Files

Write all files using the Write tool. Skip any file that already exists (when in
re-configure mode).

### If `strategy` strate is enabled:

#### `.debussy/strategy/vision.md`

```yaml
---
name: Vision
icon: i-heroicons-eye
status: draft
---
# Vision

> {One-line description from config.yaml project.description}

## What change does this project create in the world?

_Edit this file to define your vision._
```

#### `.debussy/strategy/product.md`

```yaml
---
name: Product
icon: i-heroicons-cube
status: draft
---
# Product

## What is the product that creates that change?

_Edit this file to define your product._
```

#### `.debussy/strategy/landscape.md`

```yaml
---
name: Landscape
icon: i-heroicons-map
status: draft
---
# Landscape

## Competitive Landscape

_Edit this file to map the landscape._
```

#### `.debussy/strategy/audiences.md`

```yaml
---
name: Audiences
icon: i-heroicons-users
status: draft
---
# Audiences

## Who are the target audiences?

_Edit this file to define your audiences._
```

#### `.debussy/strategy/problems.md`

```yaml
---
name: Problems
icon: i-heroicons-exclamation-triangle
status: draft
---
# Problems

## What problems does this product solve?

_Edit this file to list your core problems._
```

#### `specs/intents.md`

```markdown
## 001 -- First Feature

Describe the first feature intent here.

**Addresses:** P1: Problem name
**Target audience:** A1: Audience name
**Priority:** high
**Depends on:** none
**Done when:** Describe acceptance criteria here.
```

### If `engineering` strate is enabled:

#### `docs/architecture/principles.md`

```markdown
## 1 -- First Principle

**num:** P1

Describe your first architectural principle here.
```

#### `docs/decisions/001-initial-decision.md`

```markdown
# ADR 001 -- Initial Decision

## Context

_What is the context for this decision?_

## Decision

_What was decided?_

## Consequences

_What are the consequences?_
```

Note: Policy data is currently managed in the UI. Future versions will support
file-based policy definitions under the engineering strate.

---

## Step 7: Summary

Print a formatted summary of what was created:

```
DEBUSSY BOOTSTRAP COMPLETE

Project: {project-name}
Description: {project-description}

Strates:
  strategy:     {enabled/disabled}
  engineering:  {enabled/disabled}

Files created:
{table of files created, grouped by strate -- only show enabled strates}

Debussy UI is running at:
  -> http://localhost:4321

Next steps:
1. Browse http://localhost:4321 to see your project
2. Edit the artifacts for your enabled strates
3. Use /debussy:strategy to research and enrich (if strategy enabled)
4. Use /debussy:roadmap to shape your roadmap (if strategy enabled)
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
| No strates selected | Warn user that at least one strate should be enabled, write config anyway |
