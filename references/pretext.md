# Pretext — DOM-Free Text Measurement & Layout

`@chenglou/pretext` is a pure JavaScript/TypeScript library for multiline text measurement and layout. It eliminates the need for DOM measurements (`getBoundingClientRect`, `offsetHeight`) — one of the most expensive operations in the browser — by implementing its own text measurement logic using the browser's font engine as ground truth.

**Install:** `npm install @chenglou/pretext`

---

## Why This Matters

DOM text measurement triggers layout reflow. Every call to `offsetHeight` or `getBoundingClientRect` on text forces the browser to recalculate layout. Pretext sidesteps this entirely with pure arithmetic after a one-time `prepare()` call.

This unlocks:
- **Virtualization without guesstimates** — know exact row heights before rendering
- **Masonry and custom layouts** — text-aware JS-driven layout without CSS hacks
- **Shrinkwrap text containers** — calculate the tightest width that fits text (chat bubbles, labels)
- **Text overflow detection at build/dev time** — verify labels don't overflow buttons without a browser
- **Zero layout shift** — know text height before render, anchor scroll position on new content
- **Variable-width text flow** — route text around images, floats, obstacles line by line

---

## API Quick Reference

### Use Case 1: Measure Height (Hot Path)

```ts
import { prepare, layout } from '@chenglou/pretext'

// One-time: analyze text + measure segments (canvas-based, ~19ms for 500 texts)
const prepared = prepare('Your text here', '16px Inter')

// Hot path: pure arithmetic, no DOM (~0.09ms for 500 texts)
const { height, lineCount } = layout(prepared, containerWidth, lineHeight)
```

**Key rules:**
- `prepare()` once per text+font combo. Cache the result.
- `layout()` on every resize — it's cheap (pure math).
- `font` string must match your CSS font shorthand exactly (e.g. `'bold 16px Inter'`).
- `lineHeight` must match your CSS `line-height` in pixels.
- Do NOT use `system-ui` — canvas and DOM can resolve different fonts on macOS.

### Use Case 2: Manual Line Layout (Rich Path)

```ts
import { prepareWithSegments, layoutWithLines, walkLineRanges, layoutNextLine } from '@chenglou/pretext'

const prepared = prepareWithSegments('Your text here', '18px "Helvetica Neue"')

// Get all lines at fixed width
const { lines } = layoutWithLines(prepared, 320, 26)

// Walk line widths without building strings (fast for shrinkwrap/binary search)
let maxW = 0
walkLineRanges(prepared, 320, line => { if (line.width > maxW) maxW = line.width })

// Variable-width layout (text around obstacles)
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0
while (true) {
  const width = y < image.bottom ? columnWidth - image.width : columnWidth
  const line = layoutNextLine(prepared, cursor, width)
  if (line === null) break
  ctx.fillText(line.text, 0, y)
  cursor = line.end
  y += 26
}
```

### Pre-wrap Mode (Textarea/Editor)

```ts
const prepared = prepare(textareaValue, '16px Inter', { whiteSpace: 'pre-wrap' })
const { height } = layout(prepared, textareaWidth, lineHeight)
```

Preserves spaces, tabs, and hard breaks — for textarea-like text input.

### Helpers

```ts
clearCache()           // Release accumulated font/segment caches
setLocale(locale?)     // Set locale for future prepare() calls (clears cache)
```

---

## When to Use Pretext

| Scenario | API | Why |
|----------|-----|-----|
| Virtualized list with variable-height text rows | `prepare` + `layout` | Know exact row heights without rendering |
| Chat bubble / message shrinkwrap | `walkLineRanges` | Find tightest container width for text |
| Auto-sizing textarea | `prepare` + `layout` (pre-wrap) | Height without DOM measurement |
| Masonry layout with text cards | `prepare` + `layout` | Calculate card heights before placement |
| Text around floated image | `layoutNextLine` | Route each line with different available width |
| Dev-time overflow check | `prepare` + `layout` | Verify button labels fit without browser |
| Scroll anchoring on new content | `prepare` + `layout` | Know height of incoming text to adjust scroll |
| Editorial multi-column flow | `layoutNextLine` | Flow text across columns with obstacles |
| Balanced text / optimal line breaks | `walkLineRanges` | Binary search for "nice" width values |

