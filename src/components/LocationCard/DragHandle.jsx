import { memo } from 'react';

function DragHandle() {
  return (
    <div className="drag-handle flex flex-col gap-1 py-3 cursor-grab w-5 items-center shrink-0 opacity-60 hover:opacity-100 transition-opacity">
      <div className="w-4 h-0.5 rounded-full bg-[#292929]"></div>
      <div className="w-4 h-0.5 rounded-full bg-[#292929]"></div>
      <div className="w-4 h-0.5 rounded-full bg-[#292929]"></div>
      <div className="w-4 h-0.5 rounded-full bg-[#292929]"></div>
    </div>
  );
}

export default memo(DragHandle);