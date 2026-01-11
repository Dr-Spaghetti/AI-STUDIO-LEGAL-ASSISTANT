// ============================================
// Branding Settings - Tenant Customization
// ============================================
// Configure colors, logos, and visual identity

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Image,
  Type,
  Eye,
  Save,
  RotateCcw,
  Upload,
  X,
  Check,
  Monitor,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface BrandingConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    error: string;
  };
  logo: {
    url: string;
    darkModeUrl?: string;
    height: number;
  };
  favicon: string;
  typography: {
    headingFont: string;
    bodyFont: string;
  };
  customCss?: string;
  chatWidget: {
    position: 'bottom-right' | 'bottom-left';
    greeting: string;
    placeholder: string;
    showAvatar: boolean;
    avatarUrl?: string;
  };
}

interface Props {
  tenantId: string;
  onSave?: (config: BrandingConfig) => void;
}

// ============================================
// DEFAULT CONFIG
// ============================================

const DEFAULT_BRANDING: BrandingConfig = {
  colors: {
    primary: '#00FFC8',
    secondary: '#1E293B',
    accent: '#3B82F6',
    background: '#0F172A',
    text: '#F8FAFC',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  logo: {
    url: '',
    height: 40,
  },
  favicon: '',
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  chatWidget: {
    position: 'bottom-right',
    greeting: 'Hello! How can we help you today?',
    placeholder: 'Type your message...',
    showAvatar: true,
  },
};

const PRESET_COLORS = [
  { name: 'Cyan', primary: '#00FFC8', accent: '#06B6D4' },
  { name: 'Blue', primary: '#3B82F6', accent: '#6366F1' },
  { name: 'Purple', primary: '#8B5CF6', accent: '#A855F7' },
  { name: 'Pink', primary: '#EC4899', accent: '#F472B6' },
  { name: 'Red', primary: '#EF4444', accent: '#F97316' },
  { name: 'Green', primary: '#10B981', accent: '#22C55E' },
  { name: 'Gold', primary: '#F59E0B', accent: '#EAB308' },
];

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Raleway',
];

// ============================================
// COMPONENT
// ============================================

