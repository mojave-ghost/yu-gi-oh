const express   = require('express')
const NodeCache = require('node-cache')

const router         = express.Router()
const setsListCache  = new NodeCache({ stdTTL: 86400 }) // 24hr — sets list
const setCardsCache  = new NodeCache({ stdTTL: 3600  }) // 1hr  — set card lists

const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'

// GET /api/sets
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'all_sets'
    const cached   = setsListCache.get(cacheKey)

    if (cached) return res.json(cached)

    const upstream = await fetch(`${YGOPRO_BASE}/cardsets.php`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })

    const sets = await upstream.json() // bare array
    setsListCache.set(cacheKey, sets)
    res.json(sets)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

// GET /api/sets/:setName
router.get('/:setName', async (req, res) => {
  try {
    const setName  = decodeURIComponent(req.params.setName)
    const cacheKey = `set_${setName}`
    const cached   = setCardsCache.get(cacheKey)

    if (cached) return res.json(cached)

    const params = new URLSearchParams()
    params.set('cardset',        setName)
    params.set('tcgplayer_data', 'true')
    params.set('misc',           'yes')

    const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?${params}`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })

    const json  = await upstream.json()
    const cards = json.data || []
    const result = { cards, total: cards.length }

    setCardsCache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

module.exports = router
