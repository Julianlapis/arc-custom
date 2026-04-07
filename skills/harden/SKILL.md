---
name: harden
description: |
  Production resilience pass. Addresses error states, text overflow, i18n prep,
  edge cases, loading states, and input validation. Use when asked to "harden this",
  "make it production ready", "handle edge cases", or before shipping UI to real users.
license: MIT
argument-hint: <component-or-page>
metadata:
  author: howells
website:
  order: 25
  desc: Production resilience
  summary: Strengthen UI against real-world usage. Error states, text overflow, i18n prep, edge cases, loading patterns, and input validation — all with Tailwind utilities.
  what: |
    Harden reviews a component or page for production resilience. It checks for missing error states, text overflow handling, internationalization readiness, edge cases (empty data, huge datasets, slow networks), and input validation. All fixes use Tailwind utilities and HTML patterns. Designs that only work with perfect data aren't production-ready.
  why: |
    The demo looks great. Then a user pastes a 500-character name, the API times out, the German translation is 40% longer than English, and there are zero results to display. Harden catches all of these before your users do.
  decisions:
    - User-interactive, not agent-delegated. Each hardening decision needs context.
    - Focuses on UI resilience, not backend hardening (use security-engineer for that).
    - All fixes expressed in Tailwind utilities and semantic HTML.
  workflow:
    position: branch
    joins: letsgo
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for user decisions such as applying fixes or keep/remove choices. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Do not narrate missing tools or fallbacks to the user.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Execute phases below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<arc_runtime>
Arc-owned files live under the Arc install root for full-runtime installs.

Set `${ARC_ROOT}` to that root and use `${ARC_ROOT}/...` for Arc bundle files such as
`references/`, `disciplines/`, `agents/`, `templates/`, `scripts/`, and `rules/`.

Project-local files stay relative to the user's repository.
</arc_runtime>

# Harden Workflow

Strengthen UI against real-world usage. Designs that only work with perfect data aren't production-ready.

**Announce at start:** "I'm using the harden skill to make this production-resilient."

<important>
**This skill is user-interactive. Do NOT spawn agents.**
Hardening decisions need context — what's likely vs. paranoid, what's worth the complexity.
</important>

---

## Phase 0: Load References

<required_reading>
**Read these using the Read tool:**

1. `rules/interface/forms.md` — Form behavior and validation
2. `rules/interface/interactions.md` — Interactive states, destructive actions
3. `rules/interface/content-accessibility.md` — Accessible content
4. `${ARC_ROOT}/references/touch-targets.md` — Hit target expansion, minimum sizes, pseudo-element technique
5. `${ARC_ROOT}/references/ux-laws.md` — Postel's Law (input tolerance), Hick's Law (option overload), Cognitive Load
</required_reading>

---

## Phase 1: Read The Code

Read all files for the target component/page. Identify:
- What data does it display?
- What user input does it accept?
- What async operations does it perform?
- What states can the UI be in?

---

## Phase 2: Systematic Audit

Work through each hardening dimension:

### 2.1 Text Overflow

Every text element needs an overflow strategy:

```html
<!-- Single line — truncate -->
<p class="truncate">Long text gets ellipsis...</p>

<!-- Multi-line — clamp -->
<p class="line-clamp-3">Shows 3 lines then ellipsis...</p>

<!-- Headings — balance wrapping -->
<h1 class="text-balance">Heading wraps elegantly</h1>

<!-- Body — pretty wrapping -->
<p class="text-pretty">Body text avoids orphans</p>

<!-- Flex children — prevent overflow -->
<div class="min-w-0"><!-- Required in flex to allow truncation --></div>

<!-- URLs and long words -->
<p class="break-all">superlongdomainname.com/path/to/thing</p>
```

Check:
- [ ] Every text element has an overflow strategy
- [ ] Flex/grid children use `min-w-0` where needed
- [ ] Long user-generated content won't break layout
- [ ] URLs and email addresses handled (`break-all` or `break-words`)

### 2.2 Empty States

Every data-driven view needs an empty state:

```html
<!-- Not just "No items" — provide context and action -->
<div class="flex flex-col items-center gap-4 py-12 text-center">
  <p class="text-gray-500">No projects yet</p>
  <p class="text-sm text-gray-400">Create your first project to get started.</p>
  <button class="...">Create project</button>
</div>
```

Check:
- [ ] Every list/table/grid has an empty state
- [ ] Empty states explain what would be here and why
- [ ] Empty states provide a next action (CTA)
- [ ] Empty states don't show irrelevant UI (hide filters, sorting when empty)

### 2.3 Loading States

Every async operation needs loading feedback:

```html
<!-- Skeleton loading — preferred over spinners -->
<div class="animate-pulse space-y-4">
  <div class="h-4 w-3/4 rounded bg-gray-200"></div>
  <div class="h-4 w-1/2 rounded bg-gray-200"></div>
</div>

<!-- Button loading — disable + spinner + keep label -->
<button disabled class="disabled:opacity-50" aria-busy="true">
  <Spinner class="size-4 animate-spin" />
  Save changes
</button>

<!-- Inline loading -->
<div aria-busy="true" aria-live="polite">Loading...</div>
```

