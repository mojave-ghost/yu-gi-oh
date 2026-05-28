import CardTile from './CardTile'

const SKELETON_COUNT = 24

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 'var(--card-gap)',
}

export default function CardGrid({ cards, isLoading, isError, setName, setPriceMap, highestRarityCardId }) {
  if (isError) {
    return (
      <p style={{ color: 'var(--red)', fontFamily: 'var(--font-body)', padding: '2rem 0' }}>
        Failed to load cards. Check your connection and try again.
      </p>
    )
  }

  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
            aspectRatio: '0.72',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
        ))}
      </div>
    )
  }

  if (!cards?.length) {
    return (
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', padding: '2rem 0' }}>
        No cards found. Try adjusting your filters.
      </p>
    )
  }

  return (
    <div style={gridStyle}>
      {cards.map(card => {
        const setEntry = setName
          ? card.card_sets?.find(s => s.set_name === setName)
          : null
        const rarityCode = setEntry?.set_rarity_code ?? null
        const setPrice = setPriceMap?.get(card.id) ?? null
        return (
          <CardTile
            key={card.id}
            card={card}
            rarityCode={rarityCode}
            setPrice={setPrice}
            isHighestRarity={card.id === highestRarityCardId}
          />
        )
      })}
    </div>
  )
}
