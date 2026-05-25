const ATTRIBUTES = ['', 'DARK', 'LIGHT', 'FIRE', 'WATER', 'WIND', 'EARTH', 'DIVINE']

export default function AttributeFilter({ value, onChange }) {
  return (
    <div>
      <p style={{
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        margin: '0 0 8px',
      }}>
        Attribute
      </p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '6px 8px',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          background: 'var(--bg-surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
      >
        {ATTRIBUTES.map(a => (
          <option key={a} value={a}>{a || 'All attributes'}</option>
        ))}
      </select>
    </div>
  )
}
