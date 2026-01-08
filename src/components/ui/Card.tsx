import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerAction,
  variant = 'default',
}) => {
  const variantClasses = {
    default:
      'bg-[#16181D] border border-[#2D3139] hover:border-[#00FFA3]/30 transition-colors',
    elevated: 'bg-[#1E2128] border border-[#2D3139] shadow-lg',
    bordered: 'bg-transparent border-2 border-[#00FFA3]/30',
  };

  return (
    <div className={`rounded-xl p-6 ${variantClasses[variant]} ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-white">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {title && <div className="border-b border-[#2D3139] mb-4" />}
      <div>{children}</div>
    </div>
  );
};
