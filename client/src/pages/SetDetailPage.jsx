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

  const tcgDateFormatted = meta?.tcg_date
    ? new Date(meta.tcg_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const metaRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '0.5px solid var(--border)',
    fontSize: '13px',
  }

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

      {meta?.set_image && (
        <img
          src={meta.set_image}
          alt={decodedName + ' pack art'}
          loading="lazy"
          decoding="async"
          style={{
            display: 'block',
            width: '160px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}
        />
      )}

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '4px' }}>
        {decodedName}
      </h1>

      <div style={{ marginBottom: '24px' }}>
        <div style={metaRowStyle}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Set code</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{meta?.set_code ?? '—'}</span>
        </div>
        <div style={metaRowStyle}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Cards</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{meta?.num_of_cards ?? '—'}</span>
        </div>
        <div style={metaRowStyle}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>TCG release</span>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>{tcgDateFormatted}</span>
        </div>
      </div>

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
