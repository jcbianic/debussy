---
description: >-
  Product discovery: research the space, produce structured artifacts under
  .debussy/strategy/, and review them in the Debussy UI Inbox. Supports three
  depth levels (pitch, foundation, full) as a progressive journey.
  Commands: /strategy | /strategy --refresh {type} | /strategy --review
license: MIT
metadata:
  author: jcbianic
  version: "0.2.0"
---

# Strategy Skill

Research-first product discovery with progressive depth. This skill actively
investigates the product space and produces structured, machine-parseable
artifacts under `.debussy/strategy/`.

The user progresses through three depth levels — **Pitch**, **Foundation**,
**Full** — each building on the previous. The skill detects the current depth
and proposes either refining the current level or deepening to the next.

These artifacts feed `/debussy:product`, which consumes them to produce the
product definition, intents, and sync GitHub Issues.

Research comes first. The user validates and course-corrects — they are not the
primary source of raw information.

## When to Activate

- User says "research the space", "product discovery", "strategy", "map the landscape"
- User invokes `/strategy`
- User wants to understand competitors, audiences, or feature gaps before planning

## Usage

```
/strategy                          # Detect depth, propose refine or deepen
/strategy --refresh {type}         # Re-research and update one artifact type
/strategy --review                 # Open browser review UI for existing artifacts
```

---

## Depth Levels

| Level | Documents | Research Scope | Use Case |
|---|---|---|---|
| **Pitch** | `pitch.md` | 3-5 web queries, 1 agent | Side-project, hackathon, experiment |
| **Foundation** | `vision.md`, `problem-space.md`, `landscape.md` | 8-12 queries, 2 agents | Startup, serious side-project |
| **Full** | `vision.md`, `strategy.md`, `audiences.md`, `problems.md`, `landscape.md`, `competitors/*.md`, `allies/*.md`, `opportunities.md` | 15-25 queries, 4 agents | SaaS, enterprise, funded startup |

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If contains `--refresh` -> extract type, jump to **Refresh Mode**
2. If contains `--review` -> jump to **Review Mode**
3. Otherwise -> **Full Run Mode**

---

## Step 2: Detect Current Depth

Read `.debussy/config.yaml` to get `strates.strategy.depth`.

Also scan `.debussy/strategy/` to detect actual files present:

```bash
ls .debussy/strategy/*.md .debussy/strategy/competitors/*.md .debussy/strategy/allies/*.md 2>/dev/null || echo "EMPTY"
```

Determine current state:

| Files present | Detected depth |
|---|---|
| Nothing or only stubs | `none` (never run) |
| `pitch.md` with content | `pitch` |
| `vision.md` + `problem-space.md` + `landscape.md` | `foundation` |
| `audiences.md` + `problems.md` + `strategy.md` | `full` |

The configured depth in `config.yaml` is the **target**. The detected depth
from files is the **current state**.

---

## Step 3: Propose Action

Based on current state and target depth:

**If current = none (first run):**
- Start at the configured depth (from config.yaml, default: foundation)
- Jump to the appropriate research step

**If current = configured depth (same level):**
- Ask via AskUserQuestion:

```
Your strategy is at {depth} level ({N} documents).

1. "refine"  — rework the current artifacts with fresh research
2. "deepen"  — progress to {next level} ({M} documents, deeper research)

What would you like to do?
```

Where next level is: pitch → foundation, foundation → full, full → (no deepen option).

**If current < configured depth:**
- The user has already configured a deeper level. Proceed to deepen.

---

## Step 4: Gather Context

Read each of the following files if they exist (use Read tool; skip silently if missing):

| File | Purpose |
|---|---|
| `.debussy/strategy/**/*.md` | Existing strategy artifacts |
| `README.md` | Product name, one-liner, basic description |
| `CLAUDE.md` | Project instructions, structure, next steps |
| `.claude-plugin/plugin.json` | Plugin metadata (name, description, keywords) |
| `package.json` | Package metadata (if exists) |
| `specs/intents.md` | Existing roadmap intents |

