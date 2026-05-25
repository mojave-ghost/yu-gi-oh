# YGO Card Database — React Component Scaffold
**Document v1.0**
React + React Router v6 + TanStack Query · Node/Express backend proxy

---

## Stack decisions

| Concern | Tool | Reason |
|---|---|---|
| Routing | React Router v6 | URL-driven state for search + filters; shareable links |
| Server state | TanStack Query (React Query) | Caching, deduplication, loading/error states for API calls |
| Global UI state | Zustand | Lightweight — only for filter sidebar open/close and sort preference |
| Styling | CSS Modules + design tokens | Scoped styles, no runtime overhead, tokens from design doc |
| Images | Native `<img>` + lazy loading | `loading="lazy"` + `decoding="async"` — no extra library needed |
| Debounce | `use-debounce` | 300ms delay on search input before firing API call |

---

## Project structure

```
ygo-database/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── main.jsx                 # App entry, router setup
│   │   ├── App.jsx                  # Root layout, route definitions
│   │   │
│   │   ├── styles/
│   │   │   └── tokens.css           # CSS custom properties (design tokens)
│   │   │
│   │   ├── pages/
│   │   │   ├── BrowsePage.jsx       # /browse — main card grid
│   │   │   ├── CardDetailPage.jsx   # /card/:id — full card detail
│   │   │   └── NotFoundPage.jsx     # 404
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── NavBar.jsx
│   │   │   │   └── NavBar.module.css
│   │   │   │
│   │   │   ├── cards/
│   │   │   │   ├── CardGrid.jsx
│   │   │   │   ├── CardGrid.module.css
│   │   │   │   ├── CardTile.jsx
│   │   │   │   ├── CardTile.module.css
│   │   │   │   ├── CardTypeBadge.jsx
│   │   │   │   └── CardTypeBadge.module.css
│   │   │   │
│   │   │   ├── filters/
│   │   │   │   ├── FilterSidebar.jsx
│   │   │   │   ├── FilterSidebar.module.css
│   │   │   │   ├── TypeFilter.jsx
│   │   │   │   ├── AttributeFilter.jsx
│   │   │   │   └── LevelRangeFilter.jsx
│   │   │   │
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── SearchBar.module.css
│   │   │   │
│   │   │   ├── sort/
│   │   │   │   └── SortControl.jsx
│   │   │   │
│   │   │   └── pagination/
│   │   │       ├── Pagination.jsx
│   │   │       └── Pagination.module.css
│   │   │
│   │   ├── hooks/
│   │   │   ├── useCards.js          # TanStack Query wrapper for card list
│   │   │   ├── useCardDetail.js     # TanStack Query wrapper for single card
│   │   │   └── useFilterParams.js   # URL search params ↔ filter state sync
│   │   │
│   │   └── utils/
│   │       ├── cardTypeColors.js    # Maps card type string → CSS token names
│   │       └── api.js               # Fetch helpers pointing at Node proxy
│   │
└── server/                          # Node/Express backend
    ├── index.js                     # Entry point
    ├── routes/
    │   └── cards.js                 # Proxy routes to YGOPRODeck API
    └── cache/
        └── nodeCache.js             # In-memory cache (node-cache, 1hr TTL)
```

---

## Design tokens — `tokens.css`

Single source of truth. Import in `main.jsx` before anything else.

