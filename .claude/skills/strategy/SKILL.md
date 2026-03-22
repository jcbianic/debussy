---
description: >-
  Product discovery: research the space, produce structured artifacts under
  .debussy/strategy/, and review them in a browser UI. Use when shaping product
  direction, mapping the competitive landscape, or defining audiences and
  problems before roadmap scoping.
  Commands: /strategy | /strategy --refresh {type} | /strategy --review
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Strategy Skill

Research-first product discovery. This skill actively investigates the product
space — vision, problems, audiences, landscape, competitors, allies, feature
space, and product positioning — and produces structured, machine-parseable
artifacts under `.debussy/strategy/`.

These artifacts feed `/debussy:roadmap`, which consumes them to produce intents
and sync GitHub Issues. The two skills have different rhythms: strategy runs
when you need to understand the space; roadmap runs when you need to scope work.

Research comes first. The user validates and course-corrects — they are not the
primary source of raw information.

## When to Activate

- User says "research the space", "product discovery", "strategy", "map the landscape"
- User invokes `/strategy`
- User wants to understand competitors, audiences, or feature gaps before planning

## Usage

```
/strategy                          # Full run: research -> synthesize -> validate -> write
/strategy --refresh {type}         # Re-research and update one artifact type
/strategy --review                 # Open browser review UI for existing artifacts
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If contains `--refresh` -> extract type, jump to **Refresh Mode**
2. If contains `--review` -> jump to **Review Mode**
3. Otherwise -> **Full Run Mode**

---

## Step 2: Gather Context

Read each of the following files if they exist (use Read tool; skip silently if missing):

| File | Purpose |
|---|---|
| `.debussy/strategy/**/*.md` | Existing strategy artifacts |
| `docs/vision.md` | Legacy vision artifact (fallback) |
| `docs/landscape.md` | Legacy landscape artifact (fallback) |
| `docs/product.md` | Legacy product artifact (fallback) |
| `README.md` | Product name, one-liner, basic description |
| `CLAUDE.md` | Project instructions, structure, next steps |
| `.claude-plugin/plugin.json` | Plugin metadata (name, description, keywords) |
| `package.json` | Package metadata (if exists) |
| `specs/intents.md` | Existing roadmap intents |

Also run:

```bash
git log --oneline -15
```

After gathering, build an internal summary:

- **Product name** and one-liner
- **Problem domain** the product operates in
- **Target user** segment (if known)
- **Known competitors** (from existing artifacts)
- **Current state** of each artifact type (missing / thin / solid)

This summary drives the research queries in Step 4.

---

## Step 3: Assess Gaps

For each artifact type, classify as:

| State | Meaning | Action |
|---|---|---|
| **Missing** | File doesn't exist | Full research |
| **Thin** | File exists but key sections empty or vague | Targeted research |
| **Solid** | File exists with substantive content | Validation research (lighter) |

Assessment criteria per artifact:

| Artifact | Solid if... | Thin if... |
|---|---|---|
| `vision.md` | Has narrative why + north star + 3+ success criteria | Missing or has fewer than 2 concrete criteria |
| `problems.md` | Has 3+ named problems with evidence | Missing or problems lack evidence |
| `audiences.md` | Has 2+ segments with size estimates and workflows | Missing or segments are vague |
| `landscape.md` | Has market overview + 3+ competitor entries | Missing or only 1-2 vague entries |
| `competitors/*.md` | Has strengths + weaknesses + gap with evidence | Missing key sections |
| `allies/*.md` | Has relationship + integration opportunity | Missing key sections |
| `feature-space.md` | Has table stakes + differentiators + gaps | Missing or only one category |
| `product.md` | Has positioning + target user + non-goals | Missing or lacks key sections |

Flag thin/missing areas for deep research in Step 4.
Flag solid areas for validation research (lighter touch — verify, enrich, don't replace).

---

## Step 4: Research

Before asking the user anything, actively investigate the product space. Use
WebSearch and WebFetch tools.

**General approach**: formulate 2-4 search queries per research area, run them,
read the most relevant results, and compile findings. Prefer concrete data
(tool names, features, community sizes, user quotes) over generic summaries.

Run research for different areas in parallel where possible (use Agent tool).

### 4A — Vision & Problems Research

**Goal**: Understand the problem space and validate pain points.

1. Search: `"{problem domain}" challenges frustrations {year}`
2. Search: `"{product category}" pain points users`
3. For relevant results, WebFetch and extract:
   - Real problems users report (with quotes/links)
   - Severity signals (how many people, how loud)
   - Trends shaping the problem space
4. Compile into draft problems with evidence

### 4B — Audience Research

**Goal**: Understand who the users are, how many, and how they work today.

1. Search: `"{target user}" community size`
2. Search: `"{target user}" "{problem}" workflow`
3. Search: `"{target user}" tools survey {year}`
4. Extract:
   - Audience size estimates (GitHub stars, npm downloads, surveys)
   - Current workflows (step by step)
   - Where they congregate (subreddits, Discords, forums)
   - Switching triggers

### 4C — Competitive Landscape Research

**Goal**: Map the competitive landscape with concrete data.

1. Search: `"best {product category} tools" alternatives`
2. For each known competitor: `"{competitor}" review frustrations`
3. For each discovered competitor (up to 7): WebFetch homepage/README
4. Extract per competitor: what it does, strengths, weaknesses, features
5. Also search for complementary tools (allies)
6. Identify market trends and opportunities

### 4D — Feature Space Research

**Goal**: Understand features across the market — what exists, what's missing.

1. Search: `"{product category}" features comparison`
2. Search: `"{closest competitor}" features list`
3. Extract:
   - Common features (table stakes)
   - Differentiating features
   - Gaps (features users request but nobody has)
   - Anti-patterns (features that seem good but frustrate users)

### Research Output

Print a short summary to the terminal:

```
Research complete. Key findings:

Vision & problems: {1-2 sentences}
Audiences: {1-2 sentences on size and current solutions}
Landscape: Found {N} competitors/alternatives. Main gap: {gap}.
Feature space: {1-2 sentences on patterns and gaps}

Proceeding to synthesize artifacts...
```

---

## Step 5: Synthesize Draft Artifacts

Using research findings combined with existing docs, draft all artifacts.

For each artifact:
- If **missing**: write from scratch using research
- If **thin**: enrich with research findings, preserve user's existing content
- If **solid**: add new findings, flag changes for review

**If `.debussy/strategy/` artifacts already exist, enrich them — don't replace.**

Draft artifacts must be grounded in research — cite specific tools, specific
user frustrations, specific features. Avoid vague generalities.

All artifacts use the frontmatter schema defined in the Artifact Types Reference
below. Set `status: draft` on new/updated files. Preserve `status: reviewed`
on unchanged files.

---

## Step 6: Validate with User

Present findings and drafts to the user for validation. Ask a single
AskUserQuestion:

```
Here's what I found and drafted. Please review:

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

## Step 7: Write Artifacts

Create directories:

```bash
mkdir -p .debussy/strategy/competitors .debussy/strategy/allies
```

Write all artifacts using the Write tool. Each file gets YAML frontmatter
per the schema below.

---

## Refresh Mode

`/strategy --refresh {type}`

Valid targets: `vision`, `problems`, `audiences`, `landscape`, `competitors`,
`allies`, `feature-space`, `product`, or a specific slug like
`competitors/cursor`.

1. Read existing artifact(s) of that type
2. Run targeted research for that type only (the relevant subsection of Step 4)
3. Draft updated artifact(s)
4. Present diff for review via AskUserQuestion
5. Write on approval

---

## Review Mode

`/strategy --review`

### A. Build Request Manifest

Read all existing strategy artifacts from `.debussy/strategy/`. For each, extract
frontmatter (type, status, updated). **Skip artifacts with `status: reviewed`
in their frontmatter** — these were fully approved in a prior round and don't
need re-review. Build a `request.json` with the remaining artifacts:

```json
{
  "title": "Strategy Review: {product-name}",
  "project_root": "{absolute path to repo root}",
  "reviews_dir": ".debussy/strategy/.reviews",
  "artifacts": [
    {
      "slug": "vision",
      "path": ".debussy/strategy/vision.md",
      "type": "vision",
      "label": "Vision",
      "status": "draft",
      "updated": "2026-03-18"
    },
    {
      "slug": "competitors/cursor",
      "path": ".debussy/strategy/competitors/cursor.md",
      "type": "competitor",
      "label": "Cursor",
      "group": "Competitors",
      "status": "draft",
      "updated": "2026-03-18"
    }
  ]
}
```

Artifact slug rules:
- Top-level artifacts: slug = type name (e.g., `vision`, `problems`)
- Competitor/ally files: slug = `competitors/{name}` or `allies/{name}`
- Label = display name (title-cased type, or entity name for competitor/ally)
- Group = `"Competitors"` or `"Allies"` for those types; omitted for others

### B. Generate Session

```bash
SESSION_ID="strategy-$(date +%s)"
WORKSPACE=".strategy-review/$SESSION_ID"
mkdir -p "$WORKSPACE"
```

### C. Write Request File

Write the built `request.json` to `{workspace}/request.json`.

### D. Deploy Server and UI

**Templates in `templates/` are NEVER regenerated at runtime — copy them verbatim.**

Read `.claude/skills/strategy/templates/strategy-server.py` using the Read tool.
Write its content verbatim to `{workspace}/strategy-server.py` using the Write tool.

Read `.claude/skills/strategy/templates/strategy-review.html` using the Read tool.
Write its content verbatim to `{workspace}/strategy-review.html` using the Write tool.

### E. Start Server

```bash
cd "{workspace}" && python3 strategy-server.py request.json 0 >> server.log 2>&1 &
```

Wait for startup and read port:

```bash
sleep 1 && cat "{workspace}/server.port" 2>/dev/null || echo "FAILED"
```

If FAILED, print error from `{workspace}/server.log` and EXIT.

### F. Open Browser

```bash
open "http://127.0.0.1:{port}" 2>/dev/null || \
xdg-open "http://127.0.0.1:{port}" 2>/dev/null || \
echo "Open in browser: http://127.0.0.1:{port}"
```

### G. Print Status

```
STRATEGY REVIEW: {product-name}

Review UI: http://127.0.0.1:{port}
Session:   {SESSION_ID}

Waiting for your review...
(Review artifacts in the browser and click "Submit Review" when done)
```

### H. Wait for Response (Zero Token Consumption)

Run a bash command that blocks until the response file exists:

```bash
RESPONSE="{workspace}/response.json"
end=$((SECONDS + 600))
while [ ! -f "$RESPONSE" ] && [ $SECONDS -lt $end ]; do
  sleep 2
done
if [ -f "$RESPONSE" ]; then
  cat "$RESPONSE"
else
  echo "__TIMEOUT__"
fi
```

**Timeout**: 600 seconds (10 minutes). Use the Bash tool with `timeout: 610000`.

### I. Process Response

If the output is `__TIMEOUT__`:
- Print: "Review not received within 10 minutes."
- Print: "The review UI is still running. Submit when ready, then re-run `/strategy --review`."
- EXIT

Otherwise, parse the JSON response. For each artifact:

1. Read the review data (section statuses and notes)
2. If **all sections approved** (status `approved` or `done`): update artifact frontmatter `status: reviewed`
3. If **any section flagged or discuss**: keep `status: draft`, preserve notes for next refresh
4. Print summary:

```
## Strategy Review Results

**Summary:** {done_count} done, {approved_count} approved, {flagged_count} flagged, {discuss_count} discuss, {pending_count} pending

### Approved Artifacts
- {artifact label}: all sections approved

### Flagged Sections
- {artifact label} > {section name}: {notes}

### Pending
- {artifact label}: not yet reviewed
```

### I-bis. Archive Round

After processing, archive this round's review sidecar files so the next round
starts clean but can reference prior feedback:

```bash
# Determine next round number
ROUND=$(ls -d .debussy/strategy/.reviews/rounds/*/ 2>/dev/null | wc -l | tr -d ' ')
ROUND=$((ROUND + 1))
mkdir -p ".debussy/strategy/.reviews/rounds/$ROUND"
# Move current review files (not rounds/ directory) into the archive
find .debussy/strategy/.reviews -maxdepth 1 -name "*.review.json" -exec mv {} ".debussy/strategy/.reviews/rounds/$ROUND/" \;
# Also archive grouped reviews (competitors/, allies/)
for subdir in competitors allies; do
  if [ -d ".debussy/strategy/.reviews/$subdir" ]; then
    mkdir -p ".debussy/strategy/.reviews/rounds/$ROUND/$subdir"
    find ".debussy/strategy/.reviews/$subdir" -name "*.review.json" -exec mv {} ".debussy/strategy/.reviews/rounds/$ROUND/$subdir/" \;
  fi
