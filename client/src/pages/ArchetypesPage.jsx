import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDebouncedCallback } from 'use-debounce'
import { useArchetypes } from '../hooks/useArchetypes'

export default function ArchetypesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useArchetypes()

  const archetypeq = searchParams.get('archetypeq') || ''
  const [localQ, setLocalQ] = useState(archetypeq)
  useEffect(() => { setLocalQ(archetypeq) }, [archetypeq])

  const debouncedQ = useDebouncedCallback((value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set('archetypeq', value)
      else        next.delete('archetypeq')
      return next
    })
  }, 300)

  function handleSearch(e) {
    setLocalQ(e.target.value)
    debouncedQ(e.target.value)
  }

  if (isLoading) return (
    <p style={{ padding: 'var(--section-pad)', color: 'var(--text-secondary)' }}>
      Loading archetypes…
    </p>
  )

  if (isError) return (
    <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>
      Failed to load archetypes.
    </p>
  )

  const filtered = archetypeq
    ? data.filter(a => a.archetype_name.toLowerCase().includes(archetypeq.toLowerCase()))
    : data

  const groups = new Map()
  for (const archetype of filtered) {
    const letter = archetype.archetype_name[0].toUpperCase()
    if (!groups.has(letter)) groups.set(letter, [])
    groups.get(letter).push(archetype)
  }
  const sortedLetters = [...groups.keys()].sort()

  return (
    <main style={{ padding: 'var(--section-pad)', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 24,
      }}>
        Archetypes
      </h1>

      <input
        type="search"
        placeholder="Filter archetypes…"
        value={localQ}
        onChange={handleSearch}
        aria-label="Filter archetypes"
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
          boxSizing: 'border-box',
          marginBottom: 24,
        }}
      />

      {filtered.length === 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
          No archetypes match &ldquo;{archetypeq}&rdquo;.
        </p>
      )}

      {sortedLetters.map(letter => (
        <div key={letter}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            padding: '4px 0',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg-page)',
            borderBottom: '1px solid var(--border)',
            letterSpacing: 1,
            zIndex: 1,
          }}>
            {letter}
          </div>
          {groups.get(letter).map(archetype => (
            <button
              key={archetype.archetype_name}
              onClick={() => navigate(`/archetypes/${encodeURIComponent(archetype.archetype_name)}`)}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              style={{
                display: 'block',
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: '0.5px solid var(--border)',
                padding: '8px 0',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--text-primary)',
              }}
            >
              {archetype.archetype_name}
            </button>
          ))}
        </div>
      ))}
    </main>
  )
}
