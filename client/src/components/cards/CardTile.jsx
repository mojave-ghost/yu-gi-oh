import { useNavigate } from 'react-router-dom'
import CardTypeBadge from './CardTypeBadge'
import { getTypeStripeColor } from '../../utils/cardTypeColors'
import { getRarityStyle } from '../../utils/rarityStyles'

export default function CardTile({ card, rarityCode, setPrice, isHighestRarity }) {
  const navigate = useNavigate()
  const price = setPrice != null ? setPrice : card.card_prices?.[0]?.tcgplayer_price
  const stripeColor = getTypeStripeColor(card.type)

  return (
    <article
      onClick={() => navigate(`/card/${card.id}`)}
      style={{
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ height: '4px', background: stripeColor, flexShrink: 0 }} />

      {card.card_images?.[0]?.image_url_small && (
        <img
          src={card.card_images[0].image_url_small}
          alt={card.name}
          style={{ width: '100%', display: 'block', aspectRatio: '0.72', objectFit: 'cover' }}
          loading="lazy"
          decoding="async"
        />
      )}

      <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {rarityCode && (() => {
          const rarity = getRarityStyle(rarityCode)
          return (
            <span style={{
              fontSize: '9px',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              padding: '2px 5px',
              borderRadius: 'var(--radius-sm)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              background: rarity.bg,
              color: rarity.color,
              display: 'inline-block',
              marginBottom: '4px',
            }}>
              {rarity.label}
            </span>
          )
        })()}
        {isHighestRarity && (
          <span style={{
            fontSize: '9px',
            color: 'var(--gold)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            display: 'block',
            marginBottom: '4px',
          }}>
            ★ Chase card
          </span>
        )}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          color: 'var(--text-primary)',
          lineHeight: '1.3',
          margin: 0,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {card.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <CardTypeBadge type={card.type} />

          {price > 0 && (
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--gold)' }}>
              ${parseFloat(price).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
