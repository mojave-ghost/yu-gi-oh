const express   = require('express')
const NodeCache = require('node-cache')

const router = express.Router()
const cache  = new NodeCache({ stdTTL: 86400 }) // 24hr — banlist updates infrequently

const YGOPRO_BASE = 'https://db.ygoprodeck.com/api/v7'

// GET /api/banlist
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'tcg_banlist'
    const cached   = cache.get(cacheKey)

    if (cached) return res.json(cached)

    const params = new URLSearchParams()
    params.set('banlist',        'TCG')
    params.set('tcgplayer_data', 'true')

    const upstream = await fetch(`${YGOPRO_BASE}/cardinfo.php?${params}`)
    if (!upstream.ok) return res.status(502).json({ error: 'Upstream API error' })

    const json  = await upstream.json()
    const cards = json.data || []

    const forbidden   = cards.filter(c => c.banlist_info?.ban_tcg === 'Forbidden')
    const limited     = cards.filter(c => c.banlist_info?.ban_tcg === 'Limited')
    const semiLimited = cards.filter(c => c.banlist_info?.ban_tcg === 'Semi-Limited')

    const result = { forbidden, limited, semiLimited }
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(502).json({ error: err.message })
  }
})

module.exports = router
