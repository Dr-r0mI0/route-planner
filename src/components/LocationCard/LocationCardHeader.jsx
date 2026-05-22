import { memo } from 'react';
import { useTheme } from '../../context/ThemeContext';

function LocationCardHeader({ primaryName, areaName, mapUrl, shortMapUrl }) {
  const { isLight } = useTheme();

  return (
    <>
      <h3 className={`font-bold text-sm tracking-wide mb-0.5 font-alexandria m-auto px-[10px] text-center ${isLight ? 'text-[#292929]' : 'text-[#eaeaea]'}`} dir="rtl">
        {primaryName}
      </h3>
      <p className={`font-archivo text-[11px] tracking-wider uppercase mb-1 text-left font-normal text-[#e16000]`}>
        {areaName || 'JEDDAH'}
      </p>

      <div className="flex items-center gap-1 opacity-60 mb-1 justify-start">
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="font-archivo text-brand-text text-[9px] tracking-wide uppercase truncate hover:text-blue-400 hover:underline">{shortMapUrl}</a>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.59 13.41C11.37 14.19 12.63 14.19 13.41 13.41L15.53 11.29C16.89 9.93 16.89 7.71 15.53 6.35C14.17 4.99 11.95 4.99 10.59 6.35L9.53 7.41"
            stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </div>
    </>
  );
}

export default memo(LocationCardHeader);