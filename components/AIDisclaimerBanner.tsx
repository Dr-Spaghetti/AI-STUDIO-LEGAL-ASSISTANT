import React, { useState } from 'react';

interface AIDisclaimerBannerProps {
  firmName?: string;
  primaryColor?: string;
  variant?: 'minimal' | 'full';
  onLearnMore?: () => void;
}

const AIDisclaimerBanner: React.FC<AIDisclaimerBannerProps> = ({
  firmName = 'Lite DePalma Greenberg & Afanador',
  primaryColor = '#00FFC8',
  variant = 'minimal',
  onLearnMore,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'minimal') {
    return (
      <div className="w-full bg-[#F59E0B]/10 border-b border-[#F59E0B]/30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#F59E0B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span className="text-[12px] font-medium text-[#F59E0B]">
              AI Assistant
            </span>
          </div>
          <span className="text-[12px] text-[#9CA3AF]">
            This is an AI-powered intake assistant. This is not legal advice.
          </span>
          {onLearnMore && (
            <button
              onClick={onLearnMore}
              className="text-[12px] text-[#F59E0B] hover:text-[#FBBF24] underline transition"
            >
              Learn more
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full variant - expandable
  return (
    <div className="w-full bg-[#F59E0B]">
      <div className="w-full px-4">
        {/* Collapsed state */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/20 rounded-full">
              <span className="text-[10px] text-black/80">✦</span>
              <span className="text-[10px] font-bold text-black/90 uppercase tracking-wider">
                AI Powered
              </span>
            </div>
            <span className="text-[12px] text-black/90 font-medium">
              You are speaking with an AI assistant from <span className="font-semibold text-black">{firmName}, LLC</span>
            </span>
            <span className="text-[12px] text-black/70 font-medium">
              — This is not legal advice
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-black/70 group-hover:text-black transition">
            <span className="text-[11px] font-medium">{isExpanded ? 'Hide details' : 'More info'}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded state */}
        {isExpanded && (
          <div className="pb-4 pt-3 border-t border-black/20 mt-1 bg-[#0A0A0B] mx-[-16px] px-4 rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* What this is */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-white mb-1">What is this?</h4>
                  <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
                    An AI assistant that gathers information about your legal matter to help our team evaluate your case.
                  </p>
                </div>
              </div>

              {/* What this is NOT */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-white mb-1">What this is NOT</h4>
                  <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
                    This is not legal advice. No attorney-client relationship is formed. Always consult a licensed attorney.
                  </p>
                </div>
              </div>

              {/* Your data */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-[13px] font-semibold text-white mb-1">Your Information</h4>
                  <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
                    Your data is encrypted and will only be reviewed by {firmName}'s legal team.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency notice */}
            <div className="mt-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-[12px] text-[#EF4444] font-semibold mb-0.5">Emergency?</p>
                <p className="text-[12px] text-[#9CA3AF]">
                  If you're in immediate danger, please call <span className="text-white font-medium">911</span>.
                  For crisis support, call <span className="text-white font-medium">988</span> (Suicide & Crisis Lifeline).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDisclaimerBanner;
