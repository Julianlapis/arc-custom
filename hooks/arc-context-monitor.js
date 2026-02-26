#!/usr/bin/env node
"use strict";

// Arc Context Monitor — PostToolUse Hook
//
// Reads the bridge file written by arc-statusline.js and injects
// warnings into the agent's context when the context window is running low.
//
// Input (stdin JSON): { session_id, tool_name, ... }
// Output (stdout JSON): { hookSpecificOutput: { hookEventName, additionalContext } }
//
// Thresholds:
//   remaining <= 25% => CRITICAL — stop and save state
//   remaining <= 35% => WARNING  — wrap up current task
//
// Debounce: 5 tool uses between warnings (severity escalation bypasses)

const fs = require("fs");
const path = require("path");

// How long before metrics are considered stale (ms)
const STALE_THRESHOLD_MS = 60000;

// Number of tool uses to skip between repeated warnings
const DEBOUNCE_INTERVAL = 5;

// Warning thresholds (remaining_percentage)
const CRITICAL_THRESHOLD = 25;
const WARNING_THRESHOLD = 35;

function getSeverity(remainingPct) {
  if (remainingPct <= CRITICAL_THRESHOLD) {
    return "CRITICAL";
  }
  if (remainingPct <= WARNING_THRESHOLD) {
    return "WARNING";
  }
  return null;
}

function buildMessage(severity) {
  if (severity === "CRITICAL") {
    return (
      "[CRITICAL] Context window nearly exhausted. " +
      "STOP new work immediately. Save state to docs/progress.md and commit changes NOW."
    );
  }
  if (severity === "WARNING") {
    return (
      "[WARNING] Context window running low. " +
      "Consider saving progress (docs/progress.md) and running /arc:commit before context runs out."
    );
  }
  return null;
}

function readBridgeFile(sessionId) {
  try {
    const bridgePath = path.join("/tmp", "arc-ctx-" + sessionId + ".json");
    const raw = fs.readFileSync(bridgePath, "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function readDebounceState(sessionId) {
  try {
    const debouncePath = path.join("/tmp", "arc-ctx-debounce-" + sessionId + ".json");
    const raw = fs.readFileSync(debouncePath, "utf8");
    return JSON.parse(raw);
  } catch (_) {
    return { calls_since_last: 0, last_severity: null };
  }
}

function writeDebounceState(sessionId, state) {
  try {
    const debouncePath = path.join("/tmp", "arc-ctx-debounce-" + sessionId + ".json");
    fs.writeFileSync(debouncePath, JSON.stringify(state), { mode: 0o600 });
  } catch (_) {
    // Silent fail
  }
}

function shouldFire(severity, debounceState) {
  // First warning ever — always fire
  if (debounceState.last_severity === null) {
    return true;
  }

  // Severity escalation bypasses debounce
  const severityRank = { WARNING: 1, CRITICAL: 2 };
  const currentRank = severityRank[severity] || 0;
  const lastRank = severityRank[debounceState.last_severity] || 0;
  if (currentRank > lastRank) {
    return true;
  }

  // Debounce: fire every DEBOUNCE_INTERVAL calls
  if (debounceState.calls_since_last >= DEBOUNCE_INTERVAL) {
    return true;
  }

  return false;
}

function outputWarning(message) {
  const output = {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: message,
    },
  };
  process.stdout.write(JSON.stringify(output) + "\n");
}

function main() {
  try {
    let raw = "";
    const fd = fs.openSync("/dev/stdin", "r");
    const buf = Buffer.alloc(65536);
    let bytesRead;
    while ((bytesRead = fs.readSync(fd, buf, 0, buf.length)) > 0) {
      raw += buf.toString("utf8", 0, bytesRead);
    }
    fs.closeSync(fd);

    if (!raw.trim()) {
      return;
    }

    const input = JSON.parse(raw);
    const sessionId = input.session_id;

    if (!sessionId) {
      return;
    }

    // Read bridge file from statusline hook
    const metrics = readBridgeFile(sessionId);
    if (!metrics) {
      return;
    }

    // Check for stale metrics
    const age = Date.now() - metrics.timestamp;
    if (age > STALE_THRESHOLD_MS) {
      return;
    }

    // Determine severity
    const severity = getSeverity(metrics.remaining_percentage);
    if (!severity) {
      return;
    }

    // Read debounce state
    const debounceState = readDebounceState(sessionId);

    // Check if we should fire
    if (shouldFire(severity, debounceState)) {
      const message = buildMessage(severity);
      outputWarning(message);

      // Reset debounce counter
      writeDebounceState(sessionId, {
        calls_since_last: 0,
        last_severity: severity,
      });
    } else {
      // Increment debounce counter
      writeDebounceState(sessionId, {
        calls_since_last: debounceState.calls_since_last + 1,
        last_severity: debounceState.last_severity,
      });
    }
  } catch (_) {
    // Silent fail — never break the user's workflow
  }
}

main();
