#!/bin/bash
DATA=$(cat)
cwd=$(echo "$DATA" | jq -r '.cwd')

# --- Left: branch / worktree with icon & color ---
branch=$(git -C "$cwd" rev-parse --abbrev-ref HEAD 2>/dev/null)
worktree_root=$(git -C "$cwd" rev-parse --show-toplevel 2>/dev/null)
main_root=$(git -C "$cwd" worktree list 2>/dev/null | head -1 | awk '{print $1}')

cyan="\e[36m"
magenta="\e[35m"
reset="\e[0m"

if [ "$worktree_root" != "$main_root" ] && [ -n "$main_root" ]; then
  left_raw="🌿 ${branch}"
  left="${magenta}🌿 ${branch}${reset}"
else
  left_raw="⎇ ${branch}"
  left="${cyan}⎇ ${branch}${reset}"
fi
left_len=${#left_raw}

# --- Center: model + context progress bar ---
model=$(echo "$DATA" | jq -r '.model.display_name // .model.id // "?"')
ctx=$(echo "$DATA" | jq -r '.context_window.used_percentage // 0')

if [ "$ctx" -lt 50 ] 2>/dev/null; then
  bar_color="\e[32m"
elif [ "$ctx" -lt 70 ] 2>/dev/null; then
  bar_color="\e[33m"
else
  bar_color="\e[31m"
fi

# Progress bar: 10 chars wide
bar_width=10
filled=$(( ctx * bar_width / 100 ))
empty=$(( bar_width - filled ))
bar_filled=$(printf '█%.0s' $(seq 1 $filled 2>/dev/null))
bar_empty=$(printf '░%.0s' $(seq 1 $empty 2>/dev/null))
[ "$filled" -eq 0 ] && bar_filled=""
[ "$empty" -eq 0 ] && bar_empty=""

center_len=$(( ${#model} + 1 + ${#ctx} + 2 + bar_width + 2 ))

# --- Right: Debussy UI status ---
green="\e[32m"
dim="\e[2m"
if curl -s --max-time 0.3 http://localhost:4321 > /dev/null 2>&1; then
  link="${green}\e]8;;http://localhost:4321\e\\♪ Debussy UI\e]8;;\e\\${reset}"
  right_len=14  # "♪ Debussy UI"
else
  link="${dim}♪ UI offline${reset}"
  right_len=14  # "♪ UI offline"
fi

# --- Layout ---
cols=$(tput cols 2>/dev/null || echo 120)
total=$((left_len + center_len + right_len))
remaining=$((cols - total))
[ "$remaining" -lt 2 ] && remaining=2
gap1=$((remaining / 2))
gap2=$((remaining - gap1))

printf '%b%*s%s %b%s%% [%b%s%b%s%b]%*s%b' \
  "$left" "$gap1" "" \
  "$model" "$bar_color" "$ctx" \
  "$bar_color" "$bar_filled" "$reset" "$bar_empty" "$reset" \
  "$gap2" "" \
  "$link"
