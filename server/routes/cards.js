const express   = require('express')
const NodeCache = require('node-cache')

const router = express.Router()
const cache  = new NodeCache({ stdTTL: 3600 })

const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'
const PER_PAGE    = 24

// GET /api/cards
router.get('/', async (req, res) => {
  try {
    const { q, type, attribute, levelMin, levelMax, sort = 'name', page = 1 } = req.query

    const params = new URLSearchParams()
    params.set('misc', 'yes')
    params.set('tcgplayer_data', 'true')
    if (q)         params.set('fname',     q)
    if (attribute) params.set('attribute', attribute)
    if (levelMin && Number(levelMin) > 1) {
      params.set('level', `${levelMin},lte,${levelMax ?? 12}`)
    }

    const cacheKey = params.toString()
    let allCards   = cache.get(cacheKey)

    if (!allCards) {
      const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?${params}`)
      if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })
      const json = await upstream.json()
      allCards = json.data || []
      cache.set(cacheKey, allCards)
    }

    if (type) {
      const key = resolveTypeKey(type)
      allCards = allCards.filter(card => resolveTypeKey(card.type) === key)
    }

    allCards = sortCards(allCards, sort)

    const total   = allCards.length
    const pageNum = Number(page) || 1
    const start   = (pageNum - 1) * PER_PAGE
    const cards   = allCards.slice(start, start + PER_PAGE)

    res.json({ cards, total, page: pageNum, perPage: PER_PAGE })
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// GET /api/cards/random  — must come before /:id
router.get('/random', async (req, res) => {
  try {
    const upstream = await fetch(`${YGOPRO_BASE}/randomcard.php`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream error' })
    const json = await upstream.json()
    const card = json.data?.[0]
    if (!card) return res.status(502).json({ error: 'No card returned' })
    res.json(card)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// GET /api/cards/:id
router.get('/:id', async (req, res) => {
  try {
    const { id }   = req.params
    const cacheKey = `card_${id}`
    const cached   = cache.get(cacheKey)

    if (cached) return res.json(cached)

    const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?id=${id}&tcgplayer_data=true&misc=yes`)
    if (!upstream.ok) return res.status(404).json({ error: 'Card not found' })
    const json = await upstream.json()
    const card = json.data?.[0]
    if (!card) return res.status(404).json({ error: 'Card not found' })

    try {
      const nameUpstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?name=${encodeURIComponent(card.name)}&misc=yes`)
      if (nameUpstream.ok) {
        const nameJson = await nameUpstream.json()
        const fullCard = nameJson.data?.[0]
        if (fullCard?.card_images?.length) card.card_images = fullCard.card_images
      }
    } catch (_) {}

    cache.set(cacheKey, card)
    res.json(card)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

function resolveTypeKey(type) {
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

function sortCards(cards, sort) {
  return [...cards].sort((a, b) => {
    switch (sort) {
      case 'atk':   return (b.atk   ?? -1) - (a.atk   ?? -1)
      case 'def':   return (b.def   ?? -1) - (a.def   ?? -1)
      case 'level': return (b.level ??  0) - (a.level ??  0)
      case 'price': {
        const pa = parseFloat(a.card_prices?.[0]?.tcgplayer_price || 0)
        const pb = parseFloat(b.card_prices?.[0]?.tcgplayer_price || 0)
        return pb - pa
      }
      default: return a.name.localeCompare(b.name)
    }
  })
}

module.exports = router
