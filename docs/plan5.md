# Slice 5 — Filter Sidebar

## Pre-flight checks

### BrowsePage.jsx — prop wiring (line 36–42)
`onUpdate={updateParam}` is already passed correctly. No changes needed.

```jsx
<FilterSidebar
  type={type}
  attribute={attribute}
  levelMin={levelMin}
  levelMax={levelMax}
  onUpdate={updateParam}    // ✓ present, correctly named
/>
```

---

## Files to create / replace

| File | Status |
|---|---|
| `client/src/components/filters/FilterSidebar.jsx` | Replace stub |
| `client/src/components/filters/TypeFilter.jsx` | Create (missing) |
| `client/src/components/filters/AttributeFilter.jsx` | Create (missing) |
| `client/src/components/filters/LevelRangeFilter.jsx` | Create (missing) |

---

## 1. FilterSidebar.jsx

**Replace the stub entirely.**

### Stub bug to fix
The current stub uses `minHeight: 'calc(100vh - var(--nav-height))'`. This must
become `maxHeight` — without it the sidebar won't scroll when its content is
taller than the viewport. The stub also lacks `overflowY: 'auto'`.

### Layout
```
<aside>                     sticky, top: var(--nav-height)
  ├── header row            "Filters" label | "Clear all" button (conditional)
  ├── <TypeFilter />
  ├── <AttributeFilter />
  └── <LevelRangeFilter />
```

### Props received
| Prop | Type | Source |
|---|---|---|
| `type` | string | URL param `type`, empty string when unset |
| `attribute` | string | URL param `attribute`, empty string when unset |
| `levelMin` | number | URL param `levelMin`, defaults to 1 |
| `levelMax` | number | URL param `levelMax`, defaults to 12 |
| `onUpdate` | function | `updateParam(key, value)` from BrowsePage |

### `hasFilters` logic
```js
const hasFilters = type || attribute || levelMin > 1 || levelMax < 12
```
"Clear all" button renders only when `hasFilters` is truthy.

### `clearAll` — calls onUpdate four times
```js
function clearAll() {
  onUpdate('type', '')
  onUpdate('attribute', '')
  onUpdate('levelMin', '')
  onUpdate('levelMax', '')
}
```
Each call uses the functional-updater form inside `setSearchParams`, so React 18
batching applies the four updates sequentially without state loss.

### Sidebar styles (all via CSS tokens)
| Property | Value |
|---|---|
| `width` | `var(--sidebar-width)` — resolves to 220px |
| `flexShrink` | `0` |
| `borderRight` | `0.5px solid var(--border)` |
| `padding` | `var(--section-pad) 16px` |
| `display` | `flex` |
| `flexDirection` | `column` |
| `gap` | `24px` |
| `alignSelf` | `flex-start` |
| `position` | `sticky` |
| `top` | `var(--nav-height)` |
| `maxHeight` | `calc(100vh - var(--nav-height))` |
| `overflowY` | `auto` |

### Header row styles
| Element | Key styles |
|---|---|
| "Filters" `<p>` | `fontSize 13px`, `fontWeight 500`, `color var(--text-primary)` |
| "Clear all" `<button>` | `fontSize 11px`, `color var(--cyan)`, `background none`, `border none`, `cursor pointer` |
Header row container: `display flex`, `justifyContent space-between`, `alignItems center`.

### Child wiring
```jsx
<TypeFilter      value={type}      onChange={v => onUpdate('type', v)} />
<AttributeFilter value={attribute} onChange={v => onUpdate('attribute', v)} />
<LevelRangeFilter
  min={levelMin}
  max={levelMax}
  onMinChange={v => onUpdate('levelMin', v)}
  onMaxChange={v => onUpdate('levelMax', v)}
/>
```

---

## 2. TypeFilter.jsx

Vertical button list. No external state — purely controlled via `value` + `onChange`.

### Props
| Prop | Type |
|---|---|
| `value` | string — current type value from URL (empty string = "All") |
| `onChange` | function — called with the new type value string |

### Button list — 10 entries
| `value` passed to onChange | `label` displayed |
|---|---|
| `''` (empty string) | All |
| `'Normal Monster'` | Normal |
| `'Effect Monster'` | Effect |
| `'Fusion Monster'` | Fusion |
| `'Synchro Monster'` | Synchro |
| `'Xyz Monster'` | Xyz |
| `'Link Monster'` | Link |
| `'Ritual Monster'` | Ritual |
| `'Spell Card'` | Spell |
| `'Trap Card'` | Trap |

