# Git Workflow

## Commits

- NEVER: Auto-commit changes; allow review first.
- MUST: Stage and review changes before committing.
- SHOULD: Use conventional commit messages when practical.
- SHOULD: Use `gh` CLI for GitHub operations (PRs, issues, etc.).

## Pre-commit Hooks

- MUST: New projects use Husky + lint-staged for pre-commit checks.
- MUST: lint-staged runs **format only** (`biome format --write`), not `biome check`.
- MUST: Lint and typecheck run as **separate hook steps** on the full project.
- SHOULD: Run typecheck (`tsc --noEmit`) on commit for small/new projects.
- SHOULD: Move typecheck to pre-push hook for larger projects (>200 files).
- NEVER: Write manual `git stash push/pop` in hooks — lint-staged handles this safely.
- NEVER: Disable hooks permanently; use `--no-verify` sparingly for WIP commits.

### Why format-only in lint-staged?

lint-staged only passes the staged files to the command. `biome check` (format + lint)
will fail on pre-existing lint warnings in staged files that aren't part of the current
change. Keep formatting scoped to staged files, and lint the full project separately.

Manual `git stash push --keep-index` / `git stash pop` in hooks is fragile — if any step
fails, conflict markers get baked into the working tree and every subsequent commit
re-introduces them in an unrecoverable loop.

### Setup

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

### Pre-commit Hook (.husky/pre-commit)

```bash
pnpm lint-staged
pnpm lint
pnpm typecheck
```

### lint-staged Config (package.json)

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx,json,jsonc,css}": "biome format --write --no-errors-on-unmatched"
  }
}
```

### Monorepo Variant (.husky/pre-commit)

```bash
pnpm lint-staged
pnpm lint:strict
pnpm manypkg check
pnpm turbo run typecheck check-types
```

## Claude Code Hooks

Projects should also configure Claude Code hooks to lint and format on file changes
during AI-assisted coding sessions. This catches issues in real-time instead of only
at commit time.

### .claude/settings.json

Use `biome check --fix --unsafe` (not `biome format --write` + `biome lint` separately).
`check --fix` combines format + lint fix in a single pass, so rules like `useSortedClasses`
(Tailwind class sorting) are applied automatically.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | { read file_path; case \"$file_path\" in *.js|*.ts|*.jsx|*.tsx|*.json|*.jsonc|*.css|*.graphql) pnpm biome check --fix --unsafe \"$file_path\" 2>/dev/null || true ;; esac; }"
          }
        ]
      }
    ]
  }
}
```
