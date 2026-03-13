---
name: audit
context: fork
description: |
  Comprehensive codebase audit with specialized reviewers. Generates actionable reports.
  Use when asked to "audit the codebase", "review code quality", "check for issues",
  "security review", or "performance audit". Accepts path scope like "apps/web".

  Reviewers run in batches of 2 by default to avoid resource exhaustion.
  Use --parallel to run all reviewers simultaneously (resource-intensive).
  Use --diff to scope audit to files changed vs main branch (or specify base: --diff develop).
  Use --docs for a focused JSDoc/documentation coverage audit.
  Use --copy for a focused UX writing/copy quality audit.
license: MIT
argument-hint: <path-or-focus> [--parallel] [--diff [base]] [--stage=prototype|development|pre-launch|production] [--security|--performance|--architecture|--organization|--design|--accessibility|--hygiene|--seo|--docs|--copy]
metadata:
  author: howells
website:
  order: 13
  desc: Codebase audit
  summary: Run a comprehensive audit of your entire codebase—or target a specific area. Spawns specialist reviewers for security, performance, architecture, and more.
  what: |
    Audit spins up multiple specialist agents—security, performance, architecture, data, UI, simplicity—each analyzing your code through their lens. Run it on your whole project before launch, or target a specific path (`/arc:audit apps/api`) for focused feedback. Each agent works independently, then findings are consolidated into a single report: critical issues first, then warnings, then suggestions. The output is a markdown file you can work through or convert into tasks.
  why: |
    A security expert misses performance issues. A performance expert misses architectural violations. A frontend expert misses data integrity problems. Audit gives you a panel of specialists in one command—the kind of thorough review you'd want before shipping, without coordinating six different people.
  decisions:
    - Whole project or targeted. Run on everything, or scope to a path like `src/lib/auth`.
    - Agents run in batches (2 at a time by default). Use `--parallel` for speed if you have resources.
    - Focus flags available. `--security`, `--performance`, `--design`, `--docs`, `--copy` for targeted audits.
  agents:
    - security-engineer
    - performance-engineer
    - architecture-engineer
    - organization-engineer
    - daniel-product-engineer
    - lee-nextjs-engineer
    - senior-engineer
    - designer
    - data-engineer
    - documentation-engineer
    - ux-writing-engineer
  workflow:
    position: utility
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own structured process. Execute the steps below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<tasklist_context>
**Use TaskList tool** to check for existing tasks related to this work.

If a related task exists, note its ID and mark it `in_progress` with TaskUpdate when starting.
</tasklist_context>

<required_reading>
**Read these reference files NOW:**
1. disciplines/dispatching-parallel-agents.md
2. references/audit-stage-calibration.md
</required_reading>

<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Check for recent changes that should be included in audit scope.
</progress_context>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**Determine rules source:**
- **If `.ruler/` exists:** Read rules from `.ruler/`
- **If `.ruler/` doesn't exist:** Read rules from `rules/`

**Detect stack and read relevant rules from the rules source:**

| Check | Read |
|-------|------|
| Always | code-style.md, stack.md |
| `next.config.*` exists | nextjs.md |
| `react` in package.json | react.md |
| `tailwindcss` in package.json | tailwind.md |
| `.ts` or `.tsx` files | typescript.md |
| `vitest` or `jest` in package.json | testing.md |
| `drizzle` or `prisma` in package.json | api.md |
| `.env*` files exist | env.md |

Pass relevant rules to each reviewer agent.

**For each reviewer, pass domain-specific core rules:**

| Reviewer | Core Rules to Pass |
|----------|-------------------|
| security-engineer | api.md, env.md, integrations.md, auth.md (if Clerk/WorkOS), react-correctness.md (security section) |
| architecture-engineer | stack.md, turborepo.md |
| lee-nextjs-engineer | nextjs.md, api.md, react-correctness.md (Next.js-specific rules) |
| senior-engineer | code-style.md, typescript.md, react.md, ai-sdk.md (if AI SDK) |
| data-engineer | testing.md, api.md |
| organization-engineer | turborepo.md, code-style.md |
| hygiene-engineer | stack.md, code-style.md, ai-sdk.md (if AI SDK) |
| documentation-engineer | typescript.md, code-style.md |
| ux-writing-engineer | code-style.md |
| daniel-product-engineer | react.md, typescript.md, ai-sdk.md (if AI SDK), react-performance.md, react-correctness.md |
| performance-engineer | react-performance.md |
| seo-engineer | seo.md |

