/**
 * ROUT PLANNER — Formatting Utilities
 */

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration in minutes for display
 */
export function formatDuration(minutes) {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Generate unique ID
 */
export function generateId() {
  return `loc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format coordinates for display
 */
export function formatCoords(lat, lng) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Build Google Maps navigation URL for a route
 */
export function buildNavigationUrl(locations, startLocation) {
  if (locations.length === 0) return null;
  
  const origin = startLocation ? 
    `${startLocation.lat},${startLocation.lng}` : 
    `${locations[0].lat},${locations[0].lng}`;
  
  const destination = `${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}`;
  
  const waypoints = locations.slice(0, -1)
    .map(l => `${l.lat},${l.lng}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }
  url += '&travelmode=driving';

  return url;
}

/**
 * Build Waze navigation URL
 */
export function buildWazeUrl(lat, lng) {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}
