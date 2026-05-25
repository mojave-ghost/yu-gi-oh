export default function LevelRangeFilter({ min, max, onMinChange, onMaxChange }) {
  const inputStyle = {
    width: '52px',
    padding: '5px',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    background: 'var(--bg-surface)',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    textAlign: 'center',
  }

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
        Level / Rank
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number"
          min={1}
          max={max}
          value={min}
          onChange={e => onMinChange(Number(e.target.value))}
          style={inputStyle}
        />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>to</span>
        <input
          type="number"
          min={min}
          max={12}
          value={max}
          onChange={e => onMaxChange(Number(e.target.value))}
          style={inputStyle}
        />
      </div>
    </div>
  )
}
