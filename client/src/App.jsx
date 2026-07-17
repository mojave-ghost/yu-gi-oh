import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/layout/NavBar'
import BrowsePage from './pages/BrowsePage'
import CardDetailPage from './pages/CardDetailPage'
import SetsPage from './pages/SetsPage'
import SetDetailPage from './pages/SetDetailPage'
import ArchetypesPage from './pages/ArchetypesPage'
import ArchetypeDetailPage from './pages/ArchetypeDetailPage'
import BanlistPage from './pages/BanlistPage'
import MiscPage from './pages/MiscPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--bg-page)', minHeight: '100vh' }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/browse" replace />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="/sets" element={<SetsPage />} />
        <Route path="/sets/:setName" element={<SetDetailPage />} />
        <Route path="/archetypes" element={<ArchetypesPage />} />
        <Route path="/archetypes/:name" element={<ArchetypeDetailPage />} />
        <Route path="/banlist" element={<BanlistPage />} />
        <Route path="/misc" element={<MiscPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
