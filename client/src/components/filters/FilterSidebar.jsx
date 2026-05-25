export default function FilterSidebar({ type, attribute, levelMin, levelMax, onUpdate }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      borderRight: '0.5px solid var(--border)',
      padding: 'var(--section-pad) 16px',
      alignSelf: 'flex-start',
      position: 'sticky',
      top: 'var(--nav-height)',
      minHeight: 'calc(100vh - var(--nav-height))',
    }}>
      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', margin: 0 }}>
        Filters — coming in slice 5
      </p>
    </aside>
  )
}
