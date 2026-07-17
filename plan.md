# Slice C — List Detail Page

## Overview

Two files change:
- **NEW** `client/src/pages/ListDetailPage.jsx`
- **EDIT** `client/src/App.jsx` — one import + one route

---

## Dependency check

`@tabler/icons-react` is **not** in `client/package.json`. The pencil edit hint requires it.
Install before writing the component:

```
cd client && npm install @tabler/icons-react
```

Use `IconPencil` from `@tabler/icons-react` with `size={14}`.

---

## `client/src/pages/ListDetailPage.jsx`

### Imports

```js
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconPencil } from '@tabler/icons-react'
import { useLists, calcItemPrice, calcListTotal, CONDITION_MULTIPLIERS } from '../hooks/useLists'
import { getRarityStyle } from '../utils/rarityStyles'
```

### State

| Variable | Type | Purpose |
|---|---|---|
| `editing` | boolean | inline name-input active |
| `draftName` | string | controlled value for rename input |
| `confirmDelete` | boolean | delete confirmation row visible |
| `nameHovered` | boolean | shows pencil icon (all inline styles — no CSS hover class) |

### Top-level wiring

```js
const { listId } = useParams()
const navigate = useNavigate()
const { getList, renameList, deleteList, removeItem, updateItem } = useLists()
const list = getList(listId)
```

### Invalid ID guard

Rendered **before** anything else. If `list` is `undefined`, return early:

```jsx
<div style={{ padding: 'var(--section-pad)' }}>
  <p style={{ fontFamily: 'var(--font-body)', color: 'var(--red)' }}>List not found.</p>
  <button onClick={() => navigate('/lists')} style={backBtnStyle}>← My Lists</button>
</div>
```

Nothing below renders.

---

## Page structure (happy path)

All content in `<main style={{ padding: 'var(--section-pad)', maxWidth: 900, margin: '0 auto' }}>`.

### 1. Back button

Pattern matches `CardDetailPage` and `SetDetailPage` exactly:

```js
const backBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  marginBottom: '1.5rem',
  padding: 0,
}
```

```jsx
<button onClick={() => navigate('/lists')} style={backBtnStyle}>← My Lists</button>
```

### 2. Header row

```jsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
  {/* left: editable name — or plain h1 for wish-list */}
  {/* right: delete button — omitted when listId === 'wish-list' */}
</div>
```

#### Editable list name (left side)

**Wish List guard:** when `listId === 'wish-list'`, render a plain `<h1>` — no click handler, no pencil, no hover state:

```jsx
<h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0 }}>
  {list.name}
</h1>
```

**All other lists — display mode** (`!editing`):

```jsx
<div
  onMouseEnter={() => setNameHovered(true)}
  onMouseLeave={() => setNameHovered(false)}
  onClick={() => { setDraftName(list.name); setEditing(true) }}
  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text' }}
>
  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0 }}>
    {list.name}
  </h1>
  <span style={{
    opacity: nameHovered ? 1 : 0,
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    transition: 'opacity 0.15s',
  }}>
    <IconPencil size={14} />
  </span>
</div>
```

**Edit mode** (`editing`):

```jsx
<input
  autoFocus
  value={draftName}
  onChange={e => setDraftName(e.target.value)}
  onBlur={handleRename}
  onKeyDown={e => {
    if (e.key === 'Enter') handleRename()
    if (e.key === 'Escape') setEditing(false)
  }}
  style={{
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    border: 'none',
    borderBottom: '1.5px solid var(--navy)',
    outline: 'none',
    background: 'transparent',
    color: 'var(--text-primary)',
    padding: '0 2px',
    width: '100%',
    maxWidth: '480px',
  }}
/>
```

**`handleRename`:**

```js
function handleRename() {
  if (draftName.trim()) renameList(listId, draftName.trim())
  setEditing(false)
}
```

Empty value → `setEditing(false)` without calling `renameList`.

#### Delete button (right side, omitted when `listId === 'wish-list'`)

**Normal state** (`!confirmDelete`):

```jsx
<button
  onClick={() => setConfirmDelete(true)}
  style={{
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    color: 'var(--red)',
    background: 'none',
    border: '0.5px solid var(--red)',
    borderRadius: 'var(--radius-md)',
    padding: '6px 12px',
    cursor: 'pointer',
  }}
>
  Delete list
</button>
```

**Confirmation state** (`confirmDelete`): replace the button with an inline flex row:

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)' }}>
    Delete "{list.name}"? This cannot be undone.
  </span>
  <button onClick={() => setConfirmDelete(false)} style={cancelBtnStyle}>Cancel</button>
  <button onClick={handleDelete} style={deleteBtnStyle}>Delete</button>
</div>
```

Button styles (define as module-level consts above the component):

```js
const cancelBtnStyle = {
  fontFamily: 'var(--font-body)', fontSize: '13px',
  background: 'none', border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-md)', padding: '6px 12px', cursor: 'pointer',
}
const deleteBtnStyle = {
  ...cancelBtnStyle,
  color: 'var(--red)', border: '0.5px solid var(--red)',
}
```

```js
function handleDelete() {
  deleteList(listId)
  navigate('/lists')
}
```

### 3. Running total bar

Directly below the header row, before the table:

```jsx
<p style={{
  fontFamily: 'var(--font-body)',
  fontSize: '16px',
  fontWeight: 500,
  color: 'var(--gold)',
  marginBottom: '24px',
  marginTop: 0,
}}>
  Total estimated cost: ${calcListTotal(list).toFixed(2)}
