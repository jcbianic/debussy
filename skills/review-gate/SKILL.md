---
description: >-
  Reusable review gate: scan artifacts, send to Debussy UI Inbox, wait for
  user decisions, and return results. Called by other skills to route drafts
  through the review UI.
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Review Gate Skill

Generic review gate that sends artifacts to the Debussy UI Inbox for user
review. Any skill that produces draft artifacts can delegate to this skill
instead of implementing the inbox flow itself.

## When to Activate

- Another skill needs to send artifacts for user review via the Inbox
- User invokes `/review-gate` directly with artifact globs

## Usage

```
/review-gate --source engineering --title "Engineering Review" --icon i-heroicons-cog-6-tooth --sidecars .debussy/policies/*.md .debussy/decisions/*.md
/review-gate --source strategy --title "Strategy Review" --icon i-heroicons-adjustments-horizontal --sidecars .debussy/strategy/*.md
/review-gate --source product --title "Product Review" .debussy/product/*.md
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

- `--source {id}` (required): Source identifier (e.g., `engineering`, `strategy`, `product`)
- `--title {text}` (required): Display title for the review session
- `--icon {icon}` (optional): Heroicons icon identifier. Default: `i-heroicons-document-check`
- `--sidecars` (optional flag): Write `.review.json` sidecar files and archive previous rounds
- Remaining positional arguments: file glob patterns to scan

If `--source` or `--title` is missing, ask the user via AskUserQuestion.

---

## Step 2: Scan Artifacts

Expand all glob patterns using bash:

```bash
ls {glob1} {glob2} ... 2>/dev/null
```

For each file found:

1. Read the file and extract YAML frontmatter
2. **Skip** files with `status: reviewed` in frontmatter -- already approved
3. Derive the artifact slug from the file path:
   - Strip the project root
   - Remove file extension
   - Use the meaningful relative path as slug
   - Examples: `.debussy/policies/testing.md` -> `policies/testing`,
     `.debussy/decisions/001-initial.md` -> `decisions/001-initial`,
     `.debussy/strategy/vision.md` -> `strategy/vision`,
     `.debussy/strategy/competitors/notion.md` -> `strategy/competitors/notion`
4. Derive the artifact label:
   - Use frontmatter `name` field if present
   - Otherwise title-case the filename stem (e.g., `testing` -> `Testing`)

If no artifacts are found (all reviewed or globs match nothing), print:

> No artifacts to review. All items are already reviewed or no files match the provided globs.

Stop here.

---

## Step 3: Parse Sections

For each artifact, read the markdown content (after frontmatter) and split on
`## ` headings. Each section becomes a review item.

- If the file has introductory text before the first `## ` heading, create an
  "Introduction" item for that text
- Section ID = `{artifact-slug}/{slugified-heading}`
- Slugify headings: lowercase, remove non-alphanumeric chars except spaces and
  dashes, replace spaces with dashes, collapse multiple consecutive dashes
- Examples: `policies/testing/unit-tests`, `strategy/vision/introduction`,
  `decisions/001-initial/context`

---

## Step 4: Derive Subtitles

For each item, derive the subtitle from the artifact's context. Use a
convention based on the parent directory:

| Parent directory pattern | Subtitle format | Example |
|---|---|---|
| `.debussy/policies/` | `Policy: {label}` | `Policy: Testing` |
| `.debussy/architecture/` | `Architecture: {label}` | `Architecture: Principles` |
| `.debussy/decisions/` | `ADR: {label}` | `ADR: 001 Initial Decision` |
| `.debussy/strategy/` | `Strategy: {label}` | `Strategy: Vision` |
| `.debussy/strategy/competitors/` | `Competitor: {label}` | `Competitor: Notion` |
| `.debussy/strategy/allies/` | `Ally: {label}` | `Ally: Claude Code` |
| `.debussy/product/` | `Product: {label}` | `Product: Definition` |
| Other | `{Parent}: {label}` | `Config: Settings` |

---

## Step 5: Write Review

Generate a review ID: `{source}-{unix-timestamp}`.

Create the directory `.debussy/reviews/{review-id}/` and the subdirectory
`.debussy/reviews/{review-id}/items/`.

Write `review.json` (review metadata):

