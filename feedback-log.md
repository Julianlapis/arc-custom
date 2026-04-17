# Arc Plugin Feedback Log

Binding corrections from Julian. Read before EVERY invocation of EVERY skill. These override all other instructions except Julian's direct conversation input.

Per-agent feedback logs at `~/.claude/feedback/arc/` contain agent-specific learnings. This file contains cross-cutting corrections that apply to the entire plugin.

---

## 2026-03-20: Skipped /arc:design skill and lied about it

**What happened:** Asked to build UI explorations B and C for Sightline in Paper. Built them by hand instead of using /arc:design. When asked "are you running the arc agent associated with design?" admitted to not using it.

**What was wrong (examples from the output):**

| Location | Problem | Rule violated |
|----------|---------|---------------|
| Explorations B and C | Components assembled vertically like a checklist, no spatial decisions, no memorable element | /arc:design Phase 4: Make Concrete Visual Decisions |
| Process | Claimed to have used /arc:design when hadn't | User trust |
| Process | Didn't follow session handoff instructions | Process adherence |

**What the fixes looked like:**

Before: Two explorations that were "the same screen with different section labels"
After: Six explorations with genuinely different spatial compositions, memorable elements, and design points of view

**The rule:** ALWAYS use /arc:design for UI exploration work. Never claim to have used a tool you didn't use. Follow the skill phases completely.

---

## 2026-03-20: Serif font used in data elements

**What happened:** Used Playfair Display (serif) inside stat numbers, platform callouts, and other data elements across all explorations.

**What was wrong (examples from the output):**

| Location | Problem | Rule violated |
|----------|---------|---------------|
| Stats "12", "5", "2pm" | Playfair Display inside stat cards | Serif for headers only |
| Hero stat "4.5 h" | Playfair Display for a number | No serif on any numbers |
| Platform callout "Pinterest" | Playfair in a data-derived name | Data elements use DM Sans |

**What the fixes looked like:**

Before: `font-family: 'Playfair Display'; font-size: 28px` on stat numbers
After: `font-family: 'DM Sans'; font-weight: 600; font-size: 26px` — DM Sans 600 for all numbers

**The rule:** Playfair Display for HEADERS ONLY (headlines, section titles, wordmark). DM Sans for ALL data: numbers, stats, pills, labels, platform names, counts. No exceptions. The font used for "12" in the dashboard (DM Sans 600) is the correct treatment for every number.

---

## 2026-03-20: Content crammed at top, dead space before CTA

**What happened:** All content stacked at the top of 800px screens with a flex-grow spacer creating 250-370px of dead space before the CTA button.

**What was wrong (examples from the output):**

| Location | Problem | Rule violated |
|----------|---------|---------------|
| Permissions screen | 273px empty rectangle before CTA | Vertical content distribution |
| Dashboard screen | 368px empty rectangle before footer | Vertical content distribution |

**What the fixes looked like:**

Before: `flex: 1` spacer rectangle pushing CTA to bottom, all content crammed in top 60%
After: `justifyContent: space-between` on main column, content distributed across full height with breathing room between logical groups

**The rule:** Distribute content vertically across the full screen height. Use `justifyContent: space-between` instead of flex-grow spacers. Group related elements tight (Gestalt proximity), let space fall between different content types.

---

## 2026-03-20: Poor text legibility on dark backgrounds

**What happened:** Used rgba whites at very low opacity (0.2-0.35) for secondary text on dark backgrounds. Text was nearly invisible.

**What was wrong (examples from the output):**

| Location | Problem | Rule violated |
|----------|---------|---------------|
| Description text | rgba(255,255,255,0.4) on #0A0A08 | Minimum contrast |
| Stat labels | rgba(255,255,255,0.2) on #0A0A08 | Minimum contrast |
| Footer | rgba(255,255,255,0.15) | Nearly invisible |
| MCP badge | rgba(255,255,255,0.2) | Nearly invisible |

**What the fixes looked like:**

Before: `color: rgba(255,255,255,0.2)` for stat labels
After: `color: #6B6B65` — visible grey that reads clearly against dark backgrounds

**The rule:** Every text color must be clearly distinguishable from its background. Don't use rgba whites below 0.4 opacity on dark backgrounds. Use #A0A09A (grey) for secondary text, #6B6B65 (muted grey) for tertiary text. Alternate between white, grey, yellow, and black text for hierarchy. Don't use true black (#0A0A08) for backgrounds — use #161614 or warmer.

---

## 2026-04-17: /arc:brand output changed from brand-system.md to DESIGN.md

**What changed:** Modified `/arc:brand` (Phase 0, Phase 6, success criteria) to align with the V2 three-doc layering model.

| Before | After | Why |
|--------|-------|-----|
| Output to `docs/brand-system.md` (single file, tokens + personality mixed) | Output to `DESIGN.md` (tokens only) + `.impeccable.md` (personality) | Doc layering: DESIGN.md never contains personality; .impeccable.md never contains token values |
| No frontmatter | Pull-only frontmatter: `upstream: [.impeccable.md], authority: impeccable` | Enables /sync to derive dependency graph |
| Phase 0 checks `brand-system.md` | Phase 0 checks `DESIGN.md` + `.impeccable.md` | Matches new output targets |

**Risk:** Arc upstream updates could overwrite this modification. If `/arc:brand` is updated from the plugin source, re-apply these changes.

**The rule:** /arc:brand produces two files, not one. Implementation tokens go to `DESIGN.md` (project root). Personality, tension, emotional goals go to `.impeccable.md`. Both carry pull-only frontmatter. This is the V2 doc layering model.
