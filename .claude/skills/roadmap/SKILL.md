---
description: >-
  Shape a product roadmap: research the landscape, audience, and feature space,
  then synthesize vision, ecosystem map, product definition, and intents.
  Writes docs/vision.md, docs/landscape.md, docs/product.md, and specs/intents.md,
  then syncs each intent to a GitHub Issue.
  Commands: /roadmap | /roadmap --sync-issues | /roadmap --update-intent <NNN>
license: MIT
metadata:
  author: jcbianic
  version: "0.2.0"
---

# Roadmap Skill

Shape a product's roadmap from scratch or evolve an existing one. The skill
reads whatever context already exists in the repo, **actively researches** the
product space, landscape, audience, and feature patterns, then synthesizes
findings into four canonical artifact files and syncs them to GitHub Issues.

Research comes first. The user validates and course-corrects — they are not the
primary source of raw information.

**CLI remains the primary experience.** This skill runs entirely in the terminal
via Claude Code. The artifact files it produces are the source of truth; GitHub
Issues are derived from them.

## When to Activate

- User says "shape the roadmap", "update the roadmap", "plan the product"
- User invokes `/roadmap`
- User wants to add intents and sync them to GitHub

## Usage

```
/roadmap                          # Full run: research -> synthesize -> validate -> write -> sync
/roadmap --sync-issues            # Skip research, sync specs/intents.md -> GH Issues
/roadmap --update-intent <NNN>    # Re-elicit and update a single intent + its GH Issue
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If `--sync-issues` -> jump to **Sync Issues Mode**
2. If `--update-intent <NNN>` -> extract NNN, jump to **Update Intent Mode**
3. Otherwise -> **Full Run Mode**

---

## Step 2: Gather Context

Read each of the following files if they exist (use Read tool; skip silently if missing):

| File | Purpose |
|---|---|
| `README.md` | Product name, one-liner, basic description |
| `CLAUDE.md` | Project instructions, structure, next steps |
| `INTENT.md` or `PREMISE.md` | Vision, pain points, architecture decisions |
| `docs/vision.md` | Existing vision artifact |
| `docs/landscape.md` | Existing landscape artifact |
| `docs/product.md` | Existing product definition artifact |
| `specs/intents.md` | Existing intent list |
| `.claude-plugin/plugin.json` | Name, version, description, keywords |
| `package.json` | Name, description, keywords |

Also run:

```bash
git log --oneline -15
```

```bash
gh issue list --label intent --state all --json number,title,state,labels --limit 50 2>/dev/null || echo "no-gh"
```

After gathering, build an internal summary:

- **Product name** and one-liner
- **Problem domain** the product operates in (e.g., "CLI plugin for AI coding assistants")
- **Target user** segment (if known)
- **Existing pain points** (from docs/vision.md if it exists)
- **Known competitors** (from docs/landscape.md if it exists)

This summary drives the research queries in Step 4.

---

## Step 3: Assess Gaps

Determine which artifact areas are **thin or missing** and which are **solid**:

| Artifact | Solid if... | Thin if... |
|---|---|---|
| `docs/product.md` | Contains target user, nature, distribution, non-goals | Missing or lacks key sections |
| `docs/vision.md` | Contains pain points + north star + success criteria | Missing or has fewer than 2 pain points |
| `docs/landscape.md` | Contains 3+ competitor entries with strengths and gaps | Missing or has only 1-2 vague entries |
| `specs/intents.md` | Exists -- always eligible for new intents | N/A |

Flag thin/missing areas for deep research in Step 4.
Flag solid areas for validation research (lighter touch — verify, enrich, don't replace).

---

## Step 4: Research

Before asking the user anything, actively investigate the product space. Use
WebSearch and WebFetch tools.

**General approach**: formulate 2-4 search queries per research area, run them,
read the most relevant results, and compile findings. Prefer concrete data
(tool names, features, community sizes, user quotes) over generic summaries.

### 4A — Product Vision Research

**Goal**: Understand what the product could become and where the opportunity is.

1. Based on the product name and problem domain from Step 2, search for:
   - The problem space: `"{problem domain}" tools challenges`
   - Trends: `"{product category}" trends future`
   - User frustrations: `"{problem domain}" frustrations pain points`
2. For the 2-3 most relevant results, use WebFetch to read the page
3. Extract:
   - What problems do users in this space actually complain about?
   - What trends are shaping the space?
   - What opportunities are underserved?
4. Compile into a **Vision Research Brief** (internal working notes)

### 4B — Competitive Landscape Research

**Goal**: Map the competitive landscape with concrete data.

1. Search for competitors and alternatives:
   - `"best {product category} tools" OR "{product category} alternatives"`
   - `"{known competitor}" vs alternatives` (for each known competitor from Step 2)
   - `"{product category}" comparison review`
   - `"{known competitor}" frustrations OR limitations`
2. For each competitor/alternative found (up to 5-7), WebFetch their landing
   page or GitHub README
3. For each, extract:
   - What they do (one sentence)
   - What they do well (concrete features)
   - What frustrations users report
   - The gap they leave that this product fills
4. Also look for complementary tools and inspiration sources
5. Compile into a **Landscape Research Brief**

### 4C — Audience Research

**Goal**: Understand who the users are, how many there are, and how they
currently solve problems.

1. Based on the target user from Step 2, search for:
   - Community size: `"{target user segment}" community size`
   - Current workflows: `"{target user}" "{problem}" workflow how`
   - Pain points: `"{target user}" biggest challenges frustrations`
   - Discussions: look for Reddit threads, HN discussions, blog posts
2. Extract:
   - How large is the potential audience? (GitHub stars, npm downloads, surveys)
   - How do they currently solve the problem?
   - What are their top frustrations with current solutions?
   - What would make them switch?
3. Compile into an **Audience Research Brief**

### 4D — Feature Space Research

**Goal**: Understand what features exist in this space and identify patterns,
gaps, and differentiators.

1. Search for:
   - `"{product category}" features comparison`
   - `"{closest competitor}" features list`
   - `"{product category}" best practices`
2. Extract:
   - Common features across tools in this space (table stakes)
   - Differentiating features (what sets leaders apart)
   - Gaps -- features users want but nobody provides
   - Anti-patterns -- features that seem good but frustrate users
3. Compile into a **Feature Space Research Brief**

### Research Output

Print a short summary to the terminal so the user sees what was found:

```
Research complete. Key findings:

