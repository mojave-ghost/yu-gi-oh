const TYPE_KEY_MAP = {
  'normal monster': 'normal',
  'effect monster': 'effect',
  'spell card': 'spell',
  'trap card': 'trap',
  'fusion monster': 'fusion',
  'synchro monster': 'synchro',
  'xyz monster': 'xyz',
  'link monster': 'link',
  'ritual monster': 'ritual',
};

function resolveKey(type) {
  return TYPE_KEY_MAP[type?.toLowerCase()] ?? 'normal';
}

export function getTypeStripeColor(type) {
  return `var(--card-${resolveKey(type)}-bg)`;
}

export function getTypeBadgeStyles(type) {
  const key = resolveKey(type);
  return {
    backgroundColor: `var(--card-${key}-light)`,
    color: `var(--card-${key}-text)`,
  };
}
