import { useEffect } from 'react'
import TypeFilter       from './TypeFilter'
import AttributeFilter  from './AttributeFilter'
import LevelRangeFilter from './LevelRangeFilter'

export default function FilterSidebar({ type, attribute, levelMin, levelMax, onUpdate }) {
  const hasFilters = type || attribute || levelMin > 1 || levelMax < 12
  const isSpellOrTrap = type === 'Spell Card' || type === 'Trap Card'

  useEffect(() => {
    if (type === 'Spell Card' || type === 'Trap Card') {
      onUpdate('attribute', '')
      onUpdate('levelMin', '')
      onUpdate('levelMax', '')
    }
  }, [type])

  function clearAll() {
    onUpdate('type', '')
    onUpdate('attribute', '')
    onUpdate('levelMin', '')
    onUpdate('levelMax', '')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      borderRight: '0.5px solid var(--border)',
      padding: 'var(--section-pad) 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      alignSelf: 'flex-start',
      position: 'sticky',
      top: 'var(--nav-height)',
      maxHeight: 'calc(100vh - var(--nav-height))',
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
          Filters
        </p>
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              fontSize: '11px',
              color: 'var(--cyan)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      <TypeFilter value={type} onChange={v => onUpdate('type', v)} />
      {!isSpellOrTrap && (
        <>
          <AttributeFilter value={attribute} onChange={v => onUpdate('attribute', v)} />
          <LevelRangeFilter
            min={levelMin}
            max={levelMax}
            onMinChange={v => onUpdate('levelMin', v)}
            onMaxChange={v => onUpdate('levelMax', v)}
          />
        </>
      )}
    </aside>
  )
}
