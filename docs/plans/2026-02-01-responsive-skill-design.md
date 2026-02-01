# /arc:responsive Skill Design

## Problem Statement

After building a desktop-first UI, making it responsive across mobile is a manual, tedious process. It's easy to miss pages, break desktop while fixing mobile, or apply inconsistent responsive patterns. This skill systematically audits and fixes every page, using browser screenshots to verify each change while preserving the desktop design intent.

## Approach

A standalone post-build skill (`/arc:responsive`) that auto-discovers routes, then works through each page with a tight screenshot-fix-verify loop at two breakpoints (mobile + desktop). The skill is design-aware: it reads any existing design doc to preserve aesthetic intent, memorable elements, and the spacing/typography system — not just "make it fit."

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Standalone skill, not sub-skill of design | Different workflow — systematic audit vs creative direction |
| Two breakpoints: 375px (mobile), 1440px (desktop) | Catches 95% of issues at the extremes. Tablet deferred to v2 |
| Fix-as-you-go, not audit-first | Tight feedback loop: screenshot → fix → verify → next page |
| Always verify desktop after mobile fixes | Prevents regressions from responsive changes |
| Chrome MCP only (no agent-browser fallback) | Single code path, already the Arc standard |
| Design-aware: reads design doc first | Preserves aesthetic intent, memorable elements, typography hierarchy |
| Container queries for components, viewport for layout | Components adapt to container (reusable); page layout adapts to viewport |
| Core principles, not fix pattern table | References existing `rules/interface/` files. Let the AI reason from screenshots |
| User handles auth | Skill assumes browser session is authenticated |
| Auto-discover routes from `app/` | Scan for `page.tsx`, exclude `api/` routes, ask user about dynamic routes |

## Workflow

### Phase 1: Setup & Discovery

1. Check prerequisites: dev server running, Chrome MCP available
2. Read design doc if exists (`docs/plans/design-*.md`) — note aesthetic direction, memorable element, spacing system, typography
3. Read interface rules: `rules/interface/layout.md`, `interactions.md`, `spacing.md`
4. Scan `app/` for `page.tsx` files, build route list
5. Exclude `app/api/**` routes
6. Present route list to user (via AskUserQuestion) — confirm which to audit, provide slugs for dynamic routes
7. If auth pages exist, ask user to log in via Chrome first

### Phase 2: Page-by-page audit & fix

For each page:
1. Navigate to page, resize to 375x812 (mobile)
2. Screenshot and analyze against:
   - Layout: overflow, stacking, spacing
   - Usability: touch targets (44px), text readability (16px min body), viewport meta
   - Design: does this still feel like the same design? Is the aesthetic direction preserved?
3. Fix issues in code — prefer container queries for component-level fixes, viewport queries for page layout
4. Re-screenshot at 375px to verify fix
5. Resize to 1440x900 (desktop) and screenshot — confirm no regressions
6. If desktop broke, fix and re-verify both breakpoints
7. For longer pages, scroll and take additional screenshots below the fold
8. Move to next page

### Phase 3: Summary & commit

1. List all changes made, grouped by page/component
2. Batch commit of all responsive fixes
3. Optional: write `docs/plans/responsive-audit.md` documenting issues found and fixes applied

## Core Responsive Principles

The skill applies existing `rules/interface/` guidance rather than maintaining its own patterns:

1. **Container queries for reusable components** — Cards, sidebars, content blocks adapt to their container, not the viewport. Makes components naturally work in different layout contexts.
2. **Viewport queries for page layout** — Grid column counts, section stacking, navigation collapse are tied to screen size.
3. **Preserve the design system** — Use documented spacing values (4px base unit, Tailwind scale). Don't invent new spacing. Scale typography intentionally using the hierarchy, don't just shrink. Keep the color palette and memorable element intact.
4. **Touch targets: 44x44px minimum** — Expand hit areas with absolute positioning if needed.
5. **`h-dvh` not `h-screen`** — Respects mobile browser chrome.
6. **`text-base` minimum on mobile inputs** — Prevents iOS auto-zoom.
7. **Gate hover styles** — Use `@media(hover:hover)` so hover effects don't fire on touch.

## What the Skill Does NOT Do

- Visual redesign — only adapts the existing design to work at mobile
- Performance optimization — covered by `/arc:audit`
- SEO — covered by `/arc:seo`
- Accessibility beyond touch targets — covered by `/arc:audit`
- Change colors, typography choices, or spacing systems — only layout/sizing

## Integration

- Invoked after `/arc:build` or `/arc:implement`
- Reads design docs from `/arc:design` for aesthetic context
- References `rules/interface/` for implementation patterns
- Uses Chrome MCP for all browser interaction
- Follows `/arc:commit` discipline for commits

## Open Questions

- Should the skill run the designer reviewer (`arc:review:designer`) after completing all fixes as a final quality check?
- Should it produce before/after screenshots for documentation?
