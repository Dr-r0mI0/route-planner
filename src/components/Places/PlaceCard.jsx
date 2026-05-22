/**
 * PlaceCard Component
 * Expandable card displaying place information
 */

import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../utils/i18n';

export default function PlaceCard({ place, isExpanded, onToggle, onEdit, onDelete }) {
  const { isLight } = useTheme();
  const { t } = useI18n();
  
  const cardClasses = `
    rounded-2xl p-4 border shadow-md transition-all duration-300
    backdrop-blur-[4px] backdrop-saturate-[1.31] border-[rgba(255,255,255,0.125)]
    ${isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'}
  `;
  
  // Category badge colors
  const getCategoryBadgeClass = (category) => {
    const colors = {
      restaurant: 'bg-green-500/20 text-green-400 border-green-500/30',
      cafe: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      hotel: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shop: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      office: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      other: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    };
    return colors[category] || colors.other;
  };
  
  return (
    <div className={cardClasses}>
      {/* Header (always visible) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-archivo font-bold tracking-wider uppercase border ${getCategoryBadgeClass(place.category)}`}>
              {place.category || 'OTHER'}
            </span>
          </div>
          <h3 className="font-archivo text-brand-text font-bold text-base tracking-wide truncate">
            {place.name}
          </h3>
          {place.address && (
            <p className="font-archivo text-brand-text/60 text-xs tracking-wide mt-0.5 line-clamp-2">
              {place.address}
            </p>
          )}
        </div>
        
        {/* Expand/Collapse Button */}
        <button
          onClick={onToggle}
          className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
            isLight
              ? 'bg-white/30 border-[rgba(255,255,255,0.125)] text-brand-text/60'
              : 'bg-brand-bg border-brand-border text-brand-text/60'
          } hover:text-brand-orange`}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Quick Actions (always visible) */}
      {place.mapUrl && (
        <div className="mt-3 flex items-center gap-2">
          <a
            href={place.mapUrl}
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
          
          {place.lastVisit && (
            <span className="font-archivo text-[10px] text-brand-text/40 tracking-wider">
              Last: {new Date(place.lastVisit).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.125)]">
          {/* Contacts */}
          {place.contacts && place.contacts.length > 0 && (
            <div className="mb-4">
              <h4 className="font-archivo text-[10px] font-bold tracking-wider uppercase text-brand-text/50 mb-2">
                {t('contacts', 'CONTACTS')}
              </h4>
              <div className="space-y-1">
                {place.contacts.map((contact, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="font-archivo text-brand-text/80">{contact.name}</span>
                    {contact.role && (
                      <span className="font-archivo text-brand-text/40 text-xs">({contact.role})</span>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="font-archivo text-brand-orange text-xs hover:underline">
                        {contact.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
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
            <button
              onClick={onDelete}
              className="px-3 py-2 rounded-lg font-archivo text-xs font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              {t('delete', 'Delete')}
            </button>
          </div>
          
          {/* Meta */}
          <div className="mt-3 flex items-center justify-between text-[10px] font-archivo tracking-wider text-brand-text/30">
            <span>ID: {place.id}</span>
            <span>{new Date(place.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}