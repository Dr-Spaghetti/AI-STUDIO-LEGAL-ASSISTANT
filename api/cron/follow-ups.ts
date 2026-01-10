// ============================================
// Follow-up Scheduler - Cron Job
// ============================================
// Processes pending follow-ups and sends SMS/email
// Run via Vercel Cron: every 5 minutes

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// SMS Templates
const SMS_TEMPLATES: Record<string, (data: TemplateData) => string> = {
  abandoned_followup: (d) =>
    `Hi ${d.first_name}, this is ${d.firm_name}. We noticed you started an inquiry but didn't finish. We're here to help with your ${d.case_type} case. Reply to continue or call us.`,

  appointment_reminder: (d) =>
    `Reminder: Your consultation with ${d.firm_name} is scheduled for ${d.appointment_time}. Reply CONFIRM to confirm or RESCHEDULE to change.`,

  post_call_followup: (d) =>
    `Thank you for speaking with ${d.firm_name} about your ${d.case_type} case. If you have any questions, reply to this message or call us.`,

  document_request: (d) =>
    `${d.firm_name}: To proceed with your case, please send us: ${d.documents}. You can reply to this message with photos or use our secure portal.`,

  check_in: (d) =>
    `Hi ${d.first_name}, ${d.firm_name} checking in on your ${d.case_type} case. Any updates or questions? We're here to help.`,

  reengagement: (d) =>
    `Hi ${d.first_name}, we haven't heard from you in a while. ${d.firm_name} is still here to help with your legal needs. Reply if you'd like to reconnect.`,
};

interface TemplateData {
  first_name: string;
  last_name: string;
  firm_name: string;
  case_type: string;
  appointment_time?: string;
  documents?: string;
  [key: string]: string | undefined;
}

interface FollowUp {
  id: string;
  tenant_id: string;
  lead_id: string;
  type: 'sms' | 'email';
  template: string;
  scheduled_for: string;
  status: string;
  attempts: number;
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    case_type: string;
    consent: {
      sms_opt_in: boolean;
      email_opt_in: boolean;
    };
    metadata?: Record<string, unknown>;
  };
  tenant: {
    name: string;
    settings: {
      messaging?: {
        quiet_hours_start?: number;
        quiet_hours_end?: number;
        timezone?: string;
      };
    };
  };
}

interface ProcessResult {
  id: string;
  status: 'sent' | 'skipped' | 'failed';
  reason?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow in development without secret
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  console.log('Follow-up scheduler running...');

