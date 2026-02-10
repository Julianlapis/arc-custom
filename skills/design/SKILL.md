---
name: design
description: |
  Create distinctive, non-generic UI designs with aesthetic direction and ASCII wireframes.
  Use when asked to "design the UI", "create a layout", "wireframe this", or when building
  UI that should be memorable rather than generic. Avoids AI slop patterns.
license: MIT
metadata:
  author: howells
website:
  order: 8
  desc: Visual design direction
  summary: Establish the visual identity for your UI—colors, typography, spacing, tone. Comes with opinionated references to avoid generic AI aesthetics.
  what: |
    Design walks you through visual decisions: What's the tone? What makes this memorable? It can research real-world examples from Siteinspire (websites) and Mobbin (UI patterns) to inform your direction. From there it produces a design direction document—color palette, typography scale, spacing system, and ASCII wireframes for key screens. It draws from built-in references on font pairing, component patterns, and animation. As you build, it can screenshot via Chrome to verify implementation matches intent.
  why: |
    AI-generated UI tends toward the same safe choices—the same gradients, the same card layouts, the same hero sections. Design fights this by forcing you to make distinctive choices upfront and documenting them. The references help you avoid common pitfalls and give the AI better taste.
  decisions:
    - Opinionated references built in. Font choices, spacing scales, animation patterns—not starting from scratch.
    - ASCII wireframes over mockups. Version-controllable, forces focus on structure.
    - Visual verification via screenshots. Catches when implementation drifts from intent.
  workflow:
    position: branch
    joins: implement
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own multi-phase design process. Execute the phases below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

# Design Workflow

Create distinctive, non-generic UI. Avoids AI slop (purple gradients, cookie-cutter layouts).

**Announce at start:** "I'm using the design skill to create distinctive, non-generic UI."

<important>
**This skill is user-interactive. Do NOT spawn agents to do design work.**

- This skill walks through design decisions WITH the user — it's collaborative, not delegated
- There is no `arc:design:designer` agent — design creation happens through this skill
- `arc:review:designer` exists but is for REVIEWING implementations AFTER they're built, not for creating designs
- If asked to "design X", follow this skill's phases; don't try to spawn an agent
</important>

---

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

## Phase 0: Load References (MANDATORY)

**You MUST read these files before proceeding. Do not skip this step.**

<required_reading>
**Read ALL of these using the Read tool:**

1. `${CLAUDE_PLUGIN_ROOT}/references/frontend-design.md` — Fonts, anti-patterns, design review checklist. **Critical.**
2. `${CLAUDE_PLUGIN_ROOT}/references/design-philosophy.md` — Timeless principles from Refactoring UI
3. `${CLAUDE_PLUGIN_ROOT}/references/ascii-ui-patterns.md` — Wireframe syntax and patterns

**Then load interface rules:**
4. `${CLAUDE_PLUGIN_ROOT}/rules/interface/index.md` — Interface rules index

**And relevant domain rules based on what you're designing:**
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/design.md` — Visual principles
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/colors.md` — Color palettes
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/spacing.md` — Spacing system
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/typography.md` — Typography rules
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/layout.md` — Layout patterns, z-index
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/animation.md` — If motion is involved
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/forms.md` — If designing forms
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/interactions.md` — Touch, keyboard, hover patterns
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/marketing.md` — If designing marketing pages
- `${CLAUDE_PLUGIN_ROOT}/rules/interface/app-ui.md` — If designing app UI (dashboards, settings, data views)
</required_reading>

<progress_context>
**Use Read tool:** `docs/progress.md` (first 50 lines)

Check for related prior design work and aesthetic decisions.
</progress_context>

---

## Phase 1: Visual Reconnaissance

**Before designing anything, see what exists.**

### If Redesigning Existing UI:

**Use Chrome MCP to capture current state:**

```
1. mcp__claude-in-chrome__tabs_context_mcp (get available tabs)
2. mcp__claude-in-chrome__tabs_create_mcp (create new tab if needed)
3. mcp__claude-in-chrome__navigate to the local dev URL
4. mcp__claude-in-chrome__computer action=screenshot
```

**Analyze the screenshot against the Design Review Checklist from frontend-design.md:**
- Does it have any Red Flags (AI slop indicators)?
- What's the current aesthetic direction (if any)?
- What's working? What's not?

**Report findings to user:** "Here's what I see in the current UI: [observations]. The main issues are: [problems]."

### If Designing From Scratch:

- Confirm dev server is running (or will be)
- Ask if there's any existing brand/style guide to reference
- Check if there are reference designs or inspiration URLs to screenshot

---

## Phase 1.5: Design Mode

**Before gathering direction, establish what kind of UI you're designing.**

**Use AskUserQuestion:**
```
Question: "What are you designing?"
Header: "Design mode"
Options:
  1. "Marketing page" — Landing page, homepage, pricing, about, blog. Goal: persuade and convert.
  2. "App UI" — Dashboard, settings, forms, data views. Goal: enable and orient.
