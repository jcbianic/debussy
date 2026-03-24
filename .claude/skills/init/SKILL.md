---
description: >-
  Bootstrap a new project with Debussy: scaffold the documentation hierarchy
  (vision, product, landscape, audiences, problems, roadmap, architecture)
  and start the Debussy UI. Run once when starting a new project.
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Init Skill

Bootstrap a new project with Debussy by scaffolding the documentation hierarchy
and starting the Debussy UI. This skill creates stub files for vision, product,
landscape, audiences, problems, roadmap, and architecture, then opens the Debussy
browser interface so you can start editing.

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
- "re-scaffold" — skip existing files, only create missing stubs
- "abort" — stop without making changes
```

If "abort", print a message and EXIT.
If "re-scaffold", proceed with Step 2 but skip writing files that already exist.

---

## Step 2: Ask Minimal Questions

Use AskUserQuestion to gather:

1. **Project name** — Used as title in vision.md and throughout documentation
   - Label: "Project Name"
   - Description: "What is the name of this project?"

2. **One-line description** — Used as the tagline in vision.md
   - Label: "Description"
   - Description: "One sentence describing what this project does"

Store both values for use in Step 4.

---

## Step 3: Create Directory Structure

```bash
mkdir -p .debussy/strategy
mkdir -p docs/architecture docs/decisions
mkdir -p specs
```

---

## Step 4: Write Stub Files

Write all files using the Write tool. Skip any file that already exists (when in
re-scaffold mode).

### `.debussy/strategy/vision.md`

```yaml
---
name: Vision
icon: i-heroicons-eye
status: draft
---
# Vision

> [One-line description from user input]

## What change does this project create in the world?

_Edit this file to define your vision._
```

### `.debussy/strategy/product.md`

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

### `.debussy/strategy/landscape.md`

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

### `.debussy/strategy/audiences.md`

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

### `.debussy/strategy/problems.md`

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

### `docs/architecture/principles.md`

```markdown
## 1 — First Principle

**num:** P1

Describe your first architectural principle here.
```

### `docs/decisions/001-initial-decision.md`

```markdown
# ADR 001 — Initial Decision

## Context

_What is the context for this decision?_

## Decision

_What was decided?_

## Consequences

_What are the consequences?_
```

### `specs/intents.md`

```markdown
## 001 -- First Feature

Describe the first feature intent here.

**Addresses:** P1: Problem name
**Target audience:** A1: Audience name
**Priority:** high
**Depends on:** none
**Done when:** Describe acceptance criteria here.
```

---

## Step 5: Start the UI Server

Find the Debussy UI server entry point:

1. Check `ui/.output/server/index.mjs` in the current working directory
2. Check `~/.claude/plugins/debussy/ui/.output/server/index.mjs` (plugin install path)
3. Search `~/.claude` for `debussy/ui/.output/server/index.mjs` as fallback

Once found, start the server:

```bash
node <found-path> &
sleep 1
open http://localhost:3050
```

If the server is not found, print instructions:

```
Could not locate Debussy UI server. Please start it manually:

  node <path-to-debussy>/ui/.output/server/index.mjs

Then open http://localhost:3050 in your browser.
```

---

## Step 6: Summary

Print a formatted table of what was created and the URL to open:

```
✓ DEBUSSY BOOTSTRAP COMPLETE

Project: {project-name}

Files created:
┌──────────────────────────────────────────┬────────────┐
│ File                                     │ Status     │
├──────────────────────────────────────────┼────────────┤
│ .debussy/strategy/vision.md              │ ✓ Created  │
│ .debussy/strategy/product.md             │ ✓ Created  │
│ .debussy/strategy/landscape.md           │ ✓ Created  │
│ .debussy/strategy/audiences.md           │ ✓ Created  │
│ .debussy/strategy/problems.md            │ ✓ Created  │
│ docs/architecture/principles.md          │ ✓ Created  │
│ docs/decisions/001-initial-decision.md   │ ✓ Created  │
│ specs/intents.md                         │ ✓ Created  │
└──────────────────────────────────────────┴────────────┘

Debussy UI is running at:
  → http://localhost:3050

Next steps:
1. Open http://localhost:3050 in your browser
2. Edit the strategy artifacts to define your product
3. Use /debussy:strategy to research and enrich
4. Use /debussy:roadmap to shape your roadmap
```

---

## Error Handling

| Situation | Action |
|---|---|
| `.debussy/` already exists, user chooses "re-scaffold" | Skip files that exist, create only missing ones |
| `.debussy/` already exists, user chooses "abort" | Print confirmation and EXIT |
| UI server not found | Print manual start instructions, continue (non-fatal) |
| File write fails | Print error, EXIT |
