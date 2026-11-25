import React from 'react';
import { Loader2 } from 'lucide-react';
import logoImg from '../../assets/logo/logo.png';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return (
    <Loader2
      className={`animate-spin text-indigo-600 ${sizeMap[size] || sizeMap.md} ${className}`}
    />
  );
};

export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] w-full p-8 rounded-2xl select-none animate-in fade-in duration-200">
      {/* Official Brand Logo */}
      <div className="mb-5 animate-ws-logo-in flex items-center justify-center">
        <img
          src={logoImg}
          alt="WorkSphere"
          className="h-16 sm:h-20 w-auto max-w-[260px] object-contain drop-shadow-xs"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Elegant Indigo/Violet Animated Progress Bar */}
      <div className="w-52 h-1.5 bg-slate-200/80 rounded-full overflow-hidden relative shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 animate-ws-bar"
          style={{ width: '45%' }}
        />
      </div>

      {/* Clean Loading Label */}
      <p className="text-xs font-semibold text-slate-400 tracking-widest mt-3.5 uppercase">
        {text}
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
          0%   { opacity: 0; transform: translateY(8px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-ws-logo-in {
          animation: ws-logo-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs max-w-md mx-auto my-6">
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100/80">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4 font-normal">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageLoader;

