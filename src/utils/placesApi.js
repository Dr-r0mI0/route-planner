/**
 * Places API Client
 * Handles all API calls for Places management
 */

const API_BASE = '/api/places';

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Headers for authenticated requests
function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch all places
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {string} options.search - Search query
 * @returns {Promise<{places: Array, count: number}>}
 */
export async function fetchPlaces(options = {}) {
  const params = new URLSearchParams();
  if (options.category && options.category !== 'all') {
    params.set('category', options.category);
  }
  if (options.search) {
    params.set('search', options.search);
  }
  
  const query = params.toString();
  const url = `${API_BASE}${query ? `?${query}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch places');
  }
  
  return response.json();
}

/**
 * Fetch single place by ID
 * @param {string} id - Place ID
 * @returns {Promise<{place: Object}>}
 */
export async function fetchPlace(id) {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch place');
  }
  return response.json();
}

/**
 * Create a new place
 * @param {Object} placeData - Place data
 * @returns {Promise<{message: string, place: Object}>}
 */
export async function createPlace(placeData) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(placeData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create place');
  }
  
  return response.json();
}

/**
 * Update a place
 * @param {string} id - Place ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{message: string, place: Object}>}
 */
export async function updatePlace(id, updates) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update place');
  }
  
  return response.json();
}

/**
 * Delete a place
 * @param {string} id - Place ID
 * @returns {Promise<{message: string}>}
 */
export async function deletePlace(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete place');
  }
  
  return response.json();
}

/**
 * Import places from array (Excel/CSV parsed data)
 * @param {Array} places - Array of place objects
 * @returns {Promise<{message: string, places: Array, count: number}>}
 */
export async function importPlaces(places) {
  const response = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ places })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to import places');
  }
  
  return response.json();
}

/**
 * Parse CSV text to array of objects
 * @param {string} csvText - Raw CSV text
 * @returns {Array<Object>}
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    data.push(obj);
  }
  
  return data;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line) {
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
}

/**
 * Map Excel/CSV headers to Place fields
 * Common header variations to standardize
 */
export function mapExcelHeaders(row, fieldMappings = {}) {
  const standardFields = ['name', 'address', 'mapUrl', 'category'];
  const result = {};
  
  // If explicit mappings provided, use them
  if (Object.keys(fieldMappings).length > 0) {
    Object.entries(fieldMappings).forEach(([excelField, placeField]) => {
      if (row[excelField] !== undefined) {
        result[placeField] = row[excelField];
      }
    });
    return result;
  }
  
  // Auto-detect field mappings
  const fieldPatterns = {
    name: ['name', 'title', 'place', 'location', 'العنوان', 'المكان', 'الاسم'],
    address: ['address', 'addr', 'street', 'location_address', 'العنوان', 'العنوان الكامل'],
    mapUrl: ['mapurl', 'map_url', 'maps', 'google_maps', 'maps_url', 'رابط الخريطة', 'خريطة'],
    category: ['category', 'type', 'kind', 'genre', 'الفئة', 'النوع']
  };
  
  const rowKeys = Object.keys(row);
  
  standardFields.forEach(field => {
    const patterns = fieldPatterns[field] || [field];
    for (const pattern of patterns) {
      const matchedKey = rowKeys.find(k => 
        k.toLowerCase().replace(/[_\s-]/g, '') === pattern.toLowerCase().replace(/[_\s-]/g, '')
      );
      if (matchedKey) {
        result[field] = row[matchedKey];
        break;
      }
    }
  });
  
  return result;
}

export default {
  fetchPlaces,
  fetchPlace,
  createPlace,
  updatePlace,
  deletePlace,
  importPlaces,
  parseCSV,
  mapExcelHeaders
};