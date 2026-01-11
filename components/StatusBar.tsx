import React, { useState, useCallback } from 'react';

const StatusBar = () => {
  const [aiPersonaEnabled, setAiPersonaEnabled] = useState(true);
  const [privacyModeEnabled, setPrivacyModeEnabled] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);

  // Toast component
  const Toast = ({ message }: { message: string }) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }, []);
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg bg-[#1A1D24] border border-[#00FFC8]/30 text-white">
        <svg className="w-4 h-4 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  };

  const toggleAiPersona = useCallback(() => {
    setAiPersonaEnabled(prev => {
      const newValue = !prev;
      setToast({ message: `AI Persona ${newValue ? 'enabled' : 'disabled'}` });
      return newValue;
    });
  }, []);

  const togglePrivacyMode = useCallback(() => {
    setPrivacyModeEnabled(prev => {
      const newValue = !prev;
      setToast({ message: `Privacy Mode ${newValue ? 'enabled' : 'disabled'}` });
      return newValue;
    });
  }, []);

  return (
    <>
      <div className="h-16 mt-6 glass-panel rounded-2xl flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
          {/* Decorative Glow Line */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#00FFC8] to-transparent opacity-30"></div>

          <div className="flex items-center gap-6">
              <h3 className="text-sm font-bold text-gray-400 tracking-wide uppercase mr-4">System Status & Settings</h3>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFC8]/10 border border-[#00FFC8]/30">
                  <div className="w-2 h-2 rounded-full bg-[#00FFC8] shadow-[0_0_8px_#00FFC8]"></div>
                  <span className="text-xs font-bold text-[#00FFC8] uppercase tracking-wider">System Ready</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2128] border border-[#2D3139]">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Gemini Ultra API</span>
              </div>
          </div>

          <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                   <span className="text-xs font-medium text-gray-400 uppercase">AI Persona</span>
                   <div
                     onClick={toggleAiPersona}
                     className={`w-12 h-6 rounded-full p-1 cursor-pointer flex transition-all duration-200 ${
                       aiPersonaEnabled
                         ? 'bg-[#00FFC8] justify-end shadow-[0_0_10px_rgba(0,255,163,0.3)]'
                         : 'bg-[#2D3139] justify-start'
                     }`}
                   >
                       <div className={`w-4 h-4 rounded-full shadow-sm transition-colors ${
                         aiPersonaEnabled ? 'bg-white' : 'bg-gray-500'
                       }`}></div>
                   </div>
               </div>

               <div className="flex items-center gap-3">
                   <span className="text-xs font-medium text-gray-400 uppercase">Privacy Mode</span>
                   <div
                     onClick={togglePrivacyMode}
                     className={`w-12 h-6 rounded-full p-1 cursor-pointer flex transition-all duration-200 ${
                       privacyModeEnabled
                         ? 'bg-[#00FFC8] justify-end shadow-[0_0_10px_rgba(0,255,163,0.3)]'
                         : 'bg-[#2D3139] justify-start'
                     }`}
                   >
                       <div className={`w-4 h-4 rounded-full shadow-sm transition-colors ${
                         privacyModeEnabled ? 'bg-white' : 'bg-gray-500'
                       }`}></div>
                   </div>
               </div>
          </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} />}
    </>
  );
};

export default StatusBar;
