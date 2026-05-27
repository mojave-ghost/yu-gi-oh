# Slice 9 — Nav Links

## Goal

Add four section nav links (Browse, Sets, Archetypes, Banlist) to NavBar between the logo and the search bar. Each link uses `NavLink` for automatic active-state detection. On screens narrower than 768 px the links collapse behind a hamburger toggle.

---

## Files changed

| File | Change |
|---|---|
| `client/src/styles/tokens.css` | Add `--nav-text-muted` |
| `client/src/components/layout/NavBar.jsx` | Nav links + mobile hamburger |

---

## Step-by-step

### 1. `tokens.css` — add missing token

`--nav-text-muted` does not exist yet. Add it in the **NavBar / SearchBar overlays** block, immediately after `--search-nav-border`:

```css
--nav-text-muted: rgba(232, 216, 160, 0.5);
```

No other tokens change.

---

### 2. `NavBar.jsx` — imports

Current imports from `react-router-dom`: `Link, useNavigate, useLocation, useSearchParams`.

Add to that import line:
- `NavLink` (replaces nothing — `Link` stays for the logo)
- Keep `useState` import from `react` (add it; NavBar currently has no React import)

---

### 3. `NavBar.jsx` — mobile state

Add one piece of state at the top of the component:

```js
const [menuOpen, setMenuOpen] = useState(false)
```

Also derive a boolean for whether the viewport is mobile. Use `window.matchMedia` with a resize listener rather than a CSS media query so the logic stays in inline-style land:

```js
const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

useEffect(() => {
  const mq = window.matchMedia('(max-width: 767px)')
  const handler = (e) => setIsMobile(e.matches)
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}, [])
```

---

### 4. `NavBar.jsx` — nav link data

Define the link list as a constant above the return (or at module scope):

```js
const NAV_LINKS = [
  { to: '/browse',     label: 'Browse'     },
  { to: '/sets',       label: 'Sets'       },
  { to: '/archetypes', label: 'Archetypes' },
  { to: '/banlist',    label: 'Banlist'    },
]
```

---

### 5. `NavBar.jsx` — inline NavLink style helper

NavLink accepts a function as the `style` prop that receives `{ isActive }`:

```js
function navLinkStyle({ isActive }) {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    color: isActive ? 'var(--nav-text)' : 'var(--nav-text-muted)',
    borderBottom: isActive ? '2px solid var(--nav-text)' : '2px solid transparent',
    paddingBottom: '2px',
  }
}
```

Using `2px solid transparent` on inactive links keeps the height stable so the bar doesn't jump when a link becomes active.

---

### 6. `NavBar.jsx` — layout change

Current `<nav>` flex row: `logo — searchbar — random button`

New row: `logo — [nav links | hamburger icon] — searchbar — random button`

The nav link container sits between the logo and the search bar. On desktop (`!isMobile`) render the link container; on mobile render the hamburger button instead.

**Desktop link container:**

```jsx
<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
  {NAV_LINKS.map(({ to, label }) => (
    <NavLink key={to} to={to} style={navLinkStyle}>
      {label}
    </NavLink>
  ))}
</div>
```

**Mobile hamburger button:**

```jsx
<button
  onClick={() => setMenuOpen(o => !o)}
  aria-label="Toggle navigation"
  style={{
    background: 'transparent',
    border: 'none',
    color: 'var(--nav-text)',
    cursor: 'pointer',
    fontSize: '20px',
    padding: '4px',
    flexShrink: 0,
  }}
>
  <i className="ti ti-menu-2" />
</button>
```

The Tabler icon class `ti ti-menu-2` is already available via the existing icon font (verify it's loaded in `index.html`; if not, add the Tabler CDN link there).

---

### 7. `NavBar.jsx` — mobile dropdown panel

Render the dropdown **after** (outside) the `<nav>` element, as a sibling. Wrap both in a `<>` fragment:

```jsx
return (
  <>
    <nav …>…</nav>
    {isMobile && menuOpen && (
      <div style={{
        background: 'var(--navy)',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px var(--section-pad) 12px',
        gap: '0',
        position: 'sticky',
        top: 'var(--nav-height)',
        zIndex: 99,
      }}>
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={navLinkStyle}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </div>
    )}
  </>
)
```

Clicking a link closes the menu via `onClick={() => setMenuOpen(false)}`.

---

## Constraints / notes

- **No hex values in NavBar.jsx.** The only color literals are in `tokens.css` and the `rgba(…)` value belongs to `--nav-text-muted` there; JSX only references var(--…).
- **`--gold` is not used here** — `--nav-text` is the correct accent token for nav chrome.
- Routes `/sets`, `/archetypes`, `/banlist` do not exist yet. The links will render (good for nav scaffolding) but will hit `NotFoundPage` until those slices are built. That is acceptable — do not stub placeholder pages in this slice.
- The `isMobile` / `useEffect` block is the only place a resize side-effect lives; do not add window listeners elsewhere in NavBar.
- The hamburger icon requires Tabler Icons. Check `client/index.html` for an existing `<link>` to the Tabler CDN. If absent, add it in this slice.
