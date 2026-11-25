// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  KanbanSquare,
  Sparkles,
  Layers,
  Zap,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import logoImg from '../../assets/logo/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin, startAuthTransition, endAuthTransition } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Restore saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('ws_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please provide your email and password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Complete existing login API request
      await login(email.trim(), password);

      if (rememberMe) {
        localStorage.setItem('ws_remember_email', email.trim());
      } else {
        localStorage.removeItem('ws_remember_email');
      }

      // 2. Display full-screen WorkSphere loading screen smoothly
      startAuthTransition(
        'Entering your workspace...',
        'Authenticating session & synchronizing project intelligence...'
      );

      setTimeout(() => {
        navigate('/dashboard');
        setTimeout(() => {
          endAuthTransition();
        }, 400);
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      startAuthTransition(
        'Authenticating with Google...',
        'Loading workspace profile & active permissions...'
      );
      setTimeout(() => {
        navigate('/dashboard');
        setTimeout(() => {
          endAuthTransition();
        }, 400);
      }, 700);
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login was cancelled or encountered an error.');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      
      {/* Ambient Logo Theme Orbs */}
      <div
        className="fixed -top-40 -left-40 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="fixed -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.10) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Outer Shell Container ── */}
      <div className="w-full max-w-6xl min-h-[660px] rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* ══════════════════════════════════════════════════
            LEFT PANEL: BRAND VISUAL & ABSTRACT WORKSPACE
        ══════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-12 relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] border-r border-slate-200/40 text-white">
          
          {/* Ambient Lighting Orbs */}
          <div
            className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.20) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 px-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              <img src={logoImg} alt="WorkSphere" className="h-6 w-auto object-contain brightness-0 invert" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">WorkSphere</span>
              <p className="text-[10px] text-indigo-300 font-medium">Enterprise Project OS</p>
            </div>
          </div>

          {/* Centerpiece: Linear / Stripe Style Floating Interface Card */}
          <div className="relative z-10 my-auto py-8">
            <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
              
              {/* Header inside mini-card */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">Sprint Velocity • Platform v2.0</span>
                </div>
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  On Track
                </span>
              </div>

              {/* Progress metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Sprint Completion</span>
                  <span className="font-bold text-white">82%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[82%]" />
                </div>
              </div>

              {/* Mini task rows */}
              <div className="space-y-2 pt-1">
                {[
                  { name: 'SRS 4.4 Role Permission Matrix', status: 'Approved', tag: 'High' },
                  { name: 'Real-time MongoDB Atlas Telemetry', status: 'Active', tag: 'Critical' },
                  { name: 'Branded SaaS Loading Screen', status: 'Done', tag: 'Feature' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate text-[11px]">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 rounded bg-white/5">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspiring Headline */}
            <div className="mt-8 space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Manage projects. Lead teams.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  Deliver exceptional outcomes.
                </span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Designed for high-performance teams who value speed, clarity, and precision workflow execution.
              </p>
            </div>
          </div>

          {/* Bottom Security / Trust Badges */}
          <div className="relative z-10 flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>JWT Bearer 7d</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>MongoDB Real-time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Role-Based Access</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT PANEL: CLEAN, ELEGANT LOGIN FORM
        ══════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 xl:p-12 bg-white">
          
          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            
            {/* Header with Centered Official Logo on Mobile */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-6">
              <div className="lg:hidden mb-4">
                <img
                  src={logoImg}
                  alt="WorkSphere - Plan • Collaborate • Achieve"
                  className="h-10 sm:h-12 w-auto max-w-[220px] object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
                Enter your credentials to access your collaborative workspace.
              </p>
            </div>

            {/* Real Google OAuth Login */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="pill"
                theme="outline"
                size="large"
                text="signin_with"
                width="380"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                or email sign in
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 text-slate-900 placeholder-slate-400 transition-all font-normal"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 text-slate-900 placeholder-slate-400 transition-all font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Click Quick Demo Access Pills */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Demo Access
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Click to test role</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@worksphere.com');
                    setPassword('Password123');
                  }}
                  className="px-2 py-2 text-center rounded-xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 font-semibold text-[11px] transition-all cursor-pointer"
                >
                  👑 Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('manager@worksphere.com');
                    setPassword('Password123');
                  }}
                  className="px-2 py-2 text-center rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-blue-700 font-semibold text-[11px] transition-all cursor-pointer"
                >
                  📋 Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('member@worksphere.com');
                    setPassword('Password123');
                  }}
                  className="px-2 py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-all cursor-pointer"
                >
                  👤 Member
                </button>
              </div>
            </div>

            {/* Navigation to Register */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 font-normal">
                Don't have an enterprise account?{' '}
                <Link
                  to="/register"
                  className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors"
                >
                  Create workspace
                </Link>
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 pt-6">
            &copy; {new Date().getFullYear()} WorkSphere. Protected by enterprise-grade TLS & JWT.
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
