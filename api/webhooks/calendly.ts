// ============================================
// Calendly Webhook Handler
// ============================================
// Handles invitee.created and invitee.canceled events

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface CalendlyWebhookPayload {
  event: string;
  created_at: string;
  created_by: string;
  payload: {
    cancel_url?: string;
    created_at: string;
    email: string;
    event: string;
    name: string;
    new_invitee?: string;
    old_invitee?: string;
    reschedule_url?: string;
    rescheduled: boolean;
    status: string;
    text_reminder_number?: string;
    timezone: string;
    updated_at: string;
    uri: string;
    scheduled_event: {
      uri: string;
      name: string;
      status: string;
      start_time: string;
      end_time: string;
      event_type: string;
      location: {
        type: string;
        location?: string;
        join_url?: string;
      };
      invitees_counter: {
        total: number;
        active: number;
        limit: number;
      };
      created_at: string;
      updated_at: string;
      event_memberships: Array<{
        user: string;
      }>;
    };
    questions_and_answers?: Array<{
      answer: string;
      position: number;
      question: string;
    }>;
    tracking?: {
      utm_campaign?: string;
      utm_source?: string;
      utm_medium?: string;
      utm_content?: string;
      utm_term?: string;
      salesforce_uuid?: string;
    };
  };
}

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature if secret is configured
  if (CALENDLY_WEBHOOK_SECRET) {
    const signature = req.headers['calendly-webhook-signature'] as string;
    if (!signature) {
      console.error('Missing webhook signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const rawBody = JSON.stringify(req.body);
    if (!verifyWebhookSignature(rawBody, signature, CALENDLY_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  const payload: CalendlyWebhookPayload = req.body;
  const { event, payload: eventData } = payload;

  console.log(`Calendly webhook received: ${event}`);

  try {
    switch (event) {
      case 'invitee.created':
        await handleInviteeCreated(eventData);
        break;
      case 'invitee.canceled':
        await handleInviteeCanceled(eventData);
        break;
      default:
        console.log(`Unhandled Calendly event: ${event}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Processing failed' });
  }
}

async function handleInviteeCreated(data: CalendlyWebhookPayload['payload']) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase configuration');
    return;
  }

  // Extract lead info from invitee
  const email = data.email;
  const name = data.name;
  const scheduledEvent = data.scheduled_event;

  // Find the lead by email
  const leadResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const leads = await leadResponse.json();
  const lead = leads[0];

  if (lead) {
    // Update lead with appointment info
    await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${lead.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'appointment_scheduled',
        metadata: {
          ...lead.metadata,
          calendly: {
            event_uri: scheduledEvent.uri,
            event_name: scheduledEvent.name,
            start_time: scheduledEvent.start_time,
            end_time: scheduledEvent.end_time,
            invitee_uri: data.uri,
            cancel_url: data.cancel_url,
            reschedule_url: data.reschedule_url,
            location: scheduledEvent.location,
            booked_at: new Date().toISOString(),
          },
        },
        updated_at: new Date().toISOString(),
      }),
    });

    // Log the appointment
    await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tenant_id: lead.tenant_id,
        action: 'appointment_scheduled',
        entity_type: 'lead',
        entity_id: lead.id,
        details: {
          event_name: scheduledEvent.name,
          start_time: scheduledEvent.start_time,
          invitee_name: name,
          invitee_email: email,
        },
      }),
    });

    // Cancel any pending follow-ups since they booked
    await fetch(
      `${SUPABASE_URL}/rest/v1/follow_ups?lead_id=eq.${lead.id}&status=eq.pending`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancelled_reason: 'appointment_booked',
          updated_at: new Date().toISOString(),
        }),
      }
    );
  } else {
    console.log(`No lead found for email: ${email}`);
  }
}

async function handleInviteeCanceled(data: CalendlyWebhookPayload['payload']) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase configuration');
    return;
  }

  const email = data.email;

  // Find the lead by email
  const leadResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(email)}&select=*&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const leads = await leadResponse.json();
  const lead = leads[0];

  if (lead) {
    // Update lead status
    await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${lead.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'appointment_cancelled',
        metadata: {
          ...lead.metadata,
          calendly: {
            ...lead.metadata?.calendly,
            cancelled_at: new Date().toISOString(),
          },
        },
        updated_at: new Date().toISOString(),
      }),
    });

    // Log the cancellation
    await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tenant_id: lead.tenant_id,
        action: 'appointment_cancelled',
        entity_type: 'lead',
        entity_id: lead.id,
        details: {
          invitee_email: email,
        },
      }),
    });

    // Re-enable follow-ups for this lead
    // Schedule a re-engagement follow-up
    await fetch(`${SUPABASE_URL}/rest/v1/follow_ups`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        tenant_id: lead.tenant_id,
        lead_id: lead.id,
        type: 'sms',
        template: 'appointment_cancelled_followup',
        status: 'pending',
        scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      }),
    });
  }
}
