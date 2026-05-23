import { memo } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import TimePicker from './TimePicker';
import DurationPicker from './DurationPicker';

function LocationCardTimeSlot({ location, onTimeStartChange, onTimeEndChange, onWaitChange }) {
  const { isLight } = useTheme();

  return (
    <div className="flex items-end justify-between border-t border-gray-800/80 pt-1 gap-1.5">
      {/* Allowed Visit Time */}
      <div className="flex flex-col gap-0.5">
        <span className={`text-[8px] tracking-wider uppercase font-archivo font-normal ${isLight ? 'text-[#292929]' : 'text-[#d4d4d4]'}`}>ALLOWED TIME</span>
        <div className="flex items-center gap-1">
          <TimePicker value={location.visitTimeStart} onChange={onTimeStartChange} />
          <span className={`text-[8px] font-bold opacity-60 ${isLight ? 'text-[#292929]' : 'text-brand-text'}`}>TO</span>
          <TimePicker value={location.visitTimeEnd} onChange={onTimeEndChange} />
        </div>
      </div>

      {/* Waiting */}
      <div className="flex flex-col gap-0.5 items-center">
        <span className={`text-[8px] tracking-wider uppercase font-archivo font-normal ${isLight ? 'text-[#292929]' : 'text-[#d4d4d4]'}`}>WAITING</span>
        <div className="flex items-center gap-1">
          <DurationPicker value={location.waitTime ?? 10} onChange={onWaitChange} />
          <span className={`text-[8px] font-bold opacity-60 ${isLight ? 'text-[#292929]' : 'text-brand-text'}`}>H:M</span>
        </div>
      </div>

      {/* Book Checkbox */}
      <div className="flex flex-col gap-0.5 items-center justify-center">
        <span className={`text-[8px] tracking-wider uppercase font-archivo font-normal ${isLight ? 'text-[#292929]' : 'text-[#d4d4d4]'}`}>BOOK</span>
        <div className="h-6 flex items-center justify-center">
          <input type="checkbox" className={`tiny-checkbox border ${isLight ? 'border-[#292929]' : 'border-[#404040]'}`} checked={location.hasBooking || false} onChange={location.onBookingChange} />
        </div>
      </div>
    </div>
  );
}

export default memo(LocationCardTimeSlot);