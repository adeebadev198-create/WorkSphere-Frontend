// src/components/common/LoadingScreen.jsx
import React from 'react';
import logoImg from '../../assets/logo/logo.png';

const LoadingScreen = ({ message, submessage }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8FAFC] select-none transition-opacity duration-300">
      
      {/* Official Brand Logo */}
      <div className="mb-6">
        <img
          src={logoImg}
          alt="WorkSphere"
          className="h-11 w-auto max-w-[200px] object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Small Elegant Indigo/Violet Loading Bar */}
      <div className="w-48 h-1 bg-slate-200/80 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-ws-bar"
          style={{ width: '40%' }}
        />
      </div>

      {/* Clean Loading Label */}
      <p className="text-xs font-medium text-slate-400 tracking-wide mt-3">
        Loading...
      </p>

      {/* Clean, Subtle Keyframe Animation */}
      <style>{`
        @keyframes ws-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(260%);
          }
        }
        .animate-ws-bar {
          animation: ws-bar 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
