import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export default function SearchBar({ value, onChange, variant = 'page' }) {
  const [local, setLocal] = useState(value)

  useEffect(() => { setLocal(value) }, [value])

  const debouncedOnChange = useDebouncedCallback(onChange, 300)

  function handleChange(e) {
    setLocal(e.target.value)
    debouncedOnChange(e.target.value)
  }

  const isNav = variant === 'nav'

  return (
    <input
      type="search"
      placeholder="Search cards…"
      value={local}
      onChange={handleChange}
      aria-label="Search cards"
      style={{
        width: '100%',
        height: isNav ? '36px' : '40px',
        padding: '0 12px',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        background: isNav ? 'var(--search-nav-bg)' : 'var(--bg-surface)',
        border: isNav ? '1px solid var(--search-nav-border)' : '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: isNav ? 'var(--nav-text)' : 'var(--text-primary)',
        outline: 'none',
      }}
    />
  )
}
