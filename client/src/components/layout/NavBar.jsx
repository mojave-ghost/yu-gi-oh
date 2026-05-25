import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SearchBar from '../search/SearchBar'

export default function NavBar() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  function handleSearch(value) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set('q', value)
      else next.delete('q')
      next.set('page', '1')
      return next
    })
  }

  async function handleRandom() {
    const res = await fetch('/api/cards/random')
    const data = await res.json()
    navigate(`/card/${data.id}`)
  }

  return (
    <nav style={{
      height: 'var(--nav-height)',
      background: 'var(--navy)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--section-pad)',
      gap: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/browse" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        color: 'var(--nav-text)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}>
        YGO Database
      </Link>

      <div style={{ flex: 1, maxWidth: '480px' }}>
        <SearchBar
          value={searchParams.get('q') || ''}
          onChange={handleSearch}
          variant="nav"
        />
      </div>

      <button
        onClick={handleRandom}
        title="Random card"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--nav-text)',
          background: 'transparent',
          border: '1px solid var(--search-nav-border)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Random card
      </button>
    </nav>
  )
}
