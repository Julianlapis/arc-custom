# /arc:deps Implementation Plan

> **For Claude:** Use /arc:implement to implement this plan task-by-task.

**Design:** docs/plans/2026-01-29-deps-design.md
**Goal:** Create the /arc:deps skill — dependency audit, alternative discovery, report generation, and batch upgrades with test verification and rollback.
**Stack:** Claude Code plugin (markdown skills + reference files). No compiled code — plugin validation is the test.

---

## Task 1: Create the curated dependency alternatives reference

The foundation file. Every other phase references this.

**Files:**
- Create: `references/dependency-alternatives.md`

**Content:**

A markdown reference file with YAML frontmatter (matching existing references like `references/architecture-patterns.md`) containing:
- A prose intro explaining the two-tier lookup system
- The curated alternatives table from the design doc (16 entries)
- Guidance on when to trigger web search fallback
- Instructions for adding new entries

**Verify:**
```bash
# File exists and has the alternatives table
grep "es-toolkit" references/dependency-alternatives.md
# Plugin validation passes
```

**Commit:** `feat(deps): add curated dependency alternatives reference`

---

## Task 2: Create the deps skill — frontmatter and Phase 1 (Audit)

The skill file with frontmatter and the first phase: detecting package manager and running audit + outdated commands.

**Files:**
- Create: `skills/deps/SKILL.md`

**Frontmatter fields** (follow existing skill patterns like `skills/audit/SKILL.md`):
- `name: deps`
- `description:` — Dependency audit, alternative discovery, batch upgrades
- `license: MIT`
- `argument-hint: [--apply] [--cve-only]`
- `metadata:` — author, website order, desc, summary, what, why, decisions

**Phase 1 content — Audit & Outdated Detection:**

1. Parse arguments (`$ARGUMENTS` for `--apply`, `--cve-only`)
2. Detect package manager:
   - Glob: `pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `package-lock.json` → npm, `bun.lockb` → bun
3. Run vulnerability audit:
   ```
   pnpm audit --json 2>/dev/null | ...filter critical/high...
   npm audit --json 2>/dev/null | ...filter critical/high...
   ```
4. Run outdated check:
   ```
   pnpm outdated --json 2>/dev/null
   npm outdated --json 2>/dev/null
   ```
5. Read `package.json` for full dependency list
6. Detect Node version: `node --version`
7. Detect test runner (Glob: `vitest.config.*`, `jest.config.*`, `playwright.config.*`)
8. Classify findings into severity buckets (Critical CVE / Deprecated / Major outdated / Minor outdated)

**Verify:**
```bash
# Skill file exists with correct frontmatter
grep "^name: deps" skills/deps/SKILL.md
# Plugin validation passes
```

**Commit:** `feat(deps): add skill with Phase 1 audit detection`

---

## Task 3: Add Phase 2 — Alternative Discovery

Append to `skills/deps/SKILL.md`: the alternative discovery phase.

**Files:**
- Modify: `skills/deps/SKILL.md`

**Phase 2 content — Alternative Discovery:**

1. Load curated alternatives:
   ```
   Read: ${CLAUDE_PLUGIN_ROOT}/references/dependency-alternatives.md
   ```
2. For each dependency in the project, check against curated table
3. For flagged deps NOT in curated list (2+ major outdated, critical CVE, or deprecated):
   - Use WebSearch: `"alternative to [package-name] npm 2026"`
   - Synthesize result into recommendation or "no clear alternative found"
4. Skip web search for deps that are: current, healthy, not in curated list
5. Compile alternatives list with: package name, alternative, reason, migration effort estimate (low/medium/high), bundle impact estimate

**Verify:**
```bash
# Phase 2 section exists
grep "Alternative Discovery" skills/deps/SKILL.md
grep "WebSearch" skills/deps/SKILL.md
```

**Commit:** `feat(deps): add Phase 2 alternative discovery`

---

## Task 4: Add Phase 3 — Report Generation

Append to `skills/deps/SKILL.md`: the report generation phase.

**Files:**
- Modify: `skills/deps/SKILL.md`

**Phase 3 content — Report:**

1. Create directory: `mkdir -p docs/audits`
2. Generate report file: `docs/audits/YYYY-MM-DD-deps-audit.md`
3. Report structure (from design doc):
   - Header: date, package manager, total deps, node version
   - Summary: counts per severity category
   - Must Fix — CVEs: each CVE with package, version, fix command, alternative
   - Should Consider — Alternatives: each with current, replacement, effort, bundle impact
   - Should Consider — Major Outdated: each with changelog highlights, risk
   - Worth Noting — Minor Outdated: table of minor/patch updates
   - Upgrade Batches: pre-computed batches (safe patches, CVE fixes, major upgrades, replacements)
4. Commit the report:
   ```bash
   git add docs/audits/
   git commit -m "docs: add dependency audit report"
   ```

**Verify:**
```bash
# Report template is in the skill
grep "docs/audits/YYYY-MM-DD-deps-audit" skills/deps/SKILL.md
grep "Upgrade Batches" skills/deps/SKILL.md
```

**Commit:** `feat(deps): add Phase 3 report generation`

---

## Task 5: Add Phase 4 — Interactive Walkthrough & Batch Apply

Append to `skills/deps/SKILL.md`: the interactive walkthrough and batch apply phase.

**Files:**
- Modify: `skills/deps/SKILL.md`

**Phase 4 content — Interactive Walkthrough:**

1. Present summary to user (same pattern as audit Phase 6):
   ```
   Dependency audit complete.
   Report: docs/audits/YYYY-MM-DD-deps-audit.md

   Summary:
   - Critical CVEs: N | Alternatives: N | Major outdated: N

   Suggested batches:
   1. Safe patches (N packages) — low risk
   2. CVE fixes (N packages) — high priority
   3. Major upgrades (N packages) — test carefully
   4. Replacements (N packages) — separate PRs
   ```

2. Offer next steps via AskUserQuestion:
   - Apply safe patches now
   - Walk through all batches
   - Apply CVE fixes only
   - Done for now

3. Batch Apply Cycle (for each approved batch):
   - Git checkpoint: `git add -A && git commit -m "checkpoint: before [batch] upgrade"`
   - Run upgrade commands (package-manager-specific)
   - Type check: `tsc --noEmit` (if TypeScript project)
   - Run tests (auto-detect runner from Phase 1)
   - Pass → `git add -A && git commit -m "deps: upgrade [batch description]"`
   - Fail → `git restore . && git clean -fd` back to checkpoint, report which package broke, continue to next batch

4. Replacement handling (Batch 4):
   - Install new package only
   - Report: "Installed [alternative]. [old package] still in package.json."
   - Suggest: "Replace imports, then remove old package. Run /arc:build for migration."

5. Final summary after all batches:
   - Packages upgraded: N
   - Batches applied: N
   - Batches skipped: N
   - Failures rolled back: N
   - Replacements flagged: N

**Verify:**
```bash
# Batch apply cycle is documented
grep "checkpoint" skills/deps/SKILL.md
grep "git restore" skills/deps/SKILL.md
grep "AskUserQuestion" skills/deps/SKILL.md
```

**Commit:** `feat(deps): add Phase 4 interactive walkthrough and batch apply`

---

## Task 6: Add progress_append and success_criteria blocks

Append to `skills/deps/SKILL.md`: the standard Arc plugin skill completion blocks.

**Files:**
- Modify: `skills/deps/SKILL.md`

**Content:**

`<progress_append>` block (same pattern as audit/ideate):
```markdown
## YYYY-MM-DD HH:MM — /arc:deps
**Task:** Dependency audit
**Outcome:** Complete
**Files:** docs/audits/YYYY-MM-DD-deps-audit.md
**Decisions:**
- Critical CVEs: N
- Alternatives found: N
- Batches applied: N
**Next:** [Apply batches / Migration work / Done]

