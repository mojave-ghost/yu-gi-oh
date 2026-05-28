import { useNavigate } from 'react-router-dom'
import { useSets } from '../hooks/useSets'

const TYPE_ORDER = [
  'Core Set',
  'Booster Pack',
  'Starter Deck',
  'Structure Deck',
  'Special Edition',
  'Tin',
  'Promo',
  'Other',
]

function normalizeType(raw) {
  if (!raw) return 'Other'
  const lower = raw.toLowerCase()
  if (lower.includes('core'))      return 'Core Set'
  if (lower.includes('booster'))   return 'Booster Pack'
  if (lower.includes('starter'))   return 'Starter Deck'
  if (lower.includes('structure')) return 'Structure Deck'
  if (lower.includes('special'))   return 'Special Edition'
  if (lower.includes('tin'))       return 'Tin'
  if (lower.includes('promo'))     return 'Promo'
  return 'Other'
}

export default function SetsPage() {
  const navigate = useNavigate()
  const { data: sets, isLoading, isError } = useSets()

  if (isLoading) return (
    <p style={{ padding: 'var(--section-pad)', color: 'var(--text-secondary)' }}>
      Loading sets…
    </p>
  )

  if (isError) return (
    <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>
      Failed to load sets.
    </p>
  )

  const grouped = new Map(TYPE_ORDER.map(label => [label, []]))
  for (const set of sets) {
    const label = normalizeType(set.set_type)
    grouped.get(label).push(set)
  }

  return (
    <main style={{ padding: 'var(--section-pad)', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 24,
      }}>
        Sets
      </h1>

      {TYPE_ORDER.map(label => {
        const group = grouped.get(label)
        if (!group.length) return null
        return (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-primary)',
              padding: '10px 0',
              borderBottom: '0.5px solid var(--border)',
            }}>
              {label} ({group.length})
            </div>
            {group.map(set => (
              <button
                key={set.set_code}
                onClick={() => navigate(`/sets/${encodeURIComponent(set.set_name)}`)}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '0.5px solid var(--border)',
                  padding: '10px 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-primary)' }}>
                  {set.set_name}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, marginLeft: 16 }}>
                  {set.set_code} · {set.num_of_cards} cards · {set.tcg_date ?? '—'}
                </span>
              </button>
            ))}
          </div>
        )
      })}
    </main>
  )
}
