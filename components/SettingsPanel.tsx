import React, { useState } from 'react';
import { ReceptionistSettings } from '../types';

interface SettingsPanelProps {
  settings: ReceptionistSettings;
  setSettings: (settings: ReceptionistSettings) => void;
}

type SettingsCategory =
  | 'branding' | 'graphs' | 'voice' | 'ai-behavior' | 'call-handling'
  | 'scheduling' | 'notifications' | 'language' | 'compliance'
  | 'accessibility' | 'demo' | 'integrations' | 'admin';

const categories: { id: SettingsCategory; label: string; icon: string }[] = [
  { id: 'branding', label: 'Branding', icon: 'palette' },
  { id: 'graphs', label: 'Graphs & Charts', icon: 'chart' },
  { id: 'voice', label: 'Voice & Dialogue', icon: 'mic' },
  { id: 'ai-behavior', label: 'AI Behavior', icon: 'brain' },
  { id: 'call-handling', label: 'Call Handling', icon: 'phone' },
  { id: 'scheduling', label: 'Scheduling', icon: 'calendar' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'language', label: 'Language', icon: 'globe' },
  { id: 'compliance', label: 'Compliance', icon: 'shield' },
  { id: 'accessibility', label: 'Accessibility', icon: 'accessibility' },
  { id: 'demo', label: 'Demo Scenarios', icon: 'play' },
  { id: 'integrations', label: 'Integrations', icon: 'plug' },
  { id: 'admin', label: 'Admin', icon: 'user' },
];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('branding');

  const renderIcon = (icon: string, isActive: boolean) => {
    const cls = `w-5 h-5 ${isActive ? 'text-[#00FFC8]' : 'text-[#6B7280]'}`;
    switch (icon) {
      case 'palette':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>;
      case 'chart':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
      case 'mic':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>;
      case 'brain':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>;
      case 'phone':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
      case 'calendar':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
      case 'bell':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
      case 'globe':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
      case 'shield':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
      case 'accessibility':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
      case 'play':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>;
      case 'plug':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>;
      case 'user':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
      default:
        return null;
    }
  };

  const FormGroup: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
    <div className="mb-6">
      <label className="form-label">{label}</label>
      {children}
      {hint && <p className="mt-2 text-[13px] text-[#6B7280]">{hint}</p>}
    </div>
  );

  const Toggle: React.FC<{ enabled: boolean; onChange: () => void; label: string; description?: string }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 px-5 bg-[#0F1115] rounded-lg border border-[#2D3139] hover:border-[#3D4149] transition-colors">
      <div>
        <p className="text-[15px] font-medium text-white">{label}</p>
        {description && <p className="text-[13px] text-[#6B7280] mt-1">{description}</p>}
      </div>
      <div className={`toggle-switch ${enabled ? 'active' : ''}`} onClick={onChange}></div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'branding':
        return (
          <div className="space-y-6">
            <FormGroup label="Firm Name">
              <input
                type="text"
                value={settings.firmName}
                onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
                className="form-input"
                placeholder="Enter your firm name"
              />
            </FormGroup>
            <FormGroup label="Logo URL" hint="Provide a URL to your firm's logo image">
              <input
                type="text"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                className="form-input"
                placeholder="https://example.com/logo.png"
              />
            </FormGroup>
            <FormGroup label="Primary Practice Area">
              <select
                value={settings.primaryPracticeArea || ''}
                onChange={(e) => setSettings({ ...settings, primaryPracticeArea: e.target.value })}
                className="form-input form-select"
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
            </FormGroup>
            <div className="grid grid-cols-2 gap-6">
              <FormGroup label="Primary Brand Color">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.brandPrimaryColor || '#00FFC8'}
                    onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                    className="w-14 h-[46px] rounded-lg border border-[#2D3139] cursor-pointer bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={settings.brandPrimaryColor || '#00FFC8'}
                    onChange={(e) => setSettings({ ...settings, brandPrimaryColor: e.target.value })}
                    className="form-input flex-1"
                  />
                </div>
              </FormGroup>
              <FormGroup label="Secondary Brand Color">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.brandSecondaryColor || '#1A1D24'}
                    onChange={(e) => setSettings({ ...settings, brandSecondaryColor: e.target.value })}
                    className="w-14 h-[46px] rounded-lg border border-[#2D3139] cursor-pointer bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={settings.brandSecondaryColor || '#1A1D24'}
                    onChange={(e) => setSettings({ ...settings, brandSecondaryColor: e.target.value })}
                    className="form-input flex-1"
                  />
                </div>
              </FormGroup>
            </div>
          </div>
        );

      case 'graphs':
        return (
          <div className="space-y-4">
            <Toggle enabled={true} onChange={() => {}} label="Show Weekly Trends" description="Display weekly call volume trends on dashboard" />
            <Toggle enabled={true} onChange={() => {}} label="Show Conversion Metrics" description="Display appointment conversion rates" />
            <Toggle enabled={true} onChange={() => {}} label="Real-time Updates" description="Update charts in real-time as data comes in" />
            <Toggle enabled={false} onChange={() => {}} label="Export Charts" description="Allow exporting charts as images" />
            <FormGroup label="Chart Color Theme">
              <select className="form-input form-select">
                <option value="cyan">Cyan (Default)</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
              </select>
            </FormGroup>
          </div>
        );

      case 'voice':
        return (
          <div className="space-y-6">
            <FormGroup label="AI Assistant Name">
              <input
                type="text"
                value={settings.aiName}
                onChange={(e) => setSettings({ ...settings, aiName: e.target.value })}
                className="form-input"
                placeholder="Sarah"
              />
            </FormGroup>
            <FormGroup label="Voice Selection">
              <select
                value={settings.voiceName}
                onChange={(e) => setSettings({ ...settings, voiceName: e.target.value })}
                className="form-input form-select"
              >
                <option value="Kore">Kore (Female, Professional)</option>
                <option value="Aoede">Aoede (Female, Warm)</option>
                <option value="Charon">Charon (Male, Deep)</option>
                <option value="Fenrir">Fenrir (Male, Energetic)</option>
                <option value="Puck">Puck (Neutral, Friendly)</option>
              </select>
            </FormGroup>
            <FormGroup label="Voice Tone">
              <select
                value={settings.tone}
                onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                className="form-input form-select"
              >
                <option value="Professional and Empathetic">Professional and Empathetic</option>
                <option value="Friendly and Casual">Friendly and Casual</option>
                <option value="Formal and Direct">Formal and Direct</option>
                <option value="Warm and Reassuring">Warm and Reassuring</option>
              </select>
            </FormGroup>
            <FormGroup label="Opening Line" hint="The first thing the AI says when answering">
              <textarea
                value={settings.openingLine}
                onChange={(e) => setSettings({ ...settings, openingLine: e.target.value })}
                className="form-input h-24 resize-none"
                placeholder="Hi, thank you for calling..."
              />
            </FormGroup>
            <FormGroup label="Closing Line" hint="The message before ending the call">
              <textarea
                value={settings.closingLine || ''}
                onChange={(e) => setSettings({ ...settings, closingLine: e.target.value })}
                className="form-input h-24 resize-none"
                placeholder="Thank you for calling. Have a great day!"
              />
            </FormGroup>
          </div>
        );

      case 'ai-behavior':
        return (
          <div className="space-y-6">
            <FormGroup label="Firm Bio / Context" hint="Background information the AI uses to answer questions">
              <textarea
                value={settings.firmBio}
                onChange={(e) => setSettings({ ...settings, firmBio: e.target.value })}
                className="form-input h-32 resize-none"
                placeholder="Describe your firm..."
              />
            </FormGroup>
            <FormGroup label="Response Delay (milliseconds)" hint="Add a slight pause to make responses feel more natural">
              <input
                type="number"
                value={settings.responseDelay}
                onChange={(e) => setSettings({ ...settings, responseDelay: parseInt(e.target.value) || 0 })}
                className="form-input"
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label="Urgency Keywords" hint="Comma-separated words that trigger urgent case flagging">
              <textarea
                value={settings.urgencyKeywords.join(', ')}
                onChange={(e) => setSettings({ ...settings, urgencyKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                className="form-input h-20 resize-none"
                placeholder="court date, deadline, arrested, emergency"
              />
            </FormGroup>
            <Toggle
              enabled={settings.autoFollowUp || false}
              onChange={() => setSettings({ ...settings, autoFollowUp: !settings.autoFollowUp })}
              label="Auto Follow-Up"
              description="Automatically schedule follow-up reminders for incomplete intakes"
            />
          </div>
        );

      case 'call-handling':
        return (
          <div className="space-y-4">
            <Toggle
              enabled={settings.callRecording || false}
              onChange={() => setSettings({ ...settings, callRecording: !settings.callRecording })}
              label="Call Recording"
              description="Record all incoming calls for quality and training"
            />
            <Toggle
              enabled={settings.voicemailEnabled || false}
              onChange={() => setSettings({ ...settings, voicemailEnabled: !settings.voicemailEnabled })}
              label="Voicemail"
              description="Enable voicemail for unanswered or after-hours calls"
            />
            <Toggle
              enabled={settings.callTransferEnabled || false}
              onChange={() => setSettings({ ...settings, callTransferEnabled: !settings.callTransferEnabled })}
              label="Call Transfer"
              description="Allow AI to transfer calls to live staff when needed"
            />
            {settings.callTransferEnabled && (
              <FormGroup label="Transfer Phone Number">
                <input
                  type="tel"
                  value={settings.transferNumber || ''}
                  onChange={(e) => setSettings({ ...settings, transferNumber: e.target.value })}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>
            )}
            <FormGroup label="Max Call Duration (minutes)">
              <input
                type="number"
                value={settings.maxCallDuration || 30}
                onChange={(e) => setSettings({ ...settings, maxCallDuration: parseInt(e.target.value) || 30 })}
                className="form-input"
              />
            </FormGroup>
          </div>
        );

      case 'scheduling':
        return (
          <div className="space-y-6">
            <div className="p-5 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <h4 className="text-[15px] font-semibold text-white mb-4">Business Hours</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Opening Time">
                  <input
                    type="time"
                    value={settings.businessHours?.start || '09:00'}
                    onChange={(e) => setSettings({ ...settings, businessHours: { ...settings.businessHours || { start: '09:00', end: '17:00', timezone: 'EST', daysOpen: [] }, start: e.target.value } })}
                    className="form-input"
                  />
                </FormGroup>
                <FormGroup label="Closing Time">
                  <input
                    type="time"
                    value={settings.businessHours?.end || '17:00'}
                    onChange={(e) => setSettings({ ...settings, businessHours: { ...settings.businessHours || { start: '09:00', end: '17:00', timezone: 'EST', daysOpen: [] }, end: e.target.value } })}
                    className="form-input"
                  />
                </FormGroup>
              </div>
            </div>
            <FormGroup label="Default Appointment Duration">
              <select
                value={settings.appointmentDuration || 30}
                onChange={(e) => setSettings({ ...settings, appointmentDuration: parseInt(e.target.value) })}
                className="form-input form-select"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </FormGroup>
            <FormGroup label="Buffer Time Between Appointments">
              <select
                value={settings.bufferTime || 15}
                onChange={(e) => setSettings({ ...settings, bufferTime: parseInt(e.target.value) })}
                className="form-input form-select"
              >
                <option value={0}>No buffer</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </FormGroup>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <Toggle
              enabled={settings.emailNotifications || false}
              onChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              label="Email Notifications"
              description="Receive email alerts for new client intakes"
            />
            {settings.emailNotifications && (
              <FormGroup label="Notification Email">
                <input
                  type="email"
                  value={settings.notificationEmail || ''}
                  onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                  className="form-input"
                  placeholder="alerts@yourfirm.com"
                />
              </FormGroup>
            )}
            <Toggle
              enabled={settings.smsNotifications || false}
              onChange={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
              label="SMS Notifications"
              description="Receive text messages for urgent cases"
            />
            {settings.smsNotifications && (
              <FormGroup label="Notification Phone">
                <input
                  type="tel"
                  value={settings.notificationPhone || ''}
                  onChange={(e) => setSettings({ ...settings, notificationPhone: e.target.value })}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>
            )}
            <Toggle
              enabled={settings.urgentAlerts || false}
              onChange={() => setSettings({ ...settings, urgentAlerts: !settings.urgentAlerts })}
              label="Urgent Alerts"
              description="Immediate push notifications for flagged urgent cases"
            />
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <FormGroup label="Primary Language">
              <select
                value={settings.language || 'en'}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="form-input form-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese (Mandarin)</option>
                <option value="pt">Portuguese</option>
              </select>
            </FormGroup>
            <FormGroup label="Timezone">
              <select
                value={settings.timezone || 'America/New_York'}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="form-input form-select"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Anchorage">Alaska Time (AKT)</option>
                <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
              </select>
            </FormGroup>
            <FormGroup label="Date Format">
              <select
                value={settings.dateFormat || 'MM/DD/YYYY'}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="form-input form-select"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </FormGroup>
            <FormGroup label="Time Format">
              <select
                value={settings.timeFormat || '12h'}
                onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                className="form-input form-select"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </FormGroup>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-4">
            <Toggle
              enabled={settings.hipaaMode || false}
              onChange={() => setSettings({ ...settings, hipaaMode: !settings.hipaaMode })}
              label="HIPAA Mode"
              description="Enable HIPAA-compliant data handling and encryption"
            />
            <Toggle
              enabled={settings.legalDisclaimer || false}
              onChange={() => setSettings({ ...settings, legalDisclaimer: !settings.legalDisclaimer })}
              label="Legal Disclaimer"
              description="Auto-insert legal disclaimer at the start of calls"
            />
            {settings.legalDisclaimer && (
              <FormGroup label="Disclaimer Text">
                <textarea
                  value={settings.disclaimerText || ''}
                  onChange={(e) => setSettings({ ...settings, disclaimerText: e.target.value })}
                  className="form-input h-24 resize-none"
                  placeholder="This call may be recorded..."
                />
              </FormGroup>
            )}
            <Toggle
              enabled={settings.auditLogging || false}
              onChange={() => setSettings({ ...settings, auditLogging: !settings.auditLogging })}
              label="Audit Logging"
              description="Log all system actions for compliance audits"
            />
            <FormGroup label="Data Retention (days)">
              <input
                type="number"
                value={settings.dataRetentionDays || 365}
                onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) || 365 })}
                className="form-input"
              />
            </FormGroup>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4">
            <Toggle
              enabled={settings.highContrast || false}
              onChange={() => setSettings({ ...settings, highContrast: !settings.highContrast })}
              label="High Contrast Mode"
              description="Increase contrast for better visibility"
            />
            <Toggle
              enabled={settings.largeText || false}
              onChange={() => setSettings({ ...settings, largeText: !settings.largeText })}
              label="Large Text"
              description="Increase font sizes throughout the interface"
            />
            <Toggle
              enabled={settings.screenReaderOptimized || false}
              onChange={() => setSettings({ ...settings, screenReaderOptimized: !settings.screenReaderOptimized })}
              label="Screen Reader Optimized"
              description="Add ARIA labels and improve semantic structure"
            />
          </div>
        );

      case 'demo':
        return (
          <div className="space-y-6">
            <Toggle
              enabled={settings.demoMode || false}
              onChange={() => setSettings({ ...settings, demoMode: !settings.demoMode })}
              label="Demo Mode"
              description="Enable demo mode with simulated data for presentations"
            />
            {settings.demoMode && (
              <FormGroup label="Demo Scenario">
                <select
                  value={settings.demoScenario || 'personal-injury'}
                  onChange={(e) => setSettings({ ...settings, demoScenario: e.target.value })}
                  className="form-input form-select"
                >
                  <option value="personal-injury">Personal Injury Intake</option>
                  <option value="family-law">Family Law Consultation</option>
                  <option value="criminal-defense">Criminal Defense Inquiry</option>
                  <option value="corporate">Corporate Matter</option>
                  <option value="urgent">Urgent Matter Demo</option>
                </select>
              </FormGroup>
            )}
            <div className="p-5 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <h4 className="text-[15px] font-semibold text-white mb-2">Generate Demo Data</h4>
              <p className="text-[13px] text-[#6B7280] mb-4">Create sample calls and cases for demonstration purposes</p>
              <button className="px-5 py-2.5 bg-[#00FFC8] text-black font-semibold text-[14px] rounded-lg hover:bg-[#00FFC8]/90 transition">
                Generate Demo Data
              </button>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <FormGroup label="CRM Integration">
              <select
                value={settings.defaultCRM || 'none'}
                onChange={(e) => setSettings({ ...settings, defaultCRM: e.target.value })}
                className="form-input form-select"
              >
                <option value="none">None</option>
                <option value="clio">Clio</option>
                <option value="mycase">MyCase</option>
                <option value="lawmatics">Lawmatics</option>
                <option value="salesforce">Salesforce</option>
                <option value="hubspot">HubSpot</option>
              </select>
            </FormGroup>
            <FormGroup label="Email Service">
              <select
                value={settings.emailService || 'none'}
                onChange={(e) => setSettings({ ...settings, emailService: e.target.value })}
                className="form-input form-select"
              >
                <option value="none">None</option>
                <option value="gmail">Gmail / Google Workspace</option>
                <option value="office365">Office 365</option>
                <option value="smtp">Custom SMTP</option>
              </select>
            </FormGroup>
            <FormGroup label="Calendar Integration">
              <select
                value={settings.calendarIntegration || 'none'}
                onChange={(e) => setSettings({ ...settings, calendarIntegration: e.target.value })}
                className="form-input form-select"
              >
                <option value="none">None</option>
                <option value="google">Google Calendar</option>
                <option value="outlook">Outlook Calendar</option>
                <option value="calendly">Calendly</option>
              </select>
            </FormGroup>
            <FormGroup label="SMS Provider">
              <select
                value={settings.smsProvider || 'none'}
                onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
                className="form-input form-select"
              >
                <option value="none">None</option>
                <option value="twilio">Twilio</option>
                <option value="messagebird">MessageBird</option>
                <option value="vonage">Vonage</option>
              </select>
            </FormGroup>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <FormGroup label="Admin Email">
              <input
                type="email"
                value={settings.adminEmail || ''}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                className="form-input"
                placeholder="admin@yourfirm.com"
              />
            </FormGroup>
            <div className="p-5 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[15px] font-semibold text-white">API Configuration</h4>
                  <p className="text-[13px] text-[#6B7280] mt-1">Gemini API connection status</p>
                </div>
                <span className="status-badge active">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Configured
                </span>
              </div>
            </div>
            <div className="p-5 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <h4 className="text-[15px] font-semibold text-white mb-4">Danger Zone</h4>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-transparent border border-[#EF4444]/30 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 transition text-left text-[14px] font-medium">
                  Reset All Settings to Default
                </button>
                <button className="w-full px-4 py-3 bg-transparent border border-[#EF4444]/30 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 transition text-left text-[14px] font-medium">
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
      {/* Sidebar */}
      <div className="w-[260px] shrink-0 bg-[#1A1D24] border border-[#2D3139] rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#2D3139]">
          <h3 className="text-[16px] font-semibold text-white">Settings</h3>
          <p className="text-[13px] text-[#6B7280] mt-1">Configure your AI receptionist</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`settings-nav-item w-full ${isActive ? 'active' : ''}`}
              >
                {renderIcon(cat.icon, isActive)}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#1A1D24] border border-[#2D3139] rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-[#2D3139]">
          <h2 className="text-[20px] font-semibold text-white">
            {categories.find(c => c.id === activeCategory)?.label}
          </h2>
          <p className="text-[14px] text-[#6B7280] mt-1">
            Configure {categories.find(c => c.id === activeCategory)?.label.toLowerCase()} settings for your AI receptionist
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
