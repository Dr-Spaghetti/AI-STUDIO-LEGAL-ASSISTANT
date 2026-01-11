// ============================================
// Notification Center - UI Component
// ============================================
// Bell icon dropdown with notification list

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  Link2,
  Info,
  ChevronRight,
} from 'lucide-react';
import {
  useNotifications,
  useNotificationPreferences,
  Notification,
  NotificationType,
  NotificationCategory,
} from '../../lib/notifications';

// ============================================
// NOTIFICATION BELL BUTTON
// ============================================

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}

// ============================================
// NOTIFICATION DROPDOWN
// ============================================

function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotifications();
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return <NotificationSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-white font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="p-1 text-gray-400 hover:text-white"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={clearAll}
                className="p-1 text-gray-400 hover:text-white"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1 text-gray-400 hover:text-white"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
                onRemove={() => removeNotification(notification.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION ITEM
// ============================================

function NotificationItem({
  notification,
  onRead,
  onRemove,
}: {
  notification: Notification;
  onRead: () => void;
  onRemove: () => void;
}) {
  const typeStyles: Record<NotificationType, string> = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    emergency: 'bg-red-600 animate-pulse',
  };

  const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
    lead: <User className="w-4 h-4" />,
    appointment: <Calendar className="w-4 h-4" />,
    message: <MessageSquare className="w-4 h-4" />,
    integration: <Link2 className="w-4 h-4" />,
    system: <Info className="w-4 h-4" />,
    emergency: <AlertTriangle className="w-4 h-4" />,
  };

  const timeAgo = formatTimeAgo(notification.timestamp);

  return (
    <div
      className={`group p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-gray-800/30' : ''
      }`}
      onClick={onRead}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            notification.type === 'emergency'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          {categoryIcons[notification.category]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {!notification.read && (
                <span className={`w-2 h-2 rounded-full ${typeStyles[notification.type]}`} />
              )}
              <h4 className="text-white font-medium text-sm truncate">
                {notification.title}
              </h4>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-white transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{notification.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-600 text-xs">{timeAgo}</span>
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                onClick={(e) => e.stopPropagation()}
                className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1"
              >
                {notification.actionLabel || 'View'}
                <ChevronRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================

function NotificationSettings({ onBack }: { onBack: () => void }) {
  const { preferences, setPreferences } = useNotificationPreferences();

  const toggleCategory = (category: keyof typeof preferences.categories) => {
    setPreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category],
      },
    });
  };

  const categoryLabels: Record<keyof typeof preferences.categories, string> = {
    lead: 'New Leads',
    appointment: 'Appointments',
    message: 'Messages',
    integration: 'Integrations',
    system: 'System',
    emergency: 'Emergencies',
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <button onClick={onBack} className="p-1 text-gray-400 hover:text-white">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h3 className="text-white font-semibold">Notification Settings</h3>
      </div>

      {/* Settings */}
      <div className="p-4 space-y-4">
        {/* Master Toggle */}
        <ToggleRow
          label="Notifications Enabled"
          enabled={preferences.enabled}
          onChange={(enabled) => setPreferences({ ...preferences, enabled })}
        />

        <ToggleRow
          label="Sound Effects"
          enabled={preferences.sound}
          onChange={(sound) => setPreferences({ ...preferences, sound })}
          disabled={!preferences.enabled}
        />

        <ToggleRow
          label="Desktop Notifications"
          enabled={preferences.desktop}
          onChange={(desktop) => setPreferences({ ...preferences, desktop })}
          disabled={!preferences.enabled}
        />

        <div className="border-t border-gray-800 pt-4">
          <h4 className="text-gray-400 text-sm font-medium mb-3">Categories</h4>
          <div className="space-y-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <ToggleRow
                key={key}
                label={label}
                enabled={preferences.categories[key as keyof typeof preferences.categories]}
                onChange={() => toggleCategory(key as keyof typeof preferences.categories)}
                disabled={!preferences.enabled}
                small
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  enabled,
  onChange,
  disabled,
  small,
}: {
  label: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <label
      className={`flex items-center justify-between ${disabled ? 'opacity-50' : ''} ${
        small ? 'py-1' : 'py-0'
      }`}
    >
      <span className={`${small ? 'text-gray-400 text-sm' : 'text-white'}`}>{label}</span>
      <button
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          enabled ? 'bg-cyan-500' : 'bg-gray-700'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'left-5' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}

// ============================================
// TOAST NOTIFICATION
// ============================================

export function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds (except emergencies)
    if (notification.type !== 'emergency') {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const bgColors: Record<NotificationType, string> = {
    info: 'bg-blue-500/10 border-blue-500/30',
    success: 'bg-green-500/10 border-green-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    emergency: 'bg-red-600/20 border-red-500/50',
  };

  const textColors: Record<NotificationType, string> = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    emergency: 'text-red-400',
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm animate-slide-in ${
        bgColors[notification.type]
      }`}
    >
      <div className={textColors[notification.type]}>
        {notification.type === 'emergency' ? (
          <AlertTriangle className="w-5 h-5" />
        ) : notification.type === 'success' ? (
          <Check className="w-5 h-5" />
        ) : notification.type === 'error' ? (
          <X className="w-5 h-5" />
        ) : (
          <Info className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${textColors[notification.type]}`}>
          {notification.title}
        </h4>
        <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
      </div>
      <button onClick={onDismiss} className="text-gray-500 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================
// TOAST CONTAINER
// ============================================

export function ToastContainer() {
  const { notifications } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  useEffect(() => {
    // Show new notifications as toasts
    const recentNotifications = notifications.filter(
      (n) => !n.read && Date.now() - n.timestamp.getTime() < 5000
    );
    setVisibleToasts(recentNotifications.slice(0, 3));
  }, [notifications]);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleToasts.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() =>
            setVisibleToasts((prev) => prev.filter((n) => n.id !== notification.id))
          }
        />
      ))}
    </div>
  );
}

// ============================================
// UTILITIES
// ============================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default NotificationBell;
