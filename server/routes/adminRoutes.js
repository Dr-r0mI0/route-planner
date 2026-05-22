/**
 * Admin Routes
 * API endpoints for admin operations
 */

import { Router } from 'express';
import {
  getStats,
  getUsers,
  updateUserRole,
  banUser,
  getSettings,
  updateSettings,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/stats', getStats);

// Users Management
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/ban', banUser);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

export default router;