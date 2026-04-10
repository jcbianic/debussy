#!/bin/bash
# Hook: auto-start Debussy UI when invoking a debussy:* skill.
# Receives PreToolUse JSON on stdin. Exits 0 always (non-blocking).
# If the UI is not running, finds the server entry point and launches it.
# Each project gets a deterministic port derived from its path (range 4321-4999).

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

# Resolve project root: use git worktree main root, fallback to cwd
cwd=$(echo "$DATA" | jq -r '.cwd // empty')
PROJECT_ROOT=$(cd "$cwd" 2>/dev/null && git worktree list --porcelain 2>/dev/null | head -1 | sed 's/^worktree //')
[ -z "$PROJECT_ROOT" ] && PROJECT_ROOT="$cwd"

# Derive deterministic port from project path (range 4321-4999)
hash_val=$(echo -n "$PROJECT_ROOT" | cksum | awk '{print $1}')
PORT=$(( (hash_val % 679) + 4321 ))

# Check if UI is already reachable on this project's port
curl -s --max-time 0.5 http://localhost:$PORT > /dev/null 2>&1 && exit 0

# Find the server entry point (same search order as init skill Step 2)
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
  PORT=$PORT PROJECT_ROOT="$PROJECT_ROOT" node "$SERVER" > /dev/null 2>&1 &
  # Persist the port so skills can read it
  mkdir -p "${PROJECT_ROOT}/.debussy"
  echo "$PORT" > "${PROJECT_ROOT}/.debussy/.port"
  # Wait briefly for it to become reachable
  for i in 1 2 3 4 5; do
    sleep 0.5
    if curl -s --max-time 0.3 http://localhost:$PORT > /dev/null 2>&1; then
      echo "♪ Debussy UI started → http://localhost:$PORT" >&2
      exit 0
    fi
  done
  echo "♪ Debussy UI starting on port $PORT (may take a moment)…" >&2
else
  echo "⚠ Debussy UI server not found. Run /debussy:init to set it up." >&2
fi

exit 0
