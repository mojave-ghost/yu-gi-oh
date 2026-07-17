import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCardDetail } from '../hooks/useCardDetail'
import CardTypeBadge from '../components/cards/CardTypeBadge'
import { getRarityStyle } from '../utils/rarityStyles'
import { useLists, CONDITION_MULTIPLIERS } from '../hooks/useLists'

export default function CardDetailPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { data: card, isLoading, isError } = useCardDetail(id)
  const [sortKey, setSortKey] = useState('best')
  const [showAll, setShowAll] = useState(false)
  const [artIndex, setArtIndex] = useState(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedListId, setSelectedListId] = useState('wish-list')
  const [showNewListInput, setShowNewListInput] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [selectedSetIndex, setSelectedSetIndex] = useState(0)
  const [condition, setCondition] = useState('NM')
  const [quantity, setQuantity] = useState(1)
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const { lists, createList, addItem } = useLists()

  useEffect(() => { setArtIndex(0) }, [id])

  if (isLoading) return <p style={{ padding: 'var(--section-pad)', fontFamily: 'var(--font-body)' }}>Loading…</p>
  if (isError)   return <p style={{ padding: 'var(--section-pad)', color: 'var(--red)' }}>Card not found.</p>

  console.log('card_images:', card.card_images, 'length:', card.card_images?.length)

  function sortSets(sets, key) {
    switch (key) {
      case 'high':
        return [...sets].sort((a, b) =>
          parseFloat(b.set_price || 0) - parseFloat(a.set_price || 0))
      case 'low':
        return [...sets].sort((a, b) =>
          parseFloat(a.set_price || 0) - parseFloat(b.set_price || 0))
      case 'best':
        return [...sets].sort((a, b) => {
          const pa = parseFloat(a.set_price || 0)
          const pb = parseFloat(b.set_price || 0)
          if (pa === 0 && pb === 0) return 0
          if (pa === 0) return 1
          if (pb === 0) return -1
          return pa - pb
        })
      case 'alpha':
        return [...sets].sort((a, b) =>
          a.set_name.localeCompare(b.set_name))
      default:
        return [...sets]
    }
  }

  const price = card.card_prices?.[0]?.tcgplayer_price

  const allSorted   = card.card_sets ? sortSets(card.card_sets, sortKey) : []
  const visibleSets = showAll ? allSorted : allSorted.slice(0, 5)
  const hiddenCount = Math.max(0, allSorted.length - 5)

  const modalSets    = card.card_sets ? sortSets(card.card_sets, 'best') : []
  const selectedSet  = modalSets[selectedSetIndex]
  const selectedList = lists.find(l => l.id === selectedListId)
  const estimatedCost = parseFloat(selectedSet?.set_price || 0)
    * CONDITION_MULTIPLIERS[condition]
    * quantity

  function handleAddToList() {
    const s = modalSets[selectedSetIndex]

    addItem(selectedListId, {
      cardId:        card.id,
      cardName:      card.name,
      cardImage:     card.card_images?.[0]?.image_url_small,
      cardType:      card.type,
      setName:       s?.set_name ?? '',
      setCode:       s?.set_code ?? '',
      setRarity:     s?.set_rarity ?? '',
      setRarityCode: s?.set_rarity_code ?? '',
      setPrice:      s?.set_price ?? '0.00',
      setUrl:        s?.set_url ?? null,
      condition,
      quantity,
    })

    setModalOpen(false)

    const listName = selectedList?.name ?? 'list'
    setToastMessage(`Added to ${listName}`)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2000)
  }

  const labelStyle = {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
    display: 'block',
  }

  const selectStyle = {
    width: '100%',
    height: '36px',
    padding: '0 10px',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    marginBottom: '12px',
  }

  return (
    <>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'var(--section-pad)' }}>
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

        {card.card_images?.length > 1 ? (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
              Alternate Art
            </p>
            <img
              src={card.card_images[artIndex].image_url}
              alt={`${card.name} art ${artIndex + 1}`}
              style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}
              loading="lazy"
              decoding="async"
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setArtIndex(i => i - 1)}
                disabled={artIndex === 0}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-primary)', padding: '0 8px', opacity: artIndex === 0 ? 0.4 : 1 }}
              >
                ←
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {artIndex + 1} of {card.card_images.length}
              </span>
              <button
                onClick={() => setArtIndex(i => i + 1)}
                disabled={artIndex === card.card_images.length - 1}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-primary)', padding: '0 8px', opacity: artIndex === card.card_images.length - 1 ? 0.4 : 1 }}
              >
                →
              </button>
            </div>
          </div>
        ) : (
          <img
            src={card.card_images?.[0]?.image_url}
            alt={card.name}
            style={{ display: 'block', margin: '0 auto 1.5rem', width: '100%', maxWidth: '400px', borderRadius: 'var(--radius-md)' }}
            loading="lazy"
            decoding="async"
          />
        )}

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', marginBottom: '10px' }}>
          {card.name}
        </h1>

        <CardTypeBadge type={card.type} />

        {card.atk !== undefined && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', marginTop: '12px', color: 'var(--text-secondary)' }}>
            ATK <strong>{card.atk}</strong> / DEF <strong>{card.def}</strong>
          </p>
        )}

        {card.level && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Level {card.level} · {card.attribute} · {card.race}
          </p>
        )}

        <p style={{ marginTop: '16px', fontSize: '13px', lineHeight: '1.7', color: 'var(--text-primary)' }}>
          {card.desc}
        </p>

        {price && parseFloat(price) > 0 && (
          <p style={{ marginTop: '16px', fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: 500, color: 'var(--gold)' }}>
            ${parseFloat(price).toFixed(2)}{' '}
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 400 }}>TCGPlayer market</span>
          </p>
        )}

        <button
          onClick={() => setModalOpen(true)}
          style={{
            width: '100%',
            padding: '10px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--navy)',
            color: 'var(--nav-text)',
            cursor: 'pointer',
            marginTop: '16px',
            marginBottom: '16px',
          }}
        >
          Add to list
        </button>

        {card.card_sets && (
          <div style={{ marginTop: '20px' }}>

            {/* Header: SETS label left, sort select right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', margin: 0 }}>
                Sets
              </p>
              <select
                value={sortKey}
                onChange={e => setSortKey(e.target.value)}
                style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '2px 6px', cursor: 'pointer' }}
              >
                <option value="best">Best Match</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="alpha">A–Z</option>
              </select>
            </div>

            {visibleSets.map((s, index) => {
              const rarity = getRarityStyle(s.set_rarity_code)

              return (
                <div
                  key={`${s.set_code}-${s.set_rarity}-${index}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '0.5px solid var(--border)', padding: '8px 0' }}
                >
                  {/* Rarity badge */}
                  <span style={{
                    fontSize: '9px', fontWeight: 500, fontFamily: 'var(--font-body)',
                    padding: '2px 5px', borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    background: rarity.bg, color: rarity.color,
                  }}>
                    {rarity.label}
                  </span>

                  {/* Set info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {s.set_url ? (
                      <a
                        href={s.set_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: 'var(--cyan)', fontWeight: 500, margin: 0, textDecoration: 'none', display: 'block' }}
                      >
                        {s.set_name}
                      </a>
                    ) : (
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                        {s.set_name}
                      </p>
                    )}
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                      {s.set_code} · {s.set_edition}
                    </p>
                  </div>

                  {/* Price block */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 500, margin: 0 }}>
                      {parseFloat(s.set_price) > 0
                        ? '$' + parseFloat(s.set_price).toFixed(2)
                        : '—'}
                    </p>
                  </div>
                </div>
              )
            })}

            {allSorted.length > 5 && (
              <button
                onClick={() => setShowAll(v => !v)}
                style={{ fontSize: '11px', color: 'var(--cyan)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0', display: 'block', fontFamily: 'var(--font-body)' }}
              >
                {showAll
                  ? 'Show less'
                  : `${hiddenCount} more printing${hiddenCount === 1 ? '' : 's'} — Show all`}
              </button>
            )}

          </div>
        )}
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-page)',
              borderRadius: 'var(--radius-lg)',
              border: '0.5px solid var(--border)',
              padding: '24px',
              width: '480px',
              maxWidth: '92vw',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={card.card_images?.[0]?.image_url_small}
                  alt={card.name}
                  width={48}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                    {card.name}
                  </p>
                  <CardTypeBadge type={card.type} />
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '20px', color: 'var(--text-secondary)',
                  lineHeight: 1, padding: 0, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {card.card_images?.length > 1 && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px', marginTop: 0 }}>
                Multiple arts available — verify art on TCGPlayer.
              </p>
            )}

            {/* Field 1 — List */}
            <label style={labelStyle}>Add to list</label>
            <select
              value={showNewListInput ? '__create__' : selectedListId}
              onChange={e => {
                if (e.target.value === '__create__') {
                  setShowNewListInput(true)
                } else {
                  setShowNewListInput(false)
                  setSelectedListId(e.target.value)
                }
              }}
              style={selectStyle}
            >
              {lists.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
              <option disabled>──────────</option>
              <option value="__create__">+ Create new list</option>
            </select>

            {showNewListInput && (
              <input
                autoFocus
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onBlur={() => {
                  if (newListName.trim()) {
                    const created = createList(newListName.trim())
                    setSelectedListId(created.id)
                    setNewListName('')
                    setShowNewListInput(false)
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newListName.trim()) {
                    const created = createList(newListName.trim())
                    setSelectedListId(created.id)
                    setNewListName('')
                    setShowNewListInput(false)
                  }
                }}
                placeholder="List name…"
                style={{
                  width: '100%', height: '36px', padding: '0 10px',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {/* Field 2 — Set & Printing */}
            <label style={labelStyle}>Set</label>
            <select
              value={selectedSetIndex}
              onChange={e => setSelectedSetIndex(Number(e.target.value))}
              disabled={modalSets.length === 0}
              style={selectStyle}
            >
              {modalSets.length === 0
                ? <option>No printings listed</option>
                : modalSets.map((s, i) => (
                    <option key={`${s.set_code}-${s.set_rarity}-${i}`} value={i}>
                      {s.set_name} · {s.set_rarity} · ${parseFloat(s.set_price || 0).toFixed(2)}
                    </option>
                  ))
              }
            </select>

            {/* Field 3 — Condition */}
            <label style={labelStyle}>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} style={selectStyle}>
              <option value="NM">Near Mint</option>
              <option value="LP">Lightly Played</option>
              <option value="MP">Moderately Played</option>
              <option value="HP">Heavily Played</option>
              <option value="DMG">Damaged</option>
            </select>

            {/* Field 4 — Quantity */}
            <label style={labelStyle}>Quantity</label>
            <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={selectStyle}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>

            {/* Live price estimate */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Estimated cost</span>
              <span style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: 500 }}>
                ${estimatedCost.toFixed(2)}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none', border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '8px 16px',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddToList}
                style={{
                  background: 'var(--navy)', border: 'none',
                  borderRadius: 'var(--radius-md)', padding: '8px 16px',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--nav-text)', cursor: 'pointer',
                }}
              >
                Add to list
              </button>
            </div>
          </div>
        </div>
      )}

      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: '24px',
          left: '50%', transform: 'translateX(-50%)',
          background: 'var(--navy)', color: 'var(--nav-text)',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          zIndex: 200,
          whiteSpace: 'nowrap',
        }}>
          {toastMessage}
        </div>
      )}
    </>
  )
}
