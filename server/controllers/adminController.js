/**
 * Admin Controller - Updated for PostgreSQL
 */

import { readUsers, writeUsers } from '../services/db.js';
import { getAllUsers, updateUser } from '../services/db.js';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Default settings
const DEFAULT_SETTINGS = {
  appName: 'Route Planner',
  maintenanceMode: false,
  maxLocationsPerRoute: 20,
  defaultMapZoom: 13,
  timezone: 'Asia/Riyadh',
  language: 'ar',
  allowRegistration: true
};

// Default categories
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#FF6B6B', active: true },
  { id: '2', name: 'Shopping', icon: 'shopping-bag', color: '#4ECDC4', active: true },
  { id: '3', name: 'Tourist Attractions', icon: 'camera', color: '#FFE66D', active: true },
  { id: '4', name: 'Hotels', icon: 'bed', color: '#95E1D3', active: true },
  { id: '5', name: 'Entertainment', icon: 'film', color: '#DDA0DD', active: true },
  { id: '6', name: 'Transportation', icon: 'car', color: '#87CEEB', active: true },
  { id: '7', name: 'Healthcare', icon: 'heart', color: '#FFB6C1', active: true },
  { id: '8', name: 'Education', icon: 'graduation-cap', color: '#98D8C8', active: true }
];

// Initialize default files if they don't exist
function initializeFiles() {
  ensureDataDir();
  
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
  }
  
  if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf8');
  }
}

// Read settings
function readSettings() {
  initializeFiles();
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Write settings
function writeSettings(settings) {
  ensureDataDir();
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing settings:', error);
    return false;
  }
}

// Read categories
function readCategories() {
  initializeFiles();
  try {
    return JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading categories:', error);
    return DEFAULT_CATEGORIES;
  }
}

// Write categories
function writeCategories(categories) {
  ensureDataDir();
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing categories:', error);
    return false;
  }
}

// Activity log
function logActivity(action, userId, details) {
  const activityLogPath = path.join(DATA_DIR, 'activity.json');
  ensureDataDir();
  
  let activities = [];
  try {
    if (fs.existsSync(activityLogPath)) {
      activities = JSON.parse(fs.readFileSync(activityLogPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading activity log:', error);
  }
  
  activities.unshift({
    id: Date.now().toString(),
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 100 activities
  activities = activities.slice(0, 100);
  
  try {
    fs.writeFileSync(activityLogPath, JSON.stringify(activities, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing activity log:', error);
  }
}

// GET /api/admin/stats
export async function getStats(req, res) {
  try {
    const users = await readUsers();
    const settings = readSettings();
    
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active && !u.banned).length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const bannedUsers = users.filter(u => u.banned).length;
    
    const activityLogPath = path.join(DATA_DIR, 'activity.json');
    let recentActivity = [];
    try {
      if (fs.existsSync(activityLogPath)) {
        recentActivity = JSON.parse(fs.readFileSync(activityLogPath, 'utf8')).slice(0, 20);
      }
    } catch (error) {
      console.error('Error reading activity log:', error);
    }
    
    res.json({
      stats: {
        totalUsers,
        activeUsers,
        adminUsers,
        bannedUsers
      },
      settings: {
        appName: settings.appName,
        maintenanceMode: settings.maintenanceMode,
        allowRegistration: settings.allowRegistration
      },
      recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/admin/users
export async function getUsers(req, res) {
  try {
    const users = await readUsers();
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// PUT /api/admin/users/:userId/role
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await updateUser(userId, { role });
    
    res.json({ message: 'User role updated', user: { ...users[userIndex], role } });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// PUT /api/admin/users/:userId/ban
export async function banUser(req, res) {
  try {
    const { userId } = req.params;
    const { banned } = req.body;
    
    await updateUser(userId, { is_active: !banned });
    
    res.json({ message: banned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/admin/settings
export async function getSettings(req, res) {
  try {
    const settings = readSettings();
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// PUT /api/admin/settings
export async function updateSettings(req, res) {
  try {
    const currentSettings = readSettings();
    const updatedSettings = { ...currentSettings, ...req.body };
    writeSettings(updatedSettings);
    res.json({ message: 'Settings updated', settings: updatedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// GET /api/admin/categories
export async function getCategories(req, res) {
  try {
    const categories = readCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// POST /api/admin/categories
export async function createCategory(req, res) {
  try {
    const { name, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    
    const categories = readCategories();
    const newCategory = {
      id: Date.now().toString(),
      name,
      icon: icon || 'tag',
      color: color || '#888888',
      active: true
    };
    categories.push(newCategory);
    writeCategories(categories);
    res.status(201).json({ message: 'Created', category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// PUT /api/admin/categories/:categoryId
export async function updateCategory(req, res) {
  try {
    const { categoryId } = req.params;
    const categories = readCategories();
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    
    categories[index] = { ...categories[index], ...req.body, id: categoryId };
    writeCategories(categories);
    res.json({ message: 'Updated', category: categories[index] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// DELETE /api/admin/categories/:categoryId
export async function deleteCategory(req, res) {
  try {
    const { categoryId } = req.params;
    let categories = readCategories();
    categories = categories.filter(c => c.id !== categoryId);
    writeCategories(categories);
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

export default {
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
};