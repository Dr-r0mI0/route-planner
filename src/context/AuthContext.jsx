/**
 * Auth Context - Updated for Phone + OTP + Password Flow
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API_BASE = '/api/auth';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage when auth changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, [token, user]);

  // Step 1: Check phone - returns { exists, needsPassword/needsOtp, userId }
  const checkPhone = useCallback(async (phone) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check phone');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Step 2a: Login with password (existing user)
  const login = useCallback(async (phone, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Step 2b: Register with OTP (new user)
  const register = useCallback(async (phone, otp, password, email, name) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, password, email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm email
  const confirmEmail = useCallback(async (token) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/confirm-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Email confirmation failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (e) {
      // Ignore
    }
    
    setToken(null);
    setUser(null);
  }, [token]);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (!currentToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(currentToken);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Fetch user error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    checkPhone,
    login,
    register,
    confirmEmail,
    logout,
    fetchUser,
    changePassword,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;