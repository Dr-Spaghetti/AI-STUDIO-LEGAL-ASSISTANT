// ============================================
// Twilio SMS Integration
// ============================================
// SMS sending and follow-up automation

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';

// ============================================
// TYPES
// ============================================

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string; // Your Twilio phone number
  messagingServiceSid?: string; // Optional: Use messaging service for better deliverability
}

export interface SMSMessage {
  to: string;
  body: string;
  statusCallback?: string; // Webhook URL for delivery status
  mediaUrl?: string[]; // For MMS
}

export interface SMSResult {
  sid: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  to: string;
  from: string;
  body: string;
  dateCreated: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[]; // e.g., ['firstName', 'appointmentTime']
}

// ============================================
// SMS TEMPLATES
// ============================================

export const SMS_TEMPLATES: Record<string, SMSTemplate> = {
  // Follow-up after abandoned intake
  abandoned_followup: {
    id: 'abandoned_followup',
    name: 'Abandoned Intake Follow-up',
    body: `Hi {{firstName}}, this is {{firmName}}. We noticed you started an intake but didn't complete it. Would you like to continue? Reply YES to speak with someone, or call us at {{firmPhone}}.`,
    variables: ['firstName', 'firmName', 'firmPhone'],
  },

  // Appointment reminder
  appointment_reminder: {
    id: 'appointment_reminder',
    name: 'Appointment Reminder',
    body: `Hi {{firstName}}, this is a reminder of your consultation with {{firmName}} scheduled for {{appointmentTime}}. Reply CONFIRM to confirm or RESCHEDULE if you need to change the time.`,
    variables: ['firstName', 'firmName', 'appointmentTime'],
  },

  // Appointment confirmation
  appointment_confirmed: {
    id: 'appointment_confirmed',
    name: 'Appointment Confirmation',
    body: `Your consultation with {{firmName}} has been scheduled for {{appointmentTime}}. Please have any relevant documents ready. Questions? Call {{firmPhone}}.`,
    variables: ['firmName', 'appointmentTime', 'firmPhone'],
  },

  // Document request
  document_request: {
    id: 'document_request',
    name: 'Document Request',
    body: `Hi {{firstName}}, {{firmName}} here. To move forward with your case, we need: {{documentList}}. Reply to this message or email {{firmEmail}} to send documents.`,
    variables: ['firstName', 'firmName', 'documentList', 'firmEmail'],
  },

  // No response follow-up
  no_response_followup: {
    id: 'no_response_followup',
    name: 'No Response Follow-up',
    body: `Hi {{firstName}}, we haven't heard back from you. If you're still interested in discussing your {{caseType}} matter, please call {{firmPhone}} or reply to this message. We're here to help.`,
    variables: ['firstName', 'caseType', 'firmPhone'],
  },

  // Nurture sequence - initial
  nurture_initial: {
    id: 'nurture_initial',
    name: 'Nurture - Initial',
    body: `Hi {{firstName}}, thank you for contacting {{firmName}} about your {{caseType}} matter. If you have questions or are ready to proceed, we're here to help. Call {{firmPhone}}.`,
    variables: ['firstName', 'firmName', 'caseType', 'firmPhone'],
  },

  // Nurture sequence - educational
  nurture_educational: {
    id: 'nurture_educational',
    name: 'Nurture - Educational',
    body: `{{firstName}}, did you know that {{caseType}} cases have a statute of limitations? Don't wait too long to act. {{firmName}} offers free consultations: {{firmPhone}}.`,
    variables: ['firstName', 'caseType', 'firmName', 'firmPhone'],
  },

  // Opt-out confirmation
  optout_confirmation: {
    id: 'optout_confirmation',
    name: 'Opt-out Confirmation',
    body: `You've been unsubscribed from {{firmName}} text messages. If you change your mind, call {{firmPhone}}. Reply START to re-subscribe.`,
    variables: ['firmName', 'firmPhone'],
  },
};

// ============================================
// TEMPLATE RENDERING
// ============================================

export function renderTemplate(
  templateId: string,
  variables: Record<string, string>
): string {
  const template = SMS_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  let body = template.body;
  for (const [key, value] of Object.entries(variables)) {
    body = body.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }

  // Check for unreplaced variables
  const unreplaced = body.match(/\{\{(\w+)\}\}/g);
  if (unreplaced) {
    console.warn(`Unreplaced variables in template ${templateId}:`, unreplaced);
  }

  return body;
}

// ============================================
// TWILIO CLIENT
// ============================================

