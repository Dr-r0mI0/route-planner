import { useEffect, useRef, useMemo, useCallback } from 'react';
import Sortable from 'sortablejs';
import { useApp, STEPS } from '../../context/AppContext';
import { useI18n } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import LocationCard from '../LocationCard/LocationCard';

export default function LocationList() {
  const { locations, setLocations, setStep, optimizeRoute, isLoading, reset } = useApp();
  const { t } = useI18n();
  const { isLight } = useTheme();
  const sortableRef = useRef(null);
  const sortableInst = useRef(null);

  const startPoint = locations.find(l => l.isStartPoint);
  const stops = locations.filter(l => !l.isStartPoint);

  const stats = useMemo(() => {
    const totalWait = stops.reduce((s, l) => s + (l.waitTime || 0), 0);
    const bookable = stops.filter(l => l.hasBooking).length;
    return { count: stops.length, totalWait, bookable };
  }, [stops]);

  useEffect(() => {
    if (sortableRef.current && stops.length > 0) {
      sortableInst.current = Sortable.create(sortableRef.current, {
        handle: '.drag-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        forceFallback: true,
        filter: '.no-drag',
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt;
          if (oldIndex === newIndex) return;

          setLocations(prev => {
            const startNode = prev.find(l => l.isStartPoint);
            const otherNodes = prev.filter(l => !l.isStartPoint);
            const [moved] = otherNodes.splice(oldIndex, 1);
            otherNodes.splice(newIndex, 0, moved);
            return startNode ? [startNode, ...otherNodes] : otherNodes;
          });
        }
      });
    }

    return () => {
      if (sortableInst.current) {
        sortableInst.current.destroy();
        sortableInst.current = null;
      }
    };
  }, [stops.length, setLocations]);

  const handleOptimize = useCallback(async () => {
    await optimizeRoute();
  }, [optimizeRoute]);

  if (!locations.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]">
        <p className="text-gray-400 mb-6 text-sm font-archivo">{t('locations.empty')}</p>
        <button
          className="bg-brand-input hover:bg-[#333] text-brand-text px-6 py-2.5 rounded-[12px] text-sm font-bold uppercase tracking-wider transition-colors border border-brand-border"
          onClick={() => setStep(STEPS.INPUT)}
        >
          {t('locations.back')}
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className={`font-archivo text-[24px] text-center tracking-[0.1em] uppercase shrink-0 text-brand-text font-normal`}>
        {t('locations.title') || 'LOCATION LIST'}
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 w-full shrink-0">
        <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">
            {t('locations.label') || 'LOCATIONS'}
          </span>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                fill="#e06938" />
            </svg>
            <span className={`font-archivo text-xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>{stats.count}</span>
          </div>
        </div>
        <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">
            {t('locations.wait.label') || 'WAITING'}
          </span>
          <div className="flex items-end gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-0.5">
              <path d="M18 2H6V6L10 10L6 14V18H18V14L14 10L18 6V2ZM12 11.5L9.5 9V4H14.5V9L12 11.5Z" fill="#4c8bf5" />
            </svg>
            <span className={`font-archivo text-xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>{stats.totalWait}</span>
            <span className="font-archivo text-[9px] text-gray-500 font-bold">{t('locations.min') || 'MIN'}</span>
          </div>
        </div>
        <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1">
            {t('locations.bookable') || 'BOOKABLE'}
          </span>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                fill="#b2d958" />
            </svg>
            <span className={`font-archivo text-xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>{stats.bookable}</span>
          </div>
        </div>
      </div>

      {/* Start Point Card */}
      {startPoint && (
        <LocationCard location={startPoint} index={0} isStart />
      )}

      {/* Draggable Location Cards Container */}
      <div id="sortable-list" ref={sortableRef} className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar pr-0.5 pb-20 md:pb-4">
        {stops.map((loc, i) => (
          <LocationCard key={loc.id} location={loc} index={i + 1} />
        ))}
      </div>

      {/* Continue Button */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 pt-16 bg-gradient-to-t from-brand-bg via-brand-bg to-transparent pointer-events-none md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:pt-2 md:mt-2 shrink-0 z-10">
        <div className="flex gap-3 pointer-events-auto w-full h-[35px]">
          {/* Reset Button (1/3) */}
          <button
            className="w-1/3 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white outline-none transition-all h-full rounded-[10px]"
            onClick={() => {
              if (window.confirm(t('general.confirmReset') || 'Are you sure you want to clear all data and start over?')) {
                reset();
              }
            }}
          >
            <svg width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 14.2916V17.2916M6 17.2916H6.12643L9.04351 17.078" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-archivo text-xs text-white font-bold">
              RESET
            </span>
          </button>
          
          {/* Continue Button (2/3) */}
          <button
            className="w-2/3 bg-brand-orange hover:bg-brand-orange/90 flex items-center justify-center shadow-[0_10px_30px_rgba(224,105,56,0.3)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed h-full rounded-[10px]"
            onClick={handleOptimize}
            disabled={isLoading || stops.length < 2}
          >
            <span className="font-archivo text-[22px] text-white tracking-[0.15em] font-bold">
              {isLoading ? t('locations.calculating') : (t('locations.optimize') || 'CONTINUE')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
