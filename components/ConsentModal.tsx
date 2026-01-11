import React, { useState } from 'react';
import { US_STATES, TWO_PARTY_CONSENT_STATES, USState } from '../lib/types';

interface ConsentModalProps {
  onAccept: (consent: ConsentData) => void;
  firmName?: string;
  customDisclaimer?: string;
  recordingNotice?: string;
  primaryColor?: string;
}

export interface ConsentData {
  disclaimerAccepted: boolean;
  disclaimerAcceptedAt: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  recordingConsent: boolean;
  termsAccepted: boolean;
  jurisdictionState: USState | null;
}

const ConsentModal: React.FC<ConsentModalProps> = ({
  onAccept,
  firmName = 'Legal Intake',
  customDisclaimer,
  recordingNotice,
  primaryColor = '#00FFC8',
}) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [recordingConsent, setRecordingConsent] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [jurisdictionState, setJurisdictionState] = useState<USState | null>(null);

  const isTwoPartyState = jurisdictionState && TWO_PARTY_CONSENT_STATES.includes(jurisdictionState);

  const canProceed = disclaimerAccepted && termsAccepted && jurisdictionState;

  const handleAccept = () => {
    if (!canProceed) return;

    onAccept({
      disclaimerAccepted,
      disclaimerAcceptedAt: new Date().toISOString(),
      smsOptIn,
      emailOptIn,
      recordingConsent: isTwoPartyState ? recordingConsent : true,
      termsAccepted,
      jurisdictionState,
    });
  };

  const defaultDisclaimer = `Welcome to ${firmName}'s AI-powered intake assistant. This system is designed to gather information about your potential legal matter to help determine how we may assist you.

**Important Notice:**
- This is an AI assistant, not a licensed attorney
- No attorney-client relationship is formed through this interaction
- The information you provide will be reviewed by our legal team
- This is not legal advice and should not be relied upon as such

By proceeding, you consent to the collection and processing of the information you provide for the purpose of evaluating your potential legal matter.`;

  const defaultRecordingNotice = `This conversation may be recorded and stored for quality assurance, training, and to improve our services.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0F1115] border border-[#2D3139] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#2D3139]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15`, border: `1px solid ${primaryColor}40` }}
            >
              <svg className="w-5 h-5" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white">Before We Begin</h2>
              <p className="text-[13px] text-[#6B7280]">Please review and accept the following</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-5">
          {/* AI Disclaimer */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              AI Disclaimer
            </h3>
            <div className="p-4 bg-[#1A1D24] border border-[#2D3139] rounded-lg text-[13px] text-[#9CA3AF] leading-relaxed whitespace-pre-line">
              {customDisclaimer || defaultDisclaimer}
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 bg-[#1A1D24] border border-[#2D3139] rounded peer-checked:border-[#00FFC8] peer-checked:bg-[#00FFC8]/20 transition-all flex items-center justify-center">
                  {disclaimerAccepted && (
                    <svg className="w-3 h-3" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-[#9CA3AF] group-hover:text-white transition">
                I understand and accept that this is an AI assistant and not legal advice
                <span className="text-red-400 ml-1">*</span>
              </span>
            </label>
          </div>

          {/* Jurisdiction Selection */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Your Location
            </h3>
            <select
              value={jurisdictionState || ''}
              onChange={(e) => setJurisdictionState(e.target.value as USState || null)}
              className="form-select w-full"
            >
              <option value="">Select your state *</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {isTwoPartyState && (
              <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg">
                <p className="text-[12px] text-[#F59E0B] font-medium mb-2">
                  Two-Party Consent State
                </p>
                <p className="text-[12px] text-[#9CA3AF]">
                  {jurisdictionState} requires consent from all parties before recording. Please confirm below.
                </p>
              </div>
            )}
          </div>

          {/* Recording Consent (for two-party states) */}
          {isTwoPartyState && (
            <div className="space-y-3">
              <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                Recording Consent
              </h3>
              <div className="p-4 bg-[#1A1D24] border border-[#2D3139] rounded-lg text-[13px] text-[#9CA3AF]">
                {recordingNotice || defaultRecordingNotice}
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={recordingConsent}
                    onChange={(e) => setRecordingConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-[#1A1D24] border border-[#2D3139] rounded peer-checked:border-[#00FFC8] peer-checked:bg-[#00FFC8]/20 transition-all flex items-center justify-center">
                    {recordingConsent && (
                      <svg className="w-3 h-3" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[13px] text-[#9CA3AF] group-hover:text-white transition">
                  I consent to the recording of this conversation
                </span>
              </label>
            </div>
          )}

          {/* Communication Preferences */}
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              Communication Preferences
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group p-3 bg-[#1A1D24] border border-[#2D3139] rounded-lg hover:border-[#3D4149] transition">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={emailOptIn}
                    onChange={(e) => setEmailOptIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-[#0F1115] border border-[#2D3139] rounded peer-checked:border-[#00FFC8] peer-checked:bg-[#00FFC8]/20 transition-all flex items-center justify-center">
                    {emailOptIn && (
                      <svg className="w-3 h-3" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[13px] text-white">Email updates</span>
                  <p className="text-[11px] text-[#6B7280]">Receive follow-up information via email</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group p-3 bg-[#1A1D24] border border-[#2D3139] rounded-lg hover:border-[#3D4149] transition">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={smsOptIn}
                    onChange={(e) => setSmsOptIn(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 bg-[#0F1115] border border-[#2D3139] rounded peer-checked:border-[#00FFC8] peer-checked:bg-[#00FFC8]/20 transition-all flex items-center justify-center">
                    {smsOptIn && (
                      <svg className="w-3 h-3" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[13px] text-white">SMS updates</span>
                  <p className="text-[11px] text-[#6B7280]">Receive text message reminders and updates</p>
                </div>
              </label>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="pt-3 border-t border-[#2D3139]">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 bg-[#1A1D24] border border-[#2D3139] rounded peer-checked:border-[#00FFC8] peer-checked:bg-[#00FFC8]/20 transition-all flex items-center justify-center">
                  {termsAccepted && (
                    <svg className="w-3 h-3" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-[#9CA3AF] group-hover:text-white transition">
                I agree to the <a href="#" className="underline hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>
                <span className="text-red-400 ml-1">*</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2D3139] bg-[#0A0A0B]">
          <button
            onClick={handleAccept}
            disabled={!canProceed}
            className={`w-full py-3 rounded-lg text-[14px] font-semibold transition-all ${
              canProceed
                ? 'bg-[#00FFC8] text-black hover:bg-[#00FFC8]/90 cursor-pointer'
                : 'bg-[#2D3139] text-[#6B7280] cursor-not-allowed'
            }`}
            style={canProceed ? { backgroundColor: primaryColor } : undefined}
          >
            {canProceed ? 'Continue to Intake' : 'Please complete required fields'}
          </button>
          <p className="text-[11px] text-[#6B7280] text-center mt-3">
            Your information is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
