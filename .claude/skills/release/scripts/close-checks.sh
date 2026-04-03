#!/usr/bin/env bash
# Pre-close validation: check all lanes are merged
# Usage: close-checks.sh <milestone_slug>
# Exit 0 = GO, Exit 1 = NO-GO (unmerged lanes remain)

set -euo pipefail

MILESTONE_SLUG="${1:?Usage: close-checks.sh <milestone_slug>}"
LANES_DIR=".debussy/lanes"
RELEASE_FILE=".debussy/releases/${MILESTONE_SLUG}.md"

echo "=== CLOSE CHECKS: $MILESTONE_SLUG ==="
echo ""

if [ ! -f "$RELEASE_FILE" ]; then
  echo "ERROR: Release artifact not found: $RELEASE_FILE"
  echo "Run: /release --prepare $MILESTONE_SLUG"
  exit 1
fi

if [ ! -d "$LANES_DIR" ]; then
  echo "ERROR: No lanes directory at $LANES_DIR"
  exit 1
fi

TOTAL=0
MERGED_COUNT=0
UNMERGED_COUNT=0

for lane_file in "$LANES_DIR"/*/lane.json; do
  [ -f "$lane_file" ] || continue

  RELEASE_SLUG=$(jq -r '.releaseSlug // ""' "$lane_file")
  [ "$RELEASE_SLUG" = "$MILESTONE_SLUG" ] || continue

  ISSUE_NUM=$(jq -r '.issueNumber' "$lane_file")
  TITLE=$(jq -r '.issueTitle' "$lane_file")
  PR_NUM=$(jq -r '.prNumber' "$lane_file")

  TOTAL=$((TOTAL + 1))

  STATE=$(gh pr view "$PR_NUM" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")

  if [ "$STATE" = "MERGED" ]; then
    MERGED_COUNT=$((MERGED_COUNT + 1))
    echo "  ok   #$ISSUE_NUM  PR#$PR_NUM  $TITLE"
  else
    UNMERGED_COUNT=$((UNMERGED_COUNT + 1))
    echo "  WAIT #$ISSUE_NUM  PR#$PR_NUM  $TITLE  ($STATE)"
  fi
done

echo ""
echo "--- Verdict ---"
echo "  Lanes: $MERGED_COUNT/$TOTAL merged"

if [ "$TOTAL" -eq 0 ]; then
  echo "  STATUS: NO-GO — no lanes found for milestone '$MILESTONE_SLUG'"
  echo "  Check that lanes were scaffolded and releaseSlug matches"
  exit 1
fi

if [ "$UNMERGED_COUNT" -eq 0 ]; then
  echo "  STATUS: GO — all lanes merged, safe to close release"
  exit 0
else
  echo "  STATUS: NO-GO — $UNMERGED_COUNT lane(s) not yet merged"
  echo "  Resolve before closing or confirm skip with user"
  exit 1
fi
