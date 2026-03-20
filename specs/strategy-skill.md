# Strategy Skill — Specification

**Skill**: `/debussy:strategy`
**Status**: Draft
**Date**: 2026-03-18

## 1. Overview

The strategy skill runs **Product Discovery** — the research phase that builds
understanding of the space before scoping a roadmap. It produces a set of
structured, machine-parseable artifacts under `docs/strategy/` that capture
the vision, problems, audiences, landscape, competitors, allies, feature space,
and product positioning.

These artifacts feed the existing `/debussy:roadmap` skill, which consumes them
to produce `specs/intents.md` and sync GitHub Issues. The two skills have
different rhythms: strategy runs when you need to understand the space; roadmap
runs when you need to scope work.

A browser-based **review UI** lets the user explore artifacts, drill into
sections, and discuss individual items (approve, flag, annotate).

---

## 2. Artifact Taxonomy

### 2.1 Directory Structure

```
docs/strategy/
  vision.md                    # Why, north star, success criteria
  problems.md                  # Named problems, severity, evidence
  audiences.md                 # User segments, sizes, workflows
  landscape.md                 # Market overview, trends, opportunity map
  feature-space.md             # Table stakes, differentiators, gaps
  product.md                   # Positioning, distribution, non-goals
  competitors/
    {slug}.md                  # One file per competitor (e.g., cursor.md)
  allies/
    {slug}.md                  # One file per ally/complement (e.g., iikit.md)
specs/
  intents.md                   # Roadmap milestones (output, not input)
```

### 2.2 Frontmatter Schema

Every strategy artifact starts with YAML frontmatter:

```yaml
---
type: {artifact-type}          # vision | problems | audiences | landscape |
                               # feature-space | product | competitor | ally
subject: {slug}                # Only for competitor/ally files. Slugified name.
updated: {YYYY-MM-DD}          # Last research/write date
status: draft | reviewed       # Tracks review state
---
```

Rules:
- `type` is required on all files.
- `subject` is required only on `competitor` and `ally` files.
- `updated` is set automatically when the skill writes the file.
- `status` starts as `draft`. Set to `reviewed` by the review UI.
- No other frontmatter fields. Keep it minimal.

### 2.3 Artifact Types

---

#### Vision

**File**: `docs/strategy/vision.md`
**Purpose**: The "why" — motivations, direction, success definition.

```markdown
---
type: vision
updated: 2026-03-18
status: draft
---

# Vision: {product-name}

## Why We're Building This

{Narrative paragraph grounded in research. What problem exists in the world
and why is now the right time to solve it.}

## North Star

{The one metric or outcome that matters most. Concrete, measurable.}

## Success Criteria

{What does success look like in 6 months? List 3-5 observable outcomes.}

- {outcome 1}
- {outcome 2}
- {outcome 3}
```

---

#### Problems

**File**: `docs/strategy/problems.md`
**Purpose**: The specific problems worth solving, with evidence and severity.

Each problem gets a numbered section with a stable ID (P1, P2, ...).
Never renumber — append new problems.

```markdown
---
type: problems
updated: 2026-03-18
status: draft
---

# Problems

## P1: {Problem Name}

**Severity:** {critical | high | medium | low}
**Affects:** {audience references, e.g., A1, A2}

{2-3 sentence description of the problem.}

### Evidence

{Research findings that validate this problem exists. User quotes, community
threads, survey data, competitor gap analysis. Cite sources.}

### Current Workarounds

{How people solve this today without the product.}

---

## P2: {Problem Name}

...
```

---

#### Audiences

**File**: `docs/strategy/audiences.md`
**Purpose**: Who the users are, how many, how they work today.

Each audience segment gets a numbered section with a stable ID (A1, A2, ...).

