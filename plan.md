# Slice D — Add to List Modal

**Only file changed:** `client/src/pages/CardDetailPage.jsx`

---

## 1. Imports

Add two named imports at the top of the file:

```js
import { useLists, CONDITION_MULTIPLIERS } from '../hooks/useLists'
```

`CONDITION_MULTIPLIERS` is already exported from `useLists.js` (line 5). No new files needed.

---

## 2. Hook call

Inside the component body, below the existing `useState` calls, add:

```js
const { lists, createList, addItem } = useLists()
```

Only destructure what the modal needs. `getList` is not required — derive the selected list inline from `lists.find(l => l.id === selectedListId)`.

---

## 3. New state variables

Add after the existing `useState` declarations (lines 11–13):

| Variable | Type | Default | Purpose |
|---|---|---|---|
| `modalOpen` | boolean | `false` | Controls modal visibility |
| `selectedListId` | string | `'wish-list'` | Which list is selected in the List dropdown |
| `showNewListInput` | boolean | `false` | Show inline text input for new list name |
| `newListName` | string | `''` | Controlled value for the new list name input |
| `selectedSetIndex` | number | `0` | Index into `modalSets` (cheapest-first sorted) |
| `condition` | string | `'NM'` | Selected condition |
| `quantity` | number | `1` | Selected quantity |
| `toastVisible` | boolean | `false` | Controls toast display |
| `toastMessage` | string | `''` | Toast text |

---

## 4. Derived values (inside component, before return)

```js
// Reuse existing sortSets helper — 'best' puts cheapest first, $0.00 at bottom
const modalSets = card.card_sets ? sortSets(card.card_sets, 'best') : []

const selectedSet   = modalSets[selectedSetIndex]
const selectedList  = lists.find(l => l.id === selectedListId)
const estimatedCost = parseFloat(selectedSet?.set_price || 0)
                      * CONDITION_MULTIPLIERS[condition]
                      * quantity
```

These update reactively as state changes — no `useMemo` needed at this scale.

---

## 5. Button insertion point

Insert immediately after the closing `</p>` of the TCGPlayer price block (currently line 140) and before the `{card.card_sets && (` block (line 142):

```jsx
<button
  onClick={() => setModalOpen(true)}
  style={{
    width: '100%',
    padding: '10px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'var(--navy)',
    color: 'var(--nav-text)',
    cursor: 'pointer',
    marginTop: '16px',
    marginBottom: '16px',
  }}
>
  Add to list
</button>
```

The button renders unconditionally (even cards with no price can be added to a list).

---

## 6. Modal (rendered inside the component's return, after the main `<div>`)

Render below the closing `</div>` of the page wrapper, as a sibling node in the fragment. Condition: `{modalOpen && ( … )}`.

### 6a. Overlay

```js
position: 'fixed', inset: 0,
background: 'rgba(0,0,0,0.45)',
display: 'flex', alignItems: 'center', justifyContent: 'center',
zIndex: 100
```

Click on overlay itself closes modal: `onClick={() => setModalOpen(false)}`. Stop propagation on the inner card: `onClick={e => e.stopPropagation()}`.

### 6b. Modal card

```js
background: 'var(--bg-page)',
borderRadius: 'var(--radius-lg)',
border: '0.5px solid var(--border)',
padding: '24px',
width: '480px',
maxWidth: '92vw',
```

### 6c. Header row

Flex row, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, `marginBottom: '16px'`.

**Left side** — card context (flex row, `gap: '12px'`, `alignItems: 'center'`):
- Thumbnail: `src={card.card_images?.[0]?.image_url_small}`, `width: '48px'`, `borderRadius: 'var(--radius-sm)'`, `loading="lazy"`, `decoding="async"`.
- Card info column:
  - Card name: `fontFamily: 'var(--font-display)'`, `fontSize: '15px'`, `color: 'var(--text-primary)'`, `margin: 0`.
  - `<CardTypeBadge type={card.type} />` — already imported.

**Right side** — close button:
```jsx
<button onClick={() => setModalOpen(false)} style={{
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '20px', color: 'var(--text-secondary)',
  lineHeight: 1, padding: 0,
}}>
  ×
</button>
```

