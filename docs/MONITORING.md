# Monitoring Guide
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Last Updated:** January 11, 2026

---

## 1. Key Metrics to Monitor

### 1.1 Availability Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Uptime | 99.9% | < 99% |
| Response Time (p50) | < 200ms | > 500ms |
| Response Time (p95) | < 1000ms | > 2000ms |
| Error Rate | < 0.1% | > 1% |

### 1.2 Business Metrics

| Metric | Description | Expected Range |
|--------|-------------|----------------|
| Daily Active Users | Unique visitors | 10-100 |
| Voice Calls Started | Intake sessions | 5-50/day |
| Call Completion Rate | Calls ended properly | > 80% |
| Consent Acceptance | Users who accept | > 90% |

### 1.3 Technical Metrics

| Metric | Target | Source |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | Vercel Analytics |
| FID (First Input Delay) | < 100ms | Vercel Analytics |
| CLS (Cumulative Layout Shift) | < 0.1 | Vercel Analytics |
| JS Bundle Size | < 500KB | Build output |
| Memory Usage | < 50MB | Chrome DevTools |

---

## 2. Monitoring Tools

### 2.1 Vercel Analytics (Current)

**Access:** vercel.com/[project]/analytics

**Available Metrics:**
- Page views
- Unique visitors
- Top pages
- Geographic distribution
- Device breakdown
- Web Vitals (LCP, FID, CLS)

**Setup:**
Already enabled via Vercel project settings.

### 2.2 Health Check Endpoint

**Endpoint:** `GET /api/health`

**Response Format:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T10:00:00.000Z",
  "version": "abc1234",
  "checks": {
    "api": "ok",
    "environment": "ok",
    "dependencies": "ok"
  },
  "responseTimeMs": 15
}
```

**Status Codes:**
- `200` - Healthy or Degraded
- `503` - Unhealthy

**Uptime Monitoring Setup (UptimeRobot):**
1. Create account at uptimerobot.com
2. Add new HTTP(s) monitor
3. URL: `https://your-domain.vercel.app/api/health`
4. Monitoring interval: 5 minutes
5. Alert contacts: Configure email/Slack/SMS

### 2.3 Sentry Error Tracking

**Setup:**
1. Create project at sentry.io
2. Add DSN to environment variables:
   ```bash
   VITE_SENTRY_DSN=https://key@o0.ingest.sentry.io/project-id
   SENTRY_DSN=https://key@o0.ingest.sentry.io/project-id
   ```
3. Errors are automatically captured

**Features:**
- Automatic error capture
- Breadcrumb trail for debugging
- User context tracking
- Performance transactions
- Release tracking

**Access:** sentry.io/organizations/YOUR_ORG/issues/

### 2.4 Browser Console Monitoring

**Key Errors to Watch:**
```javascript
// Check for errors
console.error
console.warn

// Common error patterns
"Failed to fetch"
"API key"
"permission denied"
"localStorage"
```

### 2.5 Vercel Function Logs

**Access:** vercel.com/[project]/logs

**Filter by:**
- Function name (api/chat, api/emergency)
- Log level (error, info)
- Time range

---

## 3. Alert Configuration

### 3.1 Recommended Alerts

| Alert | Condition | Channel | Severity |
|-------|-----------|---------|----------|
| Site Down | HTTP 5xx for 1 min | Slack/PagerDuty | SEV-1 |
| High Error Rate | > 5% errors | Slack | SEV-2 |
| Slow Response | p95 > 3s | Email | SEV-3 |
| Function Failure | Any function error | Slack | SEV-3 |

### 3.2 Vercel Alert Setup

1. Go to Project Settings > Notifications
2. Configure Slack/Email integrations
3. Set up deployment notifications

### 3.3 Uptime Monitoring (Recommended)

**Options:**
- UptimeRobot (Free)
- Pingdom
- Better Uptime

**Configuration:**
```
URL: https://ai-studio-legal-assistant.vercel.app
Interval: 5 minutes
Alert: Email + Slack on failure
```

---

## 4. Log Analysis

### 4.1 Vercel Function Logs

```bash
# View logs via CLI
vercel logs --follow

# Filter by function
vercel logs api/chat

# Export logs
vercel logs --output=json > logs.json
```

### 4.2 Key Log Patterns

**Success:**
```
[api/chat] 200 OK - 234ms
[api/emergency] No emergency detected
```

