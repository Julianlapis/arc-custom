# Interface: Layout

## Principles

- MUST: Deliberate alignment (grid/baseline/edges/optical centers)
- MUST: Verify mobile, laptop, ultra-wide (simulate at 50% zoom)
- MUST: Respect safe areas via `env(safe-area-inset-*)`
- MUST: No unwanted scrollbars — fix overflows
- SHOULD: Optical alignment: ±1px when perception beats geometry
- SHOULD: Balance icon/text lockups (stroke, weight, size, spacing, color)

## Viewport

- MUST: `h-dvh` not `h-screen` (respects mobile browser chrome)
- MUST: Fixed elements respect `safe-area-inset-*`

## Z-Index

MUST use fixed scale — no arbitrary values like `z-[999]`:

| Layer | Tailwind | CSS Variable |
|-------|----------|--------------|
| Base | `z-0` | — |
| Dropdown | `z-10` | `--z-dropdown: 100` |
| Sticky | `z-20` | — |
| Modal | `z-30` | `--z-modal: 200` |
| Toast | `z-40` | `--z-toast: 400` |
| Tooltip | `z-50` | `--z-tooltip: 300` |

### Avoiding Z-Index

- SHOULD: Use `isolate` (Tailwind) to create stacking context without z-index:

```jsx
<div className="isolate">
  {/* New stacking context, no global z-index conflict */}
</div>
```

## Text-Aware Layouts (Pretext)

For layouts where text content determines geometry — masonry grids, chat bubbles, text-around-obstacles, editorial columns — use `@chenglou/pretext` instead of DOM measurement or height estimates.

- SHOULD: Use `prepare()` + `layout()` for masonry card heights based on actual text content
- SHOULD: Use `walkLineRanges()` for shrinkwrap containers (chat bubbles, labels, tooltips)
- SHOULD: Use `layoutNextLine()` for text flowing around images or obstacles with variable-width lines
- SHOULD: Prefer Pretext over `offsetHeight` / `getBoundingClientRect` for text layout calculations — it avoids reflow entirely

```ts
// Masonry: know card heights before placement
import { prepare, layout } from '@chenglou/pretext'
const prepared = prepare(cardText, '14px Inter')
const { height } = layout(prepared, cardWidth, 20)

// Chat bubble shrinkwrap: tightest width that fits
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'
const prepared = prepareWithSegments(message, '14px Inter')
let maxW = 0
walkLineRanges(prepared, maxBubbleWidth, line => { if (line.width > maxW) maxW = line.width })
```

See `references/pretext.md` for full API and integration patterns.
