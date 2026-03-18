---
name: polish
description: |
  Pre-ship visual refinement pass. Checks spacing, state completeness, contrast, typography,
  and motion quality. Use when asked to "polish this", "clean up the UI", "final pass",
  or before shipping any UI feature.
license: MIT
argument-hint: <component-or-page>
metadata:
  author: howells
website:
  order: 22
  desc: Visual refinement
  summary: Final quality pass before shipping. Checks spacing consistency, all 8 interactive states, contrast compliance, typography hierarchy, and motion quality.
  what: |
    Polish performs a systematic visual quality audit on a component or page. It screenshots current state, checks spacing against your scale, verifies all interactive states exist (default, hover, focus, active, disabled, loading, error, success), validates contrast ratios, audits typography hierarchy, and reviews motion. All fixes use Tailwind classes.
  why: |
    The gap between "it works" and "it's polished" is where most AI-generated UI falls short. Polish catches the things you stop noticing after staring at code—inconsistent spacing, missing focus states, cramped padding, contrast failures. It's the last step before shipping, not the first.
  decisions:
    - User-interactive, not agent-delegated. You see every finding and approve every fix.
    - Uses browser screenshots for visual verification, with Chrome MCP preferred in Claude Code.
    - All fixes expressed in Tailwind classes.
  workflow:
    position: branch
    joins: letsgo
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — REQUIRED for all user decisions (approval to apply fixes). Never ask questions as plain text. Keep context before the question to 2-3 sentences max.

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Execute phases below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

# Polish Workflow

Pre-ship visual refinement. The last step before shipping, not the first.

**Announce at start:** "I'm using the polish skill for a final visual quality pass."

<important>
**This skill is user-interactive. Do NOT spawn agents.**
Polish requires visual inspection and judgment — it's collaborative, not delegated.
**Polish is the last step, not the first.** Don't begin until functionality is complete.
</important>

---

## Phase 0: Load References (MANDATORY)

<required_reading>
**Read ALL of these using the Read tool:**

1. `rules/interface/spacing.md` — Spacing scale and philosophy
2. `rules/interface/colors.md` — Color rules, contrast, OKLCH
3. `rules/interface/typography.md` — Type hierarchy and OpenType
4. `rules/interface/interactions.md` — Eight interactive states
5. `rules/interface/animation.md` — Motion rules
6. `references/frontend-design.md` — Design review checklist
7. `references/typography-opentype.md` — OpenType features, tabular-nums, kerning, text-wrap
8. `references/touch-targets.md` — Hit target expansion, pseudo-element technique, mobile targets
9. `references/ux-laws.md` — Fitts's Law (target sizing), Gestalt (spacing/grouping), Doherty (timing)
10. `references/prefetch-patterns.md` — Trajectory prefetching, hit slop zones (when reviewing navigation UX)
</required_reading>

---

## Phase 1: Visual Capture

**Screenshot current state. Prefer Chrome MCP in Claude Code. Outside Claude, prefer `agent-browser`, then Playwright if needed:**

```
1. mcp__claude-in-chrome__tabs_context_mcp
2. mcp__claude-in-chrome__navigate to the feature URL
3. mcp__claude-in-chrome__computer action=screenshot (desktop)
4. mcp__claude-in-chrome__resize_window width=375 height=812
5. mcp__claude-in-chrome__computer action=screenshot (mobile)
6. mcp__claude-in-chrome__resize_window width=1440 height=900
```

If no browser tool is available, ask the user to provide the component/page path or screenshots and review code directly.

---

## Phase 2: Systematic Audit

Work through each dimension. Report findings as you go.

### 2.1 Spacing Verification

