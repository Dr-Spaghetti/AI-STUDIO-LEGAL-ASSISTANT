# Deployment Guide
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Last Updated:** January 11, 2026

---

## 1. Prerequisites

### 1.1 Accounts Required

| Service | Purpose | Signup URL |
|---------|---------|------------|
| GitHub | Source control | github.com |
| Vercel | Hosting | vercel.com |
| Supabase | Database | supabase.com |
| Google Cloud | Gemini AI | cloud.google.com |

### 1.2 Local Development

```bash
# Required
Node.js >= 20.0.0
npm >= 10.0.0

# Optional
Git >= 2.40.0
```

---

## 2. Environment Variables

### 2.1 Required Variables

```bash
# Gemini AI (Required for voice)
VITE_API_KEY=your-gemini-api-key

# Supabase (Required for database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Configuration
VITE_DEFAULT_TENANT_SLUG=demo
VITE_ENABLE_VOICE=true
VITE_ENABLE_EMERGENCY_DETECTION=true
```

### 2.2 Monitoring & Error Tracking

```bash
# Sentry Error Tracking
# Get DSN from: https://sentry.io/settings/projects/YOUR_PROJECT/keys/
VITE_SENTRY_DSN=https://your-key@o0.ingest.sentry.io/your-project-id
SENTRY_DSN=https://your-key@o0.ingest.sentry.io/your-project-id

# App Version (for Sentry releases)
VITE_APP_VERSION=1.0.0
```

### 2.3 Optional Variables (Integrations)

```bash
# Twilio SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Email
SENDGRID_API_KEY=your-sendgrid-key

# Calendly OAuth
CALENDLY_CLIENT_ID=your-client-id
CALENDLY_CLIENT_SECRET=your-client-secret
CALENDLY_REDIRECT_URI=https://YOUR-PROJECT.vercel.app/api/integrations/calendly/callback

# Clio OAuth
CLIO_CLIENT_ID=your-client-id
CLIO_CLIENT_SECRET=your-client-secret
CLIO_REDIRECT_URI=https://YOUR-PROJECT.vercel.app/api/integrations/clio/callback
```

> **Important:** Replace `YOUR-PROJECT.vercel.app` with your actual Vercel domain (or custom domain).
> For detailed OAuth setup instructions, see [VERCEL_SETUP.md](./VERCEL_SETUP.md).

---

## 3. Local Development

### 3.1 Clone Repository

```bash
git clone https://github.com/Dr-Spaghetti/AI-STUDIO-LEGAL-ASSISTANT.git
cd AI-STUDIO-LEGAL-ASSISTANT
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit with your values
nano .env
```

### 3.4 Start Development Server

```bash
npm run dev
```

Application runs at `http://localhost:5173`

### 3.5 Build for Production

```bash
npm run build
```

Output in `dist/` directory.

---

## 4. Vercel Deployment

### 4.1 Connect Repository

1. Log in to Vercel
2. Click "Add New Project"
3. Import from GitHub
4. Select `AI-STUDIO-LEGAL-ASSISTANT`

### 4.2 Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 4.3 Add Environment Variables

1. Go to Project Settings > Environment Variables
2. Add each variable from Section 2
3. Select environments (Production, Preview, Development)

### 4.4 Deploy

```bash
# Automatic (push to main)
git push origin main

# Manual
vercel --prod
```

### 4.5 Verify Deployment

1. Check Vercel dashboard for build status
2. Visit production URL
3. Test basic functionality

---

## 5. Supabase Setup

### 5.1 Create Project

1. Log in to Supabase
2. Create new project
3. Note the project URL and anon key

### 5.2 Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5.3 Verify Tables

Check that these tables exist:
- tenants
- leads
- conversations
- messages
- audit_logs
- emergency_events
- follow_ups
- integrations

---

## 6. Gemini API Setup

### 6.1 Enable API

1. Go to Google Cloud Console
2. Create or select a project
3. Enable "Gemini API"
4. Create API key

### 6.2 Configure Permissions

Ensure the API key has access to:
- `gemini-2.0-flash-live-001` (Live API)
- `gemini-pro` (Text generation)

### 6.3 Set Rate Limits

Default limits:
- 10 requests/minute (free tier)
- 1000 requests/day (free tier)

For production, request quota increase.

---

## 7. Domain Configuration

### 7.1 Custom Domain (Optional)

1. Go to Vercel Project > Domains
2. Add your domain
3. Configure DNS records:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 7.2 SSL Certificate

Vercel automatically provisions Let's Encrypt certificates.

---

## 8. Monitoring Setup

### 8.1 Vercel Analytics

1. Go to Project > Analytics
2. Enable Web Analytics
3. View real-time metrics

### 8.2 Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/react

# Initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

---

## 9. Rollback Procedures

### 9.1 Rollback Deployment

**Via Vercel Dashboard:**
1. Go to Deployments
2. Find previous successful deploy
3. Click "..." > "Promote to Production"

**Via CLI:**
```bash
vercel rollback
```

### 9.2 Database Rollback

```bash
# View migration history
supabase migration list

# Rollback last migration
supabase db reset --linked
```

---

## 10. Troubleshooting

### 10.1 Build Failures

| Error | Cause | Solution |
|-------|-------|----------|
| `Module not found` | Missing dependency | `npm install` |
| `Type error` | TypeScript issue | Fix type error |
| `Out of memory` | Large build | Increase Node memory |

### 10.2 Runtime Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `API key invalid` | Wrong env var | Check VITE_API_KEY |
| `CORS error` | Origin blocked | Configure Vercel CORS |
| `Supabase error` | Connection issue | Check URL/key |
| `redirect_uri_mismatch` | OAuth URI pointing to localhost | See [VERCEL_SETUP.md](./VERCEL_SETUP.md) |

### 10.3 Deployment Logs

```bash
# View build logs
vercel logs production

# View function logs
vercel logs --follow
```

---

## 11. Maintenance

### 11.1 Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update major versions (careful!)
npx npm-check-updates -u
npm install
```

### 11.2 Security Updates

```bash
# Audit for vulnerabilities
npm audit

# Fix automatically
npm audit fix
```

### 11.3 Database Maintenance

```sql
-- Vacuum database (run monthly)
VACUUM ANALYZE;

-- Check table sizes
SELECT pg_size_pretty(pg_total_relation_size('leads'));
```

---

## 12. Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] OAuth redirect URIs updated to production domain (not localhost)
- [ ] Supabase project created and migrated
- [ ] Gemini API key active
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking configured
- [ ] Backup verified
- [ ] Rollback procedure tested

---

*For deployment support, contact DevOps team*
