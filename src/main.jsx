import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import PlacesPage from './pages/PlacesPage.jsx'
import VisitsPage from './pages/VisitsPage.jsx'
import CommunitiesPage from './pages/CommunitiesPage.jsx'
import CommunityDetailPage from './pages/CommunityDetailPage.jsx'

// Global Providers
import { ThemeProvider } from './context/ThemeContext.jsx'
import { I18nProvider } from './utils/i18n.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminProvider } from './context/AdminContext.jsx'
import { AppProvider } from './context/AppContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <AuthProvider>
            <AdminProvider>
              <AppProvider>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/places" element={<PlacesPage />} />
                  <Route path="/visits" element={<VisitsPage />} />
                  <Route path="/communities" element={<CommunitiesPage />} />
                  <Route path="/communities/:id" element={<CommunityDetailPage />} />
                  <Route path="*" element={<App />} />
                </Routes>
              </AppProvider>
            </AdminProvider>
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)