export default function Pagination({ page, total, perPage, onPageChange }) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const btnStyle = {
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    border: '0.5px solid var(--border)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginTop: '2rem',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
    }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{ ...btnStyle, cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
      >
        ← Prev
      </button>

      <span style={{ color: 'var(--text-secondary)' }}>
        Page {page} of {totalPages} · {total.toLocaleString()} cards
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{ ...btnStyle, cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
      >
        Next →
      </button>
    </div>
  )
}
