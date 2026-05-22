import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../utils/i18n';
import { useAuth } from '../../context/AuthContext';

export default function AppHeader({ onBack, onNavigate }) {
  const { isLight } = useTheme();
  const { isRTL, lang, setLang } = useI18n();
  const { user, logout } = useAuth();

  const handleCommunities = () => {
    window.location.href = '/#/communities';
  };

  const handleVisits = () => {
    window.location.href = '/#/visits';
  };

  const handlePlaces = () => {
    window.location.href = '/#/places';
  };

  const handleAdmin = () => {
    if (onNavigate) {
      onNavigate('admin');
    } else {
      window.location.href = '/#/admin';
    }
  };

  return (
    <header className="relative flex items-center justify-between px-4 h-[56px] shrink-0">
      {/* Left Side */}
      <div className="flex items-center gap-2">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
              isLight
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
            }`}
            aria-label="Back"
          >
            <svg className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Logo / Title */}
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" className="text-brand-orange"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor" className="text-white"/>
          </svg>
          <span className="font-archivo font-black text-sm tracking-[0.2em] text-brand-text uppercase">
            Route Planner
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Admin Button (only for admins) */}
        {user?.role === 'admin' && (
          <button
            onClick={handleAdmin}
            className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
              isLight
                ? 'bg-brand-orange/20 border-brand-orange/30 text-brand-orange hover:bg-brand-orange/30'
                : 'bg-brand-orange/20 border-brand-orange/30 text-brand-orange hover:bg-brand-orange/30'
            }`}
            aria-label="Admin Dashboard"
            title="لوحة التحكم"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </button>
        )}

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
            isLight
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
              : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
          }`}
          aria-label="Toggle Language"
        >
          <span className="text-xs font-bold">{lang === 'en' ? 'ع' : 'EN'}</span>
        </button>

        {/* Places Button */}
        <button
          onClick={handlePlaces}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
            isLight
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
              : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
          }`}
          aria-label="Places"
        >
          <span className="text-base">📍</span>
        </button>

        {/* Visits Button */}
        <button
          onClick={handleVisits}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
            isLight
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
              : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
          }`}
          aria-label="Visits"
        >
          <span className="text-base">📅</span>
        </button>

        {/* Communities Button */}
        <button
          onClick={handleCommunities}
          className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
            isLight
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
              : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
          }`}
          aria-label="Communities"
        >
          <span className="text-base">👥</span>
        </button>

        {/* Auth Button */}
        {user ? (
          <button
            onClick={logout}
            className={`px-3 h-9 shrink-0 flex items-center justify-center rounded-xl border shadow-lg backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
              isLight
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
            }`}
            aria-label="Logout"
          >
            <span className="text-xs">خروج</span>
          </button>
        ) : (
          <button
            onClick={() => window.location.href = '/#/login'}
            className="px-3 h-9 shrink-0 flex items-center justify-center rounded-xl bg-brand-orange text-white text-xs font-semibold hover:brightness-110 transition-colors"
            aria-label="Login"
          >
            دخول
          </button>
        )}
      </div>
    </header>
  );
}