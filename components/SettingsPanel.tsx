import React, { useState } from 'react';
import { ReceptionistSettings, SettingsCategory } from '../types';

interface SettingsPanelProps {
  settings: ReceptionistSettings;
  setSettings: (settings: ReceptionistSettings) => void;
}

const settingsCategories: { id: SettingsCategory; label: string; icon: string }[] = [
  { id: 'branding', label: 'Branding', icon: 'palette' },
  { id: 'graphs', label: 'Graphs & Charts', icon: 'chart' },
  { id: 'voice', label: 'Voice & Dialogue', icon: 'mic' },
  { id: 'ai-behavior', label: 'AI Behavior', icon: 'brain' },
  { id: 'call-handling', label: 'Call Handling', icon: 'phone' },
  { id: 'scheduling', label: 'Scheduling', icon: 'calendar' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'language', label: 'Language', icon: 'globe' },
  { id: 'compliance', label: 'Compliance', icon: 'shield' },
  { id: 'accessibility', label: 'Accessibility', icon: 'eye' },
  { id: 'demo', label: 'Demo Scenarios', icon: 'play' },
  { id: 'integrations', label: 'Integrations', icon: 'plug' },
  { id: 'admin', label: 'Admin', icon: 'lock' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('branding');

  const renderCategoryIcon = (icon: string, isActive: boolean) => {
    const colorClass = isActive ? 'text-[#00FFC8]' : 'text-gray-500';
    switch (icon) {
      case 'palette':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
      case 'chart':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
      case 'mic':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
      case 'brain':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
      case 'phone':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
      case 'calendar':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'bell':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
      case 'globe':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'shield':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
      case 'eye':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
      case 'play':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'plug':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
      case 'lock':
        return <svg className={`w-5 h-5 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
      default:
        return null;
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'branding':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Firm Name</label>
              <input
                type="text"
                value={settings.firmName}
                onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                placeholder="Enter firm name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Logo URL</label>
              <input
                type="text"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Primary Practice Area</label>
              <select
                value={settings.primaryPracticeArea || ''}
                onChange={(e) => setSettings({ ...settings, primaryPracticeArea: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="">Select practice area</option>
                <option value="personal-injury">Personal Injury</option>
                <option value="family-law">Family Law</option>
                <option value="criminal-defense">Criminal Defense</option>
                <option value="corporate">Corporate Law</option>
                <option value="real-estate">Real Estate</option>
                <option value="immigration">Immigration</option>
                <option value="bankruptcy">Bankruptcy</option>
                <option value="estate-planning">Estate Planning</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Primary Brand Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.brandPrimaryColor || '#00FFC8'}
                    onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-[#2D3139] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.brandPrimaryColor || '#00FFC8'}
                    onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                    className="flex-1 bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Secondary Brand Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.brandSecondaryColor || '#1E2128'}
                    onChange={(e) => setSettings({ ...settings, brandSecondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg border border-[#2D3139] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.brandSecondaryColor || '#1E2128'}
                    onChange={(e) => setSettings({ ...settings, brandSecondaryColor: e.target.value })}
                    className="flex-1 bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'graphs':
        return (
          <div className="space-y-6">
            <div className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Chart Display Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base text-white">Show Weekly Trends</p>
                    <p className="text-sm text-gray-500">Display weekly call volume trends</p>
                  </div>
                  <div className="toggle-switch active"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base text-white">Show Conversion Metrics</p>
                    <p className="text-sm text-gray-500">Display appointment conversion rates</p>
                  </div>
                  <div className="toggle-switch active"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base text-white">Real-time Updates</p>
                    <p className="text-sm text-gray-500">Update charts in real-time</p>
                  </div>
                  <div className="toggle-switch active"></div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Chart Color Theme</label>
              <select className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition">
                <option value="cyan">Cyan (Default)</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">AI Name</label>
              <input
                type="text"
                value={settings.aiName}
                onChange={(e) => setSettings({ ...settings, aiName: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                placeholder="Enter AI name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Voice Name</label>
              <select
                value={settings.voiceName}
                onChange={(e) => setSettings({ ...settings, voiceName: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="Kore">Kore (Female, Professional)</option>
                <option value="Aoede">Aoede (Female, Warm)</option>
                <option value="Charon">Charon (Male, Deep)</option>
                <option value="Fenrir">Fenrir (Male, Energetic)</option>
                <option value="Puck">Puck (Neutral, Friendly)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Voice Tone</label>
              <select
                value={settings.tone}
                onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="Professional and Empathetic">Professional and Empathetic</option>
                <option value="Friendly and Casual">Friendly and Casual</option>
                <option value="Formal and Direct">Formal and Direct</option>
                <option value="Warm and Reassuring">Warm and Reassuring</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Opening Line</label>
              <textarea
                value={settings.openingLine}
                onChange={(e) => setSettings({ ...settings, openingLine: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base h-24 focus:border-[#00FFC8] focus:outline-none transition resize-none"
                placeholder="Enter opening greeting"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Closing Line</label>
              <textarea
                value={settings.closingLine || ''}
                onChange={(e) => setSettings({ ...settings, closingLine: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base h-24 focus:border-[#00FFC8] focus:outline-none transition resize-none"
                placeholder="Enter closing message"
              />
            </div>
          </div>
        );

      case 'ai-behavior':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Firm Bio / Context</label>
              <textarea
                value={settings.firmBio}
                onChange={(e) => setSettings({ ...settings, firmBio: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base h-32 focus:border-[#00FFC8] focus:outline-none transition resize-none"
                placeholder="Describe your firm for the AI to reference"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Response Delay (ms)</label>
              <input
                type="number"
                value={settings.responseDelay}
                onChange={(e) => setSettings({ ...settings, responseDelay: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Add delay to make responses feel more natural</p>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Urgency Keywords</label>
              <textarea
                value={settings.urgencyKeywords.join(', ')}
                onChange={(e) => setSettings({ ...settings, urgencyKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base h-20 focus:border-[#00FFC8] focus:outline-none transition resize-none"
                placeholder="court date, deadline, arrested, emergency"
              />
              <p className="text-sm text-gray-500 mt-1">Comma-separated keywords that trigger urgent case flagging</p>
            </div>
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Auto Follow-Up</p>
                <p className="text-sm text-gray-500">Automatically schedule follow-up reminders</p>
              </div>
              <div
                className={`toggle-switch ${settings.autoFollowUp ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, autoFollowUp: !settings.autoFollowUp })}
              ></div>
            </div>
          </div>
        );

      case 'call-handling':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Call Recording</p>
                <p className="text-sm text-gray-500">Record all incoming calls for review</p>
              </div>
              <div
                className={`toggle-switch ${settings.callRecording ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, callRecording: !settings.callRecording })}
              ></div>
            </div>
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Voicemail</p>
                <p className="text-sm text-gray-500">Enable voicemail for missed calls</p>
              </div>
              <div
                className={`toggle-switch ${settings.voicemailEnabled ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, voicemailEnabled: !settings.voicemailEnabled })}
              ></div>
            </div>
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Call Transfer</p>
                <p className="text-sm text-gray-500">Allow transfers to live staff</p>
              </div>
              <div
                className={`toggle-switch ${settings.callTransferEnabled ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, callTransferEnabled: !settings.callTransferEnabled })}
              ></div>
            </div>
            {settings.callTransferEnabled && (
              <div>
                <label className="text-sm text-gray-400 block mb-2">Transfer Number</label>
                <input
                  type="tel"
                  value={settings.transferNumber || ''}
                  onChange={(e) => setSettings({ ...settings, transferNumber: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Max Call Duration (minutes)</label>
              <input
                type="number"
                value={settings.maxCallDuration || 30}
                onChange={(e) => setSettings({ ...settings, maxCallDuration: parseInt(e.target.value) || 30 })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              />
            </div>
          </div>
        );

      case 'scheduling':
        return (
          <div className="space-y-6">
            <div className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Business Hours</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Opening Time</label>
                  <input
                    type="time"
                    value={settings.businessHours?.start || '09:00'}
                    onChange={(e) => setSettings({ ...settings, businessHours: { ...settings.businessHours || { start: '09:00', end: '17:00', timezone: 'EST', daysOpen: [] }, start: e.target.value } })}
                    className="w-full bg-[#1E2128] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Closing Time</label>
                  <input
                    type="time"
                    value={settings.businessHours?.end || '17:00'}
                    onChange={(e) => setSettings({ ...settings, businessHours: { ...settings.businessHours || { start: '09:00', end: '17:00', timezone: 'EST', daysOpen: [] }, end: e.target.value } })}
                    className="w-full bg-[#1E2128] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Default Appointment Duration (minutes)</label>
              <select
                value={settings.appointmentDuration || 30}
                onChange={(e) => setSettings({ ...settings, appointmentDuration: parseInt(e.target.value) })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Buffer Time Between Appointments (minutes)</label>
              <select
                value={settings.bufferTime || 15}
                onChange={(e) => setSettings({ ...settings, bufferTime: parseInt(e.target.value) })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value={0}>No buffer</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive email alerts for new intakes</p>
              </div>
              <div
                className={`toggle-switch ${settings.emailNotifications ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              ></div>
            </div>
            {settings.emailNotifications && (
              <div>
                <label className="text-sm text-gray-400 block mb-2">Notification Email</label>
                <input
                  type="email"
                  value={settings.notificationEmail || ''}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  placeholder="alerts@yourfirm.com"
                />
              </div>
            )}
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">SMS Notifications</p>
                <p className="text-sm text-gray-500">Receive text alerts for urgent cases</p>
              </div>
              <div
                className={`toggle-switch ${settings.smsNotifications ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
              ></div>
            </div>
            {settings.smsNotifications && (
              <div>
                <label className="text-sm text-gray-400 block mb-2">Notification Phone</label>
                <input
                  type="tel"
                  value={settings.notificationPhone || ''}
                  onChange={(e) => setSettings({ ...settings, notificationPhone: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Urgent Alerts</p>
                <p className="text-sm text-gray-500">Immediate alerts for urgent flagged cases</p>
              </div>
              <div
                className={`toggle-switch ${settings.urgentAlerts ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, urgentAlerts: !settings.urgentAlerts })}
              ></div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Primary Language</label>
              <select
                value={settings.language || 'en'}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese (Mandarin)</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Timezone</label>
              <select
                value={settings.timezone || 'America/New_York'}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Date Format</label>
              <select
                value={settings.dateFormat || 'MM/DD/YYYY'}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Time Format</label>
              <select
                value={settings.timeFormat || '12h'}
                onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">HIPAA Mode</p>
                <p className="text-sm text-gray-500">Enable HIPAA-compliant data handling</p>
              </div>
              <div
                className={`toggle-switch ${settings.hipaaMode ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, hipaaMode: !settings.hipaaMode })}
              ></div>
            </div>
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Legal Disclaimer</p>
                <p className="text-sm text-gray-500">Auto-insert legal disclaimers in calls</p>
              </div>
              <div
                className={`toggle-switch ${settings.legalDisclaimer ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, legalDisclaimer: !settings.legalDisclaimer })}
              ></div>
            </div>
            {settings.legalDisclaimer && (
              <div>
                <label className="text-sm text-gray-400 block mb-2">Disclaimer Text</label>
                <textarea
                  value={settings.disclaimerText || ''}
                  onChange={(e) => setSettings({ ...settings, disclaimerText: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base h-24 focus:border-[#00FFC8] focus:outline-none transition resize-none"
                  placeholder="This call may be recorded for quality and training purposes..."
                />
              </div>
            )}
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Audit Logging</p>
                <p className="text-sm text-gray-500">Log all actions for compliance audits</p>
              </div>
              <div
                className={`toggle-switch ${settings.auditLogging ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, auditLogging: !settings.auditLogging })}
              ></div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Data Retention (days)</label>
              <input
                type="number"
                value={settings.dataRetentionDays || 365}
                onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) || 365 })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              />
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">High Contrast Mode</p>
                <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
              </div>
              <div
                className={`toggle-switch ${settings.highContrast ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, highContrast: !settings.highContrast })}
              ></div>
            </div>
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Large Text</p>
                <p className="text-sm text-gray-500">Increase font sizes throughout</p>
              </div>
              <div
                className={`toggle-switch ${settings.largeText ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, largeText: !settings.largeText })}
              ></div>
            </div>
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Screen Reader Optimized</p>
                <p className="text-sm text-gray-500">Add ARIA labels and improved semantics</p>
              </div>
              <div
                className={`toggle-switch ${settings.screenReaderOptimized ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, screenReaderOptimized: !settings.screenReaderOptimized })}
              ></div>
            </div>
          </div>
        );

      case 'demo':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0F1115] border border-[#2D3139] rounded-lg p-4">
              <div>
                <p className="text-base text-white">Demo Mode</p>
                <p className="text-sm text-gray-500">Enable demo mode with sample data</p>
              </div>
              <div
                className={`toggle-switch ${settings.demoMode ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, demoMode: !settings.demoMode })}
              ></div>
            </div>
            {settings.demoMode && (
              <div>
                <label className="text-sm text-gray-400 block mb-2">Demo Scenario</label>
                <select
                  value={settings.demoScenario || 'personal-injury'}
                  onChange={(e) => setSettings({ ...settings, demoScenario: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                >
                  <option value="personal-injury">Personal Injury Intake</option>
                  <option value="family-law">Family Law Consultation</option>
                  <option value="criminal-defense">Criminal Defense Inquiry</option>
                  <option value="corporate">Corporate Matter</option>
                  <option value="urgent">Urgent Matter Demo</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">Select a demo scenario to showcase specific features</p>
              </div>
            )}
            <div className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Demo Data</h4>
              <p className="text-sm text-gray-500 mb-4">Generate sample calls and cases for demonstration</p>
              <button className="px-6 py-3 bg-[#00FFC8] text-black font-semibold rounded-lg hover:bg-[#00FFC8]/90 transition">
                Generate Demo Data
              </button>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">CRM Integration</label>
              <select
                value={settings.defaultCRM || 'none'}
                onChange={(e) => setSettings({ ...settings, defaultCRM: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="none">None</option>
                <option value="clio">Clio</option>
                <option value="mycase">MyCase</option>
                <option value="lawmatics">Lawmatics</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Email Service</label>
              <select
                value={settings.emailService || 'none'}
                onChange={(e) => setSettings({ ...settings, emailService: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="none">None</option>
                <option value="gmail">Gmail / Google Workspace</option>
                <option value="office365">Office 365</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Calendar Integration</label>
              <select
                value={settings.calendarIntegration || 'none'}
                onChange={(e) => setSettings({ ...settings, calendarIntegration: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="none">None</option>
                <option value="google">Google Calendar</option>
                <option value="outlook">Outlook Calendar</option>
                <option value="calendly">Calendly</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">SMS Provider</label>
              <select
                value={settings.smsProvider || 'none'}
                onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
              >
                <option value="none">None</option>
                <option value="twilio">Twilio</option>
                <option value="messagebird">MessageBird</option>
                <option value="vonage">Vonage</option>
              </select>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Admin Email</label>
              <input
                type="email"
                value={settings.adminEmail || ''}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base focus:border-[#00FFC8] focus:outline-none transition"
                placeholder="admin@yourfirm.com"
              />
            </div>
            <div className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">API Configuration</h4>
                  <p className="text-sm text-gray-500">Gemini API status</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${settings.apiKeyConfigured ? 'bg-[#00FFC8]/20 text-[#00FFC8]' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {settings.apiKeyConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <p className="text-sm text-gray-500">API key is configured via environment variables (VITE_API_KEY)</p>
            </div>
            <div className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Danger Zone</h4>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition text-left">
                  Reset All Settings to Default
                </button>
                <button className="w-full px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition text-left">
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Settings Sidebar */}
      <div className="w-64 shrink-0 bg-[#0F1115] border border-[#2D3139] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2D3139]">
          <h3 className="text-lg font-semibold text-white">Settings</h3>
          <p className="text-sm text-gray-500">Configure your receptionist</p>
        </div>
        <nav className="p-2 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
          {settingsCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`settings-nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${isActive ? 'active' : ''}`}
              >
                {renderCategoryIcon(category.icon, isActive)}
                <span className={`text-sm font-medium ${isActive ? 'text-[#00FFC8]' : 'text-gray-400'}`}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 bg-[#1E2128] border border-[#2D3139] rounded-xl p-6 overflow-y-auto">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            {settingsCategories.find(c => c.id === activeCategory)?.label}
          </h2>
          <p className="text-gray-500 mb-6">
            Configure {settingsCategories.find(c => c.id === activeCategory)?.label.toLowerCase()} settings
          </p>
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
