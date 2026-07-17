# Slice A: useLists Data Layer

## Deliverable

One new file: `client/src/hooks/useLists.js`

No server changes. No additional files.

---

## Storage shape

**localStorage key:** `ygo-lists`

```json
{
  "lists": [
    {
      "id": "string (UUID)",
      "name": "string",
      "createdAt": "ISO string",
      "updatedAt": "ISO string",
      "items": [
        {
          "itemId": "string (UUID)",
          "cardId": "number",
          "cardName": "string",
          "cardImage": "string (image_url_small)",
          "cardType": "string",
          "setName": "string",
          "setCode": "string",
          "setRarity": "string",
          "setRarityCode": "string",
          "setPrice": "string",
          "setUrl": "string",
          "condition": "NM | LP | MP | HP | DMG",
          "quantity": "number (1–3)"
        }
      ]
    }
  ]
}
```

---

## Initialization

On first load, read `localStorage.getItem('ygo-lists')`. If the key is absent or unparseable, seed localStorage with:

```js
{
  lists: [
    {
      id: 'wish-list',
      name: 'Wish List',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    }
  ]
}
```

`'wish-list'` is the permanent default list. `deleteList` is a no-op when `id === 'wish-list'`.

---

## UUID generation

Use `crypto.randomUUID()`. Available in all modern browsers — no import, no library.

---

## Hook: `useLists()`

### Internal state

```js
const [lists, setLists] = useState(() => loadFromStorage())
```

`loadFromStorage()` reads `localStorage.getItem('ygo-lists')`, JSON-parses it, returns `parsed.lists`. On any error (missing key, bad JSON), it returns the seeded default array and writes it back to localStorage before returning.

All mutating operations follow the same pattern:
1. Compute the next state from the current state.
2. Call `setLists(next)` for reactivity.
3. Write `JSON.stringify({ lists: next })` to `localStorage.setItem('ygo-lists', ...)` atomically in the same call — no async gap.

### Exported API

| Name | Signature | Behavior |
|---|---|---|
| `lists` | `List[]` | Full array, live. |
| `getList` | `(id) → List \| undefined` | `lists.find(l => l.id === id)` |
| `createList` | `(name) → List` | Appends new list with `crypto.randomUUID()` id, returns it. |
| `deleteList` | `(id) → void` | No-op if `id === 'wish-list'`. Otherwise filters out the list. |
| `renameList` | `(id, name) → void` | Updates `name` and `updatedAt` on the matching list. |
| `addItem` | `(listId, item) → void` | Appends item with new `itemId` via `crypto.randomUUID()`. Updates list `updatedAt`. |
| `removeItem` | `(listId, itemId) → void` | Filters item out of the list. Updates list `updatedAt`. |
| `updateItem` | `(listId, itemId, changes) → void` | Shallow-merges `changes` onto the matching item. Updates list `updatedAt`. |

`addItem` receives everything except `itemId` — the hook generates it internally before writing.

---

## Exported constants and helpers

These are module-level exports alongside the hook, not inside it.

### `CONDITION_MULTIPLIERS`

```js
export const CONDITION_MULTIPLIERS = {
  NM:  1.00,
  LP:  0.85,
  MP:  0.70,
  HP:  0.50,
  DMG: 0.25,
}
```

### `calcItemPrice(item)`

```js
export function calcItemPrice(item) {
  return parseFloat(item.setPrice || 0)
    * CONDITION_MULTIPLIERS[item.condition]
    * item.quantity
}
```

Returns a `number`. Callers use `.toFixed(2)` for display.

### `calcListTotal(list)`

```js
export function calcListTotal(list) {
  return list.items.reduce((sum, item) => sum + calcItemPrice(item), 0)
}
```

Returns a `number`.

---

## File location

```
client/src/hooks/useLists.js
```

Follows the same pattern as the existing hooks (`useCards.js`, `useCardDetail.js`): named export of the hook, with any co-located helpers exported alongside it.

---

## Out of scope for this slice

- No UI components.
- No server routes.
- No TanStack Query — this is localStorage-only, no async data fetching.
- No third-party UUID library.