**For UI/frontend audits, also load interface rules:**

| Reviewer | Interface Rules to Pass |
|----------|------------------------|
| designer | design.md, colors.md, typography.md, marketing.md |
| daniel-product-engineer | forms.md, interactions.md, animation.md, performance.md |
| lee-nextjs-engineer | layout.md, performance.md |
| ux-writing-engineer | content-accessibility.md, marketing.md |

Interface rules location: `rules/interface/`

Pass relevant rules to each UI reviewer in their prompt. These inform what to look for, not mandates to redesign.

**UI polish checks — include in prompts for designer and daniel-product-engineer:**

In addition to their domain-specific rules, both UI reviewers should verify:
- No layout shift on dynamic content (hardcoded dimensions, `tabular-nums`, no font-weight changes on hover)
- Animations have `prefers-reduced-motion` support
- Touch targets are 44px minimum
- Hover effects gated behind `@media (hover: hover)`
- Keyboard navigation works (tab order, focus trap in modals, arrow keys in lists)
- Icon-only buttons have `aria-label`
- Forms submit with Enter; textareas with ⌘/Ctrl+Enter
- Inputs are `text-base` (16px+) to prevent iOS zoom
- No `transition: all` — specify exact properties
- z-index uses fixed scale or `isolation: isolate`
- No flash on refresh for interactive state (tabs, theme, toggles)
- Destructive actions require confirmation (`AlertDialog`, not `confirm()`)
</rules_context>

<process>
## Phase 1: Detect Scope & Project Type

**Parse arguments:**
- `$ARGUMENTS` may contain:
  - A path (e.g., `apps/web`, `packages/ui`, `src/`)
  - A focus flag (e.g., `--security`, `--performance`, `--architecture`, `--design`)
  - `--parallel` flag to run all reviewers simultaneously (resource-intensive)
  - `--diff` or `--diff [base]` flag to scope audit to only changed files vs a base branch
  - A stage override (e.g., `--stage=production`, `--stage=prototype`)
  - Combinations (e.g., `apps/web --security`, `src/ --parallel`, `--design`, `--diff develop`)

**If `--diff` flag is set:**

Determine changed files:
```bash
# Default base is main, user can override with --diff develop
git diff --name-only --diff-filter=ACMR ${base:-main}...HEAD | grep -E '\.(tsx?|jsx?|py|go|rs)$'
```

Store the file list. Pass it to every reviewer agent as a scope constraint:
```
IMPORTANT: Only review these files (changed in current branch):
[file list]

Do not flag issues in files not on this list.
```

If `--diff` produces 0 files, report "No changed files found vs [base]" and exit.

**If no scope provided:**

**Use Glob tool to detect structure:**
- `apps/*`, `packages/*` → monorepo (audit both)
- `src/*` → standard (audit src/)
- Neither → audit current directory

**Detect project type with Glob + Grep:**

| Check | Tool | Pattern |
|-------|------|---------|
| Next.js | Grep | `"next"` in `package.json` |
| React | Grep | `"react"` in `package.json` |
| Python | Glob | `requirements.txt`, `pyproject.toml` |
| Rust | Glob | `Cargo.toml` |
| Go | Glob | `go.mod` |

**Check for database/migrations:**

**Use Glob tool:** `prisma/*`, `drizzle/*`, `migrations/*` → has-db

**Check for AI SDK:**

**Use Grep tool:** `"ai"` in `package.json` → has-ai-sdk

If detected, run a quick deprecated API scan:
```bash
grep -rn --include='*.ts' --include='*.tsx' -E 'generateObject|maxTokens[^A-Z]|toDataStreamResponse|addToolResult|maxSteps[^A-Z]|part\.args|part\.result[^s]' src/ app/ 2>/dev/null | head -20
```

