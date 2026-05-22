/**
 * Route Service
 * Handles route persistence and retrieval (stub for future SQLite)
 */

const routes = new Map();

/**
 * Save a route plan
 */
export function saveRoute(routeData) {
  const id = routeData?.id || Date.now().toString();
  routes.set(id, { ...routeData, id, savedAt: new Date().toISOString() });
  return { success: true, id, message: 'Route saved' };
}

/**
 * Get all saved routes
 */
export function getRoutes() {
  return Array.from(routes.values());
}

/**
 * Get a single route by ID
 */
export function getRouteById(id) {
  return routes.get(id) || null;
}

/**
 * Delete a route by ID
 */
export function deleteRoute(id) {
  return routes.delete(id);
}

export default {
  saveRoute,
  getRoutes,
  getRouteById,
  deleteRoute,
};