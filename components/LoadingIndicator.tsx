import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} border-2 border-[#00FFA3]/30 border-t-[#00FFA3] rounded-full animate-spin`} />
      {message && <span className="text-sm text-gray-400">{message}</span>}
    </div>
  );
};

interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Initializing AI Receptionist...',
}) => {
  return (
    <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-3 border-[#00FFA3]/30 border-t-[#00FFA3] rounded-full animate-spin shadow-[0_0_30px_rgba(0,255,163,0.3)]" />
        <p className="text-white font-medium text-center">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