```css
/* src/styles/tokens.css */

:root {
  /* UI shell — City Streets theme */
  --bg-page:          #fafafa;
  --bg-surface:       #f0f0f0;
  --border:           #e0e0e0;
  --text-primary:     #1c1c1c;
  --text-secondary:   #6b6b6b;
  --navy:             #1a3a5c;
  --nav-text:         #E8D8A0;
  --cyan:             #4DB8D4;
  --gold:             #C9A84C;
  --red:              #B33020;

  /* Card type — frame colors (stripe) */
  --card-normal-bg:   #D4A84B;
  --card-effect-bg:   #C87B2A;
  --card-spell-bg:    #1A8A6E;
  --card-trap-bg:     #9B2C6E;
  --card-fusion-bg:   #6B4A9B;
  --card-synchro-bg:  #C8C8C8;
  --card-xyz-bg:      #1c1c1c;
  --card-link-bg:     #1A4A8A;
  --card-ritual-bg:   #1A3A8A;

  /* Card type — badge fills (light variant) */
  --card-normal-light:  #F5DFA0;
  --card-normal-text:   #5C3A00;
  --card-effect-light:  #F0C890;
  --card-effect-text:   #5C3A00;
  --card-spell-light:   #C8EDE5;
  --card-spell-text:    #0A3D2E;
  --card-trap-light:    #F0C8DE;
  --card-trap-text:     #4A0A2E;
  --card-fusion-light:  #E0D0F5;
  --card-fusion-text:   #2A1A50;
  --card-synchro-light: #F5F5F5;
  --card-synchro-text:  #2e2e2e;
  --card-xyz-light:     #3a3a3a;
  --card-xyz-text:      #e0e0e0;
  --card-link-light:    #C0D8F5;
  --card-link-text:     #0A1E40;
  --card-ritual-light:  #C0CFF5;
  --card-ritual-text:   #0A1440;

  /* Typography */
  --font-display: 'Cinzel', serif;
  --font-body:    'DM Sans', sans-serif;

  /* Layout */
  --nav-height:         56px;
  --sidebar-width:      220px;
  --detail-width:       320px;
  --card-gap:           16px;
  --section-pad:        24px;
  --radius-sm:          4px;
  --radius-md:          8px;
  --radius-lg:          12px;
}
```

---

## Routing — `main.jsx` + `App.jsx`

### `main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/tokens.css'

// Google Fonts loaded here — Cinzel + DM Sans
// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Cinzel&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        1000 * 60 * 5,   // 5 min — cards don't change often
      gcTime:           1000 * 60 * 30,  // 30 min cache retention
      retry:            2,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

### `App.jsx`
```jsx
import { Routes, Route } from 'react-router-dom'
import NavBar      from './components/layout/NavBar'
import BrowsePage  from './pages/BrowsePage'
import CardDetailPage from './pages/CardDetailPage'
import NotFoundPage   from './pages/NotFoundPage'

export default function App() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--bg-page)', minHeight: '100vh' }}>
      <NavBar />
      <Routes>
        <Route path="/"         element={<BrowsePage />} />
        <Route path="/browse"   element={<BrowsePage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="*"         element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
```

---

## Pages

### `BrowsePage.jsx`
The main view. Reads filter state from URL search params so that filters are
shareable and survive a page refresh.

```jsx
import { useSearchParams } from 'react-router-dom'
import FilterSidebar from '../components/filters/FilterSidebar'
import SearchBar     from '../components/search/SearchBar'
import SortControl   from '../components/sort/SortControl'
import CardGrid      from '../components/cards/CardGrid'
import Pagination    from '../components/pagination/Pagination'
import { useCards }  from '../hooks/useCards'

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // All filter state lives in the URL — no separate useState needed
  const query     = searchParams.get('q')        || ''
  const type      = searchParams.get('type')     || ''
  const attribute = searchParams.get('attribute')|| ''
  const levelMin  = Number(searchParams.get('levelMin') || 1)
  const levelMax  = Number(searchParams.get('levelMax') || 12)
  const sort      = searchParams.get('sort')     || 'name'
  const page      = Number(searchParams.get('page') || 1)

  const { data, isLoading, isError } = useCards({
    query, type, attribute, levelMin, levelMax, sort, page,
  })

  function updateParam(key, value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '1') // reset to page 1 on any filter change
      return next
    })
  }

  return (
    <div style={{ display: 'flex', gap: '0', minHeight: `calc(100vh - var(--nav-height))` }}>
      <FilterSidebar
        type={type}
        attribute={attribute}
        levelMin={levelMin}
        levelMax={levelMax}
        onUpdate={updateParam}
      />

      <main style={{ flex: 1, padding: 'var(--section-pad)' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
          <SearchBar value={query} onChange={v => updateParam('q', v)} />
          <SortControl value={sort} onChange={v => updateParam('sort', v)} />
        </div>

        <CardGrid cards={data?.cards} isLoading={isLoading} isError={isError} />

        {data && (
          <Pagination
            page={page}
            total={data.total}
            perPage={24}
            onPageChange={p => updateParam('page', p)}
          />
        )}
      </main>
    </div>
  )
}
```

