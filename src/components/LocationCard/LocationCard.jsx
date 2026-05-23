import { useCallback, memo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import DragHandle from './DragHandle';
import LocationCardHeader from './LocationCardHeader';
import LocationCardTimeSlot from './LocationCardTimeSlot';
import LocationCardActions from './LocationCardActions';

// Start Point Card (simplified)
function StartPointCard({ primaryName, areaName, mapUrl, shortMapUrl }) {
  return (
    <div className="bg-brand-orange rounded-2xl p-1.5 shadow-lg shrink-0 border border-orange-600/30">
      <h3 className="font-archivo font-black text-brand-text tracking-widest text-lg uppercase mb-0.5">START POINT</h3>
      <p className="font-archivo text-[#1b1b1b] font-black text-sm tracking-wider uppercase mb-1">
        {areaName || primaryName}
      </p>
      <div className="flex items-center gap-1 opacity-90">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.59 13.41C11.37 14.19 12.63 14.19 13.41 13.41L15.53 11.29C16.89 9.93 16.89 7.71 15.53 6.35C14.17 4.99 11.95 4.99 10.59 6.35L9.53 7.41"
            stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M13.41 10.59C12.63 9.81 11.37 9.81 10.59 10.59L8.47 12.71C7.11 14.07 7.11 16.29 8.47 17.65C9.83 19.01 12.05 19.01 13.41 17.65L14.47 16.59"
            stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="font-archivo text-brand-text text-[9px] tracking-wider uppercase font-bold hover:underline">{shortMapUrl}</a>
      </div>
    </div>
  );
}

// Main Location Card
function LocationCard({ location, index, isStart }) {
  const { updateLocation, removeLocation } = useApp();
  const { isLight } = useTheme();

  // Extract display values
  const primaryName = location.name || location.displayName?.split(' - ')[0] || `Location ${index}`;
  const areaName = [location.suburb || location.road, location.city].filter(Boolean).join(', ');
  const mapUrl = location.unifiedUrl || `https://www.google.com/maps/?q=${location.lat},${location.lng}`;
  const shortMapUrl = `MAPS?Q=${location.lat?.toFixed(7)},${location.lng?.toFixed(7)}`;

  // Handlers
  const handleWaitChange = useCallback((val) => {
    updateLocation(location.id, { waitTime: val });
  }, [location.id, updateLocation]);

  const handleBookingChange = useCallback(() => {
    updateLocation(location.id, { hasBooking: !location.hasBooking });
  }, [location.id, location.hasBooking, updateLocation]);

  const handleTimeStartChange = useCallback((val) => {
    updateLocation(location.id, { visitTimeStart: val });
  }, [location.id, updateLocation]);

  const handleTimeEndChange = useCallback((val) => {
    updateLocation(location.id, { visitTimeEnd: val });
  }, [location.id, updateLocation]);

  const handleDelete = useCallback(() => {
    removeLocation(location.id);
  }, [location.id, removeLocation]);

  // Start Point Card
  if (isStart) {
    return (
      <StartPointCard
        primaryName={primaryName}
        areaName={areaName}
        mapUrl={mapUrl}
        shortMapUrl={shortMapUrl}
      />
    );
  }

  return (
    <div className={`flex items-center gap-1 w-full rounded-[14px] p-1 border shadow-md transition-all backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)] ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}`} data-id={location.id}>
      <DragHandle />

      <div className="flex-1 min-w-0">
        <LocationCardHeader
          primaryName={primaryName}
          areaName={areaName}
          mapUrl={mapUrl}
          shortMapUrl={shortMapUrl}
        />
        <LocationCardTimeSlot
          location={location}
          onTimeStartChange={handleTimeStartChange}
          onTimeEndChange={handleTimeEndChange}
          onWaitChange={handleWaitChange}
          onBookingChange={handleBookingChange}
        />
      </div>

      <LocationCardActions onDelete={handleDelete} />
    </div>
  );
}

export default memo(LocationCard);