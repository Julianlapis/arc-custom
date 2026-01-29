---
name: deps
description: |
  Dependency audit, alternative discovery, and batch upgrades with test verification.
  Use when asked to "check dependencies", "audit packages", "update dependencies",
  "find outdated packages", or "check for CVEs". Generates a prioritized report,
  then optionally walks through batch upgrades with rollback on failure.
license: MIT
argument-hint: [--apply] [--cve-only]
metadata:
  author: howells
website:
  order: 15
  desc: Dependency audit
  summary: Audit dependencies for CVEs, outdated packages, and modern alternatives. Optionally batch-upgrade with test verification and rollback.
  what: |
    Deps audits your project's dependencies across four dimensions: known vulnerabilities (CVEs), staleness (major/minor/patch behind), deprecation status, and modern alternatives (lodash → es-toolkit, moment → date-fns). It generates a prioritized report with pre-computed upgrade batches, then optionally walks you through applying them—with test verification after each batch and automatic rollback on failure.
  why: |
    Dependency management is neglected until something breaks. npm audit is noisy, npm outdated gives raw data without context, and nobody proactively checks whether their dependencies have lighter, modern alternatives. Deps gives you the full picture in one command.
  decisions:
    - Report first, act later. The report is useful standalone—batches are pre-computed so you can work through them manually or let the tool apply them.
    - Curated alternatives for common cases. A maintained reference file covers lodash, moment, chalk, and other common swaps instantly. Web search catches the long tail.
    - Rollback on failure. Each batch is checkpointed. If tests break, the upgrade is reverted and the next batch proceeds.
---

<process>

**Announce at start:** "I'm using the deps skill to audit your dependencies for vulnerabilities, outdated packages, and modern alternatives."

## Phase 1: Audit & Outdated Detection

**Parse arguments:**
- `$ARGUMENTS` may contain:
  - `--apply` — Skip straight to batch apply after report (no interactive menu)
  - `--cve-only` — Only report and fix CVE vulnerabilities, skip alternatives and outdated

**Detect package manager:**

**Use Glob tool in parallel:**

| Pattern | Package Manager |
|---------|----------------|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `package-lock.json` | npm |
| `bun.lockb` | bun |

If multiple found, prefer pnpm > yarn > npm > bun.

**Run vulnerability audit:**

```bash
# pnpm
pnpm audit --json 2>/dev/null

# npm
npm audit --json 2>/dev/null

# yarn
yarn audit --json 2>/dev/null
```

Filter to **critical and high severity only.** Ignore moderate and low — they create noise without actionable urgency.

**Run outdated check:**

```bash
# pnpm
pnpm outdated --json 2>/dev/null

# npm
npm outdated --json 2>/dev/null

# yarn
yarn outdated --json 2>/dev/null
```

**Read package.json** for full dependency list (both `dependencies` and `devDependencies`).

**Detect environment:**

```bash
node --version
```

**Detect test runner** (needed for batch apply phase):

**Use Glob tool:**

| Pattern | Test Runner |
|---------|-------------|
| `vitest.config.*` | vitest |
| `jest.config.*` | jest |
| `playwright.config.*` | playwright |
| `cypress.config.*` | cypress |

Also check `package.json` scripts for `test` command.

**Classify findings into severity buckets:**

| Category | Criteria | Priority |
|----------|----------|----------|
| Critical CVE | Known vulnerability, critical/high severity | Must fix |
| Deprecated | Package marked deprecated on npm registry | Should consider |
| Has modern alternative | Match found in curated list or web search | Should consider |
| Major outdated | 2+ major versions behind current | Should consider |
| Minor/patch outdated | Behind on minor or patch version | Worth noting |

**Summarize detection:**
```
Package manager: [pnpm/npm/yarn/bun]
Node version: [version]
Test runner: [vitest/jest/playwright/none detected]
Total dependencies: N (N prod, N dev)
Critical/high CVEs: N
Outdated packages: N (N major, N minor, N patch)
```

</process>
