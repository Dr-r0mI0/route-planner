/**
 * Admin Dashboard Page
 * Main admin dashboard with statistics and recent activity
 */

import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const BanIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function AdminDashboard() {
  const { stats, settings, loading, error, fetchStats, isAdmin } = useAdmin();
  const { isLight } = useTheme();

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityLabel = (action) => {
    const labels = {
      'role_changed': 'تغيير صلاحية',
      'user_banned': 'حظر مستخدم',
      'user_unbanned': 'إلغاء حظر',
      'settings_updated': 'تحديث الإعدادات',
      'category_created': 'إضافة تصنيف',
      'category_updated': 'تعديل تصنيف',
      'category_deleted': 'حذف تصنيف',
      'user_registered': 'تسجيل مستخدم جديد'
    };
    return labels[action] || action;
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
        <h1 className="text-2xl font-bold font-archivo">لوحة التحكم</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isLight 
            ? 'bg-brand-orange/20 text-brand-orange' 
            : 'bg-brand-orange/30 text-brand-orange'
        }`}>
          مدير النظام
        </span>
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

      {/* Loading */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Users */}
            <div className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
              isLight 
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
                : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isLight ? 'bg-brand-orange/20' : 'bg-brand-orange/20'
                }`}>
                  <div className="text-brand-orange">
                    <UsersIcon />
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-70">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            {/* Active Users */}
            <div className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
              isLight 
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
                : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isLight ? 'bg-green-500/20' : 'bg-green-500/20'
                }`}>
                  <div className="text-green-500">
                    <UsersIcon />
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-70">المستخدمون النشطون</p>
                  <p className="text-3xl font-bold">{stats.activeUsers || 0}</p>
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
              isLight 
                ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
                : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  isLight ? 'bg-purple-500/20' : 'bg-purple-500/20'
                }`}>
                  <div className="text-purple-500">
                    <ShieldIcon />
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-70">المشرفون</p>
                  <p className="text-3xl font-bold">{stats.adminUsers || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Banned Users Banner */}
          {stats.bannedUsers > 0 && (
            <div className={`p-4 rounded-xl border border-orange-500/30 bg-orange-500/10 flex items-center gap-3`}>
              <div className="text-orange-500">
                <BanIcon />
              </div>
              <div>
                <p className="font-medium">مستخدمون محظورون</p>
                <p className="text-sm opacity-70">{stats.bannedUsers} مستخدم</p>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className={`p-5 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
            isLight 
              ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
              : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon />
              <h2 className="text-lg font-bold font-archivo">النشاط الأخير</h2>
            </div>
            
            {settings?.recentActivity && settings.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {settings.recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`p-3 rounded-xl ${
                      isLight ? 'bg-black/5' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {getActivityLabel(activity.action)}
                      </span>
                      <span className="text-xs opacity-60">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-sm opacity-70 mt-1">
                        {activity.details.targetUserId && `المستخدم: ${activity.details.targetUserId}`}
                        {activity.details.newRole && `الصلاحية الجديدة: ${activity.details.newRole === 'admin' ? 'مدير' : 'مستخدم'}`}
                        {activity.details.fields && `الحقول: ${activity.details.fields.join(', ')}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 opacity-60">لا يوجد نشاط حديث</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}