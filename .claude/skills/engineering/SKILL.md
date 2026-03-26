---
description: >-
  Manage engineering governance: agent policies, architectural principles, and
  decision records. Supports three depth levels (lite, standard, full) as a
  progressive journey.
  Commands: /engineering | /engineering --refresh {type} | /engineering --review
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Engineering Skill

Manage engineering governance artifacts -- the rules, principles, and decisions
that guide how agents and developers build the product. This skill produces
structured artifacts and keeps them consistent.

The user progresses through three depth levels -- **Lite**, **Standard**,
**Full** -- each building on the previous.

## When to Activate

- User says "set up engineering", "define policies", "architecture principles"
- User invokes `/engineering`
- User wants to establish governance rules for agents or the codebase

## Usage

```
/engineering                          # Detect depth, propose refine or deepen
/engineering --refresh {type}         # Re-generate or update one artifact type
/engineering --review                 # Open browser review UI for existing artifacts
```

---

## Depth Levels

| Level | Documents | Use Case |
|---|---|---|
| **Lite** | `.debussy/policies/*.md` | Side-project, guide agent behavior with lightweight rules |
| **Standard** | `.debussy/policies/*.md` + `docs/architecture/principles.md` | Serious project, explicit architectural principles |
| **Full** | `.debussy/policies/*.md` + `docs/architecture/principles.md` + `docs/decisions/*.md` | Team project, full traceability of decisions |

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If contains `--refresh` -> extract type, jump to **Refresh Mode**
2. If contains `--review` -> jump to **Review Mode**
3. Otherwise -> **Full Run Mode**

---

## Step 2: Detect Current Depth

Read `.debussy/config.yaml` to get `strates.engineering.depth`.

Also scan existing files to detect actual state:

```bash
ls .debussy/policies/*.md 2>/dev/null || echo "NO_POLICIES"
ls docs/architecture/principles.md 2>/dev/null || echo "NO_PRINCIPLES"
ls docs/decisions/*.md 2>/dev/null || echo "NO_DECISIONS"
```

| Files present | Detected depth |
|---|---|
| Nothing | `none` (never run) |
| `.debussy/policies/*.md` only | `lite` |
| `.debussy/policies/*.md` + `principles.md` | `standard` |
| `.debussy/policies/*.md` + `principles.md` + `decisions/*.md` | `full` |

---

## Step 3: Propose Action

**If current = none (first run):**
- Start at the configured depth (from config.yaml, default: standard)
- Jump to the appropriate generation step

**If current = configured depth (same level):**
- Ask via AskUserQuestion:

```
Your engineering governance is at {depth} level.

1. "refine"  -- rework the current artifacts
2. "deepen"  -- progress to {next level}

What would you like to do?
```

Where next level is: lite -> standard, standard -> full, full -> (no deepen option).

**If current < configured depth:**
- Proceed to deepen.

---

## Step 4: Gather Context

Read each of the following files if they exist (use Read tool; skip silently if missing):

| File | Purpose |
|---|---|
| `.debussy/policies/*.md` | Existing policy files |
| `docs/architecture/principles.md` | Existing principles |
| `docs/decisions/*.md` | Existing ADRs |
| `.debussy/strategy/**/*.md` | Strategy artifacts (for context) |
| `.debussy/product/product.md` | Product definition (for context) |
| `CLAUDE.md` | Project instructions |
| `AGENTS.md` | Agent rules |
| `.tessl/RULES.md` | Agent rules (if exists) |
| `package.json` | Tech stack info |

Also run:

```bash
git log --oneline -15
```

Build an internal summary:

- **Tech stack** (languages, frameworks, key dependencies)
- **Existing governance** (what policies/principles/ADRs exist)
- **Product context** (from strategy/product artifacts)
- **Agent ecosystem** (what skills/tools are in use)

---

## Step 5: Generate Artifacts

### Lite: Policies only

Analyze the codebase and project context, then draft policy files. Each policy
is a separate markdown file in `.debussy/policies/`.

Policy topics to consider (generate those relevant to the project):

- **Testing** -- testing strategy, coverage expectations, test types
- **Code style** -- formatting, naming conventions, file organization
- **Security** -- authentication, authorization, secrets management
- **Dependencies** -- dependency management, update policy, audit
- **Agent behavior** -- how AI agents should work in this codebase
- **Git workflow** -- branching, commit messages, PR conventions
- **Documentation** -- what to document, where, format

