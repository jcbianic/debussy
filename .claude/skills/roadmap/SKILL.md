---
name: roadmap
description: >-
  Shape a product roadmap: elicit vision, ecosystem, and intents from existing
  docs and targeted questions, write docs/vision.md, docs/landscape.md,
  docs/product.md, and specs/intents.md, then sync each intent to a GitHub
  Issue. Commands: /roadmap | /roadmap --sync-issues | /roadmap --update-intent <NNN>
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Roadmap Skill

Shape a product's roadmap from scratch or update an existing one. The skill
reads whatever context already exists in the repo, asks targeted questions only
for what's missing, writes four canonical artifact files, and creates one GitHub
Issue per intent.

**CLI remains the primary experience.** This skill runs entirely in the terminal
via Claude Code. The artifact files it produces are the source of truth; GitHub
Issues are derived from them.

## When to Activate

- User says "shape the roadmap", "update the roadmap", "plan the product"
- User invokes `/roadmap`
- User wants to add intents and sync them to GitHub

## Usage

```
/roadmap                          # Full run: elicit → write artifacts → sync issues
/roadmap --sync-issues            # Skip elicitation, sync specs/intents.md → GH Issues
/roadmap --update-intent <NNN>    # Re-elicit and update a single intent + its GH Issue
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If `--sync-issues` → jump to **Sync Issues Mode**
2. If `--update-intent <NNN>` → extract NNN, jump to **Update Intent Mode**
3. Otherwise → **Full Run Mode**

---

## Step 2: Gather Context

Read each of the following files if they exist (use Read tool; skip silently if missing):

| File | Purpose |
|---|---|
| `README.md` | Product name, one-liner, basic description |
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

---

## Step 3: Assess Gaps

After reading context, determine which of the four artifact areas need input:

| Artifact | Already covered if… |
|---|---|
| `docs/product.md` | File exists AND contains target user, nature, distribution |
| `docs/vision.md` | File exists AND contains pain points + north star |
| `docs/landscape.md` | File exists AND contains at least one competitor entry |
| `specs/intents.md` | File exists — always re-elicit for new intents |

Note which areas are missing or thin. Proceed to Step 4.

---

## Step 4: Elicit Missing Information

For each missing area, ask one AskUserQuestion per area (batch where possible).
Skip any area already covered by existing docs.

### 4A — Product Definition (skip if docs/product.md is complete)

Ask:

```
What is {product-name}?

Please answer the following (paste or fill in):

1. One-liner: what does it do in one sentence?
2. Target user: who is this for? (role, context, skill level)
3. Nature: OSS / closed source / commercial / mixed?
4. License: MIT / Apache / proprietary / etc?
5. Distribution: how do users get it? (npm, brew, plugin, SaaS, etc.)
6. Non-goals: what is it explicitly NOT? (list 2–4 items)
```

### 4B — Vision (skip if docs/vision.md is complete)

Ask:

```
What pain points does {product-name} solve?

Please answer:

1. List the core pain points (numbered, named, 1–2 sentences each)
2. What does success look like in 6 months? (concrete outcome, not vague)
3. North star: if you had to pick one metric to optimize for, what is it?
```

### 4C — Landscape (skip if docs/landscape.md is complete)

Ask:

```
What is the ecosystem around {product-name}?

Please answer:

1. Competitors: tools that solve the same problem (name + what they do well + the gap they leave)
2. Allies / complements: tools you want to integrate with or that complement your approach
3. Inspiration: tools whose UX, architecture, or philosophy you're learning from
```

### 4D — Intents (always ask)

Ask:

```
What are the intents (chunks of work) for {product-name}?

For each intent, provide:
- Short name (2–5 words)
- What it does (2–3 sentences)
- Which pain point it addresses
- Done-when criteria (observable outcome)
- Priority: now / next / later
- Dependencies: which other intents must be done first (if any)

You can provide a rough list — I'll structure them.

(Existing intents from specs/intents.md will be shown for reference if they exist.)
```

Read `specs/intents.md` if it exists and prepend its current contents to the question so the user can edit in-place.

---

## Step 5: Draft and Confirm

Synthesize everything gathered (existing docs + elicited answers) into drafts of
the four artifact files. Print the full draft of each to the terminal.

Then ask a single AskUserQuestion:

```
Here are the four artifacts I'll write:

[prints docs/vision.md draft]
---
[prints docs/landscape.md draft]
---
[prints docs/product.md draft]
---
[prints specs/intents.md draft]