```markdown
---
type: audiences
updated: 2026-03-18
status: draft
---

# Audiences

## A1: {Segment Name}

**Size:** {Estimated number or range, with source}
**Profile:** {Who they are — role, context, skill level}

### Current Workflow

{How they solve the problem today. Step by step if possible.}

### Pain Points

{Their specific frustrations. Reference problems: P1, P3.}

### Where They Congregate

{Communities, forums, Slack groups, subreddits, conferences.}

### Switching Trigger

{What would make them try something new. What's the tipping point.}

---

## A2: {Segment Name}

...
```

---

#### Landscape

**File**: `docs/strategy/landscape.md`
**Purpose**: High-level market map. Overview with links to competitor/ally
detail files.

```markdown
---
type: landscape
updated: 2026-03-18
status: draft
---

# Landscape

## Market Overview

{Narrative: what is the territory, how big, what's happening.}

## Competitors

| Tool | What it does | Our gap | Detail |
|---|---|---|---|
| {name} | {one sentence} | {how we differ} | [profile](competitors/{slug}.md) |
| ... | ... | ... | ... |

## Allies & Complements

| Tool | Relationship | Integration | Detail |
|---|---|---|---|
| {name} | {how it relates} | {what we could build} | [profile](allies/{slug}.md) |
| ... | ... | ... | ... |

## Trends

{Key market trends shaping this space. Research-backed.}

- {trend 1}: {implication for us}
- {trend 2}: {implication for us}

## Opportunities

{Underserved areas identified from research. Gaps nobody fills.}
```

---

#### Competitor

**File**: `docs/strategy/competitors/{slug}.md`
**Purpose**: Deep profile of a single competitor.

```markdown
---
type: competitor
subject: {slug}
updated: 2026-03-18
status: draft
---

# {Competitor Name}

**URL:** {homepage or repo}
**Category:** {what kind of tool}

## What It Does

{One sentence.}

## Strengths

- {concrete feature or quality, with evidence}
- {concrete feature or quality}

## Weaknesses & User Frustrations

- {frustration, with evidence — user quote, GitHub issue, forum thread}
- {frustration}

## Gap We Fill

{How our product is different. What we do that they don't or can't.}

## Key Features

| Feature | Notes |
|---|---|
| {feature} | {how it compares to our approach} |
| ... | ... |
```

---

#### Ally

**File**: `docs/strategy/allies/{slug}.md`
**Purpose**: Deep profile of a complementary tool or potential partner.

```markdown
---
type: ally
subject: {slug}
updated: 2026-03-18
status: draft
---

# {Ally Name}

**URL:** {homepage or repo}
**Category:** {what kind of tool}

## What It Does

{One sentence.}

## Relationship

{How it relates to our product. What overlap or synergy exists.}

## Integration Opportunity

{What we could build together. Concrete integration ideas.}

## Synergies

- {synergy 1}
- {synergy 2}
```

---

#### Feature Space

**File**: `docs/strategy/feature-space.md`
**Purpose**: Map of features across the market — what exists, what's missing,
where we play.

```markdown
---
type: feature-space
updated: 2026-03-18
status: draft
---

# Feature Space

## Table Stakes

{Features every tool in this space has. Users expect these — absence is a
dealbreaker.}

- {feature}: {who has it}
- {feature}: {who has it}

## Differentiators

{Features that set leaders apart. Having these creates competitive advantage.}

- {feature}: {who has it, how it works}
- {feature}: {who has it, how it works}

## Gaps

{Features users want but nobody provides well. These are opportunities.}

- {gap}: {evidence of demand}
- {gap}: {evidence of demand}

## Anti-Patterns

{Features that seem good but frustrate users in practice. Avoid these.}

- {anti-pattern}: {why it fails}

## Our Position

| Feature | Status | Notes |
|---|---|---|
| {feature} | have / planned / won't do | {context} |
| ... | ... | ... |
```

---

#### Product

**File**: `docs/strategy/product.md`
**Purpose**: What the product is, how it's positioned, what it's not.

