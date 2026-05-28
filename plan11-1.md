# Slice 11.1 — Sets Server Routes

## Goal

Add two server-side API routes that proxy the YGOPRODeck sets endpoints. No client files touched.

---

## Files to create / modify

| File | Action |
|---|---|
| `server/routes/sets.js` | Create |
| `server/index.js` | Mount the new router |

---

## server/routes/sets.js

### Setup

Mirror the top of `cards.js` exactly:

```
const express   = require('express')
const NodeCache = require('node-cache')
const router    = express.Router()
const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'
```

Two cache instances — one per TTL tier:

```
const setsListCache  = new NodeCache({ stdTTL: 86400 })  // 24 hr
const setCardsCache  = new NodeCache({ stdTTL: 3600  })  // 1 hr
```

Why two instances: NodeCache TTL is per-instance, not per-key. Mixing 24hr and 1hr entries in one cache would require manual `ttl` overrides on every `set()` call. Separate instances are simpler and match the pattern precedent in `cards.js`.

---

### GET /api/sets

**Upstream:** `GET https://db.ygoprodeck.com/api/v7/cardsets.php`

**Response shape from upstream:** bare JSON array (no `{ data: [] }` wrapper — unlike `cardinfo.php`).

**Cache key:** `'all_sets'`  
**Cache instance:** `setsListCache` (24hr TTL)

**Logic:**
1. Check `setsListCache.get('all_sets')`.
2. If miss: fetch upstream, check `upstream.ok` (502 on failure), parse JSON as the array directly.
3. Store array in cache, return it unchanged with `res.json(sets)`.

**Error path:** `try/catch` → `res.status(502).json({ error: err.message })` — same pattern as `cards.js`.

---

### GET /api/sets/:setName

**Upstream:** `GET https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset={setName}&tcgplayer_data=true&misc=yes`

**Param handling:** `const setName = decodeURIComponent(req.params.setName)` — URL-encoded set names like `Metal%20Raiders` become `Metal Raiders` for the upstream query.

**Cache key:** `` `set_${setName}` ``  
**Cache instance:** `setCardsCache` (1hr TTL)

**Logic:**
1. Decode param, check `setCardsCache.get(cacheKey)`.
2. If hit: return cached payload immediately.
3. If miss: fetch upstream with `encodeURIComponent(setName)` on the query string (round-trip safety). Check `upstream.ok` (502 on failure). Parse `json.data || []`.
4. Store `{ cards, total: cards.length }` in cache, return it.

**Return shape:** `{ cards: [...], total: N }`

**Error path:** same `try/catch` → 502 pattern.

---

## server/index.js changes

Add two lines after the existing `cardsRoute` require and mount:

```
const setsRoute = require('./routes/sets')
app.use('/api/sets', setsRoute)
```

Order doesn't matter here since `/api/sets` and `/api/cards` share no prefix overlap.

---

## Verification (curl, after server restart)

```bash
# Should return a JSON array starting with '[{'
curl "http://localhost:3001/api/sets" | head -c 500

# Should return { cards: [...], total: N } for Metal Raiders
curl "http://localhost:3001/api/sets/Metal%20Raiders"
```

Both commands must return 200 with non-empty JSON before this slice is considered done.

---

## Constraints

- No client files touched.
- No new npm packages — `node-cache` is already installed.
- Cache keys follow the `cards.js` convention: short, flat strings.
- 502 is the only error status used — matches the existing route contract.
