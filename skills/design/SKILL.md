---
name: design
description: |
  Create distinctive, non-generic UI designs with aesthetic direction and concrete change specs.
  Use when asked to "design the UI", "redesign this", "improve the layout", or when building
  UI that should be memorable rather than generic. Outputs actionable change specs, not just direction.
license: MIT
metadata:
  author: howells
---

# Design Workflow

Create distinctive, non-generic UI. Outputs concrete change specs that get implemented, not just abstract direction.

<required_reading>
**Read these design references NOW:**

**Core philosophy:**
1. `${CLAUDE_PLUGIN_ROOT}/references/design-philosophy.md` — Timeless principles (Refactoring UI)
2. `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` — Fonts, anti-patterns, review checklist

**Patterns:**
3. `${CLAUDE_PLUGIN_ROOT}/references/ascii-ui-patterns.md` — ASCII wireframe conventions
4. `${CLAUDE_PLUGIN_ROOT}/references/animation-patterns.md` — Motion design (when animation involved)
5. `${CLAUDE_PLUGIN_ROOT}/references/component-design.md` — React component patterns

**If using Tailwind:**
6. `${CLAUDE_PLUGIN_ROOT}/references/tailwind-v4.md` — Tailwind v4 syntax
</required_reading>

<rules_context>
**Load interface rules based on what you're designing:**

**Always read first:**
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/index.md` — Overview and quick reference
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md` — Visual principles

**Then load as relevant:**
| Designing... | Load |
|--------------|------|
| Any UI | colors.md, spacing.md, typography.md |
| Page layouts | layout.md |
| Forms | forms.md, interactions.md |
| Interactive elements | interactions.md |
| Animations | animation.md, performance.md |
| Marketing pages | marketing.md |
| Accessible content | content-accessibility.md |

**These are comprehensive** — read them, use them, reference specific rules in your change spec.
</rules_context>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for related prior design work and aesthetic decisions already made.
</progress_context>

## Agents

