/**
 * Visits Page
 * Daily schedule view and visit management interface
 */

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../utils/i18n.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import VisitCard from '../components/Visits/VisitCard.jsx';
import VisitForm from '../components/Visits/VisitForm.jsx';
import { 
  fetchVisits, 
  createVisit, 
  updateVisit, 
  deleteVisit,
  completeVisit,
  skipVisit 
} from '../utils/visitsApi';

const STATUS_TABS = [
  { id: 'all', label: 'ALL' },
  { id: 'scheduled', label: 'SCHEDULED' },
  { id: 'completed', label: 'COMPLETED' },
  { id: 'skipped', label: 'SKIPPED' }
];

export default function VisitsPage() {
  const { t, isRTL } = useI18n();
  const { isLight } = useTheme();
  
  // State
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  
  // Load visits
  const loadVisits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryOptions = { date: selectedDate };
      if (selectedStatus !== 'all') {
        queryOptions.status = selectedStatus;
      }
      const data = await fetchVisits(queryOptions);
      setVisits(data.visits);
    } catch (err) {
      console.error('Failed to load visits:', err);
      setError(err.message || 'Failed to load visits');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedStatus]);
  
  useEffect(() => {
    loadVisits();
  }, [loadVisits]);
  
  // Handle date navigation
  const navigateDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };
  
  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };
  
  // Format date display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle form submit
  const handleSubmit = async (formData) => {
    try {
      setAutoSaveStatus('saving');
      if (editingVisit) {
        await updateVisit(editingVisit.id, formData);
      } else {
        await createVisit(formData);
      }
      setShowForm(false);
      setEditingVisit(null);
      setAutoSaveStatus('saved');
      loadVisits();
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (err) {
      console.error('Failed to save visit:', err);
      setAutoSaveStatus('error');
      alert(err.message || 'Failed to save visit');
    }
  };
  
  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this visit?')) return;
    try {
      await deleteVisit(id);
      loadVisits();
    } catch (err) {
      console.error('Failed to delete visit:', err);
      alert(err.message || 'Failed to delete visit');
    }
  };
  
  // Handle edit
  const handleEdit = (visit) => {
    setEditingVisit(visit);
    setShowForm(true);
  };
  
  // Handle complete
  const handleComplete = async (id) => {
    try {
      setAutoSaveStatus('saving');
      await completeVisit(id);
      setAutoSaveStatus('saved');
      loadVisits();
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (err) {
      console.error('Failed to complete visit:', err);
      setAutoSaveStatus('error');
      alert(err.message || 'Failed to complete visit');
    }
  };
  
  // Handle skip
  const handleSkip = async (id, reason) => {
    try {
      setAutoSaveStatus('saving');
      await skipVisit(id, reason);
      setAutoSaveStatus('saved');
      loadVisits();
      setTimeout(() => setAutoSaveStatus(''), 2000);
    } catch (err) {
      console.error('Failed to skip visit:', err);
      setAutoSaveStatus('error');
      alert(err.message || 'Failed to skip visit');
    }
  };
  
  // New visit form
  const handleNewVisit = () => {
    setEditingVisit(null);
    setShowForm(true);
  };
  
  // Auto-save indicator
  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-brand-text/60">
            <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
            <span className="font-archivo text-xs tracking-wider uppercase">Saving…</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-archivo text-xs tracking-wider uppercase">Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-archivo text-xs tracking-wider uppercase">Error</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="font-archivo text-2xl font-black tracking-wider text-brand-text uppercase">
          {t('visits', 'Visits')}
        </h1>
        <div className="flex items-center gap-4">
          {getAutoSaveIndicator()}
          <button
            onClick={handleNewVisit}
            className="px-4 py-2 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 transition-all"
          >
            {t('scheduleVisit', '+ Schedule Visit')}
          </button>
        </div>
      </div>
      
      {/* Date Navigation */}
      <div className={`flex items-center justify-between mb-6 p-4 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
        isLight
          ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]'
          : 'bg-brand-bg border-brand-border'
      }`}>
        <button
          onClick={() => navigateDate(-1)}
          className={`p-2 rounded-lg transition-colors ${
            isLight
              ? 'hover:bg-white/30 text-[#292929]'
              : 'hover:bg-white/10 text-brand-text'
          }`}
          title={t('previousDay', 'Previous Day')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center">
          <span className="font-archivo text-lg font-bold tracking-wider text-brand-text">
            {formatDate(selectedDate)}
          </span>
          {selectedDate !== new Date().toISOString().split('T')[0] && (
            <button
              onClick={goToToday}
              className="mt-1 px-3 py-1 rounded-full font-archivo text-xs font-bold tracking-wider uppercase bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/30 transition-colors"
            >
              {t('today', 'Today')}
            </button>
          )}
        </div>
        
        <button
          onClick={() => navigateDate(1)}
          className={`p-2 rounded-lg transition-colors ${
            isLight
              ? 'hover:bg-white/30 text-[#292929]'
              : 'hover:bg-white/10 text-brand-text'
          }`}
          title={t('nextDay', 'Next Day')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Status Tabs */}
      <div className={`flex gap-2 mb-6 p-2 rounded-xl border backdrop-blur-[4px] backdrop-saturate-[1.31] overflow-x-auto ${
        isLight
          ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]'
          : 'bg-brand-bg border-brand-border'
      }`}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`px-4 py-2 rounded-lg font-archivo text-sm font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
              selectedStatus === tab.id
                ? 'bg-brand-orange text-white'
                : isLight
                  ? 'text-[#292929] hover:bg-white/30'
                  : 'text-brand-text hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
      
      {/* Visits List */}
      {!loading && (
        <>
          {visits.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
              isLight
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]'
                : 'bg-brand-bg border-brand-border'
            }`}>
              <p className="font-archivo text-brand-text/60 text-sm tracking-wider uppercase">
                {t('noVisits', 'No visits scheduled')}
              </p>
              <p className="font-archivo text-brand-text/40 text-xs mt-2">
                {t('scheduleFirstVisit', 'Schedule your first visit for this day')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map(visit => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onEdit={() => handleEdit(visit)}
                  onDelete={() => handleDelete(visit.id)}
                  onComplete={() => handleComplete(visit.id)}
                  onSkip={(reason) => handleSkip(visit.id, reason)}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Visit Form Modal */}
      {showForm && (
        <VisitForm
          visit={editingVisit}
          defaultDate={selectedDate}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingVisit(null);
          }}
        />
      )}
    </div>
  );
}