**Errors:**
```
[api/chat] 500 Internal Server Error
[api/chat] API key invalid
[api/chat] Rate limit exceeded
```

### 4.3 Log Retention

| Service | Retention | Notes |
|---------|-----------|-------|
| Vercel Logs | 3 days (Hobby) | 90 days (Pro) |
| Supabase Logs | 1 day (Free) | 7 days (Pro) |
| Browser Console | Session only | Use logging service |

---

## 5. Performance Monitoring

### 5.1 Running Performance Audits

```bash
# Lighthouse CLI
npx lighthouse https://ai-studio-legal-assistant.vercel.app \
  --output=html \
  --output-path=./report.html

# WebPageTest
open https://www.webpagetest.org
```

### 5.2 Weekly Performance Review

**Checklist:**
- [ ] Review Vercel Analytics trends
- [ ] Check Web Vitals scores
- [ ] Analyze slow page loads
- [ ] Review error rate trends
- [ ] Check bundle size changes

### 5.3 Performance Benchmarks

| Page | LCP Target | Current |
|------|------------|---------|
| Dashboard | < 1.5s | ~1.2s |
| Analytics | < 2.0s | ~1.5s |
| Settings | < 2.0s | ~1.8s |

---

## 6. Health Checks

### 6.1 Automated Health Check

Create `/api/health` endpoint:

```typescript
// api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown'
  });
}
```

### 6.2 Manual Health Check

```bash
# Check site accessibility
curl -I https://ai-studio-legal-assistant.vercel.app

# Check API health
curl https://ai-studio-legal-assistant.vercel.app/api/health

# Check Supabase connection
curl "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

### 6.3 Health Check Schedule

| Check | Frequency | Owner |
|-------|-----------|-------|
| Automated uptime | Every 5 min | Monitoring service |
| Manual site check | Daily | On-call engineer |
| Full health audit | Weekly | Engineering lead |

---

## 7. Error Tracking (Recommended)

### 7.1 Sentry Integration

```typescript
// Install
npm install @sentry/react

// main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/project",
  environment: import.meta.env.PROD ? 'production' : 'development',
  tracesSampleRate: 0.1,
});
```

### 7.2 Error Categories

| Category | Priority | Action |
|----------|----------|--------|
| JavaScript Exception | High | Investigate immediately |
| Network Error | Medium | Check connectivity |
| React Error Boundary | High | Check component |
| Console Warning | Low | Address in next sprint |

---

## 8. Dashboard Template

### 8.1 Executive Dashboard

```
┌─────────────────────────────────────────────────────────┐
│                    SYSTEM STATUS                         │
├─────────────┬─────────────┬─────────────┬───────────────┤
│   UPTIME    │  ERROR RATE │  AVG RESP   │    USERS      │
│    99.9%    │    0.05%    │   187ms     │     47        │
│     ✅      │      ✅      │     ✅      │      ✅       │
├─────────────┴─────────────┴─────────────┴───────────────┤
│                    TRENDS (7 days)                       │
│  ▂▃▅▆█▇▅ Page Views    ▃▅▆▇█▆▄ Calls Started            │
├─────────────────────────────────────────────────────────┤
│                   RECENT ERRORS (0)                      │
│  No errors in the last 24 hours                          │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Technical Dashboard

| Widget | Data Source | Refresh |
|--------|-------------|---------|
| Uptime Graph | UptimeRobot | 5 min |
| Error Rate | Sentry | Real-time |
| Response Time | Vercel | 1 hour |
| Active Users | Vercel Analytics | 5 min |
| Function Invocations | Vercel Logs | 1 hour |

---

## 9. Reporting

### 9.1 Daily Report (Automated)

```
AI Legal Intake - Daily Report
Date: [DATE]

📊 Key Metrics:
- Uptime: 99.99%
- Total Visits: 234
- Voice Calls: 12
- Errors: 0

📈 Compared to Yesterday:
- Visits: +15%
- Calls: +8%

⚠️ Issues: None
```

### 9.2 Weekly Report

**Contents:**
1. Executive summary
2. Availability metrics
3. Performance trends
4. Error analysis
5. Top issues
6. Action items

---

## 10. Contacts

| Role | Slack | Email |
|------|-------|-------|
| On-Call | #on-call | oncall@company.com |
| Engineering | #engineering | eng@company.com |
| DevOps | #devops | devops@company.com |

---

*Review and update this guide quarterly*
