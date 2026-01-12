import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReceptionistSettings, Employee } from '../types';

// Debounce hook to prevent excessive updates
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SettingsPanelProps {
  settings: ReceptionistSettings;
  setSettings: (settings: ReceptionistSettings) => void;
}

type SettingsCategory =
  | 'branding' | 'team' | 'graphs' | 'voice' | 'ai-behavior' | 'call-handling'
  | 'scheduling' | 'notifications' | 'language' | 'compliance'
  | 'accessibility' | 'demo' | 'integrations' | 'admin';

const categories: { id: SettingsCategory; label: string; icon: string }[] = [
  { id: 'branding', label: 'Branding', icon: 'palette' },
  { id: 'team', label: 'Team & Routing', icon: 'users' },
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

// Toast notification component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg animate-slide-up ${
      type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
    }`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('branding');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Local state for text inputs to prevent focus loss
  const [localSettings, setLocalSettings] = useState<ReceptionistSettings>(settings);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Sync local state when parent settings change (e.g., from other sources)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasUnsavedChanges(hasChanges);
  }, [localSettings, settings]);

  // Graph settings state
  const [graphSettings, setGraphSettings] = useState({
    showWeeklyTrends: true,
    showConversionMetrics: true,
    realTimeUpdates: true,
    exportCharts: false,
    chartColorTheme: 'cyan'
  });

  // Handle local changes without triggering parent re-render
  const handleLocalChange = useCallback((updates: Partial<ReceptionistSettings>) => {
    setLocalSettings(prev => ({ ...prev, ...updates }));

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save to parent
    saveTimeoutRef.current = setTimeout(() => {
      setSettings({ ...localSettings, ...updates });
    }, 500);
  }, [localSettings, setSettings]);

  // Handle immediate settings update (for toggles, selects, etc.)
  const handleSettingsChange = useCallback((updates: Partial<ReceptionistSettings>) => {
    const newSettings = { ...localSettings, ...updates };
    setLocalSettings(newSettings);
    setSettings(newSettings);

    // Show save feedback
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setToast({ message: 'Settings saved successfully', type: 'success' });
    }, 300);
  }, [localSettings, setSettings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save & Deploy handler - saves all changes and persists to localStorage
  const handleSaveAndDeploy = useCallback(() => {
    setIsDeploying(true);

    // Clear any pending debounced saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save to parent state
    setSettings(localSettings);

    // Explicitly save to localStorage for persistence
    try {
      localStorage.setItem('receptionistSettings', JSON.stringify(localSettings));

      // Simulate deployment delay for UX feedback
      setTimeout(() => {
        setIsDeploying(false);
        setHasUnsavedChanges(false);
        setToast({ message: 'Changes saved and deployed successfully!', type: 'success' });
      }, 800);
    } catch (error) {
      setIsDeploying(false);
      setToast({ message: 'Failed to save changes. Please try again.', type: 'error' });
    }
  }, [localSettings, setSettings]);

  // Handle logo file upload
  const handleLogoUpload = useCallback((file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setToast({ message: 'Invalid file type. Please upload PNG, JPG, SVG, WEBP, or GIF.', type: 'error' });
      return;
    }

    if (file.size > maxSize) {
      setToast({ message: 'File too large. Maximum size is 5MB.', type: 'error' });
      return;
    }

    // Create object URL for preview (in production, upload to storage)
    const url = URL.createObjectURL(file);
    handleSettingsChange({ logoUrl: url });
  }, [handleSettingsChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoUpload(file);
  }, [handleLogoUpload]);

  // Employee management
  const handleAddEmployee = useCallback(() => {
    setEditingEmployee({
      id: `emp-${Date.now()}`,
      name: '',
      role: 'Attorney',
      title: '',
      practiceArea: '',
      email: '',
      phone: '',
      routingTag: '',
      isActive: true,
    });
    setShowEmployeeModal(true);
  }, []);

  const handleEditEmployee = useCallback((employee: Employee) => {
    setEditingEmployee(employee);
    setShowEmployeeModal(true);
  }, []);

  const handleSaveEmployee = useCallback(() => {
    if (!editingEmployee || !editingEmployee.name.trim()) {
      setToast({ message: 'Employee name is required', type: 'error' });
      return;
    }

    const employees = settings.employees || [];
    const existingIndex = employees.findIndex(e => e.id === editingEmployee.id);

    let newEmployees: Employee[];
    if (existingIndex >= 0) {
      newEmployees = [...employees];
      newEmployees[existingIndex] = editingEmployee;
    } else {
      newEmployees = [...employees, editingEmployee];
    }

    handleSettingsChange({ employees: newEmployees });
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  }, [editingEmployee, settings.employees, handleSettingsChange]);

  const handleDeleteEmployee = useCallback((id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    const employees = (settings.employees || []).filter(e => e.id !== id);
    handleSettingsChange({ employees });
  }, [settings.employees, handleSettingsChange]);

  const renderIcon = (icon: string, isActive: boolean) => {
    const cls = `w-5 h-5 ${isActive ? 'icon-active' : 'text-[#6B7280]'}`;
    switch (icon) {
      case 'palette':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>;
      case 'users':
        return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
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
                value={localSettings.firmName}
                onChange={(e) => handleLocalChange({ firmName: e.target.value })}
                className="form-input"
                placeholder="Enter your firm name"
              />
            </FormGroup>

            {/* Logo Upload Section */}
            <FormGroup label="Firm Logo" hint="Upload your firm's logo (PNG, JPG, SVG, WEBP, GIF - max 5MB)">
              <div className="space-y-4">
                {/* Current logo preview */}
                {settings.logoUrl && (
                  <div className="flex items-center gap-4 p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
                    <img
                      src={settings.logoUrl}
                      alt="Current logo"
                      className="h-16 max-w-[200px] object-contain rounded"
                    />
                    <button
                      onClick={() => handleSettingsChange({ logoUrl: '' })}
                      className="px-3 py-1.5 text-sm text-red-400 border border-red-400/30 rounded hover:bg-red-400/10 transition"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Drag and drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'drag-active'
                      : 'border-[#2D3139] hover:border-[#3D4149]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-10 h-10 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 btn-primary text-black font-semibold rounded-lg transition"
                      >
                        Select File
                      </button>
                    </div>
                    <p className="text-[#6B7280] text-sm">or drag and drop here</p>
                  </div>
                </div>
              </div>
            </FormGroup>

            <FormGroup label="Primary Practice Area">
              <select
                value={settings.primaryPracticeArea || ''}
                onChange={(e) => handleSettingsChange({ primaryPracticeArea: e.target.value })}
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
                    value={localSettings.brandPrimaryColor || '#00FFC8'}
                    onChange={(e) => handleLocalChange({ brandPrimaryColor: e.target.value })}
                    className="w-14 h-[46px] rounded-lg border border-[#2D3139] cursor-pointer bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={localSettings.brandPrimaryColor || '#00FFC8'}
                    onChange={(e) => handleLocalChange({ brandPrimaryColor: e.target.value })}
                    className="form-input flex-1"
                  />
                </div>
              </FormGroup>
              <FormGroup label="Secondary Brand Color">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={localSettings.brandSecondaryColor || '#1A1D24'}
                    onChange={(e) => handleLocalChange({ brandSecondaryColor: e.target.value })}
                    className="w-14 h-[46px] rounded-lg border border-[#2D3139] cursor-pointer bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={localSettings.brandSecondaryColor || '#1A1D24'}
                    onChange={(e) => handleLocalChange({ brandSecondaryColor: e.target.value })}
                    className="form-input flex-1"
                  />
                </div>
              </FormGroup>
            </div>

            {/* Live Preview */}
            <div className="p-5 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <h4 className="text-[15px] font-semibold text-white mb-4">Live Preview</h4>
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: localSettings.brandSecondaryColor || '#1A1D24',
                  borderColor: localSettings.brandPrimaryColor || '#00FFC8'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {localSettings.logoUrl ? (
                    <img src={localSettings.logoUrl} alt="Logo" className="h-8 object-contain" />
                  ) : (
                    <div
                      className="font-bold text-lg"
                      style={{ color: localSettings.brandPrimaryColor || '#00FFC8' }}
                    >
                      {localSettings.firmName || 'Your Firm Name'}
                    </div>
                  )}
                </div>
                <button
                  className="px-4 py-2 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: localSettings.brandPrimaryColor || '#00FFC8',
                    color: '#000'
                  }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[15px] font-semibold text-white">Team Members</h4>
                <p className="text-[13px] text-[#6B7280] mt-1">Add attorneys and staff for call routing</p>
              </div>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 btn-primary text-black font-semibold text-[14px] rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Team Member
              </button>
            </div>

            {/* Team List */}
            <div className="space-y-3">
              {(settings.employees || []).length === 0 ? (
                <div className="p-8 bg-[#0F1115] rounded-lg border border-[#2D3139] text-center">
                  <svg className="w-12 h-12 text-[#6B7280] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-[#6B7280]">No team members added yet</p>
                  <p className="text-[13px] text-[#6B7280] mt-1">Add attorneys and staff to enable call routing</p>
                </div>
              ) : (
                (settings.employees || []).map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139] hover:border-[#3D4149] transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full avatar-circle flex items-center justify-center font-semibold">
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{emp.name}</p>
                        <p className="text-[13px] text-[#6B7280]">
                          {emp.role}{emp.title ? ` - ${emp.title}` : ''}{emp.practiceArea ? ` (${emp.practiceArea})` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${emp.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {emp.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleEditEmployee(emp)}
                        className="p-2 text-[#6B7280] hover:text-white transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 text-[#6B7280] hover:text-red-400 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                <strong>How routing works:</strong> When a caller requests a specific attorney or role,
                the AI will recognize the name and confirm before routing. Team members must have unique names for accurate matching.
              </p>
            </div>
          </div>
        );

      case 'graphs':
        return (
          <div className="space-y-4">
            <Toggle
              enabled={graphSettings.showWeeklyTrends}
              onChange={() => {
                setGraphSettings(prev => ({ ...prev, showWeeklyTrends: !prev.showWeeklyTrends }));
                setToast({ message: `Weekly trends ${!graphSettings.showWeeklyTrends ? 'enabled' : 'disabled'}`, type: 'success' });
              }}
              label="Show Weekly Trends"
              description="Display weekly call volume trends on dashboard"
            />
            <Toggle
              enabled={graphSettings.showConversionMetrics}
              onChange={() => {
                setGraphSettings(prev => ({ ...prev, showConversionMetrics: !prev.showConversionMetrics }));
                setToast({ message: `Conversion metrics ${!graphSettings.showConversionMetrics ? 'enabled' : 'disabled'}`, type: 'success' });
              }}
              label="Show Conversion Metrics"
              description="Display appointment conversion rates"
            />
            <Toggle
              enabled={graphSettings.realTimeUpdates}
              onChange={() => {
                setGraphSettings(prev => ({ ...prev, realTimeUpdates: !prev.realTimeUpdates }));
                setToast({ message: `Real-time updates ${!graphSettings.realTimeUpdates ? 'enabled' : 'disabled'}`, type: 'success' });
              }}
              label="Real-time Updates"
              description="Update charts in real-time as data comes in"
            />
            <Toggle
              enabled={graphSettings.exportCharts}
              onChange={() => {
                setGraphSettings(prev => ({ ...prev, exportCharts: !prev.exportCharts }));
                setToast({ message: `Chart export ${!graphSettings.exportCharts ? 'enabled' : 'disabled'}`, type: 'success' });
              }}
              label="Export Charts"
              description="Allow exporting charts as images"
            />
            <FormGroup label="Chart Color Theme">
              <select
                value={graphSettings.chartColorTheme}
                onChange={(e) => {
                  setGraphSettings(prev => ({ ...prev, chartColorTheme: e.target.value }));
                  setToast({ message: `Chart theme updated to ${e.target.value}`, type: 'success' });
                }}
                className="form-input form-select"
              >
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
                value={localSettings.aiName}
                onChange={(e) => handleLocalChange({ aiName: e.target.value })}
                className="form-input"
                placeholder="Sarah"
              />
            </FormGroup>

            {/* Enhanced Voice Selection with Categories */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-white">Voice Selection</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'Kore', name: 'Kore', gender: 'Female', style: 'Professional', description: 'Clear, confident voice ideal for legal settings' },
                  { value: 'Aoede', name: 'Aoede', gender: 'Female', style: 'Warm', description: 'Friendly and approachable, great for client comfort' },
                  { value: 'Leda', name: 'Leda', gender: 'Female', style: 'Calm', description: 'Soothing voice for sensitive conversations' },
                  { value: 'Zephyr', name: 'Zephyr', gender: 'Female', style: 'Energetic', description: 'Upbeat and engaging for active intake' },
                  { value: 'Charon', name: 'Charon', gender: 'Male', style: 'Deep', description: 'Authoritative presence for serious matters' },
                  { value: 'Fenrir', name: 'Fenrir', gender: 'Male', style: 'Energetic', description: 'Dynamic voice for engaged conversations' },
                  { value: 'Orus', name: 'Orus', gender: 'Male', style: 'Warm', description: 'Reassuring tone for anxious callers' },
                  { value: 'Perseus', name: 'Perseus', gender: 'Male', style: 'Professional', description: 'Polished voice for corporate clients' },
                  { value: 'Puck', name: 'Puck', gender: 'Neutral', style: 'Friendly', description: 'Inclusive voice suitable for all callers' },
                  { value: 'Sage', name: 'Sage', gender: 'Neutral', style: 'Calm', description: 'Balanced voice for diverse clientele' },
                ].map((voice) => (
                  <div
                    key={voice.value}
                    onClick={() => handleLocalChange({ voiceName: voice.value })}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      localSettings.voiceName === voice.value
                        ? 'border-[var(--primary-accent)] bg-[rgba(var(--primary-accent-rgb),0.1)]'
                        : 'border-[#2D3139] bg-[#16181D] hover:border-[#3D4149]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{voice.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          voice.gender === 'Female' ? 'bg-pink-500/20 text-pink-400' :
                          voice.gender === 'Male' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {voice.gender}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#2D3139] text-[#9CA3AF]">
                          {voice.style}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280]">{voice.description}</p>
                    {localSettings.voiceName === voice.value && (
                      <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--primary-accent)' }}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <FormGroup label="Voice Tone">
              <select
                value={settings.tone}
                onChange={(e) => handleSettingsChange({ tone: e.target.value })}
                className="form-input form-select"
              >
                <option value="Professional and Empathetic">Professional and Empathetic</option>
                <option value="Friendly and Casual">Friendly and Casual</option>
                <option value="Formal and Direct">Formal and Direct</option>
                <option value="Warm and Reassuring">Warm and Reassuring</option>
                <option value="Calm and Patient">Calm and Patient</option>
                <option value="Confident and Authoritative">Confident and Authoritative</option>
              </select>
            </FormGroup>

            <FormGroup label="Language Style" hint="How the AI should speak">
              <select
                value={settings.languageStyle}
                onChange={(e) => handleSettingsChange({ languageStyle: e.target.value })}
                className="form-input form-select"
              >
                <option value="calm, clear, and natural human voice">Calm, clear, and natural</option>
                <option value="warm, conversational, and reassuring">Warm and conversational</option>
                <option value="professional, articulate, and precise">Professional and precise</option>
                <option value="friendly, approachable, and supportive">Friendly and supportive</option>
                <option value="empathetic, understanding, and patient">Empathetic and patient</option>
              </select>
            </FormGroup>

            <FormGroup label="Opening Line" hint="The first thing the AI says when answering">
              <textarea
                value={localSettings.openingLine}
                onChange={(e) => handleLocalChange({ openingLine: e.target.value })}
                className="form-input h-24 resize-none"
                placeholder="Hi, thank you for calling..."
              />
            </FormGroup>
            <FormGroup label="Closing Line" hint="The message before ending the call">
              <textarea
                value={localSettings.closingLine || ''}
                onChange={(e) => handleLocalChange({ closingLine: e.target.value })}
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
                value={localSettings.firmBio}
                onChange={(e) => handleLocalChange({ firmBio: e.target.value })}
                className="form-input h-32 resize-none"
                placeholder="Describe your firm..."
              />
            </FormGroup>
            <FormGroup label="Response Delay (milliseconds)" hint="Add a slight pause to make responses feel more natural">
              <input
                type="number"
                value={localSettings.responseDelay}
                onChange={(e) => handleLocalChange({ responseDelay: parseInt(e.target.value) || 0 })}
                className="form-input"
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label="Urgency Keywords" hint="Comma-separated words that trigger urgent case flagging">
              <textarea
                value={localSettings.urgencyKeywords.join(', ')}
                onChange={(e) => handleLocalChange({ urgencyKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) })}
                className="form-input h-20 resize-none"
                placeholder="court date, deadline, arrested, emergency"
              />
            </FormGroup>
            <Toggle
              enabled={settings.autoFollowUp || false}
              onChange={() => handleSettingsChange({ autoFollowUp: !settings.autoFollowUp })}
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
              onChange={() => handleSettingsChange({ callRecording: !settings.callRecording })}
              label="Call Recording"
              description="Record all incoming calls for quality and training"
            />
            <Toggle
              enabled={settings.voicemailEnabled || false}
              onChange={() => handleSettingsChange({ voicemailEnabled: !settings.voicemailEnabled })}
              label="Voicemail"
              description="Enable voicemail for unanswered or after-hours calls"
            />
            <Toggle
              enabled={settings.callTransferEnabled || false}
              onChange={() => handleSettingsChange({ callTransferEnabled: !settings.callTransferEnabled })}
              label="Call Transfer"
              description="Allow AI to transfer calls to live staff when needed"
            />
            {localSettings.callTransferEnabled && (
              <FormGroup label="Transfer Phone Number">
                <input
                  type="tel"
                  value={localSettings.transferNumber || ''}
                  onChange={(e) => handleLocalChange({ transferNumber: e.target.value })}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>
            )}
            <FormGroup label="Max Call Duration (minutes)">
              <input
                type="number"
                value={localSettings.maxCallDuration || 30}
                onChange={(e) => handleLocalChange({ maxCallDuration: parseInt(e.target.value) || 30 })}
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
                    onChange={(e) => handleSettingsChange({ businessHours: { ...settings.businessHours || { start: '09:00', end: '17:00', timezone: 'EST', daysOpen: [] }, start: e.target.value } })}
                    className="form-input"
                  />
                </FormGroup>
                <FormGroup label="Closing Time">
                  <input
                    type="time"
                    value={settings.businessHours?.end || '17:00'}
                    onChange={(e) => handleSettingsChange({ businessHours: { ...settings.businessHours || { start: '09:00', end: '17:00', timezone: 'EST', daysOpen: [] }, end: e.target.value } })}
                    className="form-input"
                  />
                </FormGroup>
              </div>
            </div>
            <FormGroup label="Default Appointment Duration">
              <select
                value={settings.appointmentDuration || 30}
                onChange={(e) => handleSettingsChange({ appointmentDuration: parseInt(e.target.value) })}
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
                onChange={(e) => handleSettingsChange({ bufferTime: parseInt(e.target.value) })}
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
              onChange={() => handleSettingsChange({ emailNotifications: !settings.emailNotifications })}
              label="Email Notifications"
              description="Receive email alerts for new client intakes"
            />
            {localSettings.emailNotifications && (
              <FormGroup label="Notification Email">
                <input
                  type="email"
                  value={localSettings.notificationEmail || ''}
                  onChange={(e) => handleLocalChange({ notificationEmail: e.target.value })}
                  className="form-input"
                  placeholder="alerts@yourfirm.com"
                />
              </FormGroup>
            )}
            <Toggle
              enabled={settings.smsNotifications || false}
              onChange={() => handleSettingsChange({ smsNotifications: !settings.smsNotifications })}
              label="SMS Notifications"
              description="Receive text messages for urgent cases"
            />
            {localSettings.smsNotifications && (
              <FormGroup label="Notification Phone">
                <input
                  type="tel"
                  value={localSettings.notificationPhone || ''}
                  onChange={(e) => handleLocalChange({ notificationPhone: e.target.value })}
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>
            )}
            <Toggle
              enabled={settings.urgentAlerts || false}
              onChange={() => handleSettingsChange({ urgentAlerts: !settings.urgentAlerts })}
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
                onChange={(e) => handleSettingsChange({ language: e.target.value })}
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
                onChange={(e) => handleSettingsChange({ timezone: e.target.value })}
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
                onChange={(e) => handleSettingsChange({ dateFormat: e.target.value })}
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
                onChange={(e) => handleSettingsChange({ timeFormat: e.target.value })}
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
              onChange={() => handleSettingsChange({ hipaaMode: !settings.hipaaMode })}
              label="HIPAA Mode"
              description="Enable HIPAA-compliant data handling and encryption"
            />
            <Toggle
              enabled={settings.legalDisclaimer || false}
              onChange={() => handleSettingsChange({ legalDisclaimer: !settings.legalDisclaimer })}
              label="Legal Disclaimer"
              description="Auto-insert legal disclaimer at the start of calls"
            />
            {localSettings.legalDisclaimer && (
              <FormGroup label="Disclaimer Text">
                <textarea
                  value={localSettings.disclaimerText || ''}
                  onChange={(e) => handleLocalChange({ disclaimerText: e.target.value })}
                  className="form-input h-24 resize-none"
                  placeholder="This call may be recorded..."
                />
              </FormGroup>
            )}
            <Toggle
              enabled={settings.auditLogging || false}
              onChange={() => handleSettingsChange({ auditLogging: !settings.auditLogging })}
              label="Audit Logging"
              description="Log all system actions for compliance audits"
            />
            <FormGroup label="Data Retention (days)">
              <input
                type="number"
                value={localSettings.dataRetentionDays || 365}
                onChange={(e) => handleLocalChange({ dataRetentionDays: parseInt(e.target.value) || 365 })}
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
              onChange={() => handleSettingsChange({ highContrast: !settings.highContrast })}
              label="High Contrast Mode"
              description="Increase contrast for better visibility"
            />
            <Toggle
              enabled={settings.largeText || false}
              onChange={() => handleSettingsChange({ largeText: !settings.largeText })}
              label="Large Text"
              description="Increase font sizes throughout the interface"
            />
            <Toggle
              enabled={settings.screenReaderOptimized || false}
              onChange={() => handleSettingsChange({ screenReaderOptimized: !settings.screenReaderOptimized })}
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
              onChange={() => handleSettingsChange({ demoMode: !settings.demoMode })}
              label="Demo Mode"
              description="Enable demo mode with simulated data for presentations"
            />
            {settings.demoMode && (
              <FormGroup label="Demo Scenario">
                <select
                  value={settings.demoScenario || 'personal-injury'}
                  onChange={(e) => handleSettingsChange({ demoScenario: e.target.value })}
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
              <button
                onClick={() => {
                  setToast({ message: 'Demo data generated successfully! Sample calls and cases have been added.', type: 'success' });
                }}
                className="px-5 py-2.5 btn-primary text-black font-semibold text-[14px] rounded-lg transition"
              >
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
                onChange={(e) => handleSettingsChange({ defaultCRM: e.target.value })}
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
                onChange={(e) => handleSettingsChange({ emailService: e.target.value })}
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
                onChange={(e) => handleSettingsChange({ calendarIntegration: e.target.value })}
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
                onChange={(e) => handleSettingsChange({ smsProvider: e.target.value })}
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
                value={localSettings.adminEmail || ''}
                onChange={(e) => handleLocalChange({ adminEmail: e.target.value })}
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
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
                      // Reset to default settings
                      setSettings({
                        aiName: 'Sarah',
                        firmName: 'Ted Law Firm',
                        tone: 'Professional and Empathetic',
                        languageStyle: 'calm, clear, and natural human voice',
                        responseDelay: 0,
                        openingLine: "Hi thank you for calling Ted Law Firm. My name is Sarah, may I ask who is calling today?",
                        urgencyKeywords: ['court date', 'deadline', 'statute of limitations', 'served papers', 'arrested', 'police'],
                        voiceName: 'Kore',
                        firmBio: "We are a boutique law firm specializing in Personal Injury and Family Law. Located at 100 Legal Way, New York, NY.",
                        hipaaMode: false,
                        legalDisclaimer: true,
                        auditLogging: true,
                        callRecording: false,
                        emailNotifications: true,
                        smsNotifications: false,
                        language: 'en',
                        timezone: 'America/New_York',
                        apiKeyConfigured: true,
                      });
                      setToast({ message: 'All settings have been reset to default', type: 'success' });
                    }
                  }}
                  className="w-full px-4 py-3 bg-transparent border border-[#EF4444]/30 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 transition text-left text-[14px] font-medium"
                >
                  Reset All Settings to Default
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear ALL data? This includes all cases, call history, and analytics. This action cannot be undone.')) {
                      localStorage.removeItem('receptionistSettings');
                      localStorage.removeItem('intakeConsent');
                      setToast({ message: 'All data has been cleared. Page will reload.', type: 'success' });
                      setTimeout(() => window.location.reload(), 1500);
                    }
                  }}
                  className="w-full px-4 py-3 bg-transparent border border-[#EF4444]/30 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/10 transition text-left text-[14px] font-medium"
                >
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
    <>
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
          <div className="p-6 border-b border-[#2D3139] flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-semibold text-white">
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <p className="text-[14px] text-[#6B7280] mt-1">
                Configure {categories.find(c => c.id === activeCategory)?.label.toLowerCase()} settings for your AI receptionist
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isSaving && (
                <div className="flex items-center gap-2 saving-indicator">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin spinner-primary"></div>
                  <span className="text-sm">Auto-saving...</span>
                </div>
              )}
              {hasUnsavedChanges && !isSaving && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Unsaved changes
                </span>
              )}
              <button
                onClick={handleSaveAndDeploy}
                disabled={isDeploying}
                className={`px-5 py-2.5 rounded-lg font-semibold text-[14px] transition-all flex items-center gap-2 ${
                  isDeploying
                    ? 'bg-[#2D3139] text-[#6B7280] cursor-not-allowed'
                    : 'btn-primary text-black hover:shadow-lg hover:shadow-[var(--primary-accent)]/20'
                }`}
              >
                {isDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Save & Deploy Changes
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && editingEmployee && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1D24] border border-[#2D3139] rounded-xl w-full max-w-lg">
            <div className="p-5 border-b border-[#2D3139] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingEmployee.name ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="p-1 text-[#6B7280] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <FormGroup label="Full Name *">
                <input
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="form-input"
                  placeholder="John Smith"
                />
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Role">
                  <select
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                    className="form-input form-select"
                  >
                    <option value="Attorney">Attorney</option>
                    <option value="Partner">Partner</option>
                    <option value="Associate">Associate</option>
                    <option value="Paralegal">Paralegal</option>
                    <option value="Intake Specialist">Intake Specialist</option>
                    <option value="Legal Assistant">Legal Assistant</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Other">Other</option>
                  </select>
                </FormGroup>
                <FormGroup label="Title">
                  <input
                    type="text"
                    value={editingEmployee.title || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, title: e.target.value })}
                    className="form-input"
                    placeholder="Senior Partner"
                  />
                </FormGroup>
              </div>
              <FormGroup label="Practice Area">
                <select
                  value={editingEmployee.practiceArea || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, practiceArea: e.target.value })}
                  className="form-input form-select"
                >
                  <option value="">All Practice Areas</option>
                  <option value="Personal Injury">Personal Injury</option>
                  <option value="Family Law">Family Law</option>
                  <option value="Criminal Defense">Criminal Defense</option>
                  <option value="Corporate Law">Corporate Law</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Immigration">Immigration</option>
                  <option value="Bankruptcy">Bankruptcy</option>
                  <option value="Estate Planning">Estate Planning</option>
                </select>
              </FormGroup>
              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Email">
                  <input
                    type="email"
                    value={editingEmployee.email || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="form-input"
                    placeholder="john@firm.com"
                  />
                </FormGroup>
                <FormGroup label="Phone">
                  <input
                    type="tel"
                    value={editingEmployee.phone || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </FormGroup>
              </div>
              <FormGroup label="Routing Tag" hint="Internal tag for call routing (e.g., ext-101)">
                <input
                  type="text"
                  value={editingEmployee.routingTag || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, routingTag: e.target.value })}
                  className="form-input"
                  placeholder="ext-101"
                />
              </FormGroup>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingEmployee.isActive}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#2D3139] bg-[#0F1115] checkbox-primary"
                />
                <label htmlFor="isActive" className="text-white cursor-pointer">Active (available for routing)</label>
              </div>
            </div>
            <div className="p-5 border-t border-[#2D3139] flex justify-end gap-3">
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="px-4 py-2 text-[#6B7280] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                className="px-5 py-2 btn-primary text-black font-semibold rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default SettingsPanel;