### `CardDetailPage.jsx`
Loaded when a user clicks a card tile. Full card info — text, sets, price.
Uses `useNavigate(-1)` to go back to the exact filtered browse state.

```jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useCardDetail } from '../hooks/useCardDetail'
import CardTypeBadge     from '../components/cards/CardTypeBadge'

export default function CardDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { data: card, isLoading, isError } = useCardDetail(id)

  if (isLoading) return <p style={{ padding: '2rem', fontFamily: 'var(--font-body)' }}>Loading…</p>
  if (isError)   return <p style={{ padding: '2rem', color: 'var(--red)' }}>Card not found.</p>

  const price = card.card_prices?.[0]?.tcgplayer_price

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'var(--section-pad)' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
        ← Back
      </button>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <img
          src={`https://images.ygoprodeck.com/images/cards/${card.id}.jpg`}
          alt={card.name}
          width={220}
          style={{ borderRadius: 'var(--radius-md)', flexShrink: 0 }}
          loading="lazy"
          decoding="async"
        />

        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '8px' }}>
            {card.name}
          </h1>

          <CardTypeBadge type={card.type} />

          {card.atk !== undefined && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--text-secondary)' }}>
              ATK&nbsp;<strong>{card.atk}</strong> / DEF&nbsp;<strong>{card.def}</strong>
            </p>
          )}

          {card.level && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Level {card.level} · {card.attribute} · {card.race}
            </p>
          )}

          <p style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.7', color: 'var(--text-primary)' }}>
            {card.desc}
          </p>

          {price && (
            <p style={{ marginTop: '16px', fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: 500, color: 'var(--gold)' }}>
              ${parseFloat(price).toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>TCGPlayer market</span>
            </p>
          )}

          {card.card_sets && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>Sets</p>
              {card.card_sets.slice(0, 5).map(s => (
                <p key={s.set_code} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {s.set_name} · {s.set_code} · {s.set_rarity}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Components

### `NavBar.jsx`
```jsx
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from '../search/SearchBar'
import { useSearchParams } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  function handleSearch(value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set('q', value)
      else next.delete('q')
      next.set('page', '1')
      return next
    })
  }

  async function handleRandom() {
    const res  = await fetch('/api/cards/random')
    const data = await res.json()
    navigate(`/card/${data.id}`)
  }

  return (
    <nav style={{
      height: 'var(--nav-height)',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--section-pad)',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/browse" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        color: 'var(--nav-text)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        YGO Database
      </Link>

      <div style={{ flex: 1, maxWidth: '480px' }}>
        <SearchBar
          value={searchParams.get('q') || ''}
          onChange={handleSearch}
          variant="nav"
        />
      </div>

      <button
        onClick={handleRandom}
        title="Random card"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--nav-text)',
          background: 'transparent',
          border: '1px solid rgba(232,216,160,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Random card
      </button>
    </nav>
  )
}
```

### `CardTile.jsx`
```jsx
import { useNavigate } from 'react-router-dom'
import CardTypeBadge from './CardTypeBadge'
import { getTypeStripeColor } from '../../utils/cardTypeColors'

export default function CardTile({ card }) {
  const navigate = useNavigate()
  const price    = card.card_prices?.[0]?.tcgplayer_price
  const stripeColor = getTypeStripeColor(card.type)

  return (
    <article
      onClick={() => navigate(`/card/${card.id}`)}
      style={{
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Type color stripe — visual shorthand before reading badge */}
      <div style={{ height: '4px', background: stripeColor, flexShrink: 0 }} />

      <img
        src={`https://images.ygoprodeck.com/images/cards_small/${card.id}.jpg`}
        alt={card.name}
        style={{ width: '100%', display: 'block', aspectRatio: '0.72', objectFit: 'cover' }}
        loading="lazy"
        decoding="async"
      />

      <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          lineHeight: '1.3',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {card.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <CardTypeBadge type={card.type} />

          {card.atk !== undefined ? (
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              {card.atk} / {card.def}
            </span>
          ) : price ? (
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gold)' }}>
              ${parseFloat(price).toFixed(2)}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
```

### `CardTypeBadge.jsx`
```jsx
import { getTypeBadgeStyles } from '../../utils/cardTypeColors'

export default function CardTypeBadge({ type }) {
  if (!type) return null
  const { bg, color, label } = getTypeBadgeStyles(type)

  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px',
      fontWeight: 500,
      fontFamily: 'var(--font-body)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      padding: '2px 7px',
      borderRadius: 'var(--radius-sm)',
      background: bg,
      color,
    }}>
      {label}
    </span>
  )
}
```

### `CardGrid.jsx`
```jsx
import CardTile from './CardTile'

const SKELETON_COUNT = 24

export default function CardGrid({ cards, isLoading, isError }) {
  if (isError) {
    return (
      <p style={{ color: 'var(--red)', fontFamily: 'var(--font-body)', padding: '2rem 0' }}>
        Failed to load cards. Check your connection and try again.
      </p>
    )
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 'var(--card-gap)',
  }

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            aspectRatio: '0.72',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
        ))}
      </div>
    )
  }

  if (!cards?.length) {
    return (
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', padding: '2rem 0' }}>
        No cards found. Try adjusting your filters.
      </p>
    )
  }

  return (
    <div style={gridStyle}>
      {cards.map(card => <CardTile key={card.id} card={card} />)}
    </div>
  )
}
```

### `SearchBar.jsx`
Debounced at 300ms — fires the URL update only after the user pauses typing.

```jsx
import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchBar({ value, onChange, variant = 'page' }) {
  const [local, setLocal] = useState(value)

  // Sync if URL param changes externally (e.g. browser back/forward)
  useEffect(() => { setLocal(value) }, [value])

  const debouncedOnChange = useDebouncedCallback(onChange, 300)

  function handleChange(e) {
    setLocal(e.target.value)
    debouncedOnChange(e.target.value)
  }

  const isNav = variant === 'nav'

  return (
    <input
      type="search"
      placeholder="Search cards…"
      value={local}
      onChange={handleChange}
      aria-label="Search cards"
      style={{
        width: '100%',
        height: isNav ? '36px' : '40px',
        padding: '0 12px',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        background: isNav ? 'rgba(255,255,255,0.08)' : 'var(--bg-surface)',
        border: isNav ? '1px solid rgba(232,216,160,0.2)' : '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: isNav ? 'var(--nav-text)' : 'var(--text-primary)',
        outline: 'none',
      }}
    />
  )
}
```

### `FilterSidebar.jsx`
```jsx
import TypeFilter      from './TypeFilter'
import AttributeFilter from './AttributeFilter'
import LevelRangeFilter from './LevelRangeFilter'

