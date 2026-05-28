import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useSetCards } from '../hooks/useSetCards'
import CardGrid from '../components/cards/CardGrid'
import { getRarityRank } from '../utils/rarityStyles'

export default function SetDetailPage() {
  const { setName } = useParams()
  const navigate    = useNavigate()
  const decodedName = decodeURIComponent(setName)

  const { data, isLoading, isError } = useSetCards(decodedName)
  const [sortKey, setSortKey] = useState('name')

  const setsCache = useQueryClient().getQueryData(['sets'])
  const meta      = setsCache?.find(s => s.set_name === decodedName) ?? null

  const tcgDateFormatted = meta?.tcg_date
    ? new Date(meta.tcg_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const metaRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    borderBottom: '0.5px solid var(--border)',
    fontSize: '13px',
  }

  function sortCards(cards, key, name) {
    const sorted = [...cards]
    if (key === 'name') {
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
    if (key === 'rarity') {
      return sorted.sort((a, b) => {
        const aCode = a.card_sets?.find(s => s.set_name === name)?.set_rarity_code
        const bCode = b.card_sets?.find(s => s.set_name === name)?.set_rarity_code
        return getRarityRank(bCode) - getRarityRank(aCode)
      })
    }
    if (key === 'price-high') {
      return sorted.sort((a, b) => {
        const ap = parseFloat(a.card_sets?.find(s => s.set_name === name)?.set_price || 0)
        const bp = parseFloat(b.card_sets?.find(s => s.set_name === name)?.set_price || 0)
        if (ap === 0 && bp === 0) return 0
        if (ap === 0) return 1
        if (bp === 0) return -1
        return bp - ap
      })
    }
    if (key === 'price-low') {
      return sorted.sort((a, b) => {
        const ap = parseFloat(a.card_sets?.find(s => s.set_name === name)?.set_price || 0)
        const bp = parseFloat(b.card_sets?.find(s => s.set_name === name)?.set_price || 0)
        if (ap === 0 && bp === 0) return 0
        if (ap === 0) return 1
        if (bp === 0) return -1
        return ap - bp
      })
    }
    return sorted
  }

  const sortedCards = data?.cards ? sortCards(data.cards, sortKey, decodedName) : null

  const highestRarityCard = data?.cards?.length
    ? [...data.cards].sort((a, b) => {
        const aCode = a.card_sets?.find(s => s.set_name === decodedName)?.set_rarity_code
        const bCode = b.card_sets?.find(s => s.set_name === decodedName)?.set_rarity_code
        return getRarityRank(bCode) - getRarityRank(aCode)
      })[0]
    : null

  const setPriceMap = data?.cards
    ? new Map(
        data.cards.map(card => {
          const entry = card.card_sets?.find(s => s.set_name === decodedName)
          return [card.id, entry?.set_price ?? null]
        })
      )
    : null

  return (
    <div style={{ padding: 'var(--section-pad)' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          padding: 0,
        }}
      >
        ← Back
      </button>

      {meta?.set_image && (
        <img
          src={meta.set_image}
          alt={decodedName + ' pack art'}
          loading="lazy"
          decoding="async"
          style={{
            display: 'block',
            width: '160px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
          }}
        />
      )}

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', marginBottom: '4px' }}>
        {decodedName}
      </h1>

      <div style={{ marginBottom: '24px' }}>
        <div style={metaRowStyle}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Set code</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{meta?.set_code ?? '—'}</span>
        </div>
        <div style={metaRowStyle}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>Cards</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{meta?.num_of_cards ?? '—'}</span>
        </div>
        <div style={metaRowStyle}>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>TCG release</span>
          <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>{tcgDateFormatted}</span>
        </div>
      </div>

      {isError ? (
        <p style={{ color: 'var(--red)', fontFamily: 'var(--font-body)' }}>
          Failed to load set.
        </p>
      ) : (
        <>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            aria-label="Sort cards"
            style={{
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              background: 'var(--bg-surface)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              color: 'var(--text-primary)',
              marginBottom: '20px',
              cursor: 'pointer',
            }}
          >
            <option value="name">Name A–Z</option>
            <option value="rarity">Rarity: Highest first</option>
            <option value="price-high">Price: Highest first</option>
            <option value="price-low">Price: Lowest first</option>
          </select>
          <CardGrid
            cards={sortedCards}
            isLoading={isLoading}
            setName={decodedName}
            setPriceMap={setPriceMap}
            highestRarityCardId={highestRarityCard?.id}
          />
        </>
      )}
    </div>
  )
}
