import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import SearchBar from '../search/SearchBar'

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  function handleSearch(value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('q', value)
    else next.delete('q')
    next.set('page', '1')

    if (location.pathname !== '/browse') {
      navigate('/browse?' + next.toString())
    } else {
      setSearchParams(next)
    }
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
        Yu-Gi-Oh DB
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
