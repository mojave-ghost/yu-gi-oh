const LABEL = {
  spell:   'Spell',
  trap:    'Trap',
  fusion:  'Fusion',
  synchro: 'Synchro',
  xyz:     'Xyz',
  link:    'Link',
  ritual:  'Ritual',
  normal:  'Normal',
  effect:  'Effect',
}

function resolveKey(type) {
  const t = type?.toLowerCase() ?? ''
  if (t.includes('spell'))   return 'spell'
  if (t.includes('trap'))    return 'trap'
  if (t.includes('fusion'))  return 'fusion'
  if (t.includes('synchro')) return 'synchro'
  if (t.includes('xyz'))     return 'xyz'
  if (t.includes('link'))    return 'link'
  if (t.includes('ritual'))  return 'ritual'
  if (t.includes('normal'))  return 'normal'
  return 'effect'
}

export function getTypeStripeColor(type) {
  return `var(--card-${resolveKey(type)}-bg)`
}

export function getTypeBadgeStyles(type) {
  const key = resolveKey(type)
  return {
    bg:    `var(--card-${key}-light)`,
    color: `var(--card-${key}-text)`,
    label: LABEL[key],
  }
}
