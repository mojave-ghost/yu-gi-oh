# Slice 4 Plan — Card Grid

## What's already done

| File | Status |
|---|---|
| `client/src/styles/tokens.css` | Complete |
| `client/src/utils/cardTypeColors.js` | Built — needs shape fix (see below) |
| `server/index.js` + `server/routes/cards.js` | Complete |
| `client/src/components/layout/NavBar.jsx` | Complete |
| `client/src/components/search/SearchBar.jsx` | Complete |
| `client/src/App.jsx` | Complete |
| `client/src/pages/BrowsePage.jsx` | Stub — replace in this slice |
| `client/src/pages/CardDetailPage.jsx` | Stub — leave for Slice 7 |

## Files to create (in dependency order)

```
client/src/utils/api.js                         ← new
client/src/utils/cardTypeColors.js              ← update (shape fix)
client/src/hooks/useCards.js                    ← new (create hooks/ dir)
client/src/components/cards/CardTypeBadge.jsx   ← new
client/src/components/cards/CardTile.jsx        ← new
client/src/components/cards/CardGrid.jsx        ← new
client/src/components/filters/FilterSidebar.jsx ← new (stub only)
client/src/pages/BrowsePage.jsx                 ← replace stub
```

---

## 1. `utils/api.js`

**Purpose:** Thin fetch wrappers — the only place in the client that knows the `/api/*` path prefix.

**`fetchCards({ query, type, attribute, levelMin, levelMax, sort, page })`**
- Create a `URLSearchParams` instance.
- Append params conditionally:
  - `q` — only if `query` is truthy
  - `type` — only if truthy
  - `attribute` — only if truthy
  - `levelMin` — only if `levelMin > 1`
  - `levelMax` — only if `levelMax < 12`
  - `sort` — only if truthy
  - `page` — only if truthy
- `fetch('/api/cards?' + params)`
- If `!res.ok` throw `new Error('Failed to fetch cards')`
- Return `res.json()` — shape is `{ cards: [...], total: number }`

**`fetchCardById(id)`**
- `fetch('/api/cards/' + id)`
- If `!res.ok` throw `new Error('Card not found')`
- Return `res.json()` — shape is a single card object

---

## 2. `utils/cardTypeColors.js` — shape fix

**Problem:** The existing implementation returns `{ backgroundColor, color }` from `getTypeBadgeStyles`. The scaffold's `CardTypeBadge` destructures `{ bg, color, label }`. This will silently break — no errors, just transparent badge with no text.

**Fix:** Update `getTypeBadgeStyles` to return `{ bg, color, label }` where:
- `bg` = `var(--card-${key}-light)`
- `color` = `var(--card-${key}-text)`
- `label` = the display string for the type (e.g. `'Normal'`, `'Spell'`, etc.)

Add a label to each entry in `TYPE_KEY_MAP` (or a separate `LABEL_MAP`). Simplest approach: a `LABEL_MAP` keyed by the same short keys:

```
normal  → 'Normal'
effect  → 'Effect'
spell   → 'Spell'
trap    → 'Trap'
fusion  → 'Fusion'
synchro → 'Synchro'
xyz     → 'Xyz'
link    → 'Link'
ritual  → 'Ritual'
```

`getTypeStripeColor` is already correct — no change needed there.

---

## 3. `hooks/useCards.js`

Create the `client/src/hooks/` directory (it does not exist yet).

**`useCards({ query, type, attribute, levelMin, levelMax, sort, page })`**
- Uses `useQuery` from `@tanstack/react-query`
- `queryKey`: `['cards', { query, type, attribute, levelMin, levelMax, sort, page }]` — all params in a single object so any change invalidates correctly
- `queryFn`: calls `fetchCards(...)` with the same params object
- `placeholderData`: `keepPreviousData` (import from `@tanstack/react-query`) — keeps the previous page's cards visible while the next page loads, preventing grid flash

---

## 4. `components/cards/CardTypeBadge.jsx`

**Props:** `{ type }` — the raw API type string (e.g. `'Effect Monster'`)

