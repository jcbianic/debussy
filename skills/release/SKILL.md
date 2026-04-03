---
description: >-
  Manage the full lifecycle of a GitHub milestone-based release —
  from preparation to close.
license: MIT
metadata:
  author: jcbianic
  version: "0.1.0"
---

# Release Skill

Manage the full lifecycle of a release anchored to a GitHub milestone.
The skill covers: preparing scope, maturing issues to readiness,
scaffolding all lanes in one command, tracking progress, and closing
the release.

**Output is terminal-only.** This skill is a pure orchestrator.

## When to Activate

- User says "manage a release", "prepare a release", "close a release"
- User invokes `/release`
- User wants to scaffold lanes for a milestone
- User wants to track release progress

## Usage

```text
/release                       # List milestones → prompt → prepare
/release --prepare [milestone] # Phase 1: assess health, write
/release --mature [milestone]  # Phase 2: evaluate readiness
/release --scaffold [milestone]# Phase 3: create release branch +
/release --track [milestone]   # Phase 4: show lane progress
/release --close [milestone]   # Phase 5: squash-merge → release
```

---

## Step 1: Parse Arguments

From `$ARGUMENTS`, determine mode:

- If `--list` → jump to **List Mode**
- If `--prepare` → jump to **Prepare Mode**
- If `--mature` → jump to **Mature Mode**
- If `--scaffold` → jump to **Scaffold Mode**
- If `--track` → jump to **Track Mode**
- If `--close` → jump to **Close Mode**
- Otherwise → jump to **Default Mode** (list milestones, prompt)

Extract optional `[milestone]` argument. If present, use it as the
target milestone. Otherwise, list milestones and ask the user.

---

## Step 2: Resolve Milestone

Run this sub-step in all modes that reference a milestone:

```bash
bash .claude/skills/release/scripts/list-milestones.sh
```

If `[milestone]` argument was provided:

- Try exact match on title (case-insensitive)
- If not found, try slug match (derive slug from title: lowercase,
  spaces/dots → `-`, strip non-alphanumeric)
- If still not found, ask user via AskUserQuestion with the list

Extract: `milestone_number`, `milestone_title`, `milestone_slug`,
`due_on`, `description`.

---

## Default Mode

Resolve the milestone and jump to **Prepare Mode** with the selected
milestone.

---

## Prepare Mode

Assess milestone health and write scope artifact.

### Resolve Milestone (Prepare)

See Step 2.

### Fetch all open issues in milestone + assess health

```bash
bash .claude/skills/release/scripts/fetch-issues.sh "{milestone_title}"
```

The script outputs: issues table, health scorecard, and flagged
issues list. Use this output directly — do not re-fetch or
re-analyze.

### Initialize or read artifact

Check if `.debussy/releases/{milestone_slug}.md` exists.

- If yes, preserve non-empty sections (scope, phase history)
- If no, create new

### Write artifact with sections

```markdown
---
milestone: {milestone_title}
milestone_number: {number}
release_branch: release/v{version}
pr_number: null
phase: prepared
created_at: {ISO-8601}
updated_at: {ISO-8601}
---

# Release: {milestone_title}

## Overview

{milestone_description}

**Due:** {due_on or "unset"}

## Issues ({count} open)

| # | Title | Labels | Ready? |
| --- | --- | --- | --- |
| {N} | {title} | {labels} | {flag or ✓} |

## Health Scorecard

- **Size:** {count} issues
- **Labeled:** {count_labeled}/{count}
- **Ready:** {count_ready}/{count}
- **Critical Blocks:** {count_blocked}

## Flagged Issues

{for each flagged issue:}
- Issue #{N} ({title}): {flag reason}
```

### Print Prepare Summary

```text
RELEASE PREPARED: {milestone_title}

Issues: {count} open
Health: {scorecard summary}
Flagged: {count_flagged}

Flagged issues:
{list}

Next: /release --mature {milestone_slug}
```

---

## Mature Mode

Evaluate issue readiness and suggest improvements.

### Resolve Milestone (Mature)

See Step 2.

### Read Release Artifact (Mature)

Read `.debussy/releases/{milestone_slug}.md`. If missing, error:
"Release not prepared. Run `/release --prepare {milestone}` first."
Exit.

### For each flagged issue

- Fetch full issue body: `gh issue view {N} --json body,labels`
- Evaluate:
  - Missing acceptance criteria → suggest label addition
  - Vague description → ask for clarification
  - Missing labels → suggest label additions
  - Suggest: run `gh issue edit {N} --add-label "ready"` (if fixed)

### Prompt user

```text
Found {count_flagged} issues needing maturity:

{for each flagged issue:}
- Issue #{N}: {current issue}
  Suggestion: {gh issue edit command or clarification}

Apply suggestions? (yes/no/skip-{N}/edit-body-{N})
```

AskUserQuestion with these options.

### Apply decisions

