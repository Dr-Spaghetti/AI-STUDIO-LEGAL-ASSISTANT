// ============================================
// Cases Data Service
// ============================================
// Fetches and persists case data to Supabase database
// Falls back to mock data when database is not configured

import { supabase, createLead, updateLead, getLeadsByTenant } from './supabase';
import type { Lead } from './types';

// Case history item interface (for UI)
export interface CaseHistoryItem {
  id: string;
  date: string;
  clientName: string;
  email: string;
  phone: string;
  status: 'booked' | 'follow-up' | 'pending' | 'closed' | 'in_progress';
  priority: 'high' | 'medium' | 'low';
  caseType: string;
  description?: string;
  conversationId?: string;
}

// New case input interface
export interface NewCaseInput {
  tenantId?: string;
  clientName: string;
  email?: string;
  phone?: string;
  caseType?: string;
  description?: string;
  channel?: 'web' | 'voice' | 'sms';
  jurisdictionState?: string;
}

// Mock data for fallback
const MOCK_CASES: CaseHistoryItem[] = [
  { id: '1', clientName: 'Sarah Jenkins', email: 'sarah.j@email.com', phone: '(555) 123-4567', date: '01/10/2024', status: 'booked', priority: 'high', caseType: 'Personal Injury' },
  { id: '2', clientName: 'Michael Ross', email: 'mross@email.com', phone: '(555) 234-5678', date: '01/10/2024', status: 'booked', priority: 'medium', caseType: 'Criminal Defense' },
  { id: '3', clientName: 'David Kim', email: 'd.kim@email.com', phone: '(555) 345-6789', date: '01/09/2024', status: 'follow-up', priority: 'high', caseType: 'Family Law' },
  { id: '4', clientName: 'Amanda Chen', email: 'achen@email.com', phone: '(555) 456-7890', date: '01/09/2024', status: 'follow-up', priority: 'low', caseType: 'Estate Planning' },
  { id: '5', clientName: 'Robert Fox', email: 'rfox@email.com', phone: '(555) 567-8901', date: '01/08/2024', status: 'booked', priority: 'medium', caseType: 'Personal Injury' },
  { id: '6', clientName: 'Emily Watson', email: 'ewatson@email.com', phone: '(555) 678-9012', date: '01/08/2024', status: 'pending', priority: 'low', caseType: 'Corporate' },
  { id: '7', clientName: 'James Wilson', email: 'jwilson@email.com', phone: '(555) 789-0123', date: '01/07/2024', status: 'booked', priority: 'high', caseType: 'Criminal Defense' },
  { id: '8', clientName: 'Lisa Brown', email: 'lbrown@email.com', phone: '(555) 890-1234', date: '01/07/2024', status: 'follow-up', priority: 'medium', caseType: 'Family Law' },
];

// Helper to format date
function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// Map lead status to case status
function mapLeadStatus(status: string): CaseHistoryItem['status'] {
  const statusMap: Record<string, CaseHistoryItem['status']> = {
    'in_progress': 'in_progress',
    'completed': 'booked',
    'abandoned': 'pending',
    'emergency': 'follow-up',
    'disqualified': 'closed',
  };
  return statusMap[status] || 'pending';
}

// Map qualification tier to priority
function mapPriority(tier: string | null): CaseHistoryItem['priority'] {
  if (tier === 'high') return 'high';
  if (tier === 'medium') return 'medium';
  return 'low';
}

// Convert Lead to CaseHistoryItem
function leadToCaseHistoryItem(lead: Lead): CaseHistoryItem {
  const contact = lead.contact || {};
  const caseInfo = lead.case_info || {};
  const qualification = lead.qualification || {};
  const nextSteps = lead.next_steps || {};

  // Determine status
  let status: CaseHistoryItem['status'] = mapLeadStatus(lead.status);
  if (nextSteps.appointment_booked) {
    status = 'booked';
  } else if (nextSteps.follow_up_date) {
    status = 'follow-up';
  }

  return {
    id: lead.id,
    date: formatDate(lead.created_at),
    clientName: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: contact.email || '',
    phone: contact.phone || '',
    status,
    priority: mapPriority(qualification.tier),
    caseType: caseInfo.type || 'General Inquiry',
    description: caseInfo.description,
    conversationId: lead.metadata?.conversation_id,
  };
}

