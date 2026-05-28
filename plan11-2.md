# Slice 11.2 — API Utils and Hooks

## Goal

Add two fetch functions to `api.js` and create two new hook files. No server, page, or route changes.

---

## Files to create / modify

| File | Action |
|---|---|
| `client/src/utils/api.js` | Add two exported functions |
| `client/src/hooks/useSets.js` | Create |
| `client/src/hooks/useSetCards.js` | Create |

---

## client/src/utils/api.js

Append after `fetchCardById`. No changes to existing functions.

**`fetchSets()`**

```
export async function fetchSets() {
  const res = await fetch(`${BASE}/sets`)
  if (!res.ok) throw new Error('Failed to fetch sets')
  return res.json()
}
```

- No params — hits `GET /api/sets` directly.
- Upstream returns a bare array; `res.json()` gives callers that array unchanged.
- Error pattern matches existing functions: `if (!res.ok) throw new Error(...)`.

**`fetchCardsBySet(setName)`**

```
export async function fetchCardsBySet(setName) {
  const res = await fetch(`${BASE}/sets/${encodeURIComponent(setName)}`)
  if (!res.ok) throw new Error('Failed to fetch set cards')
  return res.json()
}
```

- `encodeURIComponent(setName)` handles spaces and special characters in set names (e.g. `Metal Raiders` → `Metal%20Raiders`).
- Returns `{ cards, total }` — whatever the server sends back.

---

## client/src/hooks/useSets.js

```
import { useQuery } from '@tanstack/react-query'
import { fetchSets } from '../utils/api'

export function useSets() {
  return useQuery({
    queryKey: ['sets'],
    queryFn:  fetchSets,
    staleTime: 24 * 60 * 60 * 1000,
  })
}
```

- `queryFn: fetchSets` — function reference, not an arrow wrapper, since there are no arguments.
- `staleTime: 24 * 60 * 60 * 1000` (86,400,000 ms) — matches the server's 24hr cache TTL so the client won't re-fetch a fresh response.
- No `placeholderData` — this is not a paginated query; there is no previous page to flash.
- No `keepPreviousData` import needed.

---

## client/src/hooks/useSetCards.js

```
import { useQuery } from '@tanstack/react-query'
import { fetchCardsBySet } from '../utils/api'

export function useSetCards(setName) {
  return useQuery({
    queryKey: ['set', setName],
    queryFn:  () => fetchCardsBySet(setName),
    enabled:  !!setName,
    staleTime: 60 * 60 * 1000,
  })
}
```

- `queryKey: ['set', setName]` — two-element key so different set names get separate cache entries.
- `queryFn` is an arrow wrapper (not a bare reference) because `setName` must be captured at call time.
- `enabled: !!setName` — suppresses the query when no set name is present, preventing a fetch to `/api/sets/undefined`.
- `staleTime: 60 * 60 * 1000` (3,600,000 ms) — matches the server's 1hr cache TTL.
- No `placeholderData` — not paginated.

---

## Constraints

- No server files touched.
- No page or route files touched.
- `keepPreviousData` is not imported in either hook — it only applies to paginated queries as in `useCards.js`.
- Both hooks import only from `@tanstack/react-query` and `../utils/api`.
