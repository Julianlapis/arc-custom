---
name: build
description: |
  Build small-to-medium features with lightweight planning and full agent orchestration.
  Use for "build this component", "add this feature", "create this utility" — work that doesn't
  need full ideate/implement but still deserves proper planning and quality gates.
license: MIT
metadata:
  author: howells
website:
  order: 7
  desc: Quick build
  summary: For small-to-medium features that don't need the full ideate → implement flow. Lightweight planning, same quality gates.
  what: |
    Build is for when you know what you want and just need it done—"add a logout button", "create a date picker component", "write a validation utility". It does quick planning inline, uses the same build agents as implement, and runs the same quality gates (TDD, type checks, lint). If scope creeps, it suggests switching to /arc:ideate.
  why: |
    Not everything needs a design doc. Build is the fast path for well-understood work. Same quality, less ceremony.
  decisions:
    - Scope-appropriate. For small-to-medium work only. Suggests ideate if scope is too large.
    - Same agents as implement. Implementer, fixer, test writers—all available.
    - Same quality gates. TDD, TypeScript, lint. No shortcuts on quality.
  workflow:
    position: branch
    joins: implement
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own lightweight planning process. Execute it directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<required_reading>
**Read these before building:**
1. `${CLAUDE_PLUGIN_ROOT}/references/testing-patterns.md` — Test philosophy
2. `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` — If UI work
3. `${CLAUDE_PLUGIN_ROOT}/references/component-design.md` — If React components
</required_reading>

<agents>
**Build uses the same agents as implement:**

| Agent | Model | Use For |
|-------|-------|---------|
| `implementer` | opus | General implementation (utilities, services) |
| `ui-builder` | opus | UI components from spec |
| `design-specifier` | opus | Design decisions when no spec exists |
| `unit-test-writer` | sonnet | Unit tests (vitest) |
| `integration-test-writer` | sonnet | Integration tests (vitest + MSW) |
| `e2e-test-writer` | opus | E2E tests (Playwright) |
| `fixer` | haiku | TS/lint cleanup |
| `debugger` | sonnet | Failing tests |
| `test-runner` | haiku | Run vitest, analyze results |
| `spec-reviewer` | sonnet | Verify matches spec |
| `code-reviewer` | haiku | Code quality gate |
| `plan-completion-reviewer` | sonnet | Whole-plan gate (if >3 tasks) |
</agents>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**If `.ruler/` exists, read relevant rules:**
- Always: `code-style.md`
- TypeScript: `typescript.md`
- React: `react.md`
- Next.js: `nextjs.md`
- Tailwind: `tailwind.md`
- Testing: `testing.md`
- Always: `error-handling.md`, `security.md`
- Drizzle/Prisma: `database.md`
- wrangler.toml: `cloudflare-workers.md`
- AI SDK: `ai-sdk.md`
- Clerk/WorkOS: `auth.md`

**For UI work, load interface rules:**
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/colors.md`
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md`
</rules_context>

## When to Use Build vs Ideate

| Use Build | Use Ideate |
|-----------|------------|
| Single component | New app or major feature |
| Add utility function | Multiple interconnected features |
| Extend existing feature | New architecture patterns |
| 1-5 files affected | 10+ files affected |
| Clear requirements | Exploratory/unclear scope |

**If in doubt:** Start with build. If scope grows, pivot to ideate.

## Process

### Phase 1: Scope Check

**Assess the request:**
- How many files will this touch?
- Is this UI, logic, or both?
- Does it need design decisions?
- What test levels needed?

**If scope is large (>5 files, new patterns):**
```
"This looks substantial — multiple features and new patterns.
Would benefit from /arc:ideate for proper design. Want me to switch?"
```

**If scope is appropriate:** Proceed.

### Phase 2: Create Build Plan

**Document a lightweight plan (not just mental notes):**

```markdown
## Build Plan: [Feature Name]

### What We're Building
[1-2 sentence description]

### Files to Create/Modify
| File | Action | Purpose |
|------|--------|---------|
| src/components/OrgSwitcher.tsx | Create | Main component |
| src/components/OrgSwitcher.test.tsx | Create | Unit tests |
| src/hooks/useOrganizations.ts | Create | Data fetching hook |

### Implementation Approach
1. [First step]
2. [Second step]
3. [Third step]

### Agents Needed
| Task | Agent |
|------|-------|
| Component UI | ui-builder or design-specifier |
| Hook logic | implementer |
| Unit tests | unit-test-writer |
| Integration tests | integration-test-writer (if API calls) |

### Test Coverage
- Unit: [what to test]
- Integration: [what to test, if any]
- E2E: [what to test, if critical flow]

### Design Decisions (if UI)
- [ ] Needs design-specifier? [yes/no]
- [ ] Has existing patterns to follow? [reference]
```

**Share with user:** "Here's my build plan. Look right?"

Wait for confirmation before proceeding.

### Phase 3: Set Up Branch

