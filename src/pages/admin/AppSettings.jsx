/**
 * App Settings Page
 * General settings and categories management
 */

import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useTheme } from '../../context/ThemeContext';

// Icons
const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function AppSettings() {
  const { settings, categories, loading, error, fetchSettings, updateSettings, fetchCategories, createCategory, updateCategory, deleteCategory, isAdmin } = useAdmin();
  const { isLight } = useTheme();
  
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'tag', color: '#888888' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
      fetchCategories();
    }
  }, [isAdmin, fetchSettings, fetchCategories]);

  useEffect(() => {
    if (settings) {
      setFormData({
        appName: settings.appName || 'Route Planner',
        maintenanceMode: settings.maintenanceMode || false,
        allowRegistration: settings.allowRegistration !== false,
        maxLocationsPerRoute: settings.maxLocationsPerRoute || 20,
        timezone: settings.timezone || 'Asia/Riyadh',
        language: settings.language || 'ar'
      });
    }
  }, [settings]);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateSettings(formData);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('اسم التصنيف مطلوب');
      return;
    }
    setActionLoading(true);
    try {
      await createCategory(newCategory);
      setNewCategory({ name: '', icon: 'tag', color: '#888888' });
      alert('تم إضافة التصنيف بنجاح');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      alert('اسم التصنيف مطلوب');
      return;
    }
    setActionLoading(true);
    try {
      await updateCategory(editingCategory.id, editingCategory);
      setEditingCategory(null);
      alert('تم تحديث التصنيف بنجاح');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    setActionLoading(true);
    try {
      await deleteCategory(id);
      alert('تم حذف التصنيف بنجاح');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCategoryActive = async (category) => {
    setActionLoading(true);
    try {
      await updateCategory(category.id, { ...category, active: !category.active });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <ShieldIcon />
          <h2 className="text-xl font-bold mt-4">غير مصرح</h2>
          <p className="text-sm mt-2 opacity-70">هذه الصفحة مخصصة للمشرفين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-orange/20">
            <div className="text-brand-orange">
              <SettingsIcon />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-archivo">إعدادات التطبيق</h1>
            <p className="text-sm opacity-70">إدارة الإعدادات والتصنيفات</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-xl border ${
          isLight 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-red-900/30 border-red-700 text-red-300'
        }`}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className={`p-1 rounded-xl inline-flex gap-1 ${
        isLight ? 'bg-black/5' : 'bg-white/5'
      }`}>
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'general'
              ? isLight ? 'bg-white shadow text-[#292929]' : 'bg-brand-bg shadow text-brand-text'
              : isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          الإعدادات العامة
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'categories'
              ? isLight ? 'bg-white shadow text-[#292929]' : 'bg-brand-bg shadow text-brand-text'
              : isLight ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          التصنيفات
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'general' && !loading && (
        <form onSubmit={handleGeneralSubmit} className="space-y-4">
          <div className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] space-y-4 ${
            isLight 
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
              : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
          }`}>
            <h2 className="text-lg font-bold">معلومات التطبيق</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">اسم التطبيق</label>
              <input
                type="text"
                value={formData.appName || ''}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className={`w-full h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
                  isLight
                    ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                    : 'bg-brand-bg border-brand-border text-brand-text'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">المنطقة الزمنية</label>
              <select
                value={formData.timezone || ''}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className={`w-full h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
                  isLight
                    ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                    : 'bg-brand-bg border-brand-border text-brand-text'
                }`}
              >
                <option value="Asia/Riyadh">الرياض (UTC+3)</option>
                <option value="Asia/Dubai">دبي (UTC+4)</option>
                <option value="Europe/London">لندن (UTC+0)</option>
                <option value="America/New_York">نيويورك (UTC-5)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">اللغة الافتراضية</label>
              <select
                value={formData.language || ''}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className={`w-full h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
                  isLight
                    ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                    : 'bg-brand-bg border-brand-border text-brand-text'
                }`}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">أقصى عدد مواقع في المسار</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxLocationsPerRoute || ''}
                onChange={(e) => setFormData({ ...formData, maxLocationsPerRoute: parseInt(e.target.value) })}
                className={`w-full h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
                  isLight
                    ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                    : 'bg-brand-bg border-brand-border text-brand-text'
                }`}
              />
            </div>
          </div>

          <div className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] space-y-4 ${
            isLight 
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
              : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
          }`}>
            <h2 className="text-lg font-bold">حالة التطبيق</h2>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenanceMode || false}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="w-5 h-5 rounded border-brand-orange accent-brand-orange"
              />
              <span>وضع الصيانة</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowRegistration !== false}
                onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
                className="w-5 h-5 rounded border-brand-orange accent-brand-orange"
              />
              <span>السماح بالتسجيل الجديد</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className={`w-full h-12 rounded-xl font-bold transition-colors ${
              actionLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-brand-orange hover:bg-brand-orange/90 text-white'
            }`}
          >
            {actionLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </form>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && !loading && (
        <div className="space-y-4">
          {/* Add New Category */}
          <form onSubmit={handleCreateCategory} className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
            isLight 
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
              : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
          }`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PlusIcon />
              إضافة تصنيف جديد
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="اسم التصنيف"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className={`flex-1 h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
                  isLight
                    ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                    : 'bg-brand-bg border-brand-border text-brand-text'
                }`}
              />
              <input
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-12 h-10 rounded-xl border cursor-pointer"
              />
              <button
                type="submit"
                disabled={actionLoading}
                className={`px-6 h-10 rounded-xl font-bold transition-colors ${
                  actionLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-orange hover:bg-brand-orange/90 text-white'
                }`}
              >
                إضافة
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className={`rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] overflow-hidden ${
            isLight 
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
              : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isLight ? 'bg-black/5' : 'bg-white/5'}>
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium opacity-70">اللون</th>
                    <th className="px-4 py-3 text-center text-xs font-medium opacity-70">الاسم</th>
                    <th className="px-4 py-3 text-center text-xs font-medium opacity-70">الحالة</th>
                    <th className="px-4 py-3 text-center text-xs font-medium opacity-70">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-current/10">
                  {categories.map((category) => (
                    <tr key={category.id} className={isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}>
                      <td className="px-4 py-3">
                        <div 
                          className="w-8 h-8 rounded-lg border"
                          style={{ backgroundColor: category.color }}
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleCategoryActive(category)}
                          disabled={actionLoading}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.active
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}
                        >
                          {category.active ? 'مفعّل' : 'معطّل'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingCategory({ ...category })}
                            className={`p-2 rounded-lg transition-colors ${
                              isLight
                                ? 'hover:bg-blue-500/20 text-blue-600'
                                : 'hover:bg-blue-500/30 text-blue-400'
                            }`}
                            title="تعديل"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={actionLoading}
                            className={`p-2 rounded-lg transition-colors ${
                              isLight
                                ? 'hover:bg-red-500/20 text-red-600'
                                : 'hover:bg-red-500/30 text-red-400'
                            }`}
                            title="حذف"
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 opacity-60">
                <CategoryIcon />
                <p className="mt-2">لا توجد تصنيفات</p>
              </div>
            )}
          </div>

          {/* Edit Category Modal */}
          {editingCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`w-full max-w-md p-6 rounded-2xl ${
                isLight ? 'bg-white' : 'bg-brand-bg'
              }`}>
                <h2 className="text-xl font-bold mb-4">تعديل التصنيف</h2>
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">الاسم</label>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className={`w-full h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
                        isLight
                          ? 'bg-gray-50 border-gray-200 text-[#292929]'
                          : 'bg-brand-bg border-brand-border text-brand-text'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">اللون</label>
                    <input
                      type="color"
                      value={editingCategory.color}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      className="w-full h-10 rounded-xl border cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className={`flex-1 h-10 rounded-xl font-bold ${
                        actionLoading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-brand-orange text-white'
                      }`}
                    >
                      حفظ
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className={`flex-1 h-10 rounded-xl font-bold ${
                        isLight ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}