If deprecated APIs found, include count in the detection summary and flag for reviewers. These are mechanical fixes — load `rules/ai-sdk.md` and pass the migration table to the implementing agent.

**Run dependency vulnerability scan (critical/high only):**

```bash
# Node.js projects
npm audit --json 2>/dev/null | jq '[.vulnerabilities | to_entries[] | select(.value.severity == "critical" or .value.severity == "high")] | length'

# Python projects
pip-audit --format json 2>/dev/null | jq '[.[] | select(.vulns[].fix_versions)] | length'

# Or use: pnpm audit --json, yarn audit --json
```

Only surface **critical** and **high** severity vulnerabilities. Ignore moderate/low — they create noise without actionable urgency.

**Run dead code detection (JS/TS projects only):**

```bash
npx -y knip --no-progress --reporter compact 2>/dev/null | head -40
```

If knip is already a project dependency, use `npx knip` instead. Knip detects:
- Unused files (not imported anywhere)
- Unused exports (exported but never imported)
- Unused types (exported types never referenced)
- Unused dependencies (in package.json but not imported)
- Duplicate exports (same thing exported multiple ways)

Include dead code count in the detection summary. Pass findings to relevant reviewers:
- `organization-engineer` — unused files and structural dead weight
- `architecture-engineer` — unused exports indicating poor module boundaries
- `senior-engineer` — general dead code cleanup

If knip finds >20 unused exports, flag as a separate task cluster rather than distributing across reviewers.

If `--diff` flag is set, cross-reference knip results with the changed file list (knip does not support diff mode natively, so run on full project but only surface findings that touch changed files).

**Detect project scale:**

Use file counts to determine appropriate audit depth:

```bash
# Count source files (exclude node_modules, .git, dist, build)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) | grep -v node_modules | grep -v .git | wc -l
```

| File Count | Scale | Audit Approach |
|------------|-------|----------------|
| < 20 files | Small | 2-3 reviewers max, skip architecture/simplicity |
| 20-100 files | Medium | 3-4 reviewers, standard audit |
| > 100 files | Large | Full reviewer suite, batched execution |

**Scale-appropriate signals:**
- Small projects: Skip `architecture-engineer` (no complex boundaries to review)
- Small projects: Skip `simplicity-engineer` (not enough code to over-engineer)
- No tests present + small project: Don't flag missing tests as critical
- Single developer: Skip `senior-engineer` (no code review discipline needed)

**Detect project lifecycle stage:**

If `--stage=<stage>` was provided in arguments, use that directly. Otherwise, infer the stage from heuristic signals:

| Signal | Tool | Indicates |
|--------|------|-----------|
| CI/CD config (`.github/workflows/*`, `Jenkinsfile`, `.gitlab-ci.yml`) | Glob | pre-launch+ |
| Deployment config (`vercel.json`, `Dockerfile`, `fly.toml`, `render.yaml`, `k8s/`) | Glob | pre-launch+ |
| Monitoring/observability (`sentry`, `datadog`, `newrelic` in deps) | Grep in package.json | production |
| Production env references (`.env.production`, `NODE_ENV` guards) | Glob + Grep | pre-launch+ |
| Test coverage > 0 (test files exist) | Glob (`**/*.test.*`, `**/*.spec.*`) | development+ |
| Git history depth | `git rev-list --count HEAD` | maturity signal |
| Custom domain / production URL in config | Grep | production |
| Rate limiting, caching, or queue deps in package.json | Grep (`rate-limit`, `redis`, `bull`) | production |

**Stage classification:**

| Stage | Description | Typical Signals |
|-------|-------------|-----------------|
| `prototype` | Exploring ideas, validating concepts | < 30 commits, no CI, no deploy config, no tests |
| `development` | Actively building features, not yet shipped | Has some tests, may have CI, no production deploy |
| `pre-launch` | Feature-complete, preparing to ship | Has CI, has deploy config, has tests, no monitoring |
| `production` | Live and serving real users | Has monitoring, production env, rate limiting, mature git history (200+ commits) |

