const SORT_OPTIONS = [
  { value: 'name',  label: 'Name A–Z' },
  { value: 'atk',   label: 'ATK high–low' },
  { value: 'def',   label: 'DEF high–low' },
  { value: 'level', label: 'Level' },
  { value: 'price', label: 'Price' },
]

export default function SortControl({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Sort cards by"
      style={{
        padding: '6px 10px',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        background: 'var(--bg-surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {SORT_OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
