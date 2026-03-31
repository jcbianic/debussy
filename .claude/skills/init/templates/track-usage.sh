#!/bin/bash
# Hook: track usage of skills, agents, and sessions.
# Receives hook JSON on stdin. Appends one JSONL line per event
# to .debussy/usage/YYYY-MM-DD.jsonl. Exits 0 always (non-blocking).

DATA=$(cat)
hook_event=$(echo "$DATA" | jq -r '.hook_event_name // empty')
session=$(echo "$DATA" | jq -r '.session_id // empty')
cwd=$(echo "$DATA" | jq -r '.cwd // empty')
ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
today=$(date -u +"%Y-%m-%d")

# Resolve usage directory relative to cwd
USAGE_DIR="${cwd}/.debussy/usage"
mkdir -p "$USAGE_DIR" 2>/dev/null || exit 0
USAGE_FILE="${USAGE_DIR}/${today}.jsonl"

case "$hook_event" in
  PostToolUse)
    tool=$(echo "$DATA" | jq -r '.tool_name // empty')
    [ "$tool" != "Skill" ] && exit 0
    skill=$(echo "$DATA" | jq -r '.tool_input.skill // empty')
    [ -z "$skill" ] && exit 0
    echo "{\"ts\":\"${ts}\",\"event\":\"skill\",\"session\":\"${session}\",\"name\":\"${skill}\"}" >> "$USAGE_FILE"
    ;;
  SubagentStop)
    agent_type=$(echo "$DATA" | jq -r '.agent_type // empty')
    [ -z "$agent_type" ] && exit 0
    echo "{\"ts\":\"${ts}\",\"event\":\"agent\",\"session\":\"${session}\",\"name\":\"${agent_type}\"}" >> "$USAGE_FILE"
    ;;
  SessionStart)
    echo "{\"ts\":\"${ts}\",\"event\":\"session_start\",\"session\":\"${session}\"}" >> "$USAGE_FILE"
    ;;
  SessionEnd)
    echo "{\"ts\":\"${ts}\",\"event\":\"session_end\",\"session\":\"${session}\"}" >> "$USAGE_FILE"
    ;;
esac

exit 0
