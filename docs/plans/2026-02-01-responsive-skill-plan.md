# /arc:responsive — Implementation Plan

**Design doc:** `docs/plans/2026-02-01-responsive-skill-design.md`
**Type:** New Arc plugin skill (documentation only — SKILL.md + command file)

---

## Task 1: Create the command file

**Files:**
- Create: `commands/responsive.md`

**What:**
Create the command entry point following the same pattern as other Arc commands (`seo.md`, `audit.md`).

```markdown
---
description: Audit and fix responsive/mobile issues across every page with visual verification.
---

Invoke the responsive skill with any arguments provided.
```

**Verify:** Command file matches the exact pattern used by `commands/seo.md`.

**Commit:** `feat(responsive): add command entry point`

---

## Task 2: Create SKILL.md with frontmatter and tool restrictions

**Files:**
- Create: `skills/responsive/SKILL.md`

**What:**
Write the YAML frontmatter with skill metadata, and the `<tool_restrictions>` section.

Frontmatter should include:
- `name: responsive`
- `description:` — Audit and fix responsive/mobile issues across every page, using Chrome MCP screenshots at two breakpoints (375px mobile, 1440px desktop). Design-aware: preserves aesthetic intent from existing design docs.
- `license: MIT`
- `metadata.author: howells`
- `website:` section with `order`, `desc`, `summary`, `what`, `why`, `decisions`

Tool restrictions:
- No `EnterPlanMode` / `ExitPlanMode` — skill manages its own flow
- Must use `AskUserQuestion` for all questions (consistent with ideate skill)

**Verify:** Run plugin validation (`git add . && git commit` triggers hook). Frontmatter parses correctly.

**Commit:** `feat(responsive): add SKILL.md frontmatter and tool restrictions`

---

## Task 3: Write Phase 1 — Prerequisites & Route Discovery

**Files:**
- Modify: `skills/responsive/SKILL.md`

**What:**
Write the first phase of the skill workflow.

**Phase 1: Setup & Discovery**

1. **Check prerequisites:**
   - Detect if Chrome MCP tools are available (check for `mcp__claude-in-chrome__*` tools)
   - If not available, exit with clear message: "This skill requires the Claude in Chrome extension."
   - Ask user for dev server URL (default `localhost:3000`) via `AskUserQuestion`
   - Verify dev server is running by navigating to the URL

2. **Load design context:**
   - Glob for `docs/plans/design-*.md` — if found, read it
   - Note: aesthetic direction, memorable element, spacing system, typography hierarchy
   - Read interface rules: `${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md`, `interactions.md`, `spacing.md`

3. **Discover routes:**
   - Detect framework (Next.js App Router, Pages Router, etc.) — same pattern as `/arc:seo`
   - Scan for page files, build route list
   - Exclude API routes (`app/api/**`)
   - Flag dynamic routes (`[slug]`, `[id]`) — ask user for sample values via `AskUserQuestion`
   - Flag potentially auth-protected routes — ask user to log in via Chrome if needed
   - Present final route list to user for confirmation (`AskUserQuestion` with multiSelect for skipping)

**Verify:** Phase reads coherently, references correct tool names, uses `AskUserQuestion` for all questions.

**Commit:** `feat(responsive): add Phase 1 — prerequisites and route discovery`

---

## Task 4: Write Phase 2 — Page-by-page audit & fix loop

**Files:**
- Modify: `skills/responsive/SKILL.md`

**What:**
Write the core loop of the skill.

**Phase 2: Page-by-page Audit & Fix**

For each page in the confirmed route list:

1. **Mobile screenshot (375x812):**
   ```
   mcp__claude-in-chrome__navigate to page URL
   mcp__claude-in-chrome__resize_window width=375 height=812
   mcp__claude-in-chrome__computer action=screenshot
   ```

2. **Analyze against checklist:**
   - Layout: horizontal overflow, broken grids, elements overlapping
   - Spacing: cramped content, elements touching container edges, inconsistent gaps
   - Typography: text too small (body < 16px), heading hierarchy breaks
   - Usability: touch targets < 44px, inputs without `text-base`, missing viewport meta
   - Design: does the page preserve the aesthetic direction from the design doc?

3. **Fix issues in code:**
   - Container queries for component-level fixes (cards, sidebars, content blocks)
   - Viewport queries for page-level layout (grid columns, section stacking)
   - Reference `rules/interface/` for correct patterns
   - Don't invent new spacing values — use the existing scale

4. **Verify mobile fix:**
   ```
   mcp__claude-in-chrome__computer action=screenshot
   ```
   Compare to pre-fix state. Issue resolved?

