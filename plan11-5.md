# Plan: Slice 11.5 — SetDetailPage

## Overview

Add `SetDetailPage` at `/sets/:setName`. It fetches cards via the existing
`useSetCards` hook, reads set metadata from the TanStack Query cache
(`['sets']`), and renders the full card list with the existing `CardGrid`.
Wire the new route into `App.jsx` immediately after `/sets`.

---

## Files

| File | Action |
|---|---|
| `client/src/pages/SetDetailPage.jsx` | Create |
| `client/src/App.jsx` | Modify — add import + route |

---

## Step 1 — `SetDetailPage.jsx`

### Imports

```js
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useSetCards } from '../hooks/useSetCards'
import CardGrid from '../components/cards/CardGrid'
```

### Data

```js
const { setName } = useParams()
const navigate    = useNavigate()
const decodedName = decodeURIComponent(setName)

const { data, isLoading, isError } = useSetCards(decodedName)

// Read set metadata from the ['sets'] query cache.
// Returns undefined if SetsPage hasn't been visited yet — handled gracefully.
const setsCache = useQueryClient().getQueryData(['sets'])
const meta      = setsCache?.find(s => s.set_name === decodedName) ?? null
```

Derive subtitle fields with `'—'` fallbacks:
```js
const setCode    = meta?.set_code ?? '—'
const numOfCards = meta?.num_of_cards != null ? `${meta.num_of_cards} cards` : '—'
const tcgDate    = meta?.tcg_date ?? '—'
```

### Layout structure

Always render the page shell (back button, h1, subtitle), then branch on
error vs. normal render.

**Outer wrapper:**
```jsx
<div style={{ padding: 'var(--section-pad)' }}>
```

**Back button** — exact style from `CardDetailPage` lines 79–92:
```jsx
<button
  onClick={() => navigate(-1)}
  style={{
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    padding: 0,
  }}
>
  ← Back
</button>
```

**Heading:**
```jsx
<h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '4px' }}>
  {decodedName}
</h1>
```

**Subtitle** — single `<p>`, DM Sans 13 px, `var(--text-secondary)`, marginBottom 20 px:
```jsx
<p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
  {setCode} · {numOfCards} · {tcgDate}
</p>
```

### Error handling

> **Spec conflict note:** The spec asks for an error `<p>` "before the
> CardGrid" AND to pass `isError` to CardGrid. `CardGrid` already renders
> its own error message when `isError` is true, which would produce two
> error messages simultaneously.
>
> **Resolution:** Render the page-level error `<p>` and stop — do not
> render `CardGrid` when `isError`. This matches `CardDetailPage`'s
> early-return pattern and avoids the duplicate. `isError` is not passed
> to CardGrid.

```jsx
{isError ? (
  <p style={{ color: 'var(--red)', fontFamily: 'var(--font-body)' }}>
    Failed to load set.
  </p>
) : (
  <CardGrid cards={data?.cards} isLoading={isLoading} />
)}
```

`CardGrid` already handles the loading skeleton (`isLoading`), the empty
state (`!cards?.length`), and renders the grid — no additional logic
needed here.

### No pagination

All cards in the set are passed to `CardGrid` in one shot. Largest sets
are ~200 cards; the grid's `auto-fill / minmax(160px, 1fr)` layout
handles this without pagination.

### No hex values

All colors use tokens already in `tokens.css`:
`var(--section-pad)`, `var(--text-secondary)`, `var(--font-body)`,
`var(--font-display)`, `var(--red)`.

---

## Step 2 — `App.jsx`

Add import alongside the other page imports:
```js
import SetDetailPage from './pages/SetDetailPage'
```

Add route immediately after the `/sets` route:
```jsx
<Route path="/sets"         element={<SetsPage />} />
<Route path="/sets/:setName" element={<SetDetailPage />} />
```

Order matters: React Router v6 matches by specificity, but placing
`/sets/:setName` after `/sets` is the conventional layout and avoids
any ambiguity.

---

## Summary of constraints respected

| Rule | How |
|---|---|
| No hex values | All colors via CSS custom properties |
| Images lazy + async | CardGrid → CardTile already sets these |
| No `useState` for filters | No filters on this page |
| All API calls via proxy | `useSetCards` → `fetchCardsBySet` → `/api/sets/:name` |
| Font family | Cinzel for h1, DM Sans everywhere else |