  try {
    // Fetch pending follow-ups that are due
    const now = new Date().toISOString();
    const followUpsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/follow_ups?status=eq.pending&scheduled_for=lte.${now}&select=*,lead:leads(*),tenant:tenants(name,settings)&limit=50`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!followUpsResponse.ok) {
      throw new Error('Failed to fetch follow-ups');
    }

    const followUps: FollowUp[] = await followUpsResponse.json();
    console.log(`Found ${followUps.length} pending follow-ups`);

    const results: ProcessResult[] = [];

    for (const followUp of followUps) {
      const result = await processFollowUp(followUp);
      results.push(result);
    }

    const sent = results.filter((r) => r.status === 'sent').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    console.log(`Processed: ${sent} sent, ${skipped} skipped, ${failed} failed`);

    return res.status(200).json({
      processed: results.length,
      sent,
      skipped,
      failed,
      results,
    });
  } catch (err) {
    console.error('Scheduler error:', err);
    return res.status(500).json({ error: 'Scheduler failed' });
  }
}

async function processFollowUp(followUp: FollowUp): Promise<ProcessResult> {
  const { id, type, template, lead, tenant } = followUp;

  // Check consent
  if (type === 'sms' && !lead.consent?.sms_opt_in) {
    await updateFollowUpStatus(id, 'skipped', 'no_sms_consent');
    return { id, status: 'skipped', reason: 'No SMS consent' };
  }

  if (type === 'email' && !lead.consent?.email_opt_in) {
    await updateFollowUpStatus(id, 'skipped', 'no_email_consent');
    return { id, status: 'skipped', reason: 'No email consent' };
  }

  // Check quiet hours for SMS
  if (type === 'sms') {
    const quietCheck = isQuietHours(tenant.settings?.messaging);
    if (quietCheck.isQuiet) {
      // Reschedule for after quiet hours
      await rescheduleFollowUp(id, quietCheck.resumeAt!);
      return { id, status: 'skipped', reason: 'Quiet hours - rescheduled' };
    }
  }

  // Generate message content
  const templateFn = SMS_TEMPLATES[template];
  if (!templateFn) {
    await updateFollowUpStatus(id, 'failed', 'unknown_template');
    return { id, status: 'failed', reason: `Unknown template: ${template}` };
  }

  const templateData: TemplateData = {
    first_name: lead.first_name,
    last_name: lead.last_name,
    firm_name: tenant.name,
    case_type: lead.case_type || 'legal',
    appointment_time: (lead.metadata?.calendly as Record<string, string>)?.start_time
      ? new Date((lead.metadata.calendly as Record<string, string>).start_time).toLocaleString()
      : undefined,
  };

  const messageContent = templateFn(templateData);

  // Send the message
  if (type === 'sms') {
    const sendResult = await sendSMS(lead.phone, messageContent, followUp.tenant_id, lead.id);
    if (sendResult.success) {
      await updateFollowUpStatus(id, 'sent');
      await logMessage(followUp.tenant_id, lead.id, sendResult.sid!, messageContent, 'outbound');
      return { id, status: 'sent' };
    } else {
      await updateFollowUpStatus(id, 'failed', sendResult.error);
      return { id, status: 'failed', reason: sendResult.error };
    }
  }

  // Email handling would go here
  return { id, status: 'skipped', reason: 'Email not implemented' };
}

async function sendSMS(
  to: string,
  body: string,
  tenantId: string,
  leadId: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return { success: false, error: 'Twilio not configured' };
  }

  // Normalize phone number
  let normalizedPhone = to.replace(/\D/g, '');
  if (normalizedPhone.length === 10) {
    normalizedPhone = `+1${normalizedPhone}`;
  } else if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = `+${normalizedPhone}`;
  }

  // Add compliance footer
  const messageWithFooter = `${body}\n\nReply STOP to opt out.`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          To: normalizedPhone,
          From: TWILIO_PHONE_NUMBER,
          Body: messageWithFooter,
          StatusCallback: `${process.env.VERCEL_URL || ''}/api/webhooks/twilio`,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, sid: data.sid };
    } else {
      return { success: false, error: data.message || 'SMS send failed' };
    }
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function updateFollowUpStatus(id: string, status: string, reason?: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;

  await fetch(`${SUPABASE_URL}/rest/v1/follow_ups?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      status,
      failure_reason: reason,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }),
  });
}

async function rescheduleFollowUp(id: string, newTime: Date) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return;

  await fetch(`${SUPABASE_URL}/rest/v1/follow_ups?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      scheduled_for: newTime.toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
}

async function logMessage(
  tenantId: string,
  leadId: string,
  externalId: string,
  content: string,
  direction: string
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
      external_id: externalId,
      channel: 'sms',
      direction,
      content,
      sender: TWILIO_PHONE_NUMBER,
    }),
  });
}

function isQuietHours(settings?: {
  quiet_hours_start?: number;
  quiet_hours_end?: number;
  timezone?: string;
}): { isQuiet: boolean; resumeAt?: Date } {
  const start = settings?.quiet_hours_start ?? 21; // 9 PM
  const end = settings?.quiet_hours_end ?? 8; // 8 AM
  const timezone = settings?.timezone ?? 'America/New_York';

  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const currentHour = parseInt(formatter.format(now), 10);

  // Check if current hour is in quiet hours
  const isQuiet = start > end
    ? currentHour >= start || currentHour < end // Overnight (e.g., 21:00 - 08:00)
    : currentHour >= start && currentHour < end; // Same day

  if (isQuiet) {
    // Calculate when quiet hours end
    const resumeAt = new Date(now);
    if (currentHour >= start) {
      // It's late night, resume tomorrow morning
      resumeAt.setDate(resumeAt.getDate() + 1);
    }
    resumeAt.setHours(end, 0, 0, 0);
    return { isQuiet: true, resumeAt };
  }

  return { isQuiet: false };
}
