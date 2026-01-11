// ============================================
// Clio OAuth Callback Handler
// ============================================
// Vercel serverless function to handle Clio OAuth callback

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIO_CLIENT_ID = process.env.CLIO_CLIENT_ID;
const CLIO_CLIENT_SECRET = process.env.CLIO_CLIENT_SECRET;
const CLIO_REDIRECT_URI = process.env.CLIO_REDIRECT_URI;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface ClioTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface ClioUser {
  data: {
    id: number;
    name: string;
    email: string;
    enabled: boolean;
    subscription_type: string;
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('Clio OAuth error:', error, error_description);
    return res.redirect(
      `/settings/integrations?error=${encodeURIComponent(String(error_description || error))}`
    );
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
  if (!CLIO_CLIENT_ID || !CLIO_CLIENT_SECRET || !CLIO_REDIRECT_URI) {
    console.error('Missing Clio configuration');
    return res.redirect('/settings/integrations?error=server_configuration');
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://app.clio.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIO_CLIENT_ID,
        client_secret: CLIO_CLIENT_SECRET,
        code: String(code),
        redirect_uri: CLIO_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Clio token exchange failed:', errorText);
      return res.redirect('/settings/integrations?error=token_exchange_failed');
    }

    const tokens: ClioTokenResponse = await tokenResponse.json();

    // Get user info to verify connection
    const userResponse = await fetch('https://app.clio.com/api/v4/users/who_am_i', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch Clio user');
      return res.redirect('/settings/integrations?error=user_fetch_failed');
    }

    const userData: ClioUser = await userResponse.json();

    // Store integration in Supabase
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const integrationData = {
        tenant_id: tenantId,
        type: 'clio',
        status: 'connected',
        credentials: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + tokens.expires_in * 1000,
        },
        metadata: {
          user_id: userData.data.id,
          user_name: userData.data.name,
          user_email: userData.data.email,
          subscription_type: userData.data.subscription_type,
          connected_at: new Date().toISOString(),
        },
        last_sync: new Date().toISOString(),
      };

      // Upsert the integration record
      const upsertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/integrations?tenant_id=eq.${tenantId}&type=eq.clio`,
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
          ? `${SUPABASE_URL}/rest/v1/integrations?tenant_id=eq.${tenantId}&type=eq.clio`
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

      // Log the connection in audit log
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
          action: 'integration_connected',
          entity_type: 'integration',
          entity_id: 'clio',
          details: {
            user_name: userData.data.name,
            user_email: userData.data.email,
          },
        }),
      });
    }

    // Redirect back to settings with success
    return res.redirect('/settings/integrations?success=clio_connected');
  } catch (err) {
    console.error('Clio OAuth error:', err);
    return res.redirect('/settings/integrations?error=server_error');
  }
}
