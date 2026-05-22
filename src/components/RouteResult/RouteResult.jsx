import { useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp, STEPS } from '../../context/AppContext';
import { useI18n } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import { recalculateLegs } from '../../utils/routeOptimizer';
import { formatDistance, formatDuration, buildNavigationUrl } from '../../utils/formatters';

/**
 * RouteResult — Built using design elements from 2.html/3.html
 *
 * Uses same design language:
 * - bg-[#1b1b1b], bg-[#292929] cards, brand-orange, font-archivo
 * - 3-col stats grid (DISTANCE, DRIVING, WAITING)
 * - Draggable route cards with drag-handle bars
 * - Orange START ROUTE button, secondary buttons
 */
export default function RouteResult({ onStartRoute }) {
  const {
    optimizedRoute, setStep, setRouteOrder,
    saveCurrentRoute, locations: allLocations, reset
  } = useApp();
  const { t } = useI18n();
  const { isLight } = useTheme();
  const [saved, setSaved] = useState(false);

  const orderedLocations = useMemo(() => {
    if (!optimizedRoute?.locations || !optimizedRoute?.route) return [];
    return optimizedRoute.route.map(idx => optimizedRoute.locations[idx]).filter(Boolean);
  }, [optimizedRoute]);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { index: from } = result.source;
    const { index: to } = result.destination;
    if (from === to) return;

    const newOrdered = Array.from(orderedLocations);
    const [moved] = newOrdered.splice(from, 1);
    newOrdered.splice(to, 0, moved);

    const newRoute = newOrdered.map(loc =>
      optimizedRoute.locations.findIndex(l => l.id === loc.id)
    );
    const recalculated = recalculateLegs(newRoute, optimizedRoute.locations);
    setRouteOrder(recalculated);
  }, [orderedLocations, optimizedRoute, setRouteOrder]);

  const handleBack = useCallback(() => {
    setStep(STEPS.LOCATIONS);
  }, [setStep]);

  const handleSave = useCallback(() => {
    saveCurrentRoute();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [saveCurrentRoute]);

  if (!optimizedRoute || !orderedLocations.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[40vh]">
        <p className="text-gray-400 mb-6 text-sm font-archivo">{t('general.noRoute')}</p>
        <button
          className="bg-[#292929] hover:bg-[#333] text-brand-text px-6 py-2.5 rounded-[12px] text-sm font-bold uppercase tracking-wider transition-colors border border-gray-800 font-archivo"
          onClick={handleBack}
        >
          {t('route.edit')}
        </button>
      </div>
    );
  }

  const nonStartLocations = orderedLocations.filter(l => !l.isStartPoint);
  const startLoc = orderedLocations.find(l => l.isStartPoint);
  const navUrl = buildNavigationUrl(nonStartLocations, startLoc);

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-transparent text-brand-text w-full">

      {/* ── Title ── */}
      <h2 className={`font-archivo text-[24px] text-center tracking-[0.1em] uppercase shrink-0 pt-2 mb-4 text-brand-text font-normal`}>
        {t('route.optimizedTitle')}
      </h2>

      {/* ── Stats Grid (3 columns — same pattern as 2.html/3.html) ── */}
      <div className="grid grid-cols-3 gap-3 w-full px-1 mb-4 shrink-0">
        {/* DISTANCE */}
        <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1 font-archivo">
            {t('route.distance')}
          </span>
          <div className="flex items-end gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#e06938" /></svg>
            <span className={`font-archivo text-xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>
              {formatDistance(optimizedRoute.totalDistance)}
            </span>
          </div>
        </div>

        {/* DRIVING */}
        <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1 font-archivo">
            {t('route.driving')}
          </span>
          <div className="flex items-end gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 2H6V6L10 10L6 14V18H18V14L14 10L18 6V2ZM12 11.5L9.5 9V4H14.5V9L12 11.5Z" fill="#4c8bf5" /></svg>
            <span className={`font-archivo text-xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>
              {formatDuration(optimizedRoute.totalDuration)}
            </span>
          </div>
        </div>

        {/* WAITING */}
        <div className={`rounded-[14px] p-2 flex flex-col items-center justify-center border backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`}>
          <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1 font-archivo">
            {t('route.waitTime')}
          </span>
          <div className="flex items-end gap-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#b2d958" /></svg>
            <span className={`font-archivo text-xl leading-none font-bold ${isLight ? 'text-[#292929]' : 'text-[#e2e2e2]'}`}>
              {formatDuration(optimizedRoute.totalWaitTime)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Draggable Route Cards ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="route-cards">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex flex-col gap-3"
              >
                {orderedLocations.map((loc, i) => {
                  const leg = optimizedRoute.legs?.[i - 1] || null;
                  const isStart = loc.isStartPoint;
                  const primaryName = loc.name || loc.displayName?.split(' - ')[0] || `Stop ${i + 1}`;
                  const areaName = [loc.suburb || loc.road, loc.city].filter(Boolean).join(', ');

                  return (
                    <Draggable key={loc.id} draggableId={String(loc.id)} index={i}>
                      {(dragProvided, snapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`transition-shadow duration-200 ${snapshot.isDragging ? 'shadow-[0_12px_40px_rgba(224,105,56,0.3)] ring-1 ring-[#e06938]/40 z-50' : ''
                            }`}
                          style={dragProvided.draggableProps.style}
                        >
                          {/* Leg info between cards */}
                          {leg && (
                            <div className="flex items-center gap-2 py-2 px-3">
                              <div className="flex-1 h-px bg-gray-700" />
                              <span className="font-archivo text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                                🚗 {formatDistance(leg.distance)} · ⏱ {formatDuration(leg.duration)}
                              </span>
                              <div className="flex-1 h-px bg-gray-700" />
                            </div>
                          )}

                          {/* Card */}
                          <div className={`flex items-center gap-2 w-full rounded-[14px] p-3 border shadow-md transition-all ${isStart
                              ? 'bg-[#e06938] border-orange-600/30'
                              : 'bg-brand-input border-brand-border'
                            }`}>
                            {/* Drag Handle */}
                            <div
                              className="drag-handle flex flex-col gap-1 py-3 cursor-grab w-5 items-center shrink-0 opacity-60 hover:opacity-100 transition-opacity active:cursor-grabbing"
                              {...dragProvided.dragHandleProps}
                            >
                              <div className="w-4 h-0.5 bg-white rounded-full" />
                              <div className="w-4 h-0.5 bg-white rounded-full" />
                              <div className="w-4 h-0.5 bg-white rounded-full" />
                              <div className="w-4 h-0.5 bg-white rounded-full" />
                            </div>

                            {/* Step number badge */}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-archivo font-black text-xs shrink-0 ${isStart ? 'bg-white/20 text-brand-text' : 'bg-[#b2d958] text-[#1b1b1b]'
                              }`}>
                              {isStart ? '★' : i + 1}
                            </div>

                            {/* Card body */}
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-archivo font-bold text-sm tracking-wider uppercase truncate ${isStart ? 'text-brand-text' : 'text-brand-text'
                                }`}>
                                {isStart ? t('locations.startPoint') : primaryName}
                              </h3>
                              {areaName && (
                                <p className={`font-archivo text-[10px] tracking-wider uppercase truncate ${isStart ? 'text-[#1b1b1b] font-black' : 'text-[#e06938] font-bold'
                                  }`}>
                                  {areaName}
                                </p>
                              )}
                              {!isStart && (
                                <div className="flex gap-2 mt-1">
                                  {loc.waitTime > 0 && (
                                    <span className="font-archivo text-[8px] text-gray-400 uppercase tracking-widest font-bold">
                                      ⏳ {loc.waitTime} min
                                    </span>
                                  )}
                                  {loc.hasBooking && (
                                    <span className="font-archivo text-[8px] text-[#e06938] uppercase tracking-widest font-bold">
                                      📋 Booked
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-3 pt-4 pb-2 px-1 shrink-0">
        {/* START ROUTE & RESET */}
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
          
          {/* Start Button (2/3) */}
          <button
            className="w-2/3 bg-[#e06938] hover:bg-[#e06938]/90 flex items-center justify-center shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white outline-none transition-all font-archivo text-[22px] text-white tracking-[0.15em] font-bold h-full rounded-[10px]"
            onClick={onStartRoute}
            id="start-route-button"
          >
            {t('route.start')}
          </button>
        </div>

        {/* Secondary buttons row */}
        <div className="flex gap-3">
          {navUrl && (
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-brand-input hover:bg-[#333] text-brand-text h-10 rounded-[12px] flex items-center justify-center text-[10px] font-archivo font-bold uppercase tracking-widest border border-brand-border transition-colors"
            >
              {t('route.fullMaps')}
            </a>
          )}
          <button
            className="flex-1 bg-brand-input hover:bg-[#333] text-brand-text h-10 rounded-[12px] flex items-center justify-center text-[10px] font-archivo font-bold uppercase tracking-widest border border-brand-border transition-colors"
            onClick={handleSave}
          >
            {saved ? t('route.saved') : t('route.save')}
          </button>
        </div>


      </div>
    </div>
  );
}
