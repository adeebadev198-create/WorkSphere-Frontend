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
      setError('Please enter your work email and password.');
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

      startAuthTransition(
        'Entering your workspace...',
        'Preparing your projects and team updates...'
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
        'Signing in with Google...',
        'Loading your workspace...'
      );
      setTimeout(() => {
        navigate('/dashboard');
        setTimeout(() => {
          endAuthTransition();
        }, 400);
      }, 700);
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or could not be completed.');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF8FF] px-4 py-8 sm:px-6 font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Subtle Purple Ambient Glow */}
      <div
        className="fixed -top-40 left-1/2 -translate-x-1/2 w-[36rem] h-[24rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.14) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="fixed -bottom-40 right-1/4 w-[28rem] h-[24rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.10) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Centered VIP Auth Card */}
      <div className="w-full max-w-[440px] rounded-3xl bg-white border border-purple-100/90 shadow-[0_24px_64px_-16px_rgba(91,33,182,0.14)] overflow-hidden relative z-10">
        {/* Signature Purple Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#5B21B6] via-[#7C3AED] to-[#A855F7]" />

        <div className="p-7 sm:p-9 space-y-6">
          {/* Brand Logo & Heading */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-purple-50/70 border border-purple-100/80 shadow-xs">
              <img
                src={logoImg}
                alt="WorkSphere"
                className="h-9 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
              Sign in to your WorkSphere workspace
            </p>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              shape="pill"
              theme="outline"
              size="large"
              text="signin_with"
              width="360"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200/80" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200/80" />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
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

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-purple-600 border-slate-300 cursor-pointer"
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-semibold text-xs sm:text-[13px] rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-1">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-purple-700 font-semibold hover:text-purple-900 hover:underline transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <p className="mt-6 text-[11px] text-slate-400 relative z-10">
        &copy; {new Date().getFullYear()} WorkSphere. All rights reserved.
      </p>
    </div>
  );
};

export default Login;
