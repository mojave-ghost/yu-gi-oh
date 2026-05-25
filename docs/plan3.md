# Slice 3 Plan — Shell and Routing

Files touched: `client/index.html`, `client/src/main.jsx`, `client/src/App.jsx`,
`client/src/pages/BrowsePage.jsx`, `client/src/pages/CardDetailPage.jsx`,
`client/src/pages/NotFoundPage.jsx`, `client/src/components/layout/NavBar.jsx`,
`client/src/components/search/SearchBar.jsx`, `client/src/styles/tokens.css`

---

## 1. `client/index.html` — Google Fonts

Add two `<link>` tags inside `<head>` before any CSS:

```
Cinzel  — weights 400, 600
DM Sans — weights 400, 500
```

Use a single combined Google Fonts URL with `display=swap`.
These are the only two font families used anywhere in the project.

---

## 2. `tokens.css` additions

Two new tokens are needed by NavBar and SearchBar and cannot be expressed as
`var()` references to existing tokens because they involve alpha transparency.
Add them to `:root` in `tokens.css` before starting on components:

| Token | Value | Used by |
|---|---|---|
| `--search-nav-bg` | `rgba(255,255,255,0.08)` | SearchBar nav variant background |
| `--search-nav-border` | `rgba(232,216,160,0.2)` | SearchBar nav variant border + random button border |

This keeps the no-hex rule clean: no JSX file ever writes an `rgba()` literal.

---

## 3. `main.jsx`

**Wrapping order (outermost → innermost):**

```
React.StrictMode
  QueryClientProvider  (client={queryClient})
    BrowserRouter
      App
```

`QueryClientProvider` must wrap `BrowserRouter` because hooks like `useQuery`
are called inside route components — they need the query context to already
exist before any route renders.

**QueryClient config:**

```js
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           1000 * 60 * 5,   // 5 min
      gcTime:              1000 * 60 * 30,  // 30 min
      retry:               2,
      refetchOnWindowFocus: false,
    },
  },
})
```

**Imports (in order):**
1. `react` / `react-dom/client`
2. `BrowserRouter` from `react-router-dom`
3. `QueryClient`, `QueryClientProvider` from `@tanstack/react-query`
4. `App`
5. `./styles/tokens.css` — must be last import so tokens are available globally

---

## 4. `App.jsx`

Root layout: a single `<div>` with `fontFamily: 'var(--font-body)'` and
`background: 'var(--bg-page)'` and `minHeight: '100vh'`.

**Four routes:**

| Path | Element | Notes |
|---|---|---|
| `/` | `<Navigate to="/browse" replace />` | Hard redirect, no render |
| `/browse` | `<BrowsePage />` | Main view |
| `/card/:id` | `<CardDetailPage />` | Detail view |
| `*` | `<NotFoundPage />` | Catch-all |

Use `<Navigate replace />` (not a duplicate `<BrowsePage>`) for `/` so the
browser history entry is replaced rather than pushed — back-button stays clean.

`<NavBar />` renders above `<Routes>`, outside the switch, so it persists on
every route including 404.

No hex values. All color/font references use `var(--…)`.

---

## 5. Page stubs

`BrowsePage`, `CardDetailPage`, and `NotFoundPage` are minimal stubs in this
slice — just enough to verify routing works. Each returns a single `<p>` or
`<h1>` with a descriptive placeholder. Full implementation comes in later slices.

`NotFoundPage` stub can be permanent (or close to it): a short message with a
`<Link to="/browse">` to return home.

---

## 6. `NavBar.jsx`

**Layout:** sticky `<nav>`, `top: 0`, `zIndex: 100`.
Three flex children in a row: logo link · search input · random button.

**Dimensions / colors — all via tokens:**
- `height: 'var(--nav-height)'` (56px)
- `background: 'var(--navy)'`
- `padding: '0 var(--section-pad)'`
- `gap: '16px'`

**Logo link** (`<Link to="/browse">`):
- `fontFamily: 'var(--font-display)'` (Cinzel)
- `fontSize: '18px'`
- `color: 'var(--nav-text)'`
- `textDecoration: 'none'`, `whiteSpace: 'nowrap'`, `flexShrink: 0`
- Text: `YGO Database`

**SearchBar slot:**
- `<div style={{ flex: 1, maxWidth: '480px' }}>`
- Renders `<SearchBar variant="nav" value={…} onChange={handleSearch} />`
- `value` comes from `useSearchParams().get('q') || ''`
- `handleSearch` calls `setSearchParams` to write `q` and reset `page` to `1`

**Random card button:**
- `fontFamily: 'var(--font-body)'`, `fontSize: '13px'`
- `color: 'var(--nav-text)'`, `background: 'transparent'`
- `border: '1px solid var(--search-nav-border)'`
- `borderRadius: 'var(--radius-md)'`, `padding: '6px 12px'`
- `flexShrink: 0`, `whiteSpace: 'nowrap'`
- On click: `handleRandom` (see §7)
- No hex values anywhere in the style object

---

## 7. Random card button — `handleRandom`

```
async function handleRandom() {
  const res  = await fetch('/api/cards/random')
  const data = await res.json()
  navigate(`/card/${data.id}`)
}
```

- Calls `/api/cards/random` through the Node proxy — never the upstream URL directly
- `data.id` is the YGOPRODeck card ID
- `navigate` from `useNavigate()` — pushes a new history entry

No loading state needed for MVP. If the fetch fails, the navigate simply doesn't
fire; the button is not disabled between clicks.

---

## 8. `SearchBar.jsx`

**Props:** `{ value, onChange, variant = 'page' }`

**Local state:** `const [local, setLocal] = useState(value)`

**URL sync:** `useEffect(() => { setLocal(value) }, [value])`
This fires when `value` changes externally — browser back/forward or NavBar
overwriting the `q` param — keeping the visible input in sync.

**Debounce:**
```js
const debouncedOnChange = useDebouncedCallback(onChange, 300)
```
`handleChange` updates `local` immediately (for responsive typing) and calls
`debouncedOnChange` for the URL/API update.

**Two variants:**

| Style property | `variant="nav"` | `variant="page"` |
|---|---|---|
| `height` | `36px` | `40px` |
| `background` | `var(--search-nav-bg)` | `var(--bg-surface)` |
| `border` | `1px solid var(--search-nav-border)` | `0.5px solid var(--border)` |
| `color` | `var(--nav-text)` | `var(--text-primary)` |

All other properties (`width: 100%`, `padding`, `fontFamily`, `fontSize`,
`borderRadius`, `outline: none`) are shared between variants.

`aria-label="Search cards"` on the `<input>` for accessibility.
`type="search"` to get the native clear (×) button on desktop browsers.

No hex values in the component file.

---

## Constraints checklist

- [ ] No hex literals in any `.jsx` file — only `var(--…)` or the two new rgba tokens defined in `tokens.css`
- [ ] `/` uses `<Navigate replace />`, not a second `<BrowsePage>` render
- [ ] `QueryClientProvider` wraps `BrowserRouter` in `main.jsx`
- [ ] `tokens.css` imported in `main.jsx` before `App`
- [ ] `SearchBar` uses `useDebouncedCallback` at exactly 300ms
- [ ] `SearchBar` `useEffect` syncs `local` from `value` prop
- [ ] Random button fetches `/api/cards/random`, not any external URL
- [ ] Google Fonts loaded in `client/index.html`, not in any component
