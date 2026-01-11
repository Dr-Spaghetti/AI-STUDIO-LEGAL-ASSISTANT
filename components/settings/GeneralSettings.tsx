// ============================================
// General Settings - Tenant Configuration
// ============================================
// Basic firm settings and preferences

import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Clock,
  Bell,
  Shield,
  Save,
  MapPin,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface TenantSettings {
  firm_name: string;
  website: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  timezone: string;
  business_hours: {
    start: string;
    end: string;
    days: string[];
  };
  notifications: {
    new_lead_email: boolean;
    new_lead_sms: boolean;
    emergency_alerts: boolean;
    daily_summary: boolean;
  };
  compliance: {
    disclaimer_text: string;
    privacy_policy_url: string;
    terms_url: string;
  };
}

interface Props {
  tenantId: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_SETTINGS: TenantSettings = {
  firm_name: 'Smith & Associates',
  website: 'https://smithlaw.com',
  phone: '(555) 123-4567',
  email: 'contact@smithlaw.com',
  address: {
    street: '123 Legal Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90001',
  },
  timezone: 'America/Los_Angeles',
  business_hours: {
    start: '09:00',
    end: '17:00',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  notifications: {
    new_lead_email: true,
    new_lead_sms: true,
    emergency_alerts: true,
    daily_summary: false,
  },
  compliance: {
    disclaimer_text: 'This is an AI assistant. It is not a lawyer and cannot provide legal advice.',
    privacy_policy_url: 'https://smithlaw.com/privacy',
    terms_url: 'https://smithlaw.com/terms',
  },
};

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ============================================
// COMPONENT
// ============================================

export function GeneralSettings({ tenantId }: Props) {
  const [settings, setSettings] = useState<TenantSettings>(MOCK_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSettings = (updates: Partial<TenantSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    const days = settings.business_hours.days.includes(day)
      ? settings.business_hours.days.filter((d) => d !== day)
      : [...settings.business_hours.days, day];
    updateSettings({
      business_hours: { ...settings.business_hours, days },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">General Settings</h2>
          <p className="text-gray-400 mt-1">Configure your firm's basic information</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firm Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Firm Information</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Firm Name</label>
              <input
                type="text"
                value={settings.firm_name}
                onChange={(e) => updateSettings({ firm_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Website</label>
              <input
                type="url"
                value={settings.website}
                onChange={(e) => updateSettings({ website: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => updateSettings({ phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSettings({ email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Address</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Street Address</label>
              <input
                type="text"
                value={settings.address.street}
                onChange={(e) => updateSettings({
                  address: { ...settings.address, street: e.target.value },
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">City</label>
                <input
                  type="text"
                  value={settings.address.city}
                  onChange={(e) => updateSettings({
                    address: { ...settings.address, city: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">State</label>
                <input
                  type="text"
                  value={settings.address.state}
                  onChange={(e) => updateSettings({
                    address: { ...settings.address, state: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">ZIP</label>
                <input
                  type="text"
                  value={settings.address.zip}
                  onChange={(e) => updateSettings({
                    address: { ...settings.address, zip: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Business Hours</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSettings({ timezone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Open</label>
                <input
                  type="time"
                  value={settings.business_hours.start}
                  onChange={(e) => updateSettings({
                    business_hours: { ...settings.business_hours, start: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Close</label>
                <input
                  type="time"
                  value={settings.business_hours.end}
                  onChange={(e) => updateSettings({
                    business_hours: { ...settings.business_hours, end: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Days Open</label>
              <div className="flex gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      settings.business_hours.days.includes(day)
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            {Object.entries({
              new_lead_email: 'Email on new leads',
              new_lead_sms: 'SMS on new leads',
              emergency_alerts: 'Emergency alerts',
              daily_summary: 'Daily summary email',
            }).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-white">{label}</span>
                <button
                  onClick={() => updateSettings({
                    notifications: {
                      ...settings.notifications,
                      [key]: !settings.notifications[key as keyof typeof settings.notifications],
                    },
                  })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    settings.notifications[key as keyof typeof settings.notifications]
                      ? 'bg-cyan-500'
                      : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.notifications[key as keyof typeof settings.notifications]
                        ? 'left-5'
                        : 'left-0.5'
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Compliance */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Compliance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">AI Disclaimer Text</label>
              <textarea
                value={settings.compliance.disclaimer_text}
                onChange={(e) => updateSettings({
                  compliance: { ...settings.compliance, disclaimer_text: e.target.value },
                })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Privacy Policy URL</label>
                <input
                  type="url"
                  value={settings.compliance.privacy_policy_url}
                  onChange={(e) => updateSettings({
                    compliance: { ...settings.compliance, privacy_policy_url: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Terms of Service URL</label>
                <input
                  type="url"
                  value={settings.compliance.terms_url}
                  onChange={(e) => updateSettings({
                    compliance: { ...settings.compliance, terms_url: e.target.value },
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneralSettings;
