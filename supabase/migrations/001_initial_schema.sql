-- ============================================
-- Legal Intake SaaS - Initial Schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TENANTS TABLE
-- ============================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(63) UNIQUE NOT NULL,
  custom_domain VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,

  -- Branding & Configuration (JSONB)
  config JSONB NOT NULL DEFAULT '{
    "branding": {
      "logo_url": null,
      "primary_color": "#00FFC8",
      "secondary_color": "#1A1D24",
      "accent_color": "#A78BFA"
    },
    "contact": {
      "phone": null,
      "email": null,
      "address": null,
      "business_hours": null,
      "timezone": "America/New_York",
      "after_hours_message": null
    },
    "ai": {
      "tone": "professional",
      "firm_description": null,
      "practice_areas": [],
      "custom_instructions": null
    },
    "features": {
      "voice_enabled": false,
      "sms_enabled": false,
      "email_followup_enabled": true,
      "calendly_enabled": false,
      "emergency_detection": true,
      "lead_scoring": true
    },
    "integrations": {
      "calendly_url": null,
      "clio_enabled": false,
      "zapier_webhook": null
    },
    "disclaimers": {
      "pre_chat": "This is an AI-powered intake assistant. This is not legal advice. By proceeding, you consent to the collection of information for the purpose of evaluating your potential legal matter.",
      "recording_notice": "This conversation may be recorded for quality assurance.",
      "custom_disclaimer": null
    }
  }'::jsonb,

  subscription_tier VARCHAR(50) NOT NULL DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  status VARCHAR(50) NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned', 'emergency', 'disqualified')),
  channel VARCHAR(20) NOT NULL DEFAULT 'web'
    CHECK (channel IN ('web', 'sms', 'voice')),

  -- Contact Information (JSONB)
  contact JSONB NOT NULL DEFAULT '{
    "first_name": null,
    "last_name": null,
    "phone": null,
    "email": null,
    "preferred_contact_method": "phone",
    "best_time_to_call": null,
    "timezone": null
  }'::jsonb,

  -- Case Information (JSONB)
  case_info JSONB NOT NULL DEFAULT '{
    "type": null,
    "subtype": null,
    "jurisdiction_state": null,
    "incident_date": null,
    "incident_location": null,
    "description": null,
    "opposing_party": null,
    "statute_of_limitations_date": null,
    "sol_warning": false,
    "police_report_filed": null,
    "currently_represented": false,
    "prior_claims": false
  }'::jsonb,

  -- Qualification (JSONB)
  qualification JSONB NOT NULL DEFAULT '{
    "score": null,
    "tier": null,
    "disqualification_reason": null,
    "factors": {
      "case_value": 0,
      "liability_clarity": 0,
      "timeline": 0,
      "injury_severity": 0,
      "geographic_match": 0,
      "insurance_status": 0
    }
  }'::jsonb,

  -- Next Steps (JSONB)
  next_steps JSONB NOT NULL DEFAULT '{
    "documents_needed": [],
    "recommended_action": null,
    "appointment_booked": false,
    "appointment_datetime": null,
    "appointment_type": null,
    "assigned_to": null,
    "follow_up_date": null
  }'::jsonb,

  -- Consent (JSONB)
  consent JSONB NOT NULL DEFAULT '{
    "disclaimer_accepted": false,
    "disclaimer_accepted_at": null,
    "sms_opt_in": false,
    "email_opt_in": false,
    "recording_consent": false,
    "terms_accepted": false
  }'::jsonb,

  -- Metadata (JSONB)
  metadata JSONB NOT NULL DEFAULT '{
    "conversation_id": null,
    "message_count": 0,
    "duration_seconds": 0,
    "source": null,
    "utm_params": null,
    "ip_address_hash": null,
    "user_agent": null
  }'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  channel VARCHAR(20) NOT NULL DEFAULT 'web'
    CHECK (channel IN ('web', 'sms', 'voice')),

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Optional metadata for function calls, tool use, etc.
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  event_type VARCHAR(100) NOT NULL,
  actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'system', 'admin', 'client')),
  actor_id VARCHAR(255),

  -- Resource being acted upon
  resource_type VARCHAR(50),
  resource_id UUID,

  -- Event details
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45), -- Supports IPv6
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EMERGENCY EVENTS TABLE
-- ============================================
CREATE TABLE emergency_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

  trigger_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'high'
    CHECK (severity IN ('critical', 'high', 'medium')),

  transcript TEXT,

  -- Who was alerted
  alert_sent_to JSONB NOT NULL DEFAULT '[]'::jsonb,
  alert_sent_at TIMESTAMPTZ,

  -- Resolution tracking
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  resolution_notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FOLLOW UPS TABLE
-- ============================================
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  trigger_type VARCHAR(50) NOT NULL
    CHECK (trigger_type IN ('abandoned', 'no_appointment', 'no_response', 'scheduled', 'nurture')),

  channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'email')),

  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,

  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled', 'bounced')),

  content TEXT NOT NULL,
  error_message TEXT,

  -- Response tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  type VARCHAR(50) NOT NULL
    CHECK (type IN ('calendly', 'clio', 'mycase', 'lawmatics', 'zapier', 'twilio', 'sendgrid')),

  -- Encrypted credentials
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Integration-specific configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Only one active integration of each type per tenant
  UNIQUE(tenant_id, type)
);

