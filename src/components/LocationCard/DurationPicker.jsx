import { useState, useRef, useEffect, memo } from 'react';
import { useTheme } from '../../context/ThemeContext';

function ScrollColumn({ max, value, onChange }) {
  const scrollRef = useRef(null);
  const items = Array.from({ length: max + 1 }, (_, i) => i);
  const itemHeight = 40;
  const scrollTimeout = useRef(null);
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = value * itemHeight;
    }
  }, [value, itemHeight]);

  const handleScroll = (e) => {
    const el = e.target;
    const index = Math.round(el.scrollTop / itemHeight);
    setLocalVal(index);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      onChange(Math.min(max, Math.max(0, index)));
    }, 100);
  };

  return (
    <div 
      className="w-16 h-[160px] overflow-hidden relative" 
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)' }}
    >
      <div 
        ref={scrollRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        onScroll={handleScroll}
      >
        <div style={{ height: '60px' }} />
        {items.map(i => (
          <div 
            key={i} 
            className="h-[40px] flex items-center justify-center snap-center text-3xl font-bold transition-colors duration-200"
            style={{ color: i === localVal ? '#ffffff' : '#444444' }}
          >
            {i.toString().padStart(2, '0')}
          </div>
        ))}
        <div style={{ height: '60px' }} />
      </div>
    </div>
  );
}

function DurationModal({ initialHours, initialMins, onSave, onClose }) {
  const [h, setH] = useState(initialHours);
  const [m, setM] = useState(initialMins);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] w-full sm:w-80 rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-gray-800 shadow-2xl transform transition-transform" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-brand-text font-black text-lg tracking-wide uppercase font-archivo">Wait Time</h4>
          <button onClick={onClose} className="text-gray-500 hover:text-brand-text transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 h-[160px] relative bg-[#111] rounded-2xl border border-gray-800 shadow-inner">
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[42px] bg-white/5 rounded-xl pointer-events-none border border-white/10" />
          
          <ScrollColumn max={23} value={h} onChange={setH} />
          <span className="text-2xl font-bold text-gray-500 pb-1 animate-pulse">:</span>
          <ScrollColumn max={59} value={m} onChange={setM} />
        </div>

        <div className="flex justify-between px-10 mt-3 text-gray-500 text-xs font-bold uppercase tracking-widest font-archivo">
          <span>Hours</span>
          <span>Minutes</span>
        </div>
        
        <button 
          className="mt-8 w-full bg-brand-orange hover:bg-[#c95d31] text-white py-3.5 rounded-xl font-black text-sm tracking-widest transition-all shadow-lg shadow-orange-900/20 uppercase active:scale-[0.98]"
          onClick={() => onSave(h, m)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

export default memo(function DurationPicker({ value, onChange }) {
  const { isLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const hours = Math.floor((value || 0) / 60);
  const mins = (value || 0) % 60;

  return (
    <>
      <div 
        className={`tiny-input w-[65px] h-6 text-[10px] flex items-center justify-center cursor-pointer hover:border-brand-orange transition-colors select-none ${
          isLight ? 'bg-[#8f8f8f] border border-[#949494] text-[#111]' : ''
        }`}
        onClick={() => setIsOpen(true)}
      >
        {hours.toString().padStart(2, '0')}:{mins.toString().padStart(2, '0')}
      </div>
      {isOpen && (
        <DurationModal 
          initialHours={hours} 
          initialMins={mins} 
          onSave={(h, m) => { onChange(h * 60 + m); setIsOpen(false); }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
});
