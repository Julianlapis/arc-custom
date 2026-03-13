---
name: hooks
disable-model-invocation: true
description: |
  Install Claude Code hooks for automatic formatting, linting, and context monitoring.
  Use when setting up a project, after "install hooks", "set up hooks", "add auto-formatting",
  or when starting a new project that uses Biome.
license: MIT
argument-hint: [--remove]
metadata:
  author: howells
website:
  order: 21
  desc: Auto-format hooks
  summary: Install Claude Code hooks that auto-format on every edit, lint on stop, and warn when context runs low. Biome-powered, zero token cost.
  what: |
    Hooks installs three Claude Code hooks into your project's .claude/settings.json:
    1. PostToolUse — runs biome format on every edited file (zero tokens, instant)
    2. Stop — runs biome check --fix and tsc --noEmit when the conversation ends
    3. PreToolUse — blocks destructive git operations (force push, reset --hard, etc.)
    4. Context monitor — warns the agent when context window is running low, so it saves state instead of dying mid-task
  why: |
    Formatting and linting cost tokens when the agent does them manually. Hooks enforce them automatically with zero context cost — the agent writes code, the hooks keep it clean. The git guard prevents destructive operations even in auto-approve mode. The context monitor prevents the most common failure mode: the agent starting complex work right as context runs out.
  decisions:
    - Biome only. Arc is opinionated. Biome handles formatting and linting in one tool.
    - Git guard blocks force push, reset --hard, clean -f, checkout . — enforcement, not discipline.
    - Merges into existing settings. Never clobbers user permissions or MCP config.
    - Context monitor is optional but recommended. Users can skip it.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — REQUIRED for all user choices (Biome install options).

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process. Execute the steps below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<process>

## Step 0: Handle --remove flag

If the user passed `--remove`:

1. Read `.claude/settings.json`
2. Remove all Arc-installed hooks (identified by comments or known commands)
3. Write back the cleaned settings
4. Report what was removed
5. Done — skip all other steps

## Step 1: Detect Biome

```bash
grep -q '"@biomejs/biome"' package.json 2>/dev/null
```

**If Biome is in package.json:** Continue to Step 2.

**If Biome is NOT found:**

```yaml
AskUserQuestion:
  question: "Biome not found in package.json. Arc hooks require Biome for auto-formatting and linting. How would you like to proceed?"
  header: "Biome Required"
  options:
    - label: "Install Biome and continue"
      description: "Add @biomejs/biome as a dev dependency and set up all hooks"
    - label: "Skip formatting hooks"
      description: "Install context monitor and git guard only, skip Biome-dependent hooks"
    - label: "Cancel"
      description: "Exit without installing any hooks"
```

**If user picks "Install Biome and continue":**
```bash
# Detect package manager from lockfile
if [ -f pnpm-lock.yaml ]; then
  pnpm add -D @biomejs/biome
elif [ -f yarn.lock ]; then
  yarn add -D @biomejs/biome
else
  npm install -D @biomejs/biome
fi
```

Then check for `biome.json` / `biome.jsonc`. If missing:
```bash
npx @biomejs/biome init
```

**If user picks "Skip formatting hooks":** Set `SKIP_BIOME=true`, continue to Step 3.

**If user picks "Cancel":** Stop. Do not install any hooks.

## Step 2: Verify Biome works

```bash
./node_modules/.bin/biome --version
```

If this fails, the binary isn't available. Tell the user and offer to reinstall.

Also check for biome config:
```bash
ls biome.json biome.jsonc 2>/dev/null
```

If no config exists, note this — biome will use defaults, which is fine.

## Step 3: Build the hooks config

Build the hooks object to merge into `.claude/settings.json`.

**Biome format hook (PostToolUse, Edit|Write):**
```json
{
  "matcher": "Edit|Write|NotebookEdit",
  "hooks": [
    {
      "type": "command",
      "command": "jq -r '.tool_input.file_path // .tool_input.filePath // empty' | { read file_path; case \"$file_path\" in *.js|*.ts|*.jsx|*.tsx|*.json|*.jsonc|*.css|*.graphql) ./node_modules/.bin/biome format --write \"$file_path\" 2>/dev/null || true ;; esac; }"
    }
  ]
}
```

**Biome lint hook (Stop):**
```json
{
  "hooks": [
    {
      "type": "command",
      "command": "git diff --name-only --diff-filter=d HEAD 2>/dev/null | grep -E '\\.(js|ts|jsx|tsx|json|jsonc|css|graphql)$' | xargs -r ./node_modules/.bin/biome check --fix --unsafe 2>/dev/null || true"
    }
  ]
}
```

**TypeScript check hook (Stop):**

Only include this if the project has TypeScript (`tsconfig.json` exists).

```json
{
  "hooks": [
    {
      "type": "command",
      "command": "npx tsc --noEmit 2>&1 | tail -20 || true"
    }
  ]
}
```

**Git guard hook (PreToolUse, Bash):**

