import React, { useState } from 'react';

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

  const toggleHipaa = () => {
    setComplianceState(prev => ({ ...prev, hipaaEnabled: !prev.hipaaEnabled }));
  };

  const toggleDisclaimer = () => {
    setComplianceState(prev => ({ ...prev, legalDisclaimerEnabled: !prev.legalDisclaimerEnabled }));
  };

  const toggleAuditLogging = () => {
    setComplianceState(prev => ({ ...prev, auditLoggingEnabled: !prev.auditLoggingEnabled }));
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Compliance & Audit</h1>
        <p className="text-lg text-gray-400">Manage HIPAA compliance, legal disclaimers, and audit logging</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HIPAA Mode */}
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${complianceState.hipaaEnabled ? 'bg-[#00FFC8]/20 border border-[#00FFC8]' : 'bg-[#2D3139] border border-[#3D4149]'}`}>
                <svg className={`w-7 h-7 ${complianceState.hipaaEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">HIPAA Mode</h3>
                <p className="text-base text-gray-400">Health data compliance protection</p>
              </div>
            </div>
            <div
              className={`toggle-switch ${complianceState.hipaaEnabled ? 'active' : ''}`}
              onClick={toggleHipaa}
            ></div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${complianceState.hipaaEnabled ? 'bg-[#00FFC8]/10 border border-[#00FFC8]/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${complianceState.hipaaEnabled ? 'bg-[#00FFC8]' : 'bg-gray-500'}`}></div>
            <span className={`text-base font-medium ${complianceState.hipaaEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`}>
              {complianceState.hipaaEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          {complianceState.hipaaEnabled && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                PHI data encryption enabled
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Access logging active
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Breach notification ready
              </div>
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${complianceState.legalDisclaimerEnabled ? 'bg-[#00FFC8]/20 border border-[#00FFC8]' : 'bg-[#2D3139] border border-[#3D4149]'}`}>
                <svg className={`w-7 h-7 ${complianceState.legalDisclaimerEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Legal Disclaimer</h3>
                <p className="text-base text-gray-400">Auto-inserted at call start</p>
              </div>
            </div>
            <div
              className={`toggle-switch ${complianceState.legalDisclaimerEnabled ? 'active' : ''}`}
              onClick={toggleDisclaimer}
            ></div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${complianceState.legalDisclaimerEnabled ? 'bg-[#00FFC8]/10 border border-[#00FFC8]/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${complianceState.legalDisclaimerEnabled ? 'bg-[#00FFC8]' : 'bg-gray-500'}`}></div>
            <span className={`text-base font-medium ${complianceState.legalDisclaimerEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`}>
              {complianceState.legalDisclaimerEnabled ? 'Active - auto-inserted' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Audit Logging */}
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${complianceState.auditLoggingEnabled ? 'bg-[#00FFC8]/20 border border-[#00FFC8]' : 'bg-[#2D3139] border border-[#3D4149]'}`}>
                <svg className={`w-7 h-7 ${complianceState.auditLoggingEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Audit Logging</h3>
                <p className="text-base text-gray-400">Track all system actions</p>
              </div>
            </div>
            <div
              className={`toggle-switch ${complianceState.auditLoggingEnabled ? 'active' : ''}`}
              onClick={toggleAuditLogging}
            ></div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${complianceState.auditLoggingEnabled ? 'bg-[#00FFC8]/10 border border-[#00FFC8]/30' : 'bg-gray-500/10 border border-gray-500/30'}`}>
            <div className={`w-2 h-2 rounded-full ${complianceState.auditLoggingEnabled ? 'bg-[#00FFC8]' : 'bg-gray-500'}`}></div>
            <span className={`text-base font-medium ${complianceState.auditLoggingEnabled ? 'text-[#00FFC8]' : 'text-gray-500'}`}>
              {complianceState.auditLoggingEnabled ? `Active - ${complianceState.auditEventCount} events logged` : 'Disabled'}
            </span>
          </div>
          {complianceState.auditLoggingEnabled && (
            <button className="mt-4 w-full px-4 py-3 bg-[#0F1115] border border-[#2D3139] rounded-lg text-white text-base font-medium hover:border-[#00FFC8]/50 transition flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Audit Log
            </button>
          )}
        </div>

        {/* Data Security */}
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-[#00FFC8]/20 border border-[#00FFC8] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Data Security</h3>
              <p className="text-base text-gray-400">Encryption & authentication</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <span className="text-base text-gray-300">Data Encryption</span>
              <span className="text-base text-[#00FFC8] font-semibold">AES-256</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <span className="text-base text-gray-300">Authentication</span>
              <span className="text-base text-[#00FFC8] font-semibold">OAuth 2.0</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#0F1115] rounded-lg border border-[#2D3139]">
              <span className="text-base text-gray-300">TLS Version</span>
              <span className="text-base text-[#00FFC8] font-semibold">TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Party Consent States */}
      <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
            <svg className="w-7 h-7 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Two-Party Consent States</h3>
            <p className="text-base text-gray-400">States requiring all-party consent for recording</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {TWO_PARTY_CONSENT_STATES.map((state) => (
            <span key={state} className="state-badge">
              {state}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Callers from these states will receive an explicit recording consent notification before any recording begins.
        </p>
      </div>

      {/* Default Disclosure */}
      <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-[#00FFC8]/20 border border-[#00FFC8] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Default Disclosure</h3>
            <p className="text-base text-gray-400">Recording consent message played to callers</p>
          </div>
        </div>
        <textarea
          value={defaultDisclosure}
          onChange={(e) => setDefaultDisclosure(e.target.value)}
          className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg px-4 py-3 text-white text-base h-28 focus:border-[#00FFC8] focus:outline-none transition resize-none"
          placeholder="Enter the default disclosure message..."
        />
        <div className="flex justify-end mt-4">
          <button className="px-6 py-3 bg-[#00FFC8] text-black font-semibold rounded-lg hover:bg-[#00FFC8]/90 transition">
            Save Disclosure
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompliancePanel;
