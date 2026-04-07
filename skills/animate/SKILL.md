---
name: animate
description: |
  Review a feature and add purposeful animations. Identifies static areas needing
  feedback, transitions, or delight, then adds motion/react or CSS transitions.
  Use when asked to "animate this", "add motion", "make it feel alive", or "add transitions".
license: MIT
argument-hint: <component-or-page>
metadata:
  author: howells
website:
  order: 24
  desc: Strategic motion
  summary: Analyze a feature and strategically add animations that improve usability and feel. Entrance choreography, micro-interactions, state transitions, and scroll effects.
  what: |
    Animate reviews a component or page and identifies where motion would improve the experience — missing feedback on actions, jarring state changes, unclear spatial relationships, or functional-but-joyless interactions. It then adds motion systematically: entrance choreography, micro-interactions, state transitions. Uses motion/react for JS control or CSS transitions for simple cases. Always respects prefers-reduced-motion.
  why: |
    Most AI-generated UI is static. Buttons don't respond to press, elements appear instantly, state changes are jarring. But scattered animation everywhere is worse than none. Animate provides the strategic middle ground: purposeful motion that makes the interface feel crafted.
  decisions:
    - User-interactive, not agent-delegated. Animation is subjective and needs your approval.
    - One hero moment + systematic feedback layer. Not "animate everything."
    - motion/react for JS-controlled animation, CSS for simple transitions.
    - Always provides prefers-reduced-motion alternative.
  workflow:
    position: branch
    joins: implement
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## REQUIRED TOOLS — use these, do not skip:
- **`AskUserQuestion`** — Preserve the one-question-at-a-time interaction pattern for user decisions such as motion tone and plan approval. In Claude Code, use the tool. In Codex, ask one concise plain-text question at a time unless a structured question tool is actually available in the current mode. Keep context before the question to 2-3 sentences max, and do not narrate missing tools or fallbacks to the user.

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

# Animate Workflow

Review a feature and add purposeful motion. One orchestrated experience beats scattered animations everywhere.

**Announce at start:** "I'm using the animate skill to add purposeful motion."

<important>
**This skill is user-interactive. Do NOT spawn agents.**
Animation choices are subjective — the user must see and approve each addition.

**Every animation must answer:** "Why does this exist?"

**One well-orchestrated experience beats scattered animations everywhere. Focus on high-impact moments.**
</important>

---

## Phase 0: Load References (MANDATORY)

<required_reading>
**Read ALL of these using the Read tool:**

1. `rules/interface/animation.md` — Easing, duration, spring presets, performance tiers
2. `${ARC_ROOT}/references/animation-patterns.md` — Deep animation patterns
3. `${ARC_ROOT}/references/interaction-physics.md` — 300ms ceiling, spring vs easing decisions, exit patterns, container two-div pattern
4. `${ARC_ROOT}/references/frontend-design.md` — Anti-patterns (bounce/elastic = dated)
</required_reading>

---

## Phase 1: Context

**Ask the user using the AskUserQuestion interaction pattern:**
```yaml
AskUserQuestion:
  question: "What's the personality of this feature?"
  header: "Motion tone"
  options:
    - label: "Snappy and confident"
      description: "Quick, decisive transitions. Enterprise, developer tools."
    - label: "Smooth and refined"
      description: "Gentle, polished. Premium, editorial."
    - label: "Playful and energetic"
      description: "Slightly exaggerated, delightful. Consumer, creative tools."
    - label: "Minimal and functional"
      description: "Almost invisible. Utility-focused, data-heavy."
```

Also determine:
- Is this a page load, a component, or a user flow?
- Performance budget constraints? (Mobile-first? Complex page?)
- Existing motion patterns in the codebase?

---

## Phase 2: Identify Animation Opportunities

Analyze the code and identify static areas:

### Missing Feedback
- Button clicks without visual acknowledgment
- Form submissions with no loading state
- Toggle switches that snap without transition
- Actions with no confirmation animation

### Jarring Transitions
- Elements appearing/disappearing instantly (show/hide)
- Page loads with no entrance choreography
- Modal/drawer opens without transition
- Tab switches with instant content swap

### Unclear Relationships
- Spatial hierarchy that isn't communicated
- Parent-child relationships without visual connection
- List items with no stagger to show order

### Opportunities for Delight
- Empty states that could benefit from subtle motion
- Success moments (form submit, task complete)
- First-time user moments
- Audio feedback for key moments (see `${ARC_ROOT}/references/audio-feedback.md` — optional, user must opt in)

---

## Phase 3: Plan Animation Strategy

Present a focused plan. **Less is more.**

