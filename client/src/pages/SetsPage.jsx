import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: sets, isLoading, isError } = useSets()

  const setq = searchParams.get('setq') || ''
  const [localSetQ, setLocalSetQ] = useState(setq)
  useEffect(() => { setLocalSetQ(setq) }, [setq])

  const debouncedSetQ = useDebouncedCallback((value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set('setq', value)
      else        next.delete('setq')
      return next
    })
  }, 300)

  function handleSearch(e) {
    setLocalSetQ(e.target.value)
    debouncedSetQ(e.target.value)
  }

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

  const filtered = setq
    ? sets.filter(s => s.set_name.toLowerCase().includes(setq.toLowerCase()))
    : sets

  const grouped = new Map(TYPE_ORDER.map(label => [label, []]))
  for (const set of filtered) {
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

      <input
        type="search"
        placeholder="Filter sets…"
        value={localSetQ}
        onChange={handleSearch}
        aria-label="Filter sets"
        style={{
          width: '100%',
          height: '40px',
          padding: '0 12px',
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          outline: 'none',
          marginBottom: 24,
          boxSizing: 'border-box',
        }}
      />

      {filtered.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
          No sets match &ldquo;{setq}&rdquo;.
        </p>
      )}

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
                key={set.set_name}
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
