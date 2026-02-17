#!/usr/bin/env bash
set -euo pipefail

INTERVAL_HOURS="6"
ARC_HOME="${ARC_HOME:-$HOME/.codex/arc}"
LABEL="com.howells.arc.codex-auto-update"
MARKER="# arc-codex-auto-update"

usage() {
  cat <<'EOF'
Enable scheduled Arc updates for Codex.

Usage:
  enable-auto-update.sh [options]

Options:
  --interval-hours <hours>      Update interval in hours (default: 6).
  --arc-home <path>             Arc clone location (default: ~/.codex/arc).
  -h, --help                    Show this help.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --interval-hours)
      INTERVAL_HOURS="${2:-}"
      shift 2
      ;;
    --arc-home)
      ARC_HOME="${2:-}"
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

UPDATE_SCRIPT="$ARC_HOME/.codex/update.sh"
if [[ ! -x "$UPDATE_SCRIPT" ]]; then
  echo "Expected executable update script at $UPDATE_SCRIPT" >&2
  exit 1
fi

if [[ "$(uname -s)" == "Darwin" ]]; then
  LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
  PLIST_PATH="$LAUNCH_AGENTS_DIR/$LABEL.plist"
  LOG_PATH="$HOME/Library/Logs/arc-codex-auto-update.log"
  START_INTERVAL="$((INTERVAL_HOURS * 3600))"

  mkdir -p "$LAUNCH_AGENTS_DIR"

  cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$UPDATE_SCRIPT</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>ARC_HOME</key>
    <string>$ARC_HOME</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>$START_INTERVAL</integer>
  <key>StandardOutPath</key>
  <string>$LOG_PATH</string>
  <key>StandardErrorPath</key>
  <string>$LOG_PATH</string>
</dict>
</plist>
EOF

  USER_ID="$(id -u)"
  launchctl bootout "gui/$USER_ID" "$PLIST_PATH" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$USER_ID" "$PLIST_PATH"
  launchctl enable "gui/$USER_ID/$LABEL" >/dev/null 2>&1 || true

  echo "Enabled macOS auto-update ($INTERVAL_HOURS hour interval)."
  echo "LaunchAgent: $PLIST_PATH"
  exit 0
fi

if [[ "$(uname -s)" == "Linux" ]]; then
  if ! command -v crontab >/dev/null 2>&1; then
    echo "crontab command not found; install cron first." >&2
    exit 1
  fi

  if [[ "$INTERVAL_HOURS" -lt 24 ]]; then
    CRON_SCHEDULE="0 */$INTERVAL_HOURS * * *"
  elif [[ $((INTERVAL_HOURS % 24)) -eq 0 ]]; then
    days="$((INTERVAL_HOURS / 24))"
    CRON_SCHEDULE="0 3 */$days * *"
  else
    echo "On Linux, --interval-hours must be <24 or divisible by 24." >&2
    exit 1
  fi

  existing_crontab="$(crontab -l 2>/dev/null || true)"
  filtered_crontab="$(printf "%s\n" "$existing_crontab" | grep -v "$MARKER" || true)"
  update_job="$CRON_SCHEDULE ARC_HOME=\"$ARC_HOME\" /usr/bin/env bash \"$UPDATE_SCRIPT\" >/dev/null 2>&1 $MARKER"

  {
    printf "%s\n" "$filtered_crontab"
    printf "%s\n" "$update_job"
  } | sed '/^[[:space:]]*$/d' | crontab -

  echo "Enabled Linux cron auto-update ($INTERVAL_HOURS hour interval)."
  exit 0
fi

echo "Unsupported OS for automatic scheduling. Run this manually instead:"
echo "ARC_HOME=\"$ARC_HOME\" /usr/bin/env bash \"$UPDATE_SCRIPT\""
