// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthShowcase from '../../components/auth/AuthShowcase';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import logoImg from '../../assets/logo/logo.png';

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

  // Dynamic Password Strength Meter
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8FF] p-4 sm:p-6 lg:p-8 font-sans selection:bg-purple-600 selection:text-white relative overflow-hidden">
      {/* Subtle Purple & White Ambient Glow */}
      <div
        className="fixed -top-44 -left-44 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="fixed -bottom-44 -right-44 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(109, 40, 217, 0.10) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Main Split Card */}
      <div className="w-full max-w-6xl min-h-[680px] rounded-3xl bg-white border border-purple-100/90 shadow-[0_24px_70px_-15px_rgba(91,33,182,0.12)] overflow-hidden flex flex-col lg:flex-row relative z-10">
        {/* Left Purple & White Brand Showcase */}
        <AuthShowcase mode="register" />

        {/* Right Pure White Form Panel */}
        <div className="w-full lg:w-[52%] flex flex-col justify-between p-7 sm:p-10 xl:p-14 bg-white">
          <div className="max-w-[400px] w-full mx-auto my-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="lg:hidden mb-5 inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-purple-50/70 border border-purple-100">
                <img
                  src={logoImg}
                  alt="WorkSphere"
                  className="h-8 w-auto object-contain"
                />
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  WorkSphere
                </span>
              </div>
              <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-semibold tracking-wide mb-3">
                Get Started
              </span>
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-normal">
                Join your team and start collaborating in seconds.
              </p>
            </div>

            {/* Google Sign-Up */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="pill"
                theme="outline"
                size="large"
                text="signup_with"
                width="380"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200/80" />
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                or register with email
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

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
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

                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-[13px] bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#4C1D95] text-white font-semibold text-xs sm:text-[13px] rounded-xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-purple-700 font-semibold hover:text-purple-900 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 pt-6">
            &copy; {new Date().getFullYear()} WorkSphere Inc. By creating an account you agree to our Terms &amp; Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
