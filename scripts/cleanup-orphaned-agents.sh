#!/bin/bash
# Arc Plugin: Cleanup Orphaned Claude Agents
#
# Kills Claude Code processes that have become detached from their terminal
# (orphaned subagents). These accumulate when Task tool spawns agents that
# don't cleanly exit after completion.
#
# Safe to run anytime - only kills processes with "??" TTY (no terminal).
# Active terminal sessions (ttys001, etc.) are preserved.
#
# Usage:
#   ./cleanup-orphaned-agents.sh          # Kill orphans, show summary
#   ./cleanup-orphaned-agents.sh --dry-run # Show what would be killed
#   ./cleanup-orphaned-agents.sh --quiet   # Kill silently (for cron)

set -euo pipefail

DRY_RUN=false
QUIET=false

for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    --quiet) QUIET=true ;;
  esac
done

# Find orphaned Claude processes (detached from terminal, shown as "??" in TTY)
# Matches any 'claude' binary regardless of install location
# Excludes: chrome-mcp helpers, this grep itself
orphans=$(ps aux | grep -E '[c]laude' | grep -v "chrome-mcp" | grep -v "Claude.app" | awk '$7 == "??" {print $2}' || true)

if [ -z "$orphans" ]; then
  $QUIET || echo "No orphaned Claude agents found."
  exit 0
fi

count=$(echo "$orphans" | wc -l | tr -d ' ')

if $DRY_RUN; then
  echo "Would kill $count orphaned Claude agent(s):"
  echo "$orphans" | while read pid; do
    ps -p "$pid" -o pid,etime,command 2>/dev/null | tail -1 || true
  done
  exit 0
fi

# Kill the orphans
echo "$orphans" | xargs kill 2>/dev/null || true

$QUIET || echo "Killed $count orphaned Claude agent(s)."

exit 0