Also run:

```bash
git log --oneline -15
```

Build an internal summary:

- **Product name** and one-liner
- **Problem domain** the product operates in
- **Target user** segment (if known)
- **Known competitors** (from existing artifacts)
- **Current state** of each artifact type (missing / thin / solid)

---

## Step 5: Research

Research scope adapts to the target depth level.

### Pitch Research (3-5 queries)

**Goal**: Get a quick, grounded understanding of the product space.

1. Search: `"{problem domain}" challenges frustrations`
2. Search: `"{product category}" alternatives tools`
3. Search: `"{target user}" workflow {problem}`
4. For the best 1-2 results, WebFetch and extract key findings
5. Compile a brief research summary

### Foundation Research (8-12 queries)

**Goal**: Understand the problem space, who it affects, and the market context.

Run research for different areas in parallel where possible (use Agent tool).

**5A — Vision & Problem Space Research:**

1. Search: `"{problem domain}" challenges frustrations {year}`
2. Search: `"{product category}" pain points users`
3. Search: `"{target user}" "{problem}" workflow`
4. For relevant results, WebFetch and extract:
   - Real problems users report (with quotes/links)
   - Audience segments and how they work today
   - Severity signals
5. Compile into draft problem-space with audience-problem pairings

**5B — Landscape Research:**

1. Search: `"best {product category} tools" alternatives`
2. Search: `"{closest competitor}" vs alternatives`
3. For each discovered tool (up to 5), WebFetch homepage/README
4. Extract: what it does, strengths, weaknesses
5. Compile into landscape overview

### Full Research (15-25 queries)

**Goal**: Comprehensive market map with competitor deep-dives and opportunity analysis.

Run research for different areas in parallel (use Agent tool with 4 agents).

**5A — Vision & Problems Research** (same as Foundation 5A, plus):

6. Search: `"{problem domain}" trends {year}`
7. Compile problems with evidence into separate problem entries with P{N} IDs

**5B — Audience Research:**

1. Search: `"{target user}" community size`
2. Search: `"{target user}" tools survey {year}`
3. Extract: audience size estimates, where they congregate, switching triggers
4. Compile into separate audience entries with A{N} IDs

**5C — Competitive Landscape Research:**

1. Search: `"best {product category} tools" alternatives`
2. For each competitor (up to 7): `"{competitor}" review frustrations`
3. WebFetch each competitor homepage/README
4. Also search for complementary tools (allies)
5. Compile into landscape overview + individual competitor/ally files

**5D — Opportunity & Strategy Research:**

1. Search: `"{product category}" features comparison`
2. Search: `"{closest competitor}" features list`
3. Extract: table stakes, differentiators, gaps, anti-patterns
4. Compile into opportunities map

### Research Output

Print a short summary to the terminal:

```
Research complete ({depth} level). Key findings:

{2-4 bullet points of key findings, adapted to depth}

Proceeding to synthesize artifacts...
```

---

## Step 6: Synthesize Draft Artifacts

Using research findings combined with existing docs, draft artifacts appropriate
to the depth level.

### Pitch Synthesis → 1 document

Draft `pitch.md`:

```markdown
---
name: Pitch
icon: i-heroicons-rocket-launch
status: draft
---
# {Product Name}

## Vision
> {One-liner that captures the essence}

{Why this project exists. What change it creates in the world. 2-3 sentences grounded in research.}

## The Problem

### P1: {Problem Name}
**Affects:** {who}
{2-3 sentences with evidence from research.}

### P2: {Problem Name}
**Affects:** {who}
{2-3 sentences.}

## The Product
{What we build to solve this.}

- **For:** {target audience}
- **Nature:** {CLI / SaaS / lib / etc.}
- **Distribution:** {npm / marketplace / self-hosted}

## What We're NOT Doing
- {Non-goal 1}
- {Non-goal 2}

## Landscape
{2-3 sentences on alternatives and where we fit.}
```