class TwilioClient {
  private config: TwilioConfig;
  private authHeader: string;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.authHeader = `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`;
  }

  /**
   * Send an SMS message
   */
  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    const formData = new URLSearchParams();
    formData.append('To', this.formatPhoneNumber(message.to));
    formData.append('Body', message.body);

    if (this.config.messagingServiceSid) {
      formData.append('MessagingServiceSid', this.config.messagingServiceSid);
    } else {
      formData.append('From', this.config.fromNumber);
    }

    if (message.statusCallback) {
      formData.append('StatusCallback', message.statusCallback);
    }

    if (message.mediaUrl) {
      message.mediaUrl.forEach((url) => {
        formData.append('MediaUrl', url);
      });
    }

    const response = await fetch(
      `${TWILIO_API_BASE}/Accounts/${this.config.accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio API error: ${data.message || JSON.stringify(data)}`);
    }

    return {
      sid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
      body: data.body,
      dateCreated: data.date_created,
      errorCode: data.error_code,
      errorMessage: data.error_message,
    };
  }

  /**
   * Send a templated SMS
   */
  async sendTemplateSMS(
    to: string,
    templateId: string,
    variables: Record<string, string>,
    statusCallback?: string
  ): Promise<SMSResult> {
    const body = renderTemplate(templateId, variables);
    return this.sendSMS({ to, body, statusCallback });
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageSid: string): Promise<SMSResult> {
    const response = await fetch(
      `${TWILIO_API_BASE}/Accounts/${this.config.accountSid}/Messages/${messageSid}.json`,
      {
        headers: {
          'Authorization': this.authHeader,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio API error: ${data.message || JSON.stringify(data)}`);
    }

    return {
      sid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
      body: data.body,
      dateCreated: data.date_created,
      errorCode: data.error_code,
      errorMessage: data.error_message,
    };
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const digits = phone.replace(/\D/g, '');

    // If already has country code, return with +
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }

    // Assume US number if 10 digits
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // Return as-is with + prefix if longer
    if (digits.length > 10) {
      return `+${digits}`;
    }

    throw new Error(`Invalid phone number format: ${phone}`);
  }
}

// ============================================
// FOLLOW-UP AUTOMATION
// ============================================

export interface FollowUpSchedule {
  trigger: 'abandoned' | 'no_appointment' | 'no_response' | 'appointment_reminder' | 'nurture';
  delays: number[]; // Delays in minutes from trigger
  templateIds: string[]; // Template for each delay
}

export const DEFAULT_FOLLOWUP_SCHEDULES: Record<string, FollowUpSchedule> = {
  abandoned: {
    trigger: 'abandoned',
    delays: [30, 120, 1440], // 30 min, 2 hours, 24 hours
    templateIds: ['abandoned_followup', 'abandoned_followup', 'no_response_followup'],
  },
  no_appointment: {
    trigger: 'no_appointment',
    delays: [60, 1440, 4320], // 1 hour, 24 hours, 3 days
    templateIds: ['nurture_initial', 'no_response_followup', 'nurture_educational'],
  },
  appointment_reminder: {
    trigger: 'appointment_reminder',
    delays: [-1440, -60], // 24 hours before, 1 hour before
    templateIds: ['appointment_reminder', 'appointment_reminder'],
  },
};

export interface ScheduledFollowUp {
  id: string;
  leadId: string;
  tenantId: string;
  phone: string;
  templateId: string;
  variables: Record<string, string>;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  messageSid?: string;
  error?: string;
}

/**
 * Calculate scheduled follow-up times based on trigger event
 */
export function calculateFollowUpTimes(
  triggerTime: Date,
  schedule: FollowUpSchedule
): Array<{ delay: number; templateId: string; scheduledFor: Date }> {
  return schedule.delays.map((delayMinutes, index) => ({
    delay: delayMinutes,
    templateId: schedule.templateIds[index],
    scheduledFor: new Date(triggerTime.getTime() + delayMinutes * 60 * 1000),
  }));
}

// ============================================
// WEBHOOK HANDLING
// ============================================

export interface TwilioWebhookPayload {
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  NumSegments: string;
  SmsStatus?: string;
  MessageStatus?: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

export interface IncomingSMS {
  sid: string;
  from: string;
  to: string;
  body: string;
  numMedia: number;
}

/**
 * Parse incoming SMS webhook
 */
export function parseIncomingSMS(payload: TwilioWebhookPayload): IncomingSMS {
  return {
    sid: payload.MessageSid,
    from: payload.From,
    to: payload.To,
    body: payload.Body,
    numMedia: parseInt(payload.NumMedia || '0', 10),
  };
}

/**
 * Check for opt-out keywords
 */
export function isOptOut(body: string): boolean {
  const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
  return optOutKeywords.includes(body.toLowerCase().trim());
}

/**
 * Check for opt-in keywords
 */
export function isOptIn(body: string): boolean {
  const optInKeywords = ['start', 'subscribe', 'yes', 'unstop'];
  return optInKeywords.includes(body.toLowerCase().trim());
}

/**
 * Check for confirmation keywords
 */
export function isConfirmation(body: string): boolean {
  const confirmKeywords = ['confirm', 'confirmed', 'yes', 'y'];
  return confirmKeywords.includes(body.toLowerCase().trim());
}

/**
 * Check for reschedule request
 */
export function isRescheduleRequest(body: string): boolean {
  const rescheduleKeywords = ['reschedule', 'change', 'different time', 'new time'];
  return rescheduleKeywords.some(kw => body.toLowerCase().includes(kw));
}

// ============================================
// COMPLIANCE HELPERS
// ============================================

/**
 * Check if we can send SMS to this number (consent + time restrictions)
 */
export function canSendSMS(
  hasConsent: boolean,
  timezone: string = 'America/New_York'
): { allowed: boolean; reason?: string } {
  if (!hasConsent) {
    return { allowed: false, reason: 'No SMS consent' };
  }

  // Check quiet hours (8 AM - 9 PM local time per TCPA)
  const now = new Date();
  const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const hour = localTime.getHours();

  if (hour < 8 || hour >= 21) {
    return { allowed: false, reason: 'Outside allowed hours (8 AM - 9 PM local time)' };
  }

  return { allowed: true };
}

/**
 * Add required compliance footer
 */
export function addComplianceFooter(message: string, firmName: string): string {
  const footer = `\n\nReply STOP to opt out. Msg & data rates may apply. ${firmName}`;

  // Only add if not already present and message isn't too long
  if (!message.includes('STOP') && message.length + footer.length <= 1600) {
    return message + footer;
  }

  return message;
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createTwilioClient(config: TwilioConfig): TwilioClient {
  return new TwilioClient(config);
}
