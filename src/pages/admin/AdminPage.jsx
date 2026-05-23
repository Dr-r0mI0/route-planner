/**
 * Admin Page
 * Main admin container with tabs navigation
 */

import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import AppSettings from './AppSettings';

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

export default function AdminPage() {
  const { isAdmin, loading } = useAdmin();
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: DashboardIcon },
    { id: 'users', label: 'المستخدمين', icon: UsersIcon },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-center p-8 rounded-2xl ${
          isLight ? 'bg-[rgba(255,255,255,0.39)]' : 'bg-[rgba(0,0,0,0.55)]'
        }`}>
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isLight ? 'bg-red-100' : 'bg-red-900/30'
          }`}>
            <div className="text-red-500">
              <ShieldIcon />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">غير مصرح</h2>
          <p className="opacity-70">هذه الصفحة مخصصة للمشرفين فقط</p>
          <p className="text-sm mt-4 opacity-50">يرجى تسجيل الدخول بحساب مشرف</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Admin Header */}
      <div className={`px-6 py-4 border-b ${
        isLight 
          ? 'border-[rgba(255,255,255,0.125)] bg-[rgba(255,255,255,0.39)]' 
          : 'border-brand-border bg-[rgba(0,0,0,0.55)]'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isLight ? 'bg-brand-orange/20' : 'bg-brand-orange/20'
            }`}>
              <div className="text-brand-orange">
                <ShieldIcon />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-archivo">لوحة تحكم المشرف</h1>
              <p className="text-sm opacity-70">إدارة النظام والتطبيق</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            isLight 
              ? 'bg-brand-orange/20 text-brand-orange' 
              : 'bg-brand-orange/30 text-brand-orange'
          }`}>
            مدير النظام
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className={`px-6 py-3 border-b ${
        isLight 
          ? 'border-[rgba(255,255,255,0.125)]' 
          : 'border-brand-border'
      }`}>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === tab.id
                  ? isLight 
                    ? 'bg-white shadow text-brand-orange' 
                    : 'bg-brand-bg shadow text-brand-orange'
                  : isLight 
                    ? 'text-gray-500 hover:bg-white/50' 
                    : 'text-gray-400 hover:bg-brand-bg/50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'settings' && <AppSettings />}
      </div>
    </div>
  );
}