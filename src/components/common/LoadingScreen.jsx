// src/components/common/LoadingScreen.jsx
import React from 'react';

/**
 * WorkSphere Professional Minimal Loading Indicator
 * Clean, lightweight, and unobtrusive.
 */
const LoadingScreen = ({ message = 'Loading...', submessage = '' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin mb-3" />
      <p className="text-xs font-semibold text-slate-700 tracking-wide">
        {message}
      </p>
      {submessage && (
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs text-center">
          {submessage}
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;
