# Slice 13: Banlist Page — Implementation Plan

## Overview

Add a TCG banlist page that fetches all banned/limited/semi-limited cards
in a single upstream call, categorizes them server-side, and renders them
as three visual sections using inline card tiles with status badges.

---

## Tokens

### `client/src/styles/tokens.css` — add one token

The Forbidden badge needs white text. `#fff` is a hex value and violates
the hard rule. Add before any component touches it:

```css
--white: #fff;
```

Place it in the UI shell block alongside the other shell tokens.

---

## Server

### `server/routes/banlist.js` (new file)

Follows the same structure as `cards.js` and `sets.js`:
`NodeCache`, `YGOPRO_BASE`, one router, try/catch, 502 on upstream error.

**Single cache instance:** `stdTTL: 86400` (24hr — banlist updates infrequently).
Cache key: `'tcg_banlist'`.

**`GET /` → `GET /api/banlist`**

- Build params: `banlist=TCG`, `tcgplayer_data=true`
  (no `misc=yes` needed — `banlist_info` is included with `banlist=TCG`)
- One `fetch` call: `${YGOPRO_BASE}/cardinfo.php?${params}`
- On response: `json.data || []`
- Categorize with a single `.reduce()` (or three `.filter()` passes) by
  `card.banlist_info?.ban_tcg`:
  - `'Banned'`       → `forbidden`
  - `'Limited'`      → `limited`
  - `'Semi-Limited'` → `semiLimited`
- Return `{ forbidden, limited, semiLimited }`
- Cache and return

**Error handling:** same `502 { error: err.message }` pattern as other routes.

### `server/index.js` — mount the new router

```js
const banlistRoute = require('./routes/banlist')
// ...
app.use('/api/banlist', banlistRoute)
```

---

## Client

### `client/src/utils/api.js` — one new function

```js
fetchBanlist()  // GET /api/banlist → { forbidden, limited, semiLimited }
```

Same pattern as `fetchSets`: `fetch`, throw on non-ok, return `res.json()`.

---

### `client/src/hooks/useBanlist.js` (new file)

```js
useQuery({
  queryKey: ['banlist'],
  queryFn:  fetchBanlist,
  staleTime: 24 * 60 * 60 * 1000,  // 24hr — matches server TTL
})
```

---

### `client/src/pages/BanlistPage.jsx` (new file)

**Route:** `/banlist`

#### Top-level structure

```
<main> (maxWidth 860, margin 0 auto, padding var(--section-pad))
  <h1>   TCG Banlist        (Cinzel, 28px, var(--text-primary))
  <p>    May 2026 subtitle  (var(--text-secondary), 14px)
  <BanlistSection> × 3     (Forbidden, Limited, Semi-Limited)
</main>
```

Subtitle computed once at render:
```js
new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
```

#### Status badge color map

Do not scatter color logic in JSX — define a constant at the top of the
file (not in utils, since it is banlist-specific and has no other consumer):

```js
const STATUS_BADGE = {
  forbidden:   { bg: 'var(--red)',  color: 'var(--white)' },
  limited:     { bg: 'var(--gold)', color: 'var(--card-normal-text)' },
  semiLimited: { bg: 'var(--cyan)', color: 'var(--card-link-text)' },
}
```

#### `BanlistSection` — local component (defined in BanlistPage.jsx)

Props: `title` (string), `cards` (array), `statusKey` (one of the three
keys above).

```
<section>
  <h2>  Forbidden (42)   (section header style — see below)
  <div> CSS Grid          (auto-fill, minmax(140px, 1fr), gap 8px)
    <BanlistTile> × n
```

Section header style:
- `fontFamily: 'var(--font-body)'`
- `fontSize: 16`, `fontWeight: 500`
- `color: 'var(--text-primary)'`
- `marginBottom: 12`, `marginTop: 24`
- `borderBottom: '0.5px solid var(--border)'`, `paddingBottom: 8`

#### `BanlistTile` — local component (defined in BanlistPage.jsx)

Props: `card`, `statusKey`.