Product space: {1-2 sentences on the opportunity}
Landscape: Found {N} competitors/alternatives. Main gap: {gap}.
Audience: {1-2 sentences on audience size and current solutions}
Feature space: {1-2 sentences on patterns and gaps}

Proceeding to synthesize artifacts...
```

---

## Step 5: Synthesize Draft Artifacts

Using the research briefs from Step 4 combined with existing docs from Step 2,
draft all four artifact files.

The drafts must be **grounded in research** — cite specific tools, specific
user frustrations, specific features. Avoid vague generalities like "various
tools exist" or "users want better UX."

For artifacts that already exist and are solid, preserve the user's existing
content but enrich it with research findings (new competitors discovered, new
pain points identified, audience data).

For artifacts that are thin or missing, write them from scratch using research.

Draft all four artifacts even if some already exist — the user will validate.

---

## Step 6: Validate with User

Present findings and drafts to the user for validation. The user corrects and
fills gaps — they don't start from scratch.

Ask a single AskUserQuestion:

```
Here's what I found and drafted. Please review:

## Research Highlights
{2-4 bullet points of the most surprising or important findings}

## Draft Artifacts

### docs/product.md
{full draft}

---

### docs/vision.md
{full draft}

---

### docs/landscape.md
{full draft}

---

### specs/intents.md
{full draft -- show existing intents and any new ones suggested by research}

