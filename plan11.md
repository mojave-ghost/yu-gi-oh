# Slice 11 — Sets Browser

## Build order

1. `server/routes/sets.js`
2. Mount in `server/index.js`
3. `client/src/utils/api.js` additions
4. `client/src/hooks/useSets.js`
5. `client/src/hooks/useSetCards.js`
6. `client/src/pages/SetsPage.jsx`
7. `client/src/pages/SetDetailPage.jsx`
8. `client/src/App.jsx` — add two routes

---

## 1. `server/routes/sets.js`

Two separate `NodeCache` instances — one per TTL tier, matching the pattern
in `cards.js` where a single instance holds one TTL for the whole file. Here
the two tiers are far enough apart (24hr vs 1hr) to warrant isolation.

```
const setsListCache  = new NodeCache({ stdTTL: 86400 })  // 24hr — sets list
const setCardsCache  = new NodeCache({ stdTTL: 3600  })  // 1hr  — set card lists
```

### `GET /api/sets`

- Upstream: `GET https://db.ygoprodeck.com/api/v7/cardsets.php`
- The response is a **bare JSON array** (not wrapped in `{ data: [...] }` like
  `cardinfo.php`). Parse with `await upstream.json()` directly.
- Cache key: `'all_sets'` (static — there are no query params).
- Return the full array unchanged.
- Error: `res.status(502).json({ error: 'Upstream API error' })`.
- Wrap in try/catch consistent with `cards.js`.

### `GET /api/sets/:setName`

- Express auto-decodes `req.params.setName` (percent-decoding), but
  call `decodeURIComponent(req.params.setName)` explicitly to handle any
  double-encoded edge cases from older browsers.
- Upstream: `GET cardinfo.php?cardset={setName}&tcgplayer_data=true&misc=yes`
- Cache key: `set_${setName}` (use the decoded name as the key).
- Parse response as `json.data || []`. Return `{ cards, total: cards.length }`.
- 404 if upstream is non-OK; 502 for other errors.

---

## 2. `server/index.js`

Add one line after the existing `cards` mount:

```js
const setsRoute  = require('./routes/sets')
app.use('/api/sets', setsRoute)
```

---

## 3. `client/src/utils/api.js`

Two new exports, appended after the existing helpers:

```js
export async function fetchSets() {
  const res = await fetch(`${BASE}/sets`)
  if (!res.ok) throw new Error('Failed to fetch sets')
  return res.json()  // bare array
}

export async function fetchCardsBySet(setName) {
  const res = await fetch(`${BASE}/sets/${encodeURIComponent(setName)}`)
  if (!res.ok) throw new Error('Failed to fetch set cards')
  return res.json()  // { cards, total }
}
```

---

## 4. `client/src/hooks/useSets.js`

```js
import { useQuery } from '@tanstack/react-query'
import { fetchSets } from '../utils/api'

export function useSets() {
  return useQuery({
    queryKey: ['sets'],
    queryFn:  fetchSets,
    staleTime: 1000 * 60 * 60 * 24,  // 24hr — matches server cache
  })
}
```

No `placeholderData` needed — the list is not paginated.

---

## 5. `client/src/hooks/useSetCards.js`

```js
import { useQuery } from '@tanstack/react-query'
import { fetchCardsBySet } from '../utils/api'

export function useSetCards(setName) {
  return useQuery({
    queryKey: ['set', setName],
    queryFn:  () => fetchCardsBySet(setName),
    enabled:  !!setName,
    staleTime: 1000 * 60 * 60,  // 1hr
  })
}
```

---

## 6. `client/src/pages/SetsPage.jsx`

### Routing note — search input
CLAUDE.md hard rule: "Filter state lives in URL search params. No `useState`
for filters." The set name search input is a filter, so it must use
`useSearchParams`. Read `q` from params; write back through `setSearchParams`.
This makes the filtered view shareable and survive refresh.

### Set type grouping

The `cardsets.php` API returns a `set_type` string per set. Not all values
match the eight canonical labels exactly. Define a local lookup:

```js
const TYPE_ORDER = [
  'Core Set',
  'Booster Pack',
  'Starter Deck',
  'Structure Deck',
  'Special Edition',
  'Tin',
  'Promo',
  'Other',
]
// Normalize API values to canonical labels
function normalizeType(raw) {
  if (!raw) return 'Other'
  const lower = raw.toLowerCase()
  if (lower.includes('core'))       return 'Core Set'
  if (lower.includes('booster'))    return 'Booster Pack'
  if (lower.includes('starter'))    return 'Starter Deck'
  if (lower.includes('structure'))  return 'Structure Deck'
  if (lower.includes('special'))    return 'Special Edition'
  if (lower.includes('tin'))        return 'Tin'
  if (lower.includes('promo') || lower.includes('promotional')) return 'Promo'
  return 'Other'
}
```

Group the filtered sets into a `Map<label, Set[]>` after applying the `q`
filter. Iterate over `TYPE_ORDER` to render sections in a fixed order; skip
any group that has no sets after filtering.

### Collapsible sections

