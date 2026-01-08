import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  variant = 'primary',
  trend = 'neutral',
}) => {
  const variantClasses = {
    primary: 'border-[#00FFA3]/30 bg-[#00FFA3]/5',
    success: 'border-green-500/30 bg-green-900/5',
    warning: 'border-yellow-500/30 bg-yellow-900/5',
    danger: 'border-red-500/30 bg-red-900/5',
  };

  const iconColorClasses = {
    primary: 'text-[#00FFA3]',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  };

  const trendColorClasses = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div
      className={`rounded-lg border p-6 transition-all hover:shadow-lg ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-400 mb-2 truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-white truncate">
              {value}
            </h3>
            {change !== undefined && (
              <span
                className={`text-sm font-medium whitespace-nowrap ${trendColorClasses[trend]}`}
              >
                <span className="mr-1">{trendIcon[trend]}</span>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-lg bg-[#16181D] flex items-center justify-center ${iconColorClasses[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