This hook blocks destructive git operations before they execute. Always install — not dependent on Biome.

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "jq -r '.tool_input.command' | grep -qE 'git\\s+(reset\\s+--hard|push\\s+(-f|--force)|clean\\s+-f|checkout\\s+\\.)' && echo '{\"decision\":\"block\",\"reason\":\"Destructive git operation blocked by Arc hooks. Ask the user first.\"}' || true"
    }
  ]
}
```

**Context monitor hook (PostToolUse, all tools):**

Determine the absolute path to Arc's `hooks/` directory by resolving the Arc install root from this skill's location. Use that resolved path as `${ARC_HOOKS_PATH}`.

Read `hooks/arc-context-monitor.js` from the resolved Arc install root to confirm it exists.

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "node ${ARC_HOOKS_PATH}/arc-context-monitor.js"
    }
  ]
}
```

Where `${ARC_HOOKS_PATH}` is the resolved absolute path to the Arc plugin's `hooks/` directory.

**Statusline hook:**
```json
{
  "type": "command",
  "command": "node ${ARC_HOOKS_PATH}/arc-statusline.js"
}
```

**If SKIP_BIOME is true:** Only include the git guard, context monitor, and statusline hooks. The tsc hook is independent of Biome — include it if `tsconfig.json` exists.

## Step 4: Read existing settings

```bash
cat .claude/settings.json 2>/dev/null
```

**If file doesn't exist:**
```bash
mkdir -p .claude
```
Start with an empty object `{}`.

**If file exists:** Parse the JSON. Preserve ALL existing fields (permissions, enabledMcpjsonServers, enableAllProjectMcpServers, enabledPlugins, etc.).

## Step 5: Merge hooks into settings

This is the critical step. NEVER clobber existing hooks — merge with them.

**Read the existing `hooks` object** (may be undefined).

**For PreToolUse:**
- Get existing `hooks.PreToolUse` array (or empty array)
- Check if an Arc git guard hook already exists (command contains `git.*reset.*--hard`)
- Add only if it doesn't exist

**For PostToolUse:**
- Get existing `hooks.PostToolUse` array (or empty array)
- Check if an Arc biome format hook already exists (command contains `biome format`)
- Check if an Arc context monitor hook already exists (command contains `arc-context-monitor`)
- Add new entries only if they don't already exist
- Biome format hook and context monitor hook are separate entries (different matchers)

**For Stop:**
- Get existing `hooks.Stop` array (or empty array)
- Check if an Arc biome lint hook already exists (command contains `biome check`)
- Check if an Arc tsc hook already exists (command contains `tsc --noEmit`)
- Add each only if it doesn't exist
- If no `tsconfig.json` in the project, skip the tsc hook

**For Statusline:**
- Get existing `hooks.Statusline` array (or empty array)
- Check if Arc statusline already exists (command contains `arc-statusline`)
- Add only if it doesn't exist

**Write the merged settings back:**
Use the Write tool to write the complete JSON (pretty-printed with 2-space indent).

**CRITICAL: Preserve all non-hook fields exactly as they were.** Do not add, remove, or modify anything outside the `hooks` key.

## Step 6: Verify installation

Read back `.claude/settings.json` and confirm the hooks are present.

Count installed hooks:
- PreToolUse entries
- PostToolUse entries
- Stop entries
- Statusline entries

## Step 7: Report

```
Arc hooks installed in .claude/settings.json

  PreToolUse  (Bash)        →  blocks destructive git ops (force push, reset --hard)
  PostToolUse (Edit|Write)  →  biome format --write on edited file
  PostToolUse (all tools)   →  context monitor (warns at 35%/25% remaining)
  Stop                      →  biome check --fix --unsafe on all changed files
  Stop                      →  tsc --noEmit (if tsconfig.json exists)
  Statusline                →  context bar showing usage

Hooks run automatically — zero token cost, zero agent effort.

To remove: /arc:hooks --remove
```

If `SKIP_BIOME` was true:
```
Arc hooks installed in .claude/settings.json

  PreToolUse  (Bash)        →  blocks destructive git ops (force push, reset --hard)
  PostToolUse (all tools)   →  context monitor (warns at 35%/25% remaining)
  Statusline                →  context bar showing usage

Biome hooks skipped (not installed). Run /arc:hooks again after adding Biome.

To remove: /arc:hooks --remove
```

</process>

<notes>
- The biome format hook uses `jq` to extract the file path from the tool input. This is standard on macOS (via Homebrew) and most Linux distros. If jq is missing, the hook silently fails (|| true).
- The Stop hook uses `xargs -r` which is a no-op if there are no files. On macOS, `xargs` without `-r` still works (just runs biome with no args, which exits cleanly).
- The context monitor hooks reference files inside the Arc plugin. If the user uninstalls Arc, these hooks will silently fail (node script not found → exit 1, but hooks don't block).
- `--unsafe` in the Stop hook enables Biome's unsafe fixes (like removing unused imports). This is intentional — at conversation end, we want maximum cleanup.
- The PostToolUse format hook handles both `file_path` (Edit tool) and `filePath` (NotebookEdit) via jq fallback.
- The tsc hook uses `tail -20` to avoid flooding the stop output — just enough to see if there are errors and what they are.
- The git guard uses PreToolUse with `decision: block` to stop destructive commands before execution. This is especially important for users running with `--dangerously-skip-permissions` or liberal auto-approve settings.
- The git guard blocks: `git reset --hard`, `git push --force` / `git push -f`, `git clean -f`, `git checkout .`. These are the operations that destroy uncommitted work with no undo.
</notes>
