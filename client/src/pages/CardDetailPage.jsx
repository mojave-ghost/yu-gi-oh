import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCardDetail } from '../hooks/useCardDetail'
import CardTypeBadge from '../components/cards/CardTypeBadge'

export default function CardDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { data: card, isLoading, isError } = useCardDetail(id)
  const [sortKey, setSortKey] = useState('best')
  const [showAll, setShowAll] = useState(false)
  const [artIndex, setArtIndex] = useState(0)

  useEffect(() => { setArtIndex(0) }, [id])

  if (isLoading) return <p style={{ padding: 'var(--section-pad)', fontFamily: 'var(--font-body)' }}>Loading…</p>
  if (isError)   return <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>Card not found.</p>

  console.log('card_images:', card.card_images, 'length:', card.card_images?.length)

  function getRarityStyle(code) {
    switch (code) {
      case '(C)':    return { bg: 'var(--bg-surface)',         color: 'var(--text-secondary)',    label: 'Common'    }
      case '(R)':    return { bg: 'var(--card-rare-bg)',       color: 'var(--card-rare-text)',    label: 'Rare'      }
      case '(SR)':   return { bg: 'var(--card-link-light)',    color: 'var(--card-link-text)',    label: 'Super'     }
      case '(UR)':   return { bg: 'var(--card-normal-light)',  color: 'var(--card-normal-text)',  label: 'Ultra'     }
      case '(ScR)':  return { bg: 'var(--card-trap-light)',    color: 'var(--card-trap-text)',    label: 'Secret'    }
      case '(StR)':  return { bg: 'var(--card-spell-light)',   color: 'var(--card-spell-text)',   label: 'Starlight' }
      case '(GR)':   return { bg: 'var(--card-synchro-light)', color: 'var(--card-synchro-text)', label: 'Ghost'     }
      case '(PScR)': return { bg: 'var(--card-fusion-light)',  color: 'var(--card-fusion-text)',  label: 'Prismatic'     }
      case '(UtR)':  return { bg: 'var(--card-xyz-light)',    color: 'var(--card-xyz-text)',    label: 'Ultimate'      }
      case '(GUR)':  return { bg: 'var(--card-normal-light)', color: 'var(--card-normal-text)', label: 'Gold'          }
      case '(PG)':   return { bg: 'var(--card-normal-light)', color: 'var(--card-normal-text)', label: 'Gold'          }
      case '(PR)':   return { bg: 'var(--card-synchro-light)',color: 'var(--card-synchro-text)',label: 'Parallel'      }
      case '(SFR)':  return { bg: 'var(--card-spell-light)',  color: 'var(--card-spell-text)',  label: 'Starfoil'      }
      case '(SHR)':  return { bg: 'var(--card-spell-light)',  color: 'var(--card-spell-text)',  label: 'Shatterfoil'   }
      case '(PS)':   return { bg: 'var(--card-trap-light)',   color: 'var(--card-trap-text)',   label: 'Platinum'      }
      case '(DSPR)': return { bg: 'var(--card-link-light)',   color: 'var(--card-link-text)',   label: 'Duel Terminal' }
      case '(CR)':   return { bg: 'var(--card-trap-light)',   color: 'var(--card-trap-text)',   label: "Collector's"   }
      case '':       return { bg: 'var(--bg-surface)',        color: 'var(--text-secondary)',   label: 'Special'       }
      default:       return { bg: 'var(--bg-surface)',         color: 'var(--text-secondary)',    label: 'Special'   }
    }
  }

  function sortSets(sets, key) {
    switch (key) {
      case 'high':
        return [...sets].sort((a, b) =>
          parseFloat(b.set_price || 0) - parseFloat(a.set_price || 0))
      case 'low':
        return [...sets].sort((a, b) =>
          parseFloat(a.set_price || 0) - parseFloat(b.set_price || 0))
      case 'best':
        return [...sets].sort((a, b) => {
          const pa = parseFloat(a.set_price || 0)
          const pb = parseFloat(b.set_price || 0)
          if (pa === 0 && pb === 0) return 0
          if (pa === 0) return 1
          if (pb === 0) return -1
          return pa - pb
        })
      case 'alpha':
        return [...sets].sort((a, b) =>
          a.set_name.localeCompare(b.set_name))
      default:
        return [...sets]
    }
  }

  const price = card.card_prices?.[0]?.tcgplayer_price

  const allSorted   = card.card_sets ? sortSets(card.card_sets, sortKey) : []
  const visibleSets = showAll ? allSorted : allSorted.slice(0, 5)
  const hiddenCount = Math.max(0, allSorted.length - 5)

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'var(--section-pad)' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          padding: 0,
        }}
      >
        ← Back
      </button>

      {card.card_images?.length > 1 ? (
        <div>
          <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
            Alternate Art
          </p>
          <img
            src={card.card_images[artIndex].image_url}
            alt={`${card.name} art ${artIndex + 1}`}
            style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}
            loading="lazy"
            decoding="async"
          />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setArtIndex(i => i - 1)}
              disabled={artIndex === 0}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-primary)', padding: '0 8px', opacity: artIndex === 0 ? 0.4 : 1 }}
            >
              ←
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
              {artIndex + 1} of {card.card_images.length}
            </span>
            <button
              onClick={() => setArtIndex(i => i + 1)}
              disabled={artIndex === card.card_images.length - 1}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-primary)', padding: '0 8px', opacity: artIndex === card.card_images.length - 1 ? 0.4 : 1 }}
            >
              →
            </button>
          </div>
        </div>
      ) : (
        <img
          src={card.card_images?.[0]?.image_url}
          alt={card.name}
          style={{ display: 'block', margin: '0 auto 1.5rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}
          loading="lazy"
          decoding="async"
        />
      )}

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '10px' }}>
        {card.name}
      </h1>

      <CardTypeBadge type={card.type} />

      {card.atk !== undefined && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--text-secondary)' }}>
          ATK <strong>{card.atk}</strong> / DEF <strong>{card.def}</strong>
        </p>
      )}

      {card.level && (
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Level {card.level} · {card.attribute} · {card.race}
        </p>
      )}

      <p style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.7', color: 'var(--text-primary)' }}>
        {card.desc}
      </p>

      {price && parseFloat(price) > 0 && (
        <p style={{ marginTop: '16px', fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: 500, color: 'var(--gold)' }}>
          ${parseFloat(price).toFixed(2)}{' '}
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>TCGPlayer market</span>
        </p>
      )}

      {card.card_sets && (
        <div style={{ marginTop: '20px' }}>

          {/* Header: SETS label left, sort select right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: 0 }}>
              Sets
            </p>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 6px', cursor: 'pointer' }}
            >
              <option value="best">Best Match</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="alpha">A–Z</option>
            </select>
          </div>

          {visibleSets.map((s, index) => {
            const rarity = getRarityStyle(s.set_rarity_code)

            return (
              <div
                key={`${s.set_code}-${s.set_rarity}-${index}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '0.5px solid var(--border)', padding: '8px 0' }}
              >
                {/* Rarity badge */}
                <span style={{
                  fontSize: '9px', fontWeight: 500, fontFamily: 'var(--font-body)',
                  padding: '2px 5px', borderRadius: 'var(--radius-sm)',
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  background: rarity.bg, color: rarity.color,
                }}>
                  {rarity.label}
                </span>

                {/* Set info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {s.set_url ? (
                    <a
                      href={s.set_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500, margin: 0, textDecoration: 'none', display: 'block' }}
                    >
                      {s.set_name}
                    </a>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                      {s.set_name}
                    </p>
                  )}
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    {s.set_code} · {s.set_edition}
                  </p>
                </div>

                {/* Price block */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 500, margin: 0 }}>
                    {parseFloat(s.set_price) > 0
                      ? '$' + parseFloat(s.set_price).toFixed(2)
                      : '—'}
                  </p>
                </div>
              </div>
            )
          })}

          {allSorted.length > 5 && (
            <button
              onClick={() => setShowAll(v => !v)}
              style={{ fontSize: '11px', color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0', display: 'block', fontFamily: 'var(--font-body)' }}
            >
              {showAll
                ? 'Show less'
                : `${hiddenCount} more printing${hiddenCount === 1 ? '' : 's'} — Show all`}
            </button>
          )}

        </div>
      )}
    </div>
  )
}
