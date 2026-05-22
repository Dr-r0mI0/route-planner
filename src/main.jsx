import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import PlacesPage from './pages/PlacesPage.jsx'
import VisitsPage from './pages/VisitsPage.jsx'
import CommunitiesPage from './pages/CommunitiesPage.jsx'
import CommunityDetailPage from './pages/CommunityDetailPage.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/:id" element={<CommunityDetailPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)