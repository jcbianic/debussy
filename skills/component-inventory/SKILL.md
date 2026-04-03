---
description: >-
  Scan all Vue components and composables, build a persistent health inventory
  and automatically review all items recording violations without human
  intervention.
license: MIT
metadata:
  author: jcbianic
  version: "0.2.0"
---

# Component Inventory Skill

Maintain a persistent health registry for every component and composable in `ui/`.
The registry lives at `.debussy/component-inventory.json` and survives across sessions.

## When to Activate

- User invokes `/component-inventory`
- User says "scan all components", "what components need review", "show component health"
- User asks "which composables are untested" or "browse next component to fix"

## Usage

```
/component-inventory            # Same as --status
/component-inventory --scan     # Discover all files, update registry
/component-inventory --browse   # Auto-review ALL pending items, no prompts
/component-inventory --browse <path>  # Auto-review a specific file only
/component-inventory --status   # Show health dashboard
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`:

1. Empty or `--status` → jump to **Status Mode**
2. `--scan` → jump to **Scan Mode**
3. `--browse` with no path → jump to **Browse Mode** (next pending)
4. `--browse <path>` → jump to **Browse Mode** (specific file)

---

## Step 2: Load the Registry

Read `.debussy/component-inventory.json` if it exists.

Registry shape:

```json
{
  "lastScanned": "<ISO timestamp or null>",
  "items": {
    "ui/components/SegmentedControl.vue": {
      "tier": 3,
      "status": "healthy",
      "lastReviewed": "2026-03-21",
      "violations": [],
      "testStatus": "untested",
      "notes": ""
    }
  }
}
```

**Status values**: `pending` | `healthy` | `has-violations` | `skipped`
**Test status values**: `untested` | `partial` | `covered`
**Tier values**: `1` | `2` | `3` | `null` (unknown, set during scan)

If the file does not exist, start with `{ "lastScanned": null, "items": {} }`.

---

## Scan Mode

### S1: Discover Files

Find all source files (exclude `node_modules/`, `.nuxt/`, `dist/`):

- `ui/components/**/*.vue`
- `ui/pages/**/*.vue`
- `ui/layouts/**/*.vue`
- `ui/composables/**/*.ts` (exclude `*.d.ts`)
- `ui/utils/**/*.ts` (exclude `*.d.ts`)

For each file, check if a corresponding test file exists:
- `<same-dir>/<filename>.test.ts` or `<same-dir>/<filename>.spec.ts`
- `ui/tests/<relative-path>.test.ts`

### S2: Update Registry

For each discovered file:

1. If not in registry → add with `status: "pending"`, `testStatus` based on test-file check, `tier: null`
2. If already in registry → preserve existing `status`, `lastReviewed`, `violations`, `notes`; update `testStatus` if a test file was found/removed
3. If in registry but file no longer exists → remove the entry

Guess tier from path and filename (do not read file contents during scan):
- `pages/` → tier 2
- `layouts/` → tier 3
- `composables/use*.ts` → tier 1
- `utils/*.ts` → tier 1
- `components/` → tier 2 or 3 (set `null`, determine during review)

### S3: Write Registry

Write the updated JSON to `.debussy/component-inventory.json` with pretty-print (2-space indent).
Set `lastScanned` to current ISO timestamp.

### S4: Output Summary

```
## Scan Complete

Discovered: <N> files
New entries: <N>
Removed entries: <N>
Updated test status: <N>

Breakdown by status:
  pending:        <N>
  healthy:        <N>
  has-violations: <N>
  skipped:        <N>

Breakdown by test status:
  untested: <N>
  partial:  <N>
  covered:  <N>

Run `/component-inventory --browse` to start reviewing pending items.
```

---

## Browse Mode

Browse mode is **fully automated**: review every pending item, record results, advance — no prompts.

### B1: Build Work List

If `--browse <path>` was given: work list = `[<path>]`.

If `--browse` with no path: work list = all items with `status: "pending"`, ordered by:
1. `pages/` files first
2. then `components/`
3. then `composables/` and `utils/`

If the work list is empty: output "All items are healthy or skipped." and stop.

### B2: Read Shared Context Once

Before the loop, read `docs/architecture/orchestration-presentation.md` once.
This document is reused for all files — do not re-read it on each iteration.

### B3: For Each File — Run Full Review

Read the file. Run the full review (Component Design Skill R2–R5 logic):

1. **Determine tier** from script and template inspection
2. **Run architecture checklist** (checks 1–7): flag each check that fires
3. **Run Nuxt conventions checklist** (checks 8–13): flag each check that fires
4. **Check for test file**: look for `<same-dir>/<name>.test.ts` or `.spec.ts`

**Do not output a full violation narrative for each file.** Output a single compact line per file (see B5).

### B4: Auto-Update Registry

After reviewing each file, immediately write the result to the registry:

- Violations found → `status: "has-violations"`, `violations: [<check numbers>]`
- No violations → `status: "healthy"`, `violations: []`
- Set `lastReviewed: <today>`
- Update `tier` to the determined value
- Update `testStatus`: `"untested"` if no test file found, `"partial"` if test file exists

Write `.debussy/component-inventory.json` after **each file** so progress is never lost.

### B5: Progress Output

Print one line per file as it completes:

```
[✓ healthy]        ui/components/SegmentedControl.vue   tier-3   no test
[✗ violations 1,3,10] ui/pages/inbox.vue               tier-2   no test
[✓ healthy]        ui/utils/status.ts                   tier-1   no test
```

After all files are processed, output the violation detail block for every file that has violations:

```
---
## Violation Details

### ui/pages/inbox.vue  (checks: 1, 3, 10)
<concise bullet per violation: check number, line ref, one-sentence description>

### ui/pages/roadmap.vue  (checks: 1, 3, 6, 7)
<concise bullet per violation>
```

Then output the `--status` dashboard automatically.

---

## Status Mode

### T1: Load and Summarize

Read the registry. Compute:

- Total items
- Count per status
- Count per tier
- Count per testStatus
- Items reviewed in last 7 days
- Items never reviewed (`lastReviewed: null` and status not `pending`)

### T2: Output Dashboard

```
## Component Inventory

Last scan: <timestamp or "never">
Total tracked: <N>

### Health Status
  ✓ healthy:        <N>  (<percent>%)
  ✗ has-violations: <N>  (<percent>%)
  ? pending:        <N>  (<percent>%)
  - skipped:        <N>

### Test Coverage
  ✓ covered: <N>
  ~ partial: <N>
  ✗ untested: <N>

### Next Items to Review
<up to 5 items with status "pending" or "has-violations", showing path and tier>

### Recently Reviewed
<up to 3 items reviewed in last 7 days, showing path and outcome>
```

---

## Registry File Conventions

- Path: `.debussy/component-inventory.json`
- Always use paths relative to repo root (e.g. `ui/components/Foo.vue`)
- `violations` stores check numbers from the review (e.g. `[1, 9, 10]`)
- `notes` is freeform; populated from user input during browse or by other skills
- Do not overwrite `notes` unless the user explicitly provides new notes
