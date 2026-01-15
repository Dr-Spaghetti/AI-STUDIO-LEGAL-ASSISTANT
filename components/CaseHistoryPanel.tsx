import React, { useState, useCallback, useEffect } from 'react';
import { ClientInfo } from '../types';
import { getCases, getCaseCounts, type CaseHistoryItem, isDatabaseConnected } from '../lib/cases';

interface CaseHistoryPanelProps {
    currentClient?: Partial<ClientInfo>;
    fullPage?: boolean;
    onNavigate?: (tab: string) => void;
    tenantId?: string;
}

const CaseHistoryPanel: React.FC<CaseHistoryPanelProps> = ({ currentClient, fullPage = false, onNavigate, tenantId }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'booked' | 'follow-up'>('all');
  const [selectedCase, setSelectedCase] = useState<CaseHistoryItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cases, setCases] = useState<CaseHistoryItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, booked: 0, followUp: 0, pending: 0, inProgress: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  // Fetch cases data
  useEffect(() => {
    async function fetchCases() {
      setIsLoading(true);
      try {
        const [casesData, countsData] = await Promise.all([
          getCases(tenantId),
          getCaseCounts(tenantId),
        ]);
        setCases(casesData);
        setCounts(countsData);
        setIsLiveData(isDatabaseConnected());
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCases();
  }, [tenantId]);

  // Toast component
  const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => {
    React.useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);
    return (
      <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
      }`}>
        {type === 'success' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span className="font-medium">{message}</span>
      </div>
    );
  };

  // Export CSV functionality
  const handleExportCSV = useCallback(() => {
    const escapeCsvField = (field: unknown): string => {
      const str = String(field ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Date', 'Client Name', 'Email', 'Phone', 'Status', 'Priority', 'Case Type'];
    const rows = cases.map(item => [
      item.date,
      item.clientName,
      item.email,
      item.phone,
      item.status,
      item.priority,
      item.caseType
    ].map(escapeCsvField).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `case-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: 'CSV exported successfully', type: 'success' });
  }, [cases]);

  // Action handlers
  const handleViewDetails = useCallback((item: CaseHistoryItem) => {
    setSelectedCase(item);
  }, []);

  const handleCall = useCallback((phone: string, name: string) => {
    window.open(`tel:${phone.replace(/[^\d+]/g, '')}`);
    setToast({ message: `Initiating call to ${name}...`, type: 'success' });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [casesData, countsData] = await Promise.all([
        getCases(tenantId),
        getCaseCounts(tenantId),
      ]);
      setCases(casesData);
      setCounts(countsData);
      setToast({ message: isLiveData ? 'Data refreshed from database' : 'Data refreshed', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, isLiveData]);

  const handleViewAllCases = useCallback(() => {
    if (onNavigate) {
      onNavigate('history');
    }
  }, [onNavigate]);

  // Filter cases based on active filter
  const filteredCases = cases.filter(item => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <span className="status-badge active"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>Booked</span>;
      case 'follow-up':
        return <span className="status-badge warning"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>Follow-up</span>;
      case 'pending':
        return <span className="status-badge inactive"><div className="w-1.5 h-1.5 rounded-full bg-[#6B7280]"></div>Pending</span>;
      case 'closed':
        return <span className="status-badge inactive"><div className="w-1.5 h-1.5 rounded-full bg-[#6B7280]"></div>Closed</span>;
      default:
        return <span className="status-badge inactive">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="priority-badge high">High</span>;
      case 'medium':
        return <span className="priority-badge medium">Medium</span>;
      case 'low':
        return <span className="priority-badge low">Low</span>;
      default:
        return <span className="priority-badge">{priority}</span>;
    }
  };

  if (fullPage) {
    return (
      <div className="flex flex-col gap-6 w-full h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-white mb-2">Case History</h1>
            <p className="text-[15px] text-[#9CA3AF]">Complete record of all client intakes and cases</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 text-black text-[14px] font-semibold rounded-lg transition flex items-center gap-2"
            style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All Cases', count: counts.all },
            { id: 'booked', label: 'Booked', count: counts.booked },
            { id: 'follow-up', label: 'Follow-Up', count: counts.followUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`tab-button flex items-center gap-2 ${activeFilter === tab.id ? 'active' : ''}`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-[12px] ${
                  activeFilter === tab.id ? '' : 'bg-[#2D3139] text-[#6B7280]'
                }`}
                style={activeFilter === tab.id ? {
                  backgroundColor: 'rgba(var(--primary-accent-rgb, 0, 255, 200), 0.2)',
                  color: 'var(--primary-accent, #00FFC8)'
                } : undefined}
              >{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 bg-[#1A1D24] border border-[#2D3139] rounded-xl overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-[#0F1115]">
                <th style={{ width: '10%' }}>Date</th>
                <th style={{ width: '25%' }}>Client</th>
                <th style={{ width: '18%' }}>Case Type</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '12%' }}>Priority</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {/* Live Client Row (if active) */}
              {currentClient && currentClient.name && (
                <tr
                  style={{
                    backgroundColor: 'rgba(var(--primary-accent-rgb, 0, 255, 200), 0.1)',
                    borderLeft: '2px solid var(--primary-accent, #00FFC8)'
                  }}
                >
                  <td className="font-mono" style={{ color: 'var(--primary-accent, #00FFC8)' }}>Now</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: 'var(--primary-accent, #00FFC8)',
                          boxShadow: '0 0 8px var(--primary-accent, #00FFC8)'
                        }}
                      ></div>
                      <div>
                        <p className="text-[14px] font-medium text-white">{currentClient.name}</p>
                        <p className="text-[12px] text-[#6B7280]">{currentClient.email || 'Gathering info...'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[#6B7280]">-</td>
                  <td><span className="status-badge active"><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }}></div>Active</span></td>
                  <td>-</td>
                  <td className="text-right">
                    <button className="p-2 hover:bg-[#2D3139] rounded-lg transition">
                      <svg className="w-5 h-5 text-[#6B7280]" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              )}

              {filteredCases.map((item) => (
                <tr key={item.id} className="group hover:bg-[#0F1115]">
                  <td className="font-mono text-[#6B7280]">{item.date}</td>
                  <td>
                    <div>
                      <p className="text-[14px] font-medium text-white transition hover-accent">{item.clientName}</p>
                      <p className="text-[12px] text-[#6B7280]">{item.email}</p>
                    </div>
                  </td>
                  <td className="text-[#9CA3AF]">{item.caseType}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{getPriorityBadge(item.priority)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="p-2 hover:bg-[#2D3139] rounded-lg transition"
                        title="View Details"
                      >
                        <svg className="w-4 h-4 text-[#6B7280] hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCall(item.phone, item.clientName)}
                        className="p-2 hover:bg-[#2D3139] rounded-lg transition"
                        title="Call"
                      >
                        <svg className="w-4 h-4 text-[#6B7280] hover-accent-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleViewDetails(item)}
                        className="p-2 hover:bg-[#2D3139] rounded-lg transition"
                        title="More"
                      >
                        <svg className="w-4 h-4 text-[#6B7280]" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Dashboard compact view
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[17px] font-bold text-white tracking-wide">Recent Cases</h2>
          <p className="text-[12px] text-[#6B7280] font-medium mt-0.5 uppercase tracking-wider">Case History</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-[#2D3139] rounded-lg transition text-[#6B7280] hover-accent"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      <div className="glass-panel rounded-2xl flex-1 overflow-hidden flex flex-col relative">
        {/* Decorative Top Line */}
        <div className="h-[2px] w-full" style={{ background: 'linear-gradient(to right, transparent, rgba(var(--primary-accent-rgb, 0, 255, 200), 0.5), transparent)' }}></div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Live Client Row (if active) */}
          {currentClient && currentClient.name && (
            <div
              className="rounded-lg p-3 flex items-center gap-4"
              style={{
                backgroundColor: 'rgba(var(--primary-accent-rgb, 0, 255, 200), 0.1)',
                border: '1px solid rgba(var(--primary-accent-rgb, 0, 255, 200), 0.5)'
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'var(--primary-accent, #00FFC8)',
                    boxShadow: '0 0 8px var(--primary-accent, #00FFC8)'
                  }}
                ></div>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--primary-accent, #00FFC8)' }}>Active</span>
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: 'rgba(var(--primary-accent-rgb, 0, 255, 200), 0.3)' }}></div>
              <span className="text-[14px] font-medium text-white flex-1">{currentClient.name}</span>
              <span className="text-[12px] font-mono" style={{ color: 'var(--primary-accent, #00FFC8)' }}>Now</span>
            </div>
          )}

          {cases.slice(0, 5).map((item) => (
            <div
              key={item.id}
              onClick={() => handleViewDetails(item)}
              className="bg-[#16181D] hover:bg-[#1E2128] border border-transparent hover:border-[#2D3139] rounded-lg p-3 flex items-center gap-4 group transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 w-20">
                <div className={`w-2 h-2 rounded-full transition-all ${
                  item.status === 'booked'
                    ? 'bg-[#10B981] group-hover:shadow-[0_0_6px_#10B981]'
                    : item.status === 'follow-up'
                    ? 'bg-[#F59E0B] group-hover:shadow-[0_0_6px_#F59E0B]'
                    : 'bg-[#6B7280]'
                }`}></div>
                <span className="text-[11px] font-medium text-[#6B7280] group-hover:text-[#9CA3AF] uppercase tracking-wider truncate">
                  {item.status === 'follow-up' ? 'Follow' : item.status}
                </span>
              </div>
              <div className="h-4 w-px bg-[#2D3139]"></div>
              <span className="text-[14px] text-[#9CA3AF] group-hover:text-white flex-1 truncate transition">{item.clientName}</span>
              <span className="text-[12px] text-[#6B7280] font-mono">{item.date}</span>
              <button className="text-[#6B7280] group-hover:text-white opacity-0 group-hover:opacity-100 transition p-1 hover:bg-[#2D3139] rounded">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="p-3 border-t border-[#2D3139]">
          <button
            onClick={handleViewAllCases}
            className="w-full text-center text-[13px] text-[#6B7280] hover-accent transition font-medium"
          >
            View All Cases →
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1D24] border border-[#2D3139] rounded-xl w-full max-w-lg">
            <div className="p-5 border-b border-[#2D3139] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Case Details</h3>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 text-[#6B7280] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Client Name</label>
                  <p className="text-white font-medium">{selectedCase.clientName}</p>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Case Type</label>
                  <p className="text-white">{selectedCase.caseType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Email</label>
                  <p style={{ color: 'var(--primary-accent, #00FFC8)' }}>{selectedCase.email}</p>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Phone</label>
                  <p className="text-white">{selectedCase.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Date</label>
                  <p className="text-white">{selectedCase.date}</p>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedCase.status)}</div>
                </div>
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase">Priority</label>
                  <div className="mt-1">{getPriorityBadge(selectedCase.priority)}</div>
                </div>
              </div>
              {/* Transcript / Notes Section */}
              {selectedCase.description && (
                <div>
                  <label className="text-[12px] text-[#6B7280] uppercase mb-2 block">Call Notes / Transcript</label>
                  <div className="p-4 bg-[#0F1115] border border-[#2D3139] rounded-lg max-h-[300px] overflow-y-auto">
                    <p className="text-[#9CA3AF] text-sm whitespace-pre-wrap leading-relaxed">{selectedCase.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-[#2D3139] flex justify-end gap-3">
              <button
                onClick={() => handleCall(selectedCase.phone, selectedCase.clientName)}
                className="px-4 py-2 text-black font-semibold rounded-lg transition flex items-center gap-2"
                style={{ backgroundColor: 'var(--primary-accent, #00FFC8)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call Client
              </button>
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 text-[#6B7280] hover:text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseHistoryPanel;
