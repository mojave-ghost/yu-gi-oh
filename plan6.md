# Slice 6 — Sort + Pagination

## Current state

Both components are null stubs with no props accepted:
- `client/src/components/sort/SortControl.jsx` — `export default function SortControl() { return null }`
- `client/src/components/pagination/Pagination.jsx` — `export default function Pagination() { return null }`

---

## BrowsePage prop audit

BrowsePage already passes the right prop names to both stubs.

**SortControl** (line 47):
```jsx
<SortControl value={sort} onChange={v => updateParam('sort', v)} />
```
- `value` → string from URL param, default `'name'` ✓
- `onChange` → calls `updateParam('sort', v)` ✓

**Pagination** (lines 53–58):
```jsx
<Pagination
  page={page}
  total={data.total}
  perPage={24}
  onPageChange={p => updateParam('page', p)}
/>
```
- `page` → number ✓
- `total` → number from `data.total` ✓
- `perPage` → hardcoded `24` ✓
- `onPageChange` → calls `updateParam('page', p)` ✓

**Flag — BrowsePage bug that will break pagination:**
`updateParam` unconditionally appends `next.set('page', '1')` after setting any key. When `onPageChange` calls `updateParam('page', 3)`, the function sets page to `3` and then immediately overwrites it with `'1'`. Navigation to any page beyond 1 is silently broken.

Fix required in `BrowsePage.jsx` (line 29) — guard the reset:
```js
if (key !== 'page') next.set('page', '1')
```

This fix must land in the same slice, before or alongside the Pagination component.

---

## SortControl.jsx

**File:** `client/src/components/sort/SortControl.jsx`

Replace the null stub entirely.

**Props:** `value` (string), `onChange` (function).

**Options array** (order is fixed):
```
{ value: 'name',  label: 'Name A–Z'     }
{ value: 'atk',   label: 'ATK high–low' }
{ value: 'def',   label: 'DEF high–low' }
{ value: 'level', label: 'Level'        }
{ value: 'price', label: 'Price'        }
```

**Element:** a single native `<select>` — no wrapper div needed.

**Behavior:** controlled — `value` prop drives the selected option; `onChange` fires `e => onChange(e.target.value)`.

**`aria-label`:** `"Sort cards by"` (no visible label in layout).

**`flexShrink: 0`** — required so the select doesn't squash against SearchBar in the flex row.

**Styles** (all token-based, no hex):
| Property | Value |
|---|---|
| padding | `6px 10px` |
| fontFamily | `var(--font-body)` |
| fontSize | `13px` |
| background | `var(--bg-surface)` |
| border | `0.5px solid var(--border)` |
| borderRadius | `var(--radius-md)` |
| color | `var(--text-primary)` |
| cursor | `pointer` |
| flexShrink | `0` |

No hex values. No module CSS file needed — inline styles only, matching the rest of the codebase.

---

## Pagination.jsx

**File:** `client/src/components/pagination/Pagination.jsx`

Replace the null stub entirely.

**Props:** `page` (number), `total` (number), `perPage` (number), `onPageChange` (function).

**Early return:** `if (totalPages <= 1) return null` where `totalPages = Math.ceil(total / perPage)`.

**Layout:** centered flex row.
```
[ ← Prev ]   Page 3 of 48 · 1,142 cards   [ Next → ]
```

**Container styles:**
| Property | Value |
|---|---|
| display | `flex` |
| alignItems | `center` |
| justifyContent | `center` |
| gap | `12px` |
| marginTop | `2rem` |
| fontFamily | `var(--font-body)` |
| fontSize | `13px` |

**Prev button:**
- label: `← Prev`
- `onClick`: `() => onPageChange(page - 1)`
- `disabled` when `page <= 1`
- `opacity: page <= 1 ? 0.4 : 1`
- `cursor: page <= 1 ? 'default' : 'pointer'`

**Center label** (`<span>`):
- text: `` `Page ${page} of ${totalPages} · ${total.toLocaleString()} cards` ``
- `color: var(--text-secondary)`

**Next button:**
- label: `Next →`
- `onClick`: `() => onPageChange(page + 1)`
- `disabled` when `page >= totalPages`
- `opacity: page >= totalPages ? 0.4 : 1`
- `cursor: page >= totalPages ? 'default' : 'pointer'`

**Button shared styles:**
| Property | Value |
|---|---|
| padding | `6px 14px` |
| borderRadius | `var(--radius-md)` |
| border | `0.5px solid var(--border)` |
| background | `var(--bg-surface)` |
| color | `var(--text-primary)` |

No hex values. No module CSS file needed.

---

## Implementation order

1. Fix `BrowsePage.jsx` — guard `next.set('page', '1')` so it only fires when `key !== 'page'`.
2. Write `SortControl.jsx`.
3. Write `Pagination.jsx`.

No new files, no new packages, no new tokens needed.
