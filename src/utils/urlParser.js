/**
 * ROUT PLANNER — URL Parser Engine
 * Parses all Google Maps URL formats to extract coordinates.
 * Handles: short URLs, place URLs, directions, search, data params, raw coords.
 */

/**
 * Validate lat/lng are within valid ranges
 */
function isValidCoords(lat, lng) {
  return (
    !isNaN(lat) && !isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    // Filter out zeros and very small coords that are likely not real
    !(lat === 0 && lng === 0)
  );
}

/**
 * Decode URL-encoded characters for better matching
 */
function decodeUrl(url) {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

/**
 * Extract coordinates from a single URL string.
 * Tries multiple strategies in order of specificity.
 * @param {string} url - A Google Maps URL or coordinate string
 * @returns {{ lat: number, lng: number } | null}
 */
function extractCoordsFromUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Decode any URL-encoded chars
  const decoded = decodeUrl(trimmed);

  // Strategy 1: Raw coordinates (e.g. "24.7136,46.6753")
  const rawMatch = decoded.match(/^(-?\d{1,3}\.\d{3,})\s*[,،]\s*(-?\d{1,3}\.\d{3,})$/);
  if (rawMatch) {
    const lat = parseFloat(rawMatch[1]);
    const lng = parseFloat(rawMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Not a URL? Stop here
  if (!decoded.startsWith('http')) return null;

  // Strategy 2: !3d...!4d... data params (most reliable for place URLs)
  // These appear in /place/ URLs and contain the exact marker position
  const data3d4d = decoded.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (data3d4d) {
    const lat = parseFloat(data3d4d[1]);
    const lng = parseFloat(data3d4d[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 3: ?q=LAT,LNG or ?q=LAT+LNG or ?q=LAT%2C+LNG
  const qMatch = decoded.match(/[?&]q=(-?\d+\.?\d*)[,%2C\s+]+(-?\d+\.?\d*)/i);
  if (qMatch) {
    const lat = parseFloat(qMatch[1]);
    const lng = parseFloat(qMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 4: /place/.../@LAT,LNG  (place URL with @ coordinates)
  const placeAt = decoded.match(/\/place\/[^/]*\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeAt) {
    const lat = parseFloat(placeAt[1]);
    const lng = parseFloat(placeAt[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 5: /@LAT,LNG,ZOOM  (standard map view — but lower priority than place)
  const atMatch = decoded.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 6: /dir/ORIGIN/DEST — extract destination coords
  const dirMatch = decoded.match(/\/dir\/[^/]*\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (dirMatch) {
    const lat = parseFloat(dirMatch[1]);
    const lng = parseFloat(dirMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 7: ?ll=LAT,LNG
  const llMatch = decoded.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (llMatch) {
    const lat = parseFloat(llMatch[1]);
    const lng = parseFloat(llMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 8: ?sll=LAT,LNG
  const sllMatch = decoded.match(/[?&]sll=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (sllMatch) {
    const lat = parseFloat(sllMatch[1]);
    const lng = parseFloat(sllMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 9: /search/LAT,LNG
  const searchMatch = decoded.match(/\/search\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (searchMatch) {
    const lat = parseFloat(searchMatch[1]);
    const lng = parseFloat(searchMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 10: ?center=LAT,LNG
  const centerMatch = decoded.match(/[?&]center=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (centerMatch) {
    const lat = parseFloat(centerMatch[1]);
    const lng = parseFloat(centerMatch[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 11: 1d... data params (sometimes used for lng in some URL formats)
  // !2d=LNG!3d=LAT format (note: 2d is lng, 3d is lat in this format)
  const data2d3d = decoded.match(/!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/);
  if (data2d3d) {
    const lng = parseFloat(data2d3d[1]);
    const lat = parseFloat(data2d3d[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  // Strategy 12: Any remaining coordinate-like pattern in the URL
  // Look for two decimal numbers that look like coords anywhere in the URL
  const anyCoords = decoded.match(/[/=,](-?\d{1,2}\.\d{4,}),(-?\d{1,3}\.\d{4,})/);
  if (anyCoords) {
    const lat = parseFloat(anyCoords[1]);
    const lng = parseFloat(anyCoords[2]);
    if (isValidCoords(lat, lng)) return { lat, lng };
  }

  return null;
}

/**
 * Check if a URL is a shortened Google Maps URL
 */
function isShortUrl(url) {
  return /^https?:\/\/(goo\.gl\/maps|maps\.app\.goo\.gl|maps\.google\.com\/goo\.gl)\//i.test(url);
}

/**
 * Check if a string looks like a URL
 */
function isUrl(str) {
  return /^https?:\/\//i.test(str.trim());
}

/**
 * Build unified URL from coordinates
 */
function buildUnifiedUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Extract all URLs and coordinate pairs from a multi-line text input.
 * Handles:
 * - One URL per line
 * - URLs mixed with text/Arabic text
 * - URLs separated by whitespace
 * - Raw coordinate pairs (with comma or Arabic comma)
 * - Multiple URLs on same line
 */
function extractUrlsFromText(text) {
  if (!text || !text.trim()) return [];

  const results = [];
  const seen = new Set();

  // 1. Extract Google Maps URLs using the same backend regex (ignoring stuck text/Arabic characters)
  const urlRegex = /https?:\/\/(?:www\.)?(?:google\.[a-z.]{2,6}\/maps|goo\.gl\/maps|maps\.app\.goo\.gl)\/[a-zA-Z0-9$_.+!*'(),;/?:@=&%-]*/ig;
  const urlMatches = text.match(urlRegex) || [];
  for (const url of urlMatches) {
    const cleaned = url.replace(/[.,;:!?)]+$/, '');
    if (!seen.has(cleaned)) {
      seen.add(cleaned);
      results.push(cleaned);
    }
  }

  // 2. Extract Raw Coordinates
  const lines = text.split(/[\n\r]+/);
  for (const line of lines) {
    const coordMatch = line.match(/(-?\d{1,3}\.\d{3,})\s*[,،]\s*(-?\d{1,3}\.\d{3,})/);
    if (coordMatch && !line.includes('http')) {
      const key = `${coordMatch[1]},${coordMatch[2]}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(key);
      }
    }
  }

  return results;
}

/**
 * Resolve a short URL via the backend proxy.
 * The proxy follows redirects and returns the final URL.
 * Falls back to parsing HTML for meta-refresh if HEAD fails.
 */
async function resolveShortUrl(shortUrl, proxyBaseUrl = '/api') {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const resp = await fetch(
      `${proxyBaseUrl}/resolve?url=${encodeURIComponent(shortUrl)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!resp.ok) throw new Error('Failed to resolve');
    const data = await resp.json();
    
    // Check if it actually resolved to a different URL
    if (data.resolvedUrl && data.resolvedUrl !== shortUrl) {
      return data.resolvedUrl;
    }
    
    // If same URL returned, try the HTML body endpoint
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 12000);
    const htmlResp = await fetch(
      `${proxyBaseUrl}/resolve-html?url=${encodeURIComponent(shortUrl)}`,
      { signal: controller2.signal }
    );
    clearTimeout(timeoutId2);
    if (htmlResp.ok) {
      const htmlData = await htmlResp.json();
      if (htmlData.resolvedUrl) return htmlData.resolvedUrl;
      // Try to extract coords from the HTML content directly
      if (htmlData.coords) return buildUnifiedUrl(htmlData.coords.lat, htmlData.coords.lng);
    }
    
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Short URL resolution failed:', shortUrl, err.message);
    return null;
  }
}

/**
 * Parse a single URL entry — resolve if short, extract coords
 * @returns {{ lat, lng, originalUrl, unifiedUrl, isShort, error } | null}
 */
export async function parseSingleUrl(urlStr, proxyBaseUrl = '/api') {
  const trimmed = urlStr.trim();
  if (!trimmed) return null;

  let urlToProcess = trimmed;
  const wasShort = isShortUrl(trimmed);

  // If short URL, try to resolve
  if (wasShort) {
    const resolved = await resolveShortUrl(trimmed, proxyBaseUrl);
    if (resolved) {
      urlToProcess = resolved;
    } else {
      return {
        originalUrl: trimmed,
        unifiedUrl: null,
        lat: null,
        lng: null,
        isShort: true,
        error: 'Could not resolve short URL',
      };
    }
  }

  // Extract coordinates
  const coords = extractCoordsFromUrl(urlToProcess);
  if (!coords) {
    return {
      originalUrl: trimmed,
      unifiedUrl: null,
      lat: null,
      lng: null,
      isShort: wasShort,
      error: 'No coordinates found in URL',
    };
  }

  return {
    originalUrl: trimmed,
    unifiedUrl: buildUnifiedUrl(coords.lat, coords.lng),
    lat: coords.lat,
    lng: coords.lng,
    isShort: wasShort,
    error: null,
  };
}

/**
 * Parse multiple URLs from text input.
 * Processes all URLs in parallel for speed, with concurrency limit.
 * Returns array of parsed results in input order.
 */
export async function parseMultipleUrls(text, proxyBaseUrl = '/api') {
  const urls = extractUrlsFromText(text);
  
  if (urls.length === 0) return [];

  // Process in parallel with concurrency limit of 5
  const CONCURRENCY = 5;
  const results = new Array(urls.length);
  
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(url => parseSingleUrl(url, proxyBaseUrl))
    );
    batchResults.forEach((result, j) => {
      results[i + j] = result;
    });
  }

  // Filter out nulls
  const validResults = results.filter(Boolean);

  // Deduplicate by coordinates (within 50m ~ 0.0005 degrees)
  const deduped = [];
  for (const r of validResults) {
    if (!r.lat || !r.lng) {
      deduped.push(r);
      continue;
    }
    const isDup = deduped.some(
      d => d.lat && d.lng &&
        Math.abs(d.lat - r.lat) < 0.0005 &&
        Math.abs(d.lng - r.lng) < 0.0005
    );
    if (!isDup) deduped.push(r);
  }

  return deduped;
}

export { extractCoordsFromUrl, isShortUrl, extractUrlsFromText, buildUnifiedUrl, isValidCoords };
