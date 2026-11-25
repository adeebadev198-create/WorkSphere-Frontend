// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import logoImg from '../../assets/logo/logo.png';

const BrandIllustration = () => {
  return (
    <div
      className="w-full select-none pointer-events-none"
      style={{
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '20px',
        boxShadow: '0 28px 72px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header / Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <rect x="2" y="2" width="8" height="8" rx="1.5" />
              <rect x="14" y="2" width="8" height="8" rx="1.5" opacity="0.6" />
              <rect x="2" y="14" width="8" height="8" rx="1.5" opacity="0.6" />
              <rect x="14" y="14" width="8" height="8" rx="1.5" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Overview</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <div className="w-2 h-2 rounded-full bg-white/80"></div>
        </div>
      </div>

      {/* Main Card 1 - Total Revenue */}
      <div className="bg-white/95 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-slate-900">$48,295</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            +12.5%
          </span>
        </div>
        {/* Simple Sparkline */}
        <svg viewBox="0 0 200 40" className="w-full h-10 mt-2">
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,30 Q20,20 40,25 T80,15 T120,22 T160,8 T200,5"
            fill="none"
            stroke="#4F46E5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M0,30 Q20,20 40,25 T80,15 T120,22 T160,8 T200,5 L200,40 L0,40 Z"
            fill="url(#grad1)"
          />
        </svg>
      </div>

      {/* Bottom Mini Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 2 */}
        <div className="bg-white/95 rounded-xl p-3 shadow-md">
          <p className="text-[10px] font-medium text-slate-500 mb-1">Active Users</p>
          <div className="flex items-end justify-between">
            <h4 className="text-lg font-bold text-slate-900">2,845</h4>
            <span className="text-[10px] font-semibold text-indigo-600">+8%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white/95 rounded-xl p-3 shadow-md">
          <p className="text-[10px] font-medium text-slate-500 mb-1">Conversion</p>
          <div className="flex items-end justify-between">
            <h4 className="text-lg font-bold text-slate-900">3.2%</h4>
            <span className="text-[10px] font-semibold text-amber-600">+0.4%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Restore saved email on mount (Remember Me functionality)
  useEffect(() => {
    const savedEmail = localStorage.getItem('ws_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Normal Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (rememberMe) {
        localStorage.setItem('ws_remember_email', email.trim());
      } else {
        localStorage.removeItem('ws_remember_email');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // === GOOGLE LOGIN — uses AuthContext.googleLogin for consistent token storage ===
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login was cancelled or failed.');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center font-sans selection:bg-[#4F46E5] selection:text-white"
      style={{ background: '#F0F2F8', padding: '24px 16px' }}
    >
      {/* Floating card container */}
      <div
        className="w-full flex flex-col lg:flex-row overflow-hidden"
        style={{
          maxWidth: 1160,
          minHeight: 680,
          borderRadius: 24,
          boxShadow: '0 20px 60px rgba(15,23,42,0.10)',
          border: '1px solid rgba(226,232,240,0.6)',
        }}
      >

        {/* ══════════════════════════════
            LEFT PANE — white form
        ══════════════════════════════ */}
        <div
          className="w-full lg:w-[42%] flex flex-col bg-white"
          style={{ borderRight: '1px solid #F1F5F9' }}
        >
          <div className="flex-1 flex items-center justify-center" style={{ padding: '48px 48px 32px' }}>
            <div style={{ width: '100%', maxWidth: 340 }}>

              {/* Heading */}
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.5px',
                  lineHeight: 1.15,
                  marginBottom: 8,
                }}
              >
                Welcome back
              </h1>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>
                Enter your details to access your account.
              </p>

              {/* ===== REAL GOOGLE LOGIN BUTTON ===== */}
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape="pill"
                  theme="outline"
                  size="large"
                  text="signin_with"
                  width="340"
                />
              </div>

              {/* or divider */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                <span style={{ margin: '0 12px', fontSize: 11, color: '#CBD5E1', fontWeight: 500 }}>or</span>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
              </div>

              {/* Error banner */}
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '10px 14px',
                    marginBottom: 16,
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    borderRadius: 14,
                    fontSize: 12,
                    color: '#BE123C',
                  }}
                >
                  <AlertCircle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontWeight: 500 }}>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Email */}
                <div>
                  <label htmlFor="email" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 18px',
                      borderRadius: 999,
                      border: '1.5px solid #E2E8F0',
                      fontSize: 13,
                      color: '#0F172A',
                      background: 'white',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#4F46E5';
                      e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.10)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#E2E8F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '11px 44px 11px 18px',
                        borderRadius: 999,
                        border: '1.5px solid #E2E8F0',
                        fontSize: 13,
                        color: '#0F172A',
                        background: 'white',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = '#4F46E5';
                        e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.10)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        left: 'auto',
                        right: 0,
                        width: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff style={{ width: 15, height: 15 }} />
                        : <Eye style={{ width: 15, height: 15 }} />}
                    </button>
                  </div>
                </div>

                {/* Remember me + Forgot */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    htmlFor="rememberMe"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 12,
                      color: '#475569',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        accentColor: '#4F46E5',
                        cursor: 'pointer',
                      }}
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 12, fontWeight: 600, color: '#4F46E5', textDecoration: 'none' }}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password}
                  style={{
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: 999,
                    border: 'none',
                    background: loading || !email.trim() || !password
                      ? 'rgba(79,70,229,0.5)'
                      : '#4F46E5',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loading || !email.trim() || !password ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: '0 6px 20px rgba(79,70,229,0.28)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    marginTop: 4,
                  }}
                >
                  {loading
                    ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> Signing in…</>
                    : 'Sign in'
                  }
                </button>
              </form>

              {/* Quick Demo Logins for Testing & Viva Presentation */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, textAlign: 'center' }}>
                  Quick Demo Access
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@worksphere.com');
                      setPassword('Password123');
                    }}
                    style={{
                      padding: '6px 4px',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#4338CA',
                      background: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    👑 Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('manager@worksphere.com');
                      setPassword('Password123');
                    }}
                    style={{
                      padding: '6px 4px',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#1D4ED8',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    📋 Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('member@worksphere.com');
                      setPassword('Password123');
                    }}
                    style={{
                      padding: '6px 4px',
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#475569',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    👤 Member
                  </button>
                </div>
              </div>

              {/* Register link */}
              <p style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: '#64748B' }}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{ fontWeight: 700, color: '#4F46E5', textDecoration: 'none' }}
                >
                  Register
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '0 0 20px', textAlign: 'center', fontSize: 11, color: '#CBD5E1' }}>
            &copy; {new Date().getFullYear()} WorkSphere. All rights reserved.
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT PANE — indigo gradient + NEW ILLUSTRATION
        ══════════════════════════════ */}
        <div
          className="hidden lg:flex lg:w-[58%] flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #5450E0 0%, #5B50F3 50%, #6366F2 100%)',
            padding: '48px 48px 48px 48px',
            position: 'relative',
          }}
        >
          {/* Ambient glow blobs */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(165,180,252,0.3), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79,70,229,0.5), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Official Brand Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              zIndex: 10,
              marginBottom: 36,
            }}
          >
            <img
              src={logoImg}
              alt="WorkSphere - Plan • Collaborate • Achieve"
              style={{
                height: 48,
                width: 'auto',
                maxWidth: 200,
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                opacity: 0.95,
              }}
            />
          </div>

          {/* Headline */}
          <div style={{ position: 'relative', zIndex: 10, maxWidth: 440, marginBottom: 'auto' }}>
            <h2
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
                marginBottom: 16,
              }}
            >
              Effortless Project &amp; Team Management for Smarter Decisions
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(224,231,255,0.85)', lineHeight: 1.65, maxWidth: 380 }}>
              Stay ahead with real-time insights, performance analytics, and data-driven project strategies. All in one powerful dashboard.
            </p>
          </div>

          {/* NEW ILLUSTRATION - Dashboard ki jagah */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              marginTop: 40,
            }}
          >
            <BrandIllustration />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;