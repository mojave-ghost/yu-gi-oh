import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useSetCards } from '../hooks/useSetCards'
import CardGrid from '../components/cards/CardGrid'

export default function SetDetailPage() {
  const { setName } = useParams()
  const navigate    = useNavigate()
  const decodedName = decodeURIComponent(setName)

  const { data, isLoading, isError } = useSetCards(decodedName)

  const setsCache = useQueryClient().getQueryData(['sets'])
  const meta      = setsCache?.find(s => s.set_name === decodedName) ?? null

  const setCode    = meta?.set_code ?? '—'
  const numOfCards = meta?.num_of_cards != null ? `${meta.num_of_cards} cards` : '—'
  const tcgDate    = meta?.tcg_date ?? '—'

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

      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        {setCode} · {numOfCards} · {tcgDate}
      </p>

      {isError ? (
        <p style={{ color: 'var(--red)', fontFamily: 'var(--font-body)' }}>
          Failed to load set.
        </p>
      ) : (
        <CardGrid cards={data?.cards} isLoading={isLoading} />
      )}
    </div>
  )
}
