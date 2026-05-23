import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';
import { extractUrlsFromText } from '../../utils/urlParser';

export default function LinkInput() {
  const {
    rawInput, setRawInput, setLocations,
    isLoading, setLoading, setProgress, loadingProgress,
    setError, error, startPoint, mapAddedCount, preferredTypes, reset
  } = useApp();
  const { t, lang } = useI18n();
  const [urlCount, setUrlCount] = useState(0);

  useEffect(() => {
    const extracted = extractUrlsFromText(rawInput);
    setUrlCount(extracted.length);
  }, [rawInput]);

  const handleChange = useCallback((e) => setRawInput(e.target.value), [setRawInput]);

  const handleContinue = useCallback(async () => {
    if (!rawInput.trim()) { setError(t('links.error.empty')); return; }
    setLoading(true); setError(null); setProgress(0, 0, t('links.parsing'));
    try {
      // Send text to backend pipeline
      setProgress(0, 100, t('links.processing'));
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawInput, lang: lang, preferredTypes: preferredTypes })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve URLs on server');
      }

      const results = await response.json();

      const validParsed = [];
      const failedParsed = [];

      for (const item of results) {
        if (item.coordinates && item.coordinates.lat && item.coordinates.lng) {
          const lat = item.coordinates.lat;
          const lng = item.coordinates.lng;
          const name = item.closestPoi || 'Location';
          const address = item.addressDescription || '';

          validParsed.push({
            lat,
            lng,
            name,
            road: address,
            suburb: null,
            city: null,
            fullAddress: address,
            displayName: name + (address ? ` - ${address}` : ''),
            originalUrl: item.inputUrl,
            unifiedUrl: `https://www.google.com/maps?q=${lat},${lng}`,
            waitTime: 0
          });
        } else {
          failedParsed.push(item);
        }
      }

      if (validParsed.length === 0) {
        setError(failedParsed.length > 0
          ? `Could not extract coordinates. ${failedParsed.length} URL(s) failed to resolve.`
          : 'Could not extract coordinates from any link.');
        setLoading(false); return;
      }

      let allLocations = validParsed;
      if (startPoint?.lat && startPoint?.lng) {
        allLocations = [
          { ...startPoint, displayName: startPoint.displayName || 'Start Point', isStartPoint: true, waitTime: 0 },
          ...validParsed,
        ];
      }
      setLocations(allLocations);
      setLoading(false);
      if (failedParsed.length > 0) {
        setError(`⚠ ${validParsed.length} locations loaded, ${failedParsed.length} URLs couldn't be resolved.`);
      }
    } catch (err) { setError(`Error: ${err.message}`); setLoading(false); }
  }, [rawInput, startPoint, setLocations, setLoading, setProgress, setError, t, lang, preferredTypes]);

  {/* ====== EXACT COPY of 1.html lines 166-177, class→className ====== */ }
  return (
    <>
      {/* Textarea / Link Area — 1.html line 166-171 */}
      <div className="bg-brand-input rounded-[18px] p-4 w-full relative flex-1 min-h-[160px] md:min-h-[180px] flex border border-transparent focus-within:border-brand-orange/50 transition-colors">
        <textarea
          className="link-area w-full bg-transparent border-none outline-none text-brand-text font-archivo text-[11px] resize-none placeholder-gray-400 tracking-wider uppercase leading-[1.6] focus-visible:ring-0"
          placeholder={t('links.placeholder')}
          value={rawInput}
          onChange={handleChange}
          disabled={isLoading}
          dir="ltr"
        ></textarea>
      </div>

      {/* Badges */}
      {(urlCount > 0 || mapAddedCount > 0) && (
        <div className="flex items-center gap-2 -mt-2 ml-1">
          {urlCount > 0 && (
            <span className="font-archivo text-[10px] text-brand-orange font-bold uppercase tracking-widest">
              {t('links.detected', { count: urlCount })}
            </span>
          )}
          {mapAddedCount > 0 && (
            <span className="font-archivo text-[10px] text-brand-green font-bold uppercase tracking-widest">
              🗺️ {t('links.mapAdded', { count: mapAddedCount })}
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {error && <div className="font-archivo text-[11px] text-red-400 ml-1 -mt-1 leading-snug">⚠ {error}</div>}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-2 -mt-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="font-archivo text-[11px] text-gray-300 uppercase tracking-widest">
              {loadingProgress.message || t('links.processing')}
            </span>
          </div>
          {loadingProgress.total > 0 && (
            <div className="w-full bg-brand-input rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-orange h-full rounded-full transition-all duration-300"
                style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }} />
            </div>
          )}
        </div>
      )}
      {/* ── Action Buttons ── */}
      <div className="mt-auto pt-4 w-full shrink-0 md:sticky md:bottom-0 md:z-30">
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent -z-10 pointer-events-none md:-mx-[15px] md:px-[15px] md:-bottom-[15px] md:pb-[15px]" />
        
        <div className="flex gap-3 pointer-events-auto w-full h-[35px]">
          {/* Reset Button (1/3) */}
          <button
            className="w-1/3 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white outline-none transition-all h-full rounded-[10px]"
            onClick={() => {
              if (window.confirm("Are you sure you want to reset everything?")) {
                reset();
              }
            }}
          >
            <svg width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 14.2916V17.2916M6 17.2916H6.12643L9.04351 17.078" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-archivo text-xs text-white font-bold tracking-wider">
              RESET
            </span>
          </button>

          {/* Continue Button (2/3) */}
          <button
            className="w-2/3 bg-brand-orange hover:bg-brand-orange/90 flex items-center justify-center shadow-[0_10px_30px_rgba(224,105,56,0.3)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed h-full rounded-[10px]"
            onClick={handleContinue}
            disabled={isLoading || !rawInput.trim()}
          >
            <span className="font-archivo text-[22px] text-white tracking-[0.15em] font-bold">
              {isLoading ? t('links.processing') : t('links.continue')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
