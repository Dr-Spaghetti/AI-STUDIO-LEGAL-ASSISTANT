import React, { useState, useCallback } from 'react';

interface ComplianceState {
  hipaaEnabled: boolean;
  legalDisclaimerEnabled: boolean;
  auditLoggingEnabled: boolean;
  auditEventCount: number;
}

const TWO_PARTY_CONSENT_STATES = ['CA', 'CT', 'FL', 'IL', 'MD', 'MA', 'MT', 'NH', 'PA', 'WA'];

const CompliancePanel: React.FC = () => {
  const [complianceState, setComplianceState] = useState<ComplianceState>({
    hipaaEnabled: false,
    legalDisclaimerEnabled: true,
    auditLoggingEnabled: true,
    auditEventCount: 6,
  });

  const [defaultDisclosure, setDefaultDisclosure] = useState(
    "This call may be recorded for quality assurance and training purposes. By continuing, you consent to the recording of this call."
  );

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Toast component
  const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);
    return (
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
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

  // Export audit log
  const handleExportAuditLog = useCallback(() => {
    // Generate mock audit log data
    const auditLog = [
      { timestamp: new Date().toISOString(), event: 'HIPAA Mode toggled', user: 'Admin', details: 'Status changed' },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Audit logging enabled', user: 'Admin', details: 'Compliance setting updated' },
      { timestamp: new Date(Date.now() - 7200000).toISOString(), event: 'Disclosure text updated', user: 'Admin', details: 'Default disclosure modified' },
      { timestamp: new Date(Date.now() - 10800000).toISOString(), event: 'User login', user: 'Admin', details: 'Successful authentication' },
      { timestamp: new Date(Date.now() - 14400000).toISOString(), event: 'Settings exported', user: 'Admin', details: 'Full configuration backup' },
      { timestamp: new Date(Date.now() - 18000000).toISOString(), event: 'Legal disclaimer enabled', user: 'Admin', details: 'Compliance setting updated' },
    ];

    const headers = ['Timestamp', 'Event', 'User', 'Details'];
    const rows = auditLog.map(log => [
      log.timestamp,
      log.event,
      log.user,
      log.details
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: 'Audit log exported successfully', type: 'success' });
  }, []);

  // Save disclosure
  const handleSaveDisclosure = useCallback(() => {
    if (!defaultDisclosure.trim()) {
      setToast({ message: 'Disclosure text cannot be empty', type: 'error' });
      return;
    }
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      setToast({ message: 'Disclosure saved successfully', type: 'success' });
    }, 300);
  }, [defaultDisclosure]);

  const toggleHipaa = () => {
    setComplianceState(prev => ({ ...prev, hipaaEnabled: !prev.hipaaEnabled }));
  };

  const toggleDisclaimer = () => {
    setComplianceState(prev => ({ ...prev, legalDisclaimerEnabled: !prev.legalDisclaimerEnabled }));
  };

  const toggleAuditLogging = () => {
    setComplianceState(prev => ({ ...prev, auditLoggingEnabled: !prev.auditLoggingEnabled }));
  };

  // Toggle Section Component
  const ToggleSection = ({
    title,
    subtitle,
    icon,
    enabled,
    onToggle,
    statusText,
    children
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    enabled: boolean;
    onToggle: () => void;
    statusText?: string;
    children?: React.ReactNode;
  }) => (
    <div className={`workflow-card transition-all ${enabled ? 'border-[#10B981]/30 bg-[#10B981]/5' : ''}`}>
      <div className="flex items-start gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
          enabled
            ? 'bg-[#10B981]/20 border border-[#10B981]'
            : 'bg-[#2D3139] border border-[#3D4149]'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[17px] font-semibold text-white">{title}</h3>
            <div
              className={`toggle-switch ${enabled ? 'active' : ''}`}
              onClick={onToggle}
              style={{ cursor: 'pointer' }}
            ></div>
          </div>
          <p className="text-[13px] text-[#6B7280] mb-3">{subtitle}</p>

          {/* Status Indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold uppercase tracking-wide ${
            enabled
              ? 'bg-[#10B981]/15 text-[#10B981]'
              : 'bg-[#6B7280]/15 text-[#6B7280]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-[#10B981]' : 'bg-[#6B7280]'}`}></div>
            {statusText || (enabled ? 'Active' : 'Disabled')}
          </div>

          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-white mb-2">Compliance & Audit</h1>
        <p className="text-[15px] text-[#9CA3AF]">Manage HIPAA compliance, legal disclaimers, and audit logging</p>
      </div>

      {/* Toggle Sections - Stacked */}
      <div className="space-y-4">
        {/* HIPAA Mode */}
        <ToggleSection
          title="HIPAA Mode"
          subtitle="Health data compliance protection for PHI handling"
          icon={
            <svg className={`w-6 h-6 ${complianceState.hipaaEnabled ? 'text-[#10B981]' : 'text-[#6B7280]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          enabled={complianceState.hipaaEnabled}
          onToggle={toggleHipaa}
        >
          {complianceState.hipaaEnabled && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-[13px] text-[#9CA3AF]">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                PHI data encryption enabled
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#9CA3AF]">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Access logging active
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#9CA3AF]">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Breach notification ready
              </div>
            </div>
          )}
        </ToggleSection>

        {/* Legal Disclaimer */}
        <ToggleSection
          title="Legal Disclaimer"
          subtitle="Auto-inserted at call start for compliance"
          icon={
            <svg className={`w-6 h-6 ${complianceState.legalDisclaimerEnabled ? 'text-[#10B981]' : 'text-[#6B7280]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          enabled={complianceState.legalDisclaimerEnabled}
          onToggle={toggleDisclaimer}
          statusText={complianceState.legalDisclaimerEnabled ? 'Auto-inserted' : 'Disabled'}
        />

        {/* Audit Logging */}
        <ToggleSection
          title="Audit Logging"
          subtitle="Track all system actions and user interactions"
          icon={
            <svg className={`w-6 h-6 ${complianceState.auditLoggingEnabled ? 'text-[#10B981]' : 'text-[#6B7280]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          enabled={complianceState.auditLoggingEnabled}
          onToggle={toggleAuditLogging}
          statusText={complianceState.auditLoggingEnabled ? `${complianceState.auditEventCount} events logged` : 'Disabled'}
        >
          {complianceState.auditLoggingEnabled && (
            <button
              onClick={handleExportAuditLog}
              className="mt-4 px-4 py-2.5 bg-[#0F1115] border border-[#2D3139] rounded-lg text-[14px] text-white font-medium hover-border-accent transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Audit Log
            </button>
          )}
        </ToggleSection>
      </div>

      {/* Two Column Layout for Remaining Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Two-Party Consent States */}
        <div className="workflow-card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-white">Two-Party Consent States</h3>
              <p className="text-[13px] text-[#6B7280]">States requiring all-party consent for recording</p>
            </div>
          </div>

          {/* State Badges Grid - 2 columns */}
          <div className="grid grid-cols-5 gap-2">
            {TWO_PARTY_CONSENT_STATES.map((state) => (
              <span key={state} className="state-badge text-center">
                {state}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-[#6B7280]">
            Callers from these states will receive an explicit recording consent notification.
          </p>
        </div>

        {/* Data Security */}
        <div className="workflow-card">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl icon-container-primary flex items-center justify-center">
              <svg className="w-6 h-6 icon-active" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-white">Data Security</h3>
              <p className="text-[13px] text-[#6B7280]">Encryption & authentication standards</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <span className="text-[14px] text-[#9CA3AF]">Data Encryption</span>
              <span className="text-[14px] font-semibold icon-active">AES-256</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <span className="text-[14px] text-[#9CA3AF]">Authentication</span>
              <span className="text-[14px] font-semibold icon-active">OAuth 2.0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <span className="text-[14px] text-[#9CA3AF]">TLS Version</span>
              <span className="text-[14px] font-semibold icon-active">TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Default Disclosure - Full Width */}
      <div className="workflow-card">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
            </svg>
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-white">Default Disclosure</h3>
            <p className="text-[13px] text-[#6B7280]">Recording consent message played to callers</p>
          </div>
        </div>
        <textarea
          value={defaultDisclosure}
          onChange={(e) => setDefaultDisclosure(e.target.value)}
          className="form-input h-24 resize-none"
          placeholder="Enter the default disclosure message..."
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSaveDisclosure}
            disabled={isSaving}
            className="px-5 py-2.5 btn-primary text-black text-[14px] font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            )}
            Save Disclosure
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default CompliancePanel;
