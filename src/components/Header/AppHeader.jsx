import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';

import logoDark from '../../assets/header/logo-dark.svg';
import logoLight from '../../assets/header/logo-white.svg';
import backDark from '../../assets/header/back-dark.svg';
import backLight from '../../assets/header/back-white.svg';
import enDark from '../../assets/header/en-dark.svg';
import enLight from '../../assets/header/en-white.svg';
import arDark from '../../assets/header/ar-dark.svg';
import arLight from '../../assets/header/ar-white.svg';
import themeDark from '../../assets/header/theme-dark.svg';
import themeLight from '../../assets/header/theme-white.svg';

export default function AppHeader({ onBack }) {
  const { isLight, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();

  return (
    <header className={`absolute md:relative top-0 left-0 right-0 z-20 flex items-center justify-between px-4 h-[64px] shrink-0 pointer-events-auto rounded-t-none rounded-b-[10px] border-x border-b border-t-0 backdrop-blur-[4px] backdrop-saturate-[1.31] transition-colors ${
      isLight
        ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]'
        : 'bg-[rgba(0,0,0,0.55)] border-[rgba(255,255,255,0.125)]'
    }`}>
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack} 
            className="outline-none active:scale-95 transition-transform shrink-0" 
            aria-label="Back"
          >
            <img 
              src={isLight ? backLight : backDark} 
              alt="Back" 
              className="w-[24px] h-[24px] object-contain drop-shadow-lg" 
            />
          </button>
        )}

        {/* Logo / Title */}
        <button 
          onClick={() => window.location.href = '/'} 
          className="outline-none active:scale-95 transition-transform shrink-0"
        >
          <img 
            src={isLight ? logoLight : logoDark} 
            alt="Route Optimizer" 
            className="h-[36px] w-auto object-contain drop-shadow-md" 
          />
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} 
          className="outline-none active:scale-95 transition-transform shrink-0" 
          aria-label="Toggle Language"
        >
          <img 
            src={isLight ? (lang === 'en' ? arLight : enLight) : (lang === 'en' ? arDark : enDark)} 
            alt="Toggle Language" 
            className="w-[24px] h-[24px] object-contain drop-shadow-lg" 
          />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="outline-none active:scale-95 transition-transform shrink-0" 
          aria-label="Toggle Theme"
        >
          <img 
            src={isLight ? themeLight : themeDark} 
            alt="Toggle Theme" 
            className="w-[24px] h-[24px] object-contain drop-shadow-lg" 
          />
        </button>
      </div>
    </header>
  );
}