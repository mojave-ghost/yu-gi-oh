# Slice 8 — Card Detail Sets Section Redesign

## Files changed

| File | Change |
|---|---|
| `client/src/styles/tokens.css` | Add `--card-rare-bg` and `--card-rare-text` |
| `client/src/pages/CardDetailPage.jsx` | Rewrite sets section; add helpers + state |

No other files are touched in this slice.

---

## Current state (what we're replacing)

`CardDetailPage.jsx` lines 70–81:

```jsx
{card.card_sets && (
  <div style={{ marginTop: '20px' }}>
    <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
      Sets
    </p>
    {card.card_sets.slice(0, 5).map(s => (
      <p key={s.set_code} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {s.set_name} · {s.set_code} · {s.set_rarity}
      </p>
    ))}
  </div>
)}
```

Problems: hard-coded `slice(0, 5)`, no sort, no rarity badges, no price columns, flat text rows.

---

## Step 1 — Add rare tokens to `tokens.css`

`tokens.css` currently ends its card type token block at `--card-ritual-text` (line 85).
Append two new tokens after the ritual block, before the closing `}`:

```css
/* Card type tokens — rare (rarity badge only, no card-type stripe) */
--card-rare-bg:   #C8C8C8;
--card-rare-text: #2e2e2e;
```

These are the only two hex values introduced in this slice. Everything else uses
existing tokens. After this step, no hex values appear in any JSX file.

---

## Step 2 — `CardDetailPage.jsx` changes

### 2a. Add `useState` import

Current import (line 1) has no React import at all:
```js
import { useParams, useNavigate } from 'react-router-dom'
```

Replace with:
```js
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
```

### 2b. Add `getRarityStyle` helper

Define as a plain function inside the component body, after the early-return
guards (`if (isLoading)` / `if (isError)`). It is not exported — this is
detail-page-only logic and must not go in `cardTypeColors.js`.

```js
function getRarityStyle(code) {
  switch (code) {
    case '(C)':    return { bg: 'var(--bg-surface)',         color: 'var(--text-secondary)',  label: 'Common'    }
    case '(R)':    return { bg: 'var(--card-rare-bg)',       color: 'var(--card-rare-text)',  label: 'Rare'      }
    case '(SR)':   return { bg: 'var(--card-link-light)',    color: 'var(--card-link-text)',  label: 'Super'     }
    case '(UR)':   return { bg: 'var(--card-normal-light)',  color: 'var(--card-normal-text)', label: 'Ultra'    }
    case '(ScR)':  return { bg: 'var(--card-trap-light)',    color: 'var(--card-trap-text)',  label: 'Secret'    }
    case '(StR)':  return { bg: 'var(--card-spell-light)',   color: 'var(--card-spell-text)', label: 'Starlight' }
    case '(GR)':   return { bg: 'var(--card-synchro-light)', color: 'var(--card-synchro-text)', label: 'Ghost'  }
    case '(PScR)': return { bg: 'var(--card-fusion-light)',  color: 'var(--card-fusion-text)', label: 'Prismatic'}
    default:       return { bg: 'var(--bg-surface)',         color: 'var(--text-secondary)',  label: 'Special'   }
  }
}
```

### 2c. Add `sortSets` helper

Define alongside `getRarityStyle`, inside the component, not exported.

`'alpha'` sorts the full list without the listed/unlisted split — alphabetical
order needs no price bias applied. All other sort keys move sets where
`set_price_low` is `"0.00"` or missing (unlisted) to the bottom.

```js
function sortSets(sets, key) {
  if (key === 'alpha') {
    return [...sets].sort((a, b) => a.set_name.localeCompare(b.set_name))
  }

  const listed   = sets.filter(s => parseFloat(s.set_price_low) > 0)
  const unlisted = sets.filter(s => !(parseFloat(s.set_price_low) > 0))

  let sortedListed
  switch (key) {
    case 'high':
      sortedListed = [...listed].sort((a, b) => parseFloat(b.set_price) - parseFloat(a.set_price))
      break
    case 'low':
    case 'best':
    default:
      sortedListed = [...listed].sort((a, b) => parseFloat(a.set_price_low) - parseFloat(b.set_price_low))
  }

  return [...sortedListed, ...unlisted]
}
```

### 2d. Add `useState` declarations

