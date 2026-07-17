# Slice 11.6 — Route Integration and Final Verification

## Status of App.jsx (as of reading the file)

`client/src/App.jsx` is **already complete**. No changes needed.

Both page imports are present at the top of the file:

```jsx
import SetsPage from './pages/SetsPage'       // line 5 — already present
import SetDetailPage from './pages/SetDetailPage'  // line 6 — already present
```

Both routes are present inside `<Routes>`, ordered correctly before the `*` catch-all:

```jsx
<Route path="/sets"          element={<SetsPage />} />       // line 17 — already present
<Route path="/sets/:setName" element={<SetDetailPage />} />  // line 18 — already present
<Route path="*"              element={<NotFoundPage />} />   // line 19 — catch-all, last
```

These were added in Slices 11.3 and 11.5. No edits to App.jsx are required in this slice.

---

## Files changed in this slice

**None.** This slice is verification-only.

---

## End-to-end verification checklist

Run the dev stack (`npm run dev` in `client/` and `node server/index.js`) before going through
each item. Check them in order — earlier items are prerequisites for later ones.

### 1. `/sets` loads the grouped set list

- Navigate to `http://localhost:5173/sets`
- The page renders without error
- Sets are displayed in grouped sections (by era or release year, per the SetsPage design)
- The sets filter input is visible at the top of the page

### 2. Sets filter is isolated from the NavBar search bar

- On `/sets`, type several characters into the **sets filter input**
- Confirm the URL updates with `?setq=<your text>` (or whatever param SetsPage uses)
- Confirm the **NavBar search bar** remains empty and unchanged
- The card grid on BrowsePage is not affected (it is not rendered on this route)

### 3. NavBar search bar is isolated from the sets filter

- On `/sets`, type several characters into the **NavBar search bar**
- Confirm the sets filter input remains unchanged
- The NavBar search bar operates on its own URL param (`q=`) scoped to `/browse`, not `/sets`
- Navigating to `/browse` with `?q=<text>` from the NavBar should work normally

### 4. Clicking a set navigates to `/sets/:setName`

- On `/sets`, click any set name / card
- The URL changes to `/sets/<setName>` (URL-encoded if the name contains spaces)
- `SetDetailPage` renders without error
- A card grid for that set's cards is displayed

### 5. Back button preserves the `setq` filter

- Navigate to `/sets` and type a search string into the sets filter (e.g. `?setq=legend`)
- Click a set to go to `/sets/:setName`
- Press the browser back button (or the in-page back button on `SetDetailPage`)
- Confirm the URL returns to `/sets?setq=legend` with the filter intact
- The filtered list should reflect the preserved search term

### 6. Random card button works from `/sets`

- While on `/sets` or `/sets/:setName`, click the **Random Card** button in the NavBar
- Confirm it navigates to `/card/<id>` for a random card
- Confirm no console errors are thrown related to the sets routes or filter state

---

## What to check if a test fails

| Symptom | Likely cause | Where to look |
|---|---|---|
| `/sets` 404 or blank | Route missing or component not exported | `App.jsx` line 17, `pages/SetsPage.jsx` default export |
| `/sets/:setName` 404 | Route missing | `App.jsx` line 18 |
| Sets filter updates NavBar bar | Filter using `q` param instead of its own param | `SetsPage.jsx` — confirm it uses `setq` (or equivalent), not `q` |
| NavBar updates sets filter | Same param collision as above | Same fix |
| Back button loses `setq` | `SetDetailPage` back button using `navigate('/')` instead of `navigate(-1)` | `SetDetailPage.jsx` back button handler |
| Random card broken | NavBar hitting `/api/sets/random` instead of `/api/cards/random` | `NavBar.jsx` random card fetch URL |
