import { useState } from 'react'

const STORAGE_KEY = 'ygo-lists'

export const CONDITION_MULTIPLIERS = {
  NM:  1.00,
  LP:  0.85,
  MP:  0.70,
  HP:  0.50,
  DMG: 0.25,
}

export function calcItemPrice(item) {
  return parseFloat(item.setPrice || 0)
    * CONDITION_MULTIPLIERS[item.condition]
    * item.quantity
}

export function calcListTotal(list) {
  return list.items.reduce((sum, item) => sum + calcItemPrice(item), 0)
}

const DEFAULT_LISTS = () => [
  {
    id: 'wish-list',
    name: 'Wish List',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: [],
  },
]

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.lists)) return parsed.lists
    }
  } catch {}
  const seed = DEFAULT_LISTS()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists: seed }))
  return seed
}

function persist(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists: next }))
}

export function useLists() {
  const [lists, setLists] = useState(loadFromStorage)

  function update(next) {
    persist(next)
    setLists(next)
  }

  function getList(id) {
    return lists.find(l => l.id === id)
  }

  function createList(name) {
    const list = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    }
    update([...lists, list])
    return list
  }

  function deleteList(id) {
    if (id === 'wish-list') return
    update(lists.filter(l => l.id !== id))
  }

  function renameList(id, name) {
    update(lists.map(l =>
      l.id === id ? { ...l, name, updatedAt: new Date().toISOString() } : l
    ))
  }

  function addItem(listId, item) {
    const newItem = { ...item, itemId: crypto.randomUUID() }
    update(lists.map(l =>
      l.id === listId
        ? { ...l, items: [...l.items, newItem], updatedAt: new Date().toISOString() }
        : l
    ))
  }

  function removeItem(listId, itemId) {
    update(lists.map(l =>
      l.id === listId
        ? { ...l, items: l.items.filter(i => i.itemId !== itemId), updatedAt: new Date().toISOString() }
        : l
    ))
  }

  function updateItem(listId, itemId, changes) {
    update(lists.map(l =>
      l.id === listId
        ? {
            ...l,
            updatedAt: new Date().toISOString(),
            items: l.items.map(i =>
              i.itemId === itemId ? { ...i, ...changes } : i
            ),
          }
        : l
    ))
  }

  return { lists, getList, createList, deleteList, renameList, addItem, removeItem, updateItem }
}
