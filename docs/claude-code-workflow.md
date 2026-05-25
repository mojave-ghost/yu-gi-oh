# Claude Code Workflow — YGO Card Database
**How to build this project without burning tokens going nowhere**

---

## Before you start — repo setup

Run these once. Claude Code reads this structure automatically.

```
ygo-database/
├── CLAUDE.md                  ← Claude reads this every session
├── docs/
│   ├── design-doc.md          ← Full color tokens, typography, design principles
│   └── react-scaffold.md      ← All component code, hooks, server routes
├── client/
└── server/
```

Copy `design-doc.md`, `react-scaffold.md`, and `CLAUDE.md` into the repo before opening Claude Code. Then initialize the projects:

```bash
# Terminal 1 — client
cd ygo-database/client
npm create vite@latest . -- --template react
npm install react-router-dom @tanstack/react-query use-debounce

# Terminal 2 — server
cd ygo-database/server
npm init -y
npm install express node-cache
```

---

## The four-step process

```
Step 1 — Anchor      Write CLAUDE.md. Done once.
Step 2 — Plan        Claude drafts plan.md. You annotate. Repeat until clean.
Step 3 — Build       One vertical slice per session. Commit after each.
Step 4 — Verify      Claude runs the dev server and checks for errors.
```

Apply Steps 2–4 to every slice below. Never skip Step 2.

---

## Step 1 — Anchor (done)

`CLAUDE.md` is already written. Place it at the repo root.

Every Claude Code session reads it automatically. It contains:
- Hard rules (no hex in components, filters in URL, proxy-only API calls)
- File structure Claude must follow
- Token summary so Claude doesn't have to open `tokens.css` for every decision
- MVP scope so Claude never builds post-MVP features by accident

**You only do Step 1 once.** Update `CLAUDE.md` if a rule changes — don't add rules mid-session in chat.

---

## Step 2 — Plan (repeat before every slice)

Start every new session with a planning prompt, not an implementation prompt.

### Planning prompt template

```
Read CLAUDE.md and docs/react-scaffold.md.

Draft a plan.md for: [SLICE NAME]

Cover:
- Files to create or modify (exact paths)
- Implementation order within this slice
- Any decisions the scaffold doc leaves open

Do not write any code yet.
```

### Annotation cycle

1. Claude writes `plan.md`
2. Open it in your editor
3. Add inline notes wherever something is wrong or unclear:
   ```
   <!-- ✗ don't use useState here — filters go in useSearchParams -->
   <!-- ✓ use cards_small image endpoint in the grid, not cards -->
   ```
4. Send the annotated file back:
   ```
   Address all notes in plan.md. Do not implement yet.
   ```
5. Repeat until the plan has no open questions
6. Then say: **"Implement the plan."**

The guard phrase **"do not implement yet"** is mandatory. Without it, Claude skips the plan and starts coding — burning tokens on wrong assumptions.

---

## Step 3 — Build (one slice per session)

Seven slices. One session each. Commit after every slice before starting the next.

The order matters — each slice depends on the one before it.

---

### Slice 1 — Foundation
**Files:** `client/src/styles/tokens.css` · `client/src/utils/cardTypeColors.js` · `client/index.html`

**Planning prompt:**
```
Read CLAUDE.md and docs/design-doc.md.

Draft plan.md for Slice 1: Foundation.

Cover:
- All CSS custom properties for tokens.css (UI shell + all card type tokens)
- The cardTypeColors.js utility — getTypeStripeColor() and getTypeBadgeStyles()
- The Google Fonts link tag to add to index.html (Cinzel + DM Sans)

Do not write any code yet.
```

**What correct output looks like:**
- `tokens.css` has every `--card-*-bg`, `--card-*-light`, `--card-*-text` token for all 9 card types
- `cardTypeColors.js` exports exactly two functions: `getTypeStripeColor(type)` and `getTypeBadgeStyles(type)`
- No hex values appear anywhere except `tokens.css`

**Commit message:** `feat: add design tokens and card type color utilities`

---

### Slice 2 — Server + API proxy
**Files:** `server/index.js` · `server/routes/cards.js`

**Planning prompt:**
```
Read CLAUDE.md and docs/react-scaffold.md (Server section).

Draft plan.md for Slice 2: Node/Express API proxy.

Cover:
- server/index.js setup (Express, port 3001)
- server/routes/cards.js with three routes:
    GET /api/cards  (q, type, attribute, levelMin, levelMax, sort, page params)
    GET /api/cards/random
    GET /api/cards/:id
- node-cache setup (1hr TTL, cache key = serialized query string)
- sortCards() helper (name, atk, def, level, price)
- Pagination logic: server slices results into pages of 24 — never sends full dataset to client

Do not write any code yet.
```

