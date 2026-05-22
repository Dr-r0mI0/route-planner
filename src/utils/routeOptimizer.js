/**
 * ROUT PLANNER — Route Optimizer
 * Solves TSP using Nearest Neighbor + 2-opt improvement.
 * Uses Google Distance Matrix API for real road distances when available.
 */

/**
 * Haversine distance between two points (in km)
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Build distance matrix using Haversine (fast fallback)
 */
function buildHaversineMatrix(locations) {
  const n = locations.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dist = haversine(
        locations[i].lat, locations[i].lng,
        locations[j].lat, locations[j].lng
      );
      matrix[i][j] = dist;
      matrix[j][i] = dist;
    }
  }
  return matrix;
}

/**
 * Build distance matrix using Google Distance Matrix API (real road distances)
 */
async function buildGoogleMatrix(locations, apiKey) {
  const n = locations.length;
  
  // Google Distance Matrix API accepts max 25 origins x 25 destinations
  if (n > 25) {
    console.warn('Too many locations for Distance Matrix API, falling back to Haversine');
    return buildHaversineMatrix(locations);
  }

  try {
    const origins = locations.map(l => `${l.lat},${l.lng}`).join('|');
    const destinations = origins;
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}&mode=driving`;
    
    const resp = await fetch(url);
    const data = await resp.json();
    
    if (data.status !== 'OK') {
      console.warn('Distance Matrix API error, falling back to Haversine');
      return buildHaversineMatrix(locations);
    }

    const matrix = Array.from({ length: n }, () => Array(n).fill(0));
    const durationMatrix = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const element = data.rows[i].elements[j];
        if (element.status === 'OK') {
          matrix[i][j] = element.distance.value / 1000; // meters to km
          durationMatrix[i][j] = element.duration.value / 60; // seconds to minutes
        } else {
          // Fallback to Haversine for this pair
          matrix[i][j] = haversine(
            locations[i].lat, locations[i].lng,
            locations[j].lat, locations[j].lng
          );
          durationMatrix[i][j] = matrix[i][j] * 2; // rough estimate: 30km/h avg
        }
      }
    }

    return { distances: matrix, durations: durationMatrix };
  } catch (err) {
    console.warn('Distance Matrix API failed:', err.message);
    return buildHaversineMatrix(locations);
  }
}

/**
 * Nearest Neighbor heuristic for TSP
 * @param {number[][]} matrix - Distance matrix
 * @param {number} start - Starting index (usually 0)
 * @returns {number[]} - Order of indices
 */
function nearestNeighbor(matrix, start = 0) {
  const n = matrix.length;
  const visited = new Set([start]);
  const route = [start];
  let current = start;

  while (visited.size < n) {
    let nearest = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && matrix[current][i] < nearestDist) {
        nearest = i;
        nearestDist = matrix[current][i];
      }
    }

    if (nearest === -1) break;
    visited.add(nearest);
    route.push(nearest);
    current = nearest;
  }

  return route;
}

/**
 * 2-opt improvement for TSP route
 * Swaps edges to reduce total distance
 */
function twoOpt(route, matrix, maxIterations = 100) {
  const n = route.length;
  let improved = true;
  let iterations = 0;

  const calcDistance = (r) => {
    let total = 0;
    for (let i = 0; i < r.length - 1; i++) {
      total += matrix[r[i]][r[i + 1]];
    }
    return total;
  };

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 1; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // Try reversing the segment between i and j
        const newRoute = [
          ...route.slice(0, i),
          ...route.slice(i, j + 1).reverse(),
          ...route.slice(j + 1),
        ];

        if (calcDistance(newRoute) < calcDistance(route)) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }

  return route;
}

/**
 * Calculate route with time windows consideration
 */
function applyTimeWindows(route, locations, durations) {
  // For now, simple reordering that respects time windows
  // Locations with specific time windows get priority placement
  const withWindows = [];
  const flexible = [];

  route.forEach((idx, pos) => {
    if (pos === 0) return; // Skip start point
    const loc = locations[idx];
    if (loc.visitTimeStart && loc.visitTimeEnd && loc.visitTimeStart !== 'anytime') {
      withWindows.push({ idx, start: loc.visitTimeStart, end: loc.visitTimeEnd });
    } else {
      flexible.push(idx);
    }
  });

  // Sort windowed locations by their start time
  withWindows.sort((a, b) => a.start.localeCompare(b.start));

  // Rebuild route: start point + windowed locations inserted at appropriate positions + flexible locations
  const newRoute = [route[0]];
  let windowIdx = 0;
  
  for (const flexIdx of flexible) {
    // Insert any windowed locations that should come before this point
    while (windowIdx < withWindows.length) {
      newRoute.push(withWindows[windowIdx].idx);
      windowIdx++;
    }
    newRoute.push(flexIdx);
  }
  
  // Add remaining windowed locations
  while (windowIdx < withWindows.length) {
    newRoute.push(withWindows[windowIdx].idx);
    windowIdx++;
  }

  return newRoute;
}

/**
 * Main optimization function
 * @param {Array} locations - Array of { lat, lng, waitTime, hasBooking, visitTimeStart, visitTimeEnd }
 * @param {string} apiKey - Google Maps API key (optional, uses Haversine if not provided)
 * @returns {Promise<{ route, totalDistance, totalDuration, legs }>}
 */
export async function optimizeRoute(locations, apiKey = null) {
  if (locations.length <= 1) {
    return {
      route: locations.map((_, i) => i),
      totalDistance: 0,
      totalDuration: 0,
      totalWaitTime: 0,
      legs: [],
    };
  }

  // Build distance matrix
  let distMatrix;
  let durMatrix = null;

  if (apiKey && locations.length <= 25) {
    const result = await buildGoogleMatrix(locations, apiKey);
    if (result.distances) {
      distMatrix = result.distances;
      durMatrix = result.durations;
    } else {
      distMatrix = result;
    }
  } else {
    distMatrix = buildHaversineMatrix(locations);
  }

  // If we only got a simple matrix (Haversine), estimate durations
  if (!durMatrix) {
    durMatrix = distMatrix.map(row => row.map(d => d * 2)); // ~30km/h average
  }

  // Solve TSP
  let route = nearestNeighbor(distMatrix, 0); // Start from index 0
  route = twoOpt(route, distMatrix);

  // Apply time windows
  const hasTimeWindows = locations.some(
    l => l.visitTimeStart && l.visitTimeStart !== 'anytime'
  );
  if (hasTimeWindows) {
    route = applyTimeWindows(route, locations, durMatrix);
  }

  // Calculate legs
  const legs = [];
  let totalDistance = 0;
  let totalDuration = 0;
  let totalWaitTime = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];
    const distance = distMatrix[from][to];
    const duration = durMatrix[from][to];
    const waitTime = locations[to].waitTime || 10;

    legs.push({
      from: from,
      to: to,
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration),
      waitTime,
    });

    totalDistance += distance;
    totalDuration += duration;
    totalWaitTime += waitTime;
  }

  return {
    route,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration: Math.round(totalDuration),
    totalWaitTime,
    legs,
  };
}

/**
 * Recalculate legs for a manually reordered route
 */
export function recalculateLegs(route, locations) {
  const distMatrix = buildHaversineMatrix(locations);
  const durMatrix = distMatrix.map(row => row.map(d => d * 2));

  const legs = [];
  let totalDistance = 0;
  let totalDuration = 0;
  let totalWaitTime = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];
    const distance = distMatrix[from][to];
    const duration = durMatrix[from][to];
    const waitTime = locations[to].waitTime || 10;

    legs.push({
      from,
      to,
      distance: Math.round(distance * 10) / 10,
      duration: Math.round(duration),
      waitTime,
    });

    totalDistance += distance;
    totalDuration += duration;
    totalWaitTime += waitTime;
  }

  return {
    route,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalDuration: Math.round(totalDuration),
    totalWaitTime,
    legs,
  };
}

export { haversine };
