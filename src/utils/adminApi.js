/**
 * Admin API Utility
 * API calls for admin operations
 */

import { apiRequest } from './api';

// Dashboard
export const fetchAdminStats = () => apiRequest('/admin/stats');
export const fetchAdminDashboard = () => apiRequest('/admin/stats');

// Users
export const fetchAllUsers = () => apiRequest('/admin/users');
export const updateUserRole = (userId, role) => 
  apiRequest(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
export const banUser = (userId, banned = true) => 
  apiRequest(`/admin/users/${userId}/ban`, {
    method: 'PUT',
    body: JSON.stringify({ banned })
  });

// Settings
export const fetchSettings = () => apiRequest('/admin/settings');
export const updateSettings = (settings) => 
  apiRequest('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  });

// Categories
export const fetchCategories = () => apiRequest('/admin/categories');
export const createCategory = (category) => 
  apiRequest('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(category)
  });
export const updateCategory = (categoryId, updates) => 
  apiRequest(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
export const deleteCategory = (categoryId) => 
  apiRequest(`/admin/categories/${categoryId}`, {
    method: 'DELETE'
  });

export default {
  fetchAdminStats,
  fetchAllUsers,
  updateUserRole,
  banUser,
  fetchSettings,
  updateSettings,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
};