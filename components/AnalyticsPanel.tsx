import React, { useState } from 'react';

interface AnalyticsPanelProps {
  fullPage?: boolean;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ fullPage = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  // Mock analytics data
  const stats = {
    totalCalls: 36,
    callsTrend: 15,
    appointmentsBooked: 9,
    conversionRate: 25.0,
    avgDuration: '4:32',
    avgDurationMinutes: 4.5,
  };

  const weeklyData = [
    { day: 'Mon', calls: 4 },
    { day: 'Tue', calls: 7 },
    { day: 'Wed', calls: 5 },
    { day: 'Thu', calls: 8 },
    { day: 'Fri', calls: 6 },
    { day: 'Sat', calls: 3 },
    { day: 'Sun', calls: 3 },
  ];

  const maxCalls = Math.max(...weeklyData.map(d => d.calls));

  if (fullPage) {
    return (
      <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-8">
        {/* Header */}
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">Analytics & Performance</h1>
          <p className="text-[15px] text-[#9CA3AF]">Real-time metrics and performance analytics</p>
        </div>

        {/* Stats Cards with Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Calls */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#00FFC8]/15 border border-[#00FFC8]/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <span className="text-[13px] font-bold text-[#00FFC8] flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                +{stats.callsTrend}%
              </span>
            </div>
            <p className="text-[36px] font-bold text-white mb-1">{stats.totalCalls}</p>
            <p className="text-[14px] text-[#6B7280]">Total Calls</p>
          </div>

          {/* Appointments Booked */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              </div>
              <span className="text-[13px] font-medium text-[#3B82F6]">25% rate</span>
            </div>
            <p className="text-[36px] font-bold text-white mb-1">{stats.appointmentsBooked}</p>
            <p className="text-[14px] text-[#6B7280]">Appointments Booked</p>
          </div>

          {/* Avg Call Duration */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-[36px] font-bold text-white mb-1">{stats.avgDuration}</p>
            <p className="text-[14px] text-[#6B7280]">Avg Call Duration</p>
          </div>

          {/* Conversion Rate */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
            </div>
            <p className="text-[36px] font-bold text-white mb-1">{stats.conversionRate}%</p>
            <p className="text-[14px] text-[#6B7280]">Conversion Rate</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Weekly Calls Chart */}
          <div className="workflow-card">
            <h3 className="text-[17px] font-semibold text-white mb-6">Weekly Calls</h3>
            <div className="h-56 flex items-end justify-between gap-3 px-2">
              {weeklyData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[13px] font-semibold text-white">{item.calls}</span>
                  <div className="w-full h-40 flex items-end">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 relative overflow-hidden"
                      style={{ height: `${(item.calls / maxCalls) * 100}%` }}
                    >
                      {/* Gradient bar */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#00FFC8] to-[#00FFC8]/40"></div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-[#00FFC8] opacity-20 blur-sm"></div>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#6B7280] font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="workflow-card">
            <h3 className="text-[17px] font-semibold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-5">
              {[
                { label: 'Total Calls', value: 36, percent: 100 },
                { label: 'Qualified Leads', value: 24, percent: 67 },
                { label: 'Consultations Set', value: 15, percent: 42 },
                { label: 'Appointments Booked', value: 9, percent: 25 },
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[14px] text-[#9CA3AF]">{item.label}</span>
                    <span className="text-[14px] font-semibold text-white">{item.value}</span>
                  </div>
                  <div className="h-3 bg-[#2D3139] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 relative"
                      style={{ width: `${item.percent}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00FFC8] to-[#00FFC8]/60"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call Distribution */}
        <div className="workflow-card">
          <h3 className="text-[17px] font-semibold text-white mb-6">Call Distribution by Case Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Personal Injury', count: 14, color: '#00FFC8' },
              { type: 'Family Law', count: 9, color: '#3B82F6' },
              { type: 'Criminal Defense', count: 7, color: '#EF4444' },
              { type: 'Other', count: 6, color: '#A78BFA' },
            ].map((item, index) => (
              <div key={index} className="bg-[#0F1115] border border-[#2D3139] rounded-xl p-5 text-center">
                <div
                  className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                    border: `2px solid ${item.color}40`
                  }}
                >
                  <span className="text-[22px] font-bold" style={{ color: item.color }}>{item.count}</span>
                </div>
                <p className="text-[13px] text-[#9CA3AF]">{item.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard compact view
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <h2 className="text-[17px] font-bold text-white tracking-wide">Analytics & Performance</h2>
        <p className="text-[12px] text-[#6B7280] font-medium mt-1 uppercase tracking-wider">Real-time metrics</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* Weekly Calls - Large Card */}
        <div className="col-span-1 glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">Weekly Calls</span>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-[#6B7280] hover:text-white transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/>
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 bg-[#1A1D24] border border-[#2D3139] rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
                  <button
                    onClick={() => { setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2D3139] transition"
                  >
                    Refresh Data
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2D3139] transition"
                  >
                    Export Chart
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#2D3139] transition"
                  >
                    View Full Report
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-[36px] font-bold text-white">{stats.totalCalls}</span>
            <span className="text-[13px] font-bold text-[#00FFC8] mb-2">+{stats.callsTrend}%</span>
          </div>

          {/* Line Chart */}
          <div className="h-16 w-full mt-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 180 60">
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FFC8" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#00FFC8" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path
                d="M0,45 C20,40 40,50 60,35 C80,15 100,45 120,25 C140,10 160,30 180,15 V60 H0 Z"
                fill="url(#chartGradient)"
                stroke="none"
              />

              {/* Line */}
              <path
                d="M0,45 C20,40 40,50 60,35 C80,15 100,45 120,25 C140,10 160,30 180,15"
                fill="none"
                stroke="#00FFC8"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(0,255,200,0.5)]"
              />

              {/* Dots */}
              <circle cx="0" cy="45" r="3" fill="#1A1D24" stroke="#00FFC8" strokeWidth="2" />
              <circle cx="60" cy="35" r="3" fill="#1A1D24" stroke="#00FFC8" strokeWidth="2" />
              <circle cx="120" cy="25" r="3" fill="#1A1D24" stroke="#00FFC8" strokeWidth="2" />
              <circle cx="180" cy="15" r="4" fill="#00FFC8" className="drop-shadow-[0_0_6px_rgba(0,255,200,0.8)]" />
            </svg>
          </div>
        </div>

        {/* Right Column - Circular Stats */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Conversion Rate */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#00FFC8] to-transparent opacity-50 rounded-l"></div>
            <div>
              <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Conversion Rate</span>
              <span className="text-[24px] font-bold text-white">{stats.conversionRate}%</span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="none" stroke="#2D3139" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="#00FFC8"
                  strokeWidth="4"
                  strokeDasharray="113"
                  strokeDashoffset="85"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(0,255,200,0.5)]"
                />
              </svg>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A78BFA] to-transparent opacity-50 rounded-l"></div>
            <div>
              <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">Avg. Duration</span>
              <span className="text-[24px] font-bold text-white">{stats.avgDuration}</span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" fill="none" stroke="#2D3139" strokeWidth="4" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth="4"
                  strokeDasharray="113"
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  className="drop-shadow-[0_0_4px_rgba(167,139,250,0.5)]"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
