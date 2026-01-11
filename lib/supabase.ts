// ============================================
// Supabase Client Configuration
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Tenant, Lead, Conversation, Message, AuditLog } from './types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Database features disabled.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// ============================================
// TENANT OPERATIONS
// ============================================

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching tenant:', error);
    return null;
  }

  return data as Tenant;
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching tenant by domain:', error);
    return null;
  }

  return data as Tenant;
}

// ============================================
// LEAD OPERATIONS
// ============================================

export async function createLead(lead: Partial<Lead>): Promise<Lead | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    return null;
  }

  return data as Lead;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    return null;
  }

  return data as Lead;
}

export async function getLead(id: string): Promise<Lead | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    return null;
  }

  return data as Lead;
}

export async function getLeadsByTenant(
  tenantId: string,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Lead[]> {
  if (!supabase) return [];

  let query = supabase
    .from('leads')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data as Lead[];
}

// ============================================
// CONVERSATION OPERATIONS
// ============================================

export async function createConversation(conversation: Partial<Conversation>): Promise<Conversation | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('conversations')
    .insert(conversation)
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data as Conversation;
}

export async function updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating conversation:', error);
    return null;
  }

  return data as Conversation;
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export async function createMessage(message: Partial<Message>): Promise<Message | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    return null;
  }

  return data as Message;
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data as Message[];
}

// ============================================
// AUDIT LOG OPERATIONS
// ============================================

export async function createAuditLog(log: Partial<AuditLog>): Promise<AuditLog | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('audit_logs')
    .insert(log)
    .select()
    .single();

  if (error) {
    console.error('Error creating audit log:', error);
    return null;
  }

  return data as AuditLog;
}

// Helper to log events
export async function logEvent(
  tenantId: string,
  eventType: string,
  details: Record<string, unknown> = {},
  options?: {
    actorType?: 'user' | 'system' | 'admin' | 'client';
    actorId?: string;
    resourceType?: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await createAuditLog({
    tenant_id: tenantId,
    event_type: eventType,
    actor_type: options?.actorType || 'system',
    actor_id: options?.actorId || null,
    resource_type: options?.resourceType || null,
    resource_id: options?.resourceId || null,
    details,
    ip_address: options?.ipAddress || null,
    user_agent: options?.userAgent || null,
  });
}

// ============================================
// EMERGENCY EVENT OPERATIONS
// ============================================

export async function createEmergencyEvent(event: {
  tenant_id: string;
  lead_id?: string;
  conversation_id?: string;
  trigger_type: string;
  severity?: 'critical' | 'high' | 'medium';
  transcript?: string;
  alert_sent_to?: Array<{ type: 'email' | 'sms'; recipient: string }>;
}): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('emergency_events')
    .insert({
      ...event,
      severity: event.severity || 'high',
      alert_sent_to: event.alert_sent_to || [],
      alert_sent_at: event.alert_sent_to?.length ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating emergency event:', error);
    return null;
  }

  return data.id;
}

// ============================================
// FOLLOW UP OPERATIONS
// ============================================

export async function scheduleFollowUp(followUp: {
  tenant_id: string;
  lead_id: string;
  trigger_type: string;
  channel: 'sms' | 'email';
  scheduled_for: string;
  content: string;
}): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      ...followUp,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error scheduling follow up:', error);
    return null;
  }

  return data.id;
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export function subscribeToLeads(
  tenantId: string,
  callback: (lead: Lead) => void
): (() => void) | null {
  if (!supabase) return null;

  const subscription = supabase
    .channel(`leads:${tenantId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leads',
        filter: `tenant_id=eq.${tenantId}`,
      },
      (payload) => {
        callback(payload.new as Lead);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

export function subscribeToEmergencies(
  tenantId: string,
  callback: (event: { trigger_type: string; severity: string; lead_id: string }) => void
): (() => void) | null {
  if (!supabase) return null;

  const subscription = supabase
    .channel(`emergencies:${tenantId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'emergency_events',
        filter: `tenant_id=eq.${tenantId}`,
      },
      (payload) => {
        callback(payload.new as { trigger_type: string; severity: string; lead_id: string });
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// ============================================
// TENANT CONTEXT HELPER
// ============================================

export class TenantContext {
  private tenant: Tenant | null = null;

  async initialize(slugOrDomain: string): Promise<boolean> {
    // Try slug first
    this.tenant = await getTenantBySlug(slugOrDomain);

    // If not found, try domain
    if (!this.tenant) {
      this.tenant = await getTenantByDomain(slugOrDomain);
    }

    return this.tenant !== null;
  }

  get id(): string | null {
    return this.tenant?.id || null;
  }

  get config(): Tenant['config'] | null {
    return this.tenant?.config || null;
  }

  get name(): string {
    return this.tenant?.name || 'Legal Intake';
  }

  get branding() {
    return this.tenant?.config.branding || {
      logo_url: null,
      primary_color: '#00FFC8',
      secondary_color: '#1A1D24',
      accent_color: '#A78BFA',
    };
  }

  get disclaimers() {
    return this.tenant?.config.disclaimers || {
      pre_chat: 'This is an AI-powered intake assistant. This is not legal advice.',
      recording_notice: 'This conversation may be recorded.',
      custom_disclaimer: null,
    };
  }

  get features() {
    return this.tenant?.config.features || {
      voice_enabled: false,
      sms_enabled: false,
      email_followup_enabled: true,
      calendly_enabled: false,
      emergency_detection: true,
      lead_scoring: true,
    };
  }

  isTwoPartyConsentState(state: string): boolean {
    const twoPartyStates = ['CA', 'CT', 'FL', 'IL', 'MD', 'MA', 'MT', 'NH', 'PA', 'WA'];
    return twoPartyStates.includes(state.toUpperCase());
  }
}

// Export singleton instance
export const tenantContext = new TenantContext();
