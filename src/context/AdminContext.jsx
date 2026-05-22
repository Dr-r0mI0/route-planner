/**
 * Admin Context
 * Manages admin dashboard state and API calls
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../utils/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest('/admin/stats');
      setStats(data.stats);
      setSettings(data.settings);
    } catch (err) {
      setError(err.message);
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Update user role
  const updateUserRole = useCallback(async (userId, role) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role })
      });
      
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ban/Unban user
  const toggleUserBan = useCallback(async (userId, banned) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest(`/admin/users/${userId}/ban`, {
        method: 'PUT',
        body: JSON.stringify({ banned })
      });
      
      setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest('/admin/settings');
      setSettings(data.settings);
    } catch (err) {
      setError(err.message);
      console.error('Fetch settings error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Update settings
  const updateSettings = useCallback(async (newSettings) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(newSettings)
      });
      
      setSettings(data.settings);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest('/admin/categories');
      setCategories(data.categories);
    } catch (err) {
      setError(err.message);
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Create category
  const createCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(category)
      });
      
      setCategories(prev => [...prev, data.category]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update category
  const updateCategory = useCallback(async (categoryId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiRequest(`/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      setCategories(prev => prev.map(c => c.id === categoryId ? data.category : c));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete category
  const deleteCategory = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiRequest(`/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    stats,
    users,
    categories,
    settings,
    loading,
    error,
    isAdmin,
    fetchStats,
    fetchUsers,
    updateUserRole,
    toggleUserBan,
    fetchSettings,
    updateSettings,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError: () => setError(null),
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;