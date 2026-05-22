import { useState, useRef, useEffect, memo } from 'react';
import { useTheme } from '../../context/ThemeContext';

function ScrollColumn({ items, value, onChange }) {
  const scrollRef = useRef(null);
  const itemHeight = 40;
  const scrollTimeout = useRef(null);
  const [localVal, setLocalVal] = useState(value);
  
  const initialIndex = Math.max(0, items.indexOf(value));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = initialIndex * itemHeight;
    }
  }, [initialIndex, itemHeight]);

  const handleScroll = (e) => {
    const el = e.target;
    const index = Math.round(el.scrollTop / itemHeight);
    const safeIndex = Math.min(items.length - 1, Math.max(0, index));
    setLocalVal(items[safeIndex]);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      onChange(items[safeIndex]);
    }, 100);
  };

  return (
    <div 
      className="flex-1 h-[160px] overflow-hidden relative" 
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)' }}
    >
      <div 
        ref={scrollRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        <div style={{ height: '60px' }} />
        {items.map((item) => (
          <div 
            key={item} 
            className="h-[40px] flex items-center justify-center snap-center text-3xl font-bold transition-colors duration-200"
            style={{ color: item === localVal ? '#ffffff' : '#444444' }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: '60px' }} />
      </div>
    </div>
  );
}

function TimeModal({ initialH, initialM, initialAmpm, onSave, onClose }) {
  const [h, setH] = useState(initialH);
  const [m, setM] = useState(initialM);
  const [ampm, setAmpm] = useState(initialAmpm);
  
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const mins = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  const ampms = ['AM', 'PM'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] w-full sm:w-80 rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-gray-800 shadow-2xl transform transition-transform" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-brand-text font-black text-lg tracking-wide uppercase font-archivo">Time</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-brand-text transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 h-[160px] relative bg-[#111] rounded-2xl border border-gray-800 shadow-inner px-4">
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[42px] bg-white/5 rounded-xl pointer-events-none border border-white/10" />
          
          <ScrollColumn items={hours} value={h} onChange={setH} />
          <span className="text-2xl font-bold text-gray-500 pb-1 animate-pulse">:</span>
          <ScrollColumn items={mins} value={m} onChange={setM} />
          <ScrollColumn items={ampms} value={ampm} onChange={setAmpm} />
        </div>
        
        <button 
          className="mt-8 w-full bg-brand-orange hover:bg-[#c95d31] text-white py-3.5 rounded-xl font-black text-sm tracking-widest transition-all shadow-lg shadow-orange-900/20 uppercase active:scale-[0.98]"
          onClick={() => onSave(`${h.padStart(2, '0')}:${m} ${ampm}`)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default memo(function TimePickerComponent({ value, onChange }) {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  let h = '12', m = '00', ampm = 'PM';
  if (value && value !== 'anytime') {
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hr = parseInt(match[1], 10);
      m = match[2];
      ampm = (match[3] || (hr >= 12 ? 'PM' : 'AM')).toUpperCase();
      if (!match[3]) {
        if (hr > 12) hr -= 12;
        else if (hr === 0) hr = 12;
      }
      h = hr.toString();
    }
  }

  return (
    <>
      <div 
        className={`tiny-input w-[72px] h-6 text-[10px] flex items-center justify-center cursor-pointer hover:border-brand-orange transition-colors select-none ${
          isLight ? 'bg-[#8f8f8f] border border-[#949494] text-[#111]' : ''
        }`}
        onClick={() => setIsOpen(true)}
      >
        {value === 'anytime' || !value ? '--:--' : `${h.padStart(2, '0')}:${m} ${ampm}`}
      </div>
      {isOpen && (
        <TimeModal 
          initialH={h} 
          initialM={m}
          initialAmpm={ampm}
          onSave={(newVal) => { onChange(newVal); setIsOpen(false); }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
});
