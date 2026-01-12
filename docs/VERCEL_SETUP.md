# Vercel Setup Guide
## OAuth Integration Configuration

**Version:** 1.0
**Last Updated:** January 12, 2026

---

## Common Issue: OAuth Redirect URI Mismatch

If you're seeing redirect errors when connecting Calendly or Clio integrations, the most likely cause is **OAuth redirect URIs pointing to localhost instead of your Vercel domain**.

---

## Quick Fix: Update Environment Variables

### Step 1: Go to Vercel Dashboard

1. Log in to [vercel.com](https://vercel.com)
2. Select your project
3. Navigate to **Settings** > **Environment Variables**

### Step 2: Update Redirect URIs

Find and update these environment variables:

| Variable | Change From | Change To |
|----------|-------------|-----------|
| `CALENDLY_REDIRECT_URI` | `http://localhost:5173/...` | `https://YOUR-PROJECT.vercel.app/api/integrations/calendly/callback` |
| `CLIO_REDIRECT_URI` | `http://localhost:5173/...` | `https://YOUR-PROJECT.vercel.app/api/integrations/clio/callback` |

**Example with custom domain:**
```
CALENDLY_REDIRECT_URI=https://intake.yourfirm.com/api/integrations/calendly/callback
CLIO_REDIRECT_URI=https://intake.yourfirm.com/api/integrations/clio/callback
```

### Step 3: Update OAuth Provider Settings

You must also update the redirect URIs in your OAuth provider dashboards:

#### Calendly
1. Go to [developer.calendly.com](https://developer.calendly.com)
2. Select your OAuth application
3. Update **Redirect URI** to match your Vercel domain:
   ```
   https://YOUR-PROJECT.vercel.app/api/integrations/calendly/callback
   ```

#### Clio
1. Go to [app.clio.com/settings/developer_applications](https://app.clio.com/settings/developer_applications)
2. Select your OAuth application
3. Update **Redirect URI** to match your Vercel domain:
   ```
   https://YOUR-PROJECT.vercel.app/api/integrations/clio/callback
   ```

### Step 4: Redeploy

After updating environment variables:

1. **Automatic:** Push any commit to trigger a redeploy
2. **Manual:** Go to Vercel Dashboard > Deployments > click "Redeploy"

---

## Complete Environment Variables Reference

### Required for Core Functionality

```bash
# Gemini AI API
VITE_API_KEY=your_google_gemini_api_key

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
VITE_DEFAULT_TENANT_SLUG=demo
VITE_ENABLE_VOICE=true
VITE_ENABLE_EMERGENCY_DETECTION=true
```

### OAuth Integrations

```bash
# Calendly OAuth
# Client-side (required for OAuth button to work)
VITE_CALENDLY_CLIENT_ID=your_calendly_client_id
# Server-side (for secure token exchange)
CALENDLY_CLIENT_ID=your_calendly_client_id
CALENDLY_CLIENT_SECRET=your_calendly_client_secret
CALENDLY_REDIRECT_URI=https://YOUR-PROJECT.vercel.app/api/integrations/calendly/callback

# Clio OAuth
# Client-side (required for OAuth button to work)
VITE_CLIO_CLIENT_ID=your_clio_client_id
# Server-side (for secure token exchange)
CLIO_CLIENT_ID=your_clio_client_id
CLIO_CLIENT_SECRET=your_clio_client_secret
CLIO_REDIRECT_URI=https://YOUR-PROJECT.vercel.app/api/integrations/clio/callback
```

> **Note:** The `VITE_` prefixed variables are exposed to the browser and used to initiate the OAuth flow. The non-prefixed versions are kept secret on the server for token exchange.

### Optional Integrations

```bash
# Twilio SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# SendGrid Email
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@your-app.com

# Sentry Error Tracking
VITE_SENTRY_DSN=https://your-key@sentry.io/project
SENTRY_DSN=https://your-key@sentry.io/project
VITE_APP_VERSION=1.0.0
```

---

## Troubleshooting OAuth Issues

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI in your request doesn't match what's registered with the OAuth provider.

**Solution:**
1. Verify the `*_REDIRECT_URI` environment variable matches exactly what's registered in Calendly/Clio
2. Check for trailing slashes - they must match exactly
3. Ensure you're using `https://` (not `http://`)

### Error: "server_configuration"

**Cause:** Missing OAuth configuration environment variables.

**Solution:** Ensure all three variables are set for each integration:
- `*_CLIENT_ID`
- `*_CLIENT_SECRET`
- `*_REDIRECT_URI`

### Error: "token_exchange_failed"

**Cause:** The authorization code couldn't be exchanged for tokens.

**Solution:**
1. Check that client ID and secret are correct
2. Verify the redirect URI matches in all three places:
   - Vercel environment variables
   - OAuth provider dashboard
   - The URL you're redirected to

### Integration Not Saving

**Cause:** Missing Supabase service role key.

**Solution:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables.

---

## Security Best Practices

1. **Never commit secrets** - All OAuth credentials should be in Vercel environment variables only
2. **Use production scope** - Set environment variables for "Production" environment
3. **Rotate secrets regularly** - Update client secrets every 90 days
4. **Monitor OAuth logs** - Check Vercel function logs for failed authentication attempts

---

## Testing OAuth Flow

1. Deploy to Vercel with correct environment variables
2. Navigate to `/settings/integrations` in your app
3. Click "Connect" on Calendly or Clio
4. Complete the OAuth flow
5. Verify you're redirected back to `/settings/integrations?success=*_connected`

---

*For additional deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)*
