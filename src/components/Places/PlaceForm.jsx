/**
 * PlaceForm Component
 * Modal form for creating/editing places
 */

import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useI18n } from '../../utils/i18n.jsx';

const CATEGORIES = ['restaurant', 'cafe', 'hotel', 'shop', 'office', 'other'];

export default function PlaceForm({ place, onSubmit, onClose }) {
  const { isLight } = useTheme();
  const { t } = useI18n();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mapUrl: '',
    category: 'other',
    contacts: [],
    lastVisit: ''
  });
  
  const [newContact, setNewContact] = useState({ name: '', phone: '', role: '' });
  
  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        address: place.address || '',
        mapUrl: place.mapUrl || '',
        category: place.category || 'other',
        contacts: place.contacts || [],
        lastVisit: place.lastVisit ? place.lastVisit.split('T')[0] : ''
      });
    }
  }, [place]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddContact = () => {
    if (!newContact.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { ...newContact }]
    }));
    setNewContact({ name: '', phone: '', role: '' });
  };
  
  const handleRemoveContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Name is required');
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
            {place ? t('editPlace', 'Edit Place') : t('addPlace', 'Add Place')}
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
          {/* Name */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('name', 'Name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClasses}
              placeholder="Enter place name"
              required
            />
          </div>
          
          {/* Address */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('address', 'Address')}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
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
          
          {/* Category */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('category', 'Category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={inputClasses}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Last Visit */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('lastVisit', 'Last Visit')}
            </label>
            <input
              type="date"
              value={formData.lastVisit}
              onChange={(e) => handleChange('lastVisit', e.target.value)}
              className={inputClasses}
            />
          </div>
          
          {/* Contacts */}
          <div>
            <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
              {t('contacts', 'Contacts')}
            </label>
            
            {/* Existing Contacts */}
            {formData.contacts.length > 0 && (
              <div className="space-y-2 mb-3">
                {formData.contacts.map((contact, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-2 rounded-lg ${
                    isLight ? 'bg-white/30' : 'bg-brand-bg'
                  }`}>
                    <div className="flex-1">
                      <span className="font-archivo text-sm text-brand-text">{contact.name}</span>
                      {contact.role && (
                        <span className="font-archivo text-xs text-brand-text/40 ml-2">({contact.role})</span>
                      )}
                      {contact.phone && (
                        <span className="font-archivo text-xs text-brand-orange ml-2">{contact.phone}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add Contact Form */}
            <div className={`flex flex-wrap gap-2 p-3 rounded-xl border ${
              isLight
                ? 'border-[rgba(255,255,255,0.125)] bg-white/20'
                : 'border-brand-border bg-brand-bg'
            }`}>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact(p => ({ ...p, name: e.target.value }))}
                className="flex-1 min-w-[100px] h-9 px-3 rounded-lg border font-archivo text-xs tracking-wider bg-transparent outline-none focus:border-brand-orange/50"
                placeholder="Name"
              />
              <input
                type="tel"
                value={newContact.phone}
                onChange={(e) => setNewContact(p => ({ ...p, phone: e.target.value }))}
                className="w-28 h-9 px-3 rounded-lg border font-archivo text-xs tracking-wider bg-transparent outline-none focus:border-brand-orange/50"
                placeholder="Phone"
              />
              <input
                type="text"
                value={newContact.role}
                onChange={(e) => setNewContact(p => ({ ...p, role: e.target.value }))}
                className="w-24 h-9 px-3 rounded-lg border font-archivo text-xs tracking-wider bg-transparent outline-none focus:border-brand-orange/50"
                placeholder="Role"
              />
              <button
                type="button"
                onClick={handleAddContact}
                className="h-9 px-3 rounded-lg bg-brand-orange text-white font-archivo text-xs font-bold tracking-wider hover:brightness-110"
              >
                +
              </button>
            </div>
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
              {place ? t('update', 'Update') : t('create', 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}