// src/components/common/LoadingScreen.jsx
import React from 'react';
import logoImg from '../../assets/logo/logo.png';

const LoadingScreen = ({
  message = 'Preparing your workspace...',
  submessage = 'Synchronizing real-time projects, tasks & permissions',
}) => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#090D16] select-none overflow-hidden transition-all duration-300">
      
      {/* ── Ambient Background Lighting (Linear / Vercel style) ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.10) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Central Branded Card ── */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Animated Brand Mark Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Subtle spinning glow ring */}
          <div
            className="absolute -inset-3 rounded-3xl opacity-60 animate-spin-slow pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0 300deg, rgba(99, 102, 241, 0.8) 360deg)',
              filter: 'blur(4px)',
            }}
          />

          {/* Logo Badge */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.03] p-3.5 border border-white/15 shadow-2xl backdrop-blur-xl flex items-center justify-center">
            <img
              src={logoImg}
              alt="WorkSphere"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xl font-bold tracking-tight text-white font-sans">
            WorkSphere
          </span>
          <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            SaaS
          </span>
        </div>

        {/* Dynamic Loading Message */}
        <h2 className="text-sm font-medium text-slate-200 tracking-tight mt-1 mb-1">
          {message}
        </h2>
        <p className="text-xs text-slate-400 font-normal leading-relaxed max-w-[280px] mb-8">
          {submessage}
        </p>

        {/* High-End Linear Gradient Progress Indicator */}
        <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden relative p-[1px] border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 animate-ws-shimmer"
            style={{
              width: '100%',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        {/* Micro Security Footnote */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Encrypted Session • JWT Verified</span>
        </div>
      </div>

      {/* Embedded Animations */}
      <style>{`
        @keyframes ws-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-ws-shimmer {
          animation: ws-shimmer 2s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