### Foundation Synthesis → 3 documents

Draft `vision.md`, `problem-space.md`, `landscape.md`.

**vision.md:**
```markdown
---
name: Vision
icon: i-heroicons-eye
status: draft
---
# Vision: {name}

## Why We're Building This
{Narrative paragraph grounded in research}

## North Star
{The one metric or outcome that matters most}

## Success Criteria
1. {Observable outcome}
2. {Observable outcome}
3. {Observable outcome}
```

**problem-space.md:**
```markdown
---
name: Problem Space
icon: i-heroicons-puzzle-piece
status: draft
---
# Problem Space

## A1: {Audience Segment}
**Size:** {estimation}
**Profile:** {description}

### Problems
- **P1: {Name}** — {description, severity}
- **P2: {Name}** — {description, severity}

### Current Workflow
{How they solve the problem today}

---

## A2: {Audience Segment}
**Size:** {estimation}
**Profile:** {description}

### Problems
- **P3: {Name}** — {description, severity}

### Current Workflow
{How they solve the problem today}
```

**landscape.md:**
```markdown
---
name: Landscape
icon: i-heroicons-map
status: draft
---
# Landscape

## Market Overview
{2-3 sentences on the market context and trends}

## Competitors

| Tool | What it does | Strengths | Gap we fill |
|---|---|---|---|
{rows from research}

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
{rows}
```

### Full Synthesis → 7+ documents

Draft all documents from the full structure. Use the same templates as
Foundation for shared documents (vision.md, landscape.md) but with
richer content. Additionally draft:

**strategy.md:**
```markdown
---
name: Strategy
icon: i-heroicons-adjustments-horizontal
status: draft
---
# Strategy

## Where We Play
{Markets, segments, channels chosen — and those we exclude}

## How We Win
{Our competitive advantage. Why us and not the others.}

## Strategic Intents
### SI-1: {Name}
{Business challenge blocking the vision. Stable over 6-12 months.}

### SI-2: {Name}
...

## Key Bets
{Testable hypotheses we're betting on}

## What We're NOT Doing
{Explicit exclusion choices}
```

**audiences.md** (split from problem-space):
```markdown
---
name: Audiences
icon: i-heroicons-users
status: draft
---
# Audiences

## A1: {Name}
**Size:** {estimation}
**Profile:** {description}
### Current Workflow
{step by step}
### Pain Points
{reference P{N}}
### Where They Congregate
{communities, forums}
### Switching Trigger
{what would make them switch}
```

**problems.md** (split from problem-space):
```markdown
---
name: Problems
icon: i-heroicons-exclamation-triangle
status: draft
---
# Problems

## P1: {Name}
**Severity:** {critical / high / medium}
**Affects:** A1, A2
### Evidence
{concrete data from research}
### Current Workarounds
{how people cope today}
```

**competitors/{slug}.md:**
```markdown
---
type: competitor
subject: {slug}
updated: {YYYY-MM-DD}
status: draft
---
# {Competitor Name}

## What It Does
{one paragraph}
## Strengths
{bulleted list}
## Weaknesses & User Frustrations
{bulleted list with evidence}
## Gap We Fill
{what we do that they don't}
## Key Features
| Feature | Them | Us |
|---|---|---|
```

**allies/{slug}.md:**
```markdown
---
type: ally
subject: {slug}
updated: {YYYY-MM-DD}
status: draft
---
# {Ally Name}

## What It Does
{one paragraph}
## Relationship
{how we relate to them}
## Integration Opportunity
{what we could build together}
## Synergies
{bulleted list}
```

**opportunities.md:**
```markdown
---
name: Opportunities
icon: i-heroicons-light-bulb
status: draft
---
# Opportunity Map

## Table Stakes
{What every tool in this market must have}

| Capability | Us | Competitor A | Competitor B |
|---|---|---|---|

## Differentiators
{Where we can stand out — cross-reference Landscape x Problems}

## Gaps
{Opportunities nobody covers — reference P{N}, A{N}}

## Anti-Patterns
{Features that seem good but frustrate users}
```

