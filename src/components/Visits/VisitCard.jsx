/**
 * VisitCard Component
 * Card displaying visit information with status management
 */

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';

export default function VisitCard({ visit, onEdit, onDelete, onComplete, onSkip }) {
  const { isLight } = useTheme();
  const { t } = useI18n();
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  
  const cardClasses = `
    rounded-2xl p-4 border shadow-md transition-all duration-300
    backdrop-blur-[4px] backdrop-saturate-[1.31]
    ${isLight ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' : 'bg-[rgba(0,0,0,0.55)] border-brand-border'}
  `;
  
  // Status badge colors
  const getStatusBadgeClass = (status) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      skipped: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    };
    return colors[status] || colors.scheduled;
  };
  
  // Status icons
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };
  
  const handleSkipConfirm = () => {
    if (onSkip) {
      onSkip(skipReason);
    }
    setShowSkipReason(false);
    setSkipReason('');
  };
  
  return (
    <div className={cardClasses}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
          visit.status === 'completed'
            ? 'bg-green-500/20 border-green-500/30'
            : visit.status === 'skipped'
              ? 'bg-amber-500/20 border-amber-500/30'
              : 'bg-blue-500/20 border-blue-500/30'
        }`}>
          {getStatusIcon(visit.status)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-archivo font-bold tracking-wider uppercase border ${getStatusBadgeClass(visit.status)}`}>
              {visit.status || 'SCHEDULED'}
            </span>
            {visit.scheduledTime && (
              <span className="font-archivo text-[10px] text-brand-text/50 tracking-wider">
                {visit.scheduledTime}
              </span>
            )}
          </div>
          <h3 className="font-archivo text-brand-text font-bold text-base tracking-wide truncate">
            {visit.placeName}
          </h3>
          {visit.placeAddress && (
            <p className="font-archivo text-brand-text/60 text-xs tracking-wide mt-0.5 line-clamp-2">
              {visit.placeAddress}
            </p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      {visit.status === 'scheduled' && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {visit.mapUrl && (
            <a
              href={visit.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-orange/20 text-brand-orange border border-brand-orange/30 hover:bg-brand-orange/30 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-archivo text-[10px] font-bold tracking-wider uppercase">MAP</span>
            </a>
          )}
          
          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-archivo text-[10px] font-bold tracking-wider uppercase">DONE</span>
          </button>
          
          <button
            onClick={() => setShowSkipReason(!showSkipReason)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            <span className="font-archivo text-[10px] font-bold tracking-wider uppercase">SKIP</span>
          </button>
        </div>
      )}
      
      {/* Skip Reason Form */}
      {showSkipReason && (
        <div className="mt-4 p-3 rounded-xl bg-brand-bg/50 border border-brand-border">
          <input
            type="text"
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            placeholder={t('skipReason', 'Reason for skipping (optional)')}
            className="w-full h-9 px-3 rounded-lg bg-brand-bg border border-brand-border text-brand-text font-archivo text-sm placeholder:text-brand-text/40 outline-none focus:border-brand-orange/50"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSkipConfirm}
              className="flex-1 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-archivo text-xs font-bold tracking-wider uppercase hover:bg-amber-500/30 transition-colors"
            >
              {t('confirm', 'CONFIRM')}
            </button>
            <button
              onClick={() => {
                setShowSkipReason(false);
                setSkipReason('');
              }}
              className={`px-3 py-1.5 rounded-lg border font-archivo text-xs font-bold tracking-wider uppercase transition-colors ${
                isLight
                  ? 'bg-white/30 border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                  : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
              }`}
            >
              {t('cancel', 'CANCEL')}
            </button>
          </div>
        </div>
      )}
      
      {/* Notes */}
      {visit.notes && (
        <div className="mt-4 p-3 rounded-xl bg-brand-bg/30">
          <p className="font-archivo text-brand-text/70 text-xs leading-relaxed">
            {visit.notes}
          </p>
        </div>
      )}
      
      {/* Completion Info */}
      {visit.completedAt && (
        <div className="mt-3 flex items-center gap-2 text-[10px] font-archivo text-green-400/60 tracking-wider">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{t('completedAt', 'Completed')}: {new Date(visit.completedAt).toLocaleString()}</span>
        </div>
      )}
      
      {/* Actions (expanded) */}
      <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.125)] flex gap-2">
        {visit.status === 'scheduled' && (
          <button
            onClick={onEdit}
            className={`flex-1 px-3 py-2 rounded-lg font-archivo text-xs font-bold tracking-wider uppercase border transition-colors ${
              isLight
                ? 'bg-white/30 border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
            }`}
          >
            {t('edit', 'Edit')}
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-lg font-archivo text-xs font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
        >
          {t('delete', 'Delete')}
        </button>
      </div>
      
      {/* Meta */}
      <div className="mt-3 flex items-center justify-between text-[10px] font-archivo tracking-wider text-brand-text/30">
        <span>ID: {visit.id}</span>
        <span>{new Date(visit.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}