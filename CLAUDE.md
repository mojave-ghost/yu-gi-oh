# YGO Card Database

Returning TCG players who want to browse cards and check prices.
Full docs: `docs/design-doc.md` · `docs/react-scaffold.md`

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Server state | TanStack Query (`@tanstack/react-query`) |
| Debounce | `use-debounce` |
| Backend | Node + Express |
| Cache | `node-cache` (1hr TTL) |
| Styling | CSS custom properties + inline styles |

---

## Hard rules — never break these

- **No hex values in components.** All colors come from CSS custom properties defined in `client/src/styles/tokens.css`. If a color isn't in tokens.css, add it there first.
- **Filter state lives in URL search params.** Use `useSearchParams` from React Router. No `useState` for filters. This keeps filters shareable and survives refresh.
- **All API calls go through the Node proxy.** Fetch from `/api/*` only. Never call `ygoprodeck.com` directly from the client — CORS will block it.
- **Card type → color mapping lives only in `utils/cardTypeColors.js`.** No inline color logic for card types anywhere else.
- **Images always get `loading="lazy" decoding="async"`.** Grid uses `cards_small/{id}.jpg`. Detail page uses `cards/{id}.jpg`.
- **Search input debounced at 300ms minimum.** Use `useDebouncedCallback` from `use-debounce`.
- **`keepPreviousData` on all paginated queries.** Prevents grid flash between pages.

---

## Project structure

```
ygo-database/
├── CLAUDE.md
├── docs/
│   ├── design-doc.md
│   └── react-scaffold.md
├── client/                        # Vite + React
│   ├── index.html                 # Add Google Fonts link here
│   └── src/
│       ├── main.jsx               # QueryClient + BrowserRouter setup
│       ├── App.jsx                # Route definitions
│       ├── styles/
│       │   └── tokens.css         # Single source of truth for all tokens
│       ├── pages/
│       │   ├── BrowsePage.jsx
│       │   ├── CardDetailPage.jsx
│       │   └── NotFoundPage.jsx
│       ├── components/
│       │   ├── layout/NavBar.jsx
│       │   ├── cards/
│       │   │   ├── CardGrid.jsx
│       │   │   ├── CardTile.jsx
│       │   │   └── CardTypeBadge.jsx
│       │   ├── filters/
│       │   │   ├── FilterSidebar.jsx
│       │   │   ├── TypeFilter.jsx
│       │   │   ├── AttributeFilter.jsx
│       │   │   └── LevelRangeFilter.jsx
│       │   ├── search/SearchBar.jsx
│       │   ├── sort/SortControl.jsx
│       │   └── pagination/Pagination.jsx
│       ├── hooks/
│       │   ├── useCards.js
│       │   └── useCardDetail.js
│       └── utils/
│           ├── cardTypeColors.js
│           └── api.js
└── server/
    ├── index.js
    └── routes/cards.js
```

---

## Design tokens (summary)

Full token list is in `client/src/styles/tokens.css`.

**UI shell:** `--bg-page #fafafa` · `--bg-surface #f0f0f0` · `--border #e0e0e0` · `--text-primary #1c1c1c` · `--text-secondary #6b6b6b` · `--navy #1a3a5c` · `--nav-text #E8D8A0` · `--cyan #4DB8D4` · `--gold #C9A84C`

**Card type stripes + badges:** Each type has three tokens: `-bg` (stripe color), `-light` (badge fill), `-text` (badge text). Types: `normal` `effect` `spell` `trap` `fusion` `synchro` `xyz` `link` `ritual`.

**`--gold` is only for price display.** Not for decoration.

---

## Typography

- **Display / card names:** `font-family: 'Cinzel', serif` — weights 400 and 600 only
- **Everything else:** `font-family: 'DM Sans', sans-serif` — weights 400 and 500 only
- Load both from Google Fonts in `client/index.html`

---

## API proxy routes (server)

| Route | Upstream | Notes |
|---|---|---|
| `GET /api/cards` | `cardinfo.php` | Accepts `q, type, attribute, levelMin, levelMax, sort, page`. Server paginates (24/page). |
| `GET /api/cards/random` | `randomcard.php` | Used by NavBar random button |
| `GET /api/cards/:id` | `cardinfo.php?id=` | Full card + prices |

Cache all upstream responses with `node-cache` at 1hr TTL. Key = serialized query params.

---

## Routes (client)

| Path | Component | Notes |
|---|---|---|
| `/` | redirect → `/browse` | |
| `/browse` | `BrowsePage` | Filter state in URL params |
| `/card/:id` | `CardDetailPage` | `navigate(-1)` for back button |
| `*` | `NotFoundPage` | |

---

## MVP scope — build only this

1. `tokens.css` + `cardTypeColors.js`
2. Node server + `/api/cards` proxy + cache
3. `NavBar` + `SearchBar`
4. `useCards` hook + `CardGrid` + `CardTile` + `CardTypeBadge`
5. `FilterSidebar` (TypeFilter → AttributeFilter → LevelRangeFilter)
6. `Pagination` + `SortControl`
7. `CardDetailPage` + `useCardDetail`

**Post-MVP (do not build yet):** banlist badges, favorites, archetype stats, deck builder.