If not on a feature branch:

```bash
git branch --show-current
```

**If on main:**
```bash
git checkout -b feat/[feature-name]
# or for isolated work:
git worktree add .worktrees/[feature-name] -b feat/[feature-name]
```

### Phase 4: Execute Build

**For each task in the plan, follow the per-task loop:**

```
┌─────────────────────────────────────────────────────────┐
│  1. TEST      → spawn test agent (unit/integration)     │
│  2. BUILD     → spawn build agent (implementer/ui)      │
│  3. TDD       → run test (fail → impl → pass)           │
│  4. FIX       → fixer (TS/lint cleanup)                 │
│  5. SPEC      → spec-reviewer (matches plan?)           │
│  6. QUALITY   → code-reviewer (well-built?)             │
│  7. COMMIT    → atomic commit                           │
└─────────────────────────────────────────────────────────┘
```

### Step 4a: Write Tests First

**Determine test type:**
| Building | Test Agent |
|----------|------------|
| Pure function/hook | unit-test-writer |
| Component with props | unit-test-writer |
| Component + API | integration-test-writer |
| Auth-related | integration-test-writer (with Clerk/WorkOS mocks) |

**Spawn test agent:**
```
Task [unit-test-writer] model: sonnet: "Write unit tests for [component/function].

From build plan:
- [what to test]
- [edge cases]

File: [path]"
```

### Step 4b: Build Implementation

**Select build agent based on task:**

For UI components:
```
Task [ui-builder] model: opus: "Build [component] from plan.

Requirements:
- [from build plan]

Existing patterns: [reference similar components]
Follow spacing and design rules."
```

For logic/utilities:
```
Task [implementer] model: opus: "Implement [function/service].

Requirements:
- [from build plan]

Follow project conventions."
```

If design decisions needed (no existing spec):
```
Task [design-specifier] model: opus: "Design [component/feature].

Context: [what it's for]
Output spec for ui-builder."
```

### Step 4c: TDD Cycle

```bash
pnpm vitest run [test-file]  # Should FAIL first
# Implementation happens
pnpm vitest run [test-file]  # Should PASS
```

### Step 4d: Quality Gates

**Fixer (TS/lint):**
```bash
pnpm tsc --noEmit
pnpm biome check --write .
```

If issues:
```
Task [fixer] model: haiku: "Fix TS/lint errors in [files]"
```

**Spec review:**
```
Task [spec-reviewer] model: sonnet: "Verify implementation matches build plan.

Plan said: [requirements]
Files: [list]

Check: nothing missing, nothing extra."
```

**Code quality:**
```
Task [code-reviewer] model: haiku: "Quick code quality check.

Files: [list]
Check: no any, error handling, tests exist."
```

### Phase 5: Final Verification

```bash
pnpm test              # All tests pass
pnpm tsc --noEmit      # No TS errors
pnpm biome check .     # No lint errors
```

**If UI work, screenshot and verify:**
```
mcp__claude-in-chrome__computer action=screenshot
```

### Phase 5.5: Plan Completion Check

**Re-read the build plan from Phase 2.** For each item in the plan:
- Is it implemented? (read the actual file, don't trust memory)
- Is it substantive? (not a stub or placeholder)
- Is it wired up? (imported where needed, rendered, called)

**If >3 tasks in the build plan**, spawn plan-completion-reviewer:
```
Task [plan-completion-reviewer] model: sonnet: "Verify implementation matches build plan.

BUILD PLAN:
[paste build plan from Phase 2]

FILES CHANGED:
[list files created/modified]

Check every item was built. Nothing skipped, nothing extra."
```

**Do NOT proceed to Phase 6 until every item in the build plan is verified.**

### Phase 6: Complete

**Commit:**
```bash
git add .
git commit -m "feat([scope]): [description]"
```

**Report:**
```markdown
## Build Complete: [Feature]

### Created
- [file] — [purpose]

### Tests
- Unit: [N] tests
- Integration: [N] tests (if any)

### Verified
- [X] All tests passing
- [X] TS/lint clean
- [X] Spec review passed
- [X] Code review passed
```

**Offer next steps:**
1. Merge to main
2. Create PR
3. Add more features
4. Done

<progress_append>
After completing the build:

```markdown
## YYYY-MM-DD HH:MM — /arc:build
**Task:** [What was built]
**Outcome:** Complete
**Files:** [Key files]
**Agents used:** [list]
**Tests:** [N] unit, [N] integration
**Next:** [Merge / PR / Continue]

---
```
</progress_append>

<success_criteria>
Build is complete when:
- [ ] Build plan documented and confirmed
- [ ] Feature branch created
- [ ] Tests written first (appropriate level)
- [ ] Implementation complete
- [ ] Spec review passed
- [ ] Code review passed
- [ ] All tests passing
- [ ] TS/lint clean
- [ ] Build plan completion verified (every item checked against code)
- [ ] Progress journal updated
</success_criteria>