done
```

The review UI's `/api/rounds` endpoint serves archived rounds so the next
review session can display prior feedback inline.

### J. Cleanup Server

```bash
if [ -f "{workspace}/server.pid" ]; then
  kill $(cat "{workspace}/server.pid") 2>/dev/null
  rm -f "{workspace}/server.pid" "{workspace}/server.port"
fi
```

---

## Artifact Directory Structure

```
.debussy/strategy/
  vision.md                    # Why, north star, success criteria
  problems.md                  # Named problems, severity, evidence
  audiences.md                 # User segments, sizes, workflows
  landscape.md                 # Market overview, trends, opportunity map
  feature-space.md             # Table stakes, differentiators, gaps
  product.md                   # Positioning, distribution, non-goals
  competitors/
    {slug}.md                  # One file per competitor
  allies/
    {slug}.md                  # One file per ally/complement
  .reviews/
    {slug}.review.json         # Review sidecar files (auto-generated)
```

---

## Frontmatter Schema

**Top-level artifacts** (vision, problems, audiences, landscape, feature-space, product):

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

Rules:
- `name` and `icon` are required on top-level artifacts (the UI gates on them).
- `type` and `subject` are required on competitor/ally files.
- `status` starts as `draft`. Set to `reviewed` by the review UI.
- The server logs a warning and skips any file that fails validation.

---

## Artifact Types Reference

### Vision

**File**: `.debussy/strategy/vision.md`
**Purpose**: The "why" — motivations, direction, success definition.

Key sections: `# Vision: {name}`, `## Why We're Building This`, `## North Star`,
`## Success Criteria` (3-5 observable outcomes).

