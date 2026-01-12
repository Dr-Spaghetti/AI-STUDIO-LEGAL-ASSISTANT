# Incident Response Runbook
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Last Updated:** January 11, 2026

---

## 1. Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| **SEV-1** | Critical - Service down | 15 minutes | Site unreachable, data loss |
| **SEV-2** | High - Major feature broken | 1 hour | Voice intake not working |
| **SEV-3** | Medium - Degraded service | 4 hours | Slow performance |
| **SEV-4** | Low - Minor issue | 24 hours | UI bug, cosmetic issue |

---

## 2. Escalation Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| On-Call Engineer | [TBD] | [phone/slack] | 24/7 |
| Engineering Lead | [TBD] | [phone/slack] | Business hours |
| DevOps | [TBD] | [phone/slack] | Business hours |
| Product Owner | [TBD] | [email] | Business hours |

---

## 3. Common Incidents & Resolutions

### 3.1 Site Unreachable (SEV-1)

**Symptoms:**
- 502/503/504 errors
- Blank page
- DNS resolution failure

**Diagnosis:**
```bash
# Check Vercel status
curl -I https://ai-studio-legal-assistant.vercel.app

# Check Vercel status page
open https://www.vercel-status.com
```

**Resolution:**
1. Check Vercel dashboard for deployment status
2. If deployment failed, rollback:
   ```bash
   vercel rollback
   ```
3. If Vercel outage, wait for resolution
4. Contact Vercel support if prolonged

---

### 3.2 Voice Intake Not Working (SEV-2)

**Symptoms:**
- "Start" button doesn't work
- No AI response
- Audio not captured

**Diagnosis:**
```bash
# Check Gemini API status
curl https://generativelanguage.googleapis.com/v1beta/models

# Check browser console for errors
# Look for: "API key", "permission", "connection"
```

**Resolution:**
1. Verify Gemini API key is valid:
   - Check Vercel environment variables
   - Test API key in Google Cloud Console
2. Check API quota:
   - Go to Google Cloud Console > APIs > Gemini API
   - View quota usage
3. Verify browser permissions:
   - Microphone access granted
   - HTTPS enabled

---

### 3.3 Database Connection Failed (SEV-2)

**Symptoms:**
- Data not saving
- Empty case list after refresh
- Console errors about Supabase

**Diagnosis:**
```bash
# Check Supabase status
open https://status.supabase.com

# Test connection
curl "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

**Resolution:**
1. Verify Supabase credentials in Vercel
2. Check Supabase project is active (not paused)
3. Review Supabase logs for errors
4. Restart Supabase project if needed

---

### 3.4 Slow Performance (SEV-3)

**Symptoms:**
- Page load > 5 seconds
- Laggy interactions
- High memory usage

**Diagnosis:**
```bash
# Run Lighthouse audit
npx lighthouse https://ai-studio-legal-assistant.vercel.app

# Check Vercel analytics
# View function execution times
```

**Resolution:**
1. Check for memory leaks in browser DevTools
2. Review Vercel function logs for slow endpoints
3. Clear browser cache and retry
4. Check third-party service latency

---

### 3.5 Settings Not Saving (SEV-3)

**Symptoms:**
- Settings reset after refresh
- Toast shows "saved" but changes lost

**Diagnosis:**
```javascript
// In browser console:
localStorage.getItem('receptionistSettings');
```

**Resolution:**
1. Check localStorage quota (5MB limit)
2. Clear old localStorage data
3. Check for JavaScript errors
4. Verify React state management

---

## 4. Rollback Procedures

### 4.1 Vercel Rollback

**Via Dashboard:**
1. Go to vercel.com/[project]/deployments
2. Find last successful deployment
3. Click "..." menu
4. Select "Promote to Production"

**Via CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Rollback to previous
vercel rollback
```

### 4.2 Database Rollback

```bash
# Connect to Supabase
supabase db remote --linked

# Restore from backup (via dashboard)
# Go to: Supabase > Settings > Database > Backups

# Or manual restore
pg_restore -d postgresql://... backup.dump
```

---

## 5. Communication Templates

### 5.1 Internal Alert

```
🚨 INCIDENT ALERT - [SEV-X]

Service: AI Legal Intake Assistant
Impact: [description]
Status: Investigating

Timeline:
- [time]: Issue detected
- [time]: Investigation started

Current Actions:
- [action being taken]

Updates: Every [X] minutes
```

### 5.2 Customer Communication

```
We're currently experiencing issues with [feature].
Our team is actively working on a resolution.

Current Status: [status]
Estimated Resolution: [time]

We apologize for any inconvenience.
```

### 5.3 Resolution Notice

```
✅ INCIDENT RESOLVED

Service: AI Legal Intake Assistant
Duration: [start] - [end]
Root Cause: [brief description]
Resolution: [what was done]

Post-mortem will follow within 48 hours.
```

---

## 6. Post-Incident Process

### 6.1 Immediate (Within 1 hour)
- [ ] Verify service fully restored
- [ ] Send resolution notice
- [ ] Update status page

### 6.2 Short-term (Within 24 hours)
- [ ] Gather timeline of events
- [ ] Identify root cause
- [ ] Document impact metrics

### 6.3 Post-Mortem (Within 48 hours)
- [ ] Write incident report
- [ ] Identify action items
- [ ] Schedule review meeting
- [ ] Create tickets for fixes

---

## 7. Monitoring Dashboards

| Dashboard | URL | Purpose |
|-----------|-----|---------|
| Vercel | vercel.com/[project] | Deployments, logs |
| Supabase | app.supabase.com | Database health |
| Google Cloud | console.cloud.google.com | API usage |
| Status Pages | status.vercel.com | Service status |

---

## 8. Emergency Contacts

| Service | Support | SLA |
|---------|---------|-----|
| Vercel | vercel.com/support | 4 hours (Pro) |
| Supabase | supabase.com/support | 24 hours (Pro) |
| Google Cloud | cloud.google.com/support | Varies |

---

*Keep this document updated and accessible to all on-call personnel*
