# YGO Card Database — Battle City
**Design Document v1.1** · *Updated: City Streets theme selected, card type colors matched to physical cards*
React + Node · Target user: returning TCG players · Card browsing + pricing

---

## Guiding principle

> "How it works is more important than how it looks."
> — Tracy Osborn, *Hello Web Design*

Every decision below is filtered through one question: **does this help a returning player find a card and its price faster?** If not, cut it.

---

## Color extraction — Battle City source material

Key hues pulled from the Battle City arc screenshots:

| Extracted color | Hex | Source |
|---|---|---|
| Fortress navy | `#1a3a5c` | Duelist Kingdom / arena walls |
| Deep midnight | `#0d2035` | Shadow backgrounds, night sky |
| Parchment warm | `#E8D8A0` | Duel field surface |
| Off-white | `#f5f0e8` | Card face, light surfaces |
| Millennium gold | `#C9A84C` | Puzzle, Eye of Anubis glyph |
| Arena cyan | `#4DB8D4` | Platform glow, manga speed lines |
| City sky blue | `#2a7fa8` | Domino City skyline |
| Kaiba red | `#B33020` | Coat, danger, banned cards |
| Yugi purple | `#6B3FA0` | Hair, trap cards |
| Ink black | `#2e2e2e` | Manga panel outlines |

---

## Selected scheme — City Streets ✓

Clean neutral shell, single cyan and gold pop. Modern-feeling with manga-panel energy. Color is reserved for data, not decoration.

| Role | Token | Hex | Notes |
|---|---|---|---|
| Page background | `--bg-page` | `#fafafa` | Near-white |
| Surface / card bg | `--bg-surface` | `#f0f0f0` | Light gray |
| Border | `--border` | `#e0e0e0` | Subtle separation |
| Primary text | `--text-primary` | `#1c1c1c` | Near-black |
| Secondary text | `--text-secondary` | `#6b6b6b` | Labels, muted |
| Nav / headers | `--navy` | `#1a3a5c` | Battle City navy anchor |
| Nav text | `--nav-text` | `#E8D8A0` | Parchment on navy |
| CTA / links | `--cyan` | `#4DB8D4` | Interactive, hover states |
| Price / value | `--gold` | `#C9A84C` | Only for TCG price display |
| Danger / banned | `--red` | `#B33020` | Forbidden badge |

---

## Card type colors — matched to physical cards

Extracted directly from the TCG card frames photographed above.

### Normal Monster — beige/orange
| Token | Hex | Notes |
|---|---|---|
| `--card-normal-bg` | `#D4A84B` | Warm tan/orange frame — the classic card gold |
| `--card-normal-light` | `#F5DFA0` | Light fill for badge background |
| `--card-normal-text` | `#5C3A00` | Dark brown text on badge |

### Effect Monster — orange (same frame family, slightly deeper)
| Token | Hex | Notes |
|---|---|---|
| `--card-effect-bg` | `#C87B2A` | Deeper burnt orange frame |
| `--card-effect-light` | `#F0C890` | Light fill |
| `--card-effect-text` | `#5C3A00` | Dark brown text |

### Spell Card — teal green
| Token | Hex | Notes |
|---|---|---|
| `--card-spell-bg` | `#1A8A6E` | Forest teal — from Return of the Dragon Lords frame |
| `--card-spell-light` | `#C8EDE5` | Light mint fill for badge |
| `--card-spell-text` | `#0A3D2E` | Deep green text on badge |

### Trap Card — magenta purple
| Token | Hex | Notes |
|---|---|---|
| `--card-trap-bg` | `#9B2C6E` | Hot magenta-purple — from Shadow Spell frame |
| `--card-trap-light` | `#F0C8DE` | Light pink fill for badge |
| `--card-trap-text` | `#4A0A2E` | Deep plum text on badge |

### Fusion Monster — purple
| Token | Hex | Notes |
|---|---|---|
| `--card-fusion-bg` | `#6B4A9B` | Medium purple |
| `--card-fusion-light` | `#E0D0F5` | Lavender fill |
| `--card-fusion-text` | `#2A1A50` | Deep purple text |

### Synchro Monster — white/silver
| Token | Hex | Notes |
|---|---|---|
| `--card-synchro-bg` | `#C8C8C8` | Silver-gray frame |
| `--card-synchro-light` | `#F5F5F5` | Near-white fill |
| `--card-synchro-text` | `#2e2e2e` | Ink text |

### Xyz Monster — black
| Token | Hex | Notes |
|---|---|---|
| `--card-xyz-bg` | `#1c1c1c` | Near-black frame |
| `--card-xyz-light` | `#3a3a3a` | Dark surface fill |
| `--card-xyz-text` | `#e0e0e0` | Light text on dark |

### Link Monster — dark blue
| Token | Hex | Notes |
|---|---|---|
| `--card-link-bg` | `#1A4A8A` | Dark cobalt blue |
| `--card-link-light` | `#C0D8F5` | Light blue fill |
| `--card-link-text` | `#0A1E40` | Navy text |

