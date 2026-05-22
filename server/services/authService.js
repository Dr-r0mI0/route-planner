import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { getUserByPhone, createUser, updateUser, getUserById, getUserByConfirmationToken, setUserOtp, clearUserOtp } from './db.js';
import { sendOtp, verifyOtp } from './authenticaService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rout-planner-secret-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const OTP_VALID_MINUTES = 5;

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Compare password
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ============ UNIFIED LOGIN/REGISTER FLOW ============ //

// Step 1: Check phone → determine flow
export async function checkPhone(phone) {
  const user = await getUserByPhone(phone);
  
  if (user) {
    // Existing user - needs password
    return {
      exists: true,
      needsPassword: true,
      userId: user.id,
      message: 'Please enter your password'
    };
  } else {
    // New user - send OTP
    try {
      await sendOtp('sms', phone);
    } catch (err) {
      return { error: 'Failed to send OTP: ' + err.message };
    }
    
    return {
      exists: false,
      needsOtp: true,
      message: 'OTP sent to your phone'
    };
  }
}

// Step 2a: Login (existing user with password)
export async function loginWithPassword(phone, password) {
  const user = await getUserByPhone(phone);
  
  if (!user) {
    return { error: 'User not found', step: 'user_not_found' };
  }

  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    return { error: 'Invalid password', step: 'password_invalid' };
  }

  const token = generateToken(user);

  return {
    success: true,
    step: 'logged_in',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    emailConfirmed: user.email_confirmed
  };
}

// Step 2b: Register (new user with OTP verification)
export async function registerWithOtp(phone, otp, password, email, name) {
  // For new registration, we use the phone as tempId
  // In a real scenario, we might store pending registrations separately
  // But here we'll verify OTP and create account directly
  
  // Note: verifyOtp from Authentica verifies the OTP was sent to that phone
  // If it matches, we can proceed
  try {
    const verification = await verifyOtp(phone, otp);
    if (!verification.status) {
      return { error: 'Invalid OTP', step: 'otp_invalid' };
    }
  } catch (err) {
    return { error: 'OTP verification failed', step: 'otp_invalid' };
  }

  // Check if already exists (race condition)
  const existing = await getUserByPhone(phone);
  if (existing) {
    return { error: 'User already exists', step: 'user_exists' };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate confirmation token
  const confirmationToken = randomUUID();

  // Create user
  const user = await createUser({
    id: randomUUID(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    phone,
    role: 'user'
  });

  // Set confirmation token
  await updateUser(user.id, {
    confirmation_token: confirmationToken,
    confirmation_sent_at: new Date()
  });

  const token = generateToken(user);

  return {
    success: true,
    step: 'registered',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    emailConfirmationRequired: true,
    message: 'Account created. Please confirm your email.'
  };
}

// ============ EMAIL CONFIRMATION ============ //

export async function confirmEmail(token) {
  const user = await getUserByConfirmationToken(token);
  
  if (!user) {
    return { error: 'Invalid confirmation token', step: 'invalid_token' };
  }

  await updateUser(user.id, {
    email_confirmed: true,
    confirmation_token: null
  });

  return {
    success: true,
    step: 'email_confirmed',
    message: 'Email confirmed successfully'
  };
}

// ============ GET USER ============ //

export async function getUserByToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(payload.id);
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailConfirmed: user.email_confirmed
    };
  } catch {
    return null;
  }
}

// Verify token (for middleware)
export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ============ CHANGE PASSWORD ============ //

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await getUserById(userId);
  if (!user) {
    return { error: 'User not found' };
  }

  const valid = await comparePassword(oldPassword, user.password);
  if (!valid) {
    return { error: 'Invalid current password' };
  }

  const hashed = await hashPassword(newPassword);
  await updateUser(userId, { password: hashed });

  return { success: true, message: 'Password changed successfully' };
}

export default {
  checkPhone,
  loginWithPassword,
  registerWithOtp,
  confirmEmail,
  getUserByToken,
  verifyToken,
  changePassword
};