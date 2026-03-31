# Interface: Performance

## Principles

- MUST: Measure reliably (disable extensions that skew runtime)
- MUST: Track re-renders (React DevTools/React Scan)
- MUST: Batch layout reads/writes — avoid reflows/repaints
- MUST: Mutations (`POST/PATCH/DELETE`) < 500ms
- MUST: Virtualize large lists (`@tanstack/react-virtual` or `virtua`). Consider `@chenglou/pretext` for exact row heights instead of estimated sizes.
- MUST: Preload above-fold images; lazy-load rest
- SHOULD: Test iOS Low Power Mode and macOS Safari
- SHOULD: Prefer uncontrolled inputs; make controlled loops cheap

## CSS

- SHOULD: Avoid large `blur()` values (GPU-heavy)
- SHOULD: Replace blurred rectangles with radial gradients
- SHOULD: `transform: translateZ(0)` sparingly for GPU layer promotion
- SHOULD: Toggle `will-change` only during scroll, then remove

### CSS Variables

- NEVER: Animate global CSS variables — triggers style recalc on ALL descendants (F-Tier)
- CSS variables ALWAYS trigger paint, even inside `opacity: var(--x)`
- If unavoidable, use `@property { inherits: false }` to prevent cascade

### Text Measurement (Use Pretext)

- SHOULD: Use `@chenglou/pretext` for text height/width measurement instead of DOM reads
- SHOULD: Avoid `offsetHeight`, `getBoundingClientRect`, or `scrollHeight` to measure text when your CSS matches Pretext's supported model (normal wrapping, named font, known lineHeight). For unsupported CSS (`nowrap`, `letter-spacing`, `break-all`, mixed inline content), DOM measurement is still valid — but batch your reads.
- SHOULD: Cache `prepare()` results — it's the expensive one-time step. `layout()` is the cheap hot path for resize.
- NEVER: Use `system-ui` with Pretext — canvas and DOM can resolve different fonts on macOS.
- NEVER: Call `prepare()` in Server Components or Node.js — it requires canvas and will throw.
- See `references/pretext.md` for full API and integration patterns

```ts
// Bad: DOM measurement triggers reflow
const height = textElement.offsetHeight

// Good: Pure arithmetic, no reflow
import { prepare, layout } from '@chenglou/pretext'
const prepared = prepare(text, '16px Inter') // once
const { height } = layout(prepared, containerWidth, 20) // on resize — pure math
```

Key use cases: virtualized list row heights, auto-sizing textareas, chat bubble shrinkwrap, masonry card heights, text-around-image flow, scroll anchoring.

### Thrashing (F-Tier)

- NEVER: Interleave DOM reads and writes (read-write-read-write)
- MUST: Batch all reads, then all writes

```js
// Bad: Thrashing
element.style.width = "100px"
const width = element.offsetWidth // Forces layout
element.style.width = width * 2 + "px"

// Good: Batched
const width = element.offsetWidth // Read first
element.style.width = width * 2 + "px" // Then write
```

### Theme Switching

- MUST: Disable transitions during theme change (see `animation.md`)

## Hydration & Refresh

- MUST: No flash of wrong content on page refresh for interactive components (tabs, toggles, accordions, theme)
- MUST: Persist client state in `localStorage`/`sessionStorage` and read before first render
- MUST: Set initial state server-side or use CSS to prevent flash:

```jsx
// Read persisted state before render to avoid flash
const [activeTab, setActiveTab] = useState(() => {
  if (typeof window === 'undefined') return 'default';
  return localStorage.getItem('activeTab') ?? 'default';
});
```

```css
/* CSS-only: hide content until JS hydrates to prevent flash */
[data-hydrated="false"] .interactive-content {
  visibility: hidden;
}
```

- SHOULD: Use proper SSR hydration — match server/client initial state

## Video & Media

- MUST: Pause/unmount off-screen videos (especially iOS)
- MUST: `muted playsinline` for iOS autoplay:

```html
<video autoplay loop muted playsinline>
  <source src="video.mp4" type="video/mp4">
</video>
```

## React

- SHOULD: Refs for real-time DOM updates that bypass render (mouse position, scroll)
- SHOULD: Detect/adapt to device capabilities and network conditions

### Motion/Framer Motion

Motion uses WAAPI (S-Tier) for most animations. However, "independent transforms" (`x`, `y`, `rotate`, `scale`) use a main-thread approach (A-Tier).

```jsx
// S-Tier: WAAPI, compositor thread
<motion.div animate={{ transform: "translateX(100px)" }} />
<motion.div animate={{ opacity: 1 }} />

// A-Tier: Main thread (independent transforms)
<motion.div animate={{ x: 100 }} />
```

For performance-critical transforms, prefer string syntax to ensure WAAPI.

### Long Lists Without Virtualization

When full virtualization (`@tanstack/react-virtual`) isn't feasible, use CSS `content-visibility`:

```css
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px; /* estimated height */
}
```

This lets the browser skip rendering off-screen items. Simpler than JS virtualization, works for moderate lists (100-500 items).

**Better:** Use `@chenglou/pretext` to calculate exact `contain-intrinsic-size` values from text content instead of hardcoded estimates. See `references/pretext.md`.

### Hydration Mismatches

For content that legitimately differs between server and client (timestamps, locale-dependent text), suppress the warning:

```tsx
<time suppressHydrationWarning>{new Date().toLocaleString()}</time>
```
