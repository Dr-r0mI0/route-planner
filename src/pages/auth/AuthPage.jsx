/**
 * Auth Page - Unified Login/Register with Phone + OTP Flow
 * 
 * Flow:
 * 1. Enter phone → Check if exists
 * 2a. Existing user → Enter password → Login
 * 2b. New user → Enter OTP + Password + Email + Name → Register
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthPage() {
  const navigate = useNavigate();
  const { checkPhone, login, register, loading, error, clearError } = useAuth();
  
  // Step states
  const [step, setStep] = useState('phone'); // phone | password | otp | success
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState(null);
  const [exists, setExists] = useState(null);
  
  // Form fields
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Local errors
  const [localError, setLocalError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Check phone
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    
    // Format phone
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }
    
    try {
      const result = await checkPhone(formattedPhone);
      
      if (result.exists) {
        setExists(true);
        setUserId(result.userId);
        setStep('password');
      } else {
        setExists(false);
        setMessage(result.message);
        setStep('otp');
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Step 2a: Login with password (existing user)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    
    try {
      const result = await login(phone, password);
      if (result.success) {
        navigate('/');
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Step 2b: Register with OTP (new user)
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    
    // Validation
    if (password.length < 6) {
      setLocalError('كلمة المرور 6 أحرف على الأقل');
      return;
    }
    
    if (password !== confirmPassword) {
      setLocalError('كلمة المرور غير متطابقة');
      return;
    }
    
    if (!email.includes('@')) {
      setLocalError('بريد إلكتروني غير صالح');
      return;
    }
    
    if (!name.trim()) {
      setLocalError('الاسم مطلوب');
      return;
    }
    
    try {
      const result = await register(phone, otp, password, email, name);
      if (result.success) {
        setMessage('تم إنشاء الحساب! يرجى تأكيد البريد الإلكتروني.');
        setStep('success');
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  // Go back
  const handleBack = () => {
    setStep('phone');
    setPhone('');
    setPassword('');
    setOtp('');
    setEmail('');
    setName('');
    setConfirmPassword('');
    setExists(null);
    setUserId(null);
    setMessage('');
    setLocalError('');
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-orange font-archivo tracking-wider">
            ROUT PLANNER
          </h1>
          <p className="text-brand-text/70 mt-2 font-alexandria">
            {step === 'phone' && 'أدخل رقم هاتفك'}
            {step === 'password' && 'أدخل كلمة المرور'}
            {step === 'otp' && 'أنشئ حسابك'}
            {step === 'success' && 'تم بنجاح'}
          </p>
        </div>

        {/* Error display */}
        {(error || localError) && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
            {error || localError}
          </div>
        )}

        {/* Success message */}
        {message && step === 'otp' && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400 text-sm">
            {message}
          </div>
        )}

        {/* Step 1: Phone input */}
        {step === 'phone' && (
          <form 
            onSubmit={handlePhoneSubmit}
            className="rounded-2xl p-8 backdrop-blur-[4px] backdrop-saturate-[1.31] border border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)]"
          >
            <h2 className="text-xl font-semibold text-brand-text mb-6 font-archivo tracking-wide">
              تسجيل الدخول / إنشاء حساب
            </h2>

            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-brand-text/80 mb-2 font-archivo">
                رقم الهاتف
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
                placeholder="+966500000000"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-orange text-white font-archivo font-semibold tracking-wider uppercase hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'جاري التحميل...' : 'متابعة'}
            </button>
          </form>
        )}

        {/* Step 2a: Password (existing user) */}
        {step === 'password' && (
          <form 
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl p-8 backdrop-blur-[4px] backdrop-saturate-[1.31] border border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)]"
          >
            <button
              type="button"
              onClick={handleBack}
              className="text-brand-text/70 hover:text-brand-text mb-4 text-sm"
            >
              ← تغيير رقم الهاتف
            </button>

            <h2 className="text-xl font-semibold text-brand-text mb-6 font-archivo tracking-wide">
              أهلاً بك مجدداً
            </h2>

            <p className="text-brand-text/70 mb-4 text-sm" dir="ltr">
              {phone}
            </p>

            <div className="mb-6">
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
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-orange text-white font-archivo font-semibold tracking-wider uppercase hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'جاري التحميل...' : 'دخول'}
            </button>
          </form>
        )}

        {/* Step 2b: OTP + Registration (new user) */}
        {step === 'otp' && (
          <form 
            onSubmit={handleOtpSubmit}
            className="rounded-2xl p-8 backdrop-blur-[4px] backdrop-saturate-[1.31] border border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)]"
          >
            <button
              type="button"
              onClick={handleBack}
              className="text-brand-text/70 hover:text-brand-text mb-4 text-sm"
            >
              ← تغيير رقم الهاتف
            </button>

            <h2 className="text-xl font-semibold text-brand-text mb-6 font-archivo tracking-wide">
              إنشاء حساب جديد
            </h2>

            <p className="text-brand-text/70 mb-4 text-sm" dir="ltr">
              {phone}
            </p>

            {/* OTP */}
            <div className="mb-4">
              <label htmlFor="otp" className="block text-sm font-medium text-brand-text/80 mb-2 font-archivo">
                رمز التحقق (OTP)
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-gray-500 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-colors disabled:opacity-50"
                placeholder="123456"
                maxLength={6}
                dir="ltr"
              />
              <p className="text-brand-text/50 text-xs mt-1">تم إرسال رمز التحقق على رقم هاتفك</p>
            </div>

            {/* Name */}
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

            {/* Email */}
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
                dir="ltr"
              />
            </div>

            {/* Password */}
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

            {/* Confirm Password */}
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
        )}

        {/* Success state */}
        {step === 'success' && (
          <div className="rounded-2xl p-8 backdrop-blur-[4px] backdrop-saturate-[1.31] border border-[rgba(255,255,255,0.125)] bg-[rgba(0,0,0,0.55)] text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-brand-text mb-4 font-archivo">
              تم إنشاء حسابك بنجاح!
            </h2>
            <p className="text-brand-text/70 mb-6">
              تم إرسال رابط تأكيد البريد الإلكتروني. يرجى فتح الرابط لإتمام التفعيل.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 rounded-xl bg-brand-orange text-white font-archivo font-semibold tracking-wider uppercase hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
            >
              الذهاب للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}