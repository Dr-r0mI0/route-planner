/**
 * Auth Routes - Updated for OTP + Password Flow
 */

import { Router } from 'express';
import { 
  handleCheckPhone,
  handleLogin,
  handleRegister,
  handleConfirmEmail,
  handleGetMe,
  handleChangePassword,
  handleLogout
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/check - Check if phone exists, send OTP if new
router.post('/check', handleCheckPhone);

// POST /api/auth/login - Login with password (existing user)
router.post('/login', handleLogin);

// POST /api/auth/register - Register with OTP (new user)
router.post('/register', handleRegister);

// POST /api/auth/confirm-email - Confirm email address
router.post('/confirm-email', handleConfirmEmail);

// POST /api/auth/change-password - Change password (protected)
router.post('/change-password', authMiddleware, handleChangePassword);

// POST /api/auth/logout - Logout
router.post('/logout', handleLogout);

// GET /api/auth/me - Get current user (protected)
router.get('/me', authMiddleware, handleGetMe);

export default router;