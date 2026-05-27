import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import SearchBar from '../search/SearchBar'

const NAV_LINKS = [
  { to: '/browse',     label: 'Browse'     },
  { to: '/sets',       label: 'Sets'       },
  { to: '/archetypes', label: 'Archetypes' },
  { to: '/banlist',    label: 'Banlist'    },
]

function navLinkStyle({ isActive }) {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    color: isActive ? 'var(--nav-text)' : 'var(--nav-text-muted)',
    borderBottom: isActive ? '2px solid var(--nav-text)' : '2px solid transparent',
    paddingBottom: '2px',
  }
}

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

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
    <>
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

        {!isMobile && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} style={navLinkStyle}>
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle navigation"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--nav-text)',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
              flexShrink: 0,
            }}
          >
            <i className="ti ti-menu-2" />
          </button>
        )}

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

      {isMobile && menuOpen && (
        <div style={{
          background: 'var(--navy)',
          display: 'flex',
          flexDirection: 'column',
          padding: '8px var(--section-pad) 12px',
          gap: '0',
          position: 'sticky',
          top: 'var(--nav-height)',
          zIndex: 99,
        }}>
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={navLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}