---
```

`<success_criteria>` block:
- [ ] Package manager detected
- [ ] Vulnerability audit run (critical/high only)
- [ ] Outdated check run
- [ ] Curated alternatives matched
- [ ] Web search run for flagged unlisted deps
- [ ] Report generated in docs/audits/
- [ ] Report committed
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Batches applied (if user chose to apply)
- [ ] Test verification after each batch
- [ ] Rollback on failure
- [ ] Progress journal updated

**Verify:**
```bash
grep "success_criteria" skills/deps/SKILL.md
grep "progress_append" skills/deps/SKILL.md
```

**Commit:** `feat(deps): add progress and success criteria blocks`

---

## Task 7: Register skill in plugin and verify end-to-end

Final verification that the plugin recognizes the new skill and all validation passes.

**Files:**
- Verify: `.claude-plugin/plugin.json` (skills are auto-discovered from `skills/` — confirm this)
- Verify: `skills/deps/SKILL.md` (complete skill file)
- Verify: `references/dependency-alternatives.md` (reference file)

**Steps:**
1. Run plugin validation:
   ```bash
   # The pre-commit hook runs validation automatically
   # But we can also check manually:
   grep -l "deps" skills/deps/SKILL.md
   ```
2. Verify the skill frontmatter is parseable (no YAML syntax errors)
3. Verify all `${CLAUDE_PLUGIN_ROOT}` references point to real files
4. Verify the reference file is well-formed markdown
5. Review the complete skill file end-to-end for consistency

**Commit:** No commit needed if everything passes. If fixes needed, commit as `fix(deps): [description]`

---

## Summary

| Task | Description | Creates/Modifies |
|------|-------------|-----------------|
| 1 | Curated alternatives reference | `references/dependency-alternatives.md` |
| 2 | Skill frontmatter + Phase 1 (audit) | `skills/deps/SKILL.md` |
| 3 | Phase 2 (alternative discovery) | `skills/deps/SKILL.md` |
| 4 | Phase 3 (report generation) | `skills/deps/SKILL.md` |
| 5 | Phase 4 (interactive walkthrough + batch apply) | `skills/deps/SKILL.md` |
| 6 | Progress append + success criteria | `skills/deps/SKILL.md` |
| 7 | End-to-end verification | (verification only) |

**Total tasks:** 7
**Ordering:** Foundation up — reference file first, then skill phases in order, completion blocks last, verification final.
