/**
 * Visits API Client
 * Handles all API calls for Visit Scheduling
 */

const API_BASE = '/api/visits';

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
 * Fetch all visits
 * @param {Object} options - Query options
 * @param {string} options.date - Filter by date (YYYY-MM-DD)
 * @param {string} options.userId - Filter by user ID
 * @param {string} options.placeId - Filter by place ID
 * @param {string} options.status - Filter by status
 * @returns {Promise<{visits: Array, count: number}>}
 */
export async function fetchVisits(options = {}) {
  const params = new URLSearchParams();
  if (options.date) {
    params.set('date', options.date);
  }
  if (options.userId) {
    params.set('userId', options.userId);
  }
  if (options.placeId) {
    params.set('placeId', options.placeId);
  }
  if (options.status) {
    params.set('status', options.status);
  }
  
  const query = params.toString();
  const url = `${API_BASE}${query ? `?${query}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch visits');
  }
  
  return response.json();
}

/**
 * Fetch single visit by ID
 * @param {string} id - Visit ID
 * @returns {Promise<{visit: Object}>}
 */
export async function fetchVisit(id) {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch visit');
  }
  return response.json();
}

/**
 * Fetch upcoming visits
 * @param {number} limit - Maximum number of visits to return
 * @returns {Promise<{visits: Array, count: number}>}
 */
export async function fetchUpcomingVisits(limit = 10) {
  const response = await fetch(`${API_BASE}/upcoming?limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch upcoming visits');
  }
  return response.json();
}

/**
 * Fetch visit history for a place
 * @param {string} placeId - Place ID
 * @returns {Promise<{visits: Array, count: number}>}
 */
export async function fetchVisitHistory(placeId) {
  const response = await fetch(`${API_BASE}/history/${placeId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch visit history');
  }
  return response.json();
}

/**
 * Create a new visit
 * @param {Object} visitData - Visit data
 * @returns {Promise<{message: string, visit: Object}>}
 */
export async function createVisit(visitData) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(visitData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create visit');
  }
  
  return response.json();
}

/**
 * Update a visit
 * @param {string} id - Visit ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{message: string, visit: Object}>}
 */
export async function updateVisit(id, updates) {
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
    throw new Error(error.message || 'Failed to update visit');
  }
  
  return response.json();
}

/**
 * Delete a visit
 * @param {string} id - Visit ID
 * @returns {Promise<{message: string}>}
 */
export async function deleteVisit(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete visit');
  }
  
  return response.json();
}

/**
 * Mark visit as completed
 * @param {string} id - Visit ID
 * @returns {Promise<{message: string, visit: Object}>}
 */
export async function completeVisit(id) {
  const response = await fetch(`${API_BASE}/${id}/complete`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders()
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to complete visit');
  }
  
  return response.json();
}

/**
 * Mark visit as skipped
 * @param {string} id - Visit ID
 * @param {string} reason - Reason for skipping
 * @returns {Promise<{message: string, visit: Object}>}
 */
export async function skipVisit(id, reason = '') {
  const response = await fetch(`${API_BASE}/${id}/skip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to skip visit');
  }
  
  return response.json();
}

/**
 * Schedule a visit from a place
 * @param {Object} place - Place object
 * @param {string} date - Scheduled date (YYYY-MM-DD)
 * @param {string} time - Scheduled time (HH:mm)
 * @param {string} notes - Optional notes
 * @returns {Promise<{message: string, visit: Object}>}
 */
export async function scheduleVisitFromPlace(place, date, time = '09:00', notes = '') {
  return createVisit({
    placeId: place.id,
    placeName: place.name,
    placeAddress: place.address,
    mapUrl: place.mapUrl,
    scheduledDate: date,
    scheduledTime: time,
    notes
  });
}

/**
 * Get today's visits
 * @returns {Promise<{visits: Array, count: number}>}
 */
export async function fetchTodayVisits() {
  const today = new Date().toISOString().split('T')[0];
  return fetchVisits({ date: today });
}

/**
 * Get visits for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<{visits: Array, count: number}>}
 */
export async function fetchVisitsByDate(date) {
  return fetchVisits({ date });
}

export default {
  fetchVisits,
  fetchVisit,
  fetchUpcomingVisits,
  fetchVisitHistory,
  createVisit,
  updateVisit,
  deleteVisit,
  completeVisit,
  skipVisit,
  scheduleVisitFromPlace,
  fetchTodayVisits,
  fetchVisitsByDate
};