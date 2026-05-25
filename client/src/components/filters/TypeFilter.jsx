const TYPES = [
  { value: '',                label: 'All' },
  { value: 'Normal Monster',  label: 'Normal' },
  { value: 'Effect Monster',  label: 'Effect' },
  { value: 'Fusion Monster',  label: 'Fusion' },
  { value: 'Synchro Monster', label: 'Synchro' },
  { value: 'Xyz Monster',     label: 'Xyz' },
  { value: 'Link Monster',    label: 'Link' },
  { value: 'Ritual Monster',  label: 'Ritual' },
  { value: 'Spell Card',      label: 'Spell' },
  { value: 'Trap Card',       label: 'Trap' },
]

export default function TypeFilter({ value, onChange }) {
  return (
    <div>
      <p style={{
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        margin: '0 0 8px',
      }}>
        Type
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              textAlign: 'left',
              padding: '5px 8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              cursor: 'pointer',
              background: value === t.value ? 'var(--navy)' : 'transparent',
              color: value === t.value ? 'var(--nav-text)' : 'var(--text-primary)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