Add after the existing `const price = card.card_prices?.[0]?.tcgplayer_price` line:

```js
const [sortKey, setSortKey] = useState('best')
const [showAll, setShowAll] = useState(false)
```

### 2e. Add derived values

Add immediately after the `useState` declarations:

```js
const allSorted   = card.card_sets ? sortSets(card.card_sets, sortKey) : []
const visibleSets = showAll ? allSorted : allSorted.slice(0, 5)
const hiddenCount = allSorted.length - 5
```

---

## Step 3 — Replace the sets section JSX

Replace lines 70–81 (the entire `{card.card_sets && (…)}` block) with the
following structure. The outer `card.card_sets` guard stays.

### 3a. Section wrapper + header row

```jsx
{card.card_sets && (
  <div style={{ marginTop: '20px' }}>

    {/* Header: SETS label left, sort select right */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: 0 }}>
        Sets
      </p>
      <select
        value={sortKey}
        onChange={e => setSortKey(e.target.value)}
        style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <option value="best">Best Match</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
        <option value="alpha">A–Z</option>
      </select>
    </div>
```

### 3b. Set rows

Each row is a flex container with three zones: rarity badge (left), set info
(flex 1 center), price block (right). `key` uses `set_code + set_rarity_code`
because one set code can have multiple rarities (e.g., `LOB-EN001` Common and
`LOB-EN001` Ultra Rare); `set_code` alone would cause React key collisions.

```jsx
    {visibleSets.map(s => {
      const rarity      = getRarityStyle(s.set_rarity_code)
      const marketPrice = parseFloat(s.set_price)
      const lowPrice    = parseFloat(s.set_price_low)

      return (
        <div
          key={`${s.set_code}-${s.set_rarity_code}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '0.5px solid var(--border)', padding: '8px 0' }}
        >
          {/* Rarity badge */}
          <span style={{
            fontSize: '9px', fontWeight: 500, fontFamily: 'var(--font-body)',
            padding: '2px 5px', borderRadius: 'var(--radius-sm)',
            textTransform: 'uppercase', letterSpacing: '0.04em',
            whiteSpace: 'nowrap', flexShrink: 0,
            background: rarity.bg, color: rarity.color,
          }}>
            {rarity.label}
          </span>

          {/* Set info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
              {s.set_name}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              {s.set_code} · {s.set_edition}
            </p>
          </div>

          {/* Price block */}
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 500, margin: 0 }}>
              {marketPrice > 0 ? `$${marketPrice.toFixed(2)}` : '—'}
            </p>
            {lowPrice > 0 && (
              <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>
                from ${lowPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      )
    })}
```

### 3c. Show all / show less toggle

Only rendered when there are more than 5 sets total. Pluralises "printing/printings"
correctly.

```jsx
    {allSorted.length > 5 && (
      <button
        onClick={() => setShowAll(v => !v)}
        style={{ fontSize: '11px', color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0', display: 'block', fontFamily: 'var(--font-body)' }}
      >
        {showAll
          ? 'Show less'
          : `${hiddenCount} more printing${hiddenCount === 1 ? '' : 's'} — Show all`}
      </button>
    )}

  </div>
)}
```

---

## Constraints checklist

- [ ] No hex values in `CardDetailPage.jsx` — CSS custom properties only
- [ ] `--card-rare-bg` / `--card-rare-text` added to `tokens.css` before touching JSX
- [ ] `getRarityStyle` defined inside `CardDetailPage.jsx`, not exported, not in `cardTypeColors.js`
- [ ] `sortSets` defined inside `CardDetailPage.jsx`, not exported
- [ ] Hard-coded `slice(0, 5)` on line 75 removed; replaced by `visibleSets` derived value
- [ ] `set_url` present on set objects but TCGPlayer links not implemented (post-MVP)

---

## Implementation order

1. `tokens.css` — append `--card-rare-bg` and `--card-rare-text` after the ritual block
2. `CardDetailPage.jsx`:
   a. Add `useState` import
   b. Add `getRarityStyle` helper (inside component, after early returns)
   c. Add `sortSets` helper (inside component, after early returns)
   d. Add `sortKey` and `showAll` useState calls (after `const price`)
   e. Add `allSorted`, `visibleSets`, `hiddenCount` derived values (after useState)
   f. Replace lines 70–81 with the new sets section JSX
