# Arc Hooks

Claude Code hooks for context awareness. These are the JS-based hooks that live in the plugin — `/arc:hooks` also installs inline hooks for Biome formatting, TypeScript checking, and git safety.

## What They Do

**arc-statusline.js** (Statusline hook) displays a colored context bar and writes usage metrics to a bridge file.

**arc-context-monitor.js** (PostToolUse hook) reads the bridge file and injects warnings when context is running low.

## Install All Hooks

The easiest way to install all Arc hooks (including these, plus Biome format, tsc, and git guard):

```
/arc:hooks
```

The manual installation below is only needed if you want the context hooks without the rest.

## Architecture

```
Statusline event                PostToolUse event
       |                               |
       v                               v
arc-statusline.js              arc-context-monitor.js
       |                               |
       |--- writes --->  /tmp/arc-ctx-{session}.json  ---reads---|
       |                                                         |
       v                               v
  colored bar in                 additionalContext
  status display                 injected into agent
```

## Installation

1. Make the hooks executable (if not already):

```bash
chmod +x hooks/arc-statusline.js hooks/arc-context-monitor.js
```

2. Add both hooks to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Statusline": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/arc/hooks/arc-statusline.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/arc/hooks/arc-context-monitor.js"
          }
        ]
      }
    ]
  }
}
```

Replace `/path/to/arc` with the actual path to the arc plugin.

## Thresholds

| Remaining Context | Severity | Agent Behavior |
|-------------------|----------|----------------|
| > 35% | None | Silent |
| <= 35% | WARNING | Wrap up current task, save progress |
| <= 25% | CRITICAL | Stop immediately, save state and commit |

## Statusline Colors

| Used % | Color |
|--------|-------|
| < 63% | Green |
| < 81% | Yellow |
| < 95% | Orange |
| >= 95% | Red (blinking) |

The used percentage is scaled to the 80% context limit that Claude Code enforces. So 80% real usage displays as 100%.

## Debounce Behavior

- First warning always fires immediately
- Subsequent warnings are suppressed for 5 tool uses
- Severity escalation (WARNING to CRITICAL) bypasses debounce
- Stale metrics (older than 60 seconds) are ignored

## Bridge File

The statusline hook writes to `/tmp/arc-ctx-{session_id}.json`:

```json
{
  "session_id": "abc123",
  "remaining_percentage": 45.0,
  "used_pct": 69,
  "timestamp": 1709000000000
}
```

A separate debounce tracking file is stored at `/tmp/arc-ctx-debounce-{session_id}.json`.

Both files are created with `0600` permissions and cleaned up automatically by the OS temp directory policy.

## Error Handling

Both hooks are wrapped in try/catch at the top level. They will never crash or produce error output. If anything goes wrong (missing files, bad JSON, permission errors), they fail silently and return exit code 0.