Check:
- [ ] Every async fetch has a loading state (skeleton preferred)
- [ ] Buttons disable during submission (`disabled`, `aria-busy`)
- [ ] Loading states match the shape of loaded content (skeleton)
- [ ] `aria-busy` and `aria-live` for screen readers

### 2.4 Error States

Every operation that can fail needs error handling:

```html
<!-- Inline field error -->
<input aria-invalid="true" class="border-red-500 focus:ring-red-500" />
<p class="mt-1 text-sm text-red-500" role="alert">Email address is required</p>

<!-- Page-level error with retry -->
<div class="flex flex-col items-center gap-4 py-12 text-center" role="alert">
  <p class="text-red-500">Something went wrong loading your data.</p>
  <button onclick="retry()">Try again</button>
</div>
```

Error messages must:
- Say **what** happened (not "Error")
- Say **why** if possible ("Your session expired")
- Say **how to fix it** ("Sign in again" with link)

Check:
- [ ] Every fetch/mutation has error handling
- [ ] Error messages are specific and actionable
- [ ] Inline errors use `aria-invalid` and `role="alert"`
- [ ] Retry option provided where possible
- [ ] Errors don't lose user's input (preserve form state)

### 2.5 Internationalization Readiness

Even if not translating yet, prepare the UI:

```html
<!-- Use logical properties (RTL-safe) -->
<div class="ms-4 me-2 ps-3 pe-3">  <!-- Not ml-4 mr-2 pl-3 pr-3 -->

<!-- Budget 30-40% more space for translations -->
<!-- "Save" (EN) → "Speichern" (DE) → "Enregistrer" (FR) -->
<button class="min-w-[120px]">Save</button>  <!-- Don't constrain to exact content width -->
```

Use the `Intl` API for dates, numbers, currency:
```tsx
// Not: "March 5, 2026" or toLocaleDateString()
new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(price)
```

Check:
- [ ] Logical CSS properties used (`ms-*`, `me-*`, `ps-*`, `pe-*` not `ml-*`, `mr-*`)
- [ ] Buttons/labels have room to grow (not pixel-exact to content)
- [ ] Dates and numbers use `Intl` API
- [ ] No text in images
- [ ] Icons don't rely on cultural assumptions

### 2.6 Edge Cases

Test mentally with extreme inputs:

| Scenario | What breaks? |
|----------|-------------|
| 0 items | Empty state needed |
| 1 item | Singular/plural text? Layout with single child? |
| 1,000+ items | Pagination or virtual scroll needed? |
| 500-char user name | Text overflow? Layout break? |
| Slow network (3G) | Loading state needed? Optimistic UI? |
| Offline | Error handling? Cache? |
| Double-click submit | Duplicate prevention? |
| Paste into input | Allowed? Sanitized? |
| Browser back | State preserved? Scroll restored? |

Check:
- [ ] Pagination or virtual scroll for large datasets
- [ ] Double-submit prevention (`disabled` after click, idempotency keys)
- [ ] Back/forward restores state (URL reflects state — use nuqs)
- [ ] Paste always allowed (never block paste)
- [ ] Unsaved changes warned before navigation

### 2.7 Input Validation

Validate client-side for UX, server-side for security:

```html
<!-- Set constraints with HTML attributes -->
<input
  type="email"
  required
  maxlength="255"
  autocomplete="email"
  class="..."
/>

<!-- Accept free text, validate after -->
<!-- NEVER block typing -->
<!-- MUST allow submitting incomplete forms to surface validation -->
```

Check:
- [ ] Correct `type` for keyboard (`email`, `tel`, `url`, `number`)
- [ ] `autocomplete` and `name` for login/address forms
- [ ] `maxlength` on text inputs
- [ ] Validation on blur, not on keystroke (except password strength)
- [ ] Errors below fields with `aria-describedby`

---

## Phase 3: Report & Fix

Present findings grouped by impact:

### Critical (will break for real users)
- Missing error handling on async operations
- Text overflow breaking layout
- No loading states
- Double-submit possible

### High (degraded experience)
- Missing empty states
- No feedback on actions
- Input validation missing

### Medium (polish for production)
- i18n readiness
- Edge case handling
- Keyboard accessibility gaps

For each finding: describe the issue, show the fix with Tailwind classes, then ask for approval before applying:

```yaml
AskUserQuestion:
  question: "Apply this fix?"
  header: "Hardening Fix"
  options:
    - label: "Apply"
      description: "Apply this fix now"
    - label: "Skip"
      description: "Skip this fix and move to the next finding"
    - label: "Apply all"
      description: "Apply this and all remaining fixes without asking"
```

If the user selects "Apply all", apply all remaining fixes without further prompts.

---

## Phase 4: Verify

After fixes:
- [ ] Test with empty data
- [ ] Test with very long text
- [ ] Test with error responses (if possible)
- [ ] Test loading states
- [ ] Test on mobile

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`

Entry: `/arc:harden — [Component/page] hardened ([# issues found, # fixed])`
</arc_log>

<success_criteria>
Harden is complete when:
- [ ] All 7 dimensions audited
- [ ] Text overflow handled for all text elements
- [ ] Empty states designed for all data views
- [ ] Loading states for all async operations
- [ ] Error states for all operations that can fail
- [ ] i18n basics addressed (logical properties, space budget)
- [ ] Edge cases identified and handled
- [ ] Input validation correct
- [ ] Zero critical issues remaining
</success_criteria>
