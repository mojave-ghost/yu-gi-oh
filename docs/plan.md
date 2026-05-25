# Slice 2 Plan — Server and API Proxy

## Files to create

```
server/index.js
server/routes/cards.js
```

Cache lives inline in `routes/cards.js` — no separate module.

---

## 1. `server/index.js`

Minimal Express entry point.

- `require('express')` and `require('./routes/cards')`
- `app.use(express.json())`
- Mount cards router: `app.use('/api/cards', cardsRoute)`
- `PORT = process.env.PORT || 3001`
- `app.listen(PORT, () => console.log(...))`

No other middleware. Vite dev server handles static files on the client side.

---

## 2. `server/routes/cards.js`

### Cache setup

```js
const cache = new NodeCache({ stdTTL: 3600 })  // 1 hour
```

One shared `NodeCache` instance at module scope, used by all routes.

### Constants

```js
const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'
const PER_PAGE    = 24
```

---

### Route order

Express matches top-to-bottom. `/random` **must** be registered before `/:id`, or the string `"random"` is treated as a card ID.

---

### `GET /` — card list

Accepted client query params: `q, type, attribute, levelMin, levelMax, sort, page`

**Build upstream URLSearchParams:**

| Client param | Upstream param | Condition |
|---|---|---|
| `q` | `fname` | if present |
| `type` | `type` | if present |
| `attribute` | `attribute` | if present |
| `levelMin` / `levelMax` | `level=${levelMin},lte,${levelMax ?? 12}` | only when `levelMin > 1` |
| _(always)_ | `misc=yes` | — |
| _(always)_ | `card_prices=yes` | — |

**Cache key** = `params.toString()` of the upstream URLSearchParams (captures all filters, excludes `sort`/`page` which are applied after caching).

**Flow:**
1. Check `cache.get(cacheKey)`. If hit, use cached array.
2. On miss: `fetch(YGOPRO_BASE/cardinfo.php?${params})`.
3. Non-OK upstream → `502 { error: 'Upstream API error' }`.
4. Extract `json.data || []`, call `cache.set(cacheKey, allCards)`.
5. Apply `sortCards(allCards, sort)`.
6. Paginate:
   ```
   const total   = allCards.length
   const pageNum = Number(page) || 1
   const start   = (pageNum - 1) * PER_PAGE
   const cards   = allCards.slice(start, start + PER_PAGE)
   ```
7. Respond: `{ cards, total, page: pageNum, perPage: PER_PAGE }`

---

### `GET /random`

- Fetch `YGOPRO_BASE/randomcard.php` with no extra params.
- Non-OK → `502 { error: 'Upstream error' }`.
- Forward the card object as-is: `res.json(card)`.
- **No cache.** Caching defeats the purpose of a random endpoint.

---

### `GET /:id`

- Cache key: `` `card_${id}` ``
- Cache hit → `res.json(cached)`.
- Cache miss → fetch `cardinfo.php?id=${id}&card_prices=yes`.
- Non-OK upstream → `404 { error: 'Card not found' }`.
- Extract `json.data?.[0]`; if missing → `404 { error: 'Card not found' }`.
- `cache.set(cacheKey, card)`, then `res.json(card)`.

---

## 3. `sortCards(cards, sort)` helper

Pure function at the bottom of `cards.js`. Not exported. Always returns a new array to avoid mutating the cached result.

| `sort` value | Behavior |
|---|---|
| `'atk'` | Descending by `atk`; nulls last via `?? -1` |
| `'def'` | Descending by `def`; nulls last via `?? -1` |
| `'level'` | Descending by `level`; nulls last via `?? 0` |
| `'price'` | Descending by `card_prices[0].tcgplayer_price` parsed as float, default `0` |
| `'name'` (default) | `a.name.localeCompare(b.name)` ascending |

---

## 4. Error handling

Each route handler body wrapped in `try/catch` to catch network errors (upstream unreachable). The catch block returns `502` with a JSON error object. Without this, an unhandled promise rejection crashes the process.

| Scenario | Status | Body |
|---|---|---|
| Non-OK upstream on `/` | 502 | `{ error: 'Upstream API error' }` |
| Non-OK upstream on `/random` | 502 | `{ error: 'Upstream error' }` |
| Non-OK upstream on `/:id` | 404 | `{ error: 'Card not found' }` |
| `json.data?.[0]` missing on `/:id` | 404 | `{ error: 'Card not found' }` |
| Network/parse exception (any route) | 502 | `{ error: '...' }` |

---

## 5. `card_prices=yes` coverage

All three `cardinfo.php` calls include `card_prices=yes`:
- `GET /` — added to the upstream URLSearchParams before the cache key is built (so price data is always in the cached payload)
- `GET /:id` — appended directly to the fetch URL: `?id=${id}&card_prices=yes`
- `GET /random` — `randomcard.php` returns a full card object with prices by default; no extra param needed

---

## Dependencies

```bash
cd server
npm init -y
npm install express node-cache
```

Uses Node's built-in `fetch` (requires Node ≥ 18). No `node-fetch` needed.
