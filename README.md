# Yu-Gi-Oh DB

A card browsing and pricing database for returning Yu-Gi-Oh TCG players. Search the full card catalog, filter by type and attribute, and check TCGPlayer market prices — all in one place.

Built with React + Node. Powered by the [YGOPRODeck API](https://ygoprodeck.com/api-guide/).

---

## Features

- **Browse 12,000+ cards** — full TCG catalog with card art
- **Real-time search** — results update as you type, debounced at 300ms
- **Filter by type** — Normal, Effect, Fusion, Synchro, Xyz, Link, Ritual, Spell, Trap
- **Filter by attribute** — DARK, LIGHT, FIRE, WATER, WIND, EARTH, DIVINE
- **Filter by level / rank** — range inputs from 1 to 12
- **Sort** — by name, ATK, DEF, level, or price
- **TCGPlayer pricing** — market price on every card tile and detail page
- **Card detail view** — full card art, description, set list, and price
- **Random card** — discover something new
- **URL-driven state** — filters and search are in the URL, so links are shareable and the back button always works

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Server state | TanStack Query (React Query v5) |
| Debounce | use-debounce |
| Backend | Node.js + Express |
| Cache | node-cache (1hr TTL) |
| API | YGOPRODeck REST API |

---

## Design

**Theme:** City Streets — Battle City arc color palette extracted from the original anime and manga. Navy from the Duelist Kingdom fortress, Millennium gold from the Puzzle, arena cyan from the platform glow.

**Typography:** Cinzel (card names, headers) + DM Sans (UI, labels, stats).

**Principle:** *"How it works is more important than how it looks."* — Tracy Osborn. Color is reserved for data, not decoration. Card type colors match the physical TCG card frames exactly.

---

## Getting started

### Prerequisites

- Node.js v18 or higher
- npm

### Install

```bash
# Clone the repo
git clone https://github.com/yourusername/ygo-database.git
cd ygo-database

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Run locally

You need two terminals running simultaneously.

**Terminal 1 — start the API server:**
```bash
cd server
node index.js
# Server running on :3001
```

**Terminal 2 — start the React dev server:**
```bash
cd client
npm run dev
# Local: http://localhost:5173
```

Open `http://localhost:5173` in your browser.

> **Note:** The first page load takes 3–4 seconds while the server fetches and caches the card catalog from YGOPRODeck. Subsequent searches and filter changes are instant.

---

## Project structure

```
ygo-database/
├── client/                          # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── cards/               # CardGrid, CardTile, CardTypeBadge
│       │   ├── filters/             # FilterSidebar, TypeFilter, AttributeFilter, LevelRangeFilter
│       │   ├── layout/              # NavBar
│       │   ├── pagination/          # Pagination
│       │   └── search/              # SearchBar
│       │   └── sort/                # SortControl
│       ├── hooks/                   # useCards, useCardDetail
│       ├── pages/                   # BrowsePage, CardDetailPage, NotFoundPage
│       ├── styles/                  # tokens.css (design tokens)
│       └── utils/                   # api.js, cardTypeColors.js
└── server/                          # Node/Express backend
    ├── index.js
    └── routes/
        └── cards.js                 # Proxy + cache + sort + pagination
```

---

## API proxy

The Node server proxies all requests to YGOPRODeck to avoid CORS issues and caches responses for 1 hour. The client never calls YGOPRODeck directly.

| Route | Description |
|---|---|
| `GET /api/cards` | Card list with filter, sort, and pagination |
| `GET /api/cards/random` | Single random card |
| `GET /api/cards/:id` | Single card by ID |

---

## Roadmap

- [ ] Banlist status (Forbidden / Limited / Semi-Limited badges and filter)
- [ ] Favorites / personal collection
- [ ] Archetype stats page
- [ ] Redis caching for production
- [ ] Deployment

---

## Credits

Card data and images provided by [YGOPRODeck](https://ygoprodeck.com). Yu-Gi-Oh is a trademark of Kazuki Takahashi and Konami. This project is unofficial and not affiliated with Konami.
