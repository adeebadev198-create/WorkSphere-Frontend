// src/components/common/LoadingScreen.jsx
import React, { useState, useEffect } from 'react';
import logoImg from '../../assets/logo/logo.png';

/**
 * WorkSphere Premium Loading Screen
 * Prominent branding with clean indigo/violet progress bar
 */
const LoadingScreen = ({ message, submessage, minDuration = 700, show = true }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();

    if (!show) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setVisible(false), 300);
      }, remaining);
      return () => clearTimeout(timer);
    }
  }, [show, minDuration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8FAFC] select-none transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Official Brand Logo — Large, High-Res & Prominent */}
      <div className="mb-8 animate-ws-logo-in flex items-center justify-center">
        <img
          src={logoImg}
          alt="WorkSphere - Plan • Collaborate • Achieve"
          className="h-24 sm:h-28 md:h-32 w-auto max-w-[340px] sm:max-w-[420px] object-contain drop-shadow-sm"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Elegant Indigo/Violet Animated Progress Bar */}
      <div className="w-64 h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-ws-bar"
          style={{ width: '45%' }}
        />
      </div>

      {/* Clean Loading Label */}
      <p className="text-xs font-semibold text-slate-400 tracking-widest mt-4 uppercase">
        Loading...
      </p>

      <style>{`
        @keyframes ws-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(110%); }
          100% { transform: translateX(250%); }
        }
        .animate-ws-bar {
          animation: ws-bar 1.3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes ws-logo-in {
          0%   { opacity: 0; transform: translateY(10px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-ws-logo-in {
          animation: ws-logo-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
