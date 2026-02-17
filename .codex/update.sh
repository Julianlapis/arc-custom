#!/usr/bin/env bash
set -euo pipefail

ARC_HOME="${ARC_HOME:-$HOME/.codex/arc}"
LOCK_DIR="$ARC_HOME/.codex/.update.lock"

if [[ ! -d "$ARC_HOME/.git" ]]; then
  echo "Arc clone not found at $ARC_HOME" >&2
  exit 1
fi

mkdir -p "$(dirname "$LOCK_DIR")"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Arc update already running; skipping."
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

# Skip auto-update if tracked files were modified locally.
if [[ -n "$(git -C "$ARC_HOME" status --porcelain --untracked-files=no)" ]]; then
  echo "Local tracked changes detected in $ARC_HOME; skipping update."
  exit 0
fi

before="$(git -C "$ARC_HOME" rev-parse HEAD)"
current_branch="$(git -C "$ARC_HOME" rev-parse --abbrev-ref HEAD)"

git -C "$ARC_HOME" fetch --prune origin
git -C "$ARC_HOME" pull --ff-only origin "$current_branch" >/dev/null

after="$(git -C "$ARC_HOME" rev-parse HEAD)"

if [[ "$before" == "$after" ]]; then
  echo "Arc is already up to date."
else
  echo "Arc updated: ${before:0:7} -> ${after:0:7}"
fi
