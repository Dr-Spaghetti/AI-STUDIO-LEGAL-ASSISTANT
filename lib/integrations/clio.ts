// ============================================
// Clio Integration
// ============================================
// OAuth flow and contact/matter creation via Clio API

const CLIO_API_BASE = 'https://app.clio.com/api/v4';
const CLIO_AUTH_BASE = 'https://app.clio.com/oauth';

// ============================================
// TYPES
// ============================================

export interface ClioConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface ClioTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  created_at?: number;
}

export interface ClioUser {
  id: number;
  etag: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  enabled: boolean;
  subscription_type: string;
  created_at: string;
  updated_at: string;
}

export interface ClioContact {
  id?: number;
  etag?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  type: 'Person' | 'Company';
  email_addresses?: Array<{
    name: string;
    address: string;
    default_email: boolean;
  }>;
  phone_numbers?: Array<{
    name: string;
    number: string;
    default_number: boolean;
  }>;
  addresses?: Array<{
    name: string;
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  }>;
  custom_field_values?: Array<{
    custom_field: { id: number };
    value: string;
  }>;
}

export interface ClioMatter {
  id?: number;
  etag?: string;
  display_number?: string;
  description: string;
  status?: 'Open' | 'Pending' | 'Closed';
  open_date?: string;
  close_date?: string;
  pending_date?: string;
  client?: { id: number };
  practice_area?: { id: number };
  responsible_attorney?: { id: number };
  originating_attorney?: { id: number };
  custom_field_values?: Array<{
    custom_field: { id: number };
    value: string;
  }>;
}

export interface ClioPracticeArea {
  id: number;
  etag: string;
  name: string;
  code: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ClioActivity {
  id?: number;
  type: 'TimeEntry' | 'ExpenseEntry';
  date: string;
  quantity: number;
  price?: number;
  total?: number;
  note: string;
  matter: { id: number };
  user?: { id: number };
  activity_description?: { id: number };
}

export interface ClioNote {
  id?: number;
  subject: string;
  detail: string;
  date: string;
  regarding: { id: number; type: 'Matter' | 'Contact' };
}

// ============================================
// OAUTH FLOW
// ============================================

/**
 * Generate OAuth authorization URL
 */
export function getClioAuthUrl(config: ClioConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state,
  });

  return `${CLIO_AUTH_BASE}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeClioCode(
  config: ClioConfig,
  code: string
): Promise<ClioTokens> {
  const response = await fetch(`${CLIO_AUTH_BASE}/token`, {
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
    throw new Error(`Clio OAuth error: ${error}`);
  }

  const tokens = await response.json();
  return {
    ...tokens,
    created_at: Math.floor(Date.now() / 1000),
  };
}

/**
 * Refresh access token
 */
export async function refreshClioToken(
  config: ClioConfig,
  refreshToken: string
): Promise<ClioTokens> {
  const response = await fetch(`${CLIO_AUTH_BASE}/token`, {
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
    throw new Error(`Clio token refresh error: ${error}`);
  }

  const tokens = await response.json();
  return {
    ...tokens,
    created_at: Math.floor(Date.now() / 1000),
  };
}

// ============================================
// API CLIENT
// ============================================

class ClioClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${CLIO_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Clio API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // ============================================
  // USER METHODS
  // ============================================

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<ClioUser> {
    const response = await this.request<{ data: ClioUser }>('/users/who_am_i');
    return response.data;
  }

  /**
   * List users in the firm
   */
  async getUsers(): Promise<ClioUser[]> {
    const response = await this.request<{ data: ClioUser[] }>('/users');
    return response.data;
  }

  // ============================================
  // CONTACT METHODS
  // ============================================

  /**
   * Create a new contact
   */
  async createContact(contact: ClioContact): Promise<ClioContact> {
    const response = await this.request<{ data: ClioContact }>('/contacts', {
      method: 'POST',
      body: JSON.stringify({ data: contact }),
    });
    return response.data;
  }

  /**
   * Update a contact
   */
  async updateContact(id: number, contact: Partial<ClioContact>): Promise<ClioContact> {
    const response = await this.request<{ data: ClioContact }>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: contact }),
    });
    return response.data;
  }

  /**
   * Search for contacts
   */
  async searchContacts(query: string): Promise<ClioContact[]> {
    const params = new URLSearchParams({
      query,
      fields: 'id,name,first_name,last_name,email_addresses,phone_numbers',
    });
    const response = await this.request<{ data: ClioContact[] }>(`/contacts?${params.toString()}`);
    return response.data;
  }

  /**
   * Find or create contact
   */
  async findOrCreateContact(contact: ClioContact): Promise<ClioContact> {
    // Try to find by email first
    if (contact.email_addresses?.length) {
      const email = contact.email_addresses[0].address;
      const existing = await this.searchContacts(email);
      if (existing.length > 0) {
        return existing[0];
      }
    }

    // Create new contact
    return this.createContact(contact);
  }

  // ============================================
  // MATTER METHODS
  // ============================================

  /**
   * Create a new matter
   */
  async createMatter(matter: ClioMatter): Promise<ClioMatter> {
    const response = await this.request<{ data: ClioMatter }>('/matters', {
      method: 'POST',
      body: JSON.stringify({ data: matter }),
    });
    return response.data;
  }

  /**
   * Update a matter
   */
  async updateMatter(id: number, matter: Partial<ClioMatter>): Promise<ClioMatter> {
    const response = await this.request<{ data: ClioMatter }>(`/matters/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: matter }),
    });
    return response.data;
  }

  /**
   * Get matters for a contact
   */
  async getContactMatters(contactId: number): Promise<ClioMatter[]> {
    const params = new URLSearchParams({
      client_id: String(contactId),
      fields: 'id,display_number,description,status,practice_area',
    });
    const response = await this.request<{ data: ClioMatter[] }>(`/matters?${params.toString()}`);
    return response.data;
  }

  // ============================================
  // PRACTICE AREA METHODS
  // ============================================

  /**
   * Get all practice areas
   */
  async getPracticeAreas(): Promise<ClioPracticeArea[]> {
    const response = await this.request<{ data: ClioPracticeArea[] }>('/practice_areas');
    return response.data;
  }

  /**
   * Find practice area by name
   */
  async findPracticeArea(name: string): Promise<ClioPracticeArea | null> {
    const areas = await this.getPracticeAreas();
    const normalizedName = name.toLowerCase();
    return areas.find(a => a.name.toLowerCase().includes(normalizedName)) || null;
  }

  // ============================================
  // NOTES METHODS
  // ============================================

  /**
   * Create a note on a matter
   */
  async createNote(note: ClioNote): Promise<ClioNote> {
    const response = await this.request<{ data: ClioNote }>('/notes', {
      method: 'POST',
      body: JSON.stringify({ data: note }),
    });
    return response.data;
  }

  // ============================================
  // ACTIVITY METHODS
  // ============================================

  /**
   * Create a time entry
   */
  async createTimeEntry(activity: ClioActivity): Promise<ClioActivity> {
    const response = await this.request<{ data: ClioActivity }>('/activities', {
      method: 'POST',
      body: JSON.stringify({ data: { ...activity, type: 'TimeEntry' } }),
    });
    return response.data;
  }
}

