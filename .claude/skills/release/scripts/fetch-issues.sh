#!/usr/bin/env bash
# Fetch issues for a milestone + health analysis
# Usage: fetch-issues.sh <milestone_title>
# Output: issues table, health scorecard, flagged issues

set -euo pipefail

MILESTONE="${1:?Usage: fetch-issues.sh <milestone_title>}"

echo "=== ISSUES: $MILESTONE ==="
echo ""

ISSUES=$(gh issue list \
  --milestone "$MILESTONE" \
  --state open \
  --json number,title,labels,body \
  --limit 100)

TOTAL=$(echo "$ISSUES" | jq 'length')

if [ "$TOTAL" -eq 0 ]; then
  echo "No open issues found for milestone: $MILESTONE"
  exit 0
fi

# --- Issues table ---
echo "--- Issues ---"
echo "$ISSUES" | jq -r '.[] | [
  "#\(.number)",
  .title,
  ([ .labels[].name ] | if length > 0 then join(", ") else "(none)" end),
  (
    [
      if (.body | length) < 50 then "SHORT_BODY" else empty end,
      if ((.body // "") | test("(?i)## Acceptance Criteria|\\- \\[ \\]") | not) then "NO_CRITERIA" else empty end,
      if (.labels | length) == 0 then "NO_LABELS" else empty end
    ] | if length > 0 then join(", ") else "ok" end
  )
] | "\(.[0])  \(.[1])  [\(.[2])]  flags:\(.[3])"'

echo ""

# --- Health scorecard ---
echo "--- Health Scorecard ---"
echo "$ISSUES" | jq -r --argjson total "$TOTAL" '
  ($total) as $n |
  {
    size: $n,
    labeled: ([ .[] | select(.labels | length > 0) ] | length),
    ready: ([ .[] | select(any(.labels[]; .name == "ready")) ] | length),
    blocked: ([ .[] | select(any(.labels[]; .name == "blocked")) ] | length),
    flagged: ([
      .[] | select(
        (.body | length) < 50 or
        ((.body // "") | test("(?i)## Acceptance Criteria|\\- \\[ \\]") | not) or
        (.labels | length) == 0
      )
    ] | length)
  } |
  "  Size:    \(.size) issues",
  "  Labeled: \(.labeled)/\(.size)",
  "  Ready:   \(.ready)/\(.size)",
  "  Blocked: \(.blocked)",
  "  Flagged: \(.flagged)"
'

echo ""

# --- Flagged issues ---
echo "--- Flagged Issues ---"
FLAGGED=$(echo "$ISSUES" | jq -r '.[] |
  . as $i |
  [
    if (.body | length) < 50 then "SHORT_BODY" else empty end,
    if ((.body // "") | test("(?i)## Acceptance Criteria|\\- \\[ \\]") | not) then "NO_CRITERIA" else empty end,
    if (.labels | length) == 0 then "NO_LABELS" else empty end
  ] as $flags |
  if ($flags | length) > 0 then
    "  #\(.number) (\(.title)): \($flags | join(", "))"
  else empty end
')

if [ -z "$FLAGGED" ]; then
  echo "  None — all issues look healthy"
else
  echo "$FLAGGED"
fi