Default to `development` if signals are ambiguous. When in doubt, err toward the earlier stage — it's better to under-flag than to overwhelm with premature requirements.

**Confirm stage with user:**

After detection, briefly confirm:
```
Detected project stage: [stage] (based on [key signals])
```

If the user corrects it, use their override.

**Summarize detection:**
```
Scope: [path or "full codebase"] [diff vs [base] if --diff]
Project type: [Next.js / React / Python / etc.]
Project scale: [small / medium / large]
Project stage: [prototype / development / pre-launch / production]
Has database: [yes/no]
Has AI SDK: [yes/no + deprecated API count if any]
Has tests: [yes/no]
Dead code: [X unused files, Y unused exports, Z unused deps] or "N/A (not JS/TS)"
Coding rules: [yes/no]
Focus: [all / security / performance / architecture / design]
Execution mode: [batched (default) / parallel / team]
```

## Phase 2: Select Reviewers

**Base reviewer selection by project scale:**

| Scale | Core Reviewers |
|-------|----------------|
| Small | security-engineer, performance-engineer |
| Medium | security-engineer, performance-engineer, architecture-engineer |
| Large | security-engineer, performance-engineer, architecture-engineer, organization-engineer, senior-engineer |

**Add framework-specific reviewers (medium/large only):**

| Project Type | Additional Reviewers |
|--------------|---------------------|
| Next.js | lee-nextjs-engineer, daniel-product-engineer |
| React/TypeScript | daniel-product-engineer |
| Python/Rust/Go | (none additional) |

**Conditional additions:**
- If scope includes DB/migrations → add `data-engineer`
- If monorepo with shared packages (large only) → add `simplicity-engineer`
- If project has >50 files or inconsistent structure detected → add `organization-engineer`
- If UI-heavy (React/Next.js, medium/large) → add `designer`
- If UI-heavy (React/Next.js, medium/large) → add `accessibility-engineer`
- If test files detected (medium/large) → add `test-quality-engineer`
- If recent AI-assisted work or branch audit → add `hygiene-engineer`
- If project has marketing/public pages (pre-launch/production stage) → add `seo-engineer`
- If TypeScript/JavaScript project (`.ts`/`.tsx`/`.js`/`.jsx` files, medium/large) → add `documentation-engineer`

**Focus flag overrides:**
- `--security` → only `security-engineer`
- `--performance` → only `performance-engineer`
- `--architecture` → only `architecture-engineer`
- `--organization` → only `organization-engineer`
- `--design` → only `designer`
- `--accessibility` → only `accessibility-engineer`
- `--hygiene` → only `hygiene-engineer`
- `--seo` → only `seo-engineer`
- `--docs` → only `documentation-engineer`
- `--copy` → only `ux-writing-engineer`

**Final reviewer list:**
- Small projects: 2-3 reviewers
- Medium projects: 3-4 reviewers
- Large projects: 4-6 reviewers

## Phase 2.5: Team Mode Check

<team_mode_check>
**Check if agent teams are available** by attempting to detect team support in the current environment.

**If teams are available**, offer the user a choice:

```
Execution mode:
1. Team mode — Reviewers debate findings before consolidation (higher quality, 3-5x token cost)
2. Standard mode — Independent reviewers, batched or parallel (faster, lower cost)
```

Use AskUserQuestion with:
- **"Team mode (Recommended for pre-launch/production)"** — Reviewers cross-review and challenge each other's findings. Conflicts resolved with evidence-based rationale. Best for high-stakes audits.
- **"Standard mode"** — Independent reviewers run in batches (default) or parallel (--parallel). Faster and cheaper. Findings consolidated by the skill.

**If teams are NOT available**, proceed silently with standard mode. Do not mention teams to the user.

**If team mode selected**, read the team reference:
```
references/agent-teams.md
```
</team_mode_check>

## Phase 3: Run Audit

