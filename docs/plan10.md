# Slice 10 — Alternate Art Carousel

## Goal

Add an alternate-art carousel to `CardDetailPage` that appears only when a card has more than one artwork variant. Single-art cards are unaffected.

---

## Files changed

| File | Change |
|---|---|
| `client/src/pages/CardDetailPage.jsx` | Add `useEffect` import, one `useState`, one `useEffect`, replace static `<img>` block |

No new tokens required. All CSS custom properties referenced (`--radius-md`, `--text-secondary`, `--text-primary`) already exist in `tokens.css`. No other files change.

---

## Step 1 — Update React import

Add `useEffect` to the existing named import on line 1.

Before: `import { useState } from 'react'`  
After: `import { useState, useEffect } from 'react'`

---

## Step 2 — Add artIndex state

Add one new `useState` call immediately after the existing `const [showAll, setShowAll] = useState(false)` line:

```
const [artIndex, setArtIndex] = useState(0)
```

---

## Step 3 — Add reset effect

After the two `useState` calls and before the early-return guards (`if (isLoading)` / `if (isError)`), add:

```
useEffect(() => { setArtIndex(0) }, [id])
```

This resets the carousel to the first art whenever the user navigates to a different card. `id` comes from `useParams()` which is already destructured on line 7.

---

## Step 4 — Replace the static `<img>` block (lines 89–95)

The current block renders `card.card_images?.[0]?.image_url` unconditionally. Replace the entire block with conditional logic:

**When `card.card_images.length === 1`:** render the existing static `<img>` unchanged — same `src`, same styles, same `loading="lazy" decoding="async"`. No section label, no controls. The page looks exactly as before.

**When `card.card_images.length > 1`:** render the carousel section described in Step 5. The static `<img>` is not rendered.

---

## Step 5 — Carousel section structure (multi-art only)

The carousel section replaces the static `<img>` and consists of three parts rendered in order:

### 5a. Section label

A `<p>` styled identically to the existing `SETS` label (line 131–133 in the current file):
- `fontSize: '11px'`, `fontWeight: 500`, `textTransform: 'uppercase'`, `letterSpacing: '0.06em'`
- `color: 'var(--text-secondary)'`
- `marginBottom: '8px'`, `margin: '0 0 8px 0'`
- Text content: `Alternate Art`

### 5b. Carousel image

An `<img>` element with:
- `src`: `card.card_images[artIndex].image_url_cropped`
- `alt`: `card.name` + ` art ${artIndex + 1}` (e.g. `"Dark Magician art 2"`)
- `loading="lazy"`, `decoding="async"` (required by CLAUDE.md)
- Inline styles: `display: 'block'`, `margin: '0 auto'`, `width: '100%'`, `maxWidth: '400px'`, `borderRadius: 'var(--radius-md)'`

### 5c. Control row

A `<div>` with `display: 'flex'`, `justifyContent: 'center'`, `alignItems: 'center'`, `marginTop: '10px'`, `marginBottom: '1.5rem'`.

It contains three children in order:

**Prev button (←)**
- `onClick`: `() => setArtIndex(i => i - 1)`
- `disabled`: `artIndex === 0`
- Inline styles: `background: 'none'`, `border: 'none'`, `cursor: 'pointer'`, `fontSize: '18px'`, `color: 'var(--text-primary)'`, `padding: '0 8px'`, `opacity: artIndex === 0 ? 0.4 : 1`

**Counter label**
- A `<span>` with text `{artIndex + 1} of {card.card_images.length}`
- Inline styles: `fontSize: '12px'`, `color: 'var(--text-secondary)'`, `fontFamily: 'var(--font-body)'`

**Next button (→)**
- `onClick`: `() => setArtIndex(i => i + 1)`
- `disabled`: `artIndex === card.card_images.length - 1`
- Inline styles: `background: 'none'`, `border: 'none'`, `cursor: 'pointer'`, `fontSize: '18px'`, `color: 'var(--text-primary)'`, `padding: '0 8px'`, `opacity: artIndex === card.card_images.length - 1 ? 0.4 : 1`

---

## Constraints

- No hex values anywhere in the new code.
- The `disabled` attribute handles keyboard/accessibility; `opacity` is a visual-only companion.
- The control row `marginBottom: '1.5rem'` replaces the `margin: '0 auto 1.5rem'` that was on the static `<img>` — spacing to the card name `<h1>` is preserved.
- Every other part of `CardDetailPage` (back button, h1, badge, stats, desc, price, sets section) is untouched.

---

## Edge cases

| Scenario | Behaviour |
|---|---|
| Card has 1 image | Static `<img>` renders as before; no label, no controls |
| User navigates card → card | `useEffect` on `id` resets `artIndex` to 0 before the new card renders |
| `image_url_cropped` missing on an entry | The `<img>` renders a broken image; no additional guard needed (API guarantees this field) |
| artIndex already 0, Prev clicked | Button is `disabled`; click is a no-op |
| artIndex at last, Next clicked | Button is `disabled`; click is a no-op |
