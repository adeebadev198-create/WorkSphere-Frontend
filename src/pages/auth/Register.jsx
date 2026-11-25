// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import logoImg from '../../assets/logo/logo.png';

const Register = () => {
  const navigate = useNavigate();
  const { register, startAuthTransition, endAuthTransition } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Password Strength Meter
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', score: 0, color: 'bg-slate-200' };
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
      // 1. Complete existing registration API request
      await register(fullName, email, password, confirmPassword);

      // 2. Display full-screen WorkSphere loading screen smoothly
      startAuthTransition(
        'Provisioning your enterprise workspace...',
        'Creating isolated database schema & generating administrative credentials...'
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
      <div className="w-full max-w-6xl min-h-[700px] rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden flex flex-col lg:flex-row relative z-10">
        
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
              <p className="text-[10px] text-indigo-300 font-medium">Enterprise Workspace Provisioning</p>
            </div>
          </div>

          {/* Centerpiece: Interactive Features Matrix Card */}
          <div className="relative z-10 my-auto py-6">
            <div className="p-6 rounded-2xl bg-white/[0.05] border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">Included With Your Account</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Full Suite
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { title: 'Isolated Workspaces', desc: 'Separate environments for departments and teams.' },
                  { title: 'Interactive Kanban', desc: 'Fluid drag & drop task progression with cycle checks.' },
                  { title: 'Permission Matrix', desc: 'Strict Owner, Manager & Member security enforcement.' },
                  { title: 'CSV & PDF Export', desc: 'Instant audit and velocity export for leadership.' },
                ].map((feat, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{feat.title}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspiring Headline */}
            <div className="mt-8 space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Join thousands of teams building<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  the future of modern software.
                </span>
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Get started in seconds with an isolated workspace, automatic sprint tracking, and real-time MongoDB data persistence.
              </p>
            </div>
          </div>

          {/* Bottom Security / Trust Badges */}
          <div className="relative z-10 flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-tenant Isolation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Zero Dummy Data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Free Starter Tier</span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT PANEL: CLEAN, ELEGANT REGISTRATION FORM
        ══════════════════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 xl:p-12 bg-white">
          
          <div className="max-w-md w-full mx-auto my-auto space-y-5">
            
            {/* Header with Centered Official Logo on Mobile */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-5">
              <div className="lg:hidden mb-4">
                <img
                  src={logoImg}
                  alt="WorkSphere - Plan • Collaborate • Achieve"
                  className="h-10 sm:h-12 w-auto max-w-[220px] object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
                Start managing projects with role-based access control.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 text-slate-900 placeholder-slate-400 transition-all font-normal"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 text-slate-900 placeholder-slate-400 transition-all font-normal"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
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

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Password Strength:</span>
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 text-slate-900 placeholder-slate-400 transition-all font-normal"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Enterprise Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Navigation to Login */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 font-normal">
                Already have an enterprise account?{' '}
                <Link
                  to="/login"
                  className="text-indigo-600 font-bold hover:text-indigo-800 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 pt-6">
            &copy; {new Date().getFullYear()} WorkSphere. By creating an account you agree to our Terms of Service.
          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;
