/**
 * PlaceImportModal Component
 * Smart import modal for Excel (.xlsx) and CSV files with field mapping
 */

import { useState, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../utils/i18n';
import { importPlaces, parseCSV, mapExcelHeaders } from '../../utils/placesApi';

const PLACE_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'address', label: 'Address', required: false },
  { key: 'mapUrl', label: 'Map URL', required: false },
  { key: 'category', label: 'Category', required: false }
];

export default function PlaceImportModal({ onComplete, onClose }) {
  const { isLight } = useTheme();
  const { t } = useI18n();
  
  const [step, setStep] = useState(1); // 1: upload, 2: mapping, 3: preview, 4: importing
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState(null);
  const [pasteText, setPasteText] = useState('');
  
  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseAndProcessText(text);
    };
    reader.readAsText(file);
  }, []);
  
  // Handle paste from clipboard
  const handlePaste = useCallback(() => {
    if (pasteText.trim()) {
      parseAndProcessText(pasteText);
    }
  }, [pasteText]);
  
  // Parse text data
  const parseAndProcessText = (text) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setError('File must have at least a header row and one data row');
        return;
      }
      
      // Parse headers from first line
      const headerLine = lines[0];
      const parsedHeaders = parseCSVLine(headerLine);
      setHeaders(parsedHeaders);
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        parsedHeaders.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        data.push(row);
      }
      
      setRawData(data);
      
      // Auto-detect mappings
      const autoMapping = {};
      PLACE_FIELDS.forEach(field => {
        const match = parsedHeaders.find(h => 
          h.toLowerCase().replace(/[_\s-]/g, '') === field.key.toLowerCase() ||
          field.label.toLowerCase() === h.toLowerCase()
        );
        if (match) {
          autoMapping[field.key] = match;
        }
      });
      setMapping(autoMapping);
      
      setStep(2);
      setError(null);
    } catch (err) {
      console.error('Parse error:', err);
      setError('Failed to parse file. Please check the format.');
    }
  };
  
  // Parse CSV line
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  // Handle mapping change
  const handleMappingChange = (placeField, csvField) => {
    setMapping(prev => ({
      ...prev,
      [placeField]: csvField
    }));
  };
  
  // Map data to places
  const getMappedPlaces = () => {
    return rawData.map(row => {
      const place = {};
      PLACE_FIELDS.forEach(field => {
        const csvField = mapping[field.key];
        if (csvField && row[csvField]) {
          place[field.key] = row[csvField];
        }
      });
      // Set default category if not mapped
      if (!place.category) {
        place.category = 'other';
      }
      return place;
    }).filter(p => p.name); // Filter out rows without name
  };
  
  // Start import
  const handleImport = async () => {
    const places = getMappedPlaces();
    
    if (places.length === 0) {
      setError('No valid places to import');
      return;
    }
    
    setStep(4);
    setError(null);
    
    try {
      const result = await importPlaces(places);
      setImportedCount(result.count);
      setStep(4);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err.message || 'Import failed');
      setStep(3);
    }
  };
  
  // Preview data for mapping step
  const mappedPlaces = step >= 3 ? getMappedPlaces() : [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
        isLight
          ? 'bg-[rgba(255,255,255,0.95)] border-[rgba(255,255,255,0.125)]'
          : 'bg-[rgba(0,0,0,0.95)] border-brand-border'
      }`}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.125)] bg-inherit">
          <h2 className="font-archivo text-lg font-black tracking-wider text-brand-text uppercase">
            {t('importPlaces', 'Import Places')}
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
        
        {/* Content */}
        <div className="p-4">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="font-archivo text-sm text-brand-text/60 text-center">
                Upload an Excel (.xlsx) or CSV file, or paste data directly from Excel
              </p>
              
              {/* File Upload */}
              <div className={`p-6 rounded-xl border-2 border-dashed text-center ${
                isLight
                  ? 'border-[rgba(255,255,255,0.125)] bg-white/20'
                  : 'border-brand-border bg-brand-bg'
              }`}>
                <input
                  type="file"
                  accept=".csv,.xlsx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <svg className="w-10 h-10 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="font-archivo text-sm font-bold tracking-wider text-brand-text">
                    {t('chooseFile', 'CHOOSE FILE')}
                  </span>
                  <span className="font-archivo text-xs text-brand-text/40">
                    CSV, XLSX, or TXT
                  </span>
                </label>
              </div>
              
              {/* Or divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.125)]"></div>
                <span className="font-archivo text-xs text-brand-text/40">OR</span>
                <div className="flex-1 h-px bg-[rgba(255,255,255,0.125)]"></div>
              </div>
              
              {/* Paste Area */}
              <div>
                <label className="block font-archivo text-xs font-bold tracking-wider uppercase text-brand-text/60 mb-1.5">
                  {t('pasteFromExcel', 'Paste from Excel')}
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={4}
                  className={`w-full p-3 rounded-xl border font-archivo text-xs tracking-wider outline-none focus:border-brand-orange/50 ${
                    isLight
                      ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                      : 'bg-brand-bg border-brand-border text-brand-text'
                  }`}
                  placeholder="Name,Address,Category&#10;Place 1,123 Main St,Restaurant&#10;Place 2,456 Oak Ave,Cafe"
                />
                <button
                  onClick={handlePaste}
                  disabled={!pasteText.trim()}
                  className="mt-2 w-full h-10 rounded-lg font-archivo text-xs font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('parseData', 'Parse Data')}
                </button>
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-archivo text-xs">
                  {error}
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Field Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="font-archivo text-sm text-brand-text/60 text-center">
                Map your file columns to place fields
              </p>
              
              <div className="space-y-3">
                {PLACE_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-28 shrink-0">
                      <span className="font-archivo text-xs font-bold tracking-wider text-brand-text">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </span>
                    </div>
                    <select
                      value={mapping[field.key] || ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className={`flex-1 h-9 px-3 rounded-lg border font-archivo text-xs tracking-wider outline-none ${
                        isLight
                          ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                          : 'bg-brand-bg border-brand-border text-brand-text'
                      }`}
                    >
                      <option value="">-- Skip --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              
              {/* Preview count */}
              <div className="text-center font-archivo text-sm text-brand-text/60">
                {rawData.length} rows detected
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase border transition-colors ${
                    isLight
                      ? 'bg-white/30 border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                      : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
                  }`}
                >
                  {t('back', 'Back')}
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 transition-all"
                >
                  {t('preview', 'Preview')}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="font-archivo text-sm text-brand-text/60 text-center">
                Preview {mappedPlaces.length} places to import
              </p>
              
              <div className={`max-h-64 overflow-y-auto rounded-xl border ${
                isLight
                  ? 'bg-white/20 border-[rgba(255,255,255,0.125)]'
                  : 'bg-brand-bg border-brand-border'
              }`}>
                {mappedPlaces.slice(0, 10).map((place, idx) => (
                  <div key={idx} className="p-3 border-b border-[rgba(255,255,255,0.05)] last:border-b-0">
                    <div className="font-archivo text-sm font-bold text-brand-text">{place.name}</div>
                    {place.address && (
                      <div className="font-archivo text-xs text-brand-text/60 mt-0.5">{place.address}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-archivo font-bold uppercase bg-brand-orange/20 text-brand-orange`}>
                        {place.category || 'other'}
                      </span>
                    </div>
                  </div>
                ))}
                {mappedPlaces.length > 10 && (
                  <div className="p-3 text-center font-archivo text-xs text-brand-text/40">
                    ...and {mappedPlaces.length - 10} more
                  </div>
                )}
              </div>
              
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 font-archivo text-xs">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className={`flex-1 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase border transition-colors ${
                    isLight
                      ? 'bg-white/30 border-[rgba(255,255,255,0.125)] text-brand-text hover:bg-white/50'
                      : 'bg-brand-bg border-brand-border text-brand-text hover:bg-brand-border'
                  }`}
                >
                  {t('back', 'Back')}
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 transition-all"
                >
                  {t('import', 'Import')} {mappedPlaces.length}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center py-8">
              {importedCount > 0 ? (
                <>
                  <svg className="w-16 h-16 mx-auto text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="font-archivo text-lg font-bold text-brand-text">
                    {t('importSuccess', 'Import Successful!')}
                  </p>
                  <p className="font-archivo text-sm text-brand-text/60 mt-2">
                    {importedCount} places imported
                  </p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 mx-auto text-brand-orange mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="font-archivo text-lg font-bold text-brand-text">
                    {t('importing', 'Importing...')}
                  </p>
                </>
              )}
              
              <button
                onClick={onComplete}
                className="mt-6 px-6 h-12 rounded-xl font-archivo text-sm font-bold tracking-wider uppercase bg-brand-orange text-white border border-orange-600/30 hover:brightness-110 transition-all"
              >
                {t('done', 'Done')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}