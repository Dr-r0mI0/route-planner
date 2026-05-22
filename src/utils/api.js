/**
 * API Utility with Auth Interceptor
 * Provides authenticated API calls with automatic token handling
 */

const API_BASE = '/api';
const TOKEN_KEY = 'auth_token';

/**
 * Get the auth token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set the auth token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear the auth token
 */
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Generic API request with auth interceptor
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'token_expired' } 
    }));
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const authApi = {
  register: (email, password, name) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => 
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  me: () => 
    apiRequest('/auth/me'),
};

export default { apiRequest, authApi, getToken, setToken, clearToken };