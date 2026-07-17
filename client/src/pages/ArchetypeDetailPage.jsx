import { useParams, useNavigate } from 'react-router-dom'
import { useArchetypeCards } from '../hooks/useArchetypeCards'
import CardGrid from '../components/cards/CardGrid'

export default function ArchetypeDetailPage() {
  const { name } = useParams()
  const navigate  = useNavigate()
  const decodedName = decodeURIComponent(name)

  const { data, isLoading, isError } = useArchetypeCards(decodedName)

  return (
    <div style={{ padding: 'var(--section-pad)' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          padding: 0,
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '4px' }}>
        {decodedName}
      </h1>

      {data && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          marginBottom: 24,
        }}>
          {data.total} cards
        </p>
      )}

      <CardGrid
        cards={data?.cards}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  )
}
