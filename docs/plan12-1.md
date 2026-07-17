# Banlist Page — Search + Jump Buttons

## Overview

Two additive features on top of the existing color-coded table.
No new files, no changes outside `BanlistPage.jsx`.

---

## Changes to `BanlistTable`

### Add `id` prop to the section header div

`BanlistTable` currently renders the section header as a plain `<div>`.
Add an `anchorId` prop and apply it:

```jsx
function BanlistTable({ title, cards, statusKey, anchorId }) {
  ...
  return (
    <>
      <div id={anchorId} style={{ ... }}>
```

The three call sites will pass:
- `anchorId="forbidden"`
- `anchorId="limited"`
- `anchorId="semi-limited"`

`statusKey` stays unchanged (`'semiLimited'`) — the anchor ID is separate.

---

## Changes to `BanlistPage`

### 1. Import `useState`

```js
import { useState } from 'react'
```

### 2. Add search state

```js
const [search, setSearch] = useState('')
```

Plain local `useState` — no URL param. The banlist is a static lookup;
preserving filter state across navigation adds no user value here.

### 3. Derive filtered arrays

After the loading/error guards, derive three filtered arrays from `search`
and the raw data. When `search` is empty, the filtered arrays equal the
originals (no extra work in the no-filter case):

```js
const q = search.trim().toLowerCase()

const filteredForbidden   = q ? data.forbidden.filter(c   => c.name.toLowerCase().includes(q)) : data.forbidden
const filteredLimited     = q ? data.limited.filter(c     => c.name.toLowerCase().includes(q)) : data.limited
const filteredSemiLimited = q ? data.semiLimited.filter(c => c.name.toLowerCase().includes(q)) : data.semiLimited

const allEmpty = q && filteredForbidden.length === 0 && filteredLimited.length === 0 && filteredSemiLimited.length === 0
```

### 4. JSX layout in `BanlistPage` return

Top to bottom order after the subtitle `<p>`:

```
<input type="search" ...>          ← always visible
{!q && <JumpButtons />}            ← hidden when search active
{allEmpty && <EmptyMessage />}     ← only when all sections empty
{!allEmpty sections}               ← skip sections with 0 results
```

### 5. Search input

```jsx
<input
  type="search"
  placeholder="Search banned cards…"
  value={search}
  onChange={e => setSearch(e.target.value)}
  style={{
    width: '100%',
    height: '40px',
    padding: '0 12px',
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    background: 'var(--bg-surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    outline: 'none',
    marginBottom: 24,
    boxSizing: 'border-box',
  }}
/>
```

No debounce needed — the banlist is ~221 cards, entirely in memory.
Client-side filter is instant at this scale.

### 6. Jump buttons

Rendered only when `!q` (hidden during active search):

```jsx
{!q && (
  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
    <button
      onClick={() => document.getElementById('forbidden').scrollIntoView({ behavior: 'smooth', block: 'start' })}
      style={{ fontFamily: 'var(--font-body)', fontSize: 12, padding: '6px 14px',
               borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
               background: 'var(--red)', color: 'var(--white)' }}
    >
      Forbidden
    </button>
    <button
      onClick={() => document.getElementById('limited').scrollIntoView({ behavior: 'smooth', block: 'start' })}
      style={{ fontFamily: 'var(--font-body)', fontSize: 12, padding: '6px 14px',
               borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
               background: 'var(--gold)', color: 'var(--card-normal-text)' }}
    >
      Limited
    </button>
    <button
      onClick={() => document.getElementById('semi-limited').scrollIntoView({ behavior: 'smooth', block: 'start' })}
      style={{ fontFamily: 'var(--font-body)', fontSize: 12, padding: '6px 14px',
               borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
               background: 'var(--cyan)', color: 'var(--card-link-text)' }}
    >
      Semi-Limited
    </button>
  </div>
)}
```

### 7. Section rendering with conditional hide

Replace the three static `<BanlistTable>` calls with conditional rendering.
The section header count displays the filtered count automatically because
`cards.length` inside `BanlistTable` reflects whatever array is passed in.

```jsx
{(!q || filteredForbidden.length > 0) && (
  <BanlistTable title="Forbidden"    cards={filteredForbidden}   statusKey="forbidden"   anchorId="forbidden"   />
)}
{(!q || filteredLimited.length > 0) && (
  <BanlistTable title="Limited"      cards={filteredLimited}     statusKey="limited"     anchorId="limited"     />
)}
{(!q || filteredSemiLimited.length > 0) && (
  <BanlistTable title="Semi-Limited" cards={filteredSemiLimited} statusKey="semiLimited" anchorId="semi-limited" />
)}
```

### 8. Empty state message

```jsx
{allEmpty && (
  <p style={{
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginTop: 48,
  }}>
    &ldquo;{search.trim()}&rdquo; is not on the banlist.
  </p>
)}
```

---

## File checklist

| File | Action |
|---|---|
| `client/src/pages/BanlistPage.jsx` | Edit only |

Single file, eight targeted changes. No new files, no other edits.

---

## Interaction contract summary

| State | Search input | Jump buttons | Sections | Empty message |
|---|---|---|---|---|
| No search | visible | visible | all 3 | hidden |
| Search, ≥1 result | visible | hidden | non-empty only | hidden |
| Search, 0 results | visible | hidden | none | visible |
</thinking>