export default function FilterSidebar({ type, attribute, levelMin, levelMax, onUpdate }) {
  function clearAll() {
    onUpdate('type', '')
    onUpdate('attribute', '')
    onUpdate('levelMin', '')
    onUpdate('levelMax', '')
  }

  const hasFilters = type || attribute || levelMin > 1 || levelMax < 12

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      borderRight: '0.5px solid var(--border)',
      padding: 'var(--section-pad) 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignSelf: 'flex-start',
      position: 'sticky',
      top: 'var(--nav-height)',
      maxHeight: 'calc(100vh - var(--nav-height))',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Filters</p>
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{ fontSize: '11px', color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear all
          </button>
        )}
      </div>

      <TypeFilter      value={type}      onChange={v => onUpdate('type', v)} />
      <AttributeFilter value={attribute} onChange={v => onUpdate('attribute', v)} />
      <LevelRangeFilter
        min={levelMin} max={levelMax}
        onMinChange={v => onUpdate('levelMin', v)}
        onMaxChange={v => onUpdate('levelMax', v)}
      />
    </aside>
  )
}
```

### `TypeFilter.jsx`
```jsx
const TYPES = [
  { value: '',              label: 'All' },
  { value: 'Normal Monster', label: 'Normal' },
  { value: 'Effect Monster', label: 'Effect' },
  { value: 'Fusion Monster', label: 'Fusion' },
  { value: 'Synchro Monster', label: 'Synchro' },
  { value: 'Xyz Monster',    label: 'Xyz' },
  { value: 'Link Monster',   label: 'Link' },
  { value: 'Ritual Monster', label: 'Ritual' },
  { value: 'Spell Card',     label: 'Spell' },
  { value: 'Trap Card',      label: 'Trap' },
]