export function BrandingSettings({ tenantId, onSave }: Props) {
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'colors' | 'logo' | 'typography' | 'widget'>('colors');

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(DEFAULT_BRANDING);
    setHasChanges(changed);
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSave?.(config);
      setHasChanges(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all branding settings to defaults?')) {
      setConfig(DEFAULT_BRANDING);
    }
  };

  const updateColors = (updates: Partial<BrandingConfig['colors']>) => {
    setConfig((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...updates },
    }));
  };

  const updateWidget = (updates: Partial<BrandingConfig['chatWidget']>) => {
    setConfig((prev) => ({
      ...prev,
      chatWidget: { ...prev.chatWidget, ...updates },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Branding</h2>
          <p className="text-gray-400 mt-1">Customize your intake experience</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-800 pb-4">
            {[
              { id: 'colors', label: 'Colors', icon: Palette },
              { id: 'logo', label: 'Logo & Images', icon: Image },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'widget', label: 'Chat Widget', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Presets */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Color Presets</h3>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateColors({ primary: preset.primary, accent: preset.accent })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        config.colors.primary === preset.primary
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-white">{preset.name}</span>
                      {config.colors.primary === preset.primary && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Custom Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(config.colors).map(([key, value]) => (
                    <ColorPicker
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      value={value}
                      onChange={(color) => updateColors({ [key]: color })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Logo Tab */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Logo</h3>
                <div className="space-y-4">
                  <ImageUploader
                    label="Light Mode Logo"
                    value={config.logo.url}
                    onChange={(url) => setConfig((prev) => ({
                      ...prev,
                      logo: { ...prev.logo, url },
                    }))}
                  />
                  <ImageUploader
                    label="Dark Mode Logo (optional)"
                    value={config.logo.darkModeUrl || ''}
                    onChange={(url) => setConfig((prev) => ({
                      ...prev,
                      logo: { ...prev.logo, darkModeUrl: url || undefined },
                    }))}
                  />
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Logo Height (px)</label>
                    <input
                      type="number"
                      value={config.logo.height}
                      onChange={(e) => setConfig((prev) => ({
                        ...prev,
                        logo: { ...prev.logo, height: parseInt(e.target.value) || 40 },
                      }))}
                      className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Favicon</h3>
                <ImageUploader
                  label="Favicon (32x32 recommended)"
                  value={config.favicon}
                  onChange={(url) => setConfig((prev) => ({ ...prev, favicon: url }))}
                />
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">Fonts</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Heading Font</label>
                  <select
                    value={config.typography.headingFont}
                    onChange={(e) => setConfig((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, headingFont: e.target.value },
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Body Font</label>
                  <select
                    value={config.typography.bodyFont}
                    onChange={(e) => setConfig((prev) => ({
                      ...prev,
                      typography: { ...prev.typography, bodyFont: e.target.value },
                    }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Font Preview */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h4
                  className="text-xl font-bold text-white mb-2"
                  style={{ fontFamily: config.typography.headingFont }}
                >
                  Heading Preview
                </h4>
                <p
                  className="text-gray-300"
                  style={{ fontFamily: config.typography.bodyFont }}
                >
                  This is how your body text will appear. The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>
          )}

          {/* Widget Tab */}
          {activeTab === 'widget' && (
            <div className="space-y-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Chat Widget</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Position</label>
                    <div className="flex gap-3">
                      {['bottom-right', 'bottom-left'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => updateWidget({ position: pos as 'bottom-right' | 'bottom-left' })}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            config.chatWidget.position === pos
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {pos.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Greeting Message</label>
                    <input
                      type="text"
                      value={config.chatWidget.greeting}
                      onChange={(e) => updateWidget({ greeting: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Input Placeholder</label>
                    <input
                      type="text"
                      value={config.chatWidget.placeholder}
                      onChange={(e) => updateWidget({ placeholder: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.chatWidget.showAvatar}
                      onChange={(e) => updateWidget({ showAvatar: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-white">Show avatar in chat</span>
                  </label>

                  {config.chatWidget.showAvatar && (
                    <ImageUploader
                      label="Avatar Image"
                      value={config.chatWidget.avatarUrl || ''}
                      onChange={(url) => updateWidget({ avatarUrl: url || undefined })}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-lg ${
                  previewMode === 'desktop' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-lg ${
                  previewMode === 'mobile' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview Widget */}
          <div
            className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-[320px] mx-auto' : ''
            }`}
            style={{ backgroundColor: config.colors.background }}
          >
            {/* Header Preview */}
            <div
              className="p-4 border-b"
              style={{ borderColor: config.colors.secondary }}
            >
              {config.logo.url ? (
                <img
                  src={config.logo.url}
                  alt="Logo"
                  style={{ height: config.logo.height }}
                />
              ) : (
                <div
                  className="font-bold text-xl"
                  style={{
                    color: config.colors.primary,
                    fontFamily: config.typography.headingFont,
                  }}
                >
                  Your Firm Name
                </div>
              )}
            </div>

            {/* Chat Preview */}
            <div className="p-4 space-y-4" style={{ minHeight: '300px' }}>
              {/* Greeting */}
              <div className="flex gap-3">
                {config.chatWidget.showAvatar && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: config.colors.primary }}
                  >
                    AI
                  </div>
                )}
                <div
                  className="p-3 rounded-lg max-w-[80%]"
                  style={{
                    backgroundColor: config.colors.secondary,
                    color: config.colors.text,
                    fontFamily: config.typography.bodyFont,
                  }}
                >
                  {config.chatWidget.greeting}
                </div>
              </div>

              {/* User message */}
              <div className="flex justify-end">
                <div
                  className="p-3 rounded-lg max-w-[80%]"
                  style={{
                    backgroundColor: config.colors.primary,
                    color: config.colors.background,
                    fontFamily: config.typography.bodyFont,
                  }}
                >
                  I was in a car accident last week
                </div>
              </div>

              {/* Input */}
              <div
                className="flex gap-2 p-2 rounded-lg mt-auto"
                style={{ backgroundColor: config.colors.secondary }}
              >
                <input
                  type="text"
                  placeholder={config.chatWidget.placeholder}
                  className="flex-1 bg-transparent border-none outline-none"
                  style={{
                    color: config.colors.text,
                    fontFamily: config.typography.bodyFont,
                  }}
                  disabled
                />
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: config.colors.primary,
                    color: config.colors.background,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border-none"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 font-mono text-sm"
        />
      </div>
    </div>
  );
}

function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // In production, upload to Supabase Storage
      // For now, create object URL
      const url = URL.createObjectURL(file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-gray-400 text-sm mb-2">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="Preview" className="h-12 rounded" />
            <button
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            {uploading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-gray-300">Upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
        <span className="text-gray-500 text-sm">or</span>
        <input
          type="text"
          placeholder="Paste URL..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
        />
      </div>
    </div>
  );
}

export default BrandingSettings;