**What correct output looks like:**
- `GET /api/cards?q=dragon` returns `{ cards: [...24 items], total: number, page: 1, perPage: 24 }`
- `GET /api/cards/random` returns a single card object
- `GET /api/cards/4007` returns a single card object with `card_prices`
- Second identical request hits the cache, not YGOPRODeck

**Test after building:**
```bash
cd server && node index.js
curl "http://localhost:3001/api/cards?q=blue-eyes&page=1"
curl "http://localhost:3001/api/cards/random"
```

**Commit message:** `feat: add Node/Express proxy with node-cache`

---

### Slice 3 — Shell + routing
**Files:** `client/src/main.jsx` · `client/src/App.jsx` · `client/src/components/layout/NavBar.jsx` · `client/src/components/search/SearchBar.jsx` · `client/src/pages/NotFoundPage.jsx`

**Planning prompt:**
```
Read CLAUDE.md and docs/react-scaffold.md (main.jsx, App.jsx, NavBar, SearchBar sections).

Draft plan.md for Slice 3: Shell and routing.

Cover:
- main.jsx: QueryClient config (staleTime 5min, gcTime 30min, retry 2, refetchOnWindowFocus false)
- App.jsx: four routes (/, /browse, /card/:id, *)
- NavBar: sticky, 56px, navy background, Cinzel logo, SearchBar inline, random card button
- SearchBar: controlled input, debounced 300ms, two variants (nav / page)
- NavBar random card button calls GET /api/cards/random then navigates to /card/:id
- All colors from CSS tokens only — no hex in JSX

Do not write any code yet.
```

**What correct output looks like:**
- App loads at `localhost:5173` with a navy nav bar
- Typing in search updates the URL: `/browse?q=dragon`
- Clicking random card navigates to `/card/[some-id]` (404 page is fine for now)
- Browser back button returns to `/browse?q=dragon`

**Commit message:** `feat: add shell, routing, NavBar, SearchBar`

---

### Slice 4 — Card grid
**Files:** `client/src/hooks/useCards.js` · `client/src/utils/api.js` · `client/src/components/cards/CardGrid.jsx` · `client/src/components/cards/CardTile.jsx` · `client/src/components/cards/CardTypeBadge.jsx` · `client/src/pages/BrowsePage.jsx`

**Planning prompt:**
```
Read CLAUDE.md and docs/react-scaffold.md (useCards, api.js, CardGrid, CardTile, CardTypeBadge, BrowsePage sections).

Draft plan.md for Slice 4: Card grid.

Cover:
- api.js: fetchCards() builds URLSearchParams from filter args, fetches /api/cards
- useCards hook: queryKey includes all filter params, uses keepPreviousData
- BrowsePage: reads ALL filter state from useSearchParams (q, type, attribute, levelMin, levelMax, sort, page). updateParam() helper resets page to 1 on any filter change
- CardGrid: CSS Grid auto-fill minmax(160px, 1fr), gap 16px. Shows 24 skeleton tiles while loading
- CardTile: 4px type-color stripe on top, cards_small image, card name in Cinzel, CardTypeBadge, ATK/DEF. Hover changes border to --cyan. Clicking navigates to /card/:id
- CardTypeBadge: calls getTypeBadgeStyles(type) from cardTypeColors.js

Do not write any code yet.
```

**What correct output looks like:**
- `/browse` shows 24 card tiles fetched from the server
- Each tile has the correct color stripe for its card type
- Typing in search updates the grid (with 300ms delay)
- Page stays populated while navigating between pages (no flash)
- Clicking a tile navigates to `/card/[id]`

**Commit message:** `feat: add card grid, tiles, type badges, browse page`

---

### Slice 5 — Filter sidebar
**Files:** `client/src/components/filters/FilterSidebar.jsx` · `client/src/components/filters/TypeFilter.jsx` · `client/src/components/filters/AttributeFilter.jsx` · `client/src/components/filters/LevelRangeFilter.jsx`

**Planning prompt:**
```
Read CLAUDE.md and docs/react-scaffold.md (FilterSidebar and sub-filter sections).

Draft plan.md for Slice 5: Filter sidebar.

Cover:
- FilterSidebar: sticky sidebar 220px wide, borderRight, receives type/attribute/levelMin/levelMax/onUpdate from BrowsePage. Shows "Clear all" button only when a filter is active
- TypeFilter: vertical button list, all 9 types + "All". Active state = navy bg + nav-text color
- AttributeFilter: native <select> for DARK/LIGHT/FIRE/WATER/WIND/EARTH/DIVINE/All
- LevelRangeFilter: two number inputs min=1 max=12, labeled "to"
- Every filter change calls onUpdate(key, value) which calls BrowsePage's updateParam() — resets page to 1 automatically

Do not write any code yet.
```

