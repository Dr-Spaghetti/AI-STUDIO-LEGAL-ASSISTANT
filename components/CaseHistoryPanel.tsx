import React from 'react';
import { ClientInfo } from '../types';

interface CaseHistoryPanelProps {
    currentClient?: Partial<ClientInfo>;
}

const CaseHistoryPanel: React.FC<CaseHistoryPanelProps> = ({ currentClient }) => {
  // Mock data for the list
  const mockHistory = [
      { id: 1, name: 'Sarah Jenkins', date: '03/13/2023', status: 'Booked' },
      { id: 2, name: 'Michael Ross', date: '03/13/2023', status: 'Booked' },
      { id: 3, name: 'David Kim', date: '06/12/2023', status: 'Booked' },
      { id: 4, name: 'Amanda Chen', date: '06/12/2023', status: 'Follow-up' },
      { id: 5, name: 'Robert Fox', date: '29/10/2023', status: 'Booked' },
  ];

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-end mb-4">
             <h2 className="text-base font-bold text-white tracking-wide">Recent Case History</h2>
             <button className="text-[#00FFA3] hover:text-white transition-colors">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
        </div>

        <div className="glass-panel rounded-2xl p-1 flex-1 overflow-hidden flex flex-col relative">
             {/* Decorative Top Line */}
             <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00FFA3] to-transparent opacity-50 mb-1"></div>

             <div className="flex-1 overflow-y-auto p-2 space-y-2">
                 {/* Live Client Row (if active) */}
                 {currentClient && currentClient.name && (
                     <div className="bg-[#00FFA3]/10 border border-[#00FFA3] rounded-lg p-3 flex items-center justify-between animate-pulse">
                         <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_10px_#00FFA3]"></div>
                             <span className="text-xs font-bold text-white uppercase">Active</span>
                         </div>
                         <span className="text-sm font-medium text-white">{currentClient.name}</span>
                         <span className="text-xs text-[#00FFA3] font-mono">Now</span>
                         <button className="text-gray-400"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg></button>
                     </div>
                 )}

                 {mockHistory.map((item) => (
                     <div key={item.id} className="bg-[#16181D] hover:bg-[#1E2128] border border-transparent hover:border-[#2D3139] rounded-lg p-3 flex items-center justify-between group transition-all cursor-pointer">
                         <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${item.status === 'Booked' ? 'bg-[#00FFA3]' : 'bg-yellow-500'} opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(0,255,163,0.5)] transition-all`}></div>
                             <span className="text-xs font-medium text-gray-400 group-hover:text-white uppercase tracking-wider w-16">{item.status}</span>
                         </div>
                         <div className="h-4 w-[1px] bg-[#2D3139]"></div>
                         <span className="text-sm text-gray-300 group-hover:text-white flex-1 pl-4">{item.name}</span>
                         <span className="text-xs text-gray-500 font-mono">{item.date}</span>
                         <button className="text-gray-600 group-hover:text-white ml-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg></button>
                     </div>
                 ))}
             </div>
             
             {/* Decorative Corner */}
             <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
                 <svg viewBox="0 0 40 40" fill="none">
                     <path d="M40 40H20C20 28.9543 28.9543 20 40 20V40Z" fill="#1E2128"/>
                     <path d="M35 35L40 40" stroke="#00FFA3" strokeWidth="2"/>
                 </svg>
             </div>
        </div>
    </div>
  );
};

export default CaseHistoryPanel;