**Read agent prompts:**
For each selected reviewer, read:
```
agents/review/[reviewer-name].md
```

**Execution strategy:**

By default, reviewers run in **batches of 2** to avoid resource exhaustion on large codebases. If `--parallel` flag is set, all reviewers run simultaneously. If user opted into **team mode**, reviewers collaborate as teammates.

### Batched Execution (Default)

Split reviewers into batches of 2. Run each batch, wait for completion, then run next batch.

**Example with 6 reviewers:**
```
Batch 1: security-engineer, performance-engineer
  → Wait for both to complete
Batch 2: architecture-engineer, daniel-product-engineer
  → Wait for both to complete
Batch 3: lee-nextjs-engineer, senior-engineer
  → Wait for both to complete
```

**Model selection per reviewer:**

| Reviewer | Model | Why |
|----------|-------|-----|
| security-engineer | sonnet | Pattern recognition + context |
| performance-engineer | sonnet | Algorithmic reasoning |
| architecture-engineer | sonnet | Structural analysis |
| organization-engineer | sonnet | File structure pattern analysis |
| daniel-product-engineer | sonnet | Code quality judgment |
| lee-nextjs-engineer | sonnet | Framework pattern recognition |
| senior-engineer | sonnet | Code review reasoning |
| simplicity-engineer | sonnet | Complexity analysis |
| data-engineer | sonnet | Data safety reasoning |
| **designer** | **opus** | **Aesthetic judgment requires premium model** |
| hygiene-engineer | sonnet | Pattern recognition for AI artifacts |
| seo-engineer | sonnet | Pattern recognition for SEO elements |
| documentation-engineer | sonnet | JSDoc coverage analysis |
| ux-writing-engineer | sonnet | UX copy quality and LLM-smell detection |

**Include project stage in every reviewer prompt.**

Each reviewer must receive the stage context so they can calibrate their severity ratings. Read the matching stage calibration block from:
```
references/audit-stage-calibration.md
```

Include in every reviewer prompt:
```
Project stage: [prototype / development / pre-launch / production]

SEVERITY CALIBRATION FOR THIS STAGE:
[Paste the matching stage block from audit-stage-calibration.md]
```

**For each batch, spawn 2 agents in parallel:**
```
Task [security-engineer] model: sonnet: "
Audit the following codebase for security issues.

Scope: [path]
Project type: [type]
Project stage: [stage]
Coding rules: [rules content if any]

[Stage calibration block from above]

Focus on: OWASP top 10, authentication/authorization, input validation, secrets handling, injection vulnerabilities.

Return findings in this format:
## Findings
### Critical
- [file:line] Issue description

### High
- [file:line] Issue description

### Medium
- [file:line] Issue description

### Low
- [file:line] Issue description

## Summary
[1-2 sentences]
"

Task [performance-engineer] model: sonnet: "
Audit the following codebase for performance issues.
[similar structure, including stage calibration block]
Focus on: N+1 queries, missing indexes, memory leaks, bundle size, render performance.
"

Task [designer] model: opus: "
Review UI implementation for visual design quality.
[similar structure, including stage calibration block]
Focus on: aesthetic direction, memorable elements, typography, color cohesion, AI slop patterns.
"
```

**Wait for batch to complete before starting next batch.**

Repeat for remaining batches:
- Batch 2: architecture-engineer + organization-engineer (if applicable)
- Batch 3: UI reviewers (daniel-product-engineer, lee-nextjs-engineer)
- Batch 4: remaining reviewers (senior-engineer, designer, data-engineer)

### Parallel Execution (--parallel flag)

Only if `--parallel` flag is explicitly set, spawn all reviewers simultaneously:

```
Task [security-engineer] model: sonnet: "..."
Task [performance-engineer] model: sonnet: "..."
Task [architecture-engineer] model: sonnet: "..."
[All additional reviewers in same message...]
```

⚠️ **Warning:** Parallel execution spawns 4-6 Claude instances simultaneously. This can cause system unresponsiveness on resource-constrained machines or large codebases.

**Wait for all agents to complete.**

### Team Execution (Agent Teams mode)

