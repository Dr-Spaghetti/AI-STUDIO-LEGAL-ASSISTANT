// ============================================
// Analytics Data Service
// ============================================
// Fetches real analytics data from Supabase database
// Falls back to mock data when database is not configured

import { supabase } from './supabase';

// Analytics interfaces
export interface AnalyticsStats {
  totalCalls: number;
  callsTrend: number;
  appointmentsBooked: number;
  conversionRate: number;
  avgDuration: string;
  avgDurationMinutes: number;
}

export interface WeeklyData {
  day: string;
  calls: number;
}

export interface ConversionFunnel {
  label: string;
  value: number;
  percent: number;
}

export interface CaseTypeDistribution {
  type: string;
  count: number;
  color: string;
}

export interface LeadsBySource {
  source: string;
  count: number;
  percent: number;
}

export interface LeadsByStatus {
  status: string;
  count: number;
  color: string;
}

export interface DailyMetric {
  date: string;
  leads: number;
  appointments: number;
}

// Mock data for fallback
const MOCK_STATS: AnalyticsStats = {
  totalCalls: 36,
  callsTrend: 15,
  appointmentsBooked: 9,
  conversionRate: 25.0,
  avgDuration: '4:32',
  avgDurationMinutes: 4.5,
};

const MOCK_WEEKLY_DATA: WeeklyData[] = [
  { day: 'Mon', calls: 4 },
  { day: 'Tue', calls: 7 },
  { day: 'Wed', calls: 5 },
  { day: 'Thu', calls: 8 },
  { day: 'Fri', calls: 6 },
  { day: 'Sat', calls: 3 },
  { day: 'Sun', calls: 3 },
];

const MOCK_FUNNEL: ConversionFunnel[] = [
  { label: 'Total Calls', value: 36, percent: 100 },
  { label: 'Qualified Leads', value: 24, percent: 67 },
  { label: 'Consultations Set', value: 15, percent: 42 },
  { label: 'Appointments Booked', value: 9, percent: 25 },
];

const MOCK_CASE_TYPES: CaseTypeDistribution[] = [
  { type: 'Personal Injury', count: 14, color: 'var(--primary-accent, #00FFC8)' },
  { type: 'Family Law', count: 9, color: '#3B82F6' },
  { type: 'Criminal Defense', count: 7, color: '#EF4444' },
  { type: 'Other', count: 6, color: '#A78BFA' },
];

const MOCK_DAILY_METRICS: DailyMetric[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    leads: Math.floor(Math.random() * 10) + 2,
    appointments: Math.floor(Math.random() * 4) + 1,
  };
});