### Enrichment Rules

For artifacts that already exist and are solid, preserve the user's content but
enrich with research findings. Set `status: draft` on updated files. Preserve
`status: reviewed` on unchanged files.

---

## Step 7: Validate with User

Present findings and drafts to the user for validation. Ask a single
AskUserQuestion:

```
Here's what I found and drafted at {depth} level. Please review:

## Research Highlights
{2-4 bullet points of the most surprising or important findings}

## Draft Artifacts

{For each artifact: show the full draft}

---

**Questions I couldn't answer from research:**
{numbered list of specific gaps}

Reply:
- "go" to write as-is
- Corrections to revise (I'll re-draft changed sections)
- Answers to the open questions above
- "review" to open the browser review UI instead
```

If corrections are provided, apply them and re-draft. Show only the changed
sections. Ask once more for confirmation. Do not loop more than twice.

---

## Step 8: Write Artifacts

Create directories as needed:

```bash
mkdir -p .debussy/strategy/competitors .debussy/strategy/allies
```

Write all artifacts using the Write tool. Each file gets YAML frontmatter
per the templates above.

After writing all artifact files, create or update `.debussy/strategy/manifest.yaml`:

1. Read the existing manifest if it exists (to preserve `createdAt`).
2. Build the manifest from the actual files just written:
   - `depth`: the depth level that was just produced
   - `createdAt`: preserve from existing manifest, or set to today (`YYYY-MM-DD`)
   - `updatedAt`: set to today (`YYYY-MM-DD`)
   - `artifacts`: ordered list of top-level artifact keys, matching the depth's
     document list (e.g., for full: vision, strategy, audiences, problems,
     landscape, opportunities, product)
   - `subdirectories.competitors`: list of slugs from `competitors/*.md`
   - `subdirectories.allies`: list of slugs from `allies/*.md`
   - `custom`: any `.md` files in the strategy directory that are NOT in the
     depth's standard document list and are NOT in competitors/allies
3. Write the manifest using the Write tool.

Example manifest:

```yaml
depth: full
createdAt: "2026-03-20"
updatedAt: "2026-03-25"
artifacts:
  - key: vision
  - key: strategy
  - key: audiences
  - key: problems
  - key: landscape
  - key: opportunities
subdirectories:
  competitors:
    - gastown
    - gsd
  allies:
    - iikit
    - rpikit
custom:
  - key: feature-space
```

---

## Step 9: Deepen (Escalation)

When the user chooses "deepen" (Step 3), the skill splits existing documents
into the next level's structure.

### Pitch → Foundation

1. Read `pitch.md`
2. Extract sections into 3 files:
   - Vision section → `vision.md`
   - Problem + audience sections → `problem-space.md` (re-structured with A{N}/P{N} IDs)
   - Landscape section → `landscape.md` (enriched with new research)
3. Run Foundation-level research to fill gaps
4. Archive: rename `pitch.md` → `.pitch.archived.md`
5. Update `config.yaml`: set `depth: foundation`
6. Update `manifest.yaml`: set `depth: foundation`, update `artifacts` to the
   foundation document list, set `updatedAt` to today.

### Foundation → Full

1. Read `problem-space.md`
2. Split into:
   - `audiences.md` (A{N} entries)
   - `problems.md` (P{N} entries)
3. Scaffold new files: `strategy.md`, `opportunities.md`
4. Run Full-level research to fill:
   - Individual competitor files from landscape.md entries
   - Individual ally files
   - Opportunities from landscape × problems
   - Strategy choices
5. Archive: rename `problem-space.md` → `.problem-space.archived.md`
6. Update `config.yaml`: set `depth: full`
7. Update `manifest.yaml`: set the new depth, update `artifacts` to match the
   new depth's document list, add any new competitor/ally slugs to
   `subdirectories`, set `updatedAt` to today.

