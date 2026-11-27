// src/pages/auth/Register.jsx
import React, { useState } from 'react';
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
  User,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin, startAuthTransition, endAuthTransition } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', score: 0, color: 'bg-slate-200', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 1, color: 'bg-rose-500', width: '33%' };
    if (score <= 4) return { label: 'Good', score: 2, color: 'bg-amber-500', width: '66%' };
    return { label: 'Strong', score: 3, color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(fullName.trim(), email.trim(), password, confirmPassword);

      startAuthTransition(
        'Setting up your account...',
        'Preparing your collaborative workspace...'
      );

      setTimeout(() => {
        navigate('/dashboard');
        setTimeout(() => {
          endAuthTransition();
        }, 400);
      }, 800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      startAuthTransition(
        'Creating your account...',
        'Preparing your collaborative workspace...'
      );
      setTimeout(() => {
        navigate('/dashboard');
        setTimeout(() => {
          endAuthTransition();
        }, 400);
      }, 700);
    } catch (err) {
      setError(err.message || 'Google sign-up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-up was cancelled or could not be completed.');
  };

  return (
    <AuthSplitLayout
      title="Join WorkSphere!"
      subtitle="Create your account to organize projects and collaborate with your team."
    >
      <div className="space-y-4">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
        </div>

        {/* Google Sign-Up */}
        <div className="w-full flex justify-center max-w-full overflow-hidden [&_iframe]:!max-w-full [&>div]:!max-w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            theme="outline"
            size="large"
            text="signup_with"
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
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              autoComplete="name"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-[13px] bg-white border border-slate-200 rounded-full focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>

          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Work email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-[13px] bg-white border border-slate-200 rounded-full focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>

          <div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-2.5 text-xs sm:text-[13px] bg-white border border-slate-200 rounded-full focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
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

            {password.length > 0 && (
              <div className="mt-1.5 px-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Password strength</span>
                  <span className="font-semibold text-slate-700">{strength.label}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-[13px] bg-white border border-slate-200 rounded-full focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-[13px] rounded-full shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Bottom Switch */}
        <p className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-purple-700 font-semibold hover:text-purple-900 hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default Register;