```markdown
---
type: product
updated: 2026-03-18
status: draft
---

# Product Definition: {name}

## One-Liner

{One sentence.}

## Positioning

{How this product is different from competitors. The unique angle.
References landscape and feature space findings.}

## Target User

{Primary audience segment. References A1 from audiences.md.}

## Nature

- **License**: {license}
- **Distribution**: {how users get it}
- **Hosting model**: {local-first / self-hosted / SaaS}
- **Source**: {open / closed / mixed}

## Non-Goals

- {what it explicitly is NOT}
- {what it explicitly is NOT}

## Key Dependencies

- {runtime or tool this relies on}
```

---

### 2.4 Cross-References

Artifacts reference each other using stable IDs:

| ID format | Example | Defined in |
|---|---|---|
| `P{N}` | P1, P2 | `problems.md` |
| `A{N}` | A1, A2 | `audiences.md` |
| Competitor slug | `cursor`, `gastown` | `competitors/{slug}.md` |
| Ally slug | `iikit`, `rpikit` | `allies/{slug}.md` |

Cross-references are plain text (e.g., "Affects: A1, A2" or "See P3").
The review UI can parse these to render links. No special syntax needed.

---

## 3. Strategy Skill Workflow

### 3.1 Commands

```
/debussy:strategy                    # Full run: research -> write artifacts -> review
/debussy:strategy --refresh {type}   # Re-research and update one artifact type
/debussy:strategy --review           # Open review UI for existing artifacts
```

### 3.2 Full Run

**Step 1: Gather Context**

Read all existing strategy artifacts (if any) plus repo metadata:

| Source | Purpose |
|---|---|
| `docs/strategy/**/*.md` | Existing artifacts |
| `README.md` | Product name, description |
| `CLAUDE.md` | Project instructions |
| `.claude-plugin/plugin.json` | Plugin metadata |
| `package.json` | Package metadata (if exists) |
| `specs/intents.md` | Existing roadmap intents |

```bash
git log --oneline -15
```

Build an internal summary: product name, problem domain, target user, known
competitors, current state of each artifact.

**Step 2: Assess Gaps**

For each artifact type, classify as:

| State | Meaning | Action |
|---|---|---|
| **Missing** | File doesn't exist | Full research |
| **Thin** | File exists but key sections empty or vague | Targeted research |
| **Solid** | File exists with substantive content | Validation research (lighter) |

**Step 3: Research**

For each artifact area that needs work, use WebSearch and WebFetch.
Run research for different areas in parallel where possible (use Agent tool).

**3A — Vision & Problems Research**

1. Search: `"{problem domain}" challenges frustrations {year}`
2. Search: `"{product category}" pain points users`
3. For relevant results, WebFetch and extract:
   - Real problems users report (with quotes/links)
   - Severity signals (how many people, how loud)
   - Trends shaping the problem space
4. Compile into draft problems with evidence

**3B — Audience Research**

1. Search: `"{target user}" community size`
2. Search: `"{target user}" "{problem}" workflow`
3. Search: `"{target user}" tools survey {year}`
4. Extract:
   - Audience size estimates (GitHub stars, npm downloads, surveys)
   - Current workflows (step by step)
   - Where they congregate (subreddits, Discords, forums)
   - Switching triggers

**3C — Competitive Landscape Research**

1. Search: `"best {product category} tools" alternatives`
2. For each known competitor: `"{competitor}" review frustrations`
3. For each discovered competitor (up to 7): WebFetch homepage/README
4. Extract per competitor: what it does, strengths, weaknesses, features
5. Also search for complementary tools (allies)
6. Identify market trends and opportunities

**3D — Feature Space Research**

1. Search: `"{product category}" features comparison`
2. Search: `"{closest competitor}" features list`
3. Extract:
   - Common features (table stakes)
   - Differentiating features
   - Gaps (features users request but nobody has)
   - Anti-patterns

**Step 4: Synthesize**

Draft all artifacts. For each:
- If missing: write from scratch using research
- If thin: enrich with research findings, preserve user's existing content
- If solid: add new findings, flag changes for review

**Step 5: Present for Review**

