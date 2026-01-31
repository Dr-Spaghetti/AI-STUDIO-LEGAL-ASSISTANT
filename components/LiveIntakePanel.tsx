import React, { useEffect, useRef } from 'react';
import { CallState } from '../types';

interface LiveIntakePanelProps {
  callState: CallState;
  startCall: () => void;
  endCall: () => void;
  transcriptHistory: { speaker: string; text: string }[];
  currentInput: string;
  currentOutput: string;
}

const LiveIntakePanel: React.FC<LiveIntakePanelProps> = ({
  callState,
  startCall,
  endCall,
  transcriptHistory,
  currentInput,
  currentOutput
}) => {
  const isActive = callState === CallState.ACTIVE;
  const isConnecting = callState === CallState.CONNECTING;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptHistory, currentInput, currentOutput]);

  return (
    <div className="relative overflow-hidden flex flex-col h-full bg-[#0a0a0b] rounded-2xl border border-[#1a1d24]">

      {/* Header */}
      <div className="px-6 py-5 flex justify-between items-center border-b border-[#1a1d24]">
        <h2 className="text-[15px] font-semibold text-white">Live Intake & Transcript</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-[#2a2d35]'}`} />
          <span className={`text-[10px] font-semibold tracking-widest ${isActive ? 'text-red-400' : 'text-[#4a4d55]'}`}>
            REC
          </span>
        </div>
      </div>

      {/* Microphone Section - Clean, no overlays */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">

        {/* Microphone Button */}
        <div className="relative group cursor-pointer mb-6" onClick={isActive ? endCall : startCall}>

          {/* Glow effect when active */}
          {isActive && (
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30"
              style={{
                backgroundColor: 'var(--primary-accent, #00FFC8)',
                transform: 'scale(1.8)'
              }}
            />
          )}

          {/* Pulse rings when active */}
          {isActive && (
            <>
              <div
                className="absolute inset-0 rounded-full scale-[1.3] animate-ping opacity-20"
                style={{ border: '1px solid var(--primary-accent, #00FFC8)' }}
              />
            </>
          )}

          {/* Main Button Circle */}
          <div
            className={`
              w-36 h-36 rounded-full flex items-center justify-center relative transition-all duration-300
              ${!isActive ? 'bg-[#12151a] border-2 border-[#2a2d35] hover:border-[#00FFC8] hover:shadow-[0_0_30px_rgba(0,255,200,0.15)]' : ''}
            `}
            style={isActive ? {
              background: 'linear-gradient(135deg, var(--primary-accent, #00FFC8) 0%, #00aa88 100%)',
              boxShadow: '0 0 50px rgba(0, 255, 200, 0.4)'
            } : undefined}
          >
            {isConnecting ? (
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                className={`w-14 h-14 ${isActive ? 'text-white' : ''}`}
                style={!isActive ? { color: 'var(--primary-accent, #00FFC8)' } : undefined}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </div>
        </div>

        {/* Button Label */}
        <span className={`text-xs font-bold tracking-[0.2em] ${isActive ? 'text-red-400' : 'text-white'}`}>
          {isConnecting ? 'CONNECTING...' : isActive ? 'END SESSION' : 'START INTAKE'}
        </span>

        {/* Waveform */}
        <div className="h-10 flex items-center justify-center gap-[3px] mt-8">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full transition-all"
              style={{
                backgroundColor: isActive ? 'var(--primary-accent, #00FFC8)' : '#2a2d35',
                height: isActive ? `${8 + Math.random() * 24}px` : '4px',
                opacity: isActive ? 0.5 + Math.random() * 0.5 : 0.4
              }}
            />
          ))}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="mx-5 mb-5">
        <div className="bg-[#08090b] rounded-xl border border-[#1a1d24] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[#1a1d24] flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#5a5d65] uppercase tracking-wider">Transcript</span>
            {transcriptHistory.length > 0 && (
              <span className="text-[10px] text-[#3a3d45]">{transcriptHistory.length} messages</span>
            )}
          </div>

          <div
            ref={scrollRef}
            className="h-40 overflow-y-auto p-4 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2d35 transparent' }}
          >
            {transcriptHistory.length === 0 && !currentInput && !currentOutput && (
              <div className="h-full flex items-center justify-center">
                <span className="text-[13px] text-[#3a3d45] italic">Waiting for conversation to start...</span>
              </div>
            )}

            {transcriptHistory.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${t.speaker === 'ai' ? '' : 'bg-[#4a4d55]'}`}
                  style={t.speaker === 'ai' ? { backgroundColor: 'var(--primary-accent, #00FFC8)' } : undefined}
                />
                <div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${t.speaker === 'ai' ? '' : 'text-[#6a6d75]'}`}
                    style={t.speaker === 'ai' ? { color: 'var(--primary-accent, #00FFC8)' } : undefined}
                  >
                    {t.speaker === 'ai' ? 'AI Assistant' : 'Caller'}
                  </span>
                  <p className="text-[13px] text-[#c0c3cb] leading-relaxed mt-0.5">{t.text}</p>
                </div>
              </div>
            ))}

            {currentInput && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-[#4a4d55]" />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6a6d75]">Caller</span>
                  <p className="text-[13px] text-[#c0c3cb] leading-relaxed mt-0.5">{currentInput}</p>
                </div>
              </div>
            )}

            {currentOutput && (
              <div className="flex gap-3 animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }} />
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--primary-accent, #00FFC8)' }}>
                    AI Assistant
                  </span>
                  <p className="text-[13px] text-[#c0c3cb] leading-relaxed mt-0.5">{currentOutput}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveIntakePanel;
