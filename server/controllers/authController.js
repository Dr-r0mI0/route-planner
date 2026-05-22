import { 
  checkPhone,
  loginWithPassword,
  registerWithOtp,
  confirmEmail,
  getUserByToken,
  verifyToken,
  changePassword
} from '../services/authService.js';

// POST /api/auth/check - Step 1: Check phone exists
export async function handleCheckPhone(req, res) {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    const result = await checkPhone(phone);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('CheckPhone error:', error);
    res.status(500).json({ error: 'Failed to check phone' });
  }
}

// POST /api/auth/login - Step 2a: Login with password
export async function handleLogin(req, res) {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    const result = await loginWithPassword(phone, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error, step: result.step });
    }

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

// POST /api/auth/register - Step 2b: Register with OTP
export async function handleRegister(req, res) {
  try {
    const { phone, otp, password, email, name } = req.body;
    
    if (!phone || !otp || !password || !email || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password min 6 chars' });
    }

    const result = await registerWithOtp(phone, otp, password, email, name);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error, step: result.step });
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

// POST /api/auth/confirm-email
export async function handleConfirmEmail(req, res) {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    const result = await confirmEmail(token);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('ConfirmEmail error:', error);
    res.status(500).json({ error: 'Email confirmation failed' });
  }
}

// GET /api/auth/me
export async function handleGetMe(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }

    const token = authHeader.split(' ')[1];
    const user = await getUserByToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

// POST /api/auth/change-password
export async function handleChangePassword(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token' });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password min 6 chars' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const result = await changePassword(payload.id, oldPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
}

// POST /api/auth/logout
export async function handleLogout(req, res) {
  res.json({ success: true, message: 'Logged out' });
}