5. **Desktop regression check (1440x900):**
   ```
   mcp__claude-in-chrome__resize_window width=1440 height=900
   mcp__claude-in-chrome__computer action=screenshot
   ```
   Confirm desktop layout is intact. If broken, fix and re-verify both.

6. **Scroll check:**
   For pages longer than viewport, scroll down and screenshot to catch below-the-fold issues.

7. **Move to next page.**

Include guidance on shared components: "If you recognize the same component causing issues across multiple pages, fix the component source file rather than adding page-specific overrides."

**Verify:** Loop is clear, Chrome MCP calls use correct tool names and parameters, design-awareness is woven in.

**Commit:** `feat(responsive): add Phase 2 — page-by-page audit and fix loop`

---

## Task 5: Write Phase 3 — Summary & commit

**Files:**
- Modify: `skills/responsive/SKILL.md`

**What:**
Write the finalization phase.

**Phase 3: Summary & Commit**

1. **List all changes** grouped by page/component:
   ```
   ## Responsive Fixes Applied

   ### / (homepage)
   - Fixed hero grid: 3-column → single-column on mobile (container query)
   - Fixed nav: added mobile hamburger menu

   ### /about
   - Fixed image overflow: added max-w-full
   - Fixed touch targets on CTA buttons

   ### Shared: components/Card.tsx
   - Added container query for horizontal → vertical layout
   ```

2. **Batch commit** all responsive fixes:
   ```bash
   git add .
   git commit -m "fix: responsive fixes across [N] pages"
   ```

3. **Optional audit doc:** Ask user if they want a `docs/plans/responsive-audit.md` documenting all issues found and fixes applied.

4. **Arc log entry.**

**Verify:** Summary format is clear, commit message follows conventions.

**Commit:** `feat(responsive): add Phase 3 — summary and commit`

---

## Task 6: Write success criteria, interop section, and arc_log

**Files:**
- Modify: `skills/responsive/SKILL.md`

**What:**
Add the closing sections following the Arc skill template.

**Success criteria:**
```markdown
<success_criteria>
Responsive audit is complete when:
- [ ] Chrome MCP connected and dev server verified
- [ ] Design doc read (if exists) for aesthetic context
- [ ] Interface rules loaded (layout, interactions, spacing)
- [ ] Routes discovered and confirmed with user
- [ ] Each page screenshotted at 375px (mobile)
- [ ] Issues identified and fixed per page
- [ ] Each fix verified with re-screenshot
- [ ] Desktop (1440px) checked after mobile fixes — no regressions
- [ ] Changes committed
- [ ] Activity log updated
</success_criteria>
```

**Interop:**
- Invoked after `/arc:build` or `/arc:implement`
- Reads design docs from `/arc:design`
- References `rules/interface/` for patterns
- Uses Chrome MCP for all browser interaction
- Follows `/arc:commit` discipline

**Arc log:**
```markdown
<arc_log>
Entry: `/arc:responsive — [N] pages audited, [N] issues fixed`
</arc_log>
```

**Verify:** Sections match the template from other skills (seo, design).

**Commit:** `feat(responsive): add success criteria, interop, and arc_log`

---

## Task 7: Update CLAUDE.md skill listing and plugin structure docs

**Files:**
- Modify: `CLAUDE.md` — add `/arc:responsive` to the command workflow table under "CROSS-CUTTING"

**What:**
Add the new skill to the command workflow documentation in CLAUDE.md:
```
/arc:responsive → Responsive audit & fix across all pages
```

Place it in the cross-cutting section alongside `/arc:seo` and `/arc:audit`.

**Verify:** Plugin validation passes. CLAUDE.md command list is consistent.

**Commit:** `docs: add /arc:responsive to command workflow`

---

## Task 8: Final validation and push

**What:**
1. Run full plugin validation
2. Read through the complete SKILL.md for coherence
3. Ensure all AskUserQuestion usage is correct (options with labels + descriptions)
4. Ensure Chrome MCP tool names are accurate
5. Push all commits

**Commit:** No new commit — just validation and push.

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Command entry point | `commands/responsive.md` |
| 2 | SKILL.md frontmatter + tool restrictions | `skills/responsive/SKILL.md` |
| 3 | Phase 1: prerequisites + route discovery | `skills/responsive/SKILL.md` |
| 4 | Phase 2: page-by-page audit & fix loop | `skills/responsive/SKILL.md` |
| 5 | Phase 3: summary & commit | `skills/responsive/SKILL.md` |
| 6 | Success criteria, interop, arc_log | `skills/responsive/SKILL.md` |
| 7 | Update CLAUDE.md skill listing | `CLAUDE.md` |
| 8 | Final validation and push | — |
