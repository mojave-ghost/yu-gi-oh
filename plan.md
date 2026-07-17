# Slice E: My Lists nav integration

**Only file changed:** `client/src/components/layout/NavBar.jsx`

---

## NAV_LINKS update

Insert `{ to: '/lists', label: 'My Lists' }` between Archetypes and Misc at line 8:

```js
const NAV_LINKS = [
  { to: '/browse',     label: 'Browse'     },
  { to: '/sets',       label: 'Sets'       },
  { to: '/archetypes', label: 'Archetypes' },
  { to: '/lists',      label: 'My Lists'   },  // ← insert here
  { to: '/misc',       label: 'Misc'       },
]
```

---

## List count badge

**Import** `useLists` at the top of the file (after the existing React Router imports):

```js
import { useLists } from '../../hooks/useLists'
```

**Inside `NavBar()`**, add after the existing hook calls:

```js
const { lists } = useLists()
const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0)
```

**Extract a `badgeStyle` constant** above the `NavBar` function (alongside `navLinkStyle`), to avoid duplicating the inline object across desktop and mobile renders:

```js
const badgeStyle = {
  background:   'var(--cyan)',
  color:        'var(--card-link-text)',
  fontSize:     '10px',
  fontWeight:   500,
  padding:      '1px 6px',
  borderRadius: '10px',
  marginLeft:   '4px',
  fontFamily:   'var(--font-body)',
}
```

---

## Render changes

Both the desktop map (currently lines 83–88) and the mobile map (lines 148–157) destructure only `{ to, label }` and render `{label}` inside each `<NavLink>`. Both need to render the badge conditionally.

**Desktop map** becomes:

```jsx
{NAV_LINKS.map(({ to, label }) => (
  <NavLink key={to} to={to} style={navLinkStyle}>
    {label}
    {to === '/lists' && totalItems > 0 && (
      <span style={badgeStyle}>{totalItems}</span>
    )}
  </NavLink>
))}
```

**Mobile map** becomes:

```jsx
{NAV_LINKS.map(({ to, label }) => (
  <NavLink
    key={to}
    to={to}
    style={navLinkStyle}
    onClick={() => setMenuOpen(false)}
  >
    {label}
    {to === '/lists' && totalItems > 0 && (
      <span style={badgeStyle}>{totalItems}</span>
    )}
  </NavLink>
))}
```

The badge condition `to === '/lists' && totalItems > 0` is evaluated once per link per render — no performance concern.

---

## Active state

Checked lines 84 and 149: neither the desktop nor mobile `<NavLink>` elements use `end={true}`. React Router v6 `NavLink` matches on path prefix by default, so `/lists/:listId` will already trigger the active highlight on the My Lists link without any additional prop.

**No changes to `navLinkStyle` or `end` props are needed.**

---

## Summary of changes

| Location | Change |
|---|---|
| Imports (top of file) | Add `import { useLists } from '../../hooks/useLists'` |
| `NAV_LINKS` array (line 8) | Insert `{ to: '/lists', label: 'My Lists' }` |
| Above `NavBar` function | Add `const badgeStyle = { … }` |
| Inside `NavBar()` | Add `const { lists } = useLists()` and `const totalItems = …` |
| Desktop `<NavLink>` map (line 84) | Expand children: `{label}` + badge conditional |
| Mobile `<NavLink>` map (line 149) | Same expansion as desktop |
