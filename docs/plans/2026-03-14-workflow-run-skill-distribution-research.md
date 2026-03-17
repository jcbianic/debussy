# Research: Distributing workflow-run via npx skills (2026-03-14)

## Problem Statement

Make the `workflow-run` skill installable by any Claude Code user via
`npx skills add <repo>`, using the [vercel-labs/skills][vl-skills] open
agent skills ecosystem.

## Requirements

- Skill must be installable with a single `npx skills add` command
- No npm publish or central registry submission required
- Templates (review server + review UI) must be distributed alongside
  the skill spec
- Python 3 and jq system dependencies must be documented

## Findings

### How vercel-labs/skills Works

The `npx skills` CLI fetches skills **directly from GitHub** (or any git
host). There is no central registry and no npm publish step needed.

Install command for users:

```bash
npx skills add jcbianic/debussy --skill workflow-run -a claude-code
```

Or from within an existing Claude Code project:

```bash
npx skills add jcbianic/debussy -s workflow-run
```

The CLI discovers `SKILL.md` files in standard locations including
`.claude/skills/`. It installs skills to `.claude/skills/<name>/` (project)
or `~/.claude/skills/<name>/` (global via `-g`).

### Required Skill Package Format

A skill is a **directory** with one mandatory file:

```
workflow-run/
└── SKILL.md        # Required: frontmatter name + description + body
```

**`SKILL.md` frontmatter spec:**

| Field           | Required | Notes                                                           |
| --------------- | -------- | --------------------------------------------------------------- |
| `name`          | Yes      | Must match directory name. Lowercase, hyphens only, 1-64 chars |
| `description`   | Yes      | 1-1024 chars. Describes what it does AND when to use it        |
| `license`       | No       | Short SPDX ID or path to bundled file (e.g. `MIT`)             |
| `compatibility` | No       | Describes environment requirements (Python 3, jq, etc.)        |
| `metadata`      | No       | Arbitrary key-value map: `author`, `version`, `internal`, etc. |
| `allowed-tools` | No       | Experimental. Pre-approved tools whitelist.                     |

### Relevant Files

| File                                                 | Purpose                                   | Key Lines  |
| ---------------------------------------------------- | ----------------------------------------- | ---------- |
| `.claude/skills/workflow-run/SKILL.md`               | Skill manifest + maestro specification    | 1-637      |
| `.claude/skills/workflow-run/templates/review.html`  | Review dashboard UI (self-contained HTML) | 1-816      |
| `.claude/skills/workflow-run/templates/review-server.py` | Python 3 HTTP server for review gate  | 1-172      |
| `.claude/workflows/smoke-test.yml`                   | End-to-end validation workflow            | 1-~20      |

### Current SKILL.md Frontmatter

```yaml
---
description: >-
  Run multi-step AI workflows defined in YAML files with human review gates.
  Use when user says "run workflow", "start workflow", "resume workflow", or
  references a .claude/workflows/*.yml file. Commands: /workflow-run <file>
  [--input k=v] | --resume [run_id] | --status | --list
---
```

**Problem:** `name` field is missing. The vercel-labs/skills spec requires it
and it must exactly match the directory name (`workflow-run`).

### Existing Patterns

- Directory name `workflow-run` already satisfies the format constraint
  (lowercase, hyphens only)
- `templates/` subdirectory is the right pattern for supporting files
  (analogous to `assets/` or `references/` in the spec)
- The skill is self-contained with no npm dependencies
- Templates use only Python 3 stdlib and plain HTML/JS — no build step

### Dependencies

**System requirements (not bundled):**

- Python 3 — for `review-server.py` at runtime
- `jq` — for JSON manipulation in the maestro execution loop
- `bash` — for trigger-file blocking loop

**No npm dependencies.** The skill is pure text.

### Technical Constraints

- The `name` value in frontmatter must exactly match the parent directory name
- Skills installed globally go to `~/.claude/skills/workflow-run/`; project-scoped
  to `.claude/skills/workflow-run/`
- Template files must remain under `templates/` because `SKILL.md` references
  them by that relative path
- The smoke-test workflow in `.claude/workflows/` is not part of the installed
  skill — it lives in this repo for development validation only

## Gap Analysis

### What Must Change (Blocking)

1. **Add `name: workflow-run` to SKILL.md frontmatter** — required field,
   currently missing. One line change.

### What Should Change (Recommended)

2. **Add `compatibility` field** — document Python 3 and jq requirements so
   users know before install
3. **Add `metadata.version`** — enables `npx skills update` to detect stale
   installs
4. **Add example workflow** under `examples/` or `references/` — gives users
   a starting point (can reference the existing `smoke-test.yml`)

### What Is Optional (Nice to Have)

5. **Add `license` field** — good practice for public distribution
6. **Add `metadata.author`** — attribution
7. **Publish to skills.sh directory** — increases discoverability (process
   unclear; may be automatic indexing of public repos)

## Open Questions

- Does the debussy repo need to be public on GitHub for `npx skills add` to
  work, or can users point at a private repo with credentials?
- Should the example workflow live inside the skill directory (copyable) or
  only in `.claude/workflows/` (development only)?
- What version number should appear in `metadata.version`? The skill has no
  prior versioning.

## Recommendations

The minimal change is a **one-line addition** to `SKILL.md` frontmatter:

```yaml
---
name: workflow-run
description: >-
  Run multi-step AI workflows defined in YAML files with human review gates.
  ...
compatibility: Requires Python 3, jq, and bash on PATH.
metadata:
  version: "1.0.0"
  author: jcbianic
license: MIT
---
```

After that change, any user can install the skill with:

```bash
npx skills add jcbianic/debussy --skill workflow-run -a claude-code
```

No restructuring of the skill directory is required. The `templates/`
subdirectory is already correctly placed and named.

[vl-skills]: https://github.com/vercel-labs/skills
