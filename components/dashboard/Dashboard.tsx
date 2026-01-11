// ============================================
// Dashboard - Main Overview Page
// ============================================
// Quick stats, recent leads, upcoming appointments

import React from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Phone,
  MessageSquare,
} from 'lucide-react';

// ============================================
// MOCK DATA
// ============================================

const MOCK_STATS = [
  { label: 'New Leads Today', value: 12, change: 3, icon: Users, color: 'cyan' },
  { label: 'Appointments Today', value: 5, change: 1, icon: Calendar, color: 'green' },
  { label: 'Conversion Rate', value: '36%', change: 2.1, icon: TrendingUp, color: 'purple' },
  { label: 'Avg Response', value: '4.2m', change: -15, icon: Clock, color: 'yellow' },
];

const MOCK_RECENT_LEADS = [
  { id: '1', name: 'John Doe', caseType: 'Personal Injury', score: 85, tier: 'hot', time: '10 min ago' },
  { id: '2', name: 'Jane Smith', caseType: 'Family Law', score: 62, tier: 'warm', time: '25 min ago' },
  { id: '3', name: 'Mike Johnson', caseType: 'Car Accident', score: 78, tier: 'hot', time: '1 hour ago' },
  { id: '4', name: 'Sarah Williams', caseType: 'Workers Comp', score: 45, tier: 'cold', time: '2 hours ago' },
  { id: '5', name: 'David Brown', caseType: 'Medical Malpractice', score: 91, tier: 'hot', time: '3 hours ago' },
];

const MOCK_APPOINTMENTS = [
  { id: '1', leadName: 'John Doe', time: '2:00 PM', type: 'Consultation', status: 'confirmed' },
  { id: '2', leadName: 'Jane Smith', time: '3:30 PM', type: 'Follow-up', status: 'pending' },
  { id: '3', leadName: 'Mike Johnson', time: '4:00 PM', type: 'Consultation', status: 'confirmed' },
];

const MOCK_EMERGENCIES = [
  { id: '1', leadName: 'Anonymous', type: 'domestic_violence', time: '15 min ago', status: 'acknowledged' },
];

// ============================================
// COMPONENT
// ============================================

export function Dashboard() {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  };

  const tierColors = {
    hot: 'bg-red-500/20 text-red-400 border-red-500/30',
    warm: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      {MOCK_EMERGENCIES.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold">Emergency Alert</h3>
              <p className="text-red-300 text-sm">
                {MOCK_EMERGENCIES.length} emergency situation(s) detected - requires attention
              </p>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className={`w-4 h-4 ${stat.change >= 0 ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
              <span className={stat.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                {Math.abs(stat.change)}%
              </span>
              <span className="text-gray-500 text-sm">vs yesterday</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Recent Leads</h3>
            <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-800">
            {MOCK_RECENT_LEADS.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{lead.name}</div>
                    <div className="text-gray-500 text-sm">{lead.caseType}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded border text-xs font-medium ${tierColors[lead.tier as keyof typeof tierColors]}`}>
                    {lead.tier.toUpperCase()} • {lead.score}
                  </span>
                  <span className="text-gray-500 text-sm">{lead.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">Today's Appointments</h3>
            <button className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
              Calendar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            {MOCK_APPOINTMENTS.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="w-12 text-center">
                  <div className="text-cyan-400 font-medium">{apt.time}</div>
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{apt.leadName}</div>
                  <div className="text-gray-500 text-sm">{apt.type}</div>
                </div>
                <div className={`w-2 h-2 rounded-full ${apt.status === 'confirmed' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              </div>
            ))}
            {MOCK_APPOINTMENTS.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments scheduled
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-colors group">
          <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500/20">
            <Phone className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="text-white font-medium">Start Intake Call</div>
            <div className="text-gray-500 text-sm">Begin a new client intake</div>
          </div>
        </button>

        <button className="flex items-center gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-colors group">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-400 group-hover:bg-green-500/20">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="text-white font-medium">Send Follow-up</div>
            <div className="text-gray-500 text-sm">SMS or email to leads</div>
          </div>
        </button>

        <button className="flex items-center gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-colors group">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="text-white font-medium">Schedule Consultation</div>
            <div className="text-gray-500 text-sm">Book with Calendly</div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