```json
{
  "id": "{source}-{timestamp}",
  "title": "{title}",
  "icon": "{icon}",
  "source": "{source}",
  "type": "{source}",
  "createdAt": "{ISO 8601 timestamp}"
}
```

For each review item, write `.debussy/reviews/{review-id}/items/{item-id}.json`:

```json
{
  "id": "policies/testing/unit-tests",
  "title": "Unit Tests",
  "subtitle": "Policy: Testing",
  "iterations": [
    {
      "number": 1,
      "proposedAt": "{ISO 8601 timestamp}",
      "content": "## Unit Tests\n\n- **Isolation** -- each test...\n\n(full section markdown)"
    }
  ]
}
```

**Important**: Item IDs containing `/` must be sanitized for use as filenames.
Replace `/` with `--` in the filename (e.g., `policies/testing/unit-tests`
becomes `policies--testing--unit-tests.json`). The `id` field inside the JSON
keeps the original value with `/`.

---

## Step 6: Wait for User Review

The user reviews in the Debussy UI Inbox at `localhost:4321/inbox`.

Print a message:

> Review items are ready in the Debussy UI Inbox. Open http://localhost:4321/inbox to review.

Wait for the response file using bash filewatch:

```bash
RESPONSE=".debussy/reviews/{review-id}/response.json"
TIMEOUT=600
ELAPSED=0
while [ ! -f "$RESPONSE" ] && [ $ELAPSED -lt $TIMEOUT ]; do
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
if [ -f "$RESPONSE" ]; then
  cat "$RESPONSE"
else
  echo "TIMEOUT"
fi
```

If timeout is reached, print:

> Review timed out after 10 minutes. Run the review-gate again when ready.

Stop here.

---

## Step 7: Process Response

Read `response.json`. Expected format:

```json
{
  "submitted_at": "...",
  "review_id": "{source}-{timestamp}",
  "decisions": {
    "policies/testing/unit-tests": { "action": "approved", "comment": "" },
    "decisions/001-initial/context": { "action": "changes-requested", "comment": "Add more detail" }
  },
  "summary": { "total": 8, "approved": 6, "changes_requested": 1, "rejected": 1 }
}
```

Map each decision to an internal status:

| UI action | Internal status |
|---|---|
| `approved` | `done` |
| `changes-requested` | `discuss` |
| `rejected` | `flagged` |

Group decisions by artifact slug (the part before the last `/section`).

For each artifact, determine its overall status:
- **All sections approved** -> artifact fully approved
- **Any section changes-requested or rejected** -> artifact needs revision

Update frontmatter `status: reviewed` on artifacts where ALL sections were
approved.

---

## Step 8: Write Sidecars (if `--sidecars`)

**Skip this step if `--sidecars` was not passed.**

### Archive Previous Rounds

If prior review files exist in `.debussy/{source}/.reviews/`, move them to
`.debussy/{source}/.reviews/rounds/{N+1}/` (where N is the highest existing
round number, or 0 if none).

### Write Review Files

For each artifact, write `.debussy/{source}/.reviews/{artifact-slug}.review.json`:

```json
{
  "sections": {
    "unit-tests": { "status": "done", "notes": "" },
    "integration-tests": { "status": "discuss", "notes": "Too strict for current stage" }
  }
}
```

Use the internal status mapping from Step 7. The `notes` field contains the
user's comment (empty string if none).

---

## Step 9: Cleanup and Summary

Delete the review directory:

```bash
rm -rf .debussy/reviews/{review-id}
```

Print a structured summary:

```
## Review Complete

**{approved}** approved, **{changes_requested}** changes requested, **{rejected}** rejected (out of {total})

### Changes Requested
- `{item-id}`: {comment}
- `{item-id}`: {comment}

### Rejected
- `{item-id}`: {comment}
```

The calling skill can read this summary to decide what revisions to make.

---

## Error Handling

| Situation | Action |
|---|---|
| No files match globs | Print message and stop |
| All artifacts already reviewed | Print message and stop |
| Response timeout | Print message and stop |
| Review directory already exists | Append timestamp suffix to avoid collision |
| Missing frontmatter in artifact | Treat as `status: draft` (include in review) |
