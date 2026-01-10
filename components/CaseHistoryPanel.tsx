import React, { useState } from 'react';
import { ClientInfo } from '../types';

interface CaseHistoryPanelProps {
    currentClient?: Partial<ClientInfo>;
    fullPage?: boolean;
}

interface CaseHistoryItem {
  id: string;
  date: string;
  clientName: string;
  email: string;
  phone: string;
  status: 'booked' | 'follow-up' | 'pending' | 'closed';
  priority: 'high' | 'medium' | 'low';
  caseType: string;
}

const CaseHistoryPanel: React.FC<CaseHistoryPanelProps> = ({ currentClient, fullPage = false }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'booked' | 'follow-up'>('all');

  // Mock data for the list
  const mockHistory: CaseHistoryItem[] = [
    { id: '1', clientName: 'Sarah Jenkins', email: 'sarah.j@email.com', phone: '(555) 123-4567', date: '01/10/2024', status: 'booked', priority: 'high', caseType: 'Personal Injury' },
    { id: '2', clientName: 'Michael Ross', email: 'mross@email.com', phone: '(555) 234-5678', date: '01/10/2024', status: 'booked', priority: 'medium', caseType: 'Criminal Defense' },
    { id: '3', clientName: 'David Kim', email: 'd.kim@email.com', phone: '(555) 345-6789', date: '01/09/2024', status: 'follow-up', priority: 'high', caseType: 'Family Law' },
    { id: '4', clientName: 'Amanda Chen', email: 'achen@email.com', phone: '(555) 456-7890', date: '01/09/2024', status: 'follow-up', priority: 'low', caseType: 'Estate Planning' },
    { id: '5', clientName: 'Robert Fox', email: 'rfox@email.com', phone: '(555) 567-8901', date: '01/08/2024', status: 'booked', priority: 'medium', caseType: 'Personal Injury' },
    { id: '6', clientName: 'Emily Watson', email: 'ewatson@email.com', phone: '(555) 678-9012', date: '01/08/2024', status: 'pending', priority: 'low', caseType: 'Corporate' },
    { id: '7', clientName: 'James Wilson', email: 'jwilson@email.com', phone: '(555) 789-0123', date: '01/07/2024', status: 'booked', priority: 'high', caseType: 'Criminal Defense' },
    { id: '8', clientName: 'Lisa Brown', email: 'lbrown@email.com', phone: '(555) 890-1234', date: '01/07/2024', status: 'follow-up', priority: 'medium', caseType: 'Family Law' },
  ];

  const filteredHistory = mockHistory.filter(item => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-[#00FFC8]/20 text-[#00FFC8] border-[#00FFC8]/30';
      case 'follow-up': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (fullPage) {
    return (
      <div className="flex flex-col gap-6 w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Case History</h1>
            <p className="text-lg text-gray-400">Complete record of all client intakes and cases</p>
          </div>
          <button className="px-6 py-3 bg-[#00FFC8] text-black font-semibold rounded-lg hover:bg-[#00FFC8]/90 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Cases', count: mockHistory.length },
            { id: 'booked', label: 'Booked', count: mockHistory.filter(i => i.status === 'booked').length },
            { id: 'follow-up', label: 'Follow-Up', count: mockHistory.filter(i => i.status === 'follow-up').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-5 py-3 rounded-lg text-base font-medium transition flex items-center gap-2 ${
                activeFilter === tab.id
                  ? 'bg-[#00FFC8]/20 text-[#00FFC8] border border-[#00FFC8]/30'
                  : 'bg-[#1E2128] text-gray-400 border border-[#2D3139] hover:border-[#00FFC8]/30'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-sm ${
                activeFilter === tab.id ? 'bg-[#00FFC8]/30' : 'bg-[#2D3139]'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 bg-[#1E2128] border border-[#2D3139] rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#0F1115] border-b border-[#2D3139] text-sm font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">Date</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Case Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
            {/* Live Client Row (if active) */}
            {currentClient && currentClient.name && (
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#00FFC8]/10 border-b border-[#00FFC8]/30 items-center animate-pulse">
                <div className="col-span-1 text-base text-white font-mono">Now</div>
                <div className="col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#00FFC8] shadow-[0_0_10px_#00FFC8]"></div>
                    <div>
                      <p className="text-base font-medium text-white">{currentClient.name}</p>
                      <p className="text-sm text-gray-500">{currentClient.email || 'Gathering info...'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-base text-gray-400">-</div>
                <div className="col-span-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-[#00FFC8]/20 text-[#00FFC8] border border-[#00FFC8]/30">
                    Active
                  </span>
                </div>
                <div className="col-span-2">-</div>
                <div className="col-span-2 text-right">
                  <button className="p-2 hover:bg-[#2D3139] rounded-lg transition">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {filteredHistory.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#2D3139] items-center hover:bg-[#0F1115] transition group">
                <div className="col-span-1 text-base text-gray-400 font-mono">{item.date}</div>
                <div className="col-span-3">
                  <div>
                    <p className="text-base font-medium text-white group-hover:text-[#00FFC8] transition">{item.clientName}</p>
                    <p className="text-sm text-gray-500">{item.email}</p>
                  </div>
                </div>
                <div className="col-span-2 text-base text-gray-400">{item.caseType}</div>
                <div className="col-span-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                  <span className="text-base text-gray-400 capitalize">{item.priority}</span>
                </div>
                <div className="col-span-2 text-right flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button className="p-2 hover:bg-[#2D3139] rounded-lg transition" title="View Details">
                    <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-[#2D3139] rounded-lg transition" title="Call">
                    <svg className="w-5 h-5 text-gray-400 hover:text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-[#2D3139] rounded-lg transition" title="More">
                    <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard compact view
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-white tracking-wide">Recent Case History</h2>
        <button className="text-[#00FFC8] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-1 flex-1 overflow-hidden flex flex-col relative">
        {/* Decorative Top Line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#00FFC8] to-transparent opacity-50 mb-1"></div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Live Client Row (if active) */}
          {currentClient && currentClient.name && (
            <div className="bg-[#00FFC8]/10 border border-[#00FFC8] rounded-lg p-3 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#00FFC8] shadow-[0_0_10px_#00FFC8]"></div>
                <span className="text-sm font-bold text-white uppercase">Active</span>
              </div>
              <span className="text-base font-medium text-white">{currentClient.name}</span>
              <span className="text-sm text-[#00FFC8] font-mono">Now</span>
              <button className="text-gray-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                </svg>
              </button>
            </div>
          )}

          {mockHistory.slice(0, 5).map((item) => (
            <div key={item.id} className="bg-[#16181D] hover:bg-[#1E2128] border border-transparent hover:border-[#2D3139] rounded-lg p-3 flex items-center justify-between group transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.status === 'booked' ? 'bg-[#00FFC8]' : item.status === 'follow-up' ? 'bg-yellow-500' : 'bg-gray-500'} opacity-50 group-hover:opacity-100 group-hover:shadow-[0_0_8px_rgba(0,255,200,0.5)] transition-all`}></div>
                <span className="text-sm font-medium text-gray-400 group-hover:text-white uppercase tracking-wider w-20">{item.status}</span>
              </div>
              <div className="h-4 w-[1px] bg-[#2D3139]"></div>
              <span className="text-base text-gray-300 group-hover:text-white flex-1 pl-4">{item.clientName}</span>
              <span className="text-sm text-gray-500 font-mono">{item.date}</span>
              <button className="text-gray-600 group-hover:text-white ml-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Decorative Corner */}
        <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
          <svg viewBox="0 0 40 40" fill="none">
            <path d="M40 40H20C20 28.9543 28.9543 20 40 20V40Z" fill="#1E2128"/>
            <path d="M35 35L40 40" stroke="#00FFC8" strokeWidth="2"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CaseHistoryPanel;