Check all spacing against the 4px scale (Tailwind's built-in: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px):

- [ ] Section padding consistent (`p-4 md:p-6 lg:p-8` or similar)
- [ ] Card/container padding not cramped (minimum `p-4` for compact, `p-6` standard)
- [ ] Gap between elements uses `gap-*` not margin hacks
- [ ] Button padding not cramped (`px-4 py-2` minimum standard)
- [ ] Heading `margin-bottom` creates hierarchy (heading closer to its body than to content above)
- [ ] Consistent rhythm top to bottom
- [ ] No arbitrary spacing values (`p-[13px]`)
- [ ] Content width constrained (`max-w-prose` for body text)

### 2.2 Interactive State Completeness

For every interactive element, verify all 8 states:

| State | Check | Common Tailwind |
|-------|-------|----------------|
| Default | Base styling present | — |
| Hover | Subtle feedback (gated to `hover:hover`) | `hover:bg-gray-100` |
| Focus | Visible ring for keyboard | `focus-visible:ring-2` |
| Active | Press feedback | `active:scale-[0.97]` |
| Disabled | Reduced opacity, no pointer | `disabled:opacity-50 disabled:pointer-events-none` |
| Loading | Spinner or skeleton | `aria-busy="true"` |
| Error | Red border, message | `aria-invalid:border-red-500` |
| Success | Confirmation feedback | — |

- [ ] No hover-only interactions (touch users excluded)
- [ ] Focus rings visible and consistent
- [ ] Disabled states prevent interaction

### 2.3 Contrast & Color

- [ ] Body text passes 4.5:1 against background
- [ ] Large text (≥18px bold, ≥24px) passes 3:1
- [ ] UI components (borders, icons) pass 3:1
- [ ] Placeholder text passes 4.5:1 (commonly fails)
- [ ] No grey text on colored backgrounds
- [ ] No pure black (#000) on pure white (#fff)
- [ ] Color not used as sole indicator

### 2.4 Typography

- [ ] `antialiased` on body
- [ ] Heading hierarchy clear (size + weight + color, not size alone)
- [ ] Body text minimum 16px (`text-base`)
- [ ] Line length constrained (45-75 characters)
- [ ] `text-balance` on headings, `text-pretty` on body
- [ ] `tabular-nums` on data tables, prices, timers
- [ ] No weight change on hover (causes layout shift)

### 2.5 Motion

- [ ] Entering elements use `ease-out` (not `ease-in`)
- [ ] Durations appropriate (100-150ms feedback, 200-300ms state changes)
- [ ] `prefers-reduced-motion` respected
- [ ] Only `transform` and `opacity` animated (no `width`, `height`, `top`)
- [ ] Exit animations faster than entrances (~75% duration)

### 2.6 Responsive

- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44px
- [ ] Text readable without zooming
- [ ] Images don't overflow container

---

## Phase 3: Report & Fix

Present findings grouped by severity:

### Critical (must fix)
- Contrast failures
- Missing focus states
- Broken mobile layout
- Touch targets too small

### High (should fix)
- Inconsistent spacing
- Missing interactive states
- Typography hierarchy unclear

### Medium (nice to fix)
- Motion refinements
- Spacing fine-tuning
- Dark mode adjustments

**For each finding:** state what's wrong, show the current Tailwind classes, show the fix (new Tailwind classes), then ask for approval before applying:

```yaml
AskUserQuestion:
  question: "Apply this fix?"
  header: "Polish Fix"
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

**After all fixes, screenshot again:**

```
1. mcp__claude-in-chrome__computer action=screenshot (desktop)
2. mcp__claude-in-chrome__resize_window width=375 height=812
3. mcp__claude-in-chrome__computer action=screenshot (mobile)
```

Compare before/after. Confirm improvements with user.

---

## Phase 5: Final Checklist

Run the Design Review Checklist from `frontend-design.md`:

- [ ] Zero red flags
- [ ] Spacing consistent and generous
- [ ] All interactive states designed
- [ ] Contrast compliant
- [ ] Typography intentional
- [ ] Motion purposeful
- [ ] Mobile responsive

**"Zoom in. Squint at it. Use it yourself."**

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `references/arc-log.md`

Entry: `/arc:polish — [Component/page] polished ([key changes])`
</arc_log>

<success_criteria>
Polish is complete when:
- [ ] Current state screenshotted (desktop + mobile)
- [ ] All 6 audit dimensions checked
- [ ] Findings presented by severity
- [ ] Fixes applied with Tailwind classes
- [ ] After-state screenshotted and compared
- [ ] Zero critical issues remaining
- [ ] Final checklist passed
</success_criteria>