---

## Refresh Mode

`/strategy --refresh {type}`

Valid targets depend on depth:

| Depth | Valid targets |
|---|---|
| pitch | `pitch` |
| foundation | `vision`, `problem-space`, `landscape` |
| full | `vision`, `strategy`, `audiences`, `problems`, `landscape`, `competitors`, `allies`, `opportunities`, or a specific slug like `competitors/cursor` |

1. Read existing artifact(s) of that type
2. Run targeted research for that type only
3. Draft updated artifact(s)
4. Present diff for review via AskUserQuestion
5. Write on approval
6. Update `manifest.yaml`: set `updatedAt` to today. If a new competitor or ally
   was added, add its slug to the `subdirectories` list. Do not remove entries
   from the manifest during refresh.

---

## Review Mode

`/strategy --review`

Delegate to the review-gate skill to open the Debussy UI Inbox for all
existing strategy artifacts:

```
/review-gate --source strategy --title "Strategy Review: {product-name}" --icon i-heroicons-adjustments-horizontal --sidecars .debussy/strategy/*.md .debussy/strategy/competitors/*.md .debussy/strategy/allies/*.md
```

After the review-gate completes, for items with `changes-requested`: revise
the affected sections based on the user's comments and rewrite artifact files.
For items `rejected`: remove or rework the section entirely.

---

## Cross-References

Artifacts reference each other using stable IDs:

| ID format | Example | Defined in |
|---|---|---|
| `P{N}` | P1, P2 | `problems.md` or `problem-space.md` or `pitch.md` |
| `A{N}` | A1, A2 | `audiences.md` or `problem-space.md` or `pitch.md` |
| `SI-{N}` | SI-1, SI-2 | `strategy.md` (full only) |
| Competitor slug | `cursor`, `gastown` | `competitors/{slug}.md` |
| Ally slug | `iikit`, `rpikit` | `allies/{slug}.md` |

Cross-references are plain text (e.g., "Affects: A1, A2" or "See P3").

---

## Frontmatter Schema

**Top-level artifacts** (pitch, vision, strategy, problem-space, audiences, problems, landscape, opportunities, product):

```yaml
---
name: {Display Name}           # Required — shown in the UI artifact list
icon: i-heroicons-{name}       # Required — Heroicons name for the UI
status: draft | reviewed       # Tracks review state
---
```

**Competitor and ally files**:

```yaml
---
type: competitor | ally        # Required
subject: {slug}                # Required — matches the filename slug
updated: {YYYY-MM-DD}          # Set automatically when the skill writes the file
status: draft | reviewed       # Tracks review state
---
```

---

## Error Handling

| Situation | Action |
|---|---|
| WebSearch/WebFetch unavailable | Fall back to elicitation — ask user directly; note that research was skipped |
| Research returns thin results | Use what's available, flag gaps in validation |
| No existing artifacts | Normal first run — proceed with configured depth |
| `.debussy/strategy/` exists with content | Enrich, don't replace. Preserve user edits. |
| Empty research for a specific area | Note the gap, ask user to fill in during validation |
| Server fails to start in review mode | Print server.log content, EXIT |
| Review timeout | Print check instructions, EXIT |
| No config.yaml | Default to foundation depth |

---

## Integration with Product

After running `/debussy:strategy`, the user can run `/debussy:product` which
reads `.debussy/strategy/` artifacts as its primary input. The product skill
adapts to whatever depth level is present:

- **Pitch**: extracts P{N} and audience info from the single `pitch.md`
- **Foundation**: reads `problem-space.md` for combined A{N}/P{N} references
- **Full**: reads `audiences.md` + `problems.md` separately

The product skill produces `product.md` and `intents.md` under `.debussy/product/`
with `Addresses: P{N}` and `Target audience: A{N}` cross-refs regardless of depth.