Print a summary of research findings and changes:

```
Strategy research complete.

New artifacts:     {list}
Updated artifacts: {list with change summary}
Unchanged:         {list}

Key findings:
  - {finding 1}
  - {finding 2}
  - {finding 3}
```

Then either:
- **CLI review**: AskUserQuestion with full drafts (if few changes)
- **UI review**: Launch review dashboard (if many artifacts)

Ask user to choose: "Review here in the terminal, or open the review UI?"

**Step 6: Write Artifacts**

```bash
mkdir -p docs/strategy/competitors docs/strategy/allies
```

Write all artifacts using the Write tool. Set `status: draft` on new/updated
files. Preserve `status: reviewed` on unchanged files.

### 3.3 Refresh Mode

`/debussy:strategy --refresh competitors`

1. Read existing artifact(s) of that type
2. Run targeted research for that type only (Step 3)
3. Draft updated artifact(s)
4. Present diff for review
5. Write on approval

Valid refresh targets: `vision`, `problems`, `audiences`, `landscape`,
`competitors`, `allies`, `feature-space`, `product`, or a specific slug
like `competitors/cursor`.

### 3.4 Review Mode

`/debussy:strategy --review`

1. Read all existing strategy artifacts
2. Launch the review UI (see Section 5)
3. Wait for user to complete review (filewatch, like feedback skill)
4. Apply review decisions:
   - **Approved** sections: set `status: reviewed`
   - **Flagged** sections: keep `status: draft`, add inline annotation
   - **Discussed** items: persist discussion notes

---

## 4. Roadmap Skill Evolution

The roadmap skill (`/debussy:roadmap`) simplifies significantly:

**Before**: Research + elicit + synthesize + write artifacts + sync issues
**After**: Read strategy artifacts + synthesize intents + sync issues

### Changed Workflow

1. **Read strategy artifacts** — load all `docs/strategy/*.md` files
2. **Assess readiness** — check that key artifacts exist (problems, audiences,
   feature-space at minimum). If missing, suggest running `/debussy:strategy`
   first.
3. **Synthesize intents** — using problems, feature space gaps, and audience
   pain points, draft/update intents. Each intent should trace to a problem
   (P{N}) and audience (A{N}).
4. **Validate with user** — present intent drafts for review
5. **Write `specs/intents.md`** — with updated cross-references
6. **Sync GitHub Issues** — same as current (Steps 8A-8D)

### Updated Intent Format

```markdown
## {NNN} — {Name}

{description}

**Addresses:** P{N}: {problem name}
**Target audience:** A{N}: {audience name}
**Priority:** {now / next / later}
**Depends on:** {NNN list or "none"}
**Done when:** {observable outcome}
```

The addition of explicit `P{N}` and `A{N}` references creates traceability
from roadmap back to strategy.

---

## 5. Review UI

### 5.1 Architecture

Same pattern as the feedback skill:
- Python HTTP server serves a single-page HTML app
- Filewatch loop in bash (no token consumption while waiting)
- Structured JSON response written to a results file

### 5.2 Dashboard

The UI presents all strategy artifacts as navigable cards:

```
+-------------------------------------------------------------------+
|  STRATEGY REVIEW: Debussy                                          |
+-------------------------------------------------------------------+
|                                                                     |
|  [Vision]  [Problems]  [Audiences]  [Product]  [Feature Space]     |
|                                                                     |
|  Landscape        Competitors           Allies                      |
|  +----------+     +----------+          +----------+                |
|  | Overview |     | Cursor   | draft    | IIKit    | reviewed       |
|  |          |     | GasTown  | draft    | rpikit   | draft          |
|  +----------+     | Copilot  | draft    +----------+                |
|                   +----------+                                      |
|                                                                     |
|  Status: 3/9 reviewed, 6/9 draft                                   |
+-------------------------------------------------------------------+
```

Clicking a card opens the artifact detail view.

### 5.3 Detail View

