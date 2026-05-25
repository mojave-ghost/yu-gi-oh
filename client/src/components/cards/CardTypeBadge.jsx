import { getTypeBadgeStyles } from '../../utils/cardTypeColors'

export default function CardTypeBadge({ type }) {
  if (!type) return null
  const { bg, color, label } = getTypeBadgeStyles(type)

  return (
    <span style={{
      display: 'inline-block',
      fontSize: '10px',
      fontWeight: 500,
      fontFamily: 'var(--font-body)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      padding: '2px 7px',
      borderRadius: 'var(--radius-sm)',
      background: bg,
      color,
    }}>
      {label}
    </span>
  )
}