**What correct output looks like:**
- Selecting "Spell" in TypeFilter updates URL to `/browse?type=Spell+Card` and grid shows only spell cards
- Changing attribute reruns the query
- "Clear all" removes all filter params from the URL
- Sidebar stays in place while scrolling the card grid

**Commit message:** `feat: add filter sidebar (type, attribute, level range)`

---

### Slice 6 — Sort + pagination
**Files:** `client/src/components/sort/SortControl.jsx` · `client/src/components/pagination/Pagination.jsx`

**Planning prompt:**
```
Read CLAUDE.md and docs/react-scaffold.md (SortControl, Pagination sections).

Draft plan.md for Slice 6: Sort control and pagination.

Cover:
- SortControl: native <select> with options: name A-Z, ATK high-low, DEF high-low, level, price. onChange calls updateParam('sort', value) in BrowsePage
- Pagination: shows only when totalPages > 1. Displays "Page N of M · X cards". Prev/Next buttons disabled at boundaries. Calls onPageChange which calls updateParam('page', p)
- Both components already wired into BrowsePage from Slice 4 — confirm the props match

Do not write any code yet.
```

**What correct output looks like:**
- Changing sort order reruns the query and resets to page 1
- Pagination controls appear below the grid
- "Page 1 of 42 · 1,000 cards" format (use `toLocaleString()` on total)
- Navigating pages does not flash the grid (keepPreviousData)

**Commit message:** `feat: add sort control and pagination`

---

### Slice 7 — Card detail page
**Files:** `client/src/hooks/useCardDetail.js` · `client/src/pages/CardDetailPage.jsx`

**Planning prompt:**
```
Read CLAUDE.md and docs/react-scaffold.md (useCardDetail, CardDetailPage sections).

Draft plan.md for Slice 7: Card detail page.

Cover:
- useCardDetail: queryKey ['card', id], enabled: !!id, fetches /api/cards/:id
- CardDetailPage: full-res card image left, card info right. Shows name in Cinzel 22px, CardTypeBadge, ATK/DEF, level/attribute/race, card text, TCG price in --gold, set list (first 5 sets)
- Back button uses navigate(-1) — returns to exact filtered browse state
- Loading state: simple "Loading…" text. Error state: red error message
- Price display: `$XX.XX` format using parseFloat().toFixed(2). Label "TCGPlayer market" in --text-secondary

Do not write any code yet.
```

**What correct output looks like:**
- Clicking any card tile in the grid navigates to `/card/[id]` and shows full card info
- Back button returns to the exact page + filters the user came from
- Price shows in gold if available, hidden if not
- Card image loads at full resolution

**Commit message:** `feat: add card detail page`

---

## Step 4 — Verify (after every slice)

End every implementation prompt with:

```
After implementing, start the dev server with `npm run dev` (client)
and `node index.js` (server). Check the browser console for errors
and confirm the feature works as described. Report what you find.
```

If Claude reports an error, paste the exact error message back and say:
```
Fix this error. Do not change anything outside the files you just created.
```

That constraint prevents Claude from "fixing" an error by rewriting unrelated files.

---

## Session discipline

| Rule | Why |
|---|---|
| One slice per session | Prevents context window from filling mid-feature |
| Commit before next session | Claude reads existing code — committed code is clean |
| Never skip Step 2 | The annotation cycle is what prevents wrong assumptions from compounding |
| Keep chat in CLAUDE.md, not the session | Rules added mid-session in chat disappear next session |
| If a session goes sideways, stop and restart | Sunk tokens aren't a reason to keep going — a bad session makes the next one harder |

---

## Reference — planning prompt skeleton

Copy this at the start of any new session:

```
Read CLAUDE.md and docs/react-scaffold.md.

Draft a plan.md for: [SLICE NAME]

Cover:
- [list the specific files and decisions for this slice]

Do not write any code yet.
```

After annotating:
```
Address all notes in plan.md. Do not implement yet.
```

After the plan is clean:
```
Implement the plan. After implementing, start the dev server
and confirm there are no console errors.
```

---

*Workflow v1.0 — aligned with design-doc v1.2 and react-scaffold v1.0*
*Last updated: May 2026*