---

**Questions I couldn't answer from research:**
{numbered list of specific gaps}

Reply:
- "go" to write as-is and sync issues
- Corrections to revise (I'll re-draft changed sections)
- Answers to the open questions above
```

If corrections are provided, apply them and re-draft. Show only the changed
sections. Ask once more for confirmation. Do not loop more than twice.

---

## Step 7: Write Artifacts

Create `docs/` directory if needed:

```bash
mkdir -p docs specs
```

Write the four files using the Write tool:

### docs/product.md

```markdown
# Product Definition: {name}

## One-Liner
{one sentence}

## Target User
{description -- grounded in audience research}

## Nature
- **License**: {license}
- **Distribution**: {distribution method}
- **Hosting model**: {local-first / self-hosted / SaaS / etc.}
- **Source**: {open / closed / mixed}

## Non-Goals
{bulleted list}

## Key Dependencies
{bulleted list of tools/runtimes this relies on}
```

### docs/vision.md

```markdown
# Vision: {name}

## Why We're Building This
{narrative paragraph -- grounded in research on the problem space}

## Pain Points

{for each pain point:}
### {N}. {Name}
{2-3 sentence description -- reference research findings where relevant}

## What Success Looks Like
{concrete outcome in 6 months}

## North Star
{the one metric or outcome that matters most}
```

### docs/landscape.md

```markdown
# Ecosystem Map: {name}

## Competitors

| Tool | What it does | Strengths | Gap we fill |
|---|---|---|---|
{rows -- populated from landscape research}

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
{rows}

## Inspiration

| Tool | What we're learning from |
|---|---|
{rows}

## Audience Snapshot
{2-3 sentences on audience size, where they congregate, how they currently
solve the problem -- from audience research}
```

### specs/intents.md

```markdown
# {name} -- Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

{for each intent, in dependency order:}
## {NNN} -- {Name}

{description}

**Addresses:** {pain point name}
**Priority:** {now / next / later}
**Depends on:** {NNN list or "none"}
**Done when:** {observable outcome}

---
```

Intents are numbered starting at 001. Pad to three digits. Order by dependency
first, then by priority (now before next before later).

---

## Step 8: Sync GitHub Issues

### 8-Init — Ensure labels exist

Before any issue operations, ensure all required labels are present:

```bash
gh label create "intent" --color "0075ca" --description "Roadmap intent" 2>/dev/null || true
gh label create "now"    --color "e4e669" --description "Current priority" 2>/dev/null || true
gh label create "next"   --color "d4c5f9" --description "Next priority" 2>/dev/null || true
gh label create "later"  --color "c5def5" --description "Future priority" 2>/dev/null || true
```

Then for each intent in `specs/intents.md`:

### 8A — Check for existing issue

Search by title to avoid false positives from body/comment matches. Substitute
the actual three-digit intent number (e.g. `001`) into the query:

```bash
gh issue list --label "intent" --state all --search "Intent 001 in:title" --json number,title,state --limit 5
```

If the result set contains an issue whose title starts with `"Intent {NNN}"`,
that is the canonical match. Use its `number` for 8C. If the result is empty,
proceed to 8B.

### 8B — Create if missing

Before building the issue body, resolve each dependency NNN to a GitHub issue
number using the issue map fetched in Step 2 (or the Sync Issues Mode preamble).
Match each dependency NNN against `title` fields in the map to get the `number`,
then format as `#{number}`.

Validate that `{priority}` is exactly one of `now`, `next`, or `later`. If it is
not, print a warning (`Warning: intent {NNN} has invalid priority "{priority}"
-- skipping label`) and omit the priority label from the create command.

```bash
gh issue create \
  --title "Intent {NNN} -- {Name}" \
  --label "intent" \
  --label "{priority}" \
  --body "$(cat <<'BODY'
## {description}

**Addresses:** {pain point}
**Priority:** {now / next / later}
**Depends on:** {resolved #issue-number links, or "none"}

## Done When

{done-when criteria}

---
*Generated by `/debussy:roadmap`. Edit `specs/intents.md` and re-run `--sync-issues` to update.*
BODY
)"
```

### 8C — Keep issue body in sync

Issues are derived from `specs/intents.md` -- the markdown file is the source
of truth. If the issue exists (open or closed), unconditionally update its body
to match the current intent description. This is intentional: manual edits to
the issue body will be overwritten. To persist changes, edit `specs/intents.md`
instead.

```bash
gh issue edit {number} --body "..."
```

Do not close or reopen issues -- leave state management to the user.

### 8D — Print summary

After syncing all intents, print the appropriate summary for the current mode:

**Full Run Mode:**

```
ROADMAP SYNCED

Artifacts written:
  docs/product.md
  docs/vision.md
  docs/landscape.md
  specs/intents.md

GitHub Issues:
  {for each intent: Intent NNN -- Name -> #<gh-issue-number> (created / updated)}

Run /roadmap --sync-issues to re-sync issues after editing specs/intents.md.
```

**Sync Issues Mode** (no artifacts written -- omit the "Artifacts written" block):

```
ROADMAP SYNCED

GitHub Issues:
  {for each intent: Intent NNN -- Name -> #<gh-issue-number> (created / updated)}

Run /roadmap --sync-issues to re-sync issues after editing specs/intents.md.
```

---

## Sync Issues Mode

Skip Steps 2-7.

1. Read `specs/intents.md` (required -- if missing, print error and suggest running full `/roadmap` first, then EXIT).
2. Fetch the existing issue map (needed for dependency `#number` links in 8B):

```bash
gh issue list --label intent --state all --json number,title,state,labels --limit 50 2>/dev/null || echo "no-gh"
```

3. Proceed to Steps 8-Init, 8A, 8B, and 8C for each intent. For 8D, use the **Sync Issues Mode** summary variant (no "Artifacts written" block).

---

## Update Intent Mode

1. Read `specs/intents.md`. Find intent `{NNN}`.
2. Fetch the existing issue map (needed for dependency `#number` links in 8B):

```bash
gh issue list --label intent --state all --json number,title,state,labels --limit 50 2>/dev/null || echo "no-gh"
```

3. Print current intent content.
4. Ask AskUserQuestion: "Here is intent {NNN}. What would you like to change?"
5. Apply changes.
6. Write updated `specs/intents.md`.
7. Sync only intent {NNN} to its GitHub Issue (create if missing, update if exists).
8. Print:

```
Intent {NNN} -- {Name} updated.
  specs/intents.md written.
  GitHub Issue -> #{gh-issue-number} (created / updated)
```

---

## Artifact Format Rules

- `docs/` files use plain prose + tables. No frontmatter. No TODOs.
- `specs/intents.md` is the only file with numbered headers (`## NNN -- Name`).
- Intent numbers are three-digit, zero-padded: `001`, `002`, etc.
- Never renumber existing intents -- only append new ones or update existing ones.
- Dependency references in intents use the NNN format, not issue numbers.
- `docs/landscape.md` includes an **Audience Snapshot** section grounded in research.

---

## Error Handling

| Situation | Action |
|---|---|
| `gh` not available | Write artifacts but skip issue sync; print manual gh commands |
| No git remote configured | Skip issue sync; warn user |
| GitHub auth error | Print auth error, suggest `gh auth login`, skip sync |
| `specs/intents.md` missing in --sync-issues mode | Print error, suggest running full `/roadmap` first |
| WebSearch/WebFetch unavailable or failing | Fall back to elicitation-based flow (ask user directly); note in terminal that research was skipped |
| Research returns thin results | Use what's available, flag gaps in Step 6 validation; ask user to fill in |
| User provides no intents in validation | Ask once more; if still empty, write placeholder intent and warn |
