# Slice 1: Foundation — Plan

Three deliverables, no code dependencies between them. Build in order below; each is self-contained.

---

## 1. `client/src/styles/tokens.css`

All values in `:root {}`. No hex values appear anywhere outside this file.

### UI shell

| Custom property | Hex | Source |
|---|---|---|
| `--bg-page` | `#fafafa` | Design doc — City Streets scheme |
| `--bg-surface` | `#f0f0f0` | Design doc |
| `--border` | `#e0e0e0` | Design doc |
| `--text-primary` | `#1c1c1c` | Design doc |
| `--text-secondary` | `#6b6b6b` | Design doc |
| `--navy` | `#1a3a5c` | Design doc |
| `--nav-text` | `#E8D8A0` | Design doc |
| `--cyan` | `#4DB8D4` | Design doc |
| `--gold` | `#C9A84C` | Design doc — price display only |
| `--red` | `#B33020` | Design doc — danger/banned; define now even though banlist is post-MVP |

### Layout

| Custom property | Value | Source |
|---|---|---|
| `--nav-height` | `56px` | Design doc layout specs |
| `--sidebar-width` | `220px` | Design doc layout specs |
| `--card-gap` | `16px` | Design doc layout specs |
| `--section-padding` | `24px` | Design doc layout specs |

### Typography

| Custom property | Value |
|---|---|
| `--font-display` | `'Cinzel', serif` |
| `--font-body` | `'DM Sans', sans-serif` |

Type scale (mirrors design doc table exactly):

| Custom property | Value | Element |
|---|---|---|
| `--text-page-title` | `28px` | Page title |
| `--text-section-heading` | `18px` | Section heading |
| `--text-card-name-tile` | `13px` | Card name in tile |
| `--text-card-name-detail` | `20px` | Card name in detail view |
| `--text-filter-label` | `13px` | Filter labels |
| `--text-stat` | `12px` | ATK/DEF/Level numbers |
| `--text-badge` | `10px` | Badge text (ALL CAPS in usage) |

### Card type tokens — 9 types × 3 tokens = 27 properties

Each group: `-bg` (stripe/frame color) · `-light` (badge fill) · `-text` (badge text).

**Normal Monster**
- `--card-normal-bg: #D4A84B`
- `--card-normal-light: #F5DFA0`
- `--card-normal-text: #5C3A00`

**Effect Monster**
- `--card-effect-bg: #C87B2A`
- `--card-effect-light: #F0C890`
- `--card-effect-text: #5C3A00`

**Spell Card**
- `--card-spell-bg: #1A8A6E`
- `--card-spell-light: #C8EDE5`
- `--card-spell-text: #0A3D2E`

**Trap Card**
- `--card-trap-bg: #9B2C6E`
- `--card-trap-light: #F0C8DE`
- `--card-trap-text: #4A0A2E`

**Fusion Monster**
- `--card-fusion-bg: #6B4A9B`
- `--card-fusion-light: #E0D0F5`
- `--card-fusion-text: #2A1A50`

**Synchro Monster**
- `--card-synchro-bg: #C8C8C8`
- `--card-synchro-light: #F5F5F5`
- `--card-synchro-text: #2e2e2e`

**Xyz Monster**
- `--card-xyz-bg: #1c1c1c`
- `--card-xyz-light: #3a3a3a`
- `--card-xyz-text: #e0e0e0`

**Link Monster**
- `--card-link-bg: #1A4A8A`
- `--card-link-light: #C0D8F5`
- `--card-link-text: #0A1E40`

**Ritual Monster**
- `--card-ritual-bg: #4A90C8`
- `--card-ritual-light: #C8E0F5`
- `--card-ritual-text: #0A2A50`

---

## 2. `client/src/utils/cardTypeColors.js`

Two exported functions. No hex values in this file — all return `var(--…)` strings referencing tokens defined in `tokens.css`.

### Type key mapping

The YGOPRODeck API returns verbose type strings. Map them to the short CSS key:

| API value | Key |
|---|---|
| `"Normal Monster"` | `normal` |
| `"Effect Monster"` | `effect` |
| `"Spell Card"` | `spell` |
| `"Trap Card"` | `trap` |
| `"Fusion Monster"` | `fusion` |
| `"Synchro Monster"` | `synchro` |
| `"Xyz Monster"` | `xyz` |
| `"Link Monster"` | `link` |
| `"Ritual Monster"` | `ritual` |

Normalization strategy: lowercase the API string, extract the first word, match against the map. Unknown types fall back to `normal` so the UI never breaks on a new card type.

### `getTypeStripeColor(type)`

Returns the `-bg` var string for use as a border or background stripe color on `CardTile`.

```
"Normal Monster" → "var(--card-normal-bg)"
"Xyz Monster"    → "var(--card-xyz-bg)"
```

### `getTypeBadgeStyles(type)`

Returns a plain object suitable for spreading into a `style` prop on `CardTypeBadge`.

```
"Spell Card" → {
  backgroundColor: "var(--card-spell-light)",
  color: "var(--card-spell-text)"
}
```

No border, no font — those are structural and belong in the component's CSS.

---

## 3. `client/index.html` — Google Fonts link tags

Insert three `<link>` tags in `<head>`, before any stylesheet:

1. `<link rel="preconnect" href="https://fonts.googleapis.com">`
2. `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
3. The CSS2 font loader — Cinzel weights 400 and 600, DM Sans weights 400 and 500, `display=swap`

The combined URL loads both families in one request. `display=swap` prevents invisible text during load.

---

## Execution order

1. Write `tokens.css` — all 40+ properties in a single `:root {}` block.
2. Write `cardTypeColors.js` — type map, then the two functions.
3. Edit `index.html` — insert the three `<link>` tags.

No server changes. No component changes. This slice has no runtime behavior to test — correctness is verified when components in later slices render the correct colors.
