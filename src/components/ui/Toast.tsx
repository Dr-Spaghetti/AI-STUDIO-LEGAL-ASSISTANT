import React, { useEffect } from 'react';
import { Toast as ToastType } from '../../types';

interface ToastProps extends ToastType {
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration, onRemove }) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => onRemove(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const bgColor = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-blue-500/10 border-blue-500/30'
  }[type];

  const textColor = {
    success: 'text-green-300',
    error: 'text-red-300',
    warning: 'text-yellow-300',
    info: 'text-blue-300'
  }[type];

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }[type];

  return (
    <div
      className={`${bgColor} border rounded-lg p-4 mb-3 flex items-start gap-3 animate-fade-in-down`}
      role="alert"
      aria-live="polite"
    >
      <span className={`${iconColor} text-xl flex-shrink-0`}>
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '!'}
        {type === 'info' && 'ⓘ'}
      </span>
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className={`${textColor} hover:opacity-70 flex-shrink-0 text-lg leading-none`}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-sm max-h-screen overflow-y-auto"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
