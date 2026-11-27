// src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

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
    <AuthSplitLayout
      title="Welcome back!"
      subtitle="You can sign in to access your existing WorkSphere workspace."
    >
      <div className="space-y-5">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h1>
        </div>

        {/* Google Sign-In */}
        <div className="w-full flex justify-center max-w-full overflow-hidden [&_iframe]:!max-w-full [&>div]:!max-w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            theme="outline"
            size="large"
            text="signin_with"
            width="280"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-[13px] bg-white border border-slate-200 rounded-full focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3 text-xs sm:text-[13px] bg-white border border-slate-200 rounded-full focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between px-1 pt-0.5">
            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-purple-600 border-slate-300 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-[13px] rounded-full shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Bottom Switch */}
        <p className="text-center text-xs text-slate-500 pt-1">
          New here?{' '}
          <Link
            to="/register"
            className="text-purple-700 font-semibold hover:text-purple-900 hover:underline transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default Login;
