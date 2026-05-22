/**
 * Communities Routes
 * API endpoints for community management
 */

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getCommunities,
  createNewCommunity,
  getCommunity,
  joinExistingCommunity,
  leaveExistingCommunity,
  getMessages,
  postMessage
} from '../controllers/communitiesController.js';

const router = express.Router();

// Public routes
router.get('/', getCommunities);
router.get('/:id', getCommunity);
router.get('/:id/messages', getMessages);

// Protected routes
router.post('/', authMiddleware, createNewCommunity);
router.post('/:id/join', authMiddleware, joinExistingCommunity);
router.post('/:id/leave', authMiddleware, leaveExistingCommunity);
router.post('/:id/messages', authMiddleware, postMessage);

export default router;