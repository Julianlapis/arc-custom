# Design: Separate Marketing Pages from App UI in /arc:design

## Problem

`/arc:design` treats all UI design as the same discipline. Marketing pages and app UI have fundamentally different goals, constraints, and success criteria. The current skill asks the same questions and follows the same flow regardless, which leads to:

- Marketing pages that feel too functional (dashboard energy)
- App UI that feels too theatrical (landing page energy)
- Checklists checking for wrong things

## Approach: Minimal Branch + App UI Reference

Add a **design mode** question after Phase 1 (visual reconnaissance) and before Phase 2 (gather direction). This provides context that the existing phases adapt to organically. No separate checklists. No heavy branching. One new reference file for app UI (informed by the [interface-design skill](https://skills.sh/dammyjay93/interface-design/interface-design)).

**Reviewed by:** simplicity-engineer, architecture-engineer, designer

### What Changes

```
Phase 0: Load References          → Add app-ui.md to conditional list
Phase 1: Visual Reconnaissance    → UNCHANGED
Phase 1.5: Design Mode (NEW)      → One branching question (marketing vs app UI)
Phase 2: Gather Direction          → Add 1 mode-specific question per mode + adapt memorable element
Phase 3: Research Inspiration      → UNCHANGED (context adapts naturally)
Phase 4: Visual Decisions          → UNCHANGED (context adapts naturally)
Phase 5: ASCII Wireframe           → Add conditional: "If app UI, show at least one state variant"
Phase 6: Design Document           → UNCHANGED
Phase 7: Verification Checklist    → Add 2-3 conditional items to existing checklist
Phase 8: Hand Off                  → UNCHANGED
```

---

## Phase 1.5: Design Mode (NEW)

Insert after Phase 1, before Phase 2. Uses AskUserQuestion:

```
Question: "What are you designing?"
Header: "Design mode"
Options:
  1. "Marketing page" — Landing page, homepage, pricing, about, blog. Goal: persuade and convert.
  2. "App UI" — Dashboard, settings, forms, data views. Goal: enable and orient.
```

Two options only. Users designing docs/blogs pick whichever is closer. Users who need both run the skill twice.

### After selection:

- **Marketing** → Load `rules/interface/marketing.md` as mandatory reference (already exists)
- **App UI** → Load `rules/interface/app-ui.md` as mandatory reference (new file, see below)

---

## Phase 2 Changes: One Additional Question Per Mode

The existing questions (tone, memorable element, constraints, inspiration, UI chrome) remain. Add one mode-specific question:

### Marketing Mode Addition

**Narrative structure** (NEW): "How does the page tell its story?"
- Hero → problem → solution → proof → CTA (classic)
- Immersive scroll narrative (one idea per viewport)
- Feature showcase (dense, scannable)
- Minimal single-screen (everything above the fold)
- Editorial long-form (article-like)

### App UI Mode Addition

**Density** (NEW): "How information-dense should this be?"
- Sparse — generous whitespace, one focus per screen (e.g., onboarding)
- Balanced — comfortable density, clear hierarchy (e.g., settings)
- Dense — lots of data visible at once (e.g., dashboard, table views)

### Memorable Element Adaptation

The existing "memorable element" question stays in BOTH modes, but options adapt:

**Marketing:** "What should be memorable?"
- Animation, typography drama, layout surprise, photography style, scroll behavior

**App UI:** "What should be memorable?"
- Navigation paradigm, micro-interactions, information density approach, empty state creativity, data visualization style

---

## Phase 5 Change: One Wireframe Conditional

Add to existing wireframe phase:

> **If app UI:** Include at least one state variant beyond the populated state (empty, loading, or error).

No other wireframe changes needed. The mode context is enough to guide appropriate patterns.

---

## Phase 7 Changes: Conditional Checklist Items

Add to the existing checklist (not separate checklists):

### If Marketing Mode, add:
- **Red Flag:** Cookie-cutter hero → features → testimonials → CTA layout
- **Red Flag:** No clear narrative structure
- **Green Flag:** Section rhythm creates breathing room
- **Green Flag:** Would pass the "screenshot test" — distinctive in a grid of competitors

### If App UI Mode, add:
- **Red Flag:** No empty state designed
- **Red Flag:** Generic admin template feel
- **Red Flag:** Fails the swap test — choices are defaults, not decisions
- **Green Flag:** Could use this for 8 hours without visual fatigue
- **Green Flag:** All critical states designed (empty, loaded, error)

---

## New Reference File: `rules/interface/app-ui.md`

Create a new rules file parallel to `marketing.md`. Incorporates the strongest ideas from the [interface-design skill](https://skills.sh/dammyjay93/interface-design/interface-design) plus our own rules.

### Key concepts to include:

**Intent First** (from interface-design skill):
Before any visual decisions, answer explicitly:
- Who is this human? (specific context, not generic "users")
- What must they accomplish? (specific verb-based action)
- What should this feel like? (concrete descriptors)

**Product Domain Exploration** (from interface-design skill):
- 5+ concepts/metaphors from the product's actual world
- Colors naturally existing in the product's physical space
- One signature element unique to THIS product
- 3 obvious defaults for this interface type — to avoid them

**The Swap Test** (from interface-design skill):
If substituting alternatives wouldn't change the design's meaning, the choice defaulted. "If your answer is 'it's common' or 'it's clean' — you haven't chosen."

**Depth Strategy** (from interface-design skill):
Pick ONE and commit: borders-only (technical), subtle shadows (approachable), or layered shadows (premium). Don't mix.

**Subtle Layering:**
Surfaces barely different but distinguishable. Study Vercel, Supabase, Linear for whisper-quiet hierarchy.

**Navigation as Product:**
Navigation teaches users how to think about the product space. It IS the product, not around it.

**Token Naming:**
CSS variable names are design decisions. `--ink` evokes a world; `--gray-700` evokes a template.

Plus our existing rules on: density, states, data display, interactive patterns, app typography, app color.

---

## Changes to SKILL.md

Four surgical modifications:

1. **Phase 0**: Add `app-ui.md` to the conditional reference list
2. **New Phase 1.5**: Insert branching question between Phase 1 and Phase 2
3. **Phase 2**: Add one conditional question per mode + adapt memorable element options
4. **Phase 5**: Add one wireframe conditional for app UI
5. **Phase 7**: Add conditional checklist items to existing checklist

### What DOESN'T Change

- Phase 0 structure (mandatory references)
- Phase 1 (reconnaissance)
- Phase 3 (research — adapts from context)
- Phase 4 (visual decisions — adapts from context)
- Phase 6 (design document)
- Phase 8 (hand off)
- Exploration mode
- Anti-patterns section
- Implementation reference section

---

## Implementation Order

1. Create `rules/interface/app-ui.md` — new reference file with best ideas from interface-design skill
2. Update `skills/design/SKILL.md` — add Phase 1.5, conditional questions, wireframe note, checklist items
3. Update `rules/interface/index.md` — add app-ui.md to the index
4. Test by running `/arc:design` and selecting each mode

---

## What Was Deferred (Add Only If Needed)

These were in the original plan but cut during review for YAGNI:

- "Both / Shared System" third option
- Mode-specific research sources
- Mode-specific wireframe requirements
- Separate checklists per mode
- Mode-specific visual decision additions (hero scale, status colors, etc.)

**Trigger to revisit:** If after 5+ real uses, the minimal context isn't producing good enough differentiation between marketing and app UI outputs.