export default function TypeFilter({ value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Type</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              textAlign: 'left',
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              cursor: 'pointer',
              background: value === t.value ? 'var(--navy)' : 'transparent',
              color: value === t.value ? 'var(--nav-text)' : 'var(--text-primary)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

### `AttributeFilter.jsx`
```jsx
const ATTRIBUTES = ['', 'DARK', 'LIGHT', 'FIRE', 'WATER', 'WIND', 'EARTH', 'DIVINE']

export default function AttributeFilter({ value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>Attribute</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
      >
        {ATTRIBUTES.map(a => (
          <option key={a} value={a}>{a || 'All attributes'}</option>
        ))}
      </select>
    </div>
  )
}
```

### `LevelRangeFilter.jsx`
```jsx
export default function LevelRangeFilter({ min, max, onMinChange, onMaxChange }) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Level / Rank
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number" min={1} max={max} value={min}
          onChange={e => onMinChange(Number(e.target.value))}
          style={{ width: '52px', padding: '5px', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', textAlign: 'center' }}
        />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
        <input
          type="number" min={min} max={12} value={max}
          onChange={e => onMaxChange(Number(e.target.value))}
          style={{ width: '52px', padding: '5px', fontFamily: 'var(--font-body)', fontSize: '13px', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', textAlign: 'center' }}
        />
      </div>
    </div>
  )
}
```

### `SortControl.jsx`
```jsx
const SORT_OPTIONS = [
  { value: 'name',       label: 'Name A–Z' },
  { value: 'atk',        label: 'ATK high–low' },
  { value: 'def',        label: 'DEF high–low' },
  { value: 'level',      label: 'Level' },
  { value: 'price',      label: 'Price' },
]

export default function SortControl({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Sort cards by"
      style={{
        padding: '6px 10px',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {SORT_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
```

### `Pagination.jsx`
```jsx
export default function Pagination({ page, total, perPage, onPageChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '2rem',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)', background: 'var(--bg-surface)', cursor: page <= 1 ? 'default' : 'pointer', color: 'var(--text-primary)', opacity: page <= 1 ? 0.4 : 1 }}
      >
        ← Prev
      </button>

      <span style={{ color: 'var(--text-secondary)' }}>
        Page {page} of {totalPages} &nbsp;·&nbsp; {total.toLocaleString()} cards
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)', background: 'var(--bg-surface)', cursor: page >= totalPages ? 'default' : 'pointer', color: 'var(--text-primary)', opacity: page >= totalPages ? 0.4 : 1 }}
      >
        Next →
      </button>
    </div>
  )
}
```

---

## Hooks

### `useCards.js`
```js
import { useQuery } from '@tanstack/react-query'
import { fetchCards } from '../utils/api'

export function useCards({ query, type, attribute, levelMin, levelMax, sort, page }) {
  return useQuery({
    queryKey: ['cards', { query, type, attribute, levelMin, levelMax, sort, page }],
    queryFn:  () => fetchCards({ query, type, attribute, levelMin, levelMax, sort, page }),
    placeholderData: keepPreviousData, // show old results while new page loads
  })
}
```

### `useCardDetail.js`
```js
import { useQuery } from '@tanstack/react-query'
import { fetchCardById } from '../utils/api'

export function useCardDetail(id) {
  return useQuery({
    queryKey: ['card', id],
    queryFn:  () => fetchCardById(id),
    enabled:  !!id,
  })
}
```

---

## Utilities

### `utils/api.js`
Thin fetch wrappers. All requests go through the Node proxy — never directly
to YGOPRODeck from the client.

```js
const BASE = '/api'

export async function fetchCards({ query, type, attribute, levelMin, levelMax, sort, page }) {
  const params = new URLSearchParams()
  if (query)          params.set('q',         query)
  if (type)           params.set('type',       type)
  if (attribute)      params.set('attribute',  attribute)
  if (levelMin > 1)   params.set('levelMin',   levelMin)
  if (levelMax < 12)  params.set('levelMax',   levelMax)
  if (sort)           params.set('sort',        sort)
  if (page)           params.set('page',        page)

  const res = await fetch(`${BASE}/cards?${params}`)
  if (!res.ok) throw new Error('Failed to fetch cards')
  return res.json() // { cards: [...], total: number }
}

export async function fetchCardById(id) {
  const res = await fetch(`${BASE}/cards/${id}`)
  if (!res.ok) throw new Error('Card not found')
  return res.json()
}
```

### `utils/cardTypeColors.js`
Single place that maps the API's `type` strings to design tokens.

```js
// Maps YGOPRODeck type string → CSS token names for stripe and badge
const TYPE_MAP = {
  'Normal Monster':          { stripe: 'var(--card-normal-bg)',  bg: 'var(--card-normal-light)',  color: 'var(--card-normal-text)',  label: 'Normal'   },
  'Effect Monster':          { stripe: 'var(--card-effect-bg)',  bg: 'var(--card-effect-light)',  color: 'var(--card-effect-text)',  label: 'Effect'   },
  'Fusion Monster':          { stripe: 'var(--card-fusion-bg)',  bg: 'var(--card-fusion-light)',  color: 'var(--card-fusion-text)',  label: 'Fusion'   },
  'Synchro Monster':         { stripe: 'var(--card-synchro-bg)', bg: 'var(--card-synchro-light)', color: 'var(--card-synchro-text)', label: 'Synchro'  },
  'Xyz Monster':             { stripe: 'var(--card-xyz-bg)',     bg: 'var(--card-xyz-light)',     color: 'var(--card-xyz-text)',     label: 'Xyz'      },
  'Link Monster':            { stripe: 'var(--card-link-bg)',    bg: 'var(--card-link-light)',    color: 'var(--card-link-text)',    label: 'Link'     },
  'Ritual Monster':          { stripe: 'var(--card-ritual-bg)',  bg: 'var(--card-ritual-light)',  color: 'var(--card-ritual-text)',  label: 'Ritual'   },
  'Spell Card':              { stripe: 'var(--card-spell-bg)',   bg: 'var(--card-spell-light)',   color: 'var(--card-spell-text)',   label: 'Spell'    },
  'Trap Card':               { stripe: 'var(--card-trap-bg)',    bg: 'var(--card-trap-light)',    color: 'var(--card-trap-text)',    label: 'Trap'     },
}

const FALLBACK = { stripe: 'var(--border)', bg: 'var(--bg-surface)', color: 'var(--text-secondary)', label: 'Card' }

// Returns the 4px top stripe color for CardTile
export function getTypeStripeColor(type) {
  return (TYPE_MAP[type] || FALLBACK).stripe
}

// Returns { bg, color, label } for CardTypeBadge
export function getTypeBadgeStyles(type) {
  const match = TYPE_MAP[type] || FALLBACK
  return { bg: match.bg, color: match.color, label: match.label }
}
```

---

## Server — Node/Express proxy

### `server/index.js`
```js
const express    = require('express')
const cardsRoute = require('./routes/cards')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use('/api/cards', cardsRoute)

app.listen(PORT, () => console.log(`Server running on :${PORT}`))
```

### `server/routes/cards.js`
Proxies requests to YGOPRODeck, applies server-side cache (1hr TTL), and
handles pagination — the YGOPRODeck API returns all results; we slice here.

```js
const express   = require('express')
const NodeCache = require('node-cache')
const router    = express.Router()
const cache     = new NodeCache({ stdTTL: 3600 }) // 1 hour

const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'
const PER_PAGE    = 24

// GET /api/cards
router.get('/', async (req, res) => {
  const { q, type, attribute, levelMin, levelMax, sort = 'name', page = 1 } = req.query

  // Build YGOPRODeck query params
  const params = new URLSearchParams()
  params.set('misc', 'yes')            // includes misc data
  params.set('card_prices', 'yes')
  if (q)         params.set('fname',      q)
  if (type)      params.set('type',       type)
  if (attribute) params.set('attribute',  attribute)
  if (levelMin && levelMin > 1)  params.set('level', `${levelMin},lte,${levelMax ?? 12}`)

  const cacheKey = params.toString()
  const cached   = cache.get(cacheKey)

  let allCards
  if (cached) {
    allCards = cached
  } else {
    const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?${params}`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })
    const json = await upstream.json()
    allCards   = json.data || []
    cache.set(cacheKey, allCards)
  }

  // Sort
  allCards = sortCards(allCards, sort)

  // Paginate
  const total    = allCards.length
  const pageNum  = Number(page)
  const start    = (pageNum - 1) * PER_PAGE
  const cards    = allCards.slice(start, start + PER_PAGE)

  res.json({ cards, total, page: pageNum, perPage: PER_PAGE })
})

