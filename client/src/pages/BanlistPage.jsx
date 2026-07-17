import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBanlist } from '../hooks/useBanlist'

const STATUS_BADGE = {
  forbidden:   { bg: 'var(--red)',  color: 'var(--white)' },
  limited:     { bg: 'var(--gold)', color: 'var(--card-normal-text)' },
  semiLimited: { bg: 'var(--cyan)', color: 'var(--card-link-text)' },
}

const STATUS_LABEL = {
  forbidden:   'Forbidden',
  limited:     'Limited',
  semiLimited: 'Semi-Limited',
}

function getTraditional(banTcg) {
  if (banTcg === 'Forbidden') return 'Limited 1'
  if (banTcg === 'Limited')   return 'Limited 1'
  return 'Limited 2'
}

function getRowStyle(frameType) {
  return {
    background: `var(--card-${frameType}-light)`,
    color:      `var(--card-${frameType}-text)`,
  }
}

function sortSection(cards) {
  return [...cards].sort((a, b) => {
    const t = a.humanReadableCardType.localeCompare(b.humanReadableCardType)
    if (t !== 0) return t
    return a.name.localeCompare(b.name)
  })
}

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

function BanlistTable({ title, cards, statusKey, anchorId }) {
  const navigate = useNavigate()
  const badge    = STATUS_BADGE[statusKey]
  const sorted   = sortSection(cards)

  return (
    <>
      <div id={anchorId} style={{
        fontSize: 15,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        padding: '10px 0',
        marginTop: 28,
        marginBottom: 0,
        borderBottom: '2px solid var(--border)',
      }}>
        {title} ({cards.length})
      </div>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        marginBottom: 8,
      }}>
        <thead>
          <tr style={{ background: 'var(--navy)', color: 'var(--nav-text)' }}>
            <th style={thStyle}>Card Type</th>
            <th style={thStyle}>Card Name</th>
            <th style={thStyle}>Advanced Format</th>
            <th style={thStyle}>Traditional Format</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(card => (
            <tr
              key={card.id}
              style={{ ...getRowStyle(card.frameType), borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}
            >
              <td style={{ padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                {card.humanReadableCardType}
              </td>
              <td style={{ padding: 0 }}>
                <span
                  onClick={() => navigate(`/card/${card.id}`)}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    color: 'inherit',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(0,0,0,0.3)',
                  }}
                >
                  {card.name}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{
                  fontSize: 9,
                  fontWeight: 500,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: badge.bg,
                  color: badge.color,
                }}>
                  {STATUS_LABEL[statusKey]}
                </span>
              </td>
              <td style={{ padding: '8px 12px', fontSize: 12 }}>
                {getTraditional(card.banlist_info.ban_tcg)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default function BanlistPage() {
  const { data, isLoading, isError } = useBanlist()
  const subtitle = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const [search, setSearch] = useState('')
  const [hoverForbidden,   setHoverForbidden]   = useState(false)
  const [hoverLimited,     setHoverLimited]     = useState(false)
  const [hoverSemiLimited, setHoverSemiLimited] = useState(false)

  if (isLoading) return (
    <p style={{ padding: 'var(--section-pad)', color: 'var(--text-secondary)' }}>
      Loading banlist…
    </p>
  )

  if (isError) return (
    <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>
      Failed to load banlist.
    </p>
  )

  const q = search.trim().toLowerCase()

  const filteredForbidden   = q ? data.forbidden.filter(c   => c.name.toLowerCase().includes(q)) : data.forbidden
  const filteredLimited     = q ? data.limited.filter(c     => c.name.toLowerCase().includes(q)) : data.limited
  const filteredSemiLimited = q ? data.semiLimited.filter(c => c.name.toLowerCase().includes(q)) : data.semiLimited

  const allEmpty = q && filteredForbidden.length === 0 && filteredLimited.length === 0 && filteredSemiLimited.length === 0

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--section-pad)' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 4,
      }}>
        TCG Banlist
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginTop: 0,
        marginBottom: 24,
      }}>
        {subtitle}
      </p>

      <input
        type="search"
        placeholder="Search banned cards…"
        value={search}
        onChange={e => setSearch(e.target.value)}
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

      {!q && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => document.getElementById('forbidden').scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onMouseEnter={() => setHoverForbidden(true)}
            onMouseLeave={() => setHoverForbidden(false)}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 12, padding: '6px 14px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              background: 'var(--red)', color: 'var(--white)',
              transition: 'all 0.15s ease',
              transform:  hoverForbidden ? 'translateY(-1px)' : 'translateY(0)',
              filter:     hoverForbidden ? 'brightness(1.15)' : 'none',
              boxShadow:  hoverForbidden ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Forbidden
          </button>
          <button
            onClick={() => document.getElementById('limited').scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onMouseEnter={() => setHoverLimited(true)}
            onMouseLeave={() => setHoverLimited(false)}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 12, padding: '6px 14px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              background: 'var(--gold)', color: 'var(--card-normal-text)',
              transition: 'all 0.15s ease',
              transform:  hoverLimited ? 'translateY(-1px)' : 'translateY(0)',
              filter:     hoverLimited ? 'brightness(1.15)' : 'none',
              boxShadow:  hoverLimited ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Limited
          </button>
          <button
            onClick={() => document.getElementById('semi-limited').scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onMouseEnter={() => setHoverSemiLimited(true)}
            onMouseLeave={() => setHoverSemiLimited(false)}
            style={{
              fontFamily: 'var(--font-body)', fontSize: 12, padding: '6px 14px',
              borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
              background: 'var(--cyan)', color: 'var(--card-link-text)',
              transition: 'all 0.15s ease',
              transform:  hoverSemiLimited ? 'translateY(-1px)' : 'translateY(0)',
              filter:     hoverSemiLimited ? 'brightness(1.15)' : 'none',
              boxShadow:  hoverSemiLimited ? 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15)' : 'none',
            }}
          >
            Semi-Limited
          </button>
        </div>
      )}

      {allEmpty && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: 48,
        }}>
          &ldquo;{search.trim()}&rdquo; is not on the banlist.
        </p>
      )}

      {(!q || filteredForbidden.length > 0) && (
        <BanlistTable title="Forbidden"    cards={filteredForbidden}   statusKey="forbidden"   anchorId="forbidden"    />
      )}
      {(!q || filteredLimited.length > 0) && (
        <BanlistTable title="Limited"      cards={filteredLimited}     statusKey="limited"     anchorId="limited"      />
      )}
      {(!q || filteredSemiLimited.length > 0) && (
        <BanlistTable title="Semi-Limited" cards={filteredSemiLimited} statusKey="semiLimited" anchorId="semi-limited" />
      )}
    </main>
  )
}
