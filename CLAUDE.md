Read client/src/pages/CardDetailPage.jsx in full, then fix 
the following two issues. Do not change anything else.

## Fix 1 — Sort dropdown

set_price_low does not exist on card_sets objects. The API only 
returns set_price. Update sortSets to use set_price for all 
price-based sorting and remove the listed/unlisted split 
entirely — it was based on a field that doesn't exist.

Replace the sortSets function with:

function sortSets(sets, key) {
  switch (key) {
    case 'high':
      return [...sets].sort((a, b) => 
        parseFloat(b.set_price || 0) - parseFloat(a.set_price || 0))
    case 'low':
      return [...sets].sort((a, b) => 
        parseFloat(a.set_price || 0) - parseFloat(b.set_price || 0))
    case 'best':
      return [...sets].sort((a, b) => {
        const pa = parseFloat(a.set_price || 0)
        const pb = parseFloat(b.set_price || 0)
        if (pa === 0 && pb === 0) return 0
        if (pa === 0) return 1
        if (pb === 0) return -1
        return pa - pb
      })
    case 'alpha':
      return [...sets].sort((a, b) => 
        a.set_name.localeCompare(b.set_name))
    default:
      return [...sets]
  }
}

'best' sorts by lowest price with $0.00 (unlisted) cards at the 
bottom. 'low' includes $0.00 cards at the top — that is correct 
for Price: Low to High since they are technically the lowest price.

Also remove the price block's 'from $X.XX' line entirely since 
set_price_low does not exist. Replace the price block with:

<div style={{ flexShrink: 0, textAlign: 'right' }}>
  <p style={{ fontSize: '12px', color: 'var(--gold)', 
    fontWeight: 500, margin: 0 }}>
    {parseFloat(s.set_price) > 0 
      ? '$' + parseFloat(s.set_price).toFixed(2) 
      : '—'}
  </p>
</div>

## Fix 2 — Show less key collision

The composite key uses set_rarity_code which is empty string '' 
for many newer rarities, causing duplicate keys when multiple 
rows share the same set_code and empty rarity code.

Replace the key with a stable index-based composite:

key={`${s.set_code}-${s.set_rarity}-${index}`}

Update the map to pass index:
visibleSets.map((s, index) => { ... })

Using set_rarity (the full string like "Quarter Century Secret 
Rare") instead of set_rarity_code (the short code which can be 
empty) makes the key more unique. Adding index as a final 
tiebreaker ensures no two rows ever share a key even if all 
other fields are identical.

Do not change anything else.