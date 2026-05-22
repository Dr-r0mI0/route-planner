/**
 * URL Routes
 */

import { Router } from 'express';
import { resolveShortUrl, resolveHtmlUrl } from '../controllers/urlController.js';

const router = Router();

router.get('/resolve', resolveShortUrl);
router.get('/resolve-html', resolveHtmlUrl);

export default router;