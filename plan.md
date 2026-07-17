# Plan: Misc Section Landing Page

## Overview

Three files change. One new file is created. The `/banlist` route and page are untouched.

---

## File 1 — `client/src/components/layout/NavBar.jsx`

**Change:** Replace the `Banlist` entry in `NAV_LINKS` (line 9) with `Misc`.

```js
// Before
{ to: '/banlist', label: 'Banlist' },

// After
{ to: '/misc', label: 'Misc' },
```

**Side effects / notes:**
- Both the desktop link row (line 83–88) and the mobile hamburger menu (line 148–157) render from `NAV_LINKS`, so both update automatically.
- The `navLinkStyle` active indicator will highlight `Misc` when the user is on `/misc`. It will NOT highlight when on `/banlist` — intentional, since `/banlist` is now a sub-destination reached via the landing page.
- No other changes to NavBar.jsx.

---

## File 2 — `client/src/pages/MiscPage.jsx` (new file)

**Route:** `/misc`

**Imports needed:**
- `useNavigate` from `react-router-dom`

**Top-level constant** (defined above the component, not inside JSX):

```js
const TOOLS = [
  {
    name: 'Banlist',
    description: 'TCG Forbidden, Limited, and Semi-Limited card list.',
    route: '/banlist',
  },
]
```

**Component structure:**

```
<div>                        outer wrapper — maxWidth 860px, margin 0 auto,
  <h1>                         padding var(--section-pad)
    'Reference Tools'          Cinzel, 28px
  </h1>
  <p>                          subtitle
    'Competitive and ...'      DM Sans (var(--font-body)), 14px,
  </p>                         color var(--text-secondary), marginBottom 32px

  {TOOLS.map(tool => (
    <div                       tool row
      onClick={() => navigate(tool.route)}
      onMouseEnter             sets hovered state → background var(--bg-surface)
      onMouseLeave             clears hovered state → background transparent
      style={rowStyle}         flex row, justifyContent space-between,
    >                          alignItems center, padding 16px 0,
      <div>                    borderBottom 0.5px solid var(--border),
        <div>{tool.name}</div>   cursor pointer
        <div>{tool.description}</div>
      </div>
      <span>→</span>
    </div>
  ))}
</div>
```

**Hover state:** one `useState(null)` (or a string key) to track which row is hovered, so the background token can be applied conditionally. This is the only `useState` in the file — it is UI interaction state, not filter state, so `useState` is correct here (no URL param needed).

**Style values:**
| Element | Key styles |
|---|---|
| Outer wrapper | `maxWidth: 860px`, `margin: '0 auto'`, `padding: 'var(--section-pad)'` |
| `<h1>` | `fontFamily: 'var(--font-display)'`, `fontSize: 28px`, `color: 'var(--text-primary)'`, `marginBottom: 8px` |
| Subtitle `<p>` | `fontFamily: 'var(--font-body)'`, `fontSize: 14px`, `color: 'var(--text-secondary)'`, `marginBottom: 32px`, `marginTop: 0` |
| Tool row | `display: 'flex'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `padding: '16px 0'`, `borderBottom: '0.5px solid var(--border)'`, `cursor: 'pointer'`, `background: hovered ? 'var(--bg-surface)' : 'transparent'` |
| Tool name | `fontFamily: 'var(--font-display)'`, `fontSize: 16px`, `color: 'var(--text-primary)'`, `marginBottom: 4px` |
| Tool description | `fontFamily: 'var(--font-body)'`, `fontSize: 13px`, `color: 'var(--text-secondary)'` |
| Arrow | `fontSize: 18px`, `color: 'var(--text-secondary)'`, `flexShrink: 0` |

**Constraint check:** No hex values — all colors are CSS custom properties.

---

## File 3 — `client/src/App.jsx`

**Changes:**
1. Add import: `import MiscPage from './pages/MiscPage'`
2. Add route before the `*` catch-all, alongside the other section routes:

```jsx
<Route path="/misc" element={<MiscPage />} />
```

**Placement:** After the `/banlist` route (line 24), before `<Route path="*" ...>` (line 25). The `/banlist` route itself is unchanged.

---

## What does NOT change

| File | Reason |
|---|---|
| `client/src/pages/BanlistPage.jsx` | Untouched — still directly accessible via `/banlist` |
| `server/` files | No new API routes needed |
| `tokens.css` | All tokens used by MiscPage already exist |
| Any other component | No shared state or props affected |

---

## Execution order

1. Create `MiscPage.jsx`
2. Update `NavBar.jsx` (one-line swap in `NAV_LINKS`)
3. Update `App.jsx` (one import + one route line)