Use `<details>` / `<summary>` (native HTML — no JS state needed). Default
`open` attribute: apply to the first two groups so Core Set and Booster Pack
are visible on initial load. The rest start collapsed.

### Row layout

Each set row is a `<button>` (keyboard accessible). `onClick` navigates to
`/sets/${encodeURIComponent(set.set_name)}`.

Columns (flex row, `justifyContent: 'space-between'`):
- Left: `set_name` — DM Sans 14px, `var(--text-primary)`
- Right group: `set_code` in `var(--text-secondary)` · `num_of_cards` cards ·
  `tcg_date ?? '—'`

Row styles:
- `borderBottom: '0.5px solid var(--border)'`
- `padding: '10px 0'`
- `cursor: 'pointer'`
- `background: 'transparent'` default; `var(--bg-surface)` on hover via
  inline `onMouseEnter` / `onMouseLeave` (same pattern as `CardTile`)

### States

- Loading: `<p>Loading sets…</p>` — DM Sans, `var(--text-secondary)`
- Error: `<p>Failed to load sets.</p>` — DM Sans, `var(--red)`
- No results after filter: `<p>No sets match "{q}".</p>`

### Page structure

```
<main style={{ padding: 'var(--section-pad)', maxWidth: '860px', margin: '0 auto' }}>
  <h1>  /* Sets — Cinzel, 28px */
  <input type="search" />  /* filter input — controlled by URL param q */
  {TYPE_ORDER.map(label => (
    <details key={label} open={firstTwo}>
      <summary>  /* label + count badge */
      {rows}
    </details>
  ))}
</main>
```

Section summary style: DM Sans 13px, fontWeight 500, `var(--text-primary)`,
`cursor: 'pointer'`, padding `10px 0`, `borderBottom: '0.5px solid var(--border)'`.

---

## 7. `client/src/pages/SetDetailPage.jsx`

### Data flow

```js
const { setName } = useParams()
const decodedName = decodeURIComponent(setName)
const { data, isLoading, isError } = useSetCards(decodedName)
```

The hook receives the decoded name; `fetchCardsBySet` re-encodes it for the
URL. This matches the `useCardDetail(id)` pattern exactly.

### Layout

```
<div style={{ padding: 'var(--section-pad)' }}>
  <button onClick={() => navigate(-1)}>← Back</button>  /* same style as CardDetailPage */

  <h1>  /* decodedName — Cinzel, 28px */

  /* Subtitle line — DM Sans 13px, var(--text-secondary) */
  /* set_code · num_of_cards cards · tcg_date */
  /* Source these fields from data.cards[0]?.card_sets lookup OR
     pass them via the sets list already in TanStack Query cache.
     See note below. */

  <CardGrid cards={data?.cards} isLoading={isLoading} isError={isError} />
</div>
```

**Subtitle data source:** `useSetCards` returns `{ cards, total }` — the
individual card objects don't carry the set's `set_code` / `tcg_date` at
the top level. Two options:

- **Option A (recommended):** Read the already-cached sets list from
  `useQueryClient().getQueryData(['sets'])` and find the matching entry by
  `set_name`. The list is almost always in cache when the user navigates from
  `SetsPage`. Falls back to `null` gracefully if not cached yet.
- **Option B:** Strip `set_code` / `tcg_date` from the first card's
  `card_sets` array entry that matches `decodedName`. Fragile if card data
  varies.

Use Option A. Call `useQueryClient` from TanStack Query; no extra fetch.

### No pagination

The spec shows a single `<CardGrid>` with all cards. `CardGrid` already
handles the empty and error states. Do not add a `<Pagination>` component
unless the card count warrants it — largest sets are ~200 cards, which
renders fine in a single grid.

### States

- Loading: delegated to `CardGrid isLoading` prop.
- Error: `<p style={{ color: 'var(--red)' }}>Failed to load set.</p>` before
  attempting to render the grid.

---

## 8. `client/src/App.jsx`

Add two imports and two routes inside the existing `<Routes>`:

```jsx
import SetsPage      from './pages/SetsPage'
import SetDetailPage from './pages/SetDetailPage'

// inside <Routes>:
<Route path="/sets"          element={<SetsPage />} />
<Route path="/sets/:setName" element={<SetDetailPage />} />
```

Place before the `*` catch-all.

---

## Constraints checklist

- No hex values in any JSX file — all colors via CSS custom properties.
- `loading="lazy" decoding="async"` on all images — CardGrid / CardTile
  already enforce this; no new image code in these pages.
- No `useState` for the search filter — URL param `q` only.
- All API calls via `/api/*` proxy — `fetchSets` and `fetchCardsBySet` both
  target `/api/sets/*`.
- Card type → color mapping unchanged — `CardTile` brings its own logic.

---

## Files created / modified

| Action   | Path |
|----------|------|
| Create   | `server/routes/sets.js` |
| Modify   | `server/index.js` |
| Modify   | `client/src/utils/api.js` |
| Create   | `client/src/hooks/useSets.js` |
| Create   | `client/src/hooks/useSetCards.js` |
| Create   | `client/src/pages/SetsPage.jsx` |
| Create   | `client/src/pages/SetDetailPage.jsx` |
| Modify   | `client/src/App.jsx` |
