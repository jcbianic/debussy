---
description: >-
  Define the product and shape the roadmap. Consumes strategy artifacts,
  synthesizes product definition and intents, and syncs each intent to a
  GitHub Issue.
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Product Skill

Define what we build and plan the roadmap. This skill consumes strategy
artifacts produced by `/debussy:strategy` as its primary input. It does NOT do
its own research -- that is the strategy skill's job.

**CLI remains the primary experience.** This skill runs entirely in the terminal
via Claude Code. The artifact files it produces are the source of truth; GitHub
Issues are derived from them.

## When to Activate

- User says "define the product", "shape the roadmap", "plan the product"
- User invokes `/product`
- User wants to add intents and sync them to GitHub

## Usage

```
/product                          # Full run: synthesize -> validate -> write -> sync
/product --sync-issues            # Skip synthesis, sync .debussy/product/intents.md -> GH Issues
/product --update-intent <NNN>    # Re-elicit and update a single intent + its GH Issue
/product --review                 # Review product artifacts in the Debussy UI Inbox
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. If `--sync-issues` -> jump to **Sync Issues Mode**
2. If `--update-intent <NNN>` -> extract NNN, jump to **Update Intent Mode**
3. If `--review` -> jump to **Review Mode**
4. Otherwise -> **Full Run Mode**

---

## Step 2: Gather Context

Read each of the following files if they exist (use Read tool; skip silently if missing):

| File | Purpose |
|---|---|
| `.debussy/strategy/pitch.md` | **Pitch depth** -- combined vision + audience + problems |
| `.debussy/strategy/vision.md` | Vision (Foundation/Full) |
| `.debussy/strategy/problem-space.md` | **Foundation depth** -- audiences AND problems interleaved |
| `.debussy/strategy/audiences.md` | **Full depth** -- standalone audience segments |
| `.debussy/strategy/problems.md` | **Full depth** -- standalone problems with evidence |
| `.debussy/strategy/strategy.md` | **Full depth** -- strategic choices (where to play, how to win) |
| `.debussy/strategy/landscape.md` | Market overview (Foundation/Full) |
| `.debussy/strategy/competitors/*.md` | Individual competitor profiles (Full) |
| `.debussy/strategy/allies/*.md` | Individual ally profiles (Full) |
| `.debussy/strategy/opportunities.md` | Opportunity map (Full) |
| `.debussy/product/product.md` | Existing product definition |
| `.debussy/product/intents.md` | Existing intent list |
| `README.md` | Product name, one-liner, basic description |
| `CLAUDE.md` | Project instructions, structure, next steps |
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
- **Problem domain** the product operates in
- **Target user** segment (from strategy artifacts)
- **Existing pain points** -- from `problems.md` (Full), `problem-space.md` (Foundation), or `pitch.md` (Pitch)
- **Known competitors** -- from `competitors/*.md` (Full), `landscape.md`, or strategy artifacts
- **Audiences** -- from `audiences.md` (Full), `problem-space.md` (Foundation), or `pitch.md` (Pitch)
- **Strategy depth** -- detected from files: pitch (1 file), foundation (3 files), full (7+ files)

---

## Step 3: Assess Inputs

**Strategy depth detection**: Scan `.debussy/strategy/` to determine the depth level:

| Detected depth | Condition | Action |
|---|---|---|
| **Full** | `audiences.md` + `problems.md` exist | Use as primary input |
| **Foundation** | `problem-space.md` exists | Use as primary input -- extract P{N}/A{N} from combined doc |
| **Pitch** | `pitch.md` exists | Use as primary input -- extract P{N}/A{N} from single doc |
| **None** | No strategy files | Suggest `/debussy:strategy` first, then EXIT |

If strategy artifacts exist at any depth, print:
"Using strategy artifacts from .debussy/strategy/ ({depth} depth)."

If none exist:
"No strategy artifacts found. Run `/debussy:strategy` first to build them."
Then EXIT.

---

## Step 4: Synthesize Draft Artifacts

Using strategy artifacts as the primary source, draft product artifacts.

The drafts must be **grounded in strategy artifacts** -- reference specific
problems (P{N}), audiences (A{N}), competitors, and opportunities.

### .debussy/product/product.md

```markdown
---
name: Product
icon: i-heroicons-cube
status: draft
---
# Product: {name}

## One-Liner
{one sentence}

## Positioning
{How the product is positioned relative to alternatives -- reference landscape}

## Target User
{Reference A{N} from strategy artifacts}

## Nature
- **License**: {license}
- **Distribution**: {distribution method}
- **Source**: {open / closed}

## Non-Goals
{Bulleted list}

## Key Dependencies
{Bulleted list of tools/runtimes this relies on}
```

### .debussy/product/intents.md

```markdown
---
name: Intents
icon: i-heroicons-flag
status: draft
---
# {name} -- Intents

Intents are ordered implementation milestones. Each builds on the previous.

---

## {NNN} -- {Name}

{description}

**Addresses:** P{N}: {problem name}
**Target audience:** A{N}: {audience name}
**Priority:** {now / next / later}
**Depends on:** {NNN list or "none"}
**Done when:** {observable outcome}

---
```

Intents are numbered starting at 001. Pad to three digits. Order by dependency
first, then by priority (now before next before later).

For existing product artifacts, preserve user content but enrich with strategy
findings. For missing artifacts, write them from scratch.

---

## Step 5: Validate with User

Present drafts to the user for validation. Ask a single AskUserQuestion:

```
Here's the product definition and roadmap based on your strategy artifacts.

## Draft Artifacts

### .debussy/product/product.md
{full draft}

---

### .debussy/product/intents.md
{full draft -- show existing intents and any new ones}

---

**Questions I couldn't resolve from strategy artifacts:**
{numbered list of specific gaps}

Reply:
- "go" to write as-is and sync issues
- Corrections to revise (I'll re-draft changed sections)
- Answers to the open questions above
- "review" to review in the Debussy UI Inbox
```

If the user replies "review", follow the **Review via Inbox** flow below, then
resume at Step 6.

If corrections are provided, apply them and re-draft. Show only the changed
sections. Ask once more for confirmation. Do not loop more than twice.

### Review via Inbox

When the user asks for review (either via "review" reply in Step 5 or via
`/product --review` which jumps here after writing draft artifacts):

1. **Parse sections** from both draft artifacts (`product.md` and `intents.md`).
   Split each file on `## ` headings. Each section becomes a review item.
   Section ID = artifact slug + "/" + slugified heading (e.g., `product/positioning`,
   `intents/001-intent-name`). Slugify: lowercase, remove non-alphanumeric chars
   except spaces/dashes, replace spaces with dashes, collapse multiple dashes.

2. **Write inbox request.** Generate session ID: `product-{unix-timestamp}`.
   Create `.debussy/inbox/{session-id}/request.json`:

   ```json
   {
     "session_id": "product-{timestamp}",
     "source": "product",
     "title": "Product Review: {product-name}",
     "icon": "i-heroicons-cube",
     "created_at": "{ISO 8601 timestamp}",
     "items": [
       {
         "id": "product/positioning",
         "title": "Positioning",
         "subtitle": "Product Definition",
         "content": "## Positioning\n\n(full section markdown)"
       },
       {
         "id": "intents/001-feature-name",
         "title": "001 -- Feature Name",
         "subtitle": "Intents",
         "content": "## 001 -- Feature Name\n\n(full section markdown)"
       }
     ]
   }
   ```

3. **Wait for response.** Print:

   > Review items are ready in the Debussy UI Inbox. Open http://localhost:{port}/inbox to review.

   Where `{port}` is read from `.debussy/.port` (default 4321 if missing).

   Wait for `response.json`:

   ```bash
   RESPONSE=".debussy/inbox/{session-id}/response.json"
   while [ ! -f "$RESPONSE" ]; do sleep 1; done
   cat "$RESPONSE"
   ```

   Timeout: 600 seconds.

4. **Process response.** Read `response.json`. For items with
   `action: "changes-requested"`, apply the comment as feedback and re-draft
   those sections. For items with `action: "rejected"`, remove them from the
   draft. For items with `action: "approved"`, keep as-is.

5. **Update frontmatter status.** For each artifact (`product.md`,
   `intents.md`), check whether ALL of its sections were approved. If so,
   set `status: reviewed` in the artifact's YAML frontmatter. If any section
   was changed or rejected, keep `status: draft`.

6. **Cleanup.** Delete `.debussy/inbox/{session-id}/`. Resume at Step 6.

---

## Step 6: Write Artifacts

Create directories as needed:

```bash
mkdir -p .debussy/product
```

Write the artifact files using the Write tool.

---

## Step 7: Sync GitHub Issues

### 7-Init -- Ensure labels exist

```bash
gh label create "intent" --color "0075ca" --description "Roadmap intent" 2>/dev/null || true
gh label create "now"    --color "e4e669" --description "Current priority" 2>/dev/null || true
gh label create "next"   --color "d4c5f9" --description "Next priority" 2>/dev/null || true
gh label create "later"  --color "c5def5" --description "Future priority" 2>/dev/null || true
```

Then for each intent in `.debussy/product/intents.md`:

### 7A -- Check for existing issue

```bash
gh issue list --label "intent" --state all --search "Intent 001 in:title" --json number,title,state --limit 5
```

If the result contains an issue whose title starts with `"Intent {NNN}"`,
that is the canonical match. Use its `number` for 7C.

### 7B -- Create if missing

Resolve each dependency NNN to a GitHub issue number. Validate priority is
exactly one of `now`, `next`, or `later`.

```bash
gh issue create \
  --title "Intent {NNN} -- {Name}" \
  --label "intent" \
  --label "{priority}" \
  --body "$(cat <<'BODY'
## {description}

**Addresses:** P{N}: {problem name}
**Target audience:** A{N}: {audience name}
**Priority:** {now / next / later}
**Depends on:** {resolved #issue-number links, or "none"}

## Done When

{done-when criteria}

---
*Generated by `/debussy:product`. Edit `.debussy/product/intents.md` and re-run `--sync-issues` to update.*
BODY
)"
```

### 7C -- Keep issue body in sync

Issues are derived from `.debussy/product/intents.md` -- the markdown file is
the source of truth. If the issue exists (open or closed), unconditionally
update its body to match the current intent description.

```bash
gh issue edit {number} --body "..."
```

Do not close or reopen issues -- leave state management to the user.

### 7D -- Print summary

**Full Run Mode:**

```
PRODUCT SYNCED

Artifacts written:
  .debussy/product/product.md
  .debussy/product/intents.md

GitHub Issues:
  {for each intent: Intent NNN -- Name -> #<gh-issue-number> (created / updated)}

Run /product --sync-issues to re-sync issues after editing .debussy/product/intents.md.
```

**Sync Issues Mode:**

```
PRODUCT SYNCED

GitHub Issues:
  {for each intent: Intent NNN -- Name -> #<gh-issue-number> (created / updated)}

Run /product --sync-issues to re-sync issues after editing .debussy/product/intents.md.
```

---

## Sync Issues Mode

Skip Steps 2-6.

1. Read `.debussy/product/intents.md` (required -- if missing, print error and suggest running full `/product` first, then EXIT).
2. Fetch the existing issue map:

```bash
gh issue list --label intent --state all --json number,title,state,labels --limit 50 2>/dev/null || echo "no-gh"
```

3. Proceed to Steps 7-Init, 7A, 7B, and 7C for each intent.

---

## Update Intent Mode

1. Read `.debussy/product/intents.md`. Find intent `{NNN}`.
2. Fetch the existing issue map.
3. Print current intent content.
4. Ask AskUserQuestion: "Here is intent {NNN}. What would you like to change?"
5. Apply changes.
6. Write updated `.debussy/product/intents.md`.
7. Sync only intent {NNN} to its GitHub Issue.
8. Print:

```
Intent {NNN} -- {Name} updated.
  .debussy/product/intents.md written.
  GitHub Issue -> #{gh-issue-number} (created / updated)
```

---

## Review Mode

`/product --review`

Review existing product artifacts in the Debussy UI Inbox. Requires that
`.debussy/product/product.md` and/or `.debussy/product/intents.md` exist.
If neither exists, print an error and suggest running full `/product` first,
then EXIT.

1. Read existing product artifacts from `.debussy/product/`. Skip artifacts
   with `status: reviewed` in their frontmatter.
2. Follow the **Review via Inbox** flow from Step 5 (parse sections, write
   inbox request, wait for response, process response, cleanup).
3. Update frontmatter `status: reviewed` on artifacts where ALL sections were
   approved.

---

## Artifact Format Rules

- `.debussy/product/product.md` has YAML frontmatter with `name`, `icon`, `status`.
- `.debussy/product/intents.md` uses numbered headers (`## NNN -- Name`).
- Intent numbers are three-digit, zero-padded: `001`, `002`, etc.
- Never renumber existing intents -- only append new ones or update existing ones.
- Dependency references in intents use the NNN format, not issue numbers.

---

## Cross-References

Artifacts reference strategy documents using stable IDs:

| ID format | Example | Defined in |
|---|---|---|
| `P{N}` | P1, P2 | `problems.md` or `problem-space.md` or `pitch.md` |
| `A{N}` | A1, A2 | `audiences.md` or `problem-space.md` or `pitch.md` |
| `SI-{N}` | SI-1, SI-2 | `strategy.md` (full only) |

Cross-references are plain text (e.g., "Affects: A1, A2" or "See P3").

---

## Error Handling

| Situation | Action |
|---|---|
| No strategy artifacts | Print error, suggest `/debussy:strategy`, EXIT |
| `gh` not available | Write artifacts but skip issue sync; print manual gh commands |
| No git remote configured | Skip issue sync; warn user |
| GitHub auth error | Print auth error, suggest `gh auth login`, skip sync |
| `.debussy/product/intents.md` missing in --sync-issues mode | Print error, suggest running full `/product` first |
| User provides no intents in validation | Ask once more; if still empty, write placeholder intent and warn |
