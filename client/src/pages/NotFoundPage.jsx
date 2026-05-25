import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{ padding: 'var(--section-pad)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-section-heading)', marginBottom: '12px' }}>
        Page not found
      </h1>
      <Link to="/browse" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
        ← Back to browse
      </Link>
    </div>
  )
}
