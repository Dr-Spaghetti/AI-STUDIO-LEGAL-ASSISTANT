// ============================================
// Calendly OAuth Callback Handler
// ============================================
// Vercel serverless function to handle Calendly OAuth callback

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CALENDLY_CLIENT_ID = process.env.CALENDLY_CLIENT_ID;
const CALENDLY_CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET;
const CALENDLY_REDIRECT_URI = process.env.CALENDLY_REDIRECT_URI;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface CalendlyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  created_at: number;
  owner: string;
  organization: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('Calendly OAuth error:', error);
    return res.redirect(`/settings/integrations?error=${encodeURIComponent(String(error))}`);
  }

  // Validate required parameters
  if (!code || !state) {
    return res.redirect('/settings/integrations?error=missing_parameters');
  }

  // Parse state to get tenant_id
  let tenantId: string;
  try {
    const stateData = JSON.parse(Buffer.from(String(state), 'base64').toString());
    tenantId = stateData.tenant_id;
    if (!tenantId) throw new Error('Missing tenant_id in state');
  } catch (err) {
    console.error('Invalid state parameter:', err);
    return res.redirect('/settings/integrations?error=invalid_state');
  }

  // Validate environment variables
  if (!CALENDLY_CLIENT_ID || !CALENDLY_CLIENT_SECRET || !CALENDLY_REDIRECT_URI) {
    console.error('Missing Calendly configuration');
    return res.redirect('/settings/integrations?error=server_configuration');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://auth.calendly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CALENDLY_CLIENT_ID,
        client_secret: CALENDLY_CLIENT_SECRET,
        code: String(code),
        redirect_uri: CALENDLY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect('/settings/integrations?error=token_exchange_failed');
    }

    const tokens: CalendlyTokenResponse = await tokenResponse.json();

    // Get user info to verify connection
    const userResponse = await fetch('https://api.calendly.com/users/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Calendly user');
      return res.redirect('/settings/integrations?error=user_fetch_failed');
    }

    const userData = await userResponse.json();

    // Store integration in Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const integrationData = {
        tenant_id: tenantId,
        type: 'calendly',
        status: 'connected',
        credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + tokens.expires_in * 1000,
          owner_uri: tokens.owner,
          organization_uri: tokens.organization,
        },
        metadata: {
          user_uri: userData.resource.uri,
          user_name: userData.resource.name,
          user_email: userData.resource.email,
          scheduling_url: userData.resource.scheduling_url,
          connected_at: new Date().toISOString(),
        },
        last_sync: new Date().toISOString(),
      };

      // Upsert the integration record
      const upsertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/integrations?tenant_id=eq.${tenantId}&type=eq.calendly`,
        {
          method: 'GET',
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
        }
      );

      const existingIntegrations = await upsertResponse.json();
      const method = existingIntegrations.length > 0 ? 'PATCH' : 'POST';
      const url =
        method === 'PATCH'
          ? `${SUPABASE_URL}/rest/v1/integrations?tenant_id=eq.${tenantId}&type=eq.calendly`
          : `${SUPABASE_URL}/rest/v1/integrations`;

      await fetch(url, {
        method,
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(integrationData),
      });
    }

    // Redirect back to settings with success
    return res.redirect('/settings/integrations?success=calendly_connected');
  } catch (err) {
    console.error('Calendly OAuth error:', err);
    return res.redirect('/settings/integrations?error=server_error');
  }
}