```

**After selection:**
- **Marketing** → Load `${CLAUDE_PLUGIN_ROOT}/rules/interface/marketing.md` as mandatory reference
- **App UI** → Load `${CLAUDE_PLUGIN_ROOT}/rules/interface/app-ui.md` as mandatory reference

This mode context informs all subsequent phases — questions, research sources, wireframe patterns, and checklist items adapt accordingly.

---

## Phase 2: Gather Direction

### Question 0: Exploration Mode (Conditional)

**Offer this option when circumstances allow:**
- New project with no established design system
- Homepage, landing page, or marketing site design
- User seems uncertain about direction
- Greenfield UI with creative freedom

**Do NOT offer when:**
- Strict brand guidelines exist
- Designing a small component or iteration
- User has already specified a clear direction
- Adding to an existing design system

**If circumstances allow, use AskUserQuestion:**
```
Question: "Would you like me to create 5 vastly different design directions, each at its own route? This lets you compare radically different approaches before committing."
Header: "Exploration"
Options:
  1. "Yes, explore 5 directions" — Create /design-1 through /design-5 with completely different aesthetics
  2. "No, single direction" (Recommended) — Focus on one well-crafted design
```

**If exploration mode is chosen:**
- Each route (/design-1, /design-2, etc.) gets a completely different aesthetic
- Vary: color palette, typography, layout structure, tone, spatial composition
- Don't just tweak—make them *unrecognizable* from each other
- After building all 5, ask user which direction resonates
- Then proceed with full design doc for the chosen direction

---

Ask the remaining questions **one at a time**:

### Question 1: Tone
"What tone fits this UI?"
- Minimal, bold, playful, editorial, luxury, brutalist, retro, organic, industrial, art deco, soft/pastel

### Question 1.5: Mode-Specific Question

**If Marketing mode:**
"How does the page tell its story?"
- Hero → problem → solution → proof → CTA (classic)
- Immersive scroll narrative (one idea per viewport)
- Feature showcase (dense, scannable)
- Minimal single-screen (everything above the fold)
- Editorial long-form (article-like)

**If App UI mode:**
"How information-dense should this be?"
- Sparse — generous whitespace, one focus per screen (e.g., onboarding)
- Balanced — comfortable density, clear hierarchy (e.g., settings)
- Dense — lots of data visible at once (e.g., dashboard, table views)

### Question 2: Memorable Element
"What should be memorable about this?"

**If Marketing:** The animation? Typography drama? Layout surprise? Photography style? Scroll behavior?

**If App UI:** The navigation paradigm? Micro-interactions? Information density approach? Empty state creativity? Data visualization style?

### Question 3: Existing Constraints
"Any existing brand/style to match, or fresh start?"

### Question 4: Inspiration
"Any reference designs or inspiration?"
- If provided, **screenshot them immediately using Chrome MCP** for visual reference

### Question 5: UI Chrome
"Should this have standard website chrome (header, footer, navigation), or feel more like an app?"

Consider:
- **Standard website chrome** — Fixed header with logo/nav, footer with links. Good for content sites, marketing pages, multi-page experiences where users need to navigate.
- **App-like experience** — Minimal or no persistent chrome. Content takes full focus. Good for tools, dashboards, immersive experiences, single-purpose flows.
- **Hybrid** — Minimal header (maybe just a logo), no footer. Common for SaaS apps.

**The default shouldn't always be "header + footer".** If the experience is focused (a tool, a game, a single flow), standard chrome can feel clunky and distract from the core experience. Let the purpose guide the frame.

---

## Phase 3: Research Inspiration (Optional)

**Use WebFetch to explore curated design examples based on the chosen direction.**

This phase is optional but recommended when:
- Starting from scratch with no existing references
- The user wants to see examples matching their chosen tone
- You need concrete visual patterns to inform decisions

### Siteinspire (Website/Homepage Design)

Siteinspire curates high-quality website designs. Use WebFetch to explore based on the chosen tone:

```
WebFetch URL patterns by tone:
- Minimal:    https://www.siteinspire.com/websites?style=minimal
- Bold:       https://www.siteinspire.com/websites?style=bold
- Playful:    https://www.siteinspire.com/websites?style=playful
- Editorial:  https://www.siteinspire.com/websites?style=editorial
- Luxury:     https://www.siteinspire.com/websites?style=luxury
- Brutalist:  https://www.siteinspire.com/websites?style=brutalist
- Retro:      https://www.siteinspire.com/websites?style=retro
- Organic:    https://www.siteinspire.com/websites?style=organic

