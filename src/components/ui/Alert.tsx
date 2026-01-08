import React, { useState, useEffect } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoClose?: number; // milliseconds
}

const variantConfig = {
  success: {
    bg: 'bg-green-900/20',
    border: 'border-green-500/30',
    text: 'text-green-300',
    titleText: 'text-green-200',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    text: 'text-red-300',
    titleText: 'text-red-200',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/30',
    text: 'text-yellow-300',
    titleText: 'text-yellow-200',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    titleText: 'text-blue-200',
    icon: 'ℹ',
  },
} as const;

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  dismissible = false,
  onDismiss,
  icon,
  action,
  autoClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  if (!isVisible) return null;

  const config = variantConfig[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={`rounded-lg border ${config.bg} ${config.border} p-4 ${config.text}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          {icon ? (
            icon
          ) : (
            <span className="text-lg font-bold">{config.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${config.titleText}`}>
              {title}
            </h4>
          )}
          <p className={`text-sm ${title ? 'mt-0.5' : ''}`}>
            {message}
          </p>

          {/* Action Button */}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:opacity-75 transition-opacity"
            aria-label="Dismiss alert"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface AlertContainerProps {
  alerts: (AlertProps & { id: string })[];
  onDismiss: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  alerts,
  onDismiss,
}) => {
  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          {...alert}
          onDismiss={() => onDismiss(alert.id)}
        />
      ))}
    </div>
  );
};
