// ============================================
// Analytics Dashboard - Tenant Metrics
// ============================================
// Visual analytics for lead performance and conversions

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Phone,
  MessageSquare,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
}

interface LeadsBySource {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

interface LeadsByStatus {
  status: string;
  count: number;
  color: string;
}

interface DailyMetric {
  date: string;
  leads: number;
  appointments: number;
  conversions: number;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

// ============================================
// MOCK DATA
// ============================================

const MOCK_METRICS: MetricCard[] = [
  {
    label: 'Total Leads',
    value: 247,
    change: 12.5,
    changeLabel: 'vs last period',
    icon: <Users className="w-5 h-5" />,
    color: 'cyan',
  },
  {
    label: 'Appointments Booked',
    value: 89,
    change: 8.2,
    changeLabel: 'vs last period',
    icon: <Calendar className="w-5 h-5" />,
    color: 'green',
  },
  {
    label: 'Conversion Rate',
    value: '36%',
    change: -2.1,
    changeLabel: 'vs last period',
    icon: <Target className="w-5 h-5" />,
    color: 'purple',
  },
  {
    label: 'Avg Response Time',
    value: '4.2m',
    change: 15.3,
    changeLabel: 'faster',
    icon: <Clock className="w-5 h-5" />,
    color: 'yellow',
  },
];

const MOCK_LEADS_BY_SOURCE: LeadsBySource[] = [
  { source: 'Google Ads', count: 98, percentage: 40, color: '#4285F4' },
  { source: 'Organic Search', count: 62, percentage: 25, color: '#34A853' },
  { source: 'Referral', count: 45, percentage: 18, color: '#FBBC05' },
  { source: 'Facebook', count: 27, percentage: 11, color: '#1877F2' },
  { source: 'Direct', count: 15, percentage: 6, color: '#6B7280' },
];

const MOCK_LEADS_BY_STATUS: LeadsByStatus[] = [
  { status: 'New', count: 42, color: '#3B82F6' },
  { status: 'Contacted', count: 58, color: '#F59E0B' },
  { status: 'Qualified', count: 67, color: '#10B981' },
  { status: 'Appointment Set', count: 45, color: '#8B5CF6' },
  { status: 'Retained', count: 23, color: '#00FFC8' },
  { status: 'Lost', count: 12, color: '#6B7280' },
];

const MOCK_DAILY_DATA: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    leads: Math.floor(Math.random() * 15) + 5,
    appointments: Math.floor(Math.random() * 8) + 2,
    conversions: Math.floor(Math.random() * 4) + 1,
  };
});

const MOCK_TOP_CASE_TYPES = [
  { type: 'Personal Injury', count: 87, value: '$2.4M' },
  { type: 'Car Accident', count: 64, value: '$1.8M' },
  { type: 'Medical Malpractice', count: 32, value: '$1.2M' },
  { type: 'Workers Comp', count: 28, value: '$890K' },
  { type: 'Slip & Fall', count: 21, value: '$540K' },
];

