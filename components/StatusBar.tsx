import React from 'react';

const StatusBar = () => {
  return (
    <div className="h-16 mt-6 glass-panel rounded-2xl flex items-center justify-between px-6 shrink-0 relative overflow-hidden">
        {/* Decorative Glow Line */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent opacity-30"></div>

        <div className="flex items-center gap-6">
            <h3 className="text-sm font-bold text-gray-400 tracking-wide uppercase mr-4">System Status & Settings</h3>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/30">
                <div className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]"></div>
                <span className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider">System Ready</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E2128] border border-[#2D3139]">
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Gemini Ultra API</span>
            </div>
        </div>

        <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                 <span className="text-xs font-medium text-gray-400 uppercase">AI Persona</span>
                 <div className="w-12 h-6 bg-[#00FFA3] rounded-full p-1 cursor-pointer flex justify-end shadow-[0_0_10px_rgba(0,255,163,0.3)]">
                     <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                 </div>
             </div>
             
             <div className="flex items-center gap-3">
                 <span className="text-xs font-medium text-gray-400 uppercase">Privacy Mode</span>
                 <div className="w-12 h-6 bg-[#2D3139] rounded-full p-1 cursor-pointer flex justify-start">
                     <div className="w-4 h-4 bg-gray-500 rounded-full shadow-sm"></div>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default StatusBar;