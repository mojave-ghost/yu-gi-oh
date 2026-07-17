import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TOOLS = [
  {
    name: 'Banlist',
    description: 'TCG Forbidden, Limited, and Semi-Limited card list.',
    route: '/banlist',
  },
]

export default function MiscPage() {
  const navigate = useNavigate()
  const [hoveredRoute, setHoveredRoute] = useState(null)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--section-pad)' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        color: 'var(--text-primary)',
        marginBottom: 8,
        marginTop: 0,
      }}>
        Reference Tools
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text-secondary)',
        marginTop: 0,
        marginBottom: 32,
      }}>
        Competitive and format reference tools for the TCG.
      </p>

      {TOOLS.map((tool) => (
        <div
          key={tool.route}
          onClick={() => navigate(tool.route)}
          onMouseEnter={() => setHoveredRoute(tool.route)}
          onMouseLeave={() => setHoveredRoute(null)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            borderBottom: '0.5px solid var(--border)',
            cursor: 'pointer',
            background: hoveredRoute === tool.route ? 'var(--bg-surface)' : 'transparent',
          }}
        >
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}>
              {tool.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}>
              {tool.description}
            </div>
          </div>
          <span style={{ fontSize: 18, color: 'var(--text-secondary)', flexShrink: 0 }}>
            →
          </span>
        </div>
      ))}
    </div>
  )
}
