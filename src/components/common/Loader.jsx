import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  return (
    <Loader2
      className={`animate-spin text-[#7C3AED] ${sizeMap[size] || sizeMap.md} ${className}`}
    />
  );
};

export const PageLoader = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] w-full p-8">
      <Spinner size="lg" />
      <p className="mt-3 text-xs font-semibold text-slate-500 tracking-wide">{text}</p>
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
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageLoader;

