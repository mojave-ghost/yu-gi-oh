# Slice B: Lists Index Page

## Deliverables

- New file: `client/src/pages/ListsPage.jsx`
- Edit: `client/src/App.jsx` (import + one route line)

No server changes. No other files.

---

## App.jsx changes

Two lines added, following the established import + route pattern:

**Import** (line 11, after `MiscPage`):
```js
import ListsPage from './pages/ListsPage'
```

**Route** (after `/misc` route, before `*` catch-all):
```jsx
<Route path="/lists" element={<ListsPage />} />
```

---

## ListsPage.jsx

### Imports

```js
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLists, calcListTotal } from '../hooks/useLists'
```

### State

| Name | Type | Purpose |
|---|---|---|
| `modalOpen` | `boolean` | Controls modal visibility |
| `draftName` | `string` | Controlled input value inside modal |
| `hoveredId` | `string \| null` | Tracks which list card is hovered (for border highlight) |

`hoveredId` uses the `onMouseEnter` / `onMouseLeave` → `e.currentTarget.style` pattern from SetsPage — i.e., mutate `e.currentTarget.style.border` directly rather than storing state, since it's purely cosmetic with no re-render cost.

### Outer wrapper

Matches the SetsPage / MiscPage pattern exactly:

```jsx
<main style={{ padding: 'var(--section-pad)', maxWidth: 860, margin: '0 auto' }}>
```

---

## Header row

```
┌─────────────────────────────────────────────────┐
│ My Lists (h1, Cinzel 28px)       [New list btn] │
└─────────────────────────────────────────────────┘
```

```js
{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24,
}
```

**`<h1>` styles:**
```js
{
  fontFamily: 'var(--font-display)',
  fontSize: 28,
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: 0,
}
```

