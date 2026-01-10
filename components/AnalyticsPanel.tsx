import React from 'react';

interface AnalyticsPanelProps {
  fullPage?: boolean;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ fullPage = false }) => {
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

  if (fullPage) {
    return (
      <div className="flex flex-col gap-6 w-full h-full overflow-y-auto pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Performance</h1>
          <p className="text-lg text-gray-400">Real-time metrics and performance analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Calls */}
          <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#00FFC8]/20 border border-[#00FFC8] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#00FFC8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-[#00FFC8]">+{stats.callsTrend}%</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.totalCalls}</p>
            <p className="text-base text-gray-400">Total Calls</p>
          </div>

          {/* Appointments Booked */}
          <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-blue-400">25% rate</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.appointmentsBooked}</p>
            <p className="text-base text-gray-400">Appointments Booked</p>
          </div>

          {/* Avg Call Duration */}
          <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.avgDuration}</p>
            <p className="text-base text-gray-400">Avg Call Duration</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{stats.conversionRate}%</p>
            <p className="text-base text-gray-400">Conversion Rate</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Calls Chart */}
          <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">This Week Calls</h3>
            <div className="h-64 flex items-end justify-between gap-4">
              {weeklyData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#00FFC8]/20 rounded-t-lg relative" style={{ height: `${(item.calls / 10) * 100}%`, minHeight: '20px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-[#00FFC8] rounded-t-lg transition-all duration-300"
                      style={{ height: '100%' }}
                    ></div>
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold text-white">{item.calls}</span>
                  </div>
                  <span className="mt-3 text-sm text-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-gray-400">Total Calls</span>
                  <span className="text-base font-bold text-white">36</span>
                </div>
                <div className="h-4 bg-[#2D3139] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FFC8] rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-gray-400">Qualified Leads</span>
                  <span className="text-base font-bold text-white">24</span>
                </div>
                <div className="h-4 bg-[#2D3139] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FFC8] rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-gray-400">Consultations Set</span>
                  <span className="text-base font-bold text-white">15</span>
                </div>
                <div className="h-4 bg-[#2D3139] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FFC8] rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base text-gray-400">Appointments Booked</span>
                  <span className="text-base font-bold text-white">9</span>
                </div>
                <div className="h-4 bg-[#2D3139] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00FFC8] rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call Distribution */}
        <div className="bg-[#1E2128] border border-[#2D3139] rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Call Distribution by Case Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'Personal Injury', count: 14, color: '#00FFC8' },
              { type: 'Family Law', count: 9, color: '#3B82F6' },
              { type: 'Criminal Defense', count: 7, color: '#EF4444' },
              { type: 'Other', count: 6, color: '#A855F7' },
            ].map((item, index) => (
              <div key={index} className="bg-[#0F1115] border border-[#2D3139] rounded-lg p-4 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}` }}>
                  <span className="text-2xl font-bold" style={{ color: item.color }}>{item.count}</span>
                </div>
                <p className="text-base text-gray-400">{item.type}</p>
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
        <h2 className="text-lg font-bold text-white tracking-wide">Analytics & Performance</h2>
        <p className="text-sm text-gray-500 font-medium mt-1">REAL-TIME METRICS</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4">

        {/* Weekly Calls - Large Card */}
        <div className="col-span-1 glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-bold text-gray-400 uppercase">Weekly Calls</span>
            <button className="text-gray-500 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg></button>
          </div>

          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-white">{stats.totalCalls}</span>
            <span className="text-sm font-bold text-[#00FFC8] mb-1">+{stats.callsTrend}%</span>
          </div>

          {/* Mock Line Chart */}
          <div className="h-16 w-full flex items-end gap-1 mt-2">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M0,40 C20,35 40,50 60,30 C80,10 100,45 120,20 C140,5 160,25 180,10"
                fill="none"
                stroke="#00FFC8"
                strokeWidth="3"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(0,255,200,0.5)]"
              />
              {/* Dots */}
              <circle cx="0" cy="40" r="3" fill="#1E2128" stroke="#00FFC8" strokeWidth="2" />
              <circle cx="60" cy="30" r="3" fill="#1E2128" stroke="#00FFC8" strokeWidth="2" />
              <circle cx="120" cy="20" r="3" fill="#1E2128" stroke="#00FFC8" strokeWidth="2" />
              <circle cx="180" cy="10" r="3" fill="#1E2128" stroke="#00FFC8" strokeWidth="2" />

              {/* Gradient Fill under line */}
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00FFC8" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#00FFC8" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d="M0,40 C20,35 40,50 60,30 C80,10 100,45 120,20 C140,5 160,25 180,10 V60 H0 Z"
                fill="url(#chartGradient)"
                stroke="none"
              />
            </svg>
          </div>
        </div>

        {/* Right Column - Circular Stats */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Conversion Rate */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00FFC8] opacity-50 rounded-l"></div>
            <div>
              <span className="text-sm font-bold text-gray-400 uppercase block mb-1">Conversion Rate</span>
              <span className="text-2xl font-bold text-white">{stats.conversionRate}%</span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#2D3139" strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#00FFC8" strokeWidth="4" strokeDasharray="126" strokeDashoffset="95" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="glass-panel p-4 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00FFC8] opacity-50 rounded-l"></div>
            <div>
              <span className="text-sm font-bold text-gray-400 uppercase block mb-1">Avg. Duration</span>
              <span className="text-2xl font-bold text-white">{stats.avgDuration}</span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#2D3139" strokeWidth="4" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#00FFC8" strokeWidth="4" strokeDasharray="126" strokeDashoffset="25" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