Does this look right?
- Reply "yes" or "go" to write and sync issues.
- Reply with corrections to revise before writing.
```

If corrections are provided, apply them and re-draft. Show only the changed
sections. Ask once more for confirmation. Do not loop more than twice. If corrections are still unresolved after two rounds, write the last draft as-is and note the open questions in a comment at the top of the relevant artifact file.

---

## Step 6: Write Artifacts

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
{description}

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
{narrative paragraph}

## Pain Points

{for each pain point:}
### {N}. {Name}
{2–3 sentence description}

## What Success Looks Like
{concrete outcome in 6 months}

## North Star
{the one metric or outcome that matters most}
```

### docs/landscape.md

```markdown
# Ecosystem Map: {name}

## Competitors

| Tool | Strengths | Gap we fill |
|---|---|---|
{rows}

## Allies & Complements

| Tool | Relationship | Integration opportunity |
|---|---|---|
{rows}

## Inspiration

| Tool | What we're learning from |
|---|---|
{rows}
```

### specs/intents.md

```markdown
# {name} — Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

{for each intent, in dependency order:}
## {NNN} — {Name}

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

## Step 7: Sync GitHub Issues

### 7-Init — Ensure labels exist

Before any issue operations, ensure all required labels are present:

```bash
gh label create "intent" --color "0075ca" --description "Roadmap intent" 2>/dev/null || true
gh label create "now"    --color "e4e669" --description "Current priority" 2>/dev/null || true
gh label create "next"   --color "d4c5f9" --description "Next priority" 2>/dev/null || true
gh label create "later"  --color "c5def5" --description "Future priority" 2>/dev/null || true
```

Then for each intent in `specs/intents.md`:

### 7A — Check for existing issue

Search by title to avoid false positives from body/comment matches:

```bash
gh issue list --label "intent" --state all --search "Intent {NNN} in:title" --json number,title,state --limit 5
```

If the result set contains an issue whose title starts with `"Intent {NNN}"`, that is the canonical match. Use its `number` for 7C. If the result is empty, proceed to 7B.

### 7B — Create if missing

Before building the issue body, resolve each dependency NNN to a GitHub issue number using the
issue map fetched in Step 2 (or the Sync Issues Mode preamble). Match each dependency NNN
against `title` fields in the map to get the `number`, then format as `#{number}`.

```bash
gh issue create \
  --title "Intent {NNN} — {Name}" \
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

### 7C — Keep issue body in sync

Issues are derived from `specs/intents.md` — the markdown file is the source of truth.
If the issue exists (open or closed), unconditionally update its body to match the current
intent description. This is intentional: manual edits to the issue body will be overwritten.
To persist changes, edit `specs/intents.md` instead.

```bash
gh issue edit {number} --body "..."
```

Do not close or reopen issues — leave state management to the user.

### 7D — Print summary

After syncing all intents, print:

```
╔══════════════════════════════════════════════════════╗
║  ROADMAP SYNCED                                      ║
╚══════════════════════════════════════════════════════╝

Artifacts written:
  docs/product.md
  docs/vision.md
  docs/landscape.md
  specs/intents.md

GitHub Issues:
  {for each intent: Intent NNN — Name → #<gh-issue-number> (created / updated / already existed)}

Run /roadmap --sync-issues to re-sync issues after editing specs/intents.md.
```

---

## Sync Issues Mode

Skip Steps 2–6.

1. Read `specs/intents.md` (required — if missing, print error and suggest running full `/roadmap` first, then EXIT).
2. Fetch the existing issue map (needed for dependency `#number` links in 7B):

```bash
gh issue list --label intent --state all --json number,title,state,labels --limit 50 2>/dev/null || echo "no-gh"
```

3. Proceed to Step 7.

---

## Update Intent Mode

1. Read `specs/intents.md`. Find intent `{NNN}`.
2. Fetch the existing issue map (needed for dependency `#number` links in 7B):

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
Intent {NNN} — {Name} updated.
  specs/intents.md written.
  GitHub Issue → #{gh-issue-number} (created / updated)
```

---

## Artifact Format Rules

- `docs/` files use plain prose + tables. No frontmatter. No TODOs.
- `specs/intents.md` is the only file with numbered headers (`## NNN — Name`).
- Intent numbers are three-digit, zero-padded: `001`, `002`, etc.
- Never renumber existing intents — only append new ones or update existing ones.
- Dependency references in intents use the NNN format, not issue numbers.

---

## Error Handling

| Situation | Action |
|---|---|
| `gh` not available | Write artifacts but skip issue sync; print manual gh commands |
| No git remote configured | Skip issue sync; warn user |
| GitHub auth error | Print auth error, suggest `gh auth login`, skip sync |
| `specs/intents.md` missing in --sync-issues mode | Print error, suggest running full `/roadmap` first |
| User provides no intents in elicitation | Ask once more; if still empty, write placeholder intent and warn |
