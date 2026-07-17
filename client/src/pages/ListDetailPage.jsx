import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconPencil } from '@tabler/icons-react'
import { useLists, calcItemPrice, calcListTotal, CONDITION_MULTIPLIERS } from '../hooks/useLists'
import { getRarityStyle } from '../utils/rarityStyles'

const backBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  marginBottom: '1.5rem',
  padding: 0,
}

const cancelBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  background: 'none',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '6px 12px',
  cursor: 'pointer',
  color: 'var(--text-primary)',
}

const deleteBtnStyle = {
  ...cancelBtnStyle,
  color: 'var(--red)',
  border: '0.5px solid var(--red)',
}

const selectStyle = {
  fontSize: '13px',
  fontFamily: 'var(--font-body)',
  background: 'var(--bg-surface)',
  border: '0.5px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '4px 8px',
  color: 'var(--text-primary)',
  cursor: 'pointer',
}

export default function ListDetailPage() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const { getList, renameList, deleteList, removeItem, updateItem } = useLists()
  const list = getList(listId)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [nameHovered, setNameHovered] = useState(false)

  if (!list) {
    return (
      <div style={{ padding: 'var(--section-pad)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--red)' }}>List not found.</p>
        <button onClick={() => navigate('/lists')} style={backBtnStyle}>← My Lists</button>
      </div>
    )
  }

  function handleRename() {
    if (draftName.trim()) renameList(listId, draftName.trim())
    setEditing(false)
  }

  function handleDelete() {
    deleteList(listId)
    navigate('/lists')
  }

  const isWishList = listId === 'wish-list'

  return (
    <main style={{ padding: 'var(--section-pad)', maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate('/lists')} style={backBtnStyle}>← My Lists</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        {/* Editable list name */}
        {isWishList ? (
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0 }}>
            {list.name}
          </h1>
        ) : editing ? (
          <input
            autoFocus
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setEditing(false)
            }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              border: 'none',
              borderBottom: '1.5px solid var(--navy)',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              padding: '0 2px',
              width: '100%',
              maxWidth: '480px',
            }}
          />
        ) : (
          <div
            onMouseEnter={() => setNameHovered(true)}
            onMouseLeave={() => setNameHovered(false)}
            onClick={() => { setDraftName(list.name); setEditing(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'text' }}
          >
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', margin: 0 }}>
              {list.name}
            </h1>
            <span style={{
              opacity: nameHovered ? 1 : 0,
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              transition: 'opacity 0.15s',
            }}>
              <IconPencil size={14} />
            </span>
          </div>
        )}

        {/* Delete button */}
        {!isWishList && (
          confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-primary)' }}>
                Delete "{list.name}"? This cannot be undone.
              </span>
              <button onClick={() => setConfirmDelete(false)} style={cancelBtnStyle}>Cancel</button>
              <button onClick={handleDelete} style={deleteBtnStyle}>Delete</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--red)',
                background: 'none',
                border: '0.5px solid var(--red)',
                borderRadius: 'var(--radius-md)',
                padding: '6px 12px',
                cursor: 'pointer',
              }}
            >
              Delete list
            </button>
          )
        )}
      </div>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '16px',
        fontWeight: 500,
        color: 'var(--gold)',
        marginBottom: '24px',
        marginTop: 0,
      }}>
        Total estimated cost: ${calcListTotal(list).toFixed(2)}
      </p>

      {list.items.length === 0 ? (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          marginTop: '48px',
        }}>
          No cards yet. Browse cards and add them to this list.
        </p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--navy)', color: 'var(--nav-text)' }}>
                {['Card', 'Set & Rarity', 'Condition', 'Qty', 'Price', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.items.map(item => {
                const rarityStyle = getRarityStyle(item.setRarityCode)
                return (
                  <tr key={item.itemId} style={{ borderBottom: '0.5px solid var(--border)' }}>
                    {/* Card */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img
                          src={item.cardImage}
                          alt={item.cardName}
                          width={36}
                          loading="lazy"
                          decoding="async"
                          style={{ borderRadius: '2px', display: 'block' }}
                        />
                        <span
                          onClick={() => navigate(`/card/${item.cardId}`)}
                          style={{ color: 'var(--text-primary)', fontWeight: 500, cursor: 'pointer' }}
                        >
                          {item.cardName}
                        </span>
                      </div>
                    </td>

                    {/* Set & Rarity */}
                    <td style={{ padding: '10px 12px' }}>
                      <div>
                        {item.setUrl
                          ? <a href={item.setUrl} target="_blank" rel="noopener noreferrer"
                               style={{ fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                              {item.setName}
                            </a>
                          : <span style={{ fontSize: '12px' }}>{item.setName}</span>
                        }
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{item.setCode}</span>
                          <span style={{
                            background: rarityStyle.bg,
                            color: rarityStyle.color,
                            fontSize: '10px',
                            padding: '2px 5px',
                            borderRadius: 'var(--radius-sm)',
                          }}>
                            {rarityStyle.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Condition */}
                    <td style={{ padding: '10px 12px' }}>
                      <select
                        value={item.condition}
                        onChange={e => updateItem(listId, item.itemId, { condition: e.target.value })}
                        style={selectStyle}
                      >
                        {Object.keys(CONDITION_MULTIPLIERS).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </td>

                    {/* Qty */}
                    <td style={{ padding: '10px 12px' }}>
                      <select
                        value={item.quantity}
                        onChange={e => updateItem(listId, item.itemId, { quantity: Number(e.target.value) })}
                        style={selectStyle}
                      >
                        {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>

                    {/* Price */}
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ color: 'var(--gold)', fontWeight: 500 }}>
                        ${calcItemPrice(item).toFixed(2)}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                        from ${parseFloat(item.setPrice || 0).toFixed(2)} ea
                      </div>
                    </td>

                    {/* Remove */}
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => removeItem(listId, item.itemId)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '16px', cursor: 'pointer', padding: 0 }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            marginTop: '8px',
          }}>
            Prices are estimates. Final prices may vary on TCGPlayer.
          </p>
        </>
      )}
    </main>
  )
}
