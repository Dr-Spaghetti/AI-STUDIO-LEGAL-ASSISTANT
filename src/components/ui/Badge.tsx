import React from 'react';

type BadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'
  | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantClasses = {
    success: 'bg-green-900/30 text-green-400 border border-green-500/30',
    error: 'bg-red-900/30 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
    info: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
    default: 'bg-gray-900/30 text-gray-300 border border-gray-500/30',
    primary: 'bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/50',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
