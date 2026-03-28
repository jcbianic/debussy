#!/bin/bash
# Hook: auto-start Debussy UI when invoking a debussy:* skill.
# Receives PreToolUse JSON on stdin. Exits 0 always (non-blocking).
# If the UI is not running, finds the server entry point and launches it.

DATA=$(cat)
tool=$(echo "$DATA" | jq -r '.tool_name // empty')

# Only check for Skill tool invocations
[ "$tool" != "Skill" ] && exit 0

skill=$(echo "$DATA" | jq -r '.tool_input.skill // empty')

# Only check debussy:* skills (but not init itself — init starts the UI)
case "$skill" in
  debussy:*|strategy|product|engineering|feedback|workflow-run|component-*|roadmap)
    [ "$skill" = "debussy:init" ] && exit 0
    [ "$skill" = "init" ] && exit 0
    ;;
  *) exit 0 ;;
esac

# Check if UI is already reachable
curl -s --max-time 0.5 http://localhost:4321 > /dev/null 2>&1 && exit 0

# Find the server entry point (same search order as init skill Step 2)
cwd=$(echo "$DATA" | jq -r '.cwd // empty')
SERVER=""
for candidate in \
  "${cwd}/ui/.output/server/index.mjs" \
  "${HOME}/.claude/plugins/debussy/ui/.output/server/index.mjs"; do
  if [ -f "$candidate" ]; then
    SERVER="$candidate"
    break
  fi
done

# Fallback: search under ~/.claude
if [ -z "$SERVER" ]; then
  SERVER=$(find "${HOME}/.claude" -path "*/debussy/ui/.output/server/index.mjs" -print -quit 2>/dev/null)
fi

if [ -n "$SERVER" ]; then
  PORT=4321 node "$SERVER" > /dev/null 2>&1 &
  # Wait briefly for it to become reachable
  for i in 1 2 3 4 5; do
    sleep 0.5
    if curl -s --max-time 0.3 http://localhost:4321 > /dev/null 2>&1; then
      echo "♪ Debussy UI started → http://localhost:4321" >&2
      exit 0
    fi
  done
  echo "♪ Debussy UI starting on port 4321 (may take a moment)…" >&2
else
  echo "⚠ Debussy UI server not found. Run /debussy:init to set it up." >&2
fi

exit 0