-- ============================================
-- INDEXES
-- ============================================

-- Tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;

-- Leads
CREATE INDEX idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX idx_leads_status ON leads(tenant_id, status);
CREATE INDEX idx_leads_created_at ON leads(tenant_id, created_at DESC);
CREATE INDEX idx_leads_qualification_tier ON leads(tenant_id, (qualification->>'tier'));

-- Conversations
CREATE INDEX idx_conversations_tenant_id ON conversations(tenant_id);
CREATE INDEX idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX idx_conversations_started_at ON conversations(tenant_id, started_at DESC);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at);

-- Audit Logs
CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(tenant_id, event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(tenant_id, resource_type, resource_id);

-- Emergency Events
CREATE INDEX idx_emergency_events_tenant_id ON emergency_events(tenant_id);
CREATE INDEX idx_emergency_events_unresolved ON emergency_events(tenant_id, resolved) WHERE resolved = false;

-- Follow Ups
CREATE INDEX idx_follow_ups_tenant_id ON follow_ups(tenant_id);
CREATE INDEX idx_follow_ups_lead_id ON follow_ups(lead_id);
CREATE INDEX idx_follow_ups_pending ON follow_ups(tenant_id, scheduled_for) WHERE status = 'pending';

-- Integrations
CREATE INDEX idx_integrations_tenant_id ON integrations(tenant_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Helper function to get current tenant from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'tenant_id',
    current_setting('app.current_tenant_id', true)
  )::uuid;
$$ LANGUAGE sql STABLE;

-- RLS Policies for tenants (admin access patterns differ)
CREATE POLICY "Tenants are viewable by authenticated users belonging to tenant"
  ON tenants FOR SELECT
  USING (id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Tenants can be updated by authenticated users belonging to tenant"
  ON tenants FOR UPDATE
  USING (id = auth.tenant_id() OR auth.role() = 'service_role');

-- RLS Policies for leads
CREATE POLICY "Leads are viewable by tenant"
  ON leads FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Leads can be inserted by tenant"
  ON leads FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Leads can be updated by tenant"
  ON leads FOR UPDATE
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

-- RLS Policies for conversations
CREATE POLICY "Conversations are viewable by tenant"
  ON conversations FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Conversations can be inserted by tenant"
  ON conversations FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Conversations can be updated by tenant"
  ON conversations FOR UPDATE
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by tenant"
  ON messages FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Messages can be inserted by tenant"
  ON messages FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

-- RLS Policies for audit_logs (read-only for clients)
CREATE POLICY "Audit logs are viewable by tenant"
  ON audit_logs FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Audit logs can be inserted by system"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR tenant_id = auth.tenant_id());

-- RLS Policies for emergency_events
CREATE POLICY "Emergency events are viewable by tenant"
  ON emergency_events FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Emergency events can be inserted"
  ON emergency_events FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Emergency events can be updated by tenant"
  ON emergency_events FOR UPDATE
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

-- RLS Policies for follow_ups
CREATE POLICY "Follow ups are viewable by tenant"
  ON follow_ups FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Follow ups can be inserted"
  ON follow_ups FOR INSERT
  WITH CHECK (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Follow ups can be updated by tenant"
  ON follow_ups FOR UPDATE
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

-- RLS Policies for integrations
CREATE POLICY "Integrations are viewable by tenant"
  ON integrations FOR SELECT
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

CREATE POLICY "Integrations can be managed by tenant"
  ON integrations FOR ALL
  USING (tenant_id = auth.tenant_id() OR auth.role() = 'service_role');

-- ============================================
-- SEED DATA (Demo Tenant)
-- ============================================
INSERT INTO tenants (id, slug, name, config) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo',
  'Demo Law Firm',
  '{
    "branding": {
      "logo_url": null,
      "primary_color": "#00FFC8",
      "secondary_color": "#1A1D24",
      "accent_color": "#A78BFA"
    },
    "contact": {
      "phone": "(555) 123-4567",
      "email": "intake@demolawfirm.com",
      "address": "123 Legal Street, Suite 100, New York, NY 10001",
      "business_hours": "Mon-Fri 9am-5pm EST",
      "timezone": "America/New_York",
      "after_hours_message": "Thank you for calling Demo Law Firm. Our office is currently closed. Please leave your information and we will contact you during business hours."
    },
    "ai": {
      "tone": "professional",
      "firm_description": "Demo Law Firm is a full-service law firm specializing in personal injury, family law, and criminal defense.",
      "practice_areas": ["Personal Injury", "Family Law", "Criminal Defense", "Estate Planning"],
      "custom_instructions": null
    },
    "features": {
      "voice_enabled": true,
      "sms_enabled": false,
      "email_followup_enabled": true,
      "calendly_enabled": false,
      "emergency_detection": true,
      "lead_scoring": true
    },
    "integrations": {
      "calendly_url": null,
      "clio_enabled": false,
      "zapier_webhook": null
    },
    "disclaimers": {
      "pre_chat": "Welcome to Demo Law Firm. This is an AI-powered intake assistant designed to gather information about your potential legal matter. This is not legal advice, and no attorney-client relationship is formed through this interaction. By proceeding, you consent to the collection of your information.",
      "recording_notice": "This conversation may be recorded for quality assurance and training purposes.",
      "custom_disclaimer": null
    }
  }'::jsonb
);
