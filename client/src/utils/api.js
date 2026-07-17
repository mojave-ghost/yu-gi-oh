const BASE = '/api'

export async function fetchCards({ query, type, attribute, levelMin, levelMax, sort, page }) {
  const params = new URLSearchParams()
  if (query)          params.set('q',         query)
  if (type)           params.set('type',       type)
  if (attribute)      params.set('attribute',  attribute)
  if (levelMin > 1)   params.set('levelMin',   levelMin)
  if (levelMax < 12)  params.set('levelMax',   levelMax)
  if (sort)           params.set('sort',        sort)
  if (page)           params.set('page',        page)

  const res = await fetch(`${BASE}/cards?${params}`)
  if (!res.ok) throw new Error('Failed to fetch cards')
  return res.json()
}

export async function fetchCardById(id) {
  const res = await fetch(`${BASE}/cards/${id}`)
  if (!res.ok) throw new Error('Card not found')
  return res.json()
}

export async function fetchSets() {
  const res = await fetch(`${BASE}/sets`)
  if (!res.ok) throw new Error('Failed to fetch sets')
  return res.json()
}

export async function fetchCardsBySet(setName) {
  const res = await fetch(`${BASE}/sets/${encodeURIComponent(setName)}`)
  if (!res.ok) throw new Error('Failed to fetch set cards')
  return res.json()
}

export async function fetchArchetypes() {
  const res = await fetch(`${BASE}/archetypes`)
  if (!res.ok) throw new Error('Failed to fetch archetypes')
  return res.json()
}

export async function fetchCardsByArchetype(name) {
  const res = await fetch(`${BASE}/archetypes/${encodeURIComponent(name)}`)
  if (!res.ok) throw new Error('Failed to fetch archetype cards')
  return res.json()
}

export async function fetchBanlist() {
  const res = await fetch(`${BASE}/banlist`)
  if (!res.ok) throw new Error('Failed to fetch banlist')
  return res.json()
}