**This skill works with these agents (reuse, don't duplicate):**

| Agent | Location | When to Use |
|-------|----------|-------------|
| `ui-builder` | agents/build/ | Build UI from the change spec you create |
| `figma-builder` | agents/build/ | Build UI when Figma URL is provided |
| `design-specifier` | agents/build/ | Quick design decisions during implement (empty states, dropdowns) |
| `designer` | agents/review/ | Review implemented UI for AI slop |

**Workflow:**
```
/arc:design (this skill)
     ↓ creates change spec
ui-builder or figma-builder (builds it)
     ↓ implements
designer (reviews for AI slop)
```

**For mid-implementation design needs** (not full redesign):
- Use `design-specifier` agent directly
- It outputs specs for `ui-builder` to implement
- Lighter weight than invoking the full design skill

## Prerequisites

- **Dev server running** — Verify changes visually as you work
- **Browser tool available** — For mandatory screenshots
- **Figma MCP (optional)** — If implementing from Figma designs, use the Figma MCP to extract specs (colors, typography, spacing, shadows). See: https://github.com/figma/figma-mcp

<browser_tools>
**Use ONE of these for screenshots (in order of preference):**

1. **Chrome MCP (claude-in-chrome):**
   ```
   mcp__claude-in-chrome__computer action=screenshot
   mcp__claude-in-chrome__resize_window width=375 height=812
   ```

2. **Vercel Browser (if available):**
   ```
   browser action=screenshot
   browser action=snapshot  # for DOM inspection
   ```

3. **Playwright (fallback):**
   ```bash
   npx playwright screenshot http://localhost:3000 screenshot.png
   ```

**Screenshots are NOT optional.** If you can't screenshot, STOP and tell the user.
</browser_tools>

## Process

### Step 1: Understand Scope

"What are we designing?"

| Scope | Approach |
|-------|----------|
| New from scratch | Full aesthetic direction → wireframe → change spec |
| Redesign existing | Capture before state → identify problems → change spec |
| Improve specific feature | Screenshot current → targeted change spec |

### Step 2: Capture Before State

**For redesigns/improvements — MANDATORY:**

1. **Screenshot current state:**
   ```
   mcp__claude-in-chrome__computer action=screenshot
   ```

2. **Note current values:**
   - Typography: what fonts, sizes, weights
   - Colors: what palette, what's dominant
   - Spacing: what scale, how dense
   - Layout: what structure, what's predictable

3. **Identify what's wrong:**
   - Generic/forgettable?
   - Inconsistent?
   - Wrong tone?
   - Missed opportunity?

**You cannot measure change without knowing the starting point.**

### Step 3: Gather Aesthetic Direction

Ask one at a time:

1. "What tone fits this UI?"
   - Minimal, bold, playful, editorial, luxury, brutalist, retro, organic
   - See `design-philosophy.md` personality table

2. "What should be memorable about this?"
   - The animation? Typography? Layout? A specific interaction?
   - There must be ONE thing that stands out

3. "Any existing brand/style to match, or fresh start?"

4. "Any reference designs or inspiration?"
   - Capture Figma links, screenshots, URLs immediately

### Step 4: Create Aesthetic Direction

```markdown
## Aesthetic Direction
- **Tone**: [specific choice from design-philosophy.md]
- **Memorable element**: [ONE thing that will stand out]
- **Typography**: [display font] + [body font] (from frontend-design.md font list)
- **Color strategy**: [dominant + accent, NOT purple gradients]
- **Motion**: [philosophy — subtle/bold/functional, see animation-patterns.md]
```

### Step 5: ASCII Wireframe (For New Designs)

Before any code, create ASCII wireframe. See `ascii-ui-patterns.md`.

```
┌─────────────────────────────────────────────────┐
│  [Header structure]                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Main content layout — show hierarchy]         │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐    │
│  │  [Component]     │  │  [Component]     │    │
│  └──────────────────┘  └──────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

Ask: "Does this layout feel right?"

### Step 6: Create Change Spec

**THIS IS THE CRITICAL STEP.**

Translate aesthetic direction into **specific, measurable changes**:

```markdown
## Change Spec

### Typography
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| h1 | 24px Inter regular | 48px Instrument Serif bold | typography.md: display hierarchy |
| body | 14px system-ui | 16px/1.6 DM Sans | typography.md: body readability |
| nav | 14px medium | 13px uppercase tracking-wide | typography.md: UI text |

### Colors
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| background | white #fff | warm off-white #faf9f7 | colors.md: warmth |
| primary | blue-500 | custom #1a1a1a | colors.md: intentional palette |
| accent | none | coral #ff6b4a | colors.md: accent strategy |

### Spacing
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| section padding | p-4 (16px) | p-12 (48px) | spacing.md: generous whitespace |
| card gap | gap-4 | gap-8 | spacing.md: breathing room |
| content max-width | max-w-7xl | max-w-4xl | layout.md: reading width |

### Layout
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| hero | centered text + 2 buttons | asymmetric split with image overlap | layout.md: break the grid |
| cards | uniform 3-col grid | varied sizes, masonry | layout.md: visual interest |

### Motion (if applicable)
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| page load | none | staggered fade-up, 50ms delay | animation.md: entrance sequence |
| hover | opacity change | subtle scale + shadow lift | animation.md: micro-interactions |
```

**Rules for change specs:**
- Every change references a rule from the interface rules
- Changes must be **substantial**, not tweaks
- If the "after" is similar to "before", it's not a redesign
- Specific values, not vague descriptions

### Step 7: Verify Change Spec is Substantial

Self-check before proceeding:

- [ ] At least 3 typography changes?
- [ ] Color palette actually different?
- [ ] Spacing significantly adjusted (not just +/- 4px)?
- [ ] Layout structure changed, not just spacing?
- [ ] Memorable element clearly identified and designed?

**If you're only changing padding values, STOP. That's not a redesign.**

Go back to Step 3 and be bolder.

### Step 8: Build or Hand Off

**Option A: Build now with agents**

If Figma URL available:
```
Task [figma-builder] model: opus: "Build from Figma: [URL]

Change spec attached for reference.
Verify spacing matches exactly."
```

If building from change spec:
```
Task [ui-builder] model: opus: "Build UI from change spec.

Aesthetic Direction: [paste]
Change Spec: [paste full table]

Verify each change spec row is implemented exactly."
```

**Option B: Create plan for /arc:implement**
```
Invoke /arc:implement with aesthetic direction and change spec.
Each change spec row becomes an implementation task.
implement will use ui-builder agent.
```

**Option C: Save design only**
```
Save to docs/designs/YYYY-MM-DD-<component>-design.md
Include: aesthetic direction, ASCII wireframe, full change spec
```

### Step 8b: Design Review (After Build)

Once built, spawn designer review agent:
```
Task [designer] model: opus: "Review implemented UI for AI slop.

Aesthetic direction: [paste]
Files: [list of component files]

Check for:
- Generic AI aesthetics
- Deviation from aesthetic direction
- Spacing/padding accuracy
- Missing memorable elements"
```

Address any issues before marking complete.

### Step 9: Visual Verification Loop (MANDATORY)

**Screenshot after EVERY significant change. Not optional.**

```
┌─────────────────────────────────────────────────────────┐
│  IMPLEMENT CHANGE                                       │
│       ↓                                                 │
│  SCREENSHOT                                             │
│       ↓                                                 │
│  VERIFY (matches spec? spacing correct?)                │
│       ↓                                                 │
│  ❌ Wrong? → FIX → SCREENSHOT → VERIFY (loop)          │
│  ✅ Correct? → NEXT CHANGE                              │
└─────────────────────────────────────────────────────────┘
```

**For each change in the spec:**

1. **Implement the change**

2. **Screenshot immediately:**
   ```
   mcp__claude-in-chrome__computer action=screenshot
   # or: browser action=screenshot
   ```

3. **Verify against spec:**
   - Does it match the "After" column exactly?
   - Is spacing/padding correct (measure visually)?
   - Any clipping, overflow, or alignment issues?

4. **If wrong → fix and re-screenshot** (do NOT proceed)

5. **Check responsive:**
   ```
   mcp__claude-in-chrome__resize_window width=375 height=812
   mcp__claude-in-chrome__computer action=screenshot
   ```

**Never move to the next change until the current one is verified.**

### Step 9b: Spacing & Padding Verification

**Spacing is the #1 thing that goes wrong. Check explicitly:**

```markdown
## Spacing Verification Checklist

### Padding (inside elements)
- [ ] Section padding matches spec (e.g., p-12 = 48px)
- [ ] Card/container padding consistent
- [ ] Button padding correct (vertical AND horizontal)
- [ ] Input field padding matches design

### Gaps (between elements)
- [ ] Grid/flex gap matches spec
- [ ] Vertical spacing between sections
- [ ] Spacing between heading and content
- [ ] List item spacing

### Margins (outside elements)
- [ ] Container margins/max-width correct
- [ ] Component margins not causing unexpected spacing
- [ ] No double-margins from adjacent elements

### Visual Rhythm
- [ ] Spacing feels consistent throughout
- [ ] Hierarchy clear through spacing (more important = more space)
- [ ] No cramped areas next to spacious areas
```

**How to verify spacing visually:**

1. **Screenshot at 100% zoom** — padding/margins should be obvious
2. **Use browser dev tools** — inspect computed values if unsure
3. **Compare to Figma** (if available) — overlay or side-by-side
4. **Eyeball the rhythm** — scan top to bottom, does spacing feel consistent?

**Common spacing mistakes to catch:**
- Using `p-4` when spec says `p-8` (half the intended size)
- Inconsistent padding inside similar components
- Gaps too tight between sections
- Button padding that makes text cramped
- Missing margin-bottom on headings

### Step 10: Verify Changes Were Made

**Post-implementation checklist:**

```markdown
## Change Verification

| Change Spec Item | Implemented? | Evidence |
|------------------|--------------|----------|
| h1: 48px Instrument Serif | ✅ | screenshot shows new typography |
| hero: asymmetric layout | ✅ | layout clearly different |
| section padding: p-12 | ✅ | generous whitespace visible |
| accent color: coral | ❌ | still using blue — FIX |
```

**If items are ❌, go back and implement them.**

The design isn't done until every change spec item is ✅.

<progress_append>
After completing the design work, append to progress journal:

```markdown
## YYYY-MM-DD HH:MM — /arc:design
**Task:** [UI/component designed]
**Outcome:** Complete
**Files:** [Design doc, change spec, or component files]
**Aesthetic Direction:**
- Tone: [choice]
- Memorable: [element]
**Change Spec:** [N] changes specified, [N] verified implemented
**Next:** /arc:implement or done

---
```
</progress_append>

<success_criteria>
Design is complete when:
- [ ] Before state captured (for redesigns)
- [ ] Aesthetic direction documented
- [ ] Change spec created with specific values
- [ ] Change spec references interface rules
- [ ] Changes are substantial, not tweaks
- [ ] All change spec items verified implemented
- [ ] Before/after comparison shows clear difference
- [ ] Progress journal updated
</success_criteria>
