// ============================================
// Calendly Integration
// ============================================
// OAuth flow and appointment booking via Calendly API

const CALENDLY_API_BASE = 'https://api.calendly.com';
const CALENDLY_AUTH_BASE = 'https://auth.calendly.com';

// ============================================
// TYPES
// ============================================

export interface CalendlyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface CalendlyTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  created_at: number;
  scope: string;
  owner: string;
  organization: string;
}

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: 'solo' | 'group';
  pooling_type: string | null;
  type: 'StandardEventType' | 'AdhocEventType';
  color: string;
  created_at: string;
  updated_at: string;
  description_plain: string | null;
  description_html: string | null;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: 'active' | 'canceled';
  start_time: string;
  end_time: string;
  event_type: string;
  location: {
    type: string;
    location?: string;
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
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: 'active' | 'canceled';
  timezone: string;
  created_at: string;
  updated_at: string;
  questions_and_answers: Array<{
    question: string;
    answer: string;
  }>;
  canceled: boolean;
  cancellation?: {
    canceled_by: string;
    reason: string;
  };
}

export interface SchedulingLink {
  booking_url: string;
  owner: string;
  owner_type: 'EventType' | 'User';
}

// ============================================
// OAUTH FLOW
// ============================================

/**
 * Generate OAuth authorization URL
 */
export function getCalendlyAuthUrl(config: CalendlyConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state,
  });

  return `${CALENDLY_AUTH_BASE}/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCalendlyCode(
  config: CalendlyConfig,
  code: string
): Promise<CalendlyTokens> {
  const response = await fetch(`${CALENDLY_AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendly OAuth error: ${error}`);
  }

  return response.json();
}

/**
 * Refresh access token
 */
export async function refreshCalendlyToken(
  config: CalendlyConfig,
  refreshToken: string
): Promise<CalendlyTokens> {
  const response = await fetch(`${CALENDLY_AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendly token refresh error: ${error}`);
  }

  return response.json();
}

// ============================================
// API CLIENT
// ============================================

class CalendlyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${CALENDLY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await this.request<{ resource: CalendlyUser }>('/users/me');
    return response.resource;
  }

  /**
   * List event types for current user
   */
  async getEventTypes(userUri: string): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams({
      user: userUri,
      active: 'true',
    });

    const response = await this.request<{
      collection: CalendlyEventType[];
      pagination: { count: number; next_page: string | null };
    }>(`/event_types?${params.toString()}`);

    return response.collection;
  }

  /**
   * Get scheduled events
   */
  async getScheduledEvents(
    userUri: string,
    options?: {
      minStartTime?: string;
      maxStartTime?: string;
      status?: 'active' | 'canceled';
      count?: number;
    }
  ): Promise<CalendlyScheduledEvent[]> {
    const params = new URLSearchParams({
      user: userUri,
    });

    if (options?.minStartTime) params.set('min_start_time', options.minStartTime);
    if (options?.maxStartTime) params.set('max_start_time', options.maxStartTime);
    if (options?.status) params.set('status', options.status);
    if (options?.count) params.set('count', String(options.count));

    const response = await this.request<{
      collection: CalendlyScheduledEvent[];
      pagination: { count: number; next_page: string | null };
    }>(`/scheduled_events?${params.toString()}`);

    return response.collection;
  }

  /**
   * Get invitees for a scheduled event
   */
  async getEventInvitees(eventUri: string): Promise<CalendlyInvitee[]> {
    const eventUuid = eventUri.split('/').pop();
    const response = await this.request<{
      collection: CalendlyInvitee[];
      pagination: { count: number; next_page: string | null };
    }>(`/scheduled_events/${eventUuid}/invitees`);

    return response.collection;
  }

  /**
   * Create a single-use scheduling link
   */
  async createSchedulingLink(
    eventTypeUri: string,
    maxEventCount: number = 1
  ): Promise<SchedulingLink> {
    const response = await this.request<{ resource: SchedulingLink }>(
      '/scheduling_links',
      {
        method: 'POST',
        body: JSON.stringify({
          max_event_count: maxEventCount,
          owner: eventTypeUri,
          owner_type: 'EventType',
        }),
      }
    );

    return response.resource;
  }

  /**
   * Cancel a scheduled event
   */
  async cancelEvent(eventUri: string, reason?: string): Promise<void> {
    const eventUuid = eventUri.split('/').pop();
    await this.request(`/scheduled_events/${eventUuid}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason || 'Canceled by system',
      }),
    });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if tokens are expired or will expire soon
 */
