---
name: distill
description: |
  Strip UI to its essentials. Remove unnecessary complexity, redundant wrappers,
  excessive nesting, and over-engineered components. Use when asked to "simplify this",
  "strip it down", "make it cleaner", or when UI feels bloated.
license: MIT
argument-hint: <component-or-page>
metadata:
  author: howells
website:
  order: 23
  desc: UI simplification
  summary: Remove unnecessary complexity from UI. Find redundant wrappers, excessive nesting, and over-engineered components. Output simpler, cleaner Tailwind.
  what: |
    Distill analyzes a component or page for unnecessary complexity and strips it to its essentials. It finds redundant wrapper divs, excessive nesting, unused CSS classes, over-engineered abstractions, and visual noise that doesn't serve the user. The output is simpler code with fewer elements, cleaner Tailwind classes, and a more focused user experience.
  why: |
    AI-generated UI tends toward over-engineering — extra wrapper divs "just in case," defensive styling, redundant containers. Human developers accumulate complexity through iterations. Distill provides the opposite force: ruthless simplification while preserving what matters.
  decisions:
    - User-interactive, not agent-delegated. Every removal is discussed and approved.
    - Never sacrifices accessibility, functionality, or necessary information for minimalism.
    - Complexity should match actual task complexity — simple tasks deserve simple UI.
  workflow:
    position: branch
    joins: implement
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Execute phases below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

# Distill Workflow

Strip UI to its essence. "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away."

**Announce at start:** "I'm using the distill skill to simplify this UI."

<important>
**This skill is user-interactive. Do NOT spawn agents.**
Simplification requires judgment about what matters — it's collaborative, not automated.

**Never sacrifice:**
- Accessibility
- Core functionality
- Necessary information
- User understanding

**Simplicity means removing obstacles between users and their goals — not eliminating features or clarity.**
</important>

---

## Phase 0: Context

<required_reading>
**Read these using the Read tool:**

1. `${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md` — Spacing and hierarchy (cards are not required)
2. `${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md` — Visual principles
3. `${CLAUDE_PLUGIN_ROOT}/references/design-philosophy.md` — "Less but better" principles
</required_reading>

**Ask the user:**
```
Question: "What is the ONE thing this component/page should accomplish?"
Header: "Core purpose"
Options:
  1. "Let me explain" — User describes the core purpose
  2. "Infer from code" — You analyze and propose the core purpose
```

---

## Phase 1: Assess Current State

### Read the code

Read all files for the target component/page. Look for:

### Structural Complexity

- [ ] **Redundant wrappers**: Div soup — containers that add no styling, no semantics, no layout purpose
- [ ] **Excessive nesting**: More than 3-4 levels deep for simple content
- [ ] **Unnecessary cards**: Content grouped in cards that could use spacing/typography alone
- [ ] **Cards within cards**: Almost never justified — use spacing and dividers instead
- [ ] **Defensive containers**: Wrappers added "just in case" that serve no current purpose

### Visual Complexity

- [ ] **Too many font sizes**: More than 5 distinct sizes creates muddy hierarchy
- [ ] **Too many colors**: More than 3 distinct colors (plus neutrals) creates noise
- [ ] **Decorative clutter**: Borders, shadows, backgrounds that don't aid comprehension
- [ ] **Inconsistent spacing**: Different gaps that should be the same
- [ ] **Gradient/effect overuse**: Visual effects without communicative purpose

### Tailwind Complexity

- [ ] **Class sprawl**: Elements with 15+ classes that could be simplified
- [ ] **Redundant classes**: `flex flex-col items-start` when `items-start` is the default
- [ ] **Responsive overrides that undo**: `hidden md:block` chains that suggest wrong base state
- [ ] **Arbitrary values**: `p-[17px]` instead of scale values
- [ ] **Dark mode duplication**: `text-gray-900 dark:text-gray-100` instead of CSS variable flipping

### Interaction Complexity

- [ ] **Too many actions**: Every section doesn't need a CTA
- [ ] **Over-configured components**: Props that could be fewer with better defaults
- [ ] **Modal/dialog overuse**: Inline expansion or navigation might be simpler
- [ ] **Form over-engineering**: Validation for scenarios that can't happen

---

## Phase 2: Plan Removal

**Present findings as a distillation plan:**

```markdown
## Distillation Plan

### Remove (no value lost)
1. [Wrapper div at line X — adds no styling or semantics]
2. [Card container — spacing alone creates grouping]

### Simplify (same value, less code)
1. [15 Tailwind classes → 8 by removing redundancies]
2. [3-level nesting → flat with gap]

### Consolidate (multiple things → one)
1. [3 similar buttons → 1 with variant prop]
2. [Repeated icon+text pattern → shared component]

### Preserve (looks removable but isn't)
1. [Wrapper needed for overflow handling]
2. [Extra div required for animation transform-origin]
```

**Ask:** "Does this distillation plan look right? Anything I should preserve?"

---

## Phase 3: Simplify Systematically

Apply changes in this order (safest first):

### 3.1 Remove Redundant Wrappers

```html
<!-- Before: unnecessary wrapper -->
<div>
  <div class="flex gap-4">
    <div class="p-4">Content</div>
  </div>
</div>

<!-- After: flat -->
<div class="flex gap-4">
  <div class="p-4">Content</div>
</div>
```

### 3.2 Replace Cards with Spacing

```html
<!-- Before: card for grouping -->
<div class="rounded-lg border p-4 shadow-sm">
  <h3>Title</h3>
  <p>Description</p>
</div>

<!-- After: spacing creates grouping -->
<div class="space-y-2">
  <h3 class="font-semibold">Title</h3>
  <p class="text-gray-600">Description</p>
</div>
```

### 3.3 Clean Tailwind Classes

Remove classes that are defaults or redundant:
- `flex-row` (default for flex)
- `items-stretch` (default for flex)
- `static` (default position)
- `visible` (default)
- `text-left` (default for LTR)

### 3.4 Flatten Nesting

Use `gap-*` instead of nested containers with margins.

### 3.5 Reduce Visual Noise

Ask for each decorative element: "Would the user notice if this was removed?" If no, remove it.

---

## Phase 4: Verify

After each batch of changes:

1. **Visual check**: Screenshot if Chrome MCP available, or run dev server
2. **Functionality check**: Ensure nothing broke
3. **Accessibility check**: Semantic HTML preserved, ARIA attributes intact

**Ask:** "The simplified version is ready. Does it still feel complete?"

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `${CLAUDE_PLUGIN_ROOT}/references/arc-log.md`

Entry: `/arc:distill — [Component/page] simplified ([elements removed, classes reduced])`
</arc_log>

<success_criteria>
Distill is complete when:
- [ ] Core purpose identified
- [ ] Current complexity assessed across all dimensions
- [ ] Distillation plan presented and approved
- [ ] Changes applied systematically (safest first)
- [ ] No accessibility or functionality regressions
- [ ] Visually verified
- [ ] Code is genuinely simpler, not just rearranged
</success_criteria>
