import { memo } from 'react';

function LocationCardActions({ onDelete }) {
  return (
    <div className="flex items-end">
      <button
        className="w-7 h-6 rounded flex items-center justify-center shadow active:scale-95 transition-transform bg-[#fb2c36]"
        aria-label="Delete Location"
        onClick={onDelete}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="white"></path>
        </svg>
      </button>
    </div>
  );
}

export default memo(LocationCardActions);