### 6d. Multiple-arts note

Immediately below the header row, condition `{card.card_images?.length > 1 && ( … )}`:

```jsx
<p style={{
  fontSize: '11px', color: 'var(--text-secondary)',
  fontStyle: 'italic', marginBottom: '12px', marginTop: 0,
}}>
  Multiple arts available — verify art on TCGPlayer.
</p>
```

### 6e. Form fields

All four fields use the same label pattern:

```jsx
<label style={{
  fontSize: '12px', color: 'var(--text-secondary)',
  marginBottom: '4px', display: 'block',
}}>
  {labelText}
</label>
<select style={{
  width: '100%', height: '36px', padding: '0 10px',
  fontFamily: 'var(--font-body)', fontSize: '13px',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-surface)',
  color: 'var(--text-primary)', marginBottom: '12px',
}}>
```

**Field 1 — List:**

Label: `'Add to list'`

```jsx
<select
  value={showNewListInput ? '__create__' : selectedListId}
  onChange={e => {
    if (e.target.value === '__create__') {
      setShowNewListInput(true)
    } else {
      setShowNewListInput(false)
      setSelectedListId(e.target.value)
    }
  }}
>
  {lists.map(l => (
    <option key={l.id} value={l.id}>{l.name}</option>
  ))}
  <option disabled>──────────</option>
  <option value="__create__">+ Create new list</option>
</select>
```

When `showNewListInput` is true, render an inline `<input>` below the select:

```jsx
{showNewListInput && (
  <input
    autoFocus
    value={newListName}
    onChange={e => setNewListName(e.target.value)}
    onBlur={() => {
      if (newListName.trim()) {
        const created = createList(newListName.trim())
        setSelectedListId(created.id)
        setNewListName('')
        setShowNewListInput(false)
      }
    }}
    onKeyDown={e => {
      if (e.key === 'Enter' && newListName.trim()) {
        const created = createList(newListName.trim())
        setSelectedListId(created.id)
        setNewListName('')
        setShowNewListInput(false)
      }
    }}
    placeholder="List name…"
    style={{
      width: '100%', height: '36px', padding: '0 10px',
      fontFamily: 'var(--font-body)', fontSize: '13px',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      marginBottom: '12px',
      boxSizing: 'border-box',
    }}
  />
)}
```

Note: `createList` returns the new list object (see `useLists.js` lines 62–71), so we can grab its `id` immediately.

**Field 2 — Set & Printing:**

Label: `'Set'`

Options from `modalSets` (already sorted cheapest-first, $0.00 at bottom via reused `sortSets(card.card_sets, 'best')`). If `card.card_sets` is empty/undefined, render a single disabled placeholder option.

```jsx
<select
  value={selectedSetIndex}
  onChange={e => setSelectedSetIndex(Number(e.target.value))}
  disabled={modalSets.length === 0}
>
  {modalSets.length === 0
    ? <option>No printings listed</option>
    : modalSets.map((s, i) => (
        <option key={`${s.set_code}-${s.set_rarity}-${i}`} value={i}>
          {s.set_name} · {s.set_rarity} · ${parseFloat(s.set_price || 0).toFixed(2)}
        </option>
      ))
  }
</select>
```

Default `selectedSetIndex` is `0` — the cheapest available printing.

**Field 3 — Condition:**

Label: `'Condition'`

```jsx
<select value={condition} onChange={e => setCondition(e.target.value)}>
  <option value="NM">Near Mint</option>
  <option value="LP">Lightly Played</option>
  <option value="MP">Moderately Played</option>
  <option value="HP">Heavily Played</option>
  <option value="DMG">Damaged</option>
</select>
```

**Field 4 — Quantity:**

Label: `'Quantity'`

```jsx
<select value={quantity} onChange={e => setQuantity(Number(e.target.value))}>
  <option value={1}>1</option>
  <option value={2}>2</option>
  <option value={3}>3</option>
</select>
```

### 6f. Live price estimate

Below the four fields, above the action buttons:

```jsx
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
    Estimated cost
  </span>
  <span style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: 500 }}>
    ${estimatedCost.toFixed(2)}
  </span>
</div>
```