// GET /api/cards/random
router.get('/random', async (req, res) => {
  const upstream = await fetch(`${YGOPRO_BASE}/randomcard.php`)
  if (!upstream.ok) return res.status(502).json({ error: 'Upstream error' })
  const card = await upstream.json()
  res.json(card)
})

// GET /api/cards/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const cacheKey = `card_${id}`
  const cached   = cache.get(cacheKey)

  if (cached) return res.json(cached)

  const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?id=${id}&card_prices=yes`)
  if (!upstream.ok) return res.status(404).json({ error: 'Card not found' })
  const json = await upstream.json()
  const card = json.data?.[0]
  if (!card) return res.status(404).json({ error: 'Card not found' })

  cache.set(cacheKey, card)
  res.json(card)
})

function sortCards(cards, sort) {
  return [...cards].sort((a, b) => {
    switch (sort) {
      case 'atk':   return (b.atk ?? -1) - (a.atk ?? -1)
      case 'def':   return (b.def ?? -1) - (a.def ?? -1)
      case 'level': return (b.level ?? 0) - (a.level ?? 0)
      case 'price': {
        const pa = parseFloat(a.card_prices?.[0]?.tcgplayer_price || 0)
        const pb = parseFloat(b.card_prices?.[0]?.tcgplayer_price || 0)
        return pb - pa
      }
      default: return a.name.localeCompare(b.name)
    }
  })
}

module.exports = router
```

