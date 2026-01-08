import React from 'react';

const AnalyticsPanel = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
        {/* Header */}
        <div>
            <h2 className="text-base font-bold text-white tracking-wide">Analytics & Performance</h2>
            <p className="text-[10px] text-gray-500 font-medium mt-1">REAL-TIME METRICS</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-4">
            
            {/* Weekly Calls - Large Card */}
            <div className="col-span-1 glass-panel p-4 rounded-2xl relative overflow-hidden group">
                 <div className="flex justify-between items-start mb-4">
                     <span className="text-[10px] font-bold text-gray-400 uppercase">Weekly Calls</span>
                     <button className="text-gray-500 hover:text-white"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/></svg></button>
                 </div>
                 
                 <div className="flex items-end gap-2 mb-2">
                     <span className="text-3xl font-bold text-white">36</span>
                     <span className="text-xs font-bold text-[#00FFA3] mb-1">+15%</span>
                 </div>

                 {/* Mock Line Chart */}
                 <div className="h-16 w-full flex items-end gap-1 mt-2">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path 
                            d="M0,40 C20,35 40,50 60,30 C80,10 100,45 120,20 C140,5 160,25 180,10" 
                            fill="none" 
                            stroke="#00FFA3" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_10px_rgba(0,255,163,0.5)]"
                        />
                        {/* Dots */}
                        <circle cx="0" cy="40" r="3" fill="#1E2128" stroke="#00FFA3" strokeWidth="2" />
                        <circle cx="60" cy="30" r="3" fill="#1E2128" stroke="#00FFA3" strokeWidth="2" />
                        <circle cx="120" cy="20" r="3" fill="#1E2128" stroke="#00FFA3" strokeWidth="2" />
                        <circle cx="180" cy="10" r="3" fill="#1E2128" stroke="#00FFA3" strokeWidth="2" />
                        
                        {/* Gradient Fill under line */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00FFA3" stopOpacity="0.2"/>
                                <stop offset="100%" stopColor="#00FFA3" stopOpacity="0"/>
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
                <div className="glass-panel p-3 rounded-2xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00FFA3] opacity-50 rounded-l"></div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Conversion Rate</span>
                        <span className="text-xl font-bold text-white">25.0%</span>
                    </div>
                    <div className="w-10 h-10 relative flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                             <circle cx="20" cy="20" r="16" fill="none" stroke="#2D3139" strokeWidth="4" />
                             <circle cx="20" cy="20" r="16" fill="none" stroke="#00FFA3" strokeWidth="4" strokeDasharray="100" strokeDashoffset="75" strokeLinecap="round" />
                         </svg>
                    </div>
                </div>

                {/* Avg Duration */}
                <div className="glass-panel p-3 rounded-2xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#00FFA3] opacity-50 rounded-l"></div>
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Avg. Duration</span>
                        <span className="text-xl font-bold text-white">4.5m</span>
                    </div>
                    <div className="w-10 h-10 relative flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                             <circle cx="20" cy="20" r="16" fill="none" stroke="#2D3139" strokeWidth="4" />
                             <circle cx="20" cy="20" r="16" fill="none" stroke="#00FFA3" strokeWidth="4" strokeDasharray="100" strokeDashoffset="20" strokeLinecap="round" />
                         </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AnalyticsPanel;