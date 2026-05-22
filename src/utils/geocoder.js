/**
 * ROUT PLANNER — Reverse Geocoder
 * Uses Google Maps Geocoding API to get place names from coordinates.
 */

const GOOGLE_GEOCODE_BASE = 'https://maps.googleapis.com/maps/api/geocode/json';

// Cache for geocoding results
const geocodeCache = new Map();

/**
 * Reverse geocode coordinates using Google Maps Geocoding API
 * @param {number} lat
 * @param {number} lng
 * @param {string} apiKey - Google Maps API key
 * @returns {Promise<{name, road, suburb, city, fullAddress}>}
 */
export async function reverseGeocode(lat, lng, apiKey) {
  const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
  
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    const url = `${GOOGLE_GEOCODE_BASE}?latlng=${lat},${lng}&key=${apiKey}&language=ar&result_type=street_address|point_of_interest|establishment|premise`;
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Geocoding API error: ${resp.status}`);
    
    const data = await resp.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      // Fallback: try without result_type filter
      const fallbackUrl = `${GOOGLE_GEOCODE_BASE}?latlng=${lat},${lng}&key=${apiKey}&language=ar`;
      const fallbackResp = await fetch(fallbackUrl);
      const fallbackData = await fallbackResp.json();
      
      if (fallbackData.status !== 'OK' || !fallbackData.results?.length) {
        const fallbackResult = {
          name: null,
          road: null,
          suburb: null,
          city: null,
          fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          displayName: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        };
        geocodeCache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }
      
      return parseGoogleResult(fallbackData.results, lat, lng, cacheKey);
    }

    return parseGoogleResult(data.results, lat, lng, cacheKey);

  } catch (err) {
    console.warn('Geocoding failed:', err.message);
    const errorResult = {
      name: null,
      road: null,
      suburb: null,
      city: null,
      fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      displayName: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    };
    geocodeCache.set(cacheKey, errorResult);
    return errorResult;
  }
}

function parseGoogleResult(results, lat, lng, cacheKey) {
  // Find the most specific result (point_of_interest > street_address > route)
  const poiResult = results.find(r => 
    r.types?.includes('point_of_interest') || 
    r.types?.includes('establishment')
  );
  const streetResult = results.find(r => r.types?.includes('street_address'));
  const bestResult = poiResult || streetResult || results[0];

  const components = bestResult.address_components || [];
  
  const getComponent = (...types) => {
    for (const type of types) {
      const comp = components.find(c => c.types.includes(type));
      if (comp) return comp.long_name;
    }
    return null;
  };

  const name = poiResult ? 
    (poiResult.name || getComponent('point_of_interest', 'establishment') || bestResult.formatted_address?.split(',')[0]) :
    getComponent('premise', 'point_of_interest', 'establishment');
    
  const road = getComponent('route', 'street_address');
  const suburb = getComponent('neighborhood', 'sublocality_level_1', 'sublocality', 'administrative_area_level_3');
  const city = getComponent('locality', 'administrative_area_level_2', 'administrative_area_level_1');

  // Build display name
  const parts = [name, road, suburb, city].filter(Boolean);
  const displayName = parts.length > 0 ? parts.join(' - ') : bestResult.formatted_address || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  const result = {
    name: name || bestResult.formatted_address?.split(',')[0] || null,
    road,
    suburb,
    city,
    fullAddress: bestResult.formatted_address || '',
    displayName,
  };

  geocodeCache.set(cacheKey, result);
  return result;
}

/**
 * Batch reverse geocode with progress callback
 */
export async function batchReverseGeocode(locations, apiKey, onProgress) {
  const results = [];
  
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    
    if (loc.lat && loc.lng) {
      const geoResult = await reverseGeocode(loc.lat, loc.lng, apiKey);
      results.push({ ...loc, ...geoResult });
    } else {
      results.push({ ...loc, displayName: 'Unknown Location', error: loc.error });
    }
    
    if (onProgress) {
      onProgress(i + 1, locations.length);
    }
    
    // Small delay to avoid rate limits
    if (i < locations.length - 1) {
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  return results;
}

export function clearGeocodeCache() {
  geocodeCache.clear();
}