- Import `getTypeBadgeStyles` from `../../utils/cardTypeColors`
- If `!type`, return `null`
- Destructure `{ bg, color, label }` from `getTypeBadgeStyles(type)`
- Render a `<span>` with inline styles only:
  - `background: bg`, `color`
  - `fontSize: '10px'`, `fontWeight: 500`, `fontFamily: 'var(--font-body)'`
  - `letterSpacing: '0.04em'`, `textTransform: 'uppercase'`
  - `padding: '2px 7px'`, `borderRadius: 'var(--radius-sm)'`
  - `display: 'inline-block'`
- Text content: `{label}`
- **No hex values, no inline color logic** — all color via `getTypeBadgeStyles`

---

## 5. `components/cards/CardTile.jsx`

**Props:** `{ card }` — a single card object from the API

**Structure (top to bottom):**
1. 4px type-color stripe — `<div style={{ height: '4px', background: getTypeStripeColor(card.type), flexShrink: 0 }} />`
2. Card image — `<img src={'https://images.ygoprodeck.com/images/cards_small/' + card.id + '.jpg'} loading="lazy" decoding="async" />`
3. Info block (padding `8px 10px`):
   - Card name — `<p>` with `fontFamily: 'var(--font-display)'`, `fontSize: '12px'`, `lineHeight: 1.3`, `-webkit-line-clamp: 2` (2-line overflow clamp)
   - Bottom row: `<CardTypeBadge type={card.type} />` + ATK/DEF or price
     - Monster cards have `card.atk !== undefined` → show `{card.atk} / {card.def}` in `var(--text-secondary)`
     - Non-monster cards (Spell/Trap) → show TCGPlayer price `$X.XX` in `var(--gold)` if `card.card_prices?.[0]?.tcgplayer_price` exists
     - If neither, render nothing

**Interaction:**
- `<article onClick={() => navigate('/card/' + card.id)}>`
- `cursor: 'pointer'`
- `onMouseEnter` → set `borderColor` to `var(--cyan)`
- `onMouseLeave` → reset `borderColor` to `var(--border)`
- Base border: `0.5px solid var(--border)`, `borderRadius: 'var(--radius-lg)'`
- `transition: 'border-color 0.15s'`

**Image rules:** `loading="lazy"` and `decoding="async"` are mandatory (CLAUDE.md hard rule). `width: '100%'`, `aspectRatio: '0.72'`, `objectFit: 'cover'`.

---

## 6. `components/cards/CardGrid.jsx`

**Props:** `{ cards, isLoading, isError }`

**Render order (exit early):**

1. **Error state** — if `isError`:
   ```
   <p style={{ color: 'var(--red)', ... }}>
     Failed to load cards. Check your connection and try again.
   </p>
   ```

2. **Grid container** — shared `gridStyle`:
   ```
   display: 'grid'
   gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'
   gap: 'var(--card-gap)'
   ```

3. **Loading state** — if `isLoading`: render grid with 24 skeleton `<div>`s:
   - `background: 'var(--bg-surface)'`
   - `borderRadius: 'var(--radius-lg)'`
   - `aspectRatio: '0.72'`
   - `animation: 'pulse 1.4s ease-in-out infinite'`
   - Keys: array index

4. **Empty state** — if `!cards?.length`:
   ```
   <p style={{ color: 'var(--text-secondary)', ... }}>
     No cards found. Try adjusting your filters.
   </p>
   ```

5. **Populated** — render grid with `cards.map(card => <CardTile key={card.id} card={card} />)`

