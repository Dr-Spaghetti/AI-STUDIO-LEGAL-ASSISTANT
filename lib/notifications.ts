// ============================================
// Notification System - React Hooks & Utilities
// ============================================
// Real-time notifications for leads, appointments, emergencies

import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ============================================
// TYPES
// ============================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'emergency';

export type NotificationCategory =
  | 'lead'
  | 'appointment'
  | 'message'
  | 'integration'
  | 'system'
  | 'emergency';

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  categories: {
    lead: boolean;
    appointment: boolean;
    message: boolean;
    integration: boolean;
    system: boolean;
    emergency: boolean;
  };
}

// ============================================
// NOTIFICATION STORE
// ============================================

class NotificationStore {
  private notifications: Notification[] = [];
  private listeners: Set<() => void> = new Set();
  private preferences: NotificationPreferences = {
    enabled: true,
    sound: true,
    desktop: true,
    categories: {
      lead: true,
      appointment: true,
      message: true,
      integration: true,
      system: true,
      emergency: true,
    },
  };

  constructor() {
    // Load preferences from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification_preferences');
      if (saved) {
        try {
          this.preferences = JSON.parse(saved);
        } catch (e) {
          // Use defaults
        }
      }
    }
  }

  getNotifications(): Notification[] {
    return this.notifications.filter(
      (n) => !n.expiresAt || n.expiresAt > new Date()
    );
  }

  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  }

  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  setPreferences(prefs: NotificationPreferences): void {
    this.preferences = prefs;
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification_preferences', JSON.stringify(prefs));
    }
    this.notify();
  }

  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    // Check if category is enabled
    if (!this.preferences.enabled) return notification as Notification;
    if (!this.preferences.categories[notification.category]) return notification as Notification;

    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);

    // Limit to 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // Play sound
    if (this.preferences.sound && notification.type !== 'info') {
      this.playSound(notification.type);
    }

    // Show desktop notification
    if (this.preferences.desktop && typeof window !== 'undefined') {
      this.showDesktopNotification(newNotification);
    }

    this.notify();
    return newNotification;
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.notify();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach((n) => (n.read = true));
    this.notify();
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  clear(): void {
    this.notifications = [];
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  private playSound(type: NotificationType): void {
    // In a real implementation, play actual sounds
    // For now, just log
    console.log(`[Notification Sound] ${type}`);
  }

  private async showDesktopNotification(notification: Notification): Promise<void> {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      const icon = notification.type === 'emergency' ? '🚨' : '⚖️';
      new Notification(`${icon} ${notification.title}`, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }
}

// Singleton instance
export const notificationStore = new NotificationStore();

// ============================================
// REACT HOOKS
// ============================================

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setNotifications(notificationStore.getNotifications());
      setUnreadCount(notificationStore.getUnreadCount());
    };

    update();
    return notificationStore.subscribe(update);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      return notificationStore.add(notification);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    notificationStore.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationStore.markAllAsRead();
  }, []);

  const removeNotification = useCallback((id: string) => {
    notificationStore.remove(id);
  }, []);

  const clearAll = useCallback(() => {
    notificationStore.clear();
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}

export function useNotificationPreferences() {
  const [preferences, setPreferencesState] = useState<NotificationPreferences>(
    notificationStore.getPreferences()
  );

  const setPreferences = useCallback((prefs: NotificationPreferences) => {
    notificationStore.setPreferences(prefs);
    setPreferencesState(prefs);
  }, []);

  return { preferences, setPreferences };
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

export function notifyNewLead(lead: {
  name: string;
  caseType: string;
  score: number;
  tier: string;
}) {
  const type: NotificationType = lead.tier === 'hot' ? 'success' : 'info';

  return notificationStore.add({
    type,
    category: 'lead',
    title: 'New Lead',
    message: `${lead.name} - ${lead.caseType} (Score: ${lead.score})`,
    actionUrl: `/leads/${lead.name}`,
    actionLabel: 'View Lead',
    metadata: lead,
  });
}

export function notifyAppointmentScheduled(appointment: {
  leadName: string;
  dateTime: Date;
}) {
  return notificationStore.add({
    type: 'success',
    category: 'appointment',
    title: 'Appointment Scheduled',
    message: `${appointment.leadName} booked for ${appointment.dateTime.toLocaleString()}`,
    actionLabel: 'View Calendar',
  });
}

export function notifyAppointmentReminder(appointment: {
  leadName: string;
  dateTime: Date;
  minutesUntil: number;
}) {
  return notificationStore.add({
    type: 'warning',
    category: 'appointment',
    title: 'Upcoming Appointment',
    message: `${appointment.leadName} in ${appointment.minutesUntil} minutes`,
    expiresAt: appointment.dateTime,
  });
}

export function notifyEmergency(emergency: {
  leadName: string;
  type: string;
  description: string;
}) {
  return notificationStore.add({
    type: 'emergency',
    category: 'emergency',
    title: '🚨 EMERGENCY DETECTED',
    message: `${emergency.leadName}: ${emergency.type} - ${emergency.description}`,
    actionLabel: 'View Details',
  });
}

export function notifyIntegrationError(integration: {
  name: string;
  error: string;
}) {
  return notificationStore.add({
    type: 'error',
    category: 'integration',
    title: `${integration.name} Error`,
    message: integration.error,
    actionUrl: '/settings/integrations',
    actionLabel: 'Fix Now',
  });
}

export function notifyMessage(message: {
  from: string;
  preview: string;
  leadId: string;
}) {
  return notificationStore.add({
    type: 'info',
    category: 'message',
    title: `Message from ${message.from}`,
    message: message.preview.substring(0, 100),
    actionUrl: `/leads/${message.leadId}`,
    actionLabel: 'Reply',
  });
}
