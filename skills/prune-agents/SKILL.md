---
name: prune-agents
disable-model-invocation: true
description: |
  Kill orphaned Claude subagent processes that didn't exit cleanly.
  Use when asked to "prune agents", "clean up agents", "kill orphaned processes",
  or when subagents accumulate from Task tool usage.
license: MIT
metadata:
  author: howells
website:
  order: 20
  desc: Kill orphaned agents
  summary: Kills Claude Code processes that have become detached from their terminal. Safe to run anytime.
  what: |
    Prune-agents finds and kills Claude Code processes that have become orphaned — detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.
  why: |
    Orphaned Claude processes consume memory and CPU in the background. Pruning periodically keeps your system clean without affecting active terminal sessions.
  workflow:
    position: utility
---

<arc_runtime>
Arc-owned files live under the Arc install root for full-runtime installs.

Set `${ARC_ROOT}` to that root and use `${ARC_ROOT}/...` for Arc bundle files such as
`references/`, `disciplines/`, `agents/`, `templates/`, `scripts/`, and `rules/`.

Project-local files stay relative to the user's repository.
</arc_runtime>

# Prune Orphaned Agents

Run the cleanup script to kill orphaned Claude agent processes.

```bash
${ARC_ROOT}/scripts/cleanup-orphaned-agents.sh
```

This kills Claude Code processes that have become detached from their terminal (TTY shows "??"). These accumulate when the Task tool spawns subagents that don't cleanly exit after completion.

**Safe to run anytime** — only kills orphaned processes. Active terminal sessions are preserved.

After running, report the result to the user including how many processes were cleaned up.
