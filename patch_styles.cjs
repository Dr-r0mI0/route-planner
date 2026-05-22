const fs = require('fs');
const path = require('path');

// 1. App.jsx - make map full height
let appJsx = fs.readFileSync('src/App.jsx', 'utf8');
appJsx = appJsx.replace('h-[60%] md:h-full', 'h-full md:h-full');
fs.writeFileSync('src/App.jsx', appJsx);

// 2. ActiveRoute.jsx - make map full height
let activeRouteJsx = fs.readFileSync('src/components/ActiveRoute/ActiveRoute.jsx', 'utf8');
activeRouteJsx = activeRouteJsx.replace(/h-\[60\%\]/g, 'h-full');
activeRouteJsx = activeRouteJsx.replace(/h-\[75\%\]/g, 'h-[75%]'); // keep if needed, but user said all pages full height. Let's make it h-full for both.
activeRouteJsx = activeRouteJsx.replace(/\$\{viewMode === 'map' \? 'h-\[75\%\]' : 'h-full'\}/g, 'h-full');
fs.writeFileSync('src/components/ActiveRoute/ActiveRoute.jsx', activeRouteJsx);

// 3. StartPoint.jsx layout
let startPointJsx = fs.readFileSync('src/components/StartPoint/StartPoint.jsx', 'utf8');

// The original StartPoint layout has a flex wrapper for Start Point Input and Activity Selector.
// We need to break it.
const oldLayout = `{/* Start Point Input with Activity Selector */}
      <div className="flex items-center gap-3 w-full">
        {/* Start Point Input - flex-[3] */}
        <div className="flex-[3] bg-brand-input rounded-[16px] h-[52px] flex items-center px-5 relative overflow-hidden border border-transparent focus-within:border-brand-orange/50 transition-colors">
          <input type="text"
            className="w-full bg-transparent border-none outline-none font-archivo text-lg text-brand-text tracking-[0.15em] z-10 placeholder-gray-400 uppercase font-[800] text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder={t('start.label')} autoComplete="off" name="start_point"
            value={inputValue} onChange={handleInputChange} />
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-brand-input to-transparent z-0 pointer-events-none"></div>
        </div>

        {/* GPS Button */}
        <button
          className={\`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0 shadow-lg active:scale-[0.95] transition-all focus-visible:ring-2 focus-visible:ring-white outline-none \${
            gpsStatus === 'success' ? 'bg-brand-green' : gpsStatus === 'loading' ? 'bg-brand-orange/60 animate-pulse' : 'bg-brand-orange hover:bg-brand-orange/90'
          }\`}
          aria-label="Use Current Location"
          onClick={handleGps}>
          <svg width="28px" height="28px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,2 C12.3796958,2 12.693491,2.28215388 12.7431534,2.64822944 L12.75,2.75 L12.7490685,4.53770881 L12.7490685,4.53770881 C16.292814,4.88757432 19.1124257,7.70718602 19.4632195,11.2525316 L19.5,11.25 L21.25,11.25 C21.6642136,11.25 22,11.5857864 22,12 C22,12.3796958 21.7178461,12.693491 21.3517706,12.7431534 L21.25,12.75 L19.4616558,12.7490368 L19.4616558,12.7490368 C19.1124257,16.292814 16.292814,19.1124257 12.7474684,19.4632195 L12.75,19.5 L12.75,21.25 C12.75,21.6642136 12.4142136,22 12,22 C11.6203042,22 11.306509,21.7178461 11.2568466,21.3517706 L11.25,21.25 L11.2509632,19.4616558 L11.2509632,19.4616558 C7.70718602,19.1124257 4.88757432,16.292814 4.53678051,12.7474684 L4.5,12.75 L2.75,12.75 C2.33578644,12.75 2,12.4142136 2,12 C2,11.6203042 2.28215388,11.306509 2.64822944,11.2568466 L2.75,11.25 L4.53770881,11.2509315 L4.53770881,11.2509315 C4.88757432,7.70718602 7.70718602,4.88757432 11.2525316,4.53678051 L11.25,4.5 L11.25,2.75 C11.25,2.33578644 11.5857864,2 12,2 Z M12,6 C8.6862915,6 6,8.6862915 6,12 C6,15.3137085 8.6862915,18 12,18 C15.3137085,18 18,15.3137085 18,12 C18,8.6862915 15.3137085,6 12,6 Z M12,8 C14.209139,8 16,9.790861 16,12 C16,14.209139 14.209139,16 12,16 C9.790861,16 8,14.209139 8,12 C8,9.790861 9.790861,8 12,8 Z" fill="#FFFFFF" />
          </svg>
        </button>

        {/* Activity Type Dropdown - flex-[2] */}
        <div className="flex-[2] relative shrink-0 min-w-[120px] md:min-w-[150px]">
          <button
            type="button"
            className="w-full bg-brand-input rounded-[16px] h-[52px] flex items-center justify-between px-4 border border-transparent hover:border-brand-border focus:border-brand-orange/50 transition-colors outline-none cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span className="font-archivo text-xs text-brand-text font-[800] uppercase tracking-wider truncate mr-1">
              {preferredTypes.length === 0 
                ? t('activity.placeholder') 
                : preferredTypes.map(id => activities.find(a => a.id === id)?.label).join(', ')}
            </span>
            <svg 
              className={\`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 \${dropdownOpen ? 'rotate-180' : ''}\`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay background to close dropdown */}
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-[200px] bg-brand-bg border border-brand-border rounded-[16px] shadow-2xl p-2 z-50 flex flex-col gap-1 anim-fade-in font-archivo select-none">
                <div className="px-3 py-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider border-b border-brand-border/40">
                  {t('activity.label')}
                </div>
                {activities.map((act) => {
                  const isSelected = preferredTypes.includes(act.id);
                  return (
                    <button
                      key={act.id}
                      type="button"
                      className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all text-left \${
                        isSelected 
                          ? 'bg-brand-orange/10 text-brand-orange' 
                          : 'text-brand-text hover:bg-white/5'
                      }\`}
                      onClick={() => toggleActivity(act.id)}>
                      <span className="truncate">{act.label}</span>
                      {isSelected ? (
                        <svg className="w-4 h-4 text-brand-orange shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* GPS Status */}
      {gpsStatus === 'error' && <div className="font-archivo text-[11px] text-red-400 ml-2 -mt-2">⚠ {gpsError}</div>}
      {gpsStatus === 'loading' && (
        <div className="font-archivo text-[11px] text-gray-400 ml-2 -mt-2 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          {t('start.gps.loading')}
        </div>
      )}

      {/* Checkbox: Use as End Point — 1.html line 149-155 */}
      <label className="flex items-center gap-3 ml-2 mt-1 cursor-pointer select-none group w-max">
        <input type="checkbox"
          className="custom-checkbox border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange outline-none"
          checked={roundTrip}
          onChange={(e) => { setRoundTrip(e.target.checked); if (e.target.checked) { setEndPoint(null); setEndInputValue(''); } }} />
        <span className="font-archivo text-xs text-brand-text uppercase tracking-widest font-bold group-hover:text-gray-200 transition-colors">
          {t('start.useAsEnd')}
        </span>
      </label>`;

