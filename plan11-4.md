# Slice 11.4 — SetsPage Search Filter

## Goal

Add a debounced search input to `SetsPage.jsx` that filters the grouped set list via URL param `setq`. One file changes.

---

## Files to modify

| File | Action |
|---|---|
| `client/src/pages/SetsPage.jsx` | Add search input, local state, URL sync, filtering |

---

## Why `setq`, not `q`

NavBar's card search writes `q` to the URL. Both pages share the same `URLSearchParams` on the same URL. If `SetsPage` also reads/writes `q`, typing in the sets search would update the card search param and vice versa — they'd share state and corrupt each other. `setq` is a completely separate key with no overlap.

---

## New imports

Add to the existing import lines:

```
import { useState, useEffect } from 'react'                  // add to react import
import { useSearchParams, useNavigate } from 'react-router-dom'  // add useSearchParams
import { useDebouncedCallback } from 'use-debounce'
```

`useNavigate` is already imported — just extend the destructure to include `useSearchParams`.

---

## State and URL wiring (inside SetsPage)

```
const [searchParams, setSearchParams] = useSearchParams()
const setq = searchParams.get('setq') || ''

const [localSetQ, setLocalSetQ] = useState(setq)
useEffect(() => { setLocalSetQ(setq) }, [setq])

const debouncedSetQ = useDebouncedCallback((value) => {
  setSearchParams(prev => {
    const next = new URLSearchParams(prev)
    if (value) next.set('setq', value)
    else        next.delete('setq')
    return next
  })
}, 300)

function handleSearch(e) {
  setLocalSetQ(e.target.value)
  debouncedSetQ(e.target.value)
}
```

**Why local state + URL state are separate:**
- `localSetQ` drives the input's `value` — it updates on every keystroke so the input feels instant.
- `setq` (URL param) drives the filtered list — it only updates after 300ms of idle, preventing a filter recalculation on every character.
- `useEffect` syncs `localSetQ` ← `setq` when the URL changes externally (e.g. back/forward navigation or a shared link). This is the identical pattern `SearchBar.jsx` uses with its `local` / `value` pair.

---

## Filtering

Derive `filtered` from `setq` (the URL param, not `localSetQ`) immediately after the early-return loading/error guards:

```
const filtered = setq
  ? sets.filter(s => s.set_name.toLowerCase().includes(setq.toLowerCase()))
  : sets
```

Then build the grouped `Map` from `filtered` instead of `sets`. No other change to the grouping logic.

---

## Input element

Insert between the `<h1>` and the `TYPE_ORDER.map(...)` block:

```
<input
  type="search"
  placeholder="Filter sets…"
  value={localSetQ}
  onChange={handleSearch}
  aria-label="Filter sets"
  style={{
    width: '100%',
    height: '40px',
    padding: '0 12px',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    background: 'var(--bg-surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    marginBottom: '24px',
    boxSizing: 'border-box',
  }}
/>
```

Matches the `variant="page"` styles of `SearchBar.jsx`. `boxSizing: 'border-box'` prevents the 100% width from overflowing when padding is added.

---

## Empty state

After the `<input>` and before the `TYPE_ORDER.map(...)` block, render conditionally:

```
{filtered.length === 0 && (
  <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
    No sets match &ldquo;{setq}&rdquo;.
  </p>
)}
```

Uses `setq` (URL param) in the message — the committed search term, not the in-flight local value. This avoids the message flickering mid-debounce.

---

## What does NOT change

- `normalizeType` — untouched.
- `TYPE_ORDER` — untouched.
- The grouped `Map` construction — only its input changes from `sets` to `filtered`.
- The group header and row button JSX — untouched.
- `NavBar.jsx` — not touched.
- All other files — not touched.

---

## Constraints

- No hex values — all colors from CSS custom properties.
- Param key is `setq` throughout. Never `q`.
- `filtered` derives from `setq`, not `localSetQ`.
- Empty state message uses `setq`, not `localSetQ`.