By page type:
- Homepage:   https://www.siteinspire.com/websites?page=homepage
- Portfolio:  https://www.siteinspire.com/websites?page=portfolio
- E-commerce: https://www.siteinspire.com/websites?page=e-commerce
- Blog:       https://www.siteinspire.com/websites?page=blog
```

**WebFetch prompt:** "List the website names, their URLs, and a brief description of their visual style. Focus on typography choices, color palettes, and layout patterns."

### Mobbin (UI/Mobile Design Patterns)

Mobbin collects UI patterns from real apps. Use for component and interaction inspiration:

```
WebFetch URL patterns:
- iOS apps:     https://mobbin.com/browse/ios/apps
- Android:      https://mobbin.com/browse/android/apps
- Web apps:     https://mobbin.com/browse/web/apps

By screen type:
- Onboarding:   https://mobbin.com/browse/ios/screens?screen=onboarding
- Dashboard:    https://mobbin.com/browse/ios/screens?screen=dashboard
- Settings:     https://mobbin.com/browse/ios/screens?screen=settings
- Profile:      https://mobbin.com/browse/ios/screens?screen=profile
- Search:       https://mobbin.com/browse/ios/screens?screen=search
```

**WebFetch prompt:** "List the apps shown and describe their UI patterns—navigation style, card layouts, typography hierarchy, and interaction patterns."

### Research Workflow

1. **Based on user's chosen tone**, fetch 1-2 relevant Siteinspire pages
2. **Based on what you're designing** (homepage, dashboard, form), fetch relevant Mobbin screens
3. **Summarize findings** to user: "I found these patterns that match your direction: [observations]"
4. **Ask:** "Any of these resonate? Should I explore a specific site further with Chrome MCP?"

### Deep Dive with Chrome MCP

If a specific example catches interest, use Chrome MCP for detailed inspection:

```
1. mcp__claude-in-chrome__navigate to the specific site URL
2. mcp__claude-in-chrome__computer action=screenshot
3. Analyze: typography, colors, spacing, layout patterns
4. Report specific values observed (font names, hex colors, spacing)
```

**Note:** WebFetch provides quick overview; Chrome MCP provides detailed visual inspection. Use both strategically.

---

## Phase 4: Make Concrete Visual Decisions

**Capture SPECIFIC visual decisions, not conceptual themes.**

<principle>
**Complexity Matching:** Design complexity should align with aesthetic vision. Maximalist designs warrant elaborate code and rich details. Minimalist designs require restraint and precision—every element must earn its place. Don't add flourishes to a minimal design; don't under-build a maximalist one.
</principle>

Apply knowledge from the loaded references to make these decisions:

### Typography Selection
Using the font recommendations from `frontend-design.md`:
- **Display font:** [specific font name]
- **Body font:** [specific font name]
- **Mono font (if needed):** [specific font name]

**Never use:** Roboto, Arial, system-ui defaults, Instrument Serif (AI slop)

### Color Palette
- **Background:** [specific hex, e.g., #0a0a0a]
- **Surface/card:** [specific hex]
- **Text primary:** [specific hex]
- **Text secondary:** [specific hex]
- **Accent:** [specific hex]
- **Accent hover:** [specific hex]

**Never use:** Purple-to-blue gradients (AI cliché)

### Spacing System
Define the scale being used:
- **Base unit:** 4px or 8px
- **Common values:** 4, 8, 12, 16, 24, 32, 48, 64
- **Component padding:** [e.g., 16px default, 24px for cards]
- **Section spacing:** [e.g., 64px between major sections]

### Spatial Composition
Beyond basic layout, make deliberate choices about:
- **Asymmetry:** Not everything needs to be centered or perfectly balanced
- **Overlap:** Elements can break grid boundaries, bleed off edges, layer on top of each other
- **Unexpected layouts:** Break the "header → hero → 3-column features → footer" pattern
- **Negative space:** Generous whitespace creates breathing room and draws focus to what matters

**Ask:** "Where can the layout do something unexpected?"

### Motion Philosophy
- **Where animation is used:** [specific locations]
- **Animation style:** [e.g., ease-out for enters, springs for interactive]
- **Duration range:** [e.g., 150-300ms]

---

## Phase 5: ASCII Wireframe

**Create ASCII wireframes before any code.** Use patterns from `ascii-ui-patterns.md`.

```
┌─────────────────────────────────────┐
│  Logo        [Search...]    [Menu]  │
├─────────────────────────────────────┤
│                                     │
│  [Main Content Area]                │
│                                     │
└─────────────────────────────────────┘
```

**Include:**
1. Primary layout structure
2. Key interactive elements
3. Mobile version if responsive
4. States: empty, loading, error (where relevant)

**If App UI mode:** You MUST include at least one state variant beyond the populated state (empty, loading, or error). App UI without state design is incomplete.

**Ask:** "Does this layout feel right before I continue?"

---

## Phase 5.5: Create Change Spec

**THIS IS CRITICAL.** Translate aesthetic direction into **specific, measurable changes**:

```markdown
## Change Spec

