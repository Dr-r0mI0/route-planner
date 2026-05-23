/**
 * VisitForm Component
 * Modal form for creating/editing visits
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';
import { fetchPlaces } from '../../utils/placesApi';

export default function VisitForm({ visit, defaultDate, onSubmit, onClose }) {
  const { isLight } = useTheme();
  const { t } = useI18n();
  
  const [formData, setFormData] = useState({
    placeName: '',
    placeAddress: '',
    mapUrl: '',
    scheduledDate: defaultDate || new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    notes: ''
  });
  
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showPlaceSelect, setShowPlaceSelect] = useState(false);
  
  useEffect(() => {
    if (visit) {
      setFormData({
        placeName: visit.placeName || '',
        placeAddress: visit.placeAddress || '',
        mapUrl: visit.mapUrl || '',
        scheduledDate: visit.scheduledDate || defaultDate || new Date().toISOString().split('T')[0],
        scheduledTime: visit.scheduledTime || '09:00',
        notes: visit.notes || ''
      });
    }
  }, [visit, defaultDate]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const loadPlaces = async () => {
    try {
      setLoadingPlaces(true);
      const data = await fetchPlaces();
      setPlaces(data.places || []);
      setShowPlaceSelect(true);
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setLoadingPlaces(false);
    }
  };
  
  const handleSelectPlace = (place) => {
    setFormData(prev => ({
      ...prev,
      placeName: place.name || prev.placeName,
      placeAddress: place.address || prev.placeAddress,
      mapUrl: place.mapUrl || prev.mapUrl
    }));
    setShowPlaceSelect(false);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.placeName.trim()) {
      alert('Place name is required');
      return;
    }
    if (!formData.scheduledDate) {
      alert('Scheduled date is required');
      return;
    }
    onSubmit(formData);
  };
  
  const inputClasses = `
    w-full h-11 px-4 rounded-xl border shadow-lg font-archivo text-sm tracking-wider 
    outline-none transition-colors focus-visible:border-brand-orange/50
    ${isLight
      ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929] placeholder:text-gray-400'
      : 'bg-brand-bg border-brand-border text-brand-text placeholder:text-gray-500'
    }
  `;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
        isLight
          ? 'bg-[rgba(255,255,255,0.95)] border-[rgba(255,255,255,0.125)]'
          : 'bg-[rgba(0,0,0,0.95)] border-brand-border'
      }`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.125)] bg-inherit">
          <h2 className="font-archivo text-lg font-black tracking-wider text-brand-text uppercase">
            {visit ? t('editVisit', 'Edit Visit') : t('scheduleVisit', 'Schedule Visit')}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-brand-text/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Place Selection */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('place', 'Place')} *
            </label>
            
            {showPlaceSelect ? (
              <div className={`rounded-xl border overflow-hidden ${
                isLight
                  ? 'border-[rgba(255,255,255,0.125)] bg-white/20'
                  : 'border-brand-border bg-brand-bg'
              }`}>
                <div className="max-h-48 overflow-y-auto">
                  {loadingPlaces ? (
                    <div className="p-4 text-center">
                      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : places.length === 0 ? (
                    <div className="p-4 text-center text-brand-text/50 font-archivo text-sm">
                      {t('noPlaces', 'No places found')}
                    </div>
                  ) : (
                    places.map(place => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => handleSelectPlace(place)}
                        className={`w-full p-3 text-left border-b border-[rgba(255,255,255,0.125)] last:border-b-0 hover:bg-white/10 transition-colors ${
                          place.name === formData.placeName ? 'bg-brand-orange/20' : ''
                        }`}
                      >
                        <div className="font-archivo text-sm text-brand-text font-medium">
                          {place.name}
                        </div>
                        {place.address && (
                          <div className="font-archivo text-xs text-brand-text/50 mt-0.5 line-clamp-1">
                            {place.address}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlaceSelect(false)}
                  className="w-full p-2 border-t border-[rgba(255,255,255,0.125)] font-archivo text-xs text-brand-text/60 hover:text-brand-orange transition-colors"
                >
                  {t('enterManually', 'Enter manually')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.placeName}
                  onChange={(e) => handleChange('placeName', e.target.value)}
                  className={inputClasses}
                  placeholder="Enter place name"
                  required
                />
                <button
                  type="button"
                  onClick={loadPlaces}
                  className="h-11 px-4 rounded-xl bg-brand-orange/20 text-brand-orange border border-brand-orange/30 font-archivo text-sm font-bold tracking-wider hover:bg-brand-orange/30 transition-colors"
                >
                  {t('selectPlace', 'Select')}
                </button>
              </div>
            )}
          </div>
          
          {/* Address */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('address', 'Address')}
            </label>
            <input
              type="text"
              value={formData.placeAddress}
              onChange={(e) => handleChange('placeAddress', e.target.value)}
              className={inputClasses}
              placeholder="Enter address"
            />
          </div>
          
          {/* Map URL */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('mapUrl', 'Map URL')}
            </label>
            <input
              type="url"
              value={formData.mapUrl}
              onChange={(e) => handleChange('mapUrl', e.target.value)}
              className={inputClasses}
              placeholder="https://maps.google.com/..."
            />
          </div>
          
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
                {t('date', 'Date')} *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className={inputClasses}
                required
              />
            </div>
            <div>
              <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
                {t('time', 'Time')}
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleChange('scheduledTime', e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('notes', 'Notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border shadow-lg font-archivo text-sm tracking-wider 
                outline-none transition-colors focus-visible:border-brand-orange/50 resize-none
                ${isLight
                  ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929] placeholder:text-gray-400'
                  : 'bg-brand-bg border-brand-border text-brand-text placeholder:text-gray-500'
                }
              `}
              placeholder={t('visitNotes', 'Add notes about this visit')}
            />
          </div>
          
          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase border transition-colors ${
                isLight
                  ? 'bg-white/30 border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                  : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
              }`}
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 transition-all"
            >
              {visit ? t('update', 'Update') : t('schedule', 'Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}