// ============================================
// LEAD SYNC HELPERS
// ============================================

export interface LeadToClio {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  caseType: string;
  caseDescription: string;
  incidentDate?: string;
  intakeNotes?: string;
  leadScore?: number;
  leadTier?: string;
}

/**
 * Convert lead data to Clio contact format
 */
export function leadToClioContact(lead: LeadToClio): ClioContact {
  return {
    name: `${lead.firstName} ${lead.lastName}`,
    first_name: lead.firstName,
    last_name: lead.lastName,
    type: 'Person',
    email_addresses: lead.email ? [{
      name: 'Primary',
      address: lead.email,
      default_email: true,
    }] : [],
    phone_numbers: lead.phone ? [{
      name: 'Mobile',
      number: lead.phone,
      default_number: true,
    }] : [],
  };
}

/**
 * Convert lead data to Clio matter format
 */
export function leadToClioMatter(
  lead: LeadToClio,
  contactId: number,
  practiceAreaId?: number
): ClioMatter {
  const today = new Date().toISOString().split('T')[0];

  let description = `${lead.caseType}: ${lead.caseDescription}`;
  if (lead.incidentDate) {
    description += `\nIncident Date: ${lead.incidentDate}`;
  }
  if (lead.leadScore !== undefined) {
    description += `\nLead Score: ${lead.leadScore} (${lead.leadTier})`;
  }

  return {
    description,
    status: 'Pending',
    open_date: today,
    client: { id: contactId },
    practice_area: practiceAreaId ? { id: practiceAreaId } : undefined,
  };
}

/**
 * Sync a lead to Clio (create contact + matter)
 */
export async function syncLeadToClio(
  client: ClioClient,
  lead: LeadToClio
): Promise<{ contact: ClioContact; matter: ClioMatter }> {
  // Create or find contact
  const contactData = leadToClioContact(lead);
  const contact = await client.findOrCreateContact(contactData);

  if (!contact.id) {
    throw new Error('Failed to create contact in Clio');
  }

  // Find practice area
  const practiceArea = await client.findPracticeArea(lead.caseType);

  // Create matter
  const matterData = leadToClioMatter(
    lead,
    contact.id,
    practiceArea?.id
  );
  const matter = await client.createMatter(matterData);

  // Add intake notes if provided
  if (lead.intakeNotes && matter.id) {
    await client.createNote({
      subject: 'AI Intake Notes',
      detail: lead.intakeNotes,
      date: new Date().toISOString().split('T')[0],
      regarding: { id: matter.id, type: 'Matter' },
    });
  }

  return { contact, matter };
}

// ============================================
// TOKEN HELPERS
// ============================================

/**
 * Check if tokens are expired or will expire soon
 */
export function isTokenExpired(tokens: ClioTokens, bufferSeconds: number = 300): boolean {
  if (!tokens.created_at) return true;
  const expiresAt = tokens.created_at + tokens.expires_in;
  const now = Math.floor(Date.now() / 1000);
  return now >= (expiresAt - bufferSeconds);
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createClioClient(accessToken: string): ClioClient {
  return new ClioClient(accessToken);
}