### Typography
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| h1 | 24px Inter regular | 48px Instrument Serif bold | typography.md: display hierarchy |
| body | 14px system-ui | 16px/1.6 DM Sans | typography.md: body readability |

### Colors
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| background | white #fff | warm off-white #faf9f7 | colors.md: warmth |
| accent | none | coral #ff6b4a | colors.md: accent strategy |

### Spacing
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| section padding | p-4 (16px) | p-12 (48px) | spacing.md: generous whitespace |

### Layout
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| hero | centered text | asymmetric split with image overlap | layout.md: break the grid |

### Motion (if applicable)
| Element | Before | After | Rule Reference |
|---------|--------|-------|----------------|
| page load | none | staggered fade-up, 50ms delay | animation.md: entrance sequence |
```

**Rules for change specs:**
- Every change references a rule from the interface rules
- Changes must be **substantial**, not tweaks
- Specific values, not vague descriptions

**Self-check:**
- [ ] At least 3 typography changes?
- [ ] Color palette actually different?
- [ ] Spacing significantly adjusted?
- [ ] Memorable element clearly identified and designed?

**If you're only changing padding values, STOP. That's not a redesign.**

---

## Phase 6: Produce Design Document

**Create the design direction document at `docs/plans/design-[component-name].md`:**

```markdown
# Design Direction: [Component/Page Name]

## Aesthetic Direction
- **Tone:** [chosen - e.g., "minimal", "bold", "editorial"]
- **Memorable element:** [specific - e.g., "oversized typography", "micro-interactions on hover"]

## Typography
- **Display:** [font name] — [where used]
- **Body:** [font name] — [where used]
- **Mono:** [font name] — [where used, if applicable]

## Color Palette
| Role | Value | Usage |
|------|-------|-------|
| Background | #0a0a0a | Page background |
| Surface | #1a1a1a | Cards, panels |
| Text primary | #fafafa | Headings, body |
| Text secondary | #a1a1a1 | Labels, hints |
| Accent | #f59e0b | CTAs, links |
| Accent hover | #fbbf24 | Hover states |

## Spacing
- Base unit: 8px
- Component padding: 16px (small), 24px (medium), 32px (large)
- Section gaps: 48px (tight), 64px (normal), 96px (generous)

## Motion
- Page transitions: fade, 200ms ease-out
- Interactive elements: spring (stiffness: 400, damping: 25)
- Hover states: 150ms ease-out

## Layout

### Desktop
[ASCII wireframe]

### Mobile
[ASCII wireframe]

## Implementation Notes
- [Any specific technical considerations]
- [Component library preferences]
- [Animation library: CSS-only vs motion/react]

