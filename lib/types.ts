// ============================================
// Legal Intake SaaS - TypeScript Types
// ============================================

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const LeadStatus = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
  EMERGENCY: 'emergency',
  DISQUALIFIED: 'disqualified',
} as const;
export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];

export const Channel = {
  WEB: 'web',
  SMS: 'sms',
  VOICE: 'voice',
} as const;
export type Channel = typeof Channel[keyof typeof Channel];

export const QualificationTier = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold',
  DISQUALIFIED: 'disqualified',
} as const;
export type QualificationTier = typeof QualificationTier[keyof typeof QualificationTier];

export const ContactMethod = {
  PHONE: 'phone',
  EMAIL: 'email',
  TEXT: 'text',
} as const;
export type ContactMethod = typeof ContactMethod[keyof typeof ContactMethod];

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;
export type MessageRole = typeof MessageRole[keyof typeof MessageRole];

export const FollowUpTrigger = {
  ABANDONED: 'abandoned',
  NO_APPOINTMENT: 'no_appointment',
  NO_RESPONSE: 'no_response',
  SCHEDULED: 'scheduled',
  NURTURE: 'nurture',
} as const;
export type FollowUpTrigger = typeof FollowUpTrigger[keyof typeof FollowUpTrigger];

export const IntegrationType = {
  CALENDLY: 'calendly',
  CLIO: 'clio',
  MYCASE: 'mycase',
  LAWMATICS: 'lawmatics',
  ZAPIER: 'zapier',
  TWILIO: 'twilio',
  SENDGRID: 'sendgrid',
} as const;
export type IntegrationType = typeof IntegrationType[keyof typeof IntegrationType];

// US States for jurisdiction
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;
export type USState = typeof US_STATES[number];

// Two-party consent states for recording
export const TWO_PARTY_CONSENT_STATES: USState[] = [
  'CA', 'CT', 'FL', 'IL', 'MD', 'MA', 'MT', 'NH', 'PA', 'WA'
];

// ============================================
// TENANT CONFIGURATION
// ============================================

