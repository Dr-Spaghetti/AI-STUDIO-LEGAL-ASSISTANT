# Vercel Deployment Setup Guide

## Quick Fix: Site Loading Localhost

If your deployed site is redirecting to localhost, check these environment variables in Vercel:

### Step 1: Go to Vercel Dashboard
1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Set Required Environment Variables

Replace `your-project.vercel.app` with your actual Vercel domain.

#### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anonymous key |
| `VITE_API_KEY` | `AIza...` | Google Gemini API key |

#### OAuth Callback URLs (Critical!)

These MUST use your Vercel domain, NOT localhost:

| Variable | Value |
|----------|-------|
| `CALENDLY_REDIRECT_URI` | `https://your-project.vercel.app/api/integrations/calendly/callback` |
| `CLIO_REDIRECT_URI` | `https://your-project.vercel.app/api/integrations/clio/callback` |

#### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SENTRY_DSN` | `https://...@sentry.io/...` | Error tracking |
| `VITE_APP_VERSION` | `1.0.0` | For Sentry releases |
| `TWILIO_ACCOUNT_SID` | `AC...` | SMS notifications |
| `TWILIO_AUTH_TOKEN` | `...` | SMS notifications |

### Step 3: Update OAuth Provider Settings

#### Calendly
1. Go to [developer.calendly.com](https://developer.calendly.com)
2. Find your OAuth app
3. Update **Redirect URI** to: `https://your-project.vercel.app/api/integrations/calendly/callback`

#### Clio
1. Go to [app.clio.com/settings/developer_applications](https://app.clio.com/settings/developer_applications)
2. Find your OAuth app
3. Update **Redirect URI** to: `https://your-project.vercel.app/api/integrations/clio/callback`

### Step 4: Redeploy

After updating environment variables:
1. Go to **Deployments** tab
2. Click **...** on latest deployment
3. Click **Redeploy**

Or trigger via CLI:
```bash
vercel --prod
```

## Troubleshooting

### "Site can't be reached" / Localhost redirect

**Cause**: OAuth redirect URIs pointing to localhost

**Fix**: Update `CALENDLY_REDIRECT_URI` and `CLIO_REDIRECT_URI` to use your Vercel domain

### API calls failing

**Cause**: Missing or incorrect environment variables

**Fix**: Ensure all `VITE_*` variables are set in Vercel dashboard

### Build fails on Vercel

**Cause**: Missing dependencies or TypeScript errors

**Fix**: Run locally first:
```bash
npm install
npm run build
```

### OAuth "Invalid redirect" error

**Cause**: Mismatch between Vercel env var and OAuth provider settings

**Fix**: Ensure the redirect URI in Vercel matches EXACTLY what's configured in Calendly/Clio

## Vercel Project Settings

Recommended settings in Vercel:

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x or 20.x |

## Environment Variable Scopes

Set variables for the appropriate environments:

- **Production**: Your live site
- **Preview**: PR/branch deployments
- **Development**: Local dev (optional)

For sensitive keys (API keys, secrets), only enable for **Production**.
