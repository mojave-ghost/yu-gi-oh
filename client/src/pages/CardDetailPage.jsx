import { useParams, useNavigate } from 'react-router-dom'
import { useCardDetail } from '../hooks/useCardDetail'
import CardTypeBadge from '../components/cards/CardTypeBadge'

export default function CardDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { data: card, isLoading, isError } = useCardDetail(id)

  if (isLoading) return <p style={{ padding: 'var(--section-pad)', fontFamily: 'var(--font-body)' }}>Loading…</p>
  if (isError)   return <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>Card not found.</p>

  const price = card.card_prices?.[0]?.tcgplayer_price

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

      <img
        src={card.card_images?.[0]?.image_url}
        alt={card.name}
        style={{ display: 'block', margin: '0 auto 1.5rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}
        loading="lazy"
        decoding="async"
      />

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
          <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Sets
          </p>
          {card.card_sets.slice(0, 5).map(s => (
            <p key={s.set_code} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {s.set_name} · {s.set_code} · {s.set_rarity}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
