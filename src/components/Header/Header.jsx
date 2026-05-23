import { useState, useEffect, useCallback } from 'react';
import { useApp, STEPS } from '../../context/AppContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';

/**
 * Header — Pixel-perfect match to 1.html / 2.html / 3.html header
 *
 * Left: Logo (ROUTE / OPTIMIZER) + Route Planner mode button (blue compass)
 * Right: Language button (globe) + Theme button (half-sun)
 *
 * All buttons: bg-brand-input hover:bg-[#333] w-10 h-10 rounded-[12px] border border-gray-800
 */

const THEME_KEY = 'route_optimizer_theme';

export default function Header() {
  const { step, reset } = useApp();
  const { lang, setLang, t } = useI18n();

  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en');
  }, [lang, setLang]);

  return (
    <div className="absolute inset-x-0 top-0 flex justify-between items-start p-4 z-20 pointer-events-auto
                    md:relative md:top-auto md:left-auto md:right-auto md:p-0 md:mb-6">
      {/* Left: Logo + Route Planner Mode */}
      <div className="flex items-start gap-2">
        <h1
          className="p-1 leading-none cursor-pointer"
          onClick={reset}
        >
          <span className="text-3xl text-brand-text font-archivo tracking-[0.15em] block uppercase leading-none font-black">
            {t('app.name.route')}
          </span>
          <span className="text-sm font-normal text-brand-text font-archivo tracking-[0.15em] block uppercase leading-none mt-1 opacity-80">
            {t('app.name.optimizer')}
          </span>
        </h1>

        {/* Route Planner Mode Button (blue compass) */}
        <button
          className="mt-1 bg-[#292929] hover:bg-[#333] active:scale-95 w-10 h-10 flex items-center justify-center rounded-[12px] shadow-lg border border-gray-800 focus-visible:ring-2 focus-visible:ring-[#e06938] outline-none transition-all"
          aria-label="Route Planner Mode"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM17.35 9.05L15.01 16.59C14.45 18.38 11.94 18.41 11.35 16.63L10.65 14.56C10.46 13.99 10.01 13.53 9.44 13.35L7.36 12.65C5.6 12.06 5.62 9.53 7.41 8.99L14.95 6.64C16.43 6.19 17.82 7.58 17.35 9.05Z" fill="#6b97ed"/>
          </svg>
        </button>
      </div>

      {/* Right: Language + Theme */}
      <div className="flex gap-2 mt-1">
        {/* Language Toggle */}
        <button
          className="bg-[#292929] hover:bg-[#333] active:scale-95 w-10 h-10 flex items-center justify-center rounded-[12px] shadow-lg border border-gray-800 focus-visible:ring-2 focus-visible:ring-[#e06938] outline-none transition-all"
          onClick={toggleLang}
          aria-label="Change Language"
          id="lang-toggle"
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
          </svg>
        </button>

        {/* Theme Toggle */}
        <button
          className="bg-[#292929] hover:bg-[#333] active:scale-95 w-10 h-10 flex items-center justify-center rounded-[12px] shadow-lg border border-gray-800 focus-visible:ring-2 focus-visible:ring-[#e06938] outline-none transition-all"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          id="theme-toggle"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z" fill="#ffffff"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="#ffffff"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
