/**
 * Route Routes
 */

import { Router } from 'express';
import { saveRouteHandler, getRoutesHandler } from '../controllers/routeController.js';

const router = Router();

router.post('/save', saveRouteHandler);
router.get('/', getRoutesHandler);

export default router;