- If user provides `yes`, run all suggested `gh issue edit`
  commands
- If `skip-{N}`, remove that issue from flags
- If `edit-body-{N}`, print the issue body and ask user for edits

### Update Release Artifact (Mature)

```markdown
phase: matured
updated_at: {ISO-8601}
```

### Print Mature Summary

```text
RELEASE MATURED: {milestone_title}

Issues evaluated: {count_flagged}
Applied edits: {count_applied}

Next: /release --scaffold {milestone_slug}
```

---

## Scaffold Mode

Create release branch and lanes for all issues.

### Resolve Milestone (Scaffold)

See Step 2.

### Read Release Artifact (Scaffold)

Read `.debussy/releases/{milestone_slug}.md`. Verify `phase` is
`prepared` or `matured`. If not, error and exit.

### Derive release version

From milestone_title, extract version. E.g., "v0.2.0" → "0.2.0".
If not in vX.Y.Z format, ask user:
"What version number for this release? (e.g., 0.2.0)"

### Create release branch

```bash
git checkout -b release/v{version} main
git push -u origin release/v{version}
```

### Create draft PR (release → main)

```bash
gh pr create \
  --title "Release v{version}" \
  --body "Merge when all lanes approved." \
  --draft \
  --base main \
  --head release/v{version}
```

Extract `pr_number` from output.

### For each issue in milestone

Fetch issue details:

```bash
gh issue view {issue_number} \
  --json number,title,body,labels
```

Derive slug: lowercase title, spaces/dots → `-`,
strip non-alphanumeric.

Create lane branch (from `release/v{version}`):

```bash
git checkout release/v{version}
git checkout -b lane/{issue_number}-{slug}
git push -u origin lane/{issue_number}-{slug}
```

Create worktree:

```bash
git worktree add \
  .worktrees/{issue_number} \
  lane/{issue_number}-{slug}
```

Create draft PR (lane → release branch):

```bash
gh pr create \
  --title "Lane {issue_number}: {title}" \
  --body "{issue_body}" \
  --draft \
  --base release/v{version} \
  --head lane/{issue_number}-{slug}
```

Extract `lane_pr_number`.

Write `.debussy/lanes/{issue_number}/lane.json`:

```json
{
  "id": "{issue_number}",
  "issueNumber": {issue_number},
  "issueTitle": "{title}",
  "branch": "lane/{issue_number}-{slug}",
  "worktreePath": ".worktrees/{issue_number}",
  "baseBranch": "release/v{version}",
  "prNumber": {lane_pr_number},
  "state": "created",
  "releaseSlug": "{milestone_slug}",
  "createdAt": "{ISO-8601}",
  "updatedAt": "{ISO-8601}"
}
```

Write `.debussy/lanes/{issue_number}/scope.md`:

```markdown
# Lane {issue_number}: {title}

## Release

{milestone_title} (`release/v{version}`)

## Summary

{issue_body, first 500 chars}

## Acceptance Criteria

{if present in issue body, extracted section}
{else: "(not yet specified)"}
```

Create empty `.debussy/lanes/{issue_number}/sessions/` directory.

### Update Release Artifact (Scaffold)

Add lane table to artifact:

```markdown
## Lanes ({count} created)

| Lane | Issue | Branch | PR | Status |
| --- | --- | --- | --- | --- |
| {N} | #{issue} {title} | lane/{N}-{slug} | #{pr} | created |
```

Update frontmatter:

```yaml
release_branch: release/v{version}
pr_number: {pr_number}
phase: scaffolded
updated_at: {ISO-8601}
```

### Print

```text
RELEASE SCAFFOLDED: {milestone_title} (v{version})

Release branch: release/v{version}
Release PR: #{pr_number}

Lanes created: {count}
Worktrees created: {count}

Next: /release --track {milestone_slug}
```

---

## Track Mode

Show lane progress and identify blockers.

### Resolve Milestone (Track)

See Step 2.

### Read artifact

Read `.debussy/releases/{milestone_slug}.md`. Verify `phase` is
`scaffolded` or `tracking`. If not, error and exit.

### Fetch lane status

```bash
bash .claude/skills/release/scripts/track-lanes.sh "{milestone_slug}"
```

The script outputs: per-lane status table, summary counts, and
action-required items. Use this output directly — do not re-fetch
individual PR states.

### Update artifact

Add or replace "Track" section:

```markdown
## Lane Status

| Lane | Issue | PR | State | Review | Blocked? |
| --- | --- | --- | --- | --- | --- |
{table rows}

### Blockers

{for each blocked lane:}
- Lane {N} ({title}): {blocker type}
```

Update:

```yaml
phase: tracking
updated_at: {ISO-8601}
```

### Print Track Summary

