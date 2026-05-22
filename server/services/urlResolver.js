/**
 * URL Resolution Service
 * Handles URL resolution, redirect following, and HTML parsing
 */

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const TIMEOUT_MS = 10000;
const HTML_TIMEOUT_MS = 15000;

/**
 * Resolve a short URL to its full destination by following redirects
 */
export async function resolveUrl(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // Follow redirects manually to get the final URL
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });

    clearTimeout(timeoutId);
    const resolvedUrl = response.url;
    
    if (resolvedUrl && resolvedUrl !== url) {
      return { resolvedUrl, original: url };
    }

    // If HEAD didn't work, try GET with a new timeout
    return await resolveUrlWithGet(url);

  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fallback: try GET with HTML body parsing
 */
async function resolveUrlWithGet(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const getResponse = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });

    clearTimeout(timeoutId);
    
    if (getResponse.url && getResponse.url !== url) {
      return { resolvedUrl: getResponse.url, original: url };
    }

    // If still same URL, try to parse HTML body for redirect
    const html = await getResponse.text();
    const redirectUrl = extractRedirectFromHtml(html);
    if (redirectUrl) {
      return { resolvedUrl: redirectUrl, original: url };
    }

    return { resolvedUrl: getResponse.url, original: url };

  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Deep resolution: fetch full HTML page and extract coordinates
 */
export async function resolveUrlWithHtml(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), HTML_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    // Check if we got redirected
    if (response.url && response.url !== url) {
      const coords = extractCoordsFromUrl(response.url);
      if (coords) {
        return { resolvedUrl: response.url, coords, original: url };
      }
    }

    const html = await response.text();
    
    // Try to extract redirect URL from HTML
    const redirectUrl = extractRedirectFromHtml(html);
    if (redirectUrl) {
      const coords = extractCoordsFromUrl(redirectUrl);
      return { resolvedUrl: redirectUrl, coords, original: url };
    }

    // Try to extract coordinates directly from HTML
    const coords = extractCoordsFromHtml(html);
    if (coords) {
      return { resolvedUrl: response.url, coords, original: url };
    }

    return { resolvedUrl: response.url, original: url, error: 'No coordinates found' };

  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Extract redirect URL from HTML content (meta refresh, JS redirect, etc.)
 */
export function extractRedirectFromHtml(html) {
  if (!html) return null;
  
  // Meta refresh tag
  const metaMatch = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"'\s>]+)/i);
  if (metaMatch) return metaMatch[1];

  // window.location redirect
  const jsMatch = html.match(/window\.location\s*(?:\.href\s*)?=\s*["']([^"']+)/i);
  if (jsMatch) return jsMatch[1];

  // location.replace
  const replaceMatch = html.match(/location\.replace\s*\(\s*["']([^"']+)/i);
  if (replaceMatch) return replaceMatch[1];

  // Google-specific: look for the URL in the page content
  const mapsUrlMatch = html.match(/https:\/\/www\.google\.[a-z.]+\/maps\/[^"'\s<>]+/i);
  if (mapsUrlMatch) return mapsUrlMatch[0];

  return null;
}

/**
 * Extract coordinates from HTML content
 */
export function extractCoordsFromHtml(html) {
  if (!html) return null;

  // og:image or similar meta tags with coords
  const ogMatch = html.match(/center=(-?\d+\.?\d*)[,%](-?\d+\.?\d*)/);
  if (ogMatch) {
    const lat = parseFloat(ogMatch[1]);
    const lng = parseFloat(ogMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // !3d...!4d... in any URL within HTML
  const dataMatch = html.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (dataMatch) {
    const lat = parseFloat(dataMatch[1]);
    const lng = parseFloat(dataMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // @LAT,LNG in any URL within HTML
  const atMatch = html.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // JSON-style coordinates in the page
  const jsonMatch = html.match(/"lat"\s*:\s*(-?\d+\.?\d*)\s*,\s*"lng"\s*:\s*(-?\d+\.?\d*)/);
  if (jsonMatch) {
    const lat = parseFloat(jsonMatch[1]);
    const lng = parseFloat(jsonMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Extract coords from a URL string (server-side version)
 */
export function extractCoordsFromUrl(url) {
  // !3d...!4d...
  const data3d4d = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (data3d4d) {
    const lat = parseFloat(data3d4d[1]);
    const lng = parseFloat(data3d4d[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // ?q=LAT,LNG
  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*)[,%2C\s+]+(-?\d+\.?\d*)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // /@LAT,LNG
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Validate coordinates
 */
export function isValidCoords(lat, lng) {
  return !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0);
}

export default {
  resolveUrl,
  resolveUrlWithHtml,
  extractRedirectFromHtml,
  extractCoordsFromHtml,
  extractCoordsFromUrl,
  isValidCoords,
};