// ============================================
// COMPONENT
// ============================================

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const filteredDailyData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
    return MOCK_DAILY_DATA.slice(-days);
  }, [timeRange]);

  const maxLeads = Math.max(...filteredDailyData.map((d) => d.leads));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">Track your lead performance and conversions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Filter */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All' : range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_METRICS.map((metric) => (
          <MetricCardComponent key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Trend Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Lead Trend</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-gray-400">Leads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-gray-400">Appointments</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-1">
            {filteredDailyData.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5">
                  <div
                    className="w-full bg-cyan-500/80 rounded-t"
                    style={{ height: `${(day.leads / maxLeads) * 200}px` }}
                    title={`${day.leads} leads`}
                  />
                  <div
                    className="w-full bg-green-500/80 rounded-b"
                    style={{ height: `${(day.appointments / maxLeads) * 200}px` }}
                    title={`${day.appointments} appointments`}
                  />
                </div>
                {(i === 0 || i === filteredDailyData.length - 1 || i % 7 === 0) && (
                  <span className="text-gray-600 text-xs mt-1">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-6">Lead Sources</h3>
          <div className="space-y-4">
            {MOCK_LEADS_BY_SOURCE.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{source.source}</span>
                  <span className="text-white font-medium">{source.count}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-6">Lead Pipeline</h3>
          <div className="space-y-3">
            {MOCK_LEADS_BY_STATUS.map((status, index) => {
              const totalLeads = MOCK_LEADS_BY_STATUS.reduce((a, b) => a + b.count, 0);
              const percentage = Math.round((status.count / totalLeads) * 100);

              return (
                <div key={status.status} className="flex items-center gap-4">
                  <div className="w-32 text-gray-400 text-sm">{status.status}</div>
                  <div className="flex-1 h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: status.color,
                        minWidth: '40px',
                      }}
                    >
                      <span className="text-white text-sm font-medium">{status.count}</span>
                    </div>
                  </div>
                  <div className="w-12 text-right text-gray-500 text-sm">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Case Types */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-6">Top Case Types</h3>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="text-left pb-3">Case Type</th>
                  <th className="text-right pb-3">Leads</th>
                  <th className="text-right pb-3">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {MOCK_TOP_CASE_TYPES.map((caseType, index) => (
                  <tr key={caseType.type}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-sm">{index + 1}</span>
                        <span className="text-white">{caseType.type}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right text-gray-300">{caseType.count}</td>
                    <td className="py-3 text-right text-cyan-400 font-medium">{caseType.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Response Time & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Time Distribution */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Response Time</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#00FFC8"
                  strokeWidth="12"
                  strokeDasharray={`${0.82 * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">82%</span>
                <span className="text-gray-500 text-xs">under 5 min</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-white font-medium">4.2m</div>
              <div className="text-gray-500">Avg Time</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-white font-medium">1.1m</div>
              <div className="text-gray-500">Fastest</div>
            </div>
          </div>
        </div>

        {/* Channel Performance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Channel Performance</h3>
          <div className="space-y-4">
            <ChannelStat
              icon={<MessageSquare className="w-4 h-4" />}
              label="SMS"
              sent={342}
              responseRate={68}
            />
            <ChannelStat
              icon={<Phone className="w-4 h-4" />}
              label="Calls"
              sent={156}
              responseRate={45}
            />
            <ChannelStat
              icon={<Calendar className="w-4 h-4" />}
              label="Appointments"
              sent={89}
              responseRate={92}
            />
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-2">
            <FunnelStep label="Website Visits" count={1247} percentage={100} />
            <FunnelStep label="Started Chat" count={423} percentage={34} />
            <FunnelStep label="Completed Intake" count={247} percentage={20} />
            <FunnelStep label="Qualified" count={156} percentage={12.5} />
            <FunnelStep label="Retained" count={89} percentage={7.1} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function MetricCardComponent({ metric }: { metric: MetricCard }) {
  const colorClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
  };

  const isPositive = metric.change >= 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{metric.label}</span>
        <div className={`p-2 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
          {metric.icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <ArrowUpRight className="w-4 h-4 text-green-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-400" />
        )}
        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
          {Math.abs(metric.change)}%
        </span>
        <span className="text-gray-500 text-sm">{metric.changeLabel}</span>
      </div>
    </div>
  );
}

function ChannelStat({
  icon,
  label,
  sent,
  responseRate,
}: {
  icon: React.ReactNode;
  label: string;
  sent: number;
  responseRate: number;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-700 rounded-lg text-gray-400">{icon}</div>
        <div>
          <div className="text-white font-medium">{label}</div>
          <div className="text-gray-500 text-sm">{sent} sent</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-cyan-400 font-medium">{responseRate}%</div>
        <div className="text-gray-500 text-sm">response</div>
      </div>
    </div>
  );
}

function FunnelStep({
  label,
  count,
  percentage,
}: {
  label: string;
  count: number;
  percentage: number;
}) {
  return (
    <div className="relative">
      <div
        className="h-10 bg-cyan-500/20 rounded flex items-center justify-between px-3"
        style={{ width: `${Math.max(percentage, 20)}%` }}
      >
        <span className="text-white text-sm font-medium truncate">{label}</span>
        <span className="text-cyan-400 text-sm">{count}</span>
      </div>
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
        {percentage}%
      </span>
    </div>
  );
}

export default AnalyticsDashboard;