Each policy file follows this format:

```markdown
---
name: {Policy Name}
icon: i-heroicons-{icon}
status: draft
order: {N}
---
# {Policy Name}

## {Section 1}

- **{Rule}** -- {explanation}
- **{Rule}** -- {explanation}

## {Section 2}

{prose or bullet points}
```

### Standard: Policies + Principles

Everything from Lite, plus generate or update `docs/architecture/principles.md`:

```markdown
---
title: Architecture Principles
---

## 1 -- {Principle Name}

**num:** 1
**relatedAdrs:** {adr-NNN list, if any}

{2-3 sentences explaining the principle and its rationale.}

---

## 2 -- {Principle Name}

**num:** 2

{2-3 sentences.}
```

Principles should be derived from:
- The actual codebase structure and patterns
- Existing ADRs (if any)
- Strategy/product context
- Existing policies

### Full: Policies + Principles + ADR scaffold

Everything from Standard, plus ensure `docs/decisions/` has a good foundation.

If ADRs already exist, analyze them for consistency and completeness. Suggest
new ADRs for undocumented decisions detected in the codebase.

If no ADRs exist, scaffold 1-3 foundational ADRs based on observable decisions:

```markdown
# ADR {NNN} -- {Decision Title}

## Status

Accepted

## Context

{What motivated this decision?}

## Decision

{What was decided?}

## Consequences

{What follows from this decision?}
```

ADR numbers are three-digit, zero-padded. Never renumber existing ADRs.

---

## Step 6: Validate with User

Present drafts to the user. Ask a single AskUserQuestion:

```
Here's the engineering governance at {depth} level.

## Draft Artifacts

{For each artifact: show the full draft}

---

Reply:
- "go" to write as-is
- Corrections to revise
```

If corrections are provided, apply them and re-draft. Do not loop more than twice.

---

## Step 7: Write Artifacts

Create directories as needed:

```bash
mkdir -p .debussy/policies docs/architecture docs/decisions
```

Write all artifact files using the Write tool. Skip files that already exist
and were not changed.

---

## Step 8: Deepen (Escalation)

### Lite -> Standard

1. Read existing policies
2. Derive architectural principles from policies + codebase analysis
3. Draft `docs/architecture/principles.md`
4. Update `config.yaml`: set engineering depth to `standard`

### Standard -> Full

1. Read existing principles and policies
2. Analyze codebase for undocumented decisions
3. Scaffold ADRs for detected decisions
4. Cross-reference principles with ADRs (`relatedAdrs` field)
5. Update `config.yaml`: set engineering depth to `full`

---

## Refresh Mode

`/engineering --refresh {type}`

Valid targets depend on depth:

| Depth | Valid targets |
|---|---|
| lite | `policies`, or a specific policy slug like `policies/testing` |
| standard | `policies`, `principles`, or a specific slug |
| full | `policies`, `principles`, `decisions`, or a specific slug |

1. Read existing artifact(s) of that type
2. Analyze current codebase state
3. Draft updated artifact(s)
4. Present diff for review via AskUserQuestion
5. Write on approval

---

## Review Mode

`/engineering --review`

Open the browser review UI for existing engineering artifacts. Follow the same
review UI flow as the strategy skill:

1. Build request manifest from `.debussy/policies/*.md`, `docs/architecture/principles.md`,
   and `docs/decisions/*.md`
2. Deploy review server from templates
3. Wait for user response
4. Process response and update artifacts

---

## Cross-References

| ID format | Example | Defined in |
|---|---|---|
| Principle `{N}` | 1, 2 | `docs/architecture/principles.md` |
| ADR `{NNN}` | 001, 002 | `docs/decisions/{NNN}-*.md` |
| Policy slug | `testing`, `security` | `.debussy/policies/{slug}.md` |

Principles reference ADRs via `relatedAdrs` field. ADRs reference principles
when a decision implements or constrains a principle.

---

## Error Handling

| Situation | Action |
|---|---|
| No existing governance artifacts | Normal first run -- proceed with configured depth |
| Existing artifacts at deeper depth than configured | Preserve all existing artifacts, note the mismatch |
| Server fails to start in review mode | Print server.log content, EXIT |
| Review timeout | Print check instructions, EXIT |
| No config.yaml | Default to standard depth |
