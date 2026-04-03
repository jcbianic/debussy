#!/usr/bin/env bash
# List open GitHub milestones — formatted for release skill
# Usage: list-milestones.sh
# Output: numbered list with number, title, due date, description excerpt

set -euo pipefail

echo "=== OPEN MILESTONES ==="
echo ""

MILESTONES=$(gh milestone list \
  --json number,title,dueOn,description \
  --state open \
  --limit 50)

COUNT=$(echo "$MILESTONES" | jq 'length')

if [ "$COUNT" -eq 0 ]; then
  echo "No open milestones found."
  exit 0
fi

echo "$MILESTONES" | jq -r '.[] |
  "#\(.number)  \(.title)  due:\(.dueOn // "unset")  \((.description // "") | if length > 60 then .[:60] + "..." else . end)"
'

echo ""
echo "Total: $COUNT milestone(s)"