**Skeleton animation:** Append `@keyframes pulse` to `tokens.css` (after the `:root {}` block) — it's already imported globally in `main.jsx`, so no extra imports are needed anywhere:

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
```

Do not define it in a `<style>` tag inside `CardGrid` or in a CSS module.

---

## 7. `components/filters/FilterSidebar.jsx` — stub only

Slice 5 owns the real filter UI. For now, render the sidebar shell with correct dimensions so `BrowsePage` layout works:

```jsx
export default function FilterSidebar({ type, attribute, levelMin, levelMax, onUpdate }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      borderRight: '0.5px solid var(--border)',
      padding: 'var(--section-pad) 16px',
      alignSelf: 'flex-start',
      position: 'sticky',
      top: 'var(--nav-height)',
      minHeight: 'calc(100vh - var(--nav-height))',
    }}>
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        Filters — coming in slice 5
      </p>
    </aside>
  )
}
```

Props are accepted but unused — this avoids BrowsePage having to guard against a missing sidebar.

---

## 8. `pages/BrowsePage.jsx` — replace stub

**URL params read via `useSearchParams`:**

| Param | Default | Type |
|---|---|---|
| `q` | `''` | string |
| `type` | `''` | string |
| `attribute` | `''` | string |
| `levelMin` | `1` | Number |
| `levelMax` | `12` | Number |
| `sort` | `'name'` | string |
| `page` | `1` | Number |

**`updateParam(key, value)`:**
- Creates a new `URLSearchParams` from current params
- If `value` is truthy: `next.set(key, value)`; else `next.delete(key)`
- Always: `next.set('page', '1')` — resets page on every filter change
- Calls `setSearchParams(next)`

**Data fetching:**
- Call `useCards({ query, type, attribute, levelMin, levelMax, sort, page })`
- Destructure `{ data, isLoading, isError }`

**Layout:** flex row, `minHeight: 'calc(100vh - var(--nav-height))'`

- Left: `<FilterSidebar type={type} attribute={attribute} levelMin={levelMin} levelMax={levelMax} onUpdate={updateParam} />`
- Right (`<main style={{ flex: 1, padding: 'var(--section-pad)' }}`):
  - Top bar: flex row with `<SearchBar>` + `<SortControl>`, `marginBottom: '20px'`
    - SearchBar: `value={query}`, `onChange={v => updateParam('q', v)}`
    - SortControl: `value={sort}`, `onChange={v => updateParam('sort', v)}`
  - `<CardGrid cards={data?.cards} isLoading={isLoading} isError={isError} />`
  - Conditional `<Pagination>` — only render if `data` is defined:
    - `page={page}`, `total={data.total}`, `perPage={24}`, `onPageChange={p => updateParam('page', p)}`

**Note:** `SortControl` and `Pagination` are not built yet. Import them as stubs that return `null` from their files, or add them as inline no-ops in `BrowsePage` temporarily. Cleaner: create minimal stubs at `components/sort/SortControl.jsx` and `components/pagination/Pagination.jsx` so `BrowsePage` can import normally.

---

## Stubs needed for BrowsePage imports

Two additional stub components are needed so BrowsePage compiles:

**`components/sort/SortControl.jsx`** — return `null` for now (Slice 6)

**`components/pagination/Pagination.jsx`** — return `null` for now (Slice 6)

---

## Dependency graph

```
api.js
  └── useCards.js
        └── BrowsePage.jsx

cardTypeColors.js (update)
  ├── CardTypeBadge.jsx
  │     └── CardTile.jsx
  │           └── CardGrid.jsx
  │                 └── BrowsePage.jsx
  └── CardTile.jsx

FilterSidebar.jsx (stub)
  └── BrowsePage.jsx

SortControl.jsx (stub)
  └── BrowsePage.jsx

Pagination.jsx (stub)
  └── BrowsePage.jsx
```

Build in this order to avoid import errors:
1. `api.js`
2. `cardTypeColors.js` (fix)
3. `useCards.js`
4. `CardTypeBadge.jsx`
5. `CardTile.jsx`
6. `CardGrid.jsx`
7. `FilterSidebar.jsx` (stub)
8. `SortControl.jsx` (stub)
9. `Pagination.jsx` (stub)
10. `BrowsePage.jsx`

---

## Key constraints from CLAUDE.md

- No hex values in components — colors only via CSS custom properties from `tokens.css`
- Filter state in URL search params — no `useState` for filters
- `/api/*` only — never fetch `ygoprodeck.com` directly from the client
- Card type color logic only in `cardTypeColors.js` — `CardTypeBadge` and `CardTile` import from there, never define colors inline
- `loading="lazy" decoding="async"` on all images — mandatory
- `cards_small/{id}.jpg` in `CardTile` — not the full-size endpoint
- `keepPreviousData` on `useCards` — required

---

## Out of scope for this slice

- Real `FilterSidebar` internals (`TypeFilter`, `AttributeFilter`, `LevelRangeFilter`) — Slice 5
- Working `SortControl` and `Pagination` — Slice 6
- `CardDetailPage` — Slice 7
- `useCardDetail` hook — Slice 7
