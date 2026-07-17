const express   = require('express')
const NodeCache = require('node-cache')

const router              = express.Router()
const archetypesListCache = new NodeCache({ stdTTL: 86400 }) // 24hr — archetypes list
const archetypeCardsCache = new NodeCache({ stdTTL: 3600  }) // 1hr  — archetype card lists

const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'

// GET /api/archetypes
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'all_archetypes'
    const cached   = archetypesListCache.get(cacheKey)

    if (cached) return res.json(cached)

    const upstream = await fetch(`${YGOPRO_BASE}/archetypes.php`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })

    const archetypes = await upstream.json() // bare array of { archetype_name }
    archetypesListCache.set(cacheKey, archetypes)
    res.json(archetypes)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// GET /api/archetypes/:name
router.get('/:name', async (req, res) => {
  try {
    const name     = decodeURIComponent(req.params.name)
    const cacheKey = `archetype_${name}`
    const cached   = archetypeCardsCache.get(cacheKey)

    if (cached) return res.json(cached)

    const params = new URLSearchParams()
    params.set('archetype',      name)
    params.set('tcgplayer_data', 'true')
    params.set('misc',           'yes')

    const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?${params}`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })

    const json   = await upstream.json()
    const cards  = json.data || []
    const result = { cards, total: cards.length }

    archetypeCardsCache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

module.exports = router
