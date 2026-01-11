// ============================================
// Twilio Webhook Handler
// ============================================
// Handles incoming SMS messages and delivery status

import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Opt-out keywords (TCPA compliance)
const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'cancel', 'end', 'quit', 'optout', 'opt-out'];
const OPT_IN_KEYWORDS = ['start', 'yes', 'unstop', 'subscribe', 'optin', 'opt-in'];
const HELP_KEYWORDS = ['help', 'info'];

interface TwilioIncomingSMS {
  MessageSid: string;
  AccountSid: string;
  From: string;
  To: string;
  Body: string;
  NumMedia?: string;
  FromCity?: string;
  FromState?: string;
  FromZip?: string;
  FromCountry?: string;
}

interface TwilioStatusCallback {
  MessageSid: string;
  MessageStatus: string;
  ErrorCode?: string;
  ErrorMessage?: string;
  To: string;
  From: string;
}

function validateTwilioRequest(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  // Build the string to sign
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // Create HMAC-SHA1 signature
  const hmac = crypto.createHmac('sha1', authToken);
  const expectedSignature = hmac.update(data).digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate Twilio signature if auth token is configured
  if (TWILIO_AUTH_TOKEN) {
    const signature = req.headers['x-twilio-signature'] as string;
    if (!signature) {
      console.error('Missing Twilio signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

    if (!validateTwilioRequest(url, req.body, signature, TWILIO_AUTH_TOKEN)) {
      console.error('Invalid Twilio signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  // Determine webhook type based on payload
  if (req.body.MessageStatus) {
    return handleStatusCallback(req.body, res);
  } else if (req.body.Body !== undefined) {
    return handleIncomingSMS(req.body, res);
  }

  return res.status(400).json({ error: 'Unknown webhook type' });
}

async function handleIncomingSMS(data: TwilioIncomingSMS, res: VercelResponse) {
  const { MessageSid, From, To, Body, FromState } = data;
  const messageBody = Body.trim().toLowerCase();

  console.log(`Incoming SMS from ${From}: ${Body}`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase configuration');
    return res.status(200).send(generateTwiML('Thank you for your message.'));
  }

  // Normalize phone number (remove +1 prefix if present)
  const normalizedPhone = From.replace(/^\+1/, '');

  // Find lead by phone number
  const leadResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?phone=like.*${normalizedPhone}&select=*&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const leads = await leadResponse.json();
  const lead = leads[0];

  // Handle opt-out
  if (OPT_OUT_KEYWORDS.includes(messageBody)) {
    if (lead) {
      await updateLeadConsent(lead.id, lead.tenant_id, false);
      await logMessage(lead.tenant_id, lead.id, MessageSid, From, To, Body, 'opt_out');
    }
    return res.status(200).send(
      generateTwiML(
        'You have been unsubscribed and will no longer receive messages. Reply START to re-subscribe.'
      )
    );
  }

  // Handle opt-in
  if (OPT_IN_KEYWORDS.includes(messageBody)) {
    if (lead) {
      await updateLeadConsent(lead.id, lead.tenant_id, true);
      await logMessage(lead.tenant_id, lead.id, MessageSid, From, To, Body, 'opt_in');
    }
    return res.status(200).send(
      generateTwiML(
        'You have been re-subscribed to messages. Reply STOP to unsubscribe at any time.'
      )
    );
  }

  // Handle help
  if (HELP_KEYWORDS.includes(messageBody)) {
    return res.status(200).send(
      generateTwiML(
        'Reply STOP to unsubscribe. For assistance, please call our office directly.'
      )
    );
  }

  // Log the incoming message
  if (lead) {
    await logMessage(lead.tenant_id, lead.id, MessageSid, From, To, Body, 'inbound');

    // Mark any pending follow-ups as responded
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
          status: 'responded',
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      }
    );

    // Update lead status to indicate engagement
    await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${lead.id}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        status: 'engaged',
        updated_at: new Date().toISOString(),
      }),
    });
  }

  // Auto-response for new messages
  return res.status(200).send(
    generateTwiML(
      'Thank you for your message. A member of our team will respond shortly. Reply STOP to opt out.'
    )
  );
}

async function handleStatusCallback(data: TwilioStatusCallback, res: VercelResponse) {
  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage, To } = data;

  console.log(`SMS Status: ${MessageSid} - ${MessageStatus}`);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(200).json({ received: true });
  }

  // Update message status in database
  await fetch(
    `${SUPABASE_URL}/rest/v1/messages?external_id=eq.${MessageSid}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        delivery_status: MessageStatus,
        delivery_error: ErrorCode ? `${ErrorCode}: ${ErrorMessage}` : null,
        updated_at: new Date().toISOString(),
      }),
    }
  );

  // If delivery failed, log for retry or alert
  if (['failed', 'undelivered'].includes(MessageStatus)) {
    console.error(`SMS delivery failed to ${To}: ${ErrorCode} - ${ErrorMessage}`);

    // Find the lead and log the failure
    const normalizedPhone = To.replace(/^\+1/, '');
    const leadResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?phone=like.*${normalizedPhone}&select=id,tenant_id&limit=1`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    const leads = await leadResponse.json();
    if (leads[0]) {
      await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          tenant_id: leads[0].tenant_id,
          action: 'sms_delivery_failed',
          entity_type: 'lead',
          entity_id: leads[0].id,
          details: {
            message_sid: MessageSid,
            error_code: ErrorCode,
            error_message: ErrorMessage,
          },
        }),
      });
    }
  }

  return res.status(200).json({ received: true });
}

async function updateLeadConsent(leadId: string, tenantId: string, smsOptIn: boolean) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;

  // First, fetch the current lead to get existing consent data
  const leadResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}&select=consent`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  const leads = await leadResponse.json();
  const existingConsent = leads[0]?.consent || {};

  // Update consent with new values
  const updatedConsent = {
    ...existingConsent,
    sms_opt_in: smsOptIn,
    sms_opt_in_at: smsOptIn ? new Date().toISOString() : existingConsent.sms_opt_in_at,
    sms_opt_out_at: smsOptIn ? existingConsent.sms_opt_out_at : new Date().toISOString(),
  };

  await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      consent: updatedConsent,
      updated_at: new Date().toISOString(),
    }),
  });

  // Log consent change
  await fetch(`${SUPABASE_URL}/rest/v1/audit_logs`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      action: smsOptIn ? 'sms_opt_in' : 'sms_opt_out',
      entity_type: 'lead',
      entity_id: leadId,
      details: {
        method: 'sms_keyword',
      },
    }),
  });
}

async function logMessage(
  tenantId: string,
  leadId: string,
  messageSid: string,
  from: string,
  to: string,
  body: string,
  type: string
) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;

  await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      tenant_id: tenantId,
      lead_id: leadId,
      external_id: messageSid,
      channel: 'sms',
      direction: 'inbound',
      content: body,
      sender: from,
      recipient: to,
      message_type: type,
    }),
  });
}

function generateTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