---

## Install commands

```bash
# Client (Vite + React)
cd client
npm create vite@latest . -- --template react
npm install react-router-dom @tanstack/react-query use-debounce

# Server
cd server
npm init -y
npm install express node-cache
```

---

## UX optimizations summary

| Technique | Where | Why |
|---|---|---|
| URL-driven filter state | `BrowsePage`, all filters | Filters survive refresh; links are shareable |
| `keepPreviousData` | `useCards` | Old grid stays visible while next page loads — no flash |
| 300ms debounce | `SearchBar` | Avoids API call on every keystroke |
| `loading="lazy"` on images | `CardTile`, `CardDetailPage` | Only loads art for visible cards |
| `cards_small` image endpoint | `CardTile` | Smaller thumbnails (~8KB vs ~80KB) in the grid |
| Server-side pagination | `server/routes/cards.js` | Never sends 12k cards to the client |
| 1hr cache on Node | `server/routes/cards.js` | Repeated searches skip upstream entirely |
| TanStack Query cache | `useCards`, `useCardDetail` | Card detail already cached if visited from grid |
| Sticky sidebar | `FilterSidebar` | Filters accessible without scrolling up |
| Sticky nav | `NavBar` | Search always reachable |
| `navigate(-1)` | `CardDetailPage` | Returns to exact scroll position + filters |
| Skeleton loading | `CardGrid` | Prevents layout shift while cards load |

---

*Component scaffold v1.0 — aligned with design doc v1.2*
*Last updated: May 2026*
