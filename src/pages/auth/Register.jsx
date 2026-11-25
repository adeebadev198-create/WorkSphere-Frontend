// src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo/logo.png';
import { AlertCircle, Lock, Mail, User, Loader2, Eye, EyeOff, KanbanSquare, ShieldCheck, LayoutDashboard, BarChart3, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(fullName, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
          background: 'white'
        }}
      >
        {/* ══════════════════════════════
            LEFT PANE — white form
        ══════════════════════════════ */}
        <div
          className="w-full lg:w-[45%] flex flex-col bg-white"
          style={{ borderRight: '1px solid #F1F5F9' }}
        >
          <div className="flex-1 flex items-center justify-center" style={{ padding: '40px 48px' }}>
            <div style={{ width: '100%', maxWidth: 360 }}>
              
              {/* Official Brand Logo */}
              <div className="mb-6">
                <Link to="/" className="inline-block transition-opacity hover:opacity-90">
                  <img
                    src={logoImg}
                    alt="WorkSphere - Plan • Collaborate • Achieve"
                    className="h-11 w-auto max-w-[180px] object-contain"
                  />
                </Link>
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Create an account</h1>
              <p className="text-sm text-slate-500 mb-8">Get started with your collaborative workspace.</p>

              {/* Error banner */}
              {error && (
                <div className="mb-6 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="admin@worksphere.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl font-semibold shadow-md shadow-indigo-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center justify-center gap-2 py-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Link */}
              <p className="mt-8 text-xs text-center text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
          
          {/* Footer Text */}
          <div className="pb-6 text-center text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} WorkSphere Inc. All rights reserved. Secure enterprise session.
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT PANE — Dark Purple Gradient
        ══════════════════════════════ */}
        <div
          className="hidden lg:flex lg:w-[55%] flex-col justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', // Darker premium purple
            padding: '48px',
            position: 'relative',
          }}
        >
          {/* Ambient glow blobs */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.5), transparent 70%)', pointerEvents: 'none' }} />

          <div className="relative z-10">
            {/* Small pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-indigo-200 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Enterprise Project & Team Management
            </div>

            {/* Headline */}
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              Coordinate projects, teams & deliverables from one central hub.
            </h2>
            <p className="text-sm text-indigo-100/70 leading-relaxed mb-10 max-w-md">
              WorkSphere centralizes multi-workspace management, drag-and-drop Kanban execution, activity audits, and workload intelligence.
            </p>

            {/* Feature Grid (2x2) */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: KanbanSquare, title: 'Interactive Kanban', desc: 'Drag & drop workflow status updates with real-time database sync.' },
                { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Enforced Owner, Project Manager & Team Member permissions.' },
                { icon: LayoutDashboard, title: 'Isolated Workspaces', desc: 'Departmental multi-tenancy with secure member invitations.' },
                { icon: BarChart3, title: 'Live Analytics & CSV', desc: 'Automated project progress calculation and report exports.' },
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-indigo-300 mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-[11px] text-indigo-200/60 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Trust Badges */}
            <div className="mt-10 flex items-center gap-6 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> MongoDB Data Persistence
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-200">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> JWT Bearer Security
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;