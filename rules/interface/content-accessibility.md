# Interface: Content & Accessibility

## ARIA

- NEVER: Use `aria-hidden="true"` on focusable elements
- MUST: Label elements need text and an associated input
- MUST: All anchors must be valid and navigable
- MUST: Accurate names (`aria-label`), decorative elements `aria-hidden`, verify in the Accessibility Tree
- MUST: Icon-only buttons have descriptive `aria-label`
- MUST: Prefer native semantics (`button`, `a`, `label`, `table`) before ARIA
- NEVER: Add tooltips to disabled buttons (inaccessible to keyboard users)
- MUST: Tooltips shouldn't contain interactive content
- MUST: Always render images with `<img>` tags for screen readers (not CSS backgrounds)
- MUST: HTML illustrations need explicit `aria-label` (raw DOM is announced otherwise)

## Focus

- SHOULD: Use `box-shadow` for focus rings instead of `outline` (respects border-radius):

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--ring);
}
```

- MUST: Enable arrow-key navigation (↑↓) in sequential focusable lists
- SHOULD: Enable ⌘/Ctrl+Backspace deletion in sequential lists

## UX Copy & Writing Voice

Follow the [Chicago Manual of Style](https://www.chicagomanualofstyle.org/) for UX copy (labels, tooltips, empty states, error messages, marketing pages). For fiction-specific CMOS rules, see `~/Sites/fiction/skills/references/style-guides/chicago-manual.md`.

### Avoid LLM-Sounding Copy

AI-generated text has recognizable patterns that erode trust. Avoid these tells:

- NEVER: Em dashes (—) in UX copy. Use commas, periods, or parentheses instead. Em dashes are the most recognizable LLM tell
- NEVER: "Delve", "leverage", "streamline", "empower", "elevate", "robust", "seamless", "cutting-edge"
- NEVER: "In order to" (just use "to")
- NEVER: Filler hedges like "It's worth noting that", "Interestingly,", "It's important to note"
- NEVER: Starting with "So," or "Great question!"
- SHOULD: Prefer short, direct sentences. If it sounds like a press release, rewrite it
- SHOULD: Read copy aloud. If it sounds unnatural, it reads unnatural

## Content & Accessibility
- SHOULD: Inline help first; tooltips last resort
- MUST: Skeletons mirror final content to avoid layout shift
- MUST: `<title>` matches current context
- MUST: No dead ends; always offer next step/recovery
- MUST: Design empty/sparse/dense/error states
- SHOULD: Curly quotes (" "); avoid widows/orphans
- MUST: Tabular numbers for comparisons (`font-variant-numeric: tabular-nums` or a mono like Geist Mono)
- MUST: Redundant status cues (not color-only); icons have text labels
- MUST: Don't ship the schema—visuals may omit labels but accessible names still exist
- MUST: Use the ellipsis character `…` (not `...`)
- MUST: `scroll-margin-top` on headings for anchored links; include a "Skip to content" link; hierarchical `<h1–h6>`
- MUST: Resilient to user-generated content (short/avg/very long)
- MUST: Locale-aware dates/times/numbers/currency
- SHOULD: Right-clicking the nav logo surfaces brand assets
- MUST: Use non-breaking spaces to glue terms: `10\u00A0MB`, `⌘\u00A0+\u00A0K`, `Vercel\u00A0SDK`