// Helper to format duration
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get day of week abbreviation
function getDayAbbr(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Get analytics statistics for a tenant
 */
export async function getAnalyticsStats(tenantId?: string): Promise<AnalyticsStats> {
  if (!supabase) {
    console.log('[Analytics] Using mock data - Supabase not configured');
    return MOCK_STATS;
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Build base query
    let query = supabase.from('leads').select('*', { count: 'exact' });
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    // Get current week stats
    const { count: totalCalls, data: currentWeekLeads } = await query
      .gte('created_at', weekAgo.toISOString())
      .lte('created_at', now.toISOString());

    // Get previous week stats for trend calculation
    let prevQuery = supabase.from('leads').select('*', { count: 'exact' });
    if (tenantId) {
      prevQuery = prevQuery.eq('tenant_id', tenantId);
    }
    const { count: prevWeekCount } = await prevQuery
      .gte('created_at', twoWeeksAgo.toISOString())
      .lt('created_at', weekAgo.toISOString());

    // Calculate trend
    const callsTrend = prevWeekCount && prevWeekCount > 0
      ? Math.round(((totalCalls || 0) - prevWeekCount) / prevWeekCount * 100)
      : 0;

    // Get appointments booked (leads with appointment_booked = true)
    let appointmentQuery = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('next_steps->appointment_booked', true);
    if (tenantId) {
      appointmentQuery = appointmentQuery.eq('tenant_id', tenantId);
    }
    const { count: appointmentsBooked } = await appointmentQuery
      .gte('created_at', weekAgo.toISOString());

    // Calculate conversion rate
    const conversionRate = totalCalls && totalCalls > 0
      ? Math.round((appointmentsBooked || 0) / totalCalls * 100)
      : 0;

    // Get average duration from conversations
    let durationQuery = supabase
      .from('conversations')
      .select('duration_seconds');
    if (tenantId) {
      durationQuery = durationQuery.eq('tenant_id', tenantId);
    }
    const { data: conversations } = await durationQuery
      .gte('started_at', weekAgo.toISOString())
      .not('duration_seconds', 'is', null);

    const avgDurationSeconds = conversations && conversations.length > 0
      ? conversations.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / conversations.length
      : 272; // Default 4:32

    return {
      totalCalls: totalCalls || 0,
      callsTrend,
      appointmentsBooked: appointmentsBooked || 0,
      conversionRate,
      avgDuration: formatDuration(avgDurationSeconds),
      avgDurationMinutes: avgDurationSeconds / 60,
    };
  } catch (error) {
    console.error('[Analytics] Error fetching stats:', error);
    return MOCK_STATS;
  }
}

/**
 * Get weekly call data for charts
 */
export async function getWeeklyData(tenantId?: string): Promise<WeeklyData[]> {
  if (!supabase) {
    return MOCK_WEEKLY_DATA;
  }

  try {
    const weeklyData: WeeklyData[] = [];
    const now = new Date();

    // Get data for each day of the past week
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { count } = await query;

      weeklyData.push({
        day: getDayAbbr(date),
        calls: count || 0,
      });
    }

    return weeklyData;
  } catch (error) {
    console.error('[Analytics] Error fetching weekly data:', error);
    return MOCK_WEEKLY_DATA;
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(tenantId?: string): Promise<ConversionFunnel[]> {
  if (!supabase) {
    return MOCK_FUNNEL;
  }

  try {
    // Get total leads
    let totalQuery = supabase.from('leads').select('*', { count: 'exact' });
    if (tenantId) {
      totalQuery = totalQuery.eq('tenant_id', tenantId);
    }
    const { count: totalLeads } = await totalQuery;

    // Get qualified leads (score > 50 or tier = high/medium)
    let qualifiedQuery = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .or('qualification->tier.eq.high,qualification->tier.eq.medium');
    if (tenantId) {
      qualifiedQuery = qualifiedQuery.eq('tenant_id', tenantId);
    }
    const { count: qualifiedLeads } = await qualifiedQuery;

    // Get leads with consultations set
    let consultationQuery = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('status', 'completed');
    if (tenantId) {
      consultationQuery = consultationQuery.eq('tenant_id', tenantId);
    }
    const { count: consultations } = await consultationQuery;

    // Get appointments booked
    let appointmentQuery = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('next_steps->appointment_booked', true);
    if (tenantId) {
      appointmentQuery = appointmentQuery.eq('tenant_id', tenantId);
    }
    const { count: appointments } = await appointmentQuery;

    const total = totalLeads || 1; // Avoid division by zero

    return [
      { label: 'Total Calls', value: totalLeads || 0, percent: 100 },
      { label: 'Qualified Leads', value: qualifiedLeads || 0, percent: Math.round((qualifiedLeads || 0) / total * 100) },
      { label: 'Consultations Set', value: consultations || 0, percent: Math.round((consultations || 0) / total * 100) },
      { label: 'Appointments Booked', value: appointments || 0, percent: Math.round((appointments || 0) / total * 100) },
    ];
  } catch (error) {
    console.error('[Analytics] Error fetching funnel data:', error);
    return MOCK_FUNNEL;
  }
}

/**
 * Get case type distribution
 */
export async function getCaseTypeDistribution(tenantId?: string): Promise<CaseTypeDistribution[]> {
  if (!supabase) {
    return MOCK_CASE_TYPES;
  }

  try {
    let query = supabase
      .from('leads')
      .select('case_info');
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    const { data: leads } = await query;

    if (!leads || leads.length === 0) {
      return MOCK_CASE_TYPES;
    }

    // Count by case type
    const typeCounts: Record<string, number> = {};
    for (const lead of leads) {
      const caseType = lead.case_info?.type || 'Other';
      typeCounts[caseType] = (typeCounts[caseType] || 0) + 1;
    }

    // Define colors for case types
    const colorMap: Record<string, string> = {
      'Personal Injury': 'var(--primary-accent, #00FFC8)',
      'Family Law': '#3B82F6',
      'Criminal Defense': '#EF4444',
      'Estate Planning': '#F59E0B',
      'Other': '#A78BFA',
    };

    // Convert to array and sort by count
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        count,
        color: colorMap[type] || '#A78BFA',
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4); // Top 4 case types
  } catch (error) {
    console.error('[Analytics] Error fetching case types:', error);
    return MOCK_CASE_TYPES;
  }
}

/**
 * Get daily metrics for the last 30 days
 */
export async function getDailyMetrics(tenantId?: string): Promise<DailyMetric[]> {
  if (!supabase) {
    return MOCK_DAILY_METRICS;
  }

  try {
    const metrics: DailyMetric[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get leads count
      let leadsQuery = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());
      if (tenantId) {
        leadsQuery = leadsQuery.eq('tenant_id', tenantId);
      }
      const { count: leadsCount } = await leadsQuery;

      // Get appointments count
      let appointmentsQuery = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('next_steps->appointment_booked', true)
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());
      if (tenantId) {
        appointmentsQuery = appointmentsQuery.eq('tenant_id', tenantId);
      }
      const { count: appointmentsCount } = await appointmentsQuery;

      metrics.push({
        date: date.toISOString().split('T')[0],
        leads: leadsCount || 0,
        appointments: appointmentsCount || 0,
      });
    }

    return metrics;
  } catch (error) {
    console.error('[Analytics] Error fetching daily metrics:', error);
    return MOCK_DAILY_METRICS;
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return supabase !== null;
}

/**
 * Get all analytics data at once (reduces API calls)
 */
export async function getAllAnalytics(tenantId?: string): Promise<{
  stats: AnalyticsStats;
  weeklyData: WeeklyData[];
  funnel: ConversionFunnel[];
  caseTypes: CaseTypeDistribution[];
  isLive: boolean;
}> {
  const isLive = isDatabaseConnected();

  // Fetch all data in parallel
  const [stats, weeklyData, funnel, caseTypes] = await Promise.all([
    getAnalyticsStats(tenantId),
    getWeeklyData(tenantId),
    getConversionFunnel(tenantId),
    getCaseTypeDistribution(tenantId),
  ]);

  return {
    stats,
    weeklyData,
    funnel,
    caseTypes,
    isLive,
  };
}

export default {
  getAnalyticsStats,
  getWeeklyData,
  getConversionFunnel,
  getCaseTypeDistribution,
  getDailyMetrics,
  getAllAnalytics,
  isDatabaseConnected,
};
