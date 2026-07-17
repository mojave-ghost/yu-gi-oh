import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLists, calcListTotal } from '../hooks/useLists'

const navyBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  padding: '8px 16px',
  borderRadius: 'var(--radius-md)',
  border: '0.5px solid var(--border)',
  background: 'var(--navy)',
  color: 'var(--nav-text)',
  cursor: 'pointer',
}

const ghostBtnStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  padding: '8px 16px',
  borderRadius: 'var(--radius-md)',
  border: '0.5px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-primary)',
  cursor: 'pointer',
}

export default function ListsPage() {
  const navigate = useNavigate()
  const { lists, createList } = useLists()
  const [modalOpen, setModalOpen] = useState(false)
  const [draftName, setDraftName] = useState('')

  function openModal() {
    setDraftName(`My List ${lists.length}`)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function handleCreate() {
    const newList = createList(draftName.trim())
    setModalOpen(false)
    navigate(`/lists/${newList.id}`)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && draftName.trim()) handleCreate()
    if (e.key === 'Escape') closeModal()
  }

  const isEmpty = lists.length === 1 && lists[0].id === 'wish-list' && lists[0].items.length === 0

  return (
    <>
      <main style={{ padding: 'var(--section-pad)', maxWidth: 860, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            My Lists
          </h1>
          <button style={navyBtnStyle} onClick={openModal}>
            New list
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {lists.map(list => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              onMouseEnter={e => { e.currentTarget.style.border = '0.5px solid var(--cyan)' }}
              onMouseLeave={e => { e.currentTarget.style.border = '0.5px solid var(--border)' }}
              style={{
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 16,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-primary)', marginBottom: 8 }}>
                {list.id === 'wish-list' && (
                  <span style={{ color: 'var(--gold)' }}>★ </span>
                )}
                {list.name}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
                {list.items.length} cards
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--gold)', fontWeight: 500 }}>
                ${calcListTotal(list).toFixed(2)} estimated
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                {new Date(list.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {isEmpty && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginTop: 48,
          }}>
            Add cards from any card detail page to start planning your purchases.
          </p>
        )}
      </main>

      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-page)',
              borderRadius: 'var(--radius-lg)',
              border: '0.5px solid var(--border)',
              padding: 24,
              width: 400,
              maxWidth: '90vw',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500 }}>
                Create a new list
              </span>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>

            <label style={{
              display: 'block',
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 16,
              marginBottom: 6,
            }}>
              List name
            </label>
            <input
              autoFocus
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                height: 36,
                padding: '0 10px',
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={ghostBtnStyle} onClick={closeModal}>
                Cancel
              </button>
              <button
                style={{ ...navyBtnStyle, opacity: draftName.trim() ? 1 : 0.45, cursor: draftName.trim() ? 'pointer' : 'default' }}
                disabled={!draftName.trim()}
                onClick={handleCreate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