## Anti-Patterns to Avoid
- [Specific things NOT to do for this design]
```

---

## Phase 7: Verify Against Checklist

**Run the Design Review Checklist from frontend-design.md:**

### Red Flags (must be zero)
- [ ] Uses default system fonts
- [ ] Purple-to-blue gradient present
- [ ] White background + gray cards throughout
- [ ] Could be mistaken for generic AI output

### Green Flags (should have most)
- [ ] Clear aesthetic direction documented
- [ ] Typography is deliberate
- [ ] At least one memorable element
- [ ] Layout has unexpected decisions

### If Marketing Mode, also check:
- [ ] **Red Flag:** Cookie-cutter hero → features → testimonials → CTA layout
- [ ] **Red Flag:** No clear narrative structure
- [ ] **Green Flag:** Section rhythm creates breathing room
- [ ] **Green Flag:** Would pass the "screenshot test" — distinctive in a grid of competitors

### If App UI Mode, also check:
- [ ] **Red Flag:** No empty state designed
- [ ] **Red Flag:** Generic admin template feel
- [ ] **Red Flag:** Fails the swap test — choices are defaults, not decisions (see app-ui.md)
- [ ] **Green Flag:** Could use this for 8 hours without visual fatigue
- [ ] **Green Flag:** All critical states designed (empty, loaded, error)

**If any Red Flags are present, revise before proceeding.**

---

## Phase 8: Hand Off

**Use AskUserQuestion tool:**
```
Question: "Design documented. What's next?"
Header: "Next step"
Options:
  1. "Create detailed plan" (Recommended) — Run /arc:detail for task breakdown
  2. "Save and stop" — Return to this later
```

**IMPORTANT: Do NOT automatically invoke other skills.**

- **If option 1:** Tell user: "Design saved. Run `/arc:detail` to create implementation tasks."
- **If option 2:** Tell user: "Design saved to `docs/plans/design-[name].md`. Return anytime."

---

## During Implementation (Reference for /arc:implement)

When implementing this design (via /arc:implement), use Chrome MCP continuously:

### After Every Significant Change
```
mcp__claude-in-chrome__computer action=screenshot
```

### Check Responsive Behavior
```
mcp__claude-in-chrome__resize_window width=375 height=812  # Mobile
mcp__claude-in-chrome__computer action=screenshot
mcp__claude-in-chrome__resize_window width=1440 height=900 # Desktop
mcp__claude-in-chrome__computer action=screenshot
```

### Verify Against Design Doc
- Does the typography match what was specified?
- Are the colors exactly as documented?
- Does spacing feel consistent with the system?
- Is the memorable element actually memorable?

**Never commit UI code without visually verifying it looks correct.**

---

## Anti-Patterns (Quick Reference)

From `frontend-design.md`:

**🚫 Never use sparkles/stars to denote AI features.** Overused, meaningless, dated.

**🚫 Never propose conceptual themes with metaphors.** No "Direction: Darkroom / Metaphor: Photo emerging from developer bath". Instead: "Dark background (#0a0a0a) with warm red accents (#dc2626)."

**🚫 Never use these:**
- Roboto/Arial/system-ui defaults
- Purple-to-blue gradients
- White backgrounds with gray cards
- Rounded corners on everything
- Mixed icon styles

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `${CLAUDE_PLUGIN_ROOT}/references/arc-log.md`

Entry: `/arc:design — [Component/page] design ([aesthetic direction])`
</arc_log>

<success_criteria>
Design is complete when:
- [ ] Design mode identified (marketing or app UI)
- [ ] All mandatory references were loaded and applied (including mode-specific reference)
- [ ] Current UI was screenshotted (if redesigning)
- [ ] Aesthetic direction established with SPECIFIC values
- [ ] Typography selected from recommended fonts
- [ ] Color palette defined with hex values
- [ ] Spacing system documented
- [ ] ASCII wireframes created and approved
- [ ] Design document saved to docs/plans/
- [ ] Red flag checklist passed (zero red flags)
- [ ] Progress journal updated
</success_criteria>

## Interop

- Produces design doc consumed by **/arc:implement**
- Can invoke **web-design-guidelines** skill for compliance review (if available)
- Can invoke **vercel-composition-patterns** skill for component architecture review (if available)
- Uses **Chrome MCP** (`mcp__claude-in-chrome__*`) for visual capture throughout
- Uses **WebFetch** to research design inspiration from Siteinspire and Mobbin
- References feed into implementation to maintain design fidelity
