import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useSetCards } from '../hooks/useSetCards'
import CardGrid from '../components/cards/CardGrid'

export default function SetDetailPage() {
  const { setName } = useParams()
  const navigate    = useNavigate()
  const decodedName = decodeURIComponent(setName)

  const { data, isLoading, isError } = useSetCards(decodedName)

  // Pull set metadata from the already-cached sets list — no extra fetch
  const queryClient = useQueryClient()
  const setsMeta    = queryClient.getQueryData(['sets'])
  const meta        = setsMeta?.find(s => s.set_name === decodedName)

  if (isError) {
    return (
      <div style={{ padding: 'var(--section-pad)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
        >
          ← Back
        </button>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--red)' }}>Failed to load set.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--section-pad)' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
      >
        ← Back
      </button>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '6px',
      }}>
        {decodedName}
      </h1>

      {meta && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
        }}>
          {meta.set_code} · {meta.num_of_cards} cards · {meta.tcg_date ?? '—'}
        </p>
      )}

      <CardGrid
        cards={data?.cards}
        isLoading={isLoading}
        isError={false}
      />
    </div>
  )
}