export function isTokenExpired(tokens: CalendlyTokens, bufferSeconds: number = 300): boolean {
  const expiresAt = tokens.created_at + tokens.expires_in;
  const now = Math.floor(Date.now() / 1000);
  return now >= (expiresAt - bufferSeconds);
}

/**
 * Generate a pre-filled booking URL
 */
export function generateBookingUrl(
  schedulingUrl: string,
  prefill: {
    name?: string;
    email?: string;
    phone?: string;
    customAnswers?: Record<string, string>;
  }
): string {
  const url = new URL(schedulingUrl);

  if (prefill.name) url.searchParams.set('name', prefill.name);
  if (prefill.email) url.searchParams.set('email', prefill.email);

  // Custom answers are prefixed with 'a1', 'a2', etc.
  if (prefill.customAnswers) {
    Object.entries(prefill.customAnswers).forEach(([key, value], index) => {
      url.searchParams.set(`a${index + 1}`, value);
    });
  }

  return url.toString();
}

/**
 * Create Calendly client from stored tokens
 */
export function createCalendlyClient(accessToken: string): CalendlyClient {
  return new CalendlyClient(accessToken);
}

// ============================================
// WEBHOOK HANDLING
// ============================================

export interface CalendlyWebhookEvent {
  event: 'invitee.created' | 'invitee.canceled';
  created_at: string;
  created_by: string;
  payload: {
    event_type: {
      uuid: string;
      kind: string;
      slug: string;
      name: string;
      duration: number;
      owner: {
        type: string;
        uuid: string;
      };
    };
    event: {
      uuid: string;
      assigned_to: string[];
      extended_assigned_to: Array<{
        name: string;
        email: string;
        primary: boolean;
      }>;
      start_time: string;
      start_time_pretty: string;
      end_time: string;
      end_time_pretty: string;
      invitee_start_time: string;
      invitee_start_time_pretty: string;
      invitee_end_time: string;
      invitee_end_time_pretty: string;
      created_at: string;
      location: {
        type: string;
        location?: string;
      };
      canceled: boolean;
      canceler_name?: string;
      cancel_reason?: string;
      canceled_at?: string;
    };
    invitee: {
      uuid: string;
      first_name: string;
      last_name: string;
      name: string;
      email: string;
      text_reminder_number: string | null;
      timezone: string;
      created_at: string;
      is_reschedule: boolean;
      payments: Array<unknown>;
      canceled: boolean;
      canceler_name?: string;
      cancel_reason?: string;
      canceled_at?: string;
    };
    questions_and_answers: Array<{
      question: string;
      answer: string;
    }>;
    questions_and_responses: Record<string, {
      question: string;
      answer: string;
    }>;
    tracking: {
      utm_campaign: string | null;
      utm_source: string | null;
      utm_medium: string | null;
      utm_content: string | null;
      utm_term: string | null;
      salesforce_uuid: string | null;
    };
    old_event?: unknown;
    old_invitee?: unknown;
    new_event?: unknown;
    new_invitee?: unknown;
  };
}

/**
 * Parse Calendly webhook payload
 */
export function parseCalendlyWebhook(payload: unknown): CalendlyWebhookEvent {
  return payload as CalendlyWebhookEvent;
}

/**
 * Extract lead info from Calendly webhook
 */
export function extractLeadFromWebhook(webhook: CalendlyWebhookEvent): {
  name: string;
  email: string;
  phone: string | null;
  appointmentTime: string;
  eventType: string;
  answers: Record<string, string>;
} {
  return {
    name: webhook.payload.invitee.name,
    email: webhook.payload.invitee.email,
    phone: webhook.payload.invitee.text_reminder_number,
    appointmentTime: webhook.payload.event.start_time,
    eventType: webhook.payload.event_type.name,
    answers: Object.fromEntries(
      webhook.payload.questions_and_answers.map(qa => [qa.question, qa.answer])
    ),
  };
}
