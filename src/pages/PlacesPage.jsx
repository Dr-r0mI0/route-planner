/**
 * Places Page
 * Main places management interface with CRUD, search, filter, and import features
 */

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../utils/i18n';
import { useTheme } from '../../context/ThemeContext';
import PlaceCard from './PlaceCard';
import PlaceForm from './PlaceForm';
import PlaceImportModal from './PlaceImportModal';
import { fetchPlaces, createPlace, updatePlace, deletePlace } from '../../utils/placesApi';

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'restaurant', label: 'RESTAURANT' },
  { id: 'cafe', label: 'CAFE' },
  { id: 'hotel', label: 'HOTEL' },
  { id: 'shop', label: 'SHOP' },
  { id: 'office', label: 'OFFICE' },
  { id: 'other', label: 'OTHER' }
];

export default function PlacesPage() {
  const { t, isRTL } = useI18n();
  const { isLight } = useTheme();
  
  // State
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  // Load places
  const loadPlaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlaces({
        category: selectedCategory,
        search: searchQuery
      });
      setPlaces(data.places);
    } catch (err) {
      console.error('Failed to load places:', err);
      setError(err.message || 'Failed to load places');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);
  
  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);
  
  // Handle form submit
  const handleSubmit = async (formData) => {
    try {
      if (editingPlace) {
        await updatePlace(editingPlace.id, formData);
      } else {
        await createPlace(formData);
      }
      setShowForm(false);
      setEditingPlace(null);
      loadPlaces();
    } catch (err) {
      console.error('Failed to save place:', err);
      alert(err.message || 'Failed to save place');
    }
  };
  
  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this place?')) return;
    try {
      await deletePlace(id);
      loadPlaces();
    } catch (err) {
      console.error('Failed to delete place:', err);
      alert(err.message || 'Failed to delete place');
    }
  };
  
  // Handle edit
  const handleEdit = (place) => {
    setEditingPlace(place);
    setShowForm(true);
  };
  
  // Handle expand
  const handleToggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };
  
  // New place form
  const handleNewPlace = () => {
    setEditingPlace(null);
    setShowForm(true);
  };
  
  // Import complete
  const handleImportComplete = () => {
    setShowImport(false);
    loadPlaces();
  };
  
  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-archivo text-2xl font-black tracking-wider text-brand-text uppercase">
          {t('places', 'Places')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className={`px-4 py-2 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase border transition-colors ${
              isLight
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-[rgba(255,255,255,0.5)]'
                : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
            }`}
          >
            {t('import', 'Import')}
          </button>
          <button
            onClick={handleNewPlace}
            className="px-4 py-2 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 transition-all"
          >
            {t('addPlace', '+ Add Place')}
          </button>
        </div>
      </div>
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`${t('search', 'SEARCH')}…`}
            className={`w-full h-11 px-4 rounded-xl border shadow-lg font-archivo text-sm tracking-wider uppercase placeholder-gray-500 outline-none transition-colors focus-visible:border-brand-orange/50 ${
              isLight
                ? 'bg-[rgba(255,255,255,0.39)] backdrop-blur-[4px] border-[rgba(255,255,255,0.125)] text-[#292929]'
                : 'bg-brand-bg border-brand-border text-brand-text'
            }`}
          />
        </div>
        
        {/* Category Filter */}
        <div className={`flex gap-2 overflow-x-auto pb-2 md:pb-0 px-1 rounded-xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
          isLight
            ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]'
            : 'bg-brand-bg border-brand-border'
        }`}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-2 rounded-lg font-archivo text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-brand-orange text-white'
                  : isLight
                    ? 'text-[#292929] hover:bg-white/30'
                    : 'text-brand-text hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-archivo text-sm">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Places Grid */}
      {!loading && (
        <>
          {places.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
              isLight
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]'
                : 'bg-brand-bg border-brand-border'
            }`}>
              <p className="font-archivo text-brand-text/60 text-sm tracking-wider uppercase">
                {t('noPlaces', 'No places found')}
              </p>
              <p className="font-archivo text-brand-text/40 text-xs mt-2">
                {t('addFirstPlace', 'Add your first place to get started')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isExpanded={expandedId === place.id}
                  onToggle={() => handleToggleExpand(place.id)}
                  onEdit={() => handleEdit(place)}
                  onDelete={() => handleDelete(place.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Place Form Modal */}
      {showForm && (
        <PlaceForm
          place={editingPlace}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingPlace(null);
          }}
        />
      )}
      
      {/* Import Modal */}
      {showImport && (
        <PlaceImportModal
          onComplete={handleImportComplete}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}