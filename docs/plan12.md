# Slice 12: Archetype Browser — Implementation Plan

## Overview

Add a browsable archetype directory: a full list page with client-side
search and alphabetical grouping, and a detail page that reuses the
existing card grid components.

---

## Server

### `server/routes/archetypes.js` (new file)

Mirror the structure of `server/routes/sets.js` exactly.

- Two `NodeCache` instances at the top:
  - `archetypesListCache` — `stdTTL: 86400` (24hr, matches sets list pattern)
  - `archetypeCardsCache` — `stdTTL: 3600` (1hr, matches set cards pattern)
- `YGOPRO_BASE` constant (same value as in sets.js)

**`GET /` → `GET /api/archetypes`**
- Cache key: `'all_archetypes'`
- Upstream: `GET https://db.ygoprodeck.com/api/v7/archetypes.php`
- Response: bare array of `{ archetype_name }` objects
- Cache hit → return immediately; miss → fetch, set, return
- Errors: `502` with `{ error: err.message }`

**`GET /:name` → `GET /api/archetypes/:name`**
- `decodeURIComponent(req.params.name)` before use (same pattern as sets.js `:setName`)
- Cache key: `` `archetype_${name}` ``
- Upstream: `cardinfo.php` with params `archetype`, `tcgplayer_data=true`, `misc=yes`
  (same URLSearchParams construction as sets.js, different param name)
- Shape response as `{ cards: json.data || [], total: cards.length }`
- Errors: `502` with `{ error: err.message }`

### `server/index.js` — mount the new router

Add one line alongside the existing sets mount:

```js
app.use('/api/archetypes', require('./routes/archetypes'))
```

---

## Client

### `client/src/utils/api.js` — two new functions

```js
fetchArchetypes()           // GET /api/archetypes
fetchCardsByArchetype(name) // GET /api/archetypes/${encodeURIComponent(name)}
```

Follow the existing fetch helpers in api.js: throw on non-ok, return `res.json()`.

---

### `client/src/hooks/useArchetypes.js` (new file)

```js
useQuery({
  queryKey: ['archetypes'],
  queryFn: fetchArchetypes,
  staleTime: 24 * 60 * 60 * 1000,   // 24hr — matches server TTL
})
```

---

### `client/src/hooks/useArchetypeCards.js` (new file)

```js
useQuery({
  queryKey: ['archetype', name],
  queryFn: () => fetchCardsByArchetype(name),
  enabled: !!name,
  staleTime: 60 * 60 * 1000,         // 1hr — matches server TTL
})
```

No `keepPreviousData` needed (single-archetype fetch, not paginated).

---

### `client/src/pages/ArchetypesPage.jsx` (new file)

**Route:** `/archetypes`

**Layout:**
- Page title `'Archetypes'` — `fontFamily: 'Cinzel, serif'`, `fontSize: 28`
- Search input below title: local `useState` (client-side filter only,
  not a URL param — the archetype name is the param on the detail route,
  and the list filter is ephemeral UI state)
- Alphabetical grouped list

**Data flow:**
- `useArchetypes()` → `{ data, isLoading, isError }`
- Filter `data` client-side by `archetype_name.toLowerCase().includes(search.toLowerCase())`
- Group filtered results by `archetype_name[0].toUpperCase()` into a Map keyed A–Z

**Rendering:**
- Loading state: text `'Loading…'`
- Error state: text `'Failed to load archetypes.'`
- For each letter group: sticky letter header, then the archetype rows

**Letter header style:**
- `fontFamily: 'Cinzel, serif'`
- `fontSize: 12`, `fontWeight: 600`
- `color: var(--text-secondary)`
- `padding: '4px 0'`
- `position: 'sticky'`, `top: 0`
- `backgroundColor: var(--bg-page)` (covers scrolled rows beneath it)
- `borderBottom: '1px solid var(--border)'`
- `letterSpacing: 1`

**Row style:**
- `color: var(--text-primary)`, `fontSize: 14`
- `padding: '8px 0'`
- `borderBottom: '0.5px solid var(--border)'`
- `cursor: 'pointer'`
- Hover: `backgroundColor: var(--bg-surface)` via `onMouseEnter`/`onMouseLeave`
  toggling a local hover state on the row (no hex values either way)

**Navigation:** `navigate(\`/archetypes/${encodeURIComponent(archetype_name)}\`)`

---

### `client/src/pages/ArchetypeDetailPage.jsx` (new file)

**Route:** `/archetypes/:name`

**Data flow:**
- Read `name` from `useParams()`
- `decodeURIComponent(name)` for display text; pass raw `name` to the hook
  (the hook's fetch function runs `encodeURIComponent` internally)
- `useArchetypeCards(name)` → `{ data, isLoading, isError }`

**Layout (top to bottom):**
1. Back button — `navigate(-1)`, same style pattern as `CardDetailPage`
2. Page title: decoded `name` — `fontFamily: 'Cinzel, serif'`
3. Subtitle: `'{data.total} cards'` — `color: var(--text-secondary)`
4. `<CardGrid cards={data.cards} />` — reuse existing component unchanged
5. Loading state: text `'Loading…'`
6. Error state: text `'Failed to load archetype cards.'`

No new price or filter logic needed — `CardGrid` and `CardTile` handle rendering.

---

### `client/src/App.jsx` — two new routes

```jsx
<Route path="/archetypes"       element={<ArchetypesPage />} />
<Route path="/archetypes/:name" element={<ArchetypeDetailPage />} />
```

Follow the same import style already used in App.jsx (lazy or static).

---

## No-hex checklist

Every color reference in both new page files must use a CSS custom property:
- `var(--bg-page)`, `var(--bg-surface)`, `var(--border)`,
  `var(--text-primary)`, `var(--text-secondary)`

No `#xxxxxx` or `rgb(…)` literals anywhere in JSX.

---

## File checklist

| File | Action |
|---|---|
| `server/routes/archetypes.js` | Create |
| `server/index.js` | Edit — one `app.use` line |
| `client/src/utils/api.js` | Edit — 2 new fetch functions |
| `client/src/hooks/useArchetypes.js` | Create |
| `client/src/hooks/useArchetypeCards.js` | Create |
| `client/src/pages/ArchetypesPage.jsx` | Create |
| `client/src/pages/ArchetypeDetailPage.jsx` | Create |
| `client/src/App.jsx` | Edit — 2 new routes |

Total: 5 new files, 3 edits.
