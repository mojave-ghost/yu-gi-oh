import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import { useSets } from '../hooks/useSets'

function sortSets(sets, key) {
  const sorted = [...sets]
  if (key === 'name')   return sorted.sort((a, b) => a.set_name.localeCompare(b.set_name))
  if (key === 'newest') return sorted.sort((a, b) => (b.tcg_date || '').localeCompare(a.tcg_date || ''))
  if (key === 'oldest') return sorted.sort((a, b) => (a.tcg_date || '').localeCompare(b.tcg_date || ''))
  if (key === 'code')   return sorted.sort((a, b) => a.set_code.localeCompare(b.set_code))
  if (key === 'count')  return sorted.sort((a, b) => b.num_of_cards - a.num_of_cards)
  return sorted
}

export default function SetsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: sets, isLoading, isError } = useSets()

  const setq = searchParams.get('setq') || ''
  const setsort = searchParams.get('setsort') || 'name'
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

  const filteredAndSorted = sortSets(filtered, setsort)

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

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="search"
          placeholder="Filter sets…"
          value={localSetQ}
          onChange={handleSearch}
          aria-label="Filter sets"
          style={{
            flex: 1,
            height: '40px',
            padding: '0 12px',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <select
          value={setsort}
          onChange={e => {
            setSearchParams(prev => {
              const next = new URLSearchParams(prev)
              next.set('setsort', e.target.value)
              return next
            })
          }}
          aria-label="Sort sets"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 10px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="name">Name A–Z</option>
          <option value="newest">Date: Newest</option>
          <option value="oldest">Date: Oldest</option>
          <option value="code">Set Code A–Z</option>
          <option value="count">Most Cards</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
          No sets match &ldquo;{setq}&rdquo;.
        </p>
      )}

      {filteredAndSorted.map(set => (
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
    </main>
  )
}
