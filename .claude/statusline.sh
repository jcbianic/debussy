#!/bin/bash
DATA=$(cat)
cwd=$(echo "$DATA" | jq -r '.cwd')

cyan="\e[36m"
magenta="\e[35m"
green="\e[32m"
yellow="\e[33m"
red="\e[31m"
dim="\e[2m"
reset="\e[0m"

# --- Left: Debussy UI link + pending indicator ---
pending=0
if [ -d "$cwd/.workflow-runs" ]; then
  for state_file in "$cwd"/.workflow-runs/*/state.json; do
    [ -f "$state_file" ] || continue
    count=$(jq '[.steps[] | select(.status == "pending_review")] | length' "$state_file" 2>/dev/null)
    pending=$(( pending + ${count:-0} ))
  done
fi

if curl -s --max-time 0.3 http://localhost:4321 > /dev/null 2>&1; then
  ui_link="${green}\e]8;;http://localhost:4321/inbox\a♪ Debussy\e]8;;\a${reset}"
  ui_raw="♪ Debussy"
else
  ui_link="${dim}♪ Debussy${reset}"
  ui_raw="♪ Debussy"
fi

if [ "$pending" -gt 0 ]; then
  pending_label=" 📋 ${pending} pending"
  left="${ui_link}${yellow}${pending_label}${reset}"
  left_raw="${ui_raw}${pending_label}"
else
  left="$ui_link"
  left_raw="$ui_raw"
fi
left_len=${#left_raw}

# --- Center: branch / worktree + PR link ---
branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null)
worktree_root=$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null)
main_root=$(git -C "$cwd" worktree list 2>/dev/null | head -1 | awk '{print $1}')

if [ "$worktree_root" != "$main_root" ] && [ -n "$main_root" ]; then
  branch_raw="🌿 ${branch}"
  branch_fmt="${magenta}🌿 ${branch}${reset}"
else
  branch_raw="⎇ ${branch}"
  branch_fmt="${cyan}⎇ ${branch}${reset}"
fi

# PR detection (cached for 60s to avoid gh latency)
pr_segment=""
pr_segment_len=0
cache_file="/tmp/.debussy-pr-cache-$(printf '%s' "$cwd" | cksum | cut -d' ' -f1)"
cache_ttl=60

pr_num=""
pr_url=""
if [ -f "$cache_file" ] && [ "$(( $(date +%s) - $(stat -f %m "$cache_file" 2>/dev/null || stat -c %Y "$cache_file" 2>/dev/null) ))" -lt "$cache_ttl" ]; then
  pr_data=$(cat "$cache_file")
  pr_num=$(echo "$pr_data" | cut -d' ' -f1)
  pr_url=$(echo "$pr_data" | cut -d' ' -f2)
else
  if command -v gh > /dev/null 2>&1; then
    pr_json=$(gh pr view --json number,url 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$pr_json" ]; then
      pr_num=$(echo "$pr_json" | jq -r '.number')
      pr_url=$(echo "$pr_json" | jq -r '.url')
      echo "$pr_num $pr_url" > "$cache_file"
    else
      echo "" > "$cache_file"
    fi
  fi
fi

if [ -n "$pr_num" ]; then
  pr_label=" PR#${pr_num}"
  pr_segment="${cyan}\e]8;;${pr_url}\a${pr_label}\e]8;;\a${reset}"
  pr_segment_len=${#pr_label}
fi

center_raw="${branch_raw}"
center_len=$(( ${#center_raw} + pr_segment_len ))
center="${branch_fmt}${pr_segment}"

# --- Right: model + context progress bar ---
model=$(echo "$DATA" | jq -r '.model.display_name // .model.id // "?"')
ctx=$(echo "$DATA" | jq -r '.context_window.used_percentage // 0')

if [ "$ctx" -lt 50 ] 2>/dev/null; then
  bar_color="\e[32m"
elif [ "$ctx" -lt 70 ] 2>/dev/null; then
  bar_color="\e[33m"
else
  bar_color="\e[31m"
fi

bar_width=10
filled=$(( ctx * bar_width / 100 ))
empty=$(( bar_width - filled ))
bar_filled=$(printf '█%.0s' $(seq 1 $filled 2>/dev/null))
bar_empty=$(printf '░%.0s' $(seq 1 $empty 2>/dev/null))
[ "$filled" -eq 0 ] && bar_filled=""
[ "$empty" -eq 0 ] && bar_empty=""

right_raw="${model} ${ctx}% [          ]"
right_len=$(( ${#model} + 1 + ${#ctx} + 2 + bar_width + 2 ))

# --- Layout ---
cols=$(tput cols 2>/dev/null || echo 120)
total=$(( left_len + center_len + right_len ))
remaining=$(( cols - total ))
[ "$remaining" -lt 2 ] && remaining=2
gap1=$(( remaining / 2 ))
gap2=$(( remaining - gap1 ))

printf '%b%*s%b%*s%s %b%s%% [%b%s%b%s%b]' \
  "$left" \
  "$gap1" "" \
  "$center" \
  "$gap2" "" \
  "$model" "$bar_color" "$ctx" \
  "$bar_color" "$bar_filled" "$reset" "$bar_empty" "$reset"
