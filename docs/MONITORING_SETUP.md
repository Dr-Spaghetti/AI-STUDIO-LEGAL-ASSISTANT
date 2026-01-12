# Production Monitoring Setup Guide
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Last Updated:** January 12, 2026

---

## 1. Sentry Error Tracking Setup

### 1.1 Create Sentry Project

1. **Sign up/Login** at [sentry.io](https://sentry.io)

2. **Create New Project:**
   - Click "Create Project"
   - Select "React" as platform
   - Name: `legal-intake-assistant`
   - Team: Your team

3. **Get DSN:**
   - Go to Project Settings > Client Keys (DSN)
   - Copy the DSN (format: `https://PUBLIC_KEY@o0.ingest.sentry.io/PROJECT_ID`)

### 1.2 Configure Environment Variables

Add to Vercel Environment Variables:

```bash
# Client-side (React app)
VITE_SENTRY_DSN=https://your-public-key@o0.ingest.sentry.io/your-project-id

# Server-side (API functions)
SENTRY_DSN=https://your-public-key@o0.ingest.sentry.io/your-project-id

# Release version tracking
VITE_APP_VERSION=1.0.0
```

**Vercel Setup:**
1. Go to vercel.com/[your-project]/settings/environment-variables
2. Add each variable for Production environment
3. Redeploy to apply changes

### 1.3 Verify Integration

After deployment, test error tracking:

```javascript
// In browser console
throw new Error('Sentry test error');
```

Check sentry.io dashboard for the error within 1-2 minutes.

### 1.4 Configure Alerts

1. Go to Sentry > Alerts > Create Alert Rule
2. Set up these recommended alerts:

| Alert Name | Condition | Action |
|------------|-----------|--------|
| High Error Rate | > 10 events/hour | Slack + Email |
| First Error | New issue type | Email |
| Unhandled Rejection | Any unhandled promise | Email |

---

## 2. UptimeRobot Setup

### 2.1 Create Account

Sign up at [uptimerobot.com](https://uptimerobot.com) (free tier: 50 monitors)

### 2.2 Add Health Check Monitor

1. **Click "Add New Monitor"**

2. **Configure:**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Legal Intake - Health Check`
   - URL: `https://your-domain.vercel.app/api/health`
   - Monitoring Interval: `5 minutes`

3. **Expected Response:**
   - Status code: `200`
   - Keyword (optional): `"status":"healthy"`

### 2.3 Add Application Monitor

1. **Click "Add New Monitor"**

2. **Configure:**
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `Legal Intake - Application`
   - URL: `https://your-domain.vercel.app/`
   - Monitoring Interval: `5 minutes`

### 2.4 Configure Alert Contacts

1. Go to "Alert Contacts"
2. Add contacts:
   - **Email**: Primary team email
   - **Slack** (Pro): Webhook integration
   - **SMS** (Pro): Phone numbers

### 2.5 Status Page (Optional)

1. Go to "Status Pages"
2. Create public status page
3. Add monitors
4. Share URL with stakeholders

---

## 3. Vercel Analytics (Built-in)

### 3.1 Enable Analytics

Already enabled for Vercel projects. Access at:
- `vercel.com/[project]/analytics`

### 3.2 Key Metrics to Monitor

| Metric | Target | Location |
|--------|--------|----------|
| Web Vitals (LCP) | < 2.5s | Analytics > Web Vitals |
| Unique Visitors | Track trend | Analytics > Visitors |
| Top Pages | - | Analytics > Top Pages |
| Geographic Data | - | Analytics > Geography |

---

## 4. Log Monitoring

### 4.1 Vercel Function Logs

Access at: `vercel.com/[project]/logs`

**Filter by:**
- Function name: `api/chat`, `api/health`, `api/emergency`
- Log level: `error`, `warn`, `info`
- Time range

### 4.2 Key Patterns to Watch

```
# Errors
"error"
"failed"
"exception"

# API Issues
"rate limit"
"unauthorized"
"500"

# Performance
"timeout"
"slow"
```

---

## 5. Quick Reference

### Environment Variables Checklist

```bash
# Required for monitoring
VITE_SENTRY_DSN=https://...@sentry.io/...
SENTRY_DSN=https://...@sentry.io/...
VITE_APP_VERSION=1.0.0
```

### Health Check Endpoint

```bash
# Test locally
curl http://localhost:5173/api/health

# Test production
curl https://your-domain.vercel.app/api/health
```

### Expected Response

```json
{
  "status": "healthy",
  "timestamp": "2026-01-12T10:00:00.000Z",
  "version": "abc1234",
  "checks": {
    "api": "ok",
    "environment": "ok",
    "dependencies": "ok"
  },
  "responseTimeMs": 15
}
```

---

## 6. Monitoring Dashboard

### Recommended Layout

| Panel | Source | Refresh |
|-------|--------|---------|
| Uptime Status | UptimeRobot | Real-time |
| Error Count (24h) | Sentry | 5 min |
| Response Time | UptimeRobot | 5 min |
| Active Users | Vercel Analytics | Real-time |
| Web Vitals | Vercel Analytics | Daily |

---

## 7. Incident Response

When alerts trigger:

1. **Check UptimeRobot** - Is site reachable?
2. **Check Sentry** - What errors are occurring?
3. **Check Vercel Logs** - API function errors?
4. **Check Vercel Deployments** - Recent deploy issues?

See `docs/INCIDENT_RESPONSE.md` for detailed procedures.

---

## Setup Completion Checklist

- [ ] Sentry project created
- [ ] Sentry DSN added to Vercel env vars
- [ ] UptimeRobot health check monitor created
- [ ] UptimeRobot application monitor created
- [ ] Alert contacts configured
- [ ] Test error sent to Sentry
- [ ] Test downtime alert (optional)
