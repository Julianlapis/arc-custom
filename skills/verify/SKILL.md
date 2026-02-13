---
name: verify
disable-model-invocation: true
description: |
  Run sequential verification checks on the current codebase. Build, typecheck,
  lint, tests, debug log audit, and git status. Stops on critical failures.
  Supports modes: quick, full, pre-commit, pre-pr.
license: MIT
metadata:
  author: howells
website:
  order: 11
  desc: Run all checks
  summary: Sequential build, typecheck, lint, test, and debug log verification. Stops on critical failures and reports a summary.
  what: |
    Verify runs your full check suite in order — build, typecheck, lint, tests, debug log audit, git status. If build fails, it stops immediately (no point checking types if it doesn't compile). Reports a concise pass/fail summary table. Supports quick mode for fast feedback and pre-pr mode for thorough checks.
  why: |
    Running checks manually means forgetting steps. Verify runs them in the right order, stops early on critical failures, and gives you a clear go/no-go answer. Use it before commits, before PRs, or anytime you want to know "is this codebase clean?"
  decisions:
    - Sequential with early abort. Build must pass before types are checked.
    - Auto-detects tooling. Finds biome vs eslint, vitest vs jest, pnpm vs npm.
    - No agents needed. Simple procedural checks, no subagent overhead.
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. This is a procedural skill. Execute it directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

# Verify Workflow

Run sequential verification checks. Stop on critical failures.

## Step 0: Detect Tooling

Before running checks, detect the project's tooling:

**Package manager:**
- `pnpm-lock.yaml` → `pnpm`
- `bun.lockb` or `bun.lock` → `bun`
- `yarn.lock` → `yarn`
- `package-lock.json` → `npm`

**Linter:**
- `biome.json` or `biome.jsonc` → `[pm] biome check .`
- `.eslintrc*` or `eslint.config.*` → `[pm] eslint .`

**Test framework:**
- `vitest.config.*` → `[pm] vitest run`
- `jest.config.*` → `[pm] jest`

**Type checker:**
- `tsconfig.json` → `[pm] tsc --noEmit`

**Build:**
- Check `package.json` scripts for `build` → `[pm] run build`

## Step 1: Parse Mode

`$ARGUMENTS` determines the mode:

| Argument | Mode | Checks |
|----------|------|--------|
| `quick` | Quick | Build + types only |
| `full` or (none) | Full | All checks |
| `pre-commit` | Pre-commit | Build + types + lint + debug logs (skip tests) |
| `pre-pr` | Pre-PR | All checks + search for hardcoded secrets |

## Step 2: Run Checks (in order)

Execute each check sequentially. If a check fails critically, report it and stop.

### 2a. Build Check

```bash
[pm] run build
```

- **If FAIL:** Report errors and **STOP** — nothing else matters if it doesn't build
- **If PASS:** Continue

### 2b. Type Check

```bash
[pm] tsc --noEmit
```

- Report error count and locations (`file:line`)
- Continue even if there are errors (report them in summary)

### 2c. Lint Check

```bash
[pm] biome check .
# or
[pm] eslint .
```

- Try auto-fix first: `[pm] biome check --write .`
- Report remaining issues
- Continue

### 2d. Test Suite (skip in `quick` and `pre-commit` modes)

```bash
[pm] vitest run
# or
[pm] jest
```

- Report pass/fail counts
- Report coverage percentage if available
- Continue

### 2e. Debug Log Audit

Search for leftover debug statements in source files (not test files):

**Use Grep tool:** Pattern `console\.(log|debug|dir|table)` in `src/` or `app/` directories, excluding `*.test.*` and `*.spec.*` files

- Report locations
- Note: `console.warn` and `console.error` are intentional — don't flag those

### 2f. Git Status

```bash
git status --short
git diff --stat
```

- Report uncommitted changes count
- Report staged vs unstaged

### 2g. Secrets Scan (pre-pr mode only)

**Use Grep tool:** Search for patterns that suggest hardcoded secrets:
- `sk_live_`, `sk_test_`, `pk_live_`, `pk_test_` (Stripe)
- `AKIA` (AWS access keys)
- `ghp_`, `gho_`, `ghs_` (GitHub tokens)
- `xoxb-`, `xoxp-` (Slack tokens)
- Strings assigned to variables named `*_KEY`, `*_SECRET`, `*_TOKEN` that look like real values (not env var references)

Exclude: `.env*`, `*.example`, `*.md`, `node_modules/`

## Step 3: Summary Report

```
VERIFICATION: [PASS / FAIL]

Build:      [OK / FAIL]
Types:      [OK / X errors]
Lint:       [OK / X issues]
Tests:      [X/Y passed / SKIPPED]
Debug logs: [OK / X found]
Git:        [clean / X uncommitted]
Secrets:    [OK / X found / SKIPPED]

Ready for PR: [YES / NO]
```

If any check failed, list the specific issues below the table with file:line references and brief fix suggestions.

## Edge Cases

- **No build script:** Skip build check, note it in summary
- **No test framework:** Skip tests, note it in summary
- **No TypeScript:** Skip type check, note it in summary
- **Monorepo:** If `turbo.json` or root `pnpm-workspace.yaml` exists, run checks at the workspace level (`turbo build`, `turbo typecheck`)

## What Verify Does NOT Do

- Fix issues (use the fixer agent for that)
- Run E2E tests (use /arc:testing for that)
- Block anything — it reports, the developer decides
- Modify any files