See `specs/strategy-skill.md` Section 2.3 for the full template.

### Problems

**File**: `.debussy/strategy/problems.md`
**Purpose**: Named problems with severity, evidence, and workarounds.

Each problem gets a numbered section with a stable ID: `## P1: {Name}`.
Include `**Severity:**`, `**Affects:**` (audience refs), `### Evidence`,
`### Current Workarounds`. Never renumber — append new problems.

### Audiences

**File**: `.debussy/strategy/audiences.md`
**Purpose**: User segments with size estimates, workflows, and pain points.

Each segment gets a numbered section with a stable ID: `## A1: {Name}`.
Include `**Size:**`, `**Profile:**`, `### Current Workflow`,
`### Pain Points` (reference P{N}), `### Where They Congregate`,
`### Switching Trigger`.

### Landscape

**File**: `.debussy/strategy/landscape.md`
**Purpose**: High-level market map with links to competitor/ally detail files.

Key sections: `## Market Overview`, `## Competitors` (table with links to
detail files), `## Allies & Complements` (table), `## Trends`, `## Opportunities`.

### Competitor

**File**: `.debussy/strategy/competitors/{slug}.md`
**Purpose**: Deep profile of a single competitor.

Requires `subject: {slug}` in frontmatter. Key sections: `## What It Does`,
`## Strengths`, `## Weaknesses & User Frustrations`, `## Gap We Fill`,
`## Key Features` (comparison table).