export interface TenantBranding {
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

export interface TenantContact {
  phone: string | null;
  email: string | null;
  address: string | null;
  business_hours: string | null;
  timezone: string;
  after_hours_message: string | null;
}

export interface TenantAIConfig {
  tone: 'professional' | 'friendly' | 'formal';
  firm_description: string | null;
  practice_areas: string[];
  custom_instructions: string | null;
}

export interface TenantFeatures {
  voice_enabled: boolean;
  sms_enabled: boolean;
  email_followup_enabled: boolean;
  calendly_enabled: boolean;
  emergency_detection: boolean;
  lead_scoring: boolean;
}

export interface TenantIntegrations {
  calendly_url: string | null;
  clio_enabled: boolean;
  zapier_webhook: string | null;
}

export interface TenantDisclaimers {
  pre_chat: string;
  recording_notice: string;
  custom_disclaimer: string | null;
}

export interface TenantConfig {
  branding: TenantBranding;
  contact: TenantContact;
  ai: TenantAIConfig;
  features: TenantFeatures;
  integrations: TenantIntegrations;
  disclaimers: TenantDisclaimers;
}

export interface Tenant {
  id: string;
  slug: string;
  custom_domain: string | null;
  name: string;
  config: TenantConfig;
  subscription_tier: 'basic' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// LEAD SCHEMA
// ============================================

export interface LeadContact {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  preferred_contact_method: ContactMethod;
  best_time_to_call: string | null;
  timezone: string | null;
}

export interface LeadCase {
  type: string | null;
  subtype: string | null;
  jurisdiction_state: USState | null;
  incident_date: string | null;
  incident_location: string | null;
  description: string | null;
  opposing_party: string | null;
  statute_of_limitations_date: string | null;
  sol_warning: boolean;
  police_report_filed: boolean | null;
  currently_represented: boolean;
  prior_claims: boolean;
}

export interface QualificationFactors {
  case_value: number;        // 0-30
  liability_clarity: number; // 0-20
  timeline: number;          // 0-20
  injury_severity: number;   // 0-15
  geographic_match: number;  // 0-10
  insurance_status: number;  // 0-5
}

export interface LeadQualification {
  score: number | null;
  tier: QualificationTier | null;
  disqualification_reason: string | null;
  factors: QualificationFactors;
}

export interface LeadNextSteps {
  documents_needed: string[];
  recommended_action: string | null;
  appointment_booked: boolean;
  appointment_datetime: string | null;
  appointment_type: string | null;
  assigned_to: string | null;
  follow_up_date: string | null;
}

export interface LeadConsent {
  disclaimer_accepted: boolean;
  disclaimer_accepted_at: string | null;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  recording_consent: boolean;
  terms_accepted: boolean;
}

export interface LeadMetadata {
  conversation_id: string | null;
  message_count: number;
  duration_seconds: number;
  source: string | null;
  utm_params: Record<string, string> | null;
  ip_address_hash: string | null;
  user_agent: string | null;
}

export interface Lead {
  id: string;
  tenant_id: string;
  status: LeadStatus;
  channel: Channel;
  contact: LeadContact;
  case_info: LeadCase;
  qualification: LeadQualification;
  next_steps: LeadNextSteps;
  consent: LeadConsent;
  metadata: LeadMetadata;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ============================================
// CONVERSATION & MESSAGES
// ============================================

export interface Conversation {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  channel: Channel;
  started_at: string;
  ended_at: string | null;
  message_count: number;
  duration_seconds: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  tenant_id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ============================================
// AUDIT & EMERGENCY
// ============================================

export interface AuditLog {
  id: string;
  tenant_id: string;
  event_type: string;
  actor_type: 'user' | 'system' | 'admin' | 'client';
  actor_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EmergencyEvent {
  id: string;
  tenant_id: string;
  lead_id: string | null;
  conversation_id: string | null;
  trigger_type: string;
  severity: 'critical' | 'high' | 'medium';
  transcript: string | null;
  alert_sent_to: Array<{ type: 'email' | 'sms'; recipient: string }>;
  alert_sent_at: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  created_at: string;
}

// ============================================
// FOLLOW UPS
// ============================================

export interface FollowUp {
  id: string;
  tenant_id: string;
  lead_id: string;
  trigger_type: FollowUpTrigger;
  channel: 'sms' | 'email';
  scheduled_for: string;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed' | 'cancelled' | 'bounced';
  content: string;
  error_message: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  created_at: string;
}

// ============================================
// INTEGRATIONS
// ============================================

export interface Integration {
  id: string;
  tenant_id: string;
  type: IntegrationType;
  credentials: Record<string, unknown>;
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const LeadContactSchema = z.object({
  first_name: z.string().min(1).max(100).nullable(),
  last_name: z.string().min(1).max(100).nullable(),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/).nullable(),
  email: z.string().email().nullable(),
  preferred_contact_method: z.enum(['phone', 'email', 'text']),
  best_time_to_call: z.string().nullable(),
  timezone: z.string().nullable(),
});

export const LeadCaseSchema = z.object({
  type: z.string().nullable(),
  subtype: z.string().nullable(),
  jurisdiction_state: z.enum(US_STATES).nullable(),
  incident_date: z.string().nullable(),
  incident_location: z.string().nullable(),
  description: z.string().nullable(),
  opposing_party: z.string().nullable(),
  statute_of_limitations_date: z.string().nullable(),
  sol_warning: z.boolean(),
  police_report_filed: z.boolean().nullable(),
  currently_represented: z.boolean(),
  prior_claims: z.boolean(),
});

export const LeadConsentSchema = z.object({
  disclaimer_accepted: z.boolean(),
  disclaimer_accepted_at: z.string().nullable(),
  sms_opt_in: z.boolean(),
  email_opt_in: z.boolean(),
  recording_consent: z.boolean(),
  terms_accepted: z.boolean(),
});

// ============================================
// HELPER TYPES
// ============================================

export type CreateLead = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;
export type UpdateLead = Partial<Omit<Lead, 'id' | 'tenant_id' | 'created_at'>>;

export type CreateConversation = Omit<Conversation, 'id' | 'ended_at'>;
export type CreateMessage = Omit<Message, 'id' | 'created_at'>;

export type CreateAuditLog = Omit<AuditLog, 'id' | 'created_at'>;
export type CreateEmergencyEvent = Omit<EmergencyEvent, 'id' | 'created_at' | 'resolved_at' | 'resolved_by' | 'resolution_notes'>;