---

## Banlist status colors

| Status | Hex | Label color | Notes |
|---|---|---|---|
| Forbidden | `#B33020` | `#fff` | Kaiba red — no copies allowed |
| Limited | `#C9A84C` | `#5C3A00` | Gold — 1 copy |
| Semi-limited | `#4DB8D4` | `#0A3050` | Cyan — 2 copies |
| Unlimited | no badge | — | Don't show anything |

---

## Typography

Two typefaces only. Two weights each. Nothing else.

### Display — Cinzel
- Source: Google Fonts (`https://fonts.google.com/specimen/Cinzel`)
- Use for: page title, card names in detail view, section headers
- Weights: 400 (regular), 600 (bold — sparingly)
- Why: Egyptian-influenced serifs with geometric letterforms. Conveys ancient power without being unreadable.

### Body / UI — DM Sans
- Source: Google Fonts (`https://fonts.google.com/specimen/DM+Sans`)
- Use for: everything else — filter labels, stats, body text, nav items, badges
- Weights: 400 (regular), 500 (medium)
- Why: Geometric, clean, handles small sizes well. Pairs with Cinzel without competing.

### Type scale

| Element | Font | Size | Weight |
|---|---|---|---|
| Page title | Cinzel | 28px | 400 |
| Section heading | DM Sans | 18px | 500 |
| Card name (tile) | Cinzel | 13px | 400 |
| Card name (detail) | Cinzel | 20px | 400 |
| Filter labels | DM Sans | 13px | 400 |
| Stat numbers | DM Sans | 12px | 500 |
| Badge text | DM Sans | 10px | 500 (ALL CAPS) |

---

## Design principles

### 1. Cut clutter — one thing per card tile
Card tile shows: art, name, type badge, ATK/DEF (or price). Nothing else. Full card text, set info, rulings — those go in the detail panel on click. Less is not missing data, it's respecting the user's ability to click when they want more.

### 2. Use a grid
CSS Grid with `auto-fit, minmax(160px, 1fr)`. Cards snap to a predictable rhythm — 4 columns on desktop, 2 on mobile. No masonry, no variable heights, no janky reflows when images load.

### 3. Three UI colors maximum
Background, surface, one accent. The semantic card-type and banlist colors are data encoding — they don't count against the UI color budget. Mixing decoration and data is how interfaces get cluttered.

### 4. Two typefaces, two weights each
Cinzel for names and headers. DM Sans for everything else. No bold beyond weight 500. Adding a third font or heavier weight doesn't add emphasis — it removes it from everywhere else.

### 5. Simplify filter labels
- "Type" not "Card type category"
- "Level" not "Monster star level"
- "Banned" not "Forbidden/Limited/Semi-Limited status"

Returning players know TCG vocabulary. Don't over-explain.

### 6. White space is structure
- 16px gap between card tiles
- 24px section padding
- 56px nav height
- Let card art breathe — compressed grids look cheap and make art harder to recognize

### 7. Reduce until it breaks, then add one thing back
Start with name + art only. Add ATK/DEF. Add type badge. Stop. Only add a new data point when you can point to a specific user need that demands it.

---

## Layout specs

| Property | Value |
|---|---|
| Card grid columns | `auto-fit, minmax(160px, 1fr)` |
| Card grid gap | 16px |
| Filter sidebar width | 220px fixed |
| Detail panel width | 320px sliding (right) |
| Nav height | 56px |
| Cards per page (default) | 24 |
| Mobile breakpoint | 768px → sidebar collapses to drawer |

---

## MVP component list

Ship all of these before adding anything else.

1. **Nav bar** — logo, search input, random card button
2. **Filter sidebar** — type, attribute, level range slider
3. **Card tile** — art image, card name, type badge, ATK/DEF or price
4. **Detail panel** — full card text, set list, TCG price, banlist status
5. **Pagination** — previous / next, current page indicator, total results count
6. **Sort control** — name A–Z, ATK high–low, price, level

### Post-MVP (only after core works well)
- Banlist status (Forbidden / Limited / Semi-Limited badges + filter)
- Favorites / collection list
- Archetype stats page
- Deck builder export

---

## API notes — YGOPRODeck

Base URL: `https://db.ygoprodeck.com/api/v7/`

| Endpoint | Use |
|---|---|
| `/cardinfo.php` | Main card data, supports most filter params |
| `/cardinfo.php?banlist_info=true` | Adds TCG/OCG banlist status to each card |
| `/cardinfo.php?archetype=Blue-Eyes` | Archetype filtering server-side |
| `/randomcard.php` | Random card — use for a discovery feature |
| `/cardsets.php` | All set names for set filter dropdown |

Card art images are served from: `https://images.ygoprodeck.com/images/cards/{id}.jpg`

The Node backend should proxy these API calls to avoid CORS issues and to add a simple cache layer (cards don't change daily). Rate limiting is enforced by the API — debounce search input at 300ms minimum.

---

*Design document v1.2 — banlist status moved to post-MVP*
*Last updated: May 2026*
