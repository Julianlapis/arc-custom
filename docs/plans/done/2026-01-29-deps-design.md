# /arc:deps Design

## Problem Statement

Dependency management is neglected until something breaks. `npm audit` is noisy, `npm outdated` gives raw data without context, and nobody proactively checks whether their dependencies have modern, lighter alternatives. The result: bloated bundles, known CVEs in production, and deprecated packages that get harder to replace the longer you wait.

## Approach

A single skill that audits dependencies across four dimensions (CVEs, staleness, deprecation, modern alternatives), generates a prioritized report with pre-computed upgrade batches, then optionally walks through batch upgrades with test verification and rollback on failure.

## Workflow

```
/arc:deps [--apply] [--cve-only]

Phase 1: Audit
  ├── Detect package manager (npm/pnpm/yarn/bun)
  ├── Run vulnerability audit (critical/high only)
  ├── Run outdated check (major/minor/patch)
  └── Read package.json for full dependency list

Phase 2: Alternative Discovery
  ├── Match deps against curated alternatives reference
  └── WebSearch fallback for flagged deps not in curated list

Phase 3: Report
  ├── Generate docs/audits/YYYY-MM-DD-deps-audit.md
  ├── Prioritized findings (must fix → should consider → worth noting)
  ├── Pre-computed upgrade batches
  └── Commit report

Phase 4: Interactive Walkthrough (optional)
  ├── Present batches with AskUserQuestion
  ├── User approves/skips each batch
  └── For each approved batch:
      ├── Git checkpoint
      ├── Run upgrade commands
      ├── Type check (tsc --noEmit)
      ├── Run tests
      ├── Pass → commit "deps: upgrade [batch]"
      └── Fail → rollback, report which package broke
```

## Severity Classification

| Category | Criteria | Priority |
|----------|----------|----------|
| Critical CVE | Known vulnerability, critical/high severity | Must fix |
| Deprecated | Package marked deprecated on npm | Should consider |
| Has modern alternative | Curated or discovered replacement exists | Should consider |
| Major outdated | 2+ major versions behind | Should consider |
| Minor/patch outdated | Behind on minor or patch | Worth noting |

## Alternative Discovery — Two Tiers

### Tier 1: Curated Reference File

`references/dependency-alternatives.md` ships with the plugin. Maintained mapping of known replacements:

| Package | Alternative | Reason |
|---------|-------------|--------|
| lodash | es-toolkit | 97% smaller, modern ESM, tree-shakeable |
| moment | date-fns | Immutable, tree-shakeable, actively maintained |
| request | undici / native fetch | request is deprecated, fetch is built-in |
| axios | ky / native fetch | Smaller, modern, fetch-based |
| underscore | es-toolkit | Same story as lodash |
| classnames | clsx | Smaller, faster |
| uuid | crypto.randomUUID() | Built-in, no dependency needed |
| chalk | picocolors | 14x smaller, faster |
| dotenv | Node --env-file flag | Built-in since Node 20.6 |
| node-fetch | native fetch | Built-in since Node 18 |
| rimraf | fs.rm({ recursive: true }) | Built-in since Node 14.14 |
| mkdirp | fs.mkdir({ recursive: true }) | Built-in since Node 10.12 |
| glob | fs.glob() / tinyglobby | fs.glob built-in in Node 22, tinyglobby for older |
| express | hono | Lighter, modern, works everywhere |
| body-parser | express built-in | Built into Express 4.16+ |
| cors | hono/cors or manual headers | Middleware bloat for a few headers |

### Tier 2: Web Search Fallback

For deps not in curated list that are: 2+ major versions outdated, have a critical/high CVE, or are deprecated.

Search: `"alternative to [package-name] npm 2026"`

Synthesize top result into recommendation or "no clear alternative found."

## Upgrade Batches

Pre-computed in the report, executed in the interactive phase:

| Batch | Contents | Risk | Strategy |
|-------|----------|------|----------|
| 1. Safe patches | Minor/patch updates | Low | Apply together, test once |
| 2. CVE fixes | Security-critical updates | Medium | Apply together, test once |
| 3. Major upgrades | Major version bumps | High | Apply individually, test each |
| 4. Replacements | Package swaps | High | Flag only — needs code changes |

### Batch Apply Cycle

```
1. Create git checkpoint (commit current state)
2. Run upgrade commands
3. Run type check (tsc --noEmit)
4. Run tests (auto-detect: vitest/jest/playwright)
5. Pass → commit "deps: upgrade [batch description]"
6. Fail → git restore, report which package broke
```

### Replacement Handling

Replacements are NOT auto-applied. The skill:
1. Installs the new package
2. Tells the user what to migrate
3. Suggests running `/arc:build` for the migration work
4. The old package stays until all imports are updated

## Report Structure

```markdown
# Dependency Audit Report

**Date:** YYYY-MM-DD
**Package Manager:** [detected]
**Total dependencies:** N (N prod, N dev)
**Node version:** [detected]

## Summary
- Critical CVEs: N
- Deprecated packages: N
- Modern alternatives available: N
- Major version outdated: N
- Minor/patch outdated: N

## Must Fix — CVEs
[Each CVE with package, version, fix command, and alternative if exists]

## Should Consider — Alternatives
[Each alternative with current package, replacement, migration effort, bundle impact]

## Should Consider — Major Outdated
[Each major-behind package with changelog highlights and risk assessment]

## Worth Noting — Minor Outdated
[Table of minor/patch updates]

## Upgrade Batches
[Pre-computed batches as described above]
```

## Next Steps After Report

Options presented via AskUserQuestion:
1. **Apply safe patches now** — Batch 1, low risk
2. **Walk through all batches** — Review each, approve/skip
3. **Apply CVE fixes only** — Just security-critical
4. **Done for now** — Report committed, come back later

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single skill, no agent | Curated list handles 80%+ of cases. Web search fallback is rare. |
| Curated alternatives as reference file | Easy to maintain, grows over time, instant lookup. |
| Web search for unlisted deps | Catches the long tail without maintaining exhaustive list. |
| Pre-computed batches in report | Report is useful standalone even without interactive phase. |
| Rollback on test failure | One broken upgrade shouldn't block the rest. |
| Replacements flagged, not auto-applied | Import changes are too risky for automated swap. |
| Skip moderate/low CVEs | Noise reduction. Only critical/high are actionable urgently. |
| devDependencies in outdated, not CVE urgency | Dev deps don't ship to users but should stay current. |

## Files to Create

1. `skills/deps/SKILL.md` — The skill
2. `references/dependency-alternatives.md` — Curated swap mapping