`estimatedCost` re-evaluates on every render as `selectedSetIndex`, `condition`, or `quantity` changes — no extra wiring needed.

### 6g. Action buttons

```jsx
<div style={{
  display: 'flex', gap: '8px',
  justifyContent: 'flex-end', marginTop: '16px',
}}>
  <button
    onClick={() => setModalOpen(false)}
    style={{ /* ghost style — see below */ }}
  >
    Cancel
  </button>
  <button
    onClick={handleAddToList}
    style={{ /* navy style — see below */ }}
  >
    Add to list
  </button>
</div>
```

**Ghost style** (Cancel):
```js
background: 'none', border: '0.5px solid var(--border)',
borderRadius: 'var(--radius-md)', padding: '8px 16px',
fontFamily: 'var(--font-body)', fontSize: '13px',
color: 'var(--text-secondary)', cursor: 'pointer',
```

**Navy style** (Add to list):
```js
background: 'var(--navy)', border: 'none',
borderRadius: 'var(--radius-md)', padding: '8px 16px',
fontFamily: 'var(--font-body)', fontSize: '13px',
color: 'var(--nav-text)', cursor: 'pointer',
```

---

## 7. handleAddToList function

Define inside the component body (before return):

```js
function handleAddToList() {
  const list = lists.find(l => l.id === selectedListId)
  const s    = modalSets[selectedSetIndex]

  addItem(selectedListId, {
    cardId:        card.id,
    cardName:      card.name,
    cardImage:     card.card_images?.[0]?.image_url_small,
    cardType:      card.type,
    setName:       s?.set_name ?? '',
    setCode:       s?.set_code ?? '',
    setRarity:     s?.set_rarity ?? '',
    setRarityCode: s?.set_rarity_code ?? '',
    setPrice:      s?.set_price ?? '0.00',
    setUrl:        s?.set_url ?? null,
    condition,
    quantity,
  })

  setModalOpen(false)

  const listName = list?.name ?? 'list'
  setToastMessage(`Added to ${listName}`)
  setToastVisible(true)
  setTimeout(() => setToastVisible(false), 2000)
}
```

---

## 8. Toast

Rendered as a sibling of the modal fragment, outside the page `<div>`:

```jsx
{toastVisible && (
  <div style={{
    position: 'fixed', bottom: '24px',
    left: '50%', transform: 'translateX(-50%)',
    background: 'var(--navy)', color: 'var(--nav-text)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    zIndex: 200,
    whiteSpace: 'nowrap',
  }}>
    {toastMessage}
  </div>
)}
```

`zIndex: 200` sits above the modal (`100`) so a toast triggered while the modal is closing remains visible.

---

## 9. Return structure after changes

```jsx
return (
  <>
    <div style={{ maxWidth: '560px', … }}>
      {/* … existing page content … */}

      {/* NEW: Add to list button (between price and sets) */}
      <button onClick={() => setModalOpen(true)} … >Add to list</button>

      {/* existing sets section */}
      {card.card_sets && ( … )}
    </div>

    {/* NEW: Modal */}
    {modalOpen && (
      <div onClick={() => setModalOpen(false)} style={{ /* overlay */ }}>
        <div onClick={e => e.stopPropagation()} style={{ /* card */ }}>
          {/* header, note, fields, estimate, buttons */}
        </div>
      </div>
    )}

    {/* NEW: Toast */}
    {toastVisible && (
      <div style={{ /* toast */ }}>{toastMessage}</div>
    )}
  </>
)
```

The existing return is a single `<div>` — wrap the whole return in `<>…</>` to accommodate the two new siblings.

---

## 10. Checklist

- [ ] Add imports (`useLists`, `CONDITION_MULTIPLIERS`)
- [ ] Call `useLists()`, destructure `lists`, `createList`, `addItem`
- [ ] Add 9 state variables
- [ ] Add derived values (`modalSets`, `selectedSet`, `selectedList`, `estimatedCost`)
- [ ] Add `handleAddToList` function
- [ ] Wrap existing return in fragment `<>…</>`
- [ ] Insert "Add to list" button between price and sets
- [ ] Render modal overlay + card with all sub-sections
- [ ] Render toast
