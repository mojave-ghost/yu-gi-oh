import CardTile from './CardTile'

const SKELETON_COUNT = 24

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 'var(--card-gap)',
}

export default function CardGrid({ cards, isLoading, isError }) {
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
      {cards.map(card => <CardTile key={card.id} card={card} />)}
    </div>
  )
}