### Button styles (controlled by `value === t.value`)
| State | `background` | `color` |
|---|---|---|
| Active | `var(--navy)` | `var(--nav-text)` |
| Inactive | `transparent` | `var(--text-primary)` |

Other button properties (both states): `textAlign left`, `padding 5px 8px`,
`borderRadius var(--radius-sm)`, `border none`, `fontFamily var(--font-body)`,
`fontSize 13px`, `cursor pointer`.

### Section label style
`fontSize 11px`, `fontWeight 500`, `color var(--text-secondary)`,
`textTransform uppercase`, `letterSpacing .06em`, `marginBottom 8px`.

### List container
`display flex`, `flexDirection column`, `gap 2px`.

---

## 3. AttributeFilter.jsx

Native `<select>`. No external state — purely controlled.

### Props
| Prop | Type |
|---|---|
| `value` | string — current attribute from URL (empty string = "All") |
| `onChange` | function — called with `e.target.value` |

### Option list — 8 entries (in order)
```
''       → displays as "All attributes"
'DARK'
'LIGHT'
'FIRE'
'WATER'
'WIND'
'EARTH'
'DIVINE'
```
Empty-string option renders label `'All attributes'`; all others render their
value as the label.

### Select styles
| Property | Value |
|---|---|
| `width` | `100%` |
| `padding` | `6px 8px` |
| `fontFamily` | `var(--font-body)` |
| `fontSize` | `13px` |
| `background` | `var(--bg-surface)` |
| `border` | `0.5px solid var(--border)` |
| `borderRadius` | `var(--radius-md)` |
| `color` | `var(--text-primary)` |
| `cursor` | `pointer` |

---

## 4. LevelRangeFilter.jsx

Two number inputs with a "to" label between them.

### Props
| Prop | Type | Notes |
|---|---|---|
| `min` | number | Current levelMin value (1–12) |
| `max` | number | Current levelMax value (1–12) |
| `onMinChange` | function | Called with `Number(e.target.value)` |
| `onMaxChange` | function | Called with `Number(e.target.value)` |

### Input constraints
| Input | `min` attr | `max` attr | `value` |
|---|---|---|---|
| Min input | `1` | `max` (current prop) | `min` prop |
| Max input | `min` (current prop) | `12` | `max` prop |

This keeps the ranges self-constraining as the user adjusts them.

### Layout
Row: `display flex`, `alignItems center`, `gap 8px`.

"to" span: `fontSize 12px`, `color var(--text-secondary)`.

### Input styles (both inputs share)
| Property | Value |
|---|---|
| `width` | `52px` |
| `padding` | `5px` |
| `fontFamily` | `var(--font-body)` |
| `fontSize` | `13px` |
| `background` | `var(--bg-surface)` |
| `border` | `0.5px solid var(--border)` |
| `borderRadius` | `var(--radius-sm)` |
| `color` | `var(--text-primary)` |
| `textAlign` | `center` |

---

## Color token audit

No hex values in any JSX file. Every color reference must use a CSS custom
property from `tokens.css`. Checklist:

| Token used | Where |
|---|---|
| `var(--text-primary)` | FilterSidebar "Filters" label, TypeFilter inactive button text, AttributeFilter select, LevelRangeFilter inputs |
| `var(--text-secondary)` | TypeFilter section label, AttributeFilter section label, LevelRangeFilter section label + "to" span |
| `var(--cyan)` | FilterSidebar "Clear all" button |
| `var(--navy)` | TypeFilter active button background |
| `var(--nav-text)` | TypeFilter active button text |
| `var(--border)` | FilterSidebar borderRight, AttributeFilter select border, LevelRangeFilter input borders |
| `var(--bg-surface)` | AttributeFilter select background, LevelRangeFilter input backgrounds |
| `var(--sidebar-width)` | FilterSidebar width (layout token, not a color) |
| `var(--section-pad)` | FilterSidebar padding (layout token) |
| `var(--nav-height)` | FilterSidebar sticky top + maxHeight |
| `var(--radius-sm)` | TypeFilter button radius, LevelRangeFilter input radius |
| `var(--radius-md)` | AttributeFilter select radius |
| `var(--font-body)` | All interactive elements |

---

## Implementation order

1. Create `TypeFilter.jsx` — standalone, no imports needed
2. Create `AttributeFilter.jsx` — standalone, no imports needed
3. Create `LevelRangeFilter.jsx` — standalone, no imports needed
4. Replace `FilterSidebar.jsx` — imports all three; fix `minHeight` → `maxHeight`
5. Smoke-test: open `/browse`, verify sidebar is sticky, each filter updates URL params, "Clear all" appears/disappears correctly, level inputs cross-constrain