/**
 * Get all cases for a tenant
 */
export async function getCases(tenantId?: string, options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<CaseHistoryItem[]> {
  if (!supabase) {
    console.log('[Cases] Using mock data - Supabase not configured');
    // Filter mock data if status is provided
    if (options?.status && options.status !== 'all') {
      return MOCK_CASES.filter(c => c.status === options.status);
    }
    return MOCK_CASES;
  }

  try {
    const leads = await getLeadsByTenant(tenantId || '', options);

    if (!leads || leads.length === 0) {
      // Return mock data if no leads found
      console.log('[Cases] No leads found, using mock data');
      return MOCK_CASES;
    }

    return leads.map(leadToCaseHistoryItem);
  } catch (error) {
    console.error('[Cases] Error fetching cases:', error);
    return MOCK_CASES;
  }
}

/**
 * Get a single case by ID
 */
export async function getCase(caseId: string): Promise<CaseHistoryItem | null> {
  if (!supabase) {
    return MOCK_CASES.find(c => c.id === caseId) || null;
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !data) {
      return MOCK_CASES.find(c => c.id === caseId) || null;
    }

    return leadToCaseHistoryItem(data as Lead);
  } catch (error) {
    console.error('[Cases] Error fetching case:', error);
    return null;
  }
}

/**
 * Create a new case (lead)
 */
export async function createCase(input: NewCaseInput): Promise<CaseHistoryItem | null> {
  if (!supabase) {
    console.log('[Cases] Cannot create case - Supabase not configured');
    // Return a mock case for demo purposes
    const mockCase: CaseHistoryItem = {
      id: `mock-${Date.now()}`,
      date: formatDate(new Date()),
      clientName: input.clientName,
      email: input.email || '',
      phone: input.phone || '',
      status: 'in_progress',
      priority: 'medium',
      caseType: input.caseType || 'General Inquiry',
      description: input.description,
    };
    return mockCase;
  }

  try {
    // Parse name into first/last
    const nameParts = input.clientName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const lead = await createLead({
      tenant_id: input.tenantId || '00000000-0000-0000-0000-000000000001',
      status: 'in_progress',
      channel: input.channel || 'web',
      contact: {
        first_name: firstName,
        last_name: lastName,
        email: input.email || null,
        phone: input.phone || null,
        preferred_contact_method: input.phone ? 'phone' : 'email',
      },
      case_info: {
        type: input.caseType || null,
        description: input.description || null,
        jurisdiction_state: input.jurisdictionState || null,
      },
      consent: {
        disclaimer_accepted: true,
        disclaimer_accepted_at: new Date().toISOString(),
      },
    });

    if (!lead) {
      return null;
    }

    return leadToCaseHistoryItem(lead);
  } catch (error) {
    console.error('[Cases] Error creating case:', error);
    return null;
  }
}

/**
 * Update a case
 */