Only if user opted into team mode in Phase 2.5.

**Round 1 — Initial Analysis:**

Create team `arc-audit-[scope-slug]` with all selected reviewers as teammates. Each reviewer performs their standard analysis using the same prompts as subagent mode (including stage calibration, coding rules, and domain-specific focus areas).

```
Create team: arc-audit-[scope-slug]
Teammates: [all selected reviewers]

Each teammate runs their initial analysis independently.
Same prompts, same model selection as batched/parallel mode.
```

**Round 2 — Cross-Review:**

Each reviewer reads the others' findings and responds:
- **Confirms** findings with supporting evidence from their domain
- **Challenges** findings they believe are incorrect or overstated, citing code-level evidence
- **Reconciles** conflicting findings by synthesizing both perspectives into a resolution

```
Each teammate reviews others' Round 1 findings.
Responses: confirm (with evidence), challenge (with code citations), or reconcile (with synthesis).
```

**Resolution rules:**
- Code-level evidence wins over principle-based reasoning
- Domain authority wins within domain (security-engineer's security judgment > architecture-engineer's security opinion)
- Project stage context breaks ties
- Every challenge must include explicit rationale

**Round 2 output:** Each finding is now annotated with peer review status — confirmed, modified after challenge, or dropped with rationale.

**Wait for team to complete.**

### Structural Diff Checklist (--diff mode only)

**Skip this section if `--diff` is not active.**

After all reviewer agents complete, run an additional structural pass using the diff checklist. This catches mechanical issues (race conditions, trust boundary violations, dead code) that domain-specific reviewers may not focus on.

1. **Read the checklist:**
   ```
   Read: references/diff-review-checklist.md
   ```

2. **Get the full diff:**
   ```bash
   git diff origin/${base:-main}
   ```

3. **Apply the two-pass review** from the checklist against the diff:
   - Pass 1 (CRITICAL): Race conditions, trust boundaries, data safety
   - Pass 2 (INFORMATIONAL): Conditional side effects, stale references, test gaps, dead code, performance