```
<article>  (onClick → navigate /card/:id)
  <div>    4px top stripe  (getTypeStripeColor(card.type))
  <img>    image_url_small from card_images[0]
           loading="lazy" decoding="async"
  <div>    padding 6px 8px
    <p>    card.name       (Cinzel, 11px, var(--text-primary),
                            2-line clamp)
    <span> status badge    (STATUS_BADGE[statusKey])
```

Tile container style:
- `background: 'var(--bg-surface)'`
- `borderRadius: '0 0 var(--radius-md) var(--radius-md)'`
- `overflow: 'hidden'`
- `cursor: 'pointer'`
- `border: '0.5px solid var(--border)'`
- Hover: `onMouseEnter`/`onMouseLeave` toggling `borderColor`
  `var(--cyan)` ↔ `var(--border)` (same pattern as `CardTile`)

Image: `width: '100%'`, `display: 'block'`, `aspectRatio: '0.72'`,
`objectFit: 'cover'` — same as `CardTile`.

Name style:
- `fontFamily: 'var(--font-display)'`, `fontSize: 11`
- `color: 'var(--text-primary)'`
- `margin: 0`, `lineHeight: 1.3`
- Two-line clamp:
  ```js
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  ```

Badge style:
- `fontSize: 9`, `fontWeight: 500`, `fontFamily: 'var(--font-body)'`
- `padding: '2px 5px'`, `borderRadius: 'var(--radius-sm)'`
- `textTransform: 'uppercase'`, `letterSpacing: '0.04em'`
- `whiteSpace: 'nowrap'`, `display: 'inline-block'`, `marginTop: 4`
- `background` and `color` from `STATUS_BADGE[statusKey]`

Badge label strings: `'Forbidden'`, `'Limited'`, `'Semi-Limited'`
(define as a constant alongside `STATUS_BADGE`).

#### Loading / error states

```jsx
if (isLoading) return <p style={{ padding: 'var(--section-pad)', color: 'var(--text-secondary)' }}>Loading banlist…</p>
if (isError)   return <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>Failed to load banlist.</p>
```

---

### `client/src/App.jsx` — one new route

```jsx
import BanlistPage from './pages/BanlistPage'
// ...
<Route path="/banlist" element={<BanlistPage />} />
```

Place before the `*` catch-all, consistent with the existing route order.

---

## No-hex checklist

- Forbidden badge text: `var(--white)` — requires the token addition above.
  Do NOT use `#fff` directly in JSX.
- All other badge and tile colors: existing tokens only.
- No `#xxxxxx` or `rgb(…)` literals anywhere in `BanlistPage.jsx`.

---

## File checklist

| File | Action |
|---|---|
| `client/src/styles/tokens.css` | Edit — add `--white: #fff` |
| `server/routes/banlist.js` | Create |
| `server/index.js` | Edit — one `require` + one `app.use` line |
| `client/src/utils/api.js` | Edit — add `fetchBanlist` |
| `client/src/hooks/useBanlist.js` | Create |
| `client/src/pages/BanlistPage.jsx` | Create |
| `client/src/App.jsx` | Edit — one import + one route |

Total: 3 new files, 4 edits.

---

## Key decisions and rationale

**Single upstream fetch, not Promise.all.** The YGOProDeck `banlist=TCG`
param returns all three restriction levels in one response. Splitting into
three parallel calls would hit the same upstream endpoint three times
unnecessarily. One fetch, server-side `.filter()` for categorization.

**`BanlistTile` stays in `BanlistPage.jsx`.** It has one consumer and
meaningfully differs from `CardTile` (different border radius, status badge
instead of type badge, smaller font). A separate file would be premature
abstraction.

**`STATUS_BADGE` constant in `BanlistPage.jsx`, not in `cardTypeColors.js`.**
`cardTypeColors.js` is the single source of truth for card-type color mapping.
Status restriction colors are a different concern and belong with the component
that uses them.

**No `useSearchParams` or filter state.** The banlist is a static, authoritative
list — there is no browsing intent that benefits from shareable URL state.
The only user action is clicking through to a card detail page.
