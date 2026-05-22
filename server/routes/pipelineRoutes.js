/**
 * Pipeline Routes
 */

import { Router } from 'express';
import { processTextHandler } from '../controllers/pipelineController.js';

const router = Router();

router.post('/process-text', processTextHandler);

export default router;