export async function updateCase(caseId: string, updates: Partial<{
  status: CaseHistoryItem['status'];
  priority: CaseHistoryItem['priority'];
  caseType: string;
  appointmentBooked: boolean;
  appointmentDatetime: string;
  followUpDate: string;
}>): Promise<CaseHistoryItem | null> {
  if (!supabase) {
    console.log('[Cases] Cannot update case - Supabase not configured');
    const mockCase = MOCK_CASES.find(c => c.id === caseId);
    if (mockCase) {
      return { ...mockCase, ...updates };
    }
    return null;
  }

  try {
    // Build update object
    const leadUpdates: Partial<Lead> = {};

    if (updates.status) {
      const statusMap: Record<string, string> = {
        'in_progress': 'in_progress',
        'booked': 'completed',
        'follow-up': 'in_progress',
        'pending': 'abandoned',
        'closed': 'disqualified',
      };
      leadUpdates.status = statusMap[updates.status] || 'in_progress';
    }

    if (updates.priority) {
      leadUpdates.qualification = {
        tier: updates.priority,
      };
    }

    if (updates.caseType) {
      leadUpdates.case_info = {
        type: updates.caseType,
      };
    }

    if (updates.appointmentBooked !== undefined || updates.appointmentDatetime || updates.followUpDate) {
      leadUpdates.next_steps = {
        appointment_booked: updates.appointmentBooked,
        appointment_datetime: updates.appointmentDatetime,
        follow_up_date: updates.followUpDate,
      };
    }

    const lead = await updateLead(caseId, leadUpdates);

    if (!lead) {
      return null;
    }

    return leadToCaseHistoryItem(lead);
  } catch (error) {
    console.error('[Cases] Error updating case:', error);
    return null;
  }
}

/**
 * Get case counts by status
 */
export async function getCaseCounts(tenantId?: string): Promise<{
  all: number;
  booked: number;
  followUp: number;
  pending: number;
  inProgress: number;
}> {
  if (!supabase) {
    return {
      all: MOCK_CASES.length,
      booked: MOCK_CASES.filter(c => c.status === 'booked').length,
      followUp: MOCK_CASES.filter(c => c.status === 'follow-up').length,
      pending: MOCK_CASES.filter(c => c.status === 'pending').length,
      inProgress: MOCK_CASES.filter(c => c.status === 'in_progress').length,
    };
  }

  try {
    // Get total count
    let totalQuery = supabase.from('leads').select('*', { count: 'exact', head: true });
    if (tenantId) {
      totalQuery = totalQuery.eq('tenant_id', tenantId);
    }
    const { count: total } = await totalQuery;

    // Get completed (booked) count
    let bookedQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('next_steps->appointment_booked', true);
    if (tenantId) {
      bookedQuery = bookedQuery.eq('tenant_id', tenantId);
    }
    const { count: booked } = await bookedQuery;

    // Get in_progress count
    let inProgressQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress');
    if (tenantId) {
      inProgressQuery = inProgressQuery.eq('tenant_id', tenantId);
    }
    const { count: inProgress } = await inProgressQuery;

    // Get abandoned (pending) count
    let pendingQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'abandoned');
    if (tenantId) {
      pendingQuery = pendingQuery.eq('tenant_id', tenantId);
    }
    const { count: pending } = await pendingQuery;

    // Calculate follow-up (has follow_up_date but not booked)
    const followUp = (total || 0) - (booked || 0) - (inProgress || 0) - (pending || 0);

    return {
      all: total || 0,
      booked: booked || 0,
      followUp: Math.max(0, followUp),
      pending: pending || 0,
      inProgress: inProgress || 0,
    };
  } catch (error) {
    console.error('[Cases] Error fetching case counts:', error);
    return {
      all: MOCK_CASES.length,
      booked: MOCK_CASES.filter(c => c.status === 'booked').length,
      followUp: MOCK_CASES.filter(c => c.status === 'follow-up').length,
      pending: MOCK_CASES.filter(c => c.status === 'pending').length,
      inProgress: MOCK_CASES.filter(c => c.status === 'in_progress').length,
    };
  }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
  return supabase !== null;
}

/**
 * Save conversation to case
 */
export async function saveConversationToCase(
  caseId: string,
  conversationId: string,
  messageCount: number,
  durationSeconds: number
): Promise<boolean> {
  if (!supabase) {
    console.log('[Cases] Cannot save conversation - Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('leads')
      .update({
        metadata: {
          conversation_id: conversationId,
          message_count: messageCount,
          duration_seconds: durationSeconds,
        },
      })
      .eq('id', caseId);

    return !error;
  } catch (error) {
    console.error('[Cases] Error saving conversation to case:', error);
    return false;
  }
}

export default {
  getCases,
  getCase,
  createCase,
  updateCase,
  getCaseCounts,
  isDatabaseConnected,
  saveConversationToCase,
};
