/**
 * Route Controller
 * Business logic for route management endpoints
 */

import { saveRoute, getRoutes } from '../services/routeService.js';

export async function saveRouteHandler(req, res) {
  const routeData = req.body;
  console.log('Route save requested:', routeData?.id);
  
  const result = saveRoute(routeData);
  res.json(result);
}

export async function getRoutesHandler(req, res) {
  const routes = getRoutes();
  res.json({ routes });
}

export default {
  saveRouteHandler,
  getRoutesHandler,
};