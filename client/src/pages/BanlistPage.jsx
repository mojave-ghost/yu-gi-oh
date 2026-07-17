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

function BanlistTable({ title, cards, statusKey }) {
  const navigate = useNavigate()
  const badge    = STATUS_BADGE[statusKey]
  const sorted   = sortSection(cards)

  return (
    <>
      <div style={{
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

      <BanlistTable title="Forbidden"    cards={data.forbidden}   statusKey="forbidden"   />
      <BanlistTable title="Limited"      cards={data.limited}     statusKey="limited"     />
      <BanlistTable title="Semi-Limited" cards={data.semiLimited} statusKey="semiLimited" />
    </main>
  )
}
