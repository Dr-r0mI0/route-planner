import { useState, useCallback, useEffect } from 'react';
import { AppProvider, useApp, STEPS } from './context/AppContext';
import { I18nProvider, useI18n } from './utils/i18n';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import AppHeader from './components/Header/AppHeader';
import AuthPage from './pages/auth/AuthPage';
import AdminPage from './pages/admin/AdminPage';
import MapView from './components/Map/MapView';
import StartPoint from './components/StartPoint/StartPoint';
import LinkInput from './components/LinkInput/LinkInput';
import LocationList from './components/LocationList/LocationList';
import RouteResult from './components/RouteResult/RouteResult';
import ActiveRoute from './components/ActiveRoute/ActiveRoute';

function AppContent() {
  const { step } = useApp();
  const { isLight } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('main'); // main, auth, admin

  // Check URL for routes
  useEffect(() => {
    const url = window.location.pathname;
    if (url === '/admin') {
      setCurrentPage('admin');
    } else if (url === '/login' || url === '/register' || url === '/auth') {
      setCurrentPage('auth');
    } else {
      setCurrentPage('main');
    }
  }, []);

  const handleStartRoute = useCallback(() => setIsActiveRoute(true), []);
  const handleExitActiveRoute = useCallback(() => setIsActiveRoute(false), []);
  
  const [isActiveRoute, setIsActiveRoute] = useState(false);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.history.pushState({}, '', page === 'main' ? '/' : `/${page}`);
  };

  // Show active route view
  if (isActiveRoute) {
    return <ActiveRoute onExit={handleExitActiveRoute} />;
  }

  // Auth page (unified login/register)
  if (currentPage === 'auth') {
    return <AuthPage />;
  }

  // Admin page
  if (currentPage === 'admin') {
    return <AdminPage />;
  }

  // Main app
  const isInputStep = step === STEPS.INPUT;

  return (
    <div className="h-full w-full flex-1 flex flex-col relative">
      {/* Map Background */}
      <div className="absolute inset-0 z-0 h-full md:h-full md:w-full transition-all duration-300">
        <MapView />
      </div>

      {/* Main Sidebar */}
      <div className={`absolute inset-0 z-20 pointer-events-none md:pointer-events-auto
                  md:left-6 md:top-6 md:bottom-6 md:right-auto md:w-[440px]
                  flex flex-col md:rounded-[32px] md:shadow-2xl overflow-hidden md:border md:backdrop-blur-[4px] md:backdrop-saturate-[1.31] md:border-[rgba(255,255,255,0.125)] ${
                    isLight
                      ? 'md:bg-[rgba(255,255,255,0.39)]'
                      : 'md:bg-[rgba(0,0,0,0.55)]'
                  }`}>

        <AppHeader 
          onBack={step !== STEPS.INPUT ? () => window.history.back() : undefined}
          onNavigate={navigateTo}
          isAuthenticated={isAuthenticated}
          user={user}
        />

        {/* Route Inputs Panel */}
        <div className={`absolute bottom-0 left-0 right-0 rounded-t-[32px] pt-6 pb-8 px-5 z-20 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto
                    md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:border-none md:shadow-none md:flex-1 md:overflow-y-auto md:pr-1 md:mt-2 md:gap-5 md:pt-5 ${!isInputStep ? 'top-[76px]' : ''} backdrop-blur-[4px] backdrop-saturate-[1.31] border-t border-[rgba(255,255,255,0.125)] md:bg-transparent md:border-none md:rounded-none ${
                      isLight
                        ? 'bg-[rgba(255,255,255,0.39)]'
                        : 'bg-[rgba(0,0,0,0.55)]'
                    }`}>

          {step === STEPS.INPUT && (
            <>
              <StartPoint />
              <LinkInput />
            </>
          )}

          {step === STEPS.LOCATIONS && (
            <LocationList />
          )}

          {step === STEPS.RESULT && (
            <RouteResult onStartRoute={handleStartRoute} />
          )}
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <AdminProvider>
            <AppProvider>
              <AppContent />
            </AppProvider>
          </AdminProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}