import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';
import MapView from '../Map/MapView';

import logoDark from '../../assets/svg/logo-dark.svg';
import logoLight from '../../assets/svg/logo-white.svg';
import backDark from '../../assets/svg/back-dark.svg';
import backLight from '../../assets/svg/back-white.svg';
import enDark from '../../assets/svg/en-dark.svg';
import enLight from '../../assets/svg/en-white.svg';
import arDark from '../../assets/svg/ar-dark.svg';
import arLight from '../../assets/svg/ar-white.svg';
import { useTheme } from '../../context/ThemeContext.jsx';
import AppHeader from '../Header/AppHeader';

export default function ActiveRoute({ onExit }) {
  const { isLight } = useTheme();
  const { optimizedRoute, saveCurrentRoute, reset } = useApp();
  const { t, lang, setLang } = useI18n();
  const deckRef = useRef(null);
  const isAnimatingRef = useRef(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visitedStops, setVisitedStops] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  const stops = useMemo(() => {
    if (!optimizedRoute?.locations || !optimizedRoute?.route) return [];
    return optimizedRoute.route.map(idx => optimizedRoute.locations[idx]).filter(Boolean);
  }, [optimizedRoute]);

  const totalCards = stops.length;

  const handleCheckIn = useCallback(() => {
    if (currentIndex >= stops.length) return;
    const now = Date.now();
    let travelTime = 0;
    if (currentIndex > 0 && visitedStops[currentIndex - 1]?.departedAt) {
      travelTime = Math.round((now - visitedStops[currentIndex - 1].departedAt) / 1000);
    }
    setVisitedStops(prev => ({
      ...prev,
      [currentIndex]: { ...prev[currentIndex], arrivedAt: now, travelTime }
    }));
  }, [currentIndex, stops.length, visitedStops]);

  const handleDone = useCallback(() => {
    const now = Date.now();
    setVisitedStops(prev => ({
      ...prev,
      [currentIndex]: {
        ...prev[currentIndex],
        departedAt: now,
      }
    }));

    if (currentIndex >= stops.length - 1) {
      setIsComplete(true);
      saveCurrentRoute();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, stops.length, saveCurrentRoute]);

  const visitedCount = Object.keys(visitedStops).filter(k => visitedStops[k]?.departedAt).length;
  const remainCount = stops.length - visitedCount;
  const totalDrivingKm = optimizedRoute?.totalDistance ? Math.round(optimizedRoute.totalDistance) : '—';
  const totalWaitMin = stops.reduce((s, l) => s + (l.waitTime || 0), 0);

  useGSAP(() => {
    if (!deckRef.current || viewMode !== 'list') return;
    const cards = deckRef.current.querySelectorAll('.route-card');
    if (!cards.length) return;

    cards.forEach((card, i) => {
      let diff = i - currentIndex;
      if (diff > totalCards / 2) diff -= totalCards;
      if (diff < -totalCards / 2) diff += totalCards;

      let targetScale = 1 - (Math.abs(diff) * 0.05);
      let targetZIndex = 50 - Math.abs(diff);
      let targetY = 20 + (diff * 55);

      if (diff === 0) {
        targetZIndex = 100;
        targetScale = 1.05;
        targetY = 20;
      } else if (diff < 0) {
        targetY = 20 + (diff * 45);
      } else {
        targetY = 110 + (diff * 45);
      }

      gsap.to(card, {
        y: targetY,
        scale: targetScale,
        zIndex: targetZIndex,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  }, { dependencies: [currentIndex, totalCards, viewMode], scope: deckRef });

  useEffect(() => {
    const handleWheel = (e) => {
      if (viewMode !== 'list') return;
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      if (e.deltaY > 0) setCurrentIndex(prev => (prev + 1) % totalCards);
      else if (e.deltaY < 0) setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);

      setTimeout(() => { isAnimatingRef.current = false; }, 250);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [totalCards, viewMode]);

  useEffect(() => {
    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
      if (viewMode !== 'list') return;
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchStartY - touchEndY;

      if (Math.abs(swipeDistance) > 35) {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        if (swipeDistance > 0) setCurrentIndex(prev => (prev + 1) % totalCards);
        else setCurrentIndex(prev => (prev - 1 + totalCards) % totalCards);
        setTimeout(() => { isAnimatingRef.current = false; }, 250);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [totalCards, viewMode]);

  const handleMapToggle = () => {
    if (viewMode === 'map') return;
    const sheetPanel = document.getElementById('sheet-panel');
    const fullMapBg = document.getElementById('full-map-bg');
    
    setViewMode('map');
    if (window.innerWidth < 768) {
      gsap.to(sheetPanel, { y: '70%', duration: 0.4, ease: 'power3.inOut' });
      fullMapBg.style.opacity = "1";
    }
  };

  const handleListToggle = () => {
    if (viewMode === 'list') return;
    const sheetPanel = document.getElementById('sheet-panel');
    const fullMapBg = document.getElementById('full-map-bg');

    setViewMode('list');
    if (window.innerWidth < 768) {
      gsap.to(sheetPanel, { y: '0%', duration: 0.4, ease: 'power3.inOut' });
      fullMapBg.style.opacity = "0.4";
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[100dvh] bg-[#1b1b1b] p-6 text-brand-text text-center absolute inset-0 z-50">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="font-archivo font-black text-3xl uppercase tracking-[0.1em] mb-8">{t('route.complete')}</h2>
        <button
          className="w-full max-w-sm bg-[#e06938] text-white font-archivo font-bold text-lg py-4 rounded-[16px] uppercase tracking-[0.15em] shadow-lg"
          onClick={onExit}
        >
          ✓ Done
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-brand-bg select-none">
      <div id="full-map-bg" className={`absolute inset-0 z-0 h-full md:h-full md:w-full transition-all duration-500 opacity-40 md:opacity-100`}>
        <MapView locations={stops} currentStopIndex={currentIndex} />
      </div>

      <div id="sidebar-container" className={`absolute inset-0 z-20 pointer-events-none md:pointer-events-auto
                md:left-6 md:top-6 md:bottom-6 md:right-auto md:w-[440px]
                md:rounded-[32px] md:shadow-[0_20px_50px_rgba(0,0,0,0.8)]
                md:p-6 md:flex md:flex-col md:h-[calc(100vh-48px)] transition-all duration-500 ${
                  isLight
                    ? 'md:bg-[rgba(255,255,255,0.39)] md:backdrop-blur-[4px] md:backdrop-saturate-[1.31] md:border md:border-[rgba(255,255,255,0.125)]'
                    : 'md:bg-brand-bg/95 md:backdrop-blur-md md:border md:border-gray-800'
                }`}>
        <AppHeader onBack={onExit} />
        <div id="sheet-panel" className={`absolute bottom-0 left-0 right-0 rounded-t-[32px] pt-6 pb-8 px-5 z-20 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-all duration-500
                        md:relative md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:border-none md:shadow-none md:flex-1 md:overflow-y-auto md:pr-1 md:mt-2 md:gap-5 md:pt-2
                        ${viewMode === 'map' ? 'translate-y-[80%]' : 'translate-y-0'} top-[25%] md:h-auto md:top-auto backdrop-blur-[4px] backdrop-saturate-[1.31] border-t border-[rgba(255,255,255,0.125)] ${
                          isLight
                            ? 'bg-[rgba(255,255,255,0.39)]'
                            : 'bg-[rgba(0,0,0,0.55)]'
                        }`}>

          <h2 className={`font-archivo text-[24px] text-center tracking-[0.1em] uppercase shrink-0 mb-4 relative z-[200] transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-0 pointer-events-none' : 'opacity-100'} text-brand-text font-normal`}>LOCATION LIST</h2>

          <div id="stats-panel" className={`grid grid-cols-3 gap-3 w-full shrink-0 px-5 md:px-0 mb-6 transition-opacity duration-300 relative z-[200] ${viewMode === 'map' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className={`rounded-[14px] p-2 flex flex-col justify-center border pl-3 backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
              <span className="text-[9px] text-brand-text font-bold tracking-widest uppercase mb-1 font-archivo">LOCATIONS</span>
              <div className="flex items-center justify-between pr-2">
                <div className="flex flex-col">
                  <span className="text-[8px] text-brand-text font-bold tracking-widest font-archivo">VISITED : {visitedCount}</span>
                  <span className="text-[8px] text-brand-text font-bold tracking-widest font-archivo">REMAIN : {remainCount}</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#e06938" />
                </svg>
              </div>
            </div>
            <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
              <span className="text-[10px] text-brand-text font-bold tracking-widest uppercase mb-1 font-archivo">DRIVING</span>
              <div className="flex items-end gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                  <path d="M18 2H6V6L10 10L6 14V18H18V14L14 10L18 6V2ZM12 11.5L9.5 9V4H14.5V9L12 11.5Z" fill="#4c8bf5" />
                </svg>
                <span className={`font-archivo text-3xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>{totalDrivingKm}</span>
                <span className="font-archivo text-[10px] text-brand-text font-bold mb-0.5">KM</span>
              </div>
            </div>
            <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
              <span className="text-[10px] text-brand-text font-bold tracking-widest uppercase mb-1 font-archivo">WAITING</span>
              <div className="flex items-end gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#b2d958" />
                </svg>
                <span className={`font-archivo text-3xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>{totalWaitMin}</span>
                <span className="font-archivo text-[10px] text-brand-text font-bold mb-0.5">MIN</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative flex flex-col justify-center items-center">
            
            <div id="list-view" className={`absolute inset-0 flex items-start justify-center transition-opacity duration-300 ${viewMode === 'map' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <div id="cards-deck" ref={deckRef} className="cards-deck-container">
                {stops.map((loc, i) => {
                  const isVisited = !!visitedStops[i]?.departedAt;
                  const hasArrived = !!visitedStops[i]?.arrivedAt;
                  const isActive = i === currentIndex;
                  const firstUnvisitedIndex = stops.findIndex((_, idx) => !visitedStops[idx]?.departedAt);
                  const isNext = !isVisited && i === firstUnvisitedIndex;
                  
                  let status = 'unvisited';
                  if (isVisited) {
                      status = isActive ? 'visited-active' : 'visited';
                  } else if (isNext) {
                      status = isActive ? 'next-active' : 'next';
                  } else {
                      status = isActive ? 'active' : 'unvisited';
                  }
                  
                  const primaryName = loc.name || loc.displayName?.split(' - ')[0] || `Location ${i + 1}`;
                  const areaName = [loc.suburb || loc.road, loc.city].filter(Boolean).join(', ');
                  const shortMapUrl = `MAPS?Q=${loc.lat?.toFixed(7)},${loc.lng?.toFixed(7)}`;
                  
                  return (
                    <div key={loc.id || i} className={`route-card group card-${status}-style transition-colors duration-300`} data-status={status} data-arrived={hasArrived}>
                      <div className="absolute -left-2 -top-2 bg-brand-green text-black font-archivo font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow z-10">
                        {i + 1}
                      </div>
                      
                      <h3 className={`font-archivo font-black tracking-widest text-sm uppercase text-center flex-wrap flex justify-center gap-1 ${isVisited ? 'line-through opacity-60' : 'text-brand-text'}`} dir="rtl">
                        <span className="font-alexandria font-normal">{primaryName}</span> <span className="opacity-40">|</span> {primaryName}
                      </h3>
                      
                      <p className={`font-archivo font-bold text-[10px] tracking-wider uppercase text-center mt-1 group-[.card-active-style]:text-brand-text group-[.card-next-active-style]:text-brand-text group-[.card-visited-style]:text-[#888] group-[.card-visited-active-style]:text-[#888] text-gray-400`}>
                        {areaName || 'JEDDAH'}
                      </p>
                      
                      <p className={`font-archivo font-bold text-[8px] tracking-wider uppercase text-center mt-0.5 group-[.card-active-style]:text-brand-text/80 group-[.card-next-active-style]:text-brand-text/80 group-[.card-visited-style]:text-[#888] group-[.card-visited-active-style]:text-[#888] text-gray-500`}>
                        {shortMapUrl}
                      </p>

                      {/* RECOMMENDED Star Tag */}
                      <div className="hidden group-[.card-next-style]:flex group-[.card-next-active-style]:flex justify-center items-center mt-1.5 gap-1 opacity-90">
                         <span className="text-yellow-400 text-xs">★</span>
                         <span className="text-[9px] text-yellow-400 font-archivo font-black tracking-widest">RECOMMENDED</span>
                      </div>

                      {/* Extended Nav / Actions (Hidden via CSS if not active) */}
                      <div className="hidden group-[.card-active-style]:flex group-[.card-next-active-style]:flex mt-4 flex-col items-center">
                        <div className="bg-black/30 rounded-xl p-3 w-full mb-3 flex justify-between items-center border border-white/20">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-brand-text/70 font-bold tracking-widest font-archivo">ALLOWED TIME</span>
                            <span className="text-xs text-brand-text font-black font-archivo">09:15 PM TO 10:15 PM</span>
                          </div>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#b2d958"/>
                          </svg>
                        </div>
                        
                        <div className="flex gap-2 w-full">
                           <button className="flex-1 bg-brand-bg text-brand-text h-[45px] rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform" onClick={() => window.open(loc.unifiedUrl || `https://maps.google.com/?q=${loc.lat},${loc.lng}`, '_blank')}>
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.59 13.41C11.37 14.19 12.63 14.19 13.41 13.41L15.53 11.29C16.89 9.93 16.89 7.71 15.53 6.35C14.17 4.99 11.95 4.99 10.59 6.35L9.53 7.41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M13.41 10.59C12.63 9.81 11.37 9.81 10.59 10.59L8.47 12.71C7.11 14.07 7.11 16.29 8.47 17.65C9.83 19.01 12.05 19.01 13.41 17.65L14.47 16.59" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                             </svg>
                             <span className="font-archivo font-black text-xs uppercase tracking-widest mt-0.5">NAVIGATE</span>
                           </button>
                           
                           <div className="flex-1 flex gap-2">
                              <button className="flex-1 bg-brand-green text-black font-archivo font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform group-data-[arrived=true]:hidden" onClick={handleCheckIn}>
                                  CHECK IN
                              </button>
                              <button className="flex-1 bg-brand-orange text-brand-text font-archivo font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform hidden group-data-[arrived=true]:block" onClick={handleDone}>
                                  DONE
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Map View Next Stop Card */}
        <div id="map-view-card" className={`absolute bottom-24 left-5 right-5 z-20 pointer-events-auto transition-opacity duration-300 ${viewMode === 'list' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
           <div className="bg-brand-bg/95 backdrop-blur border border-brand-orange p-4 rounded-2xl shadow-[0_10px_30px_rgba(224,105,56,0.2)]">
              <div className="flex justify-between items-center mb-2">
                 <span className="bg-brand-orange text-brand-text text-[9px] font-black px-2 py-0.5 rounded font-archivo tracking-widest">NEXT STOP</span>
                 <span className="text-brand-text font-bold text-xs font-archivo">{Math.round((stops[currentIndex]?.distanceFromPrev || 0)/1000)} KM</span>
              </div>
              <h4 className="text-brand-text font-archivo font-black text-sm uppercase truncate">{stops[currentIndex]?.name || 'Location'}</h4>
              <p className="text-gray-400 font-archivo text-[10px] font-bold uppercase truncate mt-0.5">{[stops[currentIndex]?.suburb, stops[currentIndex]?.city].filter(Boolean).join(', ')}</p>
           </div>
        </div>

        {/* Toggle LIST / MAP Panel Pill */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-brand-bg border border-brand-border p-1 rounded-full flex md:hidden gap-1 shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 pointer-events-auto">
            <button id="toggle-list-btn" onClick={handleListToggle} className={`px-5 py-2 rounded-full font-archivo font-black text-xs uppercase tracking-widest transition-colors ${viewMode === 'list' ? 'bg-brand-orange text-brand-text' : 'text-gray-400'}`}>
                LIST
            </button>
            <button id="toggle-map-btn" onClick={handleMapToggle} className={`px-5 py-2 rounded-full font-archivo font-black text-xs uppercase tracking-widest transition-colors ${viewMode === 'map' ? 'bg-brand-orange text-brand-text' : 'text-gray-400'}`}>
                MAP
            </button>
        </div>
      </div>
    </div>
  );
}