### Ally

**File**: `.debussy/strategy/allies/{slug}.md`
**Purpose**: Deep profile of a complementary tool.

Requires `subject: {slug}` in frontmatter. Key sections: `## What It Does`,
`## Relationship`, `## Integration Opportunity`, `## Synergies`.

### Feature Space

**File**: `.debussy/strategy/feature-space.md`
**Purpose**: Feature map — what exists, what's missing, where we play.

Key sections: `## Table Stakes`, `## Differentiators`, `## Gaps`,
`## Anti-Patterns`, `## Our Position` (comparison table).

### Product

**File**: `.debussy/strategy/product.md`
**Purpose**: What the product is, how it's positioned, what it's not.

Key sections: `## One-Liner`, `## Positioning`, `## Target User` (reference A{N}),
`## Nature` (license, distribution, hosting, source), `## Non-Goals`,
`## Key Dependencies`.

---

## Cross-References

Artifacts reference each other using stable IDs:

| ID format | Example | Defined in |
|---|---|---|
| `P{N}` | P1, P2 | `problems.md` |
| `A{N}` | A1, A2 | `audiences.md` |
| Competitor slug | `cursor`, `gastown` | `competitors/{slug}.md` |
| Ally slug | `iikit`, `rpikit` | `allies/{slug}.md` |

Cross-references are plain text (e.g., "Affects: A1, A2" or "See P3").

---

## Error Handling

| Situation | Action |
|---|---|
| WebSearch/WebFetch unavailable | Fall back to elicitation — ask user directly; note that research was skipped |
| `gh` not available | Not needed for this skill — strategy is local-only |
| Research returns thin results | Use what's available, flag gaps in Step 6 validation |
| No existing artifacts | Normal first run — proceed with full research |
| `.debussy/strategy/` exists with content | Enrich, don't replace. Preserve user edits. |
| Empty research for a specific area | Note the gap, ask user to fill in during validation |
| Server fails to start in review mode | Print server.log content, EXIT |
| Review timeout | Print check instructions, EXIT |

---

## Integration with Roadmap

After running `/debussy:strategy`, the user can run `/debussy:roadmap` which
will read `.debussy/strategy/` artifacts as its primary input. The roadmap skill
will:

1. Read strategy artifacts to understand problems (P{N}), audiences (A{N}),
   and feature gaps
2. Produce intents with `Addresses: P{N}` and `Target audience: A{N}` cross-refs
3. Skip its own research if strategy artifacts are solid
