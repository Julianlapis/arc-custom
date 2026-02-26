#!/usr/bin/env node
"use strict";

// Arc Statusline Hook
//
// Writes context metrics to a bridge file for the PostToolUse hook,
// and displays a colored statusline showing context window usage.
//
// Input (stdin JSON): { model, workspace, session_id, context_window: { remaining_percentage } }
// Output (stdout): colored statusline string
// Side effect: writes /tmp/arc-ctx-{session_id}.json bridge file

const fs = require("fs");
const path = require("path");

// ANSI color codes
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const ORANGE = "\x1b[38;5;208m";
const RED = "\x1b[31m";
const BLINK = "\x1b[5m";
const DIM = "\x1b[2m";

// Claude Code enforces an 80% context limit.
// Scale usage so that 80% real usage displays as 100%.
const CONTEXT_LIMIT = 80;

function scaleUsedPct(remainingPct) {
  const realUsed = 100 - remainingPct;
  const scaled = (realUsed / CONTEXT_LIMIT) * 100;
  return Math.round(Math.min(scaled, 100));
}

function getColor(usedPct) {
  if (usedPct >= 95) {
    return RED + BLINK;
  }
  if (usedPct >= 81) {
    return ORANGE;
  }
  if (usedPct >= 63) {
    return YELLOW;
  }
  return GREEN;
}

function buildContextBar(usedPct) {
  const totalSegments = 10;
  const filled = Math.round((usedPct / 100) * totalSegments);
  const empty = totalSegments - filled;
  const color = getColor(usedPct);
  return color + "\u2588".repeat(filled) + DIM + "\u2591".repeat(empty) + RESET;
}

function writeBridgeFile(sessionId, remainingPct, usedPct) {
  try {
    const bridgePath = path.join("/tmp", "arc-ctx-" + sessionId + ".json");
    const data = JSON.stringify({
      session_id: sessionId,
      remaining_percentage: remainingPct,
      used_pct: usedPct,
      timestamp: Date.now(),
    });
    fs.writeFileSync(bridgePath, data, { mode: 0o600 });
  } catch (_) {
    // Silent fail — never break the statusline
  }
}

function getDirname(workspace) {
  if (!workspace) {
    return "~";
  }
  return path.basename(workspace);
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
    const model = input.model || "unknown";
    const workspace = input.workspace || "";
    const sessionId = input.session_id;
    const remainingPct =
      input.context_window && typeof input.context_window.remaining_percentage === "number"
        ? input.context_window.remaining_percentage
        : null;

    if (remainingPct === null || !sessionId) {
      // Not enough data to display context info — output basic statusline
      const dirname = getDirname(workspace);
      process.stdout.write(model + " \u2502 " + dirname + "\n");
      return;
    }

    const usedPct = scaleUsedPct(remainingPct);
    const dirname = getDirname(workspace);
    const bar = buildContextBar(usedPct);

    // Write bridge file for context monitor
    writeBridgeFile(sessionId, remainingPct, usedPct);

    // Output statusline
    process.stdout.write(model + " \u2502 " + dirname + " " + bar + " " + usedPct + "%\n");
  } catch (_) {
    // Silent fail — never break the statusline
  }
}

main();
