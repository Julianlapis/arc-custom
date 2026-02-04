# Interface: Design

## Shadows

- SHOULD: Layer shadows (ambient + direct): `shadow-[0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.1)]`
- SHOULD: Prefer `box-shadow` over `border` for subtle edges — shadows blend with backgrounds and avoid subpixel rendering issues:

```css
/* Preferred: shadow blends with any background */
box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);

/* Also works: inset variant */
box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);

/* Fallback: explicit border when shadow isn't practical */
border: 1px solid rgb(0 0 0 / 0.05);
```

## Borders

- SHOULD: Hairline borders on retina:

```css
:root {
  --border-hairline: 1px;
  @media (min-resolution: 2dppx) { --border-hairline: 0.5px; }
}
```

## Radii

- SHOULD: Nested radii: `innerRadius = outerRadius - padding`

## Contrast

- MUST: APCA contrast compliance ([apcacontrast.com](https://apcacontrast.com))
- MUST: Increase contrast on `:hover/:active/:focus`
- MUST: Color-blind friendly chart palettes

## Gradients

- SHOULD: Eased gradients to avoid banding ([tool](https://larsenwork.com/easing-gradients))
- SHOULD: `mask-image` over gradient for fades:

```css
.fade-bottom { mask-image: linear-gradient(to bottom, black 80%, transparent); }
```

- NEVER: Fade on scrollable content

## Scrollbars

- NEVER: Custom page scrollbar
- SHOULD: Custom scrollbar only in contained elements (code blocks)

## Focus

- NEVER: Colored focus outlines (use grey/black/white only)

## Color Restraint

- SHOULD: One accent color per view
- SHOULD: Use existing tokens before adding new
- NEVER: Purple gradients, multicolor gradients (AI slop)
- NEVER: Glow effects as affordances

## Decorative Elements

- MUST: `pointer-events: none` on decorative overlays
- SHOULD: `user-select: none` on code illustrations

## Primitives

- NEVER: Mix component libraries (Radix + Headless + Base UI)
- MUST: Use project's existing primitives
- MUST: Use accessible primitives (Radix, Base UI) for keyboard/focus behavior
