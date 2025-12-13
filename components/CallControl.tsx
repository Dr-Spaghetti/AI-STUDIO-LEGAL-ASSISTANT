import React from 'react';
import { CallState } from '../types';

interface CallControlProps {
  callState: CallState;
  startCall: () => void;
  endCall: () => void;
  errorMessage: string | null;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  availableVoices: Record<string, string>;
}

const MicIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM11 5v6a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0v6a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zM19 10v1a7 7 0 0 1-14 0v-1h2v1a5 5 0 0 0 10 0v-1h2zM5 20h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2z" />
  </svg>
);

const StopIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const CallControl: React.FC<CallControlProps> = ({ 
  callState, 
  startCall, 
  endCall, 
  errorMessage, 
  selectedVoice, 
  onVoiceChange, 
  availableVoices 
}) => {
    const isCallActive = callState === CallState.ACTIVE || callState === CallState.CONNECTING;
    const isProcessing = callState === CallState.PROCESSING;

    const statusText = {
      [CallState.IDLE]: 'SYSTEM READY',
      [CallState.CONNECTING]: 'CONNECTING...',
      [CallState.ACTIVE]: 'LIVE CAPTURE ACTIVE',
      [CallState.PROCESSING]: 'GENERATING REPORT...',
      [CallState.ENDED]: 'SESSION ENDED',
      [CallState.ERROR]: 'SYSTEM ERROR',
    }[callState];

    const statusColorClass = {
        [CallState.IDLE]: 'bg-[#00FFA3]',
        [CallState.CONNECTING]: 'bg-yellow-400',
        [CallState.ACTIVE]: 'bg-red-500',
        [CallState.PROCESSING]: 'bg-purple-500',
        [CallState.ENDED]: 'bg-gray-500',
        [CallState.ERROR]: 'bg-red-500',
    }[callState];

    return (
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-2xl p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6">
            {/* Status Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColorClass} animate-pulse`}></span>
                    <span className="text-[11px] font-medium tracking-wider text-[#00FFA3] uppercase">{statusText}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#00FFA3]/30 bg-[#00FFA3]/10">
                    <SparkleIcon className="w-3 h-3 text-[#00FFA3]" />
                    <span className="text-[11px] font-semibold text-white">Gemini Live API</span>
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                    {errorMessage}
                </div>
            )}

            {/* Voice Selection */}
            <div className="space-y-2">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">AI Voice Personality</label>
                <div className="relative">
                    <select
                        value={selectedVoice}
                        onChange={(e) => onVoiceChange(e.target.value)}
                        disabled={isCallActive || isProcessing}
                        className="w-full bg-[#252830] border border-[#353945] text-white text-sm rounded-lg focus:ring-[#00FFA3] focus:border-[#00FFA3] block p-3 pr-10 appearance-none disabled:opacity-50 transition-all"
                    >
                        {Object.entries(availableVoices).map(([key, name]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
            </div>

            {/* Main Action Button */}
            <div className="flex flex-col items-center justify-center py-6 relative">
                <div className="relative">
                    {/* Animated Rings - only visible when active */}
                    {isCallActive && (
                        <>
                            <div className="animate-pulse-ring absolute inset-0 m-auto border-[#00FFA3]"></div>
                            <div className="animate-pulse-ring absolute inset-0 m-auto border-[#00FFA3] animation-delay-500"></div>
                        </>
                    )}
                    
                    <button
                        onClick={isCallActive ? endCall : startCall}
                        disabled={isProcessing}
                        className={`
                            relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105
                            ${isCallActive 
                                ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_40px_rgba(239,68,68,0.4)]' 
                                : 'bg-gradient-to-br from-[#00FFA3] to-[#00D88A] glow-effect hover:glow-effect-active'
                            }
                            disabled:grayscale disabled:cursor-not-allowed
                        `}
                    >
                        {isCallActive ? (
                            <StopIcon className="w-12 h-12 text-white" />
                        ) : (
                            <MicIcon className="w-12 h-12 text-[#0A0B0D]" />
                        )}
                    </button>
                </div>
                
                <p className="mt-6 text-sm font-semibold text-gray-400 uppercase tracking-widest transition-opacity duration-300">
                    {isCallActive ? 'Stop Session' : 'Start Intake'}
                </p>
            </div>
            
            <div className="text-center">
                 <p className="text-[11px] text-gray-500">
                    Ensure microphone permissions are enabled.
                 </p>
            </div>
        </div>
    );
};

export default CallControl;