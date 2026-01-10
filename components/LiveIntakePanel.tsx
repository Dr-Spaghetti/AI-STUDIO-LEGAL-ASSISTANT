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
    <div className="glass-panel rounded-3xl p-1 relative overflow-hidden flex flex-col h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#2D3139]">
      {/* Top Header */}
      <div className="p-6 flex justify-between items-start z-10 relative">
        <h2 className="text-lg font-bold text-white tracking-wide">Live Intake & Transcript</h2>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className="text-[10px] font-bold text-gray-400 tracking-widest">REC</span>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
        
        {/* Glowing Orb Button */}
        <div className="relative group cursor-pointer" onClick={isActive ? endCall : startCall}>
           {/* Outer Glow Rings */}
           <div className={`absolute inset-0 rounded-full border border-[#00FFC8]/30 scale-125 transition-transform duration-1000 ${isActive ? 'animate-pulse' : 'opacity-0'}`}></div>
           <div className={`absolute inset-0 rounded-full border border-[#00FFC8]/10 scale-150 transition-transform duration-1000 delay-100 ${isActive ? 'animate-pulse' : 'opacity-0'}`}></div>
           
           {/* Main Orb */}
           <div className={`
              w-40 h-40 rounded-full flex items-center justify-center relative transition-all duration-500
              ${isActive 
                ? 'bg-gradient-to-br from-[#00FFC8] to-[#008F5B] shadow-[0_0_60px_rgba(0,255,163,0.4)]' 
                : 'bg-[#1E2128] border-2 border-[#2D3139] hover:border-[#00FFC8] hover:shadow-[0_0_30px_rgba(0,255,163,0.2)]'
              }
           `}>
              {/* Inner Icon */}
              {isConnecting ? (
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isActive ? (
                  <div className="w-12 h-12 bg-white mask-microphone animate-pulse">
                     <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </div>
              ) : (
                 <svg className="w-12 h-12 text-[#00FFC8]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              )}
           </div>
           
           {/* Label */}
           <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-bold text-white tracking-[0.2em]">{isActive ? 'STOP SESSION' : 'START INTAKE'}</span>
           </div>
        </div>

        {/* Waveform Visualization (Decorative) */}
        <div className="h-16 flex items-center gap-1 mt-14 opacity-50">
            {Array.from({ length: 40 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-[#00FFC8] rounded-full transition-all duration-300 ${isActive ? 'wave-bar' : 'h-1'}`}
                  style={{ 
                      height: isActive ? `${Math.random() * 100}%` : '4px',
                      animationDelay: `${i * 0.05}s`
                  }}
                ></div>
            ))}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="h-48 bg-black/20 backdrop-blur-md mx-6 mb-6 rounded-2xl border border-white/5 p-4 overflow-hidden flex flex-col relative z-10">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#00FFC8] to-transparent opacity-50"></div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth">
             {transcriptHistory.length === 0 && !currentInput && !currentOutput && (
                 <div className="h-full flex items-center justify-center text-gray-600 text-xs italic">
                     Waiting for conversation to start...
                 </div>
             )}
             
             {transcriptHistory.map((t, i) => (
                 <p key={i} className="text-sm">
                     <span className={`${t.speaker === 'ai' ? 'text-[#00FFC8]' : 'text-gray-400'} font-bold text-xs uppercase mr-2`}>
                         {t.speaker === 'ai' ? 'AI Assistant' : 'Caller'}
                     </span>
                     <span className="text-gray-300">{t.text}</span>
                 </p>
             ))}
             
             {currentInput && (
                 <p className="text-sm animate-pulse">
                     <span className="text-gray-400 font-bold text-xs uppercase mr-2">Caller</span>
                     <span className="text-gray-300">{currentInput}</span>
                 </p>
             )}
             {currentOutput && (
                 <p className="text-sm animate-pulse">
                     <span className="text-[#00FFC8] font-bold text-xs uppercase mr-2">AI Assistant</span>
                     <span className="text-gray-300">{currentOutput}</span>
                 </p>
             )}
          </div>
      </div>

      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FFC8] rounded-full filter blur-[120px] opacity-[0.05] pointer-events-none"></div>
      
      {/* Decorative Particle Dust */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
    </div>
  );
};

export default LiveIntakePanel;