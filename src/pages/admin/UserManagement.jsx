/**
 * User Management Page
 * Manage users - view list, change roles, ban/unban
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
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const BanIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function UserManagement() {
  const { users, loading, error, fetchUsers, updateUserRole, toggleUserBan, isAdmin } = useAdmin();
  const { user: currentUser } = useAuth();
  const { isLight } = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`هل أنت متأكد من تغيير الصلاحية إلى "${newRole === 'admin' ? 'مدير' : 'مستخدم'}"؟`)) {
      return;
    }
    
    setActionLoading(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBan = async (userId, currentlyBanned) => {
    const action = currentlyBanned ? 'إلغاء حظر' : 'حظر';
    if (!confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) {
      return;
    }
    
    setActionLoading(userId);
    try {
      await toggleUserBan(userId, !currentlyBanned);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'banned' && user.banned) ||
      (filterStatus === 'active' && !user.banned);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              <UsersIcon />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-archivo">إدارة المستخدمين</h1>
            <p className="text-sm opacity-70">{users.length} مستخدم</p>
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

      {/* Filters */}
      <div className={`p-4 rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] ${
        isLight 
          ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
          : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
      }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="بحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full h-10 pr-10 rounded-xl border outline-none font-archivo text-sm ${
                isLight
                  ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929] placeholder-gray-400'
                  : 'bg-brand-bg border-brand-border text-brand-text'
              }`}
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
              isLight
                ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                : 'bg-brand-bg border-brand-border text-brand-text'
            }`}
          >
            <option value="all">جميع الأدوار</option>
            <option value="admin">مدير</option>
            <option value="user">مستخدم</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`h-10 px-4 rounded-xl border outline-none font-archivo text-sm ${
              isLight
                ? 'bg-white/50 border-[rgba(255,255,255,0.125)] text-[#292929]'
                : 'bg-brand-bg border-brand-border text-brand-text'
            }`}
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="banned">محظور</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && !users.length && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Users List */}
      <div className={`rounded-2xl border backdrop-blur-[4px] backdrop-saturate-[1.31] overflow-hidden ${
        isLight 
          ? 'bg-[rgba(255,255,255,0.39)] border-[rgba(255,255,255,0.125)]' 
          : 'bg-[rgba(0,0,0,0.55)] border-brand-border'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isLight ? 'bg-black/5' : 'bg-white/5'}>
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium opacity-70">المستخدم</th>
                <th className="px-4 py-3 text-center text-xs font-medium opacity-70">البريد</th>
                <th className="px-4 py-3 text-center text-xs font-medium opacity-70">الصلاحية</th>
                <th className="px-4 py-3 text-center text-xs font-medium opacity-70">الحالة</th>
                <th className="px-4 py-3 text-center text-xs font-medium opacity-70">تاريخ التسجيل</th>
                <th className="px-4 py-3 text-center text-xs font-medium opacity-70">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        user.role === 'admin' 
                          ? 'bg-brand-orange text-white' 
                          : isLight ? 'bg-gray-200 text-gray-600' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-brand-orange">(أنت)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-500'
                        : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {user.role === 'admin' && <ShieldIcon />}
                      {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.banned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
                        محظور
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                        <CheckIcon /> نشط
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm opacity-70">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Change Role */}
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            isLight
                              ? 'hover:bg-purple-500/20 text-purple-600'
                              : 'hover:bg-purple-500/30 text-purple-400'
                          } disabled:opacity-50`}
                          title={user.role === 'admin' ? 'تخفيض لمستخدم' : 'ترقية لمدير'}
                        >
                          <ShieldIcon />
                        </button>
                      )}
                      
                      {/* Ban/Unban */}
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleBan(user.id, user.banned)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-lg transition-colors ${
                            user.banned
                              ? isLight
                                ? 'hover:bg-green-500/20 text-green-600'
                                : 'hover:bg-green-500/30 text-green-400'
                              : isLight
                                ? 'hover:bg-red-500/20 text-red-600'
                                : 'hover:bg-red-500/30 text-red-400'
                          } disabled:opacity-50`}
                          title={user.banned ? 'إلغاء الحظر' : 'حظر'}
                        >
                          <BanIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 opacity-60">
            <p>لا توجد نتائج</p>
          </div>
        )}
      </div>
    </div>
  );
}