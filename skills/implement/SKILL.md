---
name: implement
description: |
  Plan and execute feature implementation with TDD and continuous quality checks.
  Use when asked to "implement this", "build this feature", "execute the plan",
  or after /arc:ideate has created a design doc. Creates implementation plan if needed,
  then executes task-by-task with build agents.
license: MIT
metadata:
  author: howells
---

<required_reading>
**Read these reference files NOW:**
1. ${CLAUDE_PLUGIN_ROOT}/references/testing-patterns.md
2. ${CLAUDE_PLUGIN_ROOT}/references/task-granularity.md
3. ${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md (if UI work involved)
4. ${CLAUDE_PLUGIN_ROOT}/references/model-strategy.md
5. ${CLAUDE_PLUGIN_ROOT}/disciplines/dispatching-parallel-agents.md
6. ${CLAUDE_PLUGIN_ROOT}/disciplines/finishing-a-development-branch.md
</required_reading>

<build_agents>
**Available build agents in `${CLAUDE_PLUGIN_ROOT}/agents/build/`:**

| Agent | Model | Use For |
|-------|-------|---------|
| `implementer` | sonnet | General task execution — utilities, services, APIs, business logic |
| `fixer` | haiku | TypeScript errors, lint issues — fast mechanical fixes |
| `debugger` | sonnet | Failing tests — systematic root cause analysis |
| `unit-test-writer` | sonnet | Unit tests (vitest) — pure functions, components |
| `integration-test-writer` | sonnet | Integration tests (vitest + MSW) — API, auth |
| `e2e-test-writer` | sonnet | E2E tests (Playwright) — user journeys |
| `ui-builder` | opus | UI components from design spec — anti-slop, memorable |
| `design-specifier` | opus | Design decisions when no spec exists — empty states, visual direction |
| `figma-builder` | opus | Build UI directly from Figma URL |
| `test-runner` | haiku | Run vitest, analyze failures |
| `e2e-runner` | sonnet | Playwright tests — iterate until green or report blockers |
| `spec-reviewer` | haiku | Quick spec compliance check — nothing missing, nothing extra |
| `code-reviewer` | haiku | Quick code quality gate — no `any`, proper error handling, tests exist |

**Before spawning a build agent:**
1. Read the agent file: `${CLAUDE_PLUGIN_ROOT}/agents/build/[agent-name].md`
2. Use the model specified in the agent's frontmatter
3. Include relevant context from the task

**Spawn syntax:**
```
Task [agent-name] model: [model]: "[task description with context]"
```
</build_agents>

<rules_context>
**Check for project coding rules:**

**Use Glob tool:** `.ruler/*.md`

**If `.ruler/` exists, detect stack and read relevant rules:**

| Check | Read from `.ruler/` |
|-------|---------------------|
| Always | code-style.md |
| `next.config.*` exists | nextjs.md |
| `react` in package.json | react.md |
| `tailwindcss` in package.json | tailwind.md |
| `.ts` or `.tsx` files | typescript.md |
| `vitest` or `jest` in package.json | testing.md |

These rules define MUST/SHOULD/NEVER constraints. Follow them during implementation.

**If `.ruler/` doesn't exist:**
```
No coding rules found. Run /arc:rules to set up standards, or continue without rules.
```

Rules are optional — proceed without them if the user prefers.

**For UI/frontend work, also load interface rules:**

| Check | Read from `${CLAUDE_PLUGIN_ROOT}/rules/interface/` |
|-------|---------------------------------------------------|
| Building components/pages | design.md, colors.md, spacing.md, layout.md |
| Typography changes | typography.md |
| Adding animations | animation.md, performance.md |
| Form work | forms.md, interactions.md |
| Interactive elements | interactions.md |
| Marketing pages | marketing.md |
</rules_context>

<process>

**You are here in the arc:**
```
/arc:ideate     → Design doc (on main) ✓
     ↓
/arc:implement  → Plan + Execute ← YOU ARE HERE
     ↓
/arc:review     → Review (optional, can run anytime)
```

## Phase 0: Planning (if no plan exists)

**Check for existing implementation plan:**
```bash
ls docs/plans/*-implementation.md 2>/dev/null | tail -1
```

**If plan exists:** Skip to Phase 1.

**If no plan exists:** Create one from the design doc.

### Step 0.1: Load Design Document

Find and read the design doc:
```bash
ls docs/plans/*-design.md 2>/dev/null | tail -1
```

If no design doc exists, ask user:
- "No design doc found. Should I create one first (/arc:ideate) or work from your description?"

Extract from design doc:
- User stories / acceptance criteria
- ASCII UI wireframes (if any)
- Data model
- Component structure
- API surface

### Step 0.2: Detect Project Stack

**Use Glob tool to detect in parallel:**

| Check | Glob Pattern |
|-------|-------------|
| Test frameworks | `vitest.config.*`, `playwright.config.*`, `jest.config.*` |
| Package manager | `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` |

**Record detected stack:**
- Test runner: [vitest/jest/playwright]
- Package manager: [pnpm/yarn/npm]
- Framework: [next/react/etc]

### Step 0.3: Find Reusable Patterns

**Spawn agents to find existing code to leverage:**

```
Task Explore model: haiku: "Find existing patterns in this codebase that we can
reuse for: [list components/features from design].

Look for: similar components, utility functions, hooks, types, test patterns.

Output:
## Reusable Code
- `file:line` — what it provides

## Essential Files
5-10 files most critical to understand before implementing."
```

### Step 0.4: Break Down Into Tasks

**Each task = one TDD cycle (2-5 minutes):**

```markdown
### Task N: [Descriptive Name]

**Files:**
- Create: `exact/path/to/file.tsx`
- Modify: `exact/path/to/existing.tsx:42-58`
- Test: `exact/path/to/file.test.tsx`

**Test first:**
[describe what the test should verify]

**Implementation:**
[describe what code to write]

**Commit:** `feat(scope): description`
```

**Task ordering:**
1. Data/types first (foundation)
2. Core logic (business rules)
3. UI components (presentation)
4. Integration (wiring together)
5. E2E tests (critical flows only)

### Step 0.5: Include UI Context

For UI tasks, include aesthetic direction from design doc:

```markdown
### Task N: Create ProductCard Component

**Aesthetic Direction:**
- Tone: [from design doc]
- Memorable element: [from design doc]
- Typography: [from design doc]

**Figma:** [URL if available]

**ASCII Wireframe:**
[from design doc]

**Avoid:** Generic AI aesthetics (Inter, purple gradients, cookie-cutter)
```

### Step 0.6: Save Implementation Plan

```markdown
# [Feature Name] Implementation Plan

**Design:** docs/plans/YYYY-MM-DD-[topic]-design.md
**Goal:** [One sentence]
**Stack:** [Framework] + [Test runner] + [Package manager]

---

## Tasks

[All tasks from Step 0.4]
```

**Save to:** `docs/plans/YYYY-MM-DD-<topic>-implementation.md`

```bash
git add docs/plans/
git commit -m "docs: add <topic> implementation plan"
```

---

## Phase 1: Setup

**If not already in worktree:**
```bash
# Check current location
git branch --show-current

# If on main/dev, create worktree
git worktree add .worktrees/<feature-name> -b feature/<feature-name>
cd .worktrees/<feature-name>
```

**Install dependencies:**
```bash
pnpm install  # or yarn/npm based on lockfile
```

**Verify clean baseline:**
```bash
pnpm test     # or relevant test command
```

If tests fail before you start → stop and ask user.

## Phase 2: Load Plan and Create Todos

**Read implementation plan** (created in Phase 0 or pre-existing):
`docs/plans/YYYY-MM-DD-<topic>-implementation.md`

**Create TodoWrite tasks:**
One todo per task in the plan. Mark first as `in_progress`.

## Phase 2b: Plan Test Coverage

**Before implementation, identify test needs:**

```markdown
## Test Coverage Plan

### Unit Tests (per task)
| Task | Test File | What to Test |
|------|-----------|--------------|
| Task 1: Create utility | src/utils/x.test.ts | Input/output, edge cases |
| Task 2: Create component | src/components/x.test.tsx | Rendering, props |

### Integration Tests (per feature)
| Feature | Test File | What to Test |
|---------|-----------|--------------|
| Signup form | src/features/auth/signup.integration.test.ts | Form + API + validation |

### E2E Tests (critical flows only)
| Flow | Test File | What to Test |
|------|-----------|--------------|
| User signup → dashboard | tests/signup.spec.ts | Full journey |
```

**Determine auth testing needs:**
- Uses Clerk? → integration-test-writer with Clerk mocks
- Uses WorkOS? → integration-test-writer with WorkOS mocks
- Has protected routes? → e2e-test-writer with auth.setup.ts

This plan guides which test agent to spawn for each task.

## Phase 3: Execute in Batches

**Default batch size: 3 tasks**

**Per-task loop:**
```
┌─────────────────────────────────────────────────────────┐
│  1. CLASSIFY  → what type of task? what test level?     │
│  2. TEST      → spawn test agent (unit/integration/e2e) │
│  3. BUILD     → implementer / ui-builder / specialized  │
│  4. TDD       → run test (fail→impl→pass)               │
│  5. FIX       → fixer (TS/lint cleanup)                 │
│  6. SPEC      → spec-reviewer (matches spec?)           │
│       ↳ issues? → fix → re-review                       │
│  7. QUALITY   → code-reviewer (well-built?)             │
│       ↳ issues? → fix → re-review                       │
│  8. COMMIT    → atomic commit, mark complete            │
└─────────────────────────────────────────────────────────┘
```

For each task:

### Step 1: Mark in_progress
Update TodoWrite.

### Step 2: Classify Task Type

Determine which build agent(s) may be needed:

| Task Type | Primary Agent | When to Use |
|-----------|---------------|-------------|
| General implementation | implementer | Utilities, services, APIs, business logic |
| Write unit tests | unit-test-writer | Pure functions, components, hooks |
| Write integration tests | integration-test-writer | API mocking, auth states |
| Write E2E tests | e2e-test-writer | User journeys, Playwright |
| Build UI from spec | ui-builder | UI components with existing design direction |
| Build UI from Figma | figma-builder | Figma URL provided |
| Design decisions needed | design-specifier | No spec exists (empty states, visual direction) |
| Fix TS/lint errors | fixer | Mechanical cleanup |
| Debug failing tests | debugger | Test failures |
| Run E2E tests | e2e-runner | Playwright test suites |
| Verify spec compliance | spec-reviewer | After implementation, before code quality |

**Agent selection flow:**
1. Is this general code (no UI)? → implementer
2. Is this UI with Figma? → figma-implement
3. Is this UI with design spec? → ui-builder
4. Is this UI with no spec? → design-specifier first, then ui-builder
5. Did something break? → debugger or fixer
6. Task complete? → spec-reviewer to verify

### Step 3: Write Tests First (TDD)

**Determine test type based on task:**

| Task Type | Test Agent | Framework |
|-----------|------------|-----------|
| Pure function/utility | unit-test-writer | vitest |
| Component with props | unit-test-writer | vitest + testing-library |
| Component + API/state | integration-test-writer | vitest + MSW |
| Auth-related feature | integration-test-writer | vitest + Clerk/WorkOS mocks |
| User flow/journey | e2e-test-writer | Playwright |

**Spawn appropriate test writer:**

For unit tests:
```
Task [unit-test-writer] model: sonnet: "Write unit tests for [function/component].

Behavior to test:
- [expected behavior from plan]
- [edge cases]
- [error cases]

File to create: [path/to/module.test.ts]
Follow vitest patterns from testing-patterns.md"
```

For integration tests (API/auth):
```
Task [integration-test-writer] model: sonnet: "Write integration tests for [feature].

Behavior to test:
- [component + API interaction]
- [auth states: loading, signed in, signed out]
- [error handling]

Auth: [Clerk/WorkOS/none]
API endpoints to mock: [list]
File to create: [path/to/feature.integration.test.ts]"
```

For E2E tests (critical flows):
```
Task [e2e-test-writer] model: sonnet: "Write E2E tests for [user journey].

Flow to test:
- [step 1]
- [step 2]
- [expected outcome]

Auth setup: [Clerk/WorkOS/none]
File to create: [tests/feature.spec.ts]"
```

### Step 4: TDD Cycle

```
1. Tests written (from Step 3)
2. Run test → verify FAIL
3. Write implementation (copy from plan, adapt as needed)
4. Run test → verify PASS
5. Fix TypeScript + lint (spawn fixer if issues)
6. Commit with message from plan
```

<continuous_quality>
**After every implementation, before commit:**

**TypeScript check:**
```bash
pnpm tsc --noEmit
```

**Biome lint + format:**
```bash
pnpm biome check --write .
```

**If issues found — spawn fixer:**
```
Task [fixer] model: haiku: "Fix TypeScript and lint errors.

Files with issues: [list files]
Errors: [paste error output]

Project rules: .ruler/typescript.md, .ruler/code-style.md"
```

**Why continuous:**
- Catching TS errors early is easier than fixing 20 at once
- Biome auto-fix keeps code consistent
- Each commit is clean and deployable
</continuous_quality>

**If test doesn't fail when expected:**
- Test might be wrong
- Implementation might already exist
- Stop and ask user

**If test doesn't pass after implementation — spawn debugger:**
```
Task [debugger] model: sonnet: "Test failing unexpectedly.

Test file: [path]
Test name: [name]
Error: [paste full error]
Implementation file: [path]

Investigate root cause and fix. See ${CLAUDE_PLUGIN_ROOT}/disciplines/systematic-debugging.md"
```

If debugger can't resolve after one attempt → stop and ask user.

### Step 5: Spec Compliance Check

After implementation, spawn spec-reviewer:
```
Task [spec-reviewer] model: haiku: "Verify implementation matches spec.

Task spec: [paste task specification]
Files created/modified: [list]

Check: nothing missing, nothing extra."
```

If spec-reviewer finds issues → fix with implementer/fixer → re-run spec-reviewer.
If compliant → proceed to code quality.

### Step 6: Code Quality Gate

After spec compliance passes, spawn code-reviewer:
```
Task [code-reviewer] model: haiku: "Quick code quality check.

Files: [list of files created/modified]

Check: no any types, error handling, tests exist, style consistent."
```

If code-reviewer finds issues → fix with fixer → re-run code-reviewer.
If approved → commit and mark complete.

### Step 7: Commit and Mark Complete

```bash
git add [files]
git commit -m "feat(scope): [description from plan]"
```

Update TodoWrite to mark task completed.

### Step 8: Checkpoint after batch

After every 3 tasks:

```
Completed:
- Task 1: [description] ✓
- Task 2: [description] ✓
- Task 3: [description] ✓

Tests passing: [X/X]

Ready for feedback before continuing?
```

Wait for user confirmation or adjustments.

## Phase 4: Quality Checkpoints

**After completing data/types tasks:**
- Spawn data-engineer (from review agents) for quick review
- Present findings as questions

**Before starting UI tasks:**

**If design spec exists** — spawn ui-builder:
```
Read: ${CLAUDE_PLUGIN_ROOT}/agents/build/ui-builder.md
```

**If no design spec** (empty states, undefined visuals) — spawn design-specifier first:
```
Task [design-specifier] model: opus: "Create design spec for [component].

Context: [what this is for, user's emotional state]
Existing patterns: [what it should feel like]
Project aesthetic: [tone from design doc]

Output actionable spec for ui-builder to implement."
```

Then spawn ui-builder with the design-specifier's output.

**If Figma URL provided** — spawn figma-builder:
```
Read: ${CLAUDE_PLUGIN_ROOT}/agents/build/figma-builder.md
Task [figma-builder] model: opus: "Implement from Figma: [URL]"
```

**For ui-builder, spawn:
```
Task [ui-builder] model: opus: "Build UI components for [feature].

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]
- Motion: [philosophy]

Figma: [URL if available]
Files to create: [list from implementation plan]

Interface rules: ${CLAUDE_PLUGIN_ROOT}/rules/interface/
Project rules: .ruler/react.md, .ruler/tailwind.md

Apply the aesthetic direction to every decision. Make it memorable, not generic."
```

**Fetch Figma context (if available):**
```
mcp__figma__get_design_context: fileKey, nodeId
mcp__figma__get_screenshot: fileKey, nodeId
```

**After completing ALL UI tasks — spawn designer review:**
```
Task [designer] model: opus: "Review the completed UI implementation.

Aesthetic Direction (from design doc):
- Tone: [tone]
- Memorable element: [what stands out]
- Typography: [fonts]
- Color strategy: [approach]

Files: [list of UI component files]
Figma: [URL if available]

Check for:
- Generic AI aesthetics (Inter, purple gradients, cookie-cutter layouts)
- Deviation from aesthetic direction
- Missing memorable moments
- Inconsistent application of design system
- Accessibility concerns
- Missing states (loading, error, empty)"
```

Address any review findings before proceeding.

**When implementing unfamiliar library APIs:**
```
mcp__context7__resolve-library-id: "[library name]"
mcp__context7__get-library-docs: "[library ID]" topic: "[specific feature]"
```
Use current documentation to ensure correct API usage.

**After completing all tasks:**
- Run full test suite
- Run linting

## Phase 5: Final Quality Sweep

**Spawn parallel build agents for speed:**

```
Task [fixer] model: haiku: "Run TypeScript check (tsc --noEmit) and fix any errors. Report results."

Task [fixer] model: haiku: "Run Biome check (biome check --write .) and fix any issues. Report results."
```

Wait for agents to complete. If issues found, fix before proceeding.

**Run test suite:**
```bash
pnpm test
```

If tests fail, spawn debugger to investigate.

## Phase 5b: E2E Tests (If Created)

If e2e tests were created as part of this implementation:

**Spawn e2e-runner agent:**
```
Task [e2e-runner] model: sonnet: "Run E2E tests for the feature we just implemented.

Test files: [list e2e test files]
Feature: [brief description]

Run tests, fix any failures, and iterate until all pass or report blockers.
See ${CLAUDE_PLUGIN_ROOT}/agents/build/e2e-runner.md for protocol."
```

**Why a separate agent?**
- E2E tests produce verbose output (traces, screenshots, DOM snapshots)
- Fixing may require multiple iterations
- Keeps main conversation context clean

Wait for agent to complete. Review its summary of fixes applied.

## Phase 6: Expert Review (Optional)

For significant features, offer parallel review:

"Feature complete. Run expert review before PR?"

If yes, spawn review agents in parallel (all use sonnet):

```
Task [simplicity-engineer] model: sonnet: "Review implementation for unnecessary complexity.
Files: [list of new/modified files]
See ${CLAUDE_PLUGIN_ROOT}/agents/review/simplicity-engineer.md"

Task [architecture-engineer] model: sonnet: "Review implementation for architectural concerns.
Files: [list of new/modified files]
See ${CLAUDE_PLUGIN_ROOT}/agents/review/architecture-engineer.md"
```

If auth/data involved, also spawn:
```
Task [security-engineer] model: sonnet: "Review implementation for security concerns.
Files: [list of new/modified files]
See ${CLAUDE_PLUGIN_ROOT}/agents/review/security-engineer.md"
```

Present findings as Socratic questions (see `${CLAUDE_PLUGIN_ROOT}/references/review-patterns.md`).

## Phase 7: Ship

**Ensure all tests pass:**
```bash
pnpm test
pnpm lint
```

**Create PR:**
```bash
git push -u origin feature/<feature-name>

gh pr create --title "feat: <description>" --body "$(cat <<'EOF'
## Summary
- What was built
- Key decisions

## Testing
- [X] Unit tests added
- [X] E2E tests added (if applicable)
- [X] All tests passing

## Screenshots
[Include if UI changes]

## Design Doc
[Link to design doc]

## Implementation Plan
[Link to implementation plan]
EOF
)"
```

**Report to user:**
- PR URL
- Summary of what was built
- Any follow-up items

**Cleanup worktree (optional):**
```bash
cd ..
git worktree remove .worktrees/<feature-name>
```

## Phase 8: Cleanup

**Kill orphaned subagent processes:**

After spawning multiple build agents, some may not exit cleanly. Run cleanup:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/cleanup-orphaned-agents.sh
```

This is especially important after parallel agent runs.

</process>

<when_to_stop>
**STOP and ask user when:**
- Test fails unexpectedly and debugger can't resolve
- Implementation doesn't match plan
- Stuck after 2 debug attempts
- Plan has ambiguity
- New requirement discovered
- Security concern identified

**Don't guess. Ask.**
</when_to_stop>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Look for related ideate sessions and any prior implementation attempts.
</progress_context>

<progress_append>
After completing implementation (or pausing), append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:implement
**Task:** [Feature name]
**Outcome:** [Complete / In Progress (X/Y tasks) / Blocked]
**Files:** [Key files created/modified]
**Agents spawned:** [list of agents used]
**Decisions:**
- [Key implementation decision]
**Next:** [PR created / Continue tomorrow / Blocked on X]

---
```
</progress_append>

<success_criteria>
Execution is complete when:
- [ ] All tasks marked completed in TodoWrite
- [ ] All tests passing
- [ ] Linting passes
- [ ] PR created
- [ ] User informed of completion
- [ ] Progress journal updated
- [ ] Orphaned agents cleaned up
</success_criteria>