---

## When NOT to Use Pretext

- Static text that CSS handles fine (`text-balance`, `text-pretty`, `truncate`)
- Text that doesn't need height prediction (simple headings, labels with fixed containers)
- **Server-side rendering / Server Components** — `prepare()` requires canvas and will throw in Node.js. Do not call it in Next.js Server Components, `getServerSideProps`, or any server context. Server support is planned but not shipped.
- Text with CSS that Pretext can't model: `white-space: nowrap`, `word-break: break-all`, `letter-spacing` offsets, CSS multi-column layout, or mixed inline content (text + icons in flow). For these, DOM measurement is still valid — batch your reads.

---

## Integration Patterns

### With React (Virtualization)

```tsx
import { prepare, layout, type PreparedText } from '@chenglou/pretext'
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualizedMessages({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(400)

  // Cache prepare() results by message ID — don't re-prepare existing messages
  const cacheRef = useRef<Map<string, PreparedText>>(new Map())
  const prepared = useMemo(() => {
    for (const m of messages) {
      if (!cacheRef.current.has(m.id)) {
        cacheRef.current.set(m.id, prepare(m.text, '14px Inter'))
      }
    }
    return cacheRef.current
  }, [messages])

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    // Exact height — no guessing
    estimateSize: (i) => layout(prepared.get(messages[i].id)!, containerWidth, 20).height + padding,
  })

  return <div ref={parentRef}>{/* virtual rows */}</div>
}
```

### With React (Chat Bubble Shrinkwrap)

```tsx
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

function useBubbleWidth(text: string, maxWidth: number) {
  return useMemo(() => {
    const prepared = prepareWithSegments(text, '14px Inter')
    let widest = 0
    walkLineRanges(prepared, maxWidth, line => {
      if (line.width > widest) widest = line.width
    })
    return Math.ceil(widest) + padding
  }, [text, maxWidth])
}
```

### With Auto-Sizing Textarea

```tsx
import { prepare, layout } from '@chenglou/pretext'

function useAutoHeight(value: string, width: number, font: string, lineHeight: number) {
  return useMemo(() => {
    const prepared = prepare(value, font, { whiteSpace: 'pre-wrap' })
    return layout(prepared, width, lineHeight).height
  }, [value, width, font, lineHeight])
}
```

---

## Performance Characteristics

| Operation | Cost | Notes |
|-----------|------|-------|
| `prepare()` | ~19ms / 500 texts | One-time. Canvas measurement. Cache this. |
| `layout()` | ~0.09ms / 500 texts | Hot path. Pure arithmetic. Call on resize. |
| `layoutWithLines()` | Slightly more than `layout()` | Builds line strings. Use when you need line data. |
| `walkLineRanges()` | Fast | No string materialization. Best for shrinkwrap. |

---

## Caveats

- Targets common CSS text setup: `white-space: normal`, `word-break: normal`, `overflow-wrap: break-word`, `line-break: auto`
- `system-ui` is unsafe for accuracy — canvas and DOM can resolve different fonts on macOS. Use named fonts.
- Narrow widths may break inside words at grapheme boundaries (matching `overflow-wrap: break-word` behavior)
- Supports all languages including emoji, mixed-bidi, CJK, Arabic, Thai, and more
- `pre-wrap` mode preserves spaces, tabs, and `\n` hard breaks (tabs follow default `tab-size: 8`)

---

## Anti-Patterns to Replace

| Old Pattern (DOM Measurement) | Pretext Replacement |
|-------------------------------|-------------------|
| `el.offsetHeight` for text height | `layout(prepared, width, lineHeight).height` |
| `el.getBoundingClientRect()` for text | `layout()` or `layoutWithLines()` |
| `ResizeObserver` + height tracking for text | `layout()` on container width change |
| Estimated row heights in virtualizers | Exact heights from `layout()` |
| `scrollHeight` for auto-sizing textarea | `prepare(text, font, { whiteSpace: 'pre-wrap' })` then `layout(prepared, width, lh).height` |
| Trial-rendering text offscreen to measure | `prepare()` + `layout()` |