**'New list' button styles** (reused for the modal's Create button — define once as a shared const `navyBtnStyle` above the component):
```js
const navyBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  padding: '8px 16px',
  borderRadius: 'var(--radius-md)',
  border: '0.5px solid var(--border)',
  background: 'var(--navy)',
  color: 'var(--nav-text)',
  cursor: 'pointer',
}
```

**Ghost button styles** (Cancel button — define as `ghostBtnStyle` above the component):
```js
const ghostBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  padding: '8px 16px',
  borderRadius: 'var(--radius-md)',
  border: '0.5px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
}
```

**'New list' onClick:**
```js
() => {
  setDraftName(`My List ${lists.length}`)
  setModalOpen(true)
}
```
The default name is computed once at click time — not reactive to subsequent list additions while the modal is open.

---

## List cards grid

Rendered between the header row and the modal logic (the modal is always in the JSX tree; its visibility is controlled by `modalOpen`).

```js
{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: 16,
}
```

### Individual card

**Base styles:**
```js
{
  background: 'var(--bg-surface)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 16,
  cursor: 'pointer',
}
```

**Hover:** `onMouseEnter` → `e.currentTarget.style.border = '0.5px solid var(--cyan)'`  
**Un-hover:** `onMouseLeave` → `e.currentTarget.style.border = '0.5px solid var(--border)'`

**onClick:** `navigate('/lists/${list.id}')`

**Card contents (top to bottom):**

| Element | Content | Styles |
|---|---|---|
| Name row | `{list.id === 'wish-list' ? '★ ' : ''}{list.name}` | `fontFamily: 'var(--font-display)'`, `fontSize: 16`, `marginBottom: 8`, star in `color: 'var(--gold)'` |
| Item count | `'{n} cards'` where n = `list.items.length` | `fontFamily: 'var(--font-body)'`, `fontSize: 13`, `color: 'var(--text-secondary)'` |
| Total value | `'$X.XX estimated'` using `calcListTotal(list).toFixed(2)` | `fontFamily: 'var(--font-body)'`, `fontSize: 13`, `color: 'var(--gold)'`, `fontWeight: 500` |
| Last updated | `new Date(list.updatedAt).toLocaleDateString()` | `fontFamily: 'var(--font-body)'`, `fontSize: 11`, `color: 'var(--text-secondary)'`, `marginTop: 8` |

The Wish List star `★` is rendered inline in the name span. The star itself gets `color: 'var(--gold)'` via a wrapping `<span>`. The rest of the list name uses `color: 'var(--text-primary)'`.

---

## Empty state

Condition: `lists.length === 1 && lists[0].id === 'wish-list' && lists[0].items.length === 0`

Rendered below the grid (which would be a single empty Wish List card):

```jsx
<p style={{
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginTop: 48,
}}>
  Add cards from any card detail page to start planning your purchases.
</p>
```

---

## Create list modal

Always present in the JSX tree. Rendered as a sibling after `</main>` (not nested inside it), so the fixed overlay fills the full viewport without being clipped by the page wrapper.

**Overlay:**
```js
{
  position: 'fixed',
  top: 0, right: 0, bottom: 0, left: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
}
```

If `!modalOpen`, return `null` (or render nothing via short-circuit).

**Modal card:**
```js
{
  background: 'var(--bg-page)',
  borderRadius: 'var(--radius-lg)',
  border: '0.5px solid var(--border)',
  padding: 24,
  width: 400,
  maxWidth: '90vw',
}
```

**Modal contents, top to bottom:**

1. **Header row** — `display: flex`, `justifyContent: 'space-between'`, `alignItems: 'center'`
   - Left: `'Create a new list'` — `fontFamily: 'var(--font-body)'`, `fontSize: 16`, `fontWeight: 500`
   - Right: `×` close button — `background: 'none'`, `border: 'none'`, `fontSize: 18`, `cursor: 'pointer'`, `color: 'var(--text-secondary)'` — onClick closes modal

2. **Label:** `'List name'` — `display: 'block'`, `fontSize: 12`, `color: 'var(--text-secondary)'`, `marginTop: 16`, `marginBottom: 6`, `fontFamily: 'var(--font-body)'`

3. **Input:**
   ```js
   {
     width: '100%',
     height: 36,
     padding: '0 10px',
     fontFamily: 'var(--font-body)',
     fontSize: 14,
     border: '0.5px solid var(--border)',
     borderRadius: 'var(--radius-md)',
     background: 'var(--bg-surface)',
     color: 'var(--text-primary)',
     outline: 'none',
     boxSizing: 'border-box',
   }
   ```
   - `value={draftName}` + `onChange={e => setDraftName(e.target.value)}`
   - `autoFocus`
   - `onKeyDown`: Enter → submit (if `draftName.trim()` non-empty), Escape → close modal

4. **Button row:** `marginTop: 20`, `display: 'flex'`, `gap: 8`, `justifyContent: 'flex-end'`
   - Cancel: `ghostBtnStyle`, onClick closes modal
   - Create: `navyBtnStyle`, `disabled={!draftName.trim()}`, onClick submits

**Submit logic:**
```js
function handleCreate() {
  const newList = createList(draftName.trim())
  setModalOpen(false)
  navigate(`/lists/${newList.id}`)
}
```
Called by both the Create button click and the Enter key handler.

**Close logic:** `setModalOpen(false)` only — `draftName` is reset on next open, not on close.

---

## Component skeleton (structure only)

```
export default function ListsPage() {
  // state: modalOpen, draftName
  // useLists: lists, createList
  // useNavigate

  function handleCreate() { ... }

  return (
    <>
      <main ...>
        {/* header row */}
        {/* list cards grid */}
        {/* empty state (conditional) */}
      </main>

      {/* modal (outside <main>) */}
      {modalOpen && (
        <div ...overlay>
          <div ...card>
            {/* header row */}
            {/* label + input */}
            {/* button row */}
          </div>
        </div>
      )}
    </>
  )
}
```

The fragment wrapper `<>...</>` allows `<main>` and the modal overlay to be siblings without an extra DOM node.

---

## Constraints check

- No hex values — all colors are CSS custom properties or the one `rgba(0,0,0,0.45)` semi-transparent overlay (not a brand color, acceptable as a one-off overlay scrim).
- `--gold` used for price display and the Wish List star — the star is a UI affordance distinguishing a special card, not decoration.
- No filter state → no `useSearchParams` needed on this page.
- `useState` for `modalOpen` and `draftName` is correct — these are transient UI interaction states, not shareable/bookmarkable filter state.
