# Slice 7 — Card Detail Page

## Pre-flight checks

### `utils/api.js` — `fetchCardById`
`fetchCardById(id)` **already exists** at line 18–22. No changes needed.

```js
// already present — do not add again
export async function fetchCardById(id) {
  const res = await fetch(`${BASE}/cards/${id}`)
  if (!res.ok) throw new Error('Card not found')
  return res.json()
}
```

### `App.jsx` — route registration
`/card/:id` is **already registered** at line 14. No changes needed.

```jsx
<Route path="/card/:id" element={<CardDetailPage />} />
```

---

## Files to create / replace

### 1. `client/src/hooks/useCardDetail.js` — CREATE (file does not exist)

```js
import { useQuery } from '@tanstack/react-query'
import { fetchCardById } from '../utils/api'

export function useCardDetail(id) {
  return useQuery({
    queryKey: ['card', id],
    queryFn:  () => fetchCardById(id),
    enabled:  !!id,
  })
}
```

Notes:
- `queryKey: ['card', id]` — if the user clicked a tile, TanStack Query will already have this key populated from the card list response (cards in the grid carry the same shape). The detail page will feel instant.
- `enabled: !!id` — prevents firing when `id` is undefined (e.g., hook called before params resolve).

---

### 2. `client/src/pages/CardDetailPage.jsx` — REPLACE stub

Full replacement. Current file is a 7-line placeholder. Structure:

```
CardDetailPage
├── Back button          (above two-column layout)
└── Two-column flex row
    ├── Left: card image (220px wide, full-res from card_images[0].image_url)
    └── Right: flex 1
        ├── Card name    (font-display, 22px)
        ├── CardTypeBadge
        ├── ATK / DEF    (if card.atk !== undefined)
        ├── Level · Attribute · Race  (if card.level exists)
        ├── Description
        ├── TCG price    (if price exists AND parseFloat(price) > 0)
        └── Sets list    (first 5 entries, if card.card_sets exists)
```

**Detailed spec for each element:**

| Element | Condition | Style |
|---|---|---|
| Loading state | `isLoading` | `<p>Loading…</p>` — fontFamily var(--font-body) |
| Error state | `isError` | `<p>Card not found.</p>` — color var(--red) |
| Outer wrapper | always | maxWidth 720px, margin 0 auto, padding var(--section-pad) |
| Back button | always | text '← Back', onClick `navigate(-1)`, fontFamily var(--font-body), fontSize 13px, color var(--text-secondary), background none, border none, cursor pointer, marginBottom 1.5rem, padding 0 |
| Two-column row | always | display flex, gap 2rem, alignItems flex-start |
| Card image | always | src `card.card_images?.[0]?.image_url` (full-res, not _small), alt card.name, width 220, borderRadius var(--radius-md), flexShrink 0, loading="lazy", decoding="async" |
| Card name | always | `<h1>`, fontFamily var(--font-display), fontSize 22px, marginBottom 8px |
| CardTypeBadge | always | `<CardTypeBadge type={card.type} />` |
| ATK / DEF | `card.atk !== undefined` | 'ATK {atk} / DEF {def}', color var(--text-secondary), fontSize 14px, marginTop 12px |
| Level line | `card.level` | 'Level {level} · {attribute} · {race}', color var(--text-secondary), fontSize 13px, marginTop 4px |
| Description | always | card.desc, fontSize 13px, lineHeight 1.7, color var(--text-primary), marginTop 16px |
| Price | `price && parseFloat(price) > 0` | `$X.XX`, color var(--gold), fontSize 18px, fontWeight 500, marginTop 16px; inline label 'TCGPlayer market' in var(--text-secondary) fontSize 12px |
| Sets label | `card.card_sets` | 'SETS', fontSize 11px, textTransform uppercase, letterSpacing 0.06em, fontWeight 500, color var(--text-secondary), marginBottom 6px, marginTop 20px |
| Sets rows | `card.card_sets` — first 5 | '{set_name} · {set_code} · {set_rarity}', fontSize 12px, color var(--text-secondary); key = set_code |

**Hard constraints to enforce:**
- No hex values — all colors via CSS custom properties
- Image uses `card.card_images?.[0]?.image_url` (not a hardcoded URL pattern)
- Price guard is `parseFloat(price) > 0`, not just truthy (price field can be `"0.00"`)

---

## Implementation order

1. Create `client/src/hooks/useCardDetail.js`
2. Replace `client/src/pages/CardDetailPage.jsx`

No other files need touching.
