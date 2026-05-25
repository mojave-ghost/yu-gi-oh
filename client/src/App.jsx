import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/layout/NavBar'
import BrowsePage from './pages/BrowsePage'
import CardDetailPage from './pages/CardDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div style={{ fontFamily: 'var(--font-body)', background: 'var(--bg-page)', minHeight: '100vh' }}>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/browse" replace />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/card/:id" element={<CardDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