</p>
```

Updates live because `useLists` re-renders on every `updateItem` / `removeItem` call.

---

## Item table

Shown when `list.items.length > 0`.

```jsx
<table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
  <thead>
    <tr style={{ background: 'var(--navy)', color: 'var(--nav-text)' }}>
      {['Card', 'Set & Rarity', 'Condition', 'Qty', 'Price', ''].map((h, i) => (
        <th key={i} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>{h}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {list.items.map(item => /* item row */)}
  </tbody>
</table>
```

### Shared select style

Used by both Condition and Qty columns — matches the SortControl / SetDetailPage pattern:

```js
const selectStyle = {
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  background: 'var(--bg-surface)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '4px 8px',
  color: 'var(--text-primary)',
  cursor: 'pointer',
}
```

### Item row

`<tr key={item.itemId} style={{ borderBottom: '0.5px solid var(--border)' }}>` — six `<td>` cells.

**Card column** `<td style={{ padding: '10px 12px' }}>`

```jsx
<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
  <img
    src={item.cardImage}
    alt={item.cardName}
    width={36}
    loading="lazy"
    decoding="async"
    style={{ borderRadius: '2px', display: 'block' }}
  />
  <span
    onClick={() => navigate(`/card/${item.cardId}`)}
    style={{ color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}
  >
    {item.cardName}
  </span>
</div>
```

**Set & Rarity column** `<td style={{ padding: '10px 12px' }}>`

```jsx
<div>
  {item.setUrl
    ? <a href={item.setUrl} target="_blank" rel="noopener noreferrer"
         style={{ fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none' }}>
        {item.setName}
      </a>
    : <span style={{ fontSize: '12px' }}>{item.setName}</span>
  }
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{item.setCode}</span>
    {(() => {
      const s = getRarityStyle(item.setRarityCode)
      return (
        <span style={{
          background: s.bg, color: s.color,
          fontSize: '10px', padding: '2px 5px',
          borderRadius: 'var(--radius-sm)',
        }}>
          {s.label}
        </span>
      )
    })()}
  </div>
</div>
```

**Condition column** `<td style={{ padding: '10px 12px' }}>`

```jsx
<select
  value={item.condition}
  onChange={e => updateItem(listId, item.itemId, { condition: e.target.value })}
  style={selectStyle}
>
  {Object.keys(CONDITION_MULTIPLIERS).map(c => <option key={c} value={c}>{c}</option>)}
</select>
```

`Object.keys(CONDITION_MULTIPLIERS)` keeps options in sync with the hook's source of truth.
Order in the hook: NM → LP → MP → HP → DMG.

**Qty column** `<td style={{ padding: '10px 12px' }}>`

```jsx
<select
  value={item.quantity}
  onChange={e => updateItem(listId, item.itemId, { quantity: Number(e.target.value) })}
  style={selectStyle}
>
  {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
</select>
```

**Price column** `<td style={{ padding: '10px 12px' }}>`

```jsx
<div>
  <div style={{ color: 'var(--gold)', fontWeight: 500 }}>
    ${calcItemPrice(item).toFixed(2)}
  </div>
  <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
    from ${parseFloat(item.setPrice || 0).toFixed(2)} ea
  </div>
</div>
```

**Remove column** `<td style={{ padding: '10px 12px' }}>`

```jsx
<button
  onClick={() => removeItem(listId, item.itemId)}
  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '16px', cursor: 'pointer', padding: 0 }}
>
  ×
</button>
```

---

## Empty list state

Rendered instead of the table when `list.items.length === 0`:

```jsx
<p style={{
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--text-secondary)',
  textAlign: 'center',
  marginTop: '48px',
}}>
  No cards yet. Browse cards and add them to this list.
</p>
```

---

## TCGPlayer disclaimer

Rendered **below the table** only when `list.items.length > 0`:

```jsx
<p style={{
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  color: 'var(--text-secondary)',
  fontStyle: 'italic',
  marginTop: '8px',
}}>
  Prices are estimates. Final prices may vary on TCGPlayer.
</p>
```

---

## `client/src/App.jsx` changes

Add after the `ListsPage` import:

```js
import ListDetailPage from './pages/ListDetailPage'
```

Add after the `/lists` route:

```jsx
<Route path="/lists/:listId" element={<ListDetailPage />} />
```

No other files change.

---

## Item shape reference

`addItem` callers (on `CardDetailPage`) must pass these fields. `ListDetailPage` is read-only with respect to item shape.

| Field | Type | Source |
|---|---|---|
| `itemId` | string (UUID) | added by `useLists.addItem` |
| `cardId` | number | `card.id` |
| `cardName` | string | `card.name` |
| `cardImage` | string | image URL |
| `setName` | string | `set_entry.set_name` |
| `setCode` | string | `set_entry.set_code` |
| `setRarityCode` | string | `set_entry.set_rarity_code` |
| `setUrl` | string \| undefined | TCGPlayer URL if available |
| `setPrice` | string | `set_entry.set_price` |
| `condition` | "NM"\|"LP"\|"MP"\|"HP"\|"DMG" | default "NM" at add time |
| `quantity` | 1\|2\|3 | default 1 at add time |

---

## Tokens used

All already defined in `tokens.css`. No new tokens needed.

`--red` · `--gold` · `--navy` · `--nav-text` · `--text-primary` · `--text-secondary` · `--bg-surface` · `--border` · `--font-display` · `--font-body` · `--radius-sm` · `--radius-md` · `--section-pad`