```text
RELEASE TRACK: {milestone_title}

Lanes: {count} total
  Created: {count}
  In Progress: {count}
  Ready for Review: {count}
  Merged: {count}

Blockers: {count}
{list}

Stale Lanes (no commit >48h): {count}
{list}

Next: /release --close {milestone_slug} (when all PRs merged)
```

---

## Close Mode

Show lane progress and identify blockers.

### Resolve Milestone (Close)

See Step 2.

### Read Release Artifact (Close)

Read `.debussy/releases/{milestone_slug}.md`. Verify `phase` is
`tracking` or `scaffolded`. If not, error and exit.

### Check lane status

```bash
bash .claude/skills/release/scripts/close-checks.sh "{milestone_slug}"
```

Exit 0 = all lanes merged (GO). Exit 1 = unmerged lanes remain
(NO-GO) — the script lists them. If NO-GO, ask user for each
unmerged lane: "Skip or wait?"

If "wait", exit. If "skip", mark as skipped.

### Merge release PR

```bash
gh pr merge {release_pr_number} \
  --squash \
  --auto
```

Wait for merge (poll `gh pr view {release_pr_number} --json state`
until `MERGED`).

### Create GitHub release

Derive release notes from milestone description + issue titles:

```bash
NOTES_FILE=$(mktemp /tmp/release-notes-XXXXXX.md)
printf '%s' "{release_notes}" > "$NOTES_FILE"
gh release create v{version} \
  --title "v{version}" \
  --notes-file "$NOTES_FILE" \
  --target main
rm -f "$NOTES_FILE"
```

### Close milestone

```bash
gh api repos/{owner}/{repo}/milestones/{milestone_number} \
  -X PATCH \
  -F state=closed
```

### Append retrospective to artifact

```markdown
## Retrospective

**Closed at:** {ISO-8601}
**Duration:** {created_at to now}
**Issues delivered:** {count_merged}
**Lanes completed:** {count_merged}
**Blockers resolved:** {count_blockers}

### Summary

{user input via prompt:}
"Retrospective notes for this release? (freeform)"

[include user input]
```

Update frontmatter:

```yaml
phase: closed
updated_at: {ISO-8601}
```

### Print Close Summary

```text
RELEASE CLOSED: {milestone_title} (v{version})

Release PR: #{release_pr_number} merged
GitHub Release: v{version} created
Milestone: closed

Issues delivered: {count}
Lanes merged: {count}

Release artifact: .debussy/releases/{milestone_slug}.md
```

---

## Artifact Format Rules

### Release Artifact Path

`.debussy/releases/{milestone_slug}.md` where slug is derived from
milestone title: lowercase, spaces/dots → `-`, remove
non-alphanumeric, collapse dashes.

Example: "Release v0.2.0 — Milestone" →
`release-v0-2-0-milestone`

### Frontmatter

```yaml
milestone: {milestone_title}
milestone_number: {gh milestone number}
release_branch: release/v{version}
pr_number: {gh pr number or null}
phase: prepared | matured | scaffolded | tracking | closed
created_at: {ISO-8601}
updated_at: {ISO-8601}
```

### Sections

- **Overview:** milestone description + due date
- **Issues:** table of all issues with flags
- **Health Scorecard:** size, labeled %, ready %, blocked count
- **Flagged Issues:** per-issue suggestions
- **Lanes:** (after scaffold) table of branch → PR mappings
- **Lane Status:** (after track) table of PR states + blockers
- **Retrospective:** (after close) summary + user notes

### Lane Record (`.debussy/lanes/{N}/lane.json`)

New field `baseBranch` points to the release branch (not main).
New field `releaseSlug` for tracking which release owns the lane.

```json
{
  "id": "{issueNumber}",
  "issueNumber": {N},
  "issueTitle": "{title}",
  "branch": "lane/{N}-{slug}",
  "worktreePath": ".worktrees/{N}",
  "baseBranch": "release/v{version}",
  "prNumber": {lane_pr_number},
  "state": "created",
  "releaseSlug": "{milestone_slug}",
  "createdAt": "{ISO-8601}",
  "updatedAt": "{ISO-8601}"
}
```

### Scope Template (`.debussy/lanes/{N}/scope.md`)

```markdown
# Lane {N}: {issueTitle}

## Release

{milestone_title} (`release/v{version}`)

## Summary

{issue body excerpt, first 500 chars}

## Acceptance Criteria

{extracted from issue body if marked}
{else: "(not yet specified)"}
```

---

## Error Handling

| Situation | Action |
| --- | --- |
| Milestone not found | List milestones, ask user to pick |
| Release artifact missing | Print error, suggest `--prepare` |
| Phase mismatch | Print warning, ask to proceed |
| `gh` command fails | Print error, suggest `gh auth login` |
| Git worktree exists | Warn, ask skip or remove-recreate |
| Lane branch exists | Warn, ask skip or force |
| PR merge fails | Print error, ask user resolve |
| Release version not detected | Prompt user for version |
| Not all lanes merged | Print warning, ask confirmation |
