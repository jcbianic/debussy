#!/usr/bin/env bash
# Track lane PR status for a release milestone
# Usage: track-lanes.sh <milestone_slug>
# Output: status table, summary counts, blockers list

set -euo pipefail

MILESTONE_SLUG="${1:?Usage: track-lanes.sh <milestone_slug>}"
LANES_DIR=".debussy/lanes"

echo "=== LANE TRACK: $MILESTONE_SLUG ==="
echo ""

if [ ! -d "$LANES_DIR" ]; then
  echo "ERROR: No lanes directory at $LANES_DIR"
  echo "Run: /release --scaffold $MILESTONE_SLUG"
  exit 1
fi

NOW=$(date +%s)
STALE_THRESHOLD=$((48 * 3600))

TOTAL=0
CREATED=0
IN_PROGRESS=0
READY=0
MERGED_COUNT=0
BLOCKED=0
STALE_COUNT=0

echo "--- Lane Status ---"

for lane_file in "$LANES_DIR"/*/lane.json; do
  [ -f "$lane_file" ] || continue

  RELEASE_SLUG=$(jq -r '.releaseSlug // ""' "$lane_file")
  [ "$RELEASE_SLUG" = "$MILESTONE_SLUG" ] || continue

  ISSUE_NUM=$(jq -r '.issueNumber' "$lane_file")
  TITLE=$(jq -r '.issueTitle' "$lane_file")
  BRANCH=$(jq -r '.branch' "$lane_file")
  PR_NUM=$(jq -r '.prNumber' "$lane_file")

  TOTAL=$((TOTAL + 1))

  # Fetch PR status
  if ! PR_DATA=$(gh pr view "$PR_NUM" --json state,reviewDecision,isDraft,commits 2>/dev/null); then
    echo "  #$ISSUE_NUM  PR#$PR_NUM  ERROR fetching PR"
    continue
  fi

  STATE=$(echo "$PR_DATA" | jq -r '.state')
  REVIEW=$(echo "$PR_DATA" | jq -r '.reviewDecision // "PENDING"')
  IS_DRAFT=$(echo "$PR_DATA" | jq -r '.isDraft')

  # Stale check via git log on remote branch
  STALE_FLAG="-"
  if LAST_COMMIT_AT=$(git log -1 --format=%at "origin/$BRANCH" 2>/dev/null); then
    AGE=$((NOW - LAST_COMMIT_AT))
    if [ "$AGE" -gt "$STALE_THRESHOLD" ] && [ "$STATE" = "OPEN" ]; then
      STALE_FLAG="STALE"
      STALE_COUNT=$((STALE_COUNT + 1))
    fi
  fi

  # Classify
  if [ "$STATE" = "MERGED" ]; then
    MERGED_COUNT=$((MERGED_COUNT + 1))
    STATUS_LABEL="MERGED"
  elif [ "$REVIEW" = "CHANGES_REQUESTED" ]; then
    BLOCKED=$((BLOCKED + 1))
    STATUS_LABEL="BLOCKED(changes)"
  elif [ "$IS_DRAFT" = "true" ]; then
    IN_PROGRESS=$((IN_PROGRESS + 1))
    STATUS_LABEL="draft"
  elif [ "$REVIEW" = "APPROVED" ]; then
    READY=$((READY + 1))
    STATUS_LABEL="APPROVED"
  else
    CREATED=$((CREATED + 1))
    STATUS_LABEL="open"
  fi

  TITLE_SHORT="${TITLE:0:35}"
  printf "  #%-4s  %-35s  PR#%-5s  %-20s  review:%-18s  stale:%s\n" \
    "$ISSUE_NUM" "$TITLE_SHORT" "$PR_NUM" "$STATUS_LABEL" "$REVIEW" "$STALE_FLAG"
done

if [ "$TOTAL" -eq 0 ]; then
  echo "  No lanes found for milestone: $MILESTONE_SLUG"
  exit 0
fi

echo ""
echo "--- Summary ---"
echo "  Total:          $TOTAL"
echo "  Not started:    $CREATED"
echo "  In progress:    $IN_PROGRESS"
echo "  Ready (approved): $READY"
echo "  Merged:         $MERGED_COUNT"
echo "  Blocked:        $BLOCKED"
echo "  Stale (>48h):   $STALE_COUNT"

if [ $((BLOCKED + STALE_COUNT)) -gt 0 ]; then
  echo ""
  echo "--- Action Required ---"
  [ "$BLOCKED" -gt 0 ]     && echo "  $BLOCKED lane(s) have CHANGES_REQUESTED — address review feedback"
  [ "$STALE_COUNT" -gt 0 ] && echo "  $STALE_COUNT lane(s) stale (no commit >48h) — check progress"
fi