4. **Merge findings** into the reviewer agent results before consolidation:
   - Checklist CRITICAL findings → treated as Critical severity
   - Checklist INFORMATIONAL findings → treated as Medium severity
   - Attribute these as "structural-checklist" in the flagged-by column
   - Deduplicate against reviewer findings (if a reviewer already flagged the same file:line, keep the reviewer's finding)

## Phase 4: Consolidate Findings

**Collect all agent outputs.**

<team_consolidation>
**If team mode was used**, consolidation is simplified — reviewers already did the hard work:

- **Deduplication: already done.** Reviewers identified overlapping findings during cross-review.
- **Conflict resolution: already done.** Contradictory findings were debated with evidence-based rationale. Each resolution includes the reasoning from both sides.
- **Severity validation: still needed.** Apply the stage-based severity calibration table below as a final sanity check.
- **Task clustering: still needed.** Group debated findings into work clusters.

Skip the deduplication and conflict resolution steps below and proceed directly to "Validate severity against project stage."
</team_consolidation>

**If standard mode was used**, proceed with full consolidation:

**Deduplicate:**
- Same file:line mentioned by multiple reviewers → merge into single finding
- Note which reviewers flagged each issue

**Validate severity against project stage:**

Use the severity validation table and conflict resolution rules from:
```
references/audit-stage-calibration.md
```

Downgrade findings that are rated higher than the stage warrants. Add note: `[Severity adjusted for [stage] stage — would be [original] in production]`

**Categorize by severity (after stage adjustment):**
1. **Critical** — Security vulnerabilities, data loss risks, breaking issues
2. **High** — Performance blockers, architectural violations
3. **Medium** — Technical debt, code quality issues
4. **Low** — Suggestions, minor improvements

**Advisory tone and conflict resolution:** Follow the advisory tone guidelines and conflict resolution rules in `audit-stage-calibration.md`. Key principle: reviewers advise, user decides. Use "must fix" sparingly (security/data loss only), "should consider" for real problems, "worth noting" for suggestions.

When dismissing conflicting or irrelevant findings, include them in a collapsed "Dismissed" section with a one-line reason.

**Cluster findings into task groups:**

Do NOT group by reviewer domain (security, performance, etc.). Instead, group by **what you'd work on together** — files and concerns that would be addressed as a unit.

Clustering strategy:
1. **By area of code** — Findings touching the same files/modules cluster together regardless of which reviewer flagged them. E.g., three findings in `src/auth/` from security-engineer, performance-engineer, and architecture-engineer become one cluster: "Auth flow hardening."
2. **By type of work** — If multiple findings across different files require the same kind of change (e.g., "add error boundaries to 5 components"), cluster those together.
3. **By dependency** — If fixing finding A is a prerequisite for fixing finding B, they belong in the same cluster with A first.

Each cluster becomes a task group with:
- A descriptive name (e.g., "Auth flow hardening", "API input validation", "Dashboard performance")
- The findings it contains (with severity and file references)
- A suggested order of implementation within the cluster

Aim for 3-8 clusters. If you have more than 8, merge the smallest ones. If you have fewer than 3, that's fine — don't force artificial grouping.

## Phase 5: Generate Report

**Create audit report:**

```bash
mkdir -p docs/audits
```

File: `docs/audits/YYYY-MM-DD-[scope-slug]-audit.md`

```markdown
# Audit Report: [scope]

**Date:** YYYY-MM-DD
**Reviewers:** [list of agents used]
**Scope:** [path or "full codebase"]
**Project Type:** [detected type]
**Project Stage:** [prototype / development / pre-launch / production]

> Severity ratings have been calibrated for the **[stage]** stage. Issues marked with ↓ were downgraded from their production-level severity.

## Executive Summary

[1-2 paragraph overview of findings, noting the stage context]

- **Critical:** X issues
- **High:** X issues
- **Medium:** X issues
- **Low:** X issues

## Must Fix

> Genuinely dangerous — security holes, data loss, credential exposure

### [Issue Title]
**File:** `path/to/file.ts:123`
**Flagged by:** security-engineer, architecture-engineer
**Description:** [What's wrong and why it matters]
**Recommendation:** [How to fix]

[Repeat for each critical/high issue that warrants "must fix"]

## Should Consider

> Will cause real problems if the project progresses — performance cliffs, missing error handling on critical paths, architectural dead ends

[Same format]

## Worth Noting

> Suggestions and improvements — no pressure

[Same format]

## Low Priority / Suggestions

> Nice to have

[Same format]

---

## Task Clusters

> Findings grouped by what you'd tackle together, ordered by priority.

### 1. [Cluster Name]

**Why:** [1 sentence — what's wrong in this area and why it matters]

| # | Severity | File | Issue | Flagged by |
|---|----------|------|-------|------------|
| 1 | Critical | `path/to/file.ts:123` | Issue description | security-engineer |
| 2 | High | `path/to/file.ts:456` | Issue description | performance-engineer |
| 3 | Medium | `path/to/other.ts:78` | Issue description | architecture-engineer |

**Suggested approach:** [1-2 sentences on how to tackle this cluster]

### 2. [Cluster Name]

[Same format]

[Repeat for each cluster]

---

<details>
<summary>Dismissed findings ([N] items)</summary>

| Finding | Reviewer | Reason Dismissed |
|---------|----------|-----------------|
| [description] | [reviewer] | Conflicts with [other reviewer]'s recommendation — [resolution reasoning] |
| [description] | [reviewer] | Contradicts project coding rules in `.ruler/` |
| [description] | [reviewer] | Not relevant at [stage] stage |

</details>

---

## Next Steps

1. [Prioritized action item]
2. [Prioritized action item]
3. [Prioritized action item]
```

**Commit the report:**
```bash
git add docs/audits/
git commit -m "docs: add audit report for [scope]"
```

## Phase 6: Present & Offer Actions

**Show summary to user:**
```
## Audit Complete

Reviewed: [scope]
Reviewers: [count] agents
Project stage: [stage]
Report: docs/audits/YYYY-MM-DD-[scope]-audit.md

### Summary
- Critical: X | High: X | Medium: X | Low: X
- Dismissed: X (conflicts/irrelevant)
- Task clusters: X

### Task Clusters (by priority)
1. [Cluster name] — X issues (X critical, X high)
2. [Cluster name] — X issues
3. [Cluster name] — X issues
[...]
```

**Offer next steps using AskUserQuestion:**

Present these options (include all that apply):

1. **Tackle critical cluster now** → Jump straight into fixing the highest-priority cluster. Invoke `/arc:detail` scoped to the files and issues in that cluster.

2. **Write full task plan** → Write all clusters as a structured plan to `docs/arc/plans/YYYY-MM-DD-audit-tasks.md` for systematic implementation. Each cluster becomes a section with its findings, suggested approach, and a checkbox list. Commit the plan file.

3. **Add to tasks** → Use **TaskCreate** to create tasks for critical/high clusters. Each cluster becomes a task with findings in the description. Lower severity clusters are omitted — they're in the audit report if needed later.

4. **Create Linear issues** → If Linear MCP is available (`mcp__linear__*` tools exist), create Linear issues for critical/high findings. Each cluster becomes an issue with findings in the description.

5. **Deep dive on a cluster** → User picks a cluster to explore in detail. Show full findings, relevant code snippets, and discuss approach before committing to action.

5. **Done for now** → End session. Report is committed, user can return to it later.

**If user selects "Tackle critical cluster now":**
- Identify the cluster with the most critical/high findings
- Invoke `/arc:detail` with the cluster's files and issues as scope
- The detail plan will be scoped to just that cluster, not the entire audit

**If user selects "Write full task plan":**

Create `docs/arc/plans/YYYY-MM-DD-audit-tasks.md`:

```markdown
# Audit Task Plan

**Source:** docs/audits/YYYY-MM-DD-[scope]-audit.md
**Date:** YYYY-MM-DD
**Project Stage:** [stage]
**Total clusters:** X | **Total findings:** X

---

## Cluster 1: [Name] `[priority: critical/high/medium]`

**Why this matters:** [1 sentence]

- [ ] [Finding 1 — file:line — description]
- [ ] [Finding 2 — file:line — description]
- [ ] [Finding 3 — file:line — description]

**Approach:** [1-2 sentences]

---

## Cluster 2: [Name] `[priority]`

[Same format]

---

[Repeat for all clusters]
```

Commit the plan:
```bash
git add docs/arc/plans/
git commit -m "docs: add audit task plan"
```

**If user selects "Add to tasks":**
- Use **TaskCreate** for each critical/high cluster
- Each task gets the cluster name as subject, findings as description, and present continuous activeForm
- Lower severity clusters stay in the audit report only

**If user selects "Deep dive on a cluster":**
- Ask which cluster (by number or name)
- Show the full findings with code context (read relevant files)
- Discuss the approach before taking action
- After discussion, offer to start implementing or return to the action menu

## Phase 7: Cleanup

**Kill orphaned subagent processes:**

After spawning multiple reviewer agents, some may not exit cleanly. Run cleanup to prevent memory accumulation:

```bash
scripts/cleanup-orphaned-agents.sh
```

This is especially important after `--parallel` runs or when auditing large codebases.

</process>

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:audit — [scope] ([N] critical, [N] high)`
</arc_log>

<success_criteria>
Audit is complete when:
- [ ] Scope detected (path, full codebase, or focus flag)
- [ ] Project type detected
- [ ] Execution mode determined (batched default, --parallel, or team)
- [ ] 4-6 reviewers selected based on context
- [ ] Reviewers run in batches of 2 (or all at once if --parallel)
- [ ] All reviewers completed
- [ ] Findings consolidated and deduplicated
- [ ] Report generated in `docs/audits/`
- [ ] Report committed to git
- [ ] Summary presented to user
- [ ] Next steps offered
- [ ] Progress journal updated
- [ ] Orphaned agents cleaned up (run cleanup script)
</success_criteria>