```markdown
## Animation Plan

### Hero Moment (1 max)
- **What**: [e.g., Page load entrance sequence]
- **How**: [e.g., Staggered fade-up of sections, 50ms delay]
- **Duration**: [e.g., 300-500ms total]

### Feedback Layer (per-interaction)
| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Buttons | Press | `active:scale-[0.97]` | CSS instant |
| Cards | Hover | `hover:shadow-lg hover:-translate-y-0.5` | 150ms |
| Toggle | Click | Slide + color transition | 200ms |

### Transition Layer (state changes)
| State Change | Animation | Duration |
|-------------|-----------|----------|
| Modal open | Fade + scale(0.98→1) + y(20→0) | 200ms ease-out |
| Dropdown | Scale(0.95→1) + opacity | 150ms ease-out |
| Accordion | grid-rows 0fr→1fr | 300ms ease-out |

### Reduced Motion Alternatives
| Full Animation | Reduced Motion |
|---------------|---------------|
| Slide + fade | Fade only (200ms) |
| Scale + move | Opacity only |
| Staggered entrance | Simultaneous fade |
```

**Ask using the AskUserQuestion interaction pattern:**
```yaml
AskUserQuestion:
  question: "Does this animation plan feel right?"
  header: "Animation plan"
  options:
    - label: "Looks good"
      description: "Proceed with implementation"
    - label: "Adjust"
      description: "I have changes to suggest"
    - label: "Too much"
      description: "Scale it back — fewer animations"
    - label: "Too little"
      description: "Add more — I want more motion"
```

---

## Phase 4: Implement

### Timing & Easing Quick Reference

| Purpose | Duration | Easing |
|---------|----------|--------|
| Instant feedback (press, toggle) | 100-150ms | — (CSS transitions) |
| State changes (hover, menu) | 150-200ms | `ease-out` |
| Layout changes (modal, accordion) | 200-300ms | `cubic-bezier(0.25, 1, 0.5, 1)` |
| Entrance animations | 300-500ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exit = 75% of entrance | — | `ease-in` |

### CSS-Only (simple transitions)

```html
<!-- Button press feedback -->
<button class="transition-transform active:scale-[0.97]">

<!-- Card hover lift -->
<div class="transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5">

<!-- Dropdown -->
<div class="transition-all duration-150 ease-out origin-top
            data-[state=open]:scale-100 data-[state=open]:opacity-100
            data-[state=closed]:scale-95 data-[state=closed]:opacity-0">
```

### motion/react (JS-controlled animation)

```tsx
// Modal entrance
<motion.div
  initial={{ opacity: 0, y: 20, scale: 0.98 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: 10, scale: 0.98 }}
  transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
/>

// Staggered list
<motion.div variants={{ visible: { transition: { staggerChildren: 0.03 } } }}>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
    />
  ))}
</motion.div>

// Interactive spring
<motion.button whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
```

### Accordion (height animation without animating height)

```css
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms cubic-bezier(0.25, 1, 0.5, 1);
}
.accordion-content[data-state="open"] {
  grid-template-rows: 1fr;
}
.accordion-content > div {
  overflow: hidden;
}
```

### Reduced Motion (MANDATORY)

```tsx
const shouldReduce = useReducedMotion();

<motion.div
  animate={{
    opacity: 1,
    y: shouldReduce ? 0 : 20,
  }}
/>
```

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Phase 5: Verify

After implementing:

1. **Screenshot** desktop and mobile via Chrome MCP (if available)
2. **Test interactions** — do animations feel natural?
3. **Test reduced motion** — toggle in browser devtools
4. **Check performance** — no jank, 60fps on target devices
5. **Check timing** — not too fast (jarring) or too slow (laggy)

---

## NEVER

- Use bounce or elastic easing — they feel dated and amateurish
- Animate layout properties (`width`, `height`, `top`, `left`) — use `transform`
- Use durations over 500ms for UI feedback — feels laggy
- Animate without purpose — "delight" is not a purpose
- Ignore `prefers-reduced-motion` — accessibility violation
- Animate everything — animation fatigue is real
- Block interaction during animations unless intentional

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`

Entry: `/arc:animate — [Component/page] animated ([hero moment, # micro-interactions])`
</arc_log>

<success_criteria>
Animate is complete when:
- [ ] Motion tone established with user
- [ ] Static areas identified
- [ ] Animation plan focused (hero + feedback + transitions)
- [ ] Reduced motion alternatives planned for every animation
- [ ] Animations implemented with correct easing and duration
- [ ] Only transform and opacity animated (performance)
- [ ] Visually verified (feels natural, not jarring or laggy)
- [ ] prefers-reduced-motion tested
</success_criteria>
