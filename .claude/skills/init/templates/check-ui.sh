#!/bin/bash
# Hook: warn when invoking a debussy:* skill while the UI is not running.
# Receives PreToolUse JSON on stdin. Exits 0 always (non-blocking).
# Prints a warning to stderr when the UI is unreachable.

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

# Check if UI is reachable
if ! curl -s --max-time 0.5 http://localhost:4321 > /dev/null 2>&1; then
  echo "⚠ Debussy UI is not running. Start it with: PORT=4321 node <debussy>/ui/.output/server/index.mjs" >&2
fi

exit 0
