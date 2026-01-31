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

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptHistory, currentInput, currentOutput]);

  return (
    <div className="relative overflow-hidden flex flex-col h-full bg-gradient-to-br from-[#0a0a0b] via-[#0d0f12] to-[#0a0a0b] rounded-2xl border border-[#1a1d24]">

      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(var(--primary-accent-rgb, 0, 255, 200), 0.08) 0%, transparent 60%)'
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 px-6 py-5 flex justify-between items-center border-b border-[#1a1d24]">
        <h2 className="text-[15px] font-semibold text-white tracking-wide">Live Intake & Transcript</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-[#2a2d35]'}`} />
          <span className={`text-[10px] font-semibold tracking-widest ${isActive ? 'text-red-400' : 'text-[#4a4d55]'}`}>
            REC
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">

        {/* Microphone Section */}
        <div className="flex-1 flex flex-col items-center justify-center py-8">

          {/* Glowing Orb Button */}
          <div className="relative group cursor-pointer mb-6" onClick={isActive ? endCall : startCall}>

            {/* Ambient glow when active */}
            {isActive && (
              <div
                className="absolute inset-0 rounded-full blur-3xl opacity-40 animate-pulse"
                style={{
                  backgroundColor: 'var(--primary-accent, #00FFC8)',
                  transform: 'scale(1.5)'
                }}
              />
            )}

            {/* Outer ring pulse when active */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${isActive ? 'scale-[1.4] opacity-100' : 'scale-100 opacity-0'}`}
              style={{
                border: '1px solid rgba(var(--primary-accent-rgb, 0, 255, 200), 0.2)'
              }}
            />
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 delay-75 ${isActive ? 'scale-[1.6] opacity-100' : 'scale-100 opacity-0'}`}
              style={{
                border: '1px solid rgba(var(--primary-accent-rgb, 0, 255, 200), 0.1)'
              }}
            />

            {/* Main Orb */}
            <div
              className={`
                w-36 h-36 rounded-full flex items-center justify-center relative transition-all duration-300
                ${!isActive
                  ? 'bg-[#12151a] border-2 border-[#2a2d35] hover:border-[var(--primary-accent,#00FFC8)] hover:shadow-[0_0_40px_rgba(var(--primary-accent-rgb,0,255,200),0.15)]'
                  : ''
                }
              `}
              style={isActive ? {
                background: `linear-gradient(135deg, var(--primary-accent, #00FFC8) 0%, color-mix(in srgb, var(--primary-accent, #00FFC8) 50%, #000) 100%)`,
                boxShadow: '0 0 60px rgba(var(--primary-accent-rgb, 0, 255, 200), 0.4), inset 0 -4px 20px rgba(0,0,0,0.3)'
              } : undefined}
            >
              {/* Inner Icon */}
              {isConnecting ? (
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <svg
                  className={`w-14 h-14 transition-all duration-300 ${isActive ? 'text-white' : ''}`}
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
          <span className={`text-xs font-bold tracking-[0.25em] transition-colors duration-300 ${isActive ? 'text-red-400' : 'text-white'}`}>
            {isConnecting ? 'CONNECTING...' : isActive ? 'END SESSION' : 'START INTAKE'}
          </span>

          {/* Audio Waveform Visualization */}
          <div className="h-12 flex items-center justify-center gap-[3px] mt-8 px-4">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all duration-150 ${isActive ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor: isActive
                    ? 'var(--primary-accent, #00FFC8)'
                    : '#2a2d35',
                  height: isActive
                    ? `${Math.sin(i * 0.3) * 20 + Math.random() * 20 + 8}px`
                    : '4px',
                  opacity: isActive ? 0.6 + Math.random() * 0.4 : 0.5,
                  animationDelay: `${i * 30}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="mx-5 mb-5">
          <div className="bg-[#08090b] rounded-xl border border-[#1a1d24] overflow-hidden">
            {/* Transcript Header */}
            <div className="px-4 py-2.5 border-b border-[#1a1d24] flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#5a5d65] uppercase tracking-wider">Transcript</span>
              {transcriptHistory.length > 0 && (
                <span className="text-[10px] text-[#3a3d45]">{transcriptHistory.length} messages</span>
              )}
            </div>

            {/* Transcript Content */}
            <div
              ref={scrollRef}
              className="h-40 overflow-y-auto p-4 space-y-3 scroll-smooth"
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
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }}
                  />
                  <div>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--primary-accent, #00FFC8)' }}
                    >
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

      {/* Subtle Watermark - Bottom Right Corner */}
      <div className="absolute bottom-4 right-5 pointer-events-none z-0 opacity-[0.06]">
        <div className="flex flex-col items-end gap-0">
          <span className="text-[9px] font-bold text-white tracking-wide">LITE DEPALMA</span>
          <span className="text-[9px] font-bold text-white tracking-wide">GREENBERG &</span>
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col gap-[2px]">
              <div className="w-3 h-[1.5px]" style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }} />
              <div className="w-3 h-[1.5px]" style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }} />
              <div className="w-3 h-[1.5px]" style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }} />
            </div>
            <span className="text-[10px] font-bold text-white tracking-widest">AFANADOR</span>
          </div>
        </div>
      </div>

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
      />
    </div>
  );
};

export default LiveIntakePanel;