Each artifact renders its markdown with section-level controls:

```
+-------------------------------------------------------------------+
|  < Back to Dashboard                     Cursor (competitor)        |
+-------------------------------------------------------------------+
|                                                                     |
|  ## What It Does                              [Approve] [Flag]      |
|  AI-powered code editor with built-in         [Discuss]             |
|  chat and autocomplete...                                           |
|                                                                     |
|  ## Strengths                                 [Approve] [Flag]      |
|  - Deep VS Code integration                  [Discuss]              |
|  - Fast autocomplete                                                |
|  - Large community                                                  |
|                                                                     |
|  ## Weaknesses & User Frustrations            [Approve] [Flag]      |
|  - "Cursor keeps suggesting wrong             [Discuss]             |
|    completions in large monorepos"                                  |
|    — r/cursor, 2026-02                                              |
|                                                                     |
|  +---------- Discussion ----------+                                 |
|  | User: This matches what I see  |                                 |
|  | too. Add a note about pricing. |                                 |
|  +--------------------------------+                                 |
|                                                                     |
+-------------------------------------------------------------------+
```

### 5.4 Discussion Model

Each section of each artifact can have:
- **Status**: pending | approved | flagged
- **Notes**: free-text annotations from the user

Discussion data persists in a sidecar file:

```
docs/strategy/.reviews/
  {artifact-slug}.review.json
```

Example:
```json
{
  "artifact": "competitors/cursor",
  "updated": "2026-03-18",
  "sections": {
    "what-it-does": {
      "status": "approved"
    },
    "strengths": {
      "status": "flagged",
      "notes": "Missing pricing comparison"
    },
    "weaknesses": {
      "status": "approved",
      "notes": "Add note about monorepo performance"
    }
  }
}
```

When the review completes:
- The skill reads all `.review.json` files
- Updates artifact `status` frontmatter (`reviewed` if all sections approved)
- Applies notes as inline comments or queues them for the next refresh

### 5.5 Technology

| Component | Tech | Notes |
|---|---|---|
| Server | Python 3 (`http.server`) | Same as feedback skill |
| Frontend | Single HTML file, vanilla JS | Dark theme, keyboard-navigable |
| Data | JSON sidecar files | Machine-readable, git-trackable |
| Wait | Bash filewatch loop | Zero token consumption |
| Templates | `templates/` directory | Never regenerated at runtime |

---

## 6. Implementation Plan

### Phase 1: Artifact Schemas + Strategy Skill (no UI)

1. Define artifact directory structure and frontmatter schemas
2. Implement `/debussy:strategy` full run (research + synthesize + CLI review)
3. Implement `--refresh` mode
4. Migrate existing `docs/*.md` to `docs/strategy/` with frontmatter
5. Update `/debussy:roadmap` to read from `docs/strategy/`

### Phase 2: Review UI

6. Build review dashboard (HTML + Python server)
7. Build detail view with section-level controls
8. Implement discussion model (JSON sidecars)
9. Implement `--review` mode in the skill
10. Wire review results back to artifact status

### Phase 3: Polish

11. Keyboard navigation throughout UI
12. Cross-reference linking in UI (click P1 to jump to problems.md)
13. Status dashboard (% reviewed, staleness indicators)
14. Refresh suggestions based on artifact age

---

## 7. Open Questions

1. **Artifact granularity for problems/audiences**: Should each problem or
   audience get its own file (like competitors), or is a single file with
   sections sufficient? Single file is simpler for now; can split later if
   needed.

2. **Review persistence**: JSON sidecar vs inline markdown annotations.
   JSON is cleaner for the UI; inline annotations are more visible in git.
   Spec proposes JSON sidecars.

3. **Staleness**: How to signal when an artifact is out of date? Could use
   `updated` date + a configurable threshold. Or manual "needs refresh" flag.

4. **Multiple products**: This spec assumes one product per repo. If Debussy
   itself hosts multiple products, the directory structure would need scoping.
   Out of scope for now.
