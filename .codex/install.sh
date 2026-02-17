#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/howells/arc.git"
BRANCH="main"
ARC_HOME="${ARC_HOME:-$HOME/.codex/arc}"
SKILLS_ROOT="${SKILLS_ROOT:-$HOME/.agents/skills}"
SKILLS_LINK="$SKILLS_ROOT/arc"
AUTO_UPDATE="false"
INTERVAL_HOURS="6"

usage() {
  cat <<'EOF'
Install Arc skills for Codex.

Usage:
  install.sh [options]

Options:
  --auto-update                 Enable scheduled auto-updates after install.
  --interval-hours <hours>      Update interval in hours (default: 6).
  --repo-url <url>              Override Arc repository URL.
  --branch <name>               Branch to track (default: main).
  --arc-home <path>             Install/update clone location.
  --skills-root <path>          Codex skills root (default: ~/.agents/skills).
  -h, --help                    Show this help.
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --auto-update)
      AUTO_UPDATE="true"
      shift
      ;;
    --interval-hours)
      INTERVAL_HOURS="${2:-}"
      shift 2
      ;;
    --repo-url)
      REPO_URL="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --arc-home)
      ARC_HOME="${2:-}"
      shift 2
      ;;
    --skills-root)
      SKILLS_ROOT="${2:-}"
      SKILLS_LINK="$SKILLS_ROOT/arc"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if ! [[ "$INTERVAL_HOURS" =~ ^[0-9]+$ ]] || [[ "$INTERVAL_HOURS" -lt 1 ]]; then
  echo "--interval-hours must be a positive integer" >&2
  exit 1
fi

require_cmd git

if [[ -d "$ARC_HOME/.git" ]]; then
  echo "Updating existing Arc clone at $ARC_HOME..."
  if [[ -n "$(git -C "$ARC_HOME" status --porcelain --untracked-files=no)" ]]; then
    echo "Local tracked changes detected in $ARC_HOME; skipping pull."
  else
    git -C "$ARC_HOME" fetch --prune origin
    if ! git -C "$ARC_HOME" checkout "$BRANCH" >/dev/null 2>&1; then
      echo "Could not switch to branch '$BRANCH' in $ARC_HOME." >&2
      echo "Switch branches manually, then re-run install.sh." >&2
      exit 1
    fi
    git -C "$ARC_HOME" pull --ff-only origin "$BRANCH"
  fi
elif [[ -e "$ARC_HOME" ]]; then
  echo "Path exists but is not a git repository: $ARC_HOME" >&2
  exit 1
else
  echo "Cloning Arc into $ARC_HOME..."
  mkdir -p "$(dirname "$ARC_HOME")"
  git clone --branch "$BRANCH" "$REPO_URL" "$ARC_HOME"
fi

mkdir -p "$SKILLS_ROOT"
TARGET="$ARC_HOME/skills"

if [[ -L "$SKILLS_LINK" ]]; then
  CURRENT_TARGET="$(readlink "$SKILLS_LINK")"
  if [[ "$CURRENT_TARGET" != "$TARGET" ]]; then
    echo "Repointing existing symlink: $SKILLS_LINK -> $TARGET"
    ln -sfn "$TARGET" "$SKILLS_LINK"
  fi
elif [[ -e "$SKILLS_LINK" ]]; then
  BACKUP_PATH="${SKILLS_LINK}.backup.$(date +%Y%m%d%H%M%S)"
  echo "Existing path at $SKILLS_LINK is not a symlink. Backing up to $BACKUP_PATH"
  mv "$SKILLS_LINK" "$BACKUP_PATH"
  ln -s "$TARGET" "$SKILLS_LINK"
else
  ln -s "$TARGET" "$SKILLS_LINK"
fi

echo "Arc skills linked at: $SKILLS_LINK"

if [[ "$AUTO_UPDATE" == "true" ]]; then
  if [[ ! -x "$ARC_HOME/.codex/enable-auto-update.sh" ]]; then
    echo "Auto-update helper not found: $ARC_HOME/.codex/enable-auto-update.sh" >&2
    echo "Update Arc and re-run with --auto-update." >&2
    exit 1
  fi
  "$ARC_HOME/.codex/enable-auto-update.sh" --interval-hours "$INTERVAL_HOURS" --arc-home "$ARC_HOME"
fi

echo "Done. Restart Codex if skills do not appear immediately."
