# Slice 11.3 — SetsPage Static List

## Goal

Add a `/sets` route that renders all YGO sets grouped by type. No search, no filtering. No server changes.

---

## Files to create / modify

| File | Action |
|---|---|
| `client/src/pages/SetsPage.jsx` | Create |
| `client/src/App.jsx` | Add import + route |

---

## client/src/pages/SetsPage.jsx

### Imports

```
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useSets } from '../hooks/useSets'
```

`useNavigate` for button click navigation. `useState` for per-row hover tracking. No `useSearchParams` — this slice has no filter state.

---

### normalizeType(raw)

Keyword-based mapping on `raw.toLowerCase()`. Checked in order — first match wins:

| Keyword | Label |
|---|---|
| `'core'` | `'Core Set'` |
| `'booster'` | `'Booster Pack'` |
| `'starter'` | `'Starter Deck'` |
| `'structure'` | `'Structure Deck'` |
| `'special'` | `'Special Edition'` |
| `'tin'` | `'Tin'` |
| `'promo'` | `'Promo'` |
| (no match) | `'Other'` |

Defined inside the module, above the component. Pure function, no side effects.

---

### Grouping logic

Define a fixed-order label array at module level:

```
const TYPE_ORDER = [
  'Core Set', 'Booster Pack', 'Starter Deck', 'Structure Deck',
  'Special Edition', 'Tin', 'Promo', 'Other',
]
```

Inside the component, after data is available, build a `Map<label, set[]>` by iterating `data` and pushing each set into its normalized bucket. Then render by iterating `TYPE_ORDER` and skipping labels with no entries — so empty groups are never rendered.

---

### Hover state

Track the currently hovered set by its `set_code` with a single `useState` in the component:

```
const [hoveredCode, setHoveredCode] = useState(null)
```

On each row button: `onMouseEnter={() => setHoveredCode(set.set_code)}` and `onMouseLeave={() => setHoveredCode(null)}`. Apply `background: var(--bg-surface)` when `hoveredCode === set.set_code`, otherwise `'transparent'`.

This is the same scalar-state pattern used in `CardTile` — one piece of state for the whole list, not a boolean per row.

---

### JSX structure

```
export default function SetsPage() {
  // hook, state, grouping logic

  if (isLoading) return <LoadingState />
  if (isError)   return <ErrorState />

  return (
    <main style={{ padding: 'var(--section-pad)', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 24 }}>
        Sets
      </h1>
      {TYPE_ORDER.map(label => {
        const sets = groups.get(label)
        if (!sets) return null
        return (
          <div key={label}>
            {/* group header */}
            {sets.map(set => (
              <button key={set.set_code} ...>
                {/* left: set_name */}
                {/* right: set_code · num_of_cards cards · tcg_date */}
              </button>
            ))}
          </div>
        )
      })}
    </main>
  )
}
```

---

### Group header styles

Plain `<div>` — not a button, not interactive:

```
fontFamily: 'var(--font-body)'    // DM Sans
fontSize: 13
fontWeight: 500
color: 'var(--text-primary)'
padding: '10px 0'
borderBottom: '0.5px solid var(--border)'
```

Content: `{label} ({sets.length})`

---

### Set row button styles

```
display: 'flex'
justifyContent: 'space-between'
alignItems: 'center'
width: '100%'
background: hoveredCode === set.set_code ? 'var(--bg-surface)' : 'transparent'
border: 'none'
borderBottom: '0.5px solid var(--border)'
padding: '10px 0'
cursor: 'pointer'
textAlign: 'left'
```

**Left span** — set name:
```
fontFamily: 'var(--font-body)'
fontSize: 14
color: 'var(--text-primary)'
```

**Right span** — metadata:
```
fontFamily: 'var(--font-body)'
fontSize: 12
color: 'var(--text-secondary)'
```
Content: `` `${set.set_code} · ${set.num_of_cards} cards · ${set.tcg_date}` ``

**onClick:** `navigate(\`/sets/${encodeURIComponent(set.set_name)}\`)`

---

### Loading and error states

Both return early, before the main layout:

```
if (isLoading) return (
  <p style={{ padding: 'var(--section-pad)', color: 'var(--text-secondary)' }}>
    Loading sets…
  </p>
)

if (isError) return (
  <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>
    Failed to load sets.
  </p>
)
```

`var(--red)` must exist in `tokens.css` before this is implemented. Check and add if missing.

---

## client/src/App.jsx changes

Add import after the existing page imports:

```
import SetsPage from './pages/SetsPage'
```

Add route before the `*` catch-all:

```
<Route path="/sets" element={<SetsPage />} />
```

Route order in full:
1. `/` → Navigate to `/browse`
2. `/browse` → BrowsePage
3. `/card/:id` → CardDetailPage
4. `/sets` → SetsPage  ← new
5. `*` → NotFoundPage

---

## Constraints

- No hex values. All colors from CSS custom properties.
- No server changes.
- No search input or filter state in this slice.
- `var(--red)` must be verified in `tokens.css` before use in the error state.