const newLayout = `{/* Start Point Input with GPS Button */}
      <div className="flex items-center gap-2 w-full">
        {/* Start Point Input */}
        <div className="flex-1 bg-brand-input rounded-[10px] h-[35px] flex items-center px-4 relative overflow-hidden border border-transparent focus-within:border-brand-orange/50 transition-colors">
          <input type="text"
            className="w-full bg-transparent border-none outline-none font-archivo text-sm text-brand-text tracking-[0.1em] z-10 placeholder-gray-400 uppercase font-[800] text-ellipsis overflow-hidden whitespace-nowrap"
            placeholder={t('start.label')} autoComplete="off" name="start_point"
            value={inputValue} onChange={handleInputChange} />
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-brand-input to-transparent z-0 pointer-events-none"></div>
        </div>

        {/* GPS Button */}
        <button
          className={\`w-[35px] h-[35px] rounded-[10px] flex items-center justify-center shrink-0 shadow-lg active:scale-[0.95] transition-all focus-visible:ring-2 focus-visible:ring-white outline-none \${
            gpsStatus === 'success' ? 'bg-brand-green' : gpsStatus === 'loading' ? 'bg-brand-orange/60 animate-pulse' : 'bg-brand-orange hover:bg-brand-orange/90'
          }\`}
          aria-label="Use Current Location"
          onClick={handleGps}>
          <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12,2 C12.3796958,2 12.693491,2.28215388 12.7431534,2.64822944 L12.75,2.75 L12.7490685,4.53770881 L12.7490685,4.53770881 C16.292814,4.88757432 19.1124257,7.70718602 19.4632195,11.2525316 L19.5,11.25 L21.25,11.25 C21.6642136,11.25 22,11.5857864 22,12 C22,12.3796958 21.7178461,12.693491 21.3517706,12.7431534 L21.25,12.75 L19.4616558,12.7490368 L19.4616558,12.7490368 C19.1124257,16.292814 16.292814,19.1124257 12.7474684,19.4632195 L12.75,19.5 L12.75,21.25 C12.75,21.6642136 12.4142136,22 12,22 C11.6203042,22 11.306509,21.7178461 11.2568466,21.3517706 L11.25,21.25 L11.2509632,19.4616558 L11.2509632,19.4616558 C7.70718602,19.1124257 4.88757432,16.292814 4.53678051,12.7474684 L4.5,12.75 L2.75,12.75 C2.33578644,12.75 2,12.4142136 2,12 C2,11.6203042 2.28215388,11.306509 2.64822944,11.2568466 L2.75,11.25 L4.53770881,11.2509315 L4.53770881,11.2509315 C4.88757432,7.70718602 7.70718602,4.88757432 11.2525316,4.53678051 L11.25,4.5 L11.25,2.75 C11.25,2.33578644 11.5857864,2 12,2 Z M12,6 C8.6862915,6 6,8.6862915 6,12 C6,15.3137085 8.6862915,18 12,18 C15.3137085,18 18,15.3137085 18,12 C18,8.6862915 15.3137085,6 12,6 Z M12,8 C14.209139,8 16,9.790861 16,12 C16,14.209139 14.209139,16 12,16 C9.790861,16 8,14.209139 8,12 C8,9.790861 9.790861,8 12,8 Z" fill="#FFFFFF" />
          </svg>
        </button>
      </div>

      {/* GPS Status */}
      {gpsStatus === 'error' && <div className="font-archivo text-[11px] text-red-400 ml-2 mt-1">⚠ {gpsError}</div>}
      {gpsStatus === 'loading' && (
        <div className="font-archivo text-[11px] text-gray-400 ml-2 mt-1 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
          {t('start.gps.loading')}
        </div>
      )}

      {/* Checkbox: Use as End Point */}
      <label className="flex items-center gap-3 ml-2 mt-2 cursor-pointer select-none group w-max mb-1">
        <input type="checkbox"
          className="custom-checkbox border-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-orange outline-none"
          checked={roundTrip}
          onChange={(e) => { setRoundTrip(e.target.checked); if (e.target.checked) { setEndPoint(null); setEndInputValue(''); } }} />
        <span className="font-archivo text-xs text-brand-text uppercase tracking-widest font-bold group-hover:text-gray-200 transition-colors">
          {t('start.useAsEnd')}
        </span>
      </label>

      {/* Activity Type Dropdown (Row 3) */}
      <div className="w-full relative shrink-0">
        <button
          type="button"
          className="w-full bg-brand-input rounded-[10px] h-[35px] flex items-center justify-between px-4 border border-transparent hover:border-brand-border focus:border-brand-orange/50 transition-colors outline-none cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="font-archivo text-xs text-brand-text font-[800] uppercase tracking-wider truncate mr-1">
            {preferredTypes.length === 0 
              ? t('activity.placeholder') 
              : preferredTypes.map(id => activities.find(a => a.id === id)?.label).join(', ')}
          </span>
          <svg 
            className={\`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 \${dropdownOpen ? 'rotate-180' : ''}\`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
            <div className="absolute right-0 mt-2 w-[200px] bg-brand-bg border border-brand-border rounded-[16px] shadow-2xl p-2 z-50 flex flex-col gap-1 anim-fade-in font-archivo select-none">
              <div className="px-3 py-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider border-b border-brand-border/40">
                {t('activity.label')}
              </div>
              {activities.map((act) => {
                const isSelected = preferredTypes.includes(act.id);
                return (
                  <button
                    key={act.id}
                    type="button"
                    className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-xs font-bold transition-all text-left \${
                      isSelected 
                        ? 'bg-brand-orange/10 text-brand-orange' 
                        : 'text-brand-text hover:bg-white/5'
                    }\`}
                    onClick={() => toggleActivity(act.id)}>
                    <span className="truncate">{act.label}</span>
                    {isSelected ? (
                      <svg className="w-4 h-4 text-brand-orange shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>`;

startPointJsx = startPointJsx.replace(oldLayout, newLayout);
// Replace end point layout class
startPointJsx = startPointJsx.replace('bg-brand-input rounded-[16px] h-[52px]', 'bg-brand-input rounded-[10px] h-[35px]');
fs.writeFileSync('src/components/StartPoint/StartPoint.jsx', startPointJsx);

