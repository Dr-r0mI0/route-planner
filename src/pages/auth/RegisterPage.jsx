/**
 * Register Page Component
 */

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password.length < 6) {
      setLocalError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('كلمة المرور غير متطابقة');
      return;
    }

    try {
      await register(email, password, name);
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-orange font-archivo tracking-wider">
            ROUT PLANNER
          </h1>
          <p className="text-brand-text/70 mt-2 font-alexandria">إنشاء حساب جديد</p>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 backdrop-blur-[4px] backdrop-saturate-[1.31] border border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)]"
        >
          <h2 className="text-xl font-semibold text-brand-text mb-6 font-archivo tracking-wide">
            إنشاء حساب
          </h2>

          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
              {error || localError}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-brand-text/80 mb-2 font-archivo">
              الاسم
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
              placeholder="اسمك الكامل"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-brand-text/80 mb-2 font-archivo">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
              placeholder="example@email.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-brand-text/80 mb-2 font-archivo">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
                placeholder="6 أحرف على الأقل"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-text transition-colors"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-text/80 mb-2 font-archivo">
              تأكيد كلمة المرور
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
              placeholder="أعد إدخال كلمة المرور"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-brand-orange text-white font-archivo font-semibold tracking-wider uppercase hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="text-center mt-6 text-brand-text/70 font-alexandria">
          لديك حساب بالفعل؟{' '}
          <a href="/login" className="text-brand-orange hover:underline font-semibold">
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
}