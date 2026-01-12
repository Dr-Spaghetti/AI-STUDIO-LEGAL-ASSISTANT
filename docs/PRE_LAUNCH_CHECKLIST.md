# Pre-Launch Validation Checklist
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Date:** January 12, 2026
**Status:** PENDING VALIDATION

---

## Instructions

This checklist must be completed **in order**. Each section must pass before proceeding to the next. Any failure requires resolution before launch.

**Validation Legend:**
- ✅ PASS - Requirement met
- ❌ FAIL - Requires immediate fix
- ⚠️ WARN - Acceptable with documented risk
- ⏳ PENDING - Not yet validated

---

## Section 1: Environment Configuration

### 1.1 Required Environment Variables

| Variable | Required | Validated | Notes |
|----------|----------|-----------|-------|
| `VITE_API_KEY` | ✅ Yes | ⏳ | Gemini API key |
| `VITE_SUPABASE_URL` | ✅ Yes | ⏳ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | ⏳ | Supabase anonymous key |
| `VITE_SENTRY_DSN` | ✅ Yes | ⏳ | Sentry error tracking |
| `SENTRY_DSN` | ✅ Yes | ⏳ | Server-side Sentry |
| `VITE_APP_VERSION` | ⚠️ Recommended | ⏳ | Release tracking |

### 1.2 Optional Environment Variables

| Variable | Purpose | Configured |
|----------|---------|------------|
| `TWILIO_ACCOUNT_SID` | SMS notifications | ⏳ |
| `TWILIO_AUTH_TOKEN` | SMS notifications | ⏳ |
| `SENDGRID_API_KEY` | Email follow-ups | ⏳ |
| `CALENDLY_CLIENT_ID` | Appointment booking | ⏳ |

### 1.3 Validation Commands

```bash
# Verify all required env vars are set (run in Vercel CLI or dashboard)
vercel env ls

# Check for exposed secrets in codebase
grep -r "VITE_API_KEY\|supabase\|sentry" --include="*.ts" --include="*.tsx" | grep -v ".env"
```

**Section 1 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 2: Build Validation

### 2.1 Build Success

| Check | Command | Expected | Actual | Status |
|-------|---------|----------|--------|--------|
| TypeScript compilation | `npm run build` | No errors | | ⏳ |
| Bundle size | Check build output | < 500KB | | ⏳ |
| No console errors | Browser DevTools | 0 errors | | ⏳ |
| No console warnings | Browser DevTools | 0 critical | | ⏳ |

### 2.2 Build Output Validation

```bash
# Run build
npm run build

# Check bundle size
ls -la dist/assets/*.js | awk '{sum += $5} END {print sum/1024 " KB"}'

# Verify no source maps in production
ls dist/assets/*.map 2>/dev/null && echo "WARNING: Source maps present" || echo "OK: No source maps"
```

**Section 2 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 3: API Endpoints

### 3.1 Health Check

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| `GET /api/health` returns 200 | `{"status":"healthy"}` | | ⏳ |
| Response time < 500ms | < 500ms | | ⏳ |
| All checks pass | `api: ok, environment: ok` | | ⏳ |

```bash
# Test health endpoint
curl -w "\nTime: %{time_total}s\n" https://your-domain.vercel.app/api/health
```

### 3.2 Chat Endpoint

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| `POST /api/chat` with valid request | 200 response | | ⏳ |
| Rate limiting active | 429 after 20 req/min | | ⏳ |
| Invalid request returns 400 | 400 error | | ⏳ |

### 3.3 Emergency Detection

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Emergency keywords detected | Alert triggered | | ⏳ |
| Non-emergency passes through | No alert | | ⏳ |

**Section 3 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 4: Core Functionality

### 4.1 Voice Intake

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Microphone permission | Click "Start Call" | Permission prompt appears | ⏳ |
| Permission granted | Allow microphone | Green indicator shows | ⏳ |
| AI responds | Speak greeting | AI responds in selected voice | ⏳ |
| Transcription works | Speak clearly | Text appears in transcript | ⏳ |
| End call | Click "End Call" | Session terminates cleanly | ⏳ |

### 4.2 Settings Persistence

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Change firm name | Settings > Branding | Name updates | ⏳ |
| Change brand color | Settings > Branding | Color updates globally | ⏳ |
| Refresh page | F5 / Reload | Settings retained | ⏳ |
| Clear localStorage | DevTools > Clear | Defaults restored | ⏳ |

### 4.3 Case History

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| View cases | Navigate to History | Cases displayed | ⏳ |
| Filter works | Click "Booked" tab | Filtered results | ⏳ |
| Export CSV | Click "Export CSV" | CSV downloads | ⏳ |
| View details | Click case row | Modal opens | ⏳ |

### 4.4 Analytics

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Dashboard loads | Navigate to Analytics | Charts display | ⏳ |
| Data source indicator | Check header | Shows "Demo" or "Live" | ⏳ |
| Stats cards | View metrics | Numbers display | ⏳ |

**Section 4 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 5: Authentication (If Enabled)

### 5.1 Login Flow

| Test | Steps | Expected | Status |
|------|-------|----------|--------|
| Login page loads | Enable requireAuth | Login form displays | ⏳ |
| Demo login works | Click "Demo User" | Dashboard loads | ⏳ |
| Email/password login | Enter credentials | Login succeeds | ⏳ |
| Invalid credentials | Wrong password | Error message | ⏳ |
| Session persists | Refresh page | Still logged in | ⏳ |
| Logout works | Click Sign Out | Returns to login | ⏳ |

### 5.2 Enable Auth Test

```javascript
// In browser console
localStorage.setItem('requireAuth', 'true');
location.reload();
// Should show login page
```

**Section 5 Status:** ⏳ PENDING (or N/A if auth disabled)

**Validator:** _________________ **Date:** _________________

---

## Section 6: Security Validation

### 6.1 HTTPS & Headers

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| HTTPS enforced | All requests use HTTPS | | ⏳ |
| HSTS header | Present | | ⏳ |
| X-Content-Type-Options | nosniff | | ⏳ |
| X-Frame-Options | DENY or SAMEORIGIN | | ⏳ |

```bash
# Check security headers
curl -I https://your-domain.vercel.app/ 2>/dev/null | grep -E "(Strict-Transport|X-Content-Type|X-Frame)"
```

### 6.2 API Security

| Check | Expected | Status |
|-------|----------|--------|
| No API keys in client bundle | Verified | ⏳ |
| Rate limiting active | 429 responses | ⏳ |
| CORS configured | Origin validated | ⏳ |
| Input validation | Malformed requests rejected | ⏳ |

### 6.3 Data Security

| Check | Expected | Status |
|-------|----------|--------|
| Consent required before voice | Modal shown | ⏳ |
| Two-party consent states handled | Warning displayed | ⏳ |
| No PII in console logs | Verified | ⏳ |
| localStorage encrypted | N/A (demo mode) | ⏳ |

**Section 6 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 7: Monitoring & Alerting

### 7.1 Sentry

| Check | Steps | Expected | Status |
|-------|-------|----------|--------|
| Sentry receives events | Throw test error | Event in dashboard | ⏳ |
| Source maps work | Check stack trace | Readable traces | ⏳ |
| Alerts configured | Check Sentry alerts | Rules active | ⏳ |

```javascript
// Test Sentry (browser console)
throw new Error('Pre-launch Sentry test');
// Verify in Sentry dashboard within 2 minutes
```

### 7.2 UptimeRobot

| Check | Expected | Status |
|-------|----------|--------|
| Health monitor active | Status: Up | ⏳ |
| Alert contacts configured | Email/Slack set | ⏳ |
| 5-minute interval | Configured | ⏳ |

### 7.3 Vercel Analytics

| Check | Expected | Status |
|-------|----------|--------|
| Analytics enabled | Data collecting | ⏳ |
| Web Vitals tracking | LCP, FID, CLS shown | ⏳ |

**Section 7 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 8: Browser Compatibility

### 8.1 Desktop Browsers

| Browser | Version | Voice | UI | Settings | Status |
|---------|---------|-------|----|---------:|--------|
| Chrome | Latest | ⏳ | ⏳ | ⏳ | ⏳ |
| Firefox | Latest | ⏳ | ⏳ | ⏳ | ⏳ |
| Safari | Latest | ⏳ | ⏳ | ⏳ | ⏳ |
| Edge | Latest | ⏳ | ⏳ | ⏳ | ⏳ |

### 8.2 Minimum Requirements

| Requirement | Threshold | Status |
|-------------|-----------|--------|
| Screen resolution | 1280x720 | ⏳ |
| JavaScript enabled | Required | ⏳ |
| Microphone access | For voice | ⏳ |
| WebAudio API | Supported | ⏳ |

**Section 8 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 9: Performance

### 9.1 Core Web Vitals

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | | ⏳ |
| FID (First Input Delay) | < 100ms | | ⏳ |
| CLS (Cumulative Layout Shift) | < 0.1 | | ⏳ |

### 9.2 Load Performance

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Initial page load | < 3s | | ⏳ |
| Time to interactive | < 5s | | ⏳ |
| Bundle size (gzipped) | < 150KB | | ⏳ |

```bash
# Test with Lighthouse
npx lighthouse https://your-domain.vercel.app --only-categories=performance --output=json
```

**Section 9 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Section 10: Documentation

### 10.1 Required Documents

| Document | Location | Reviewed | Status |
|----------|----------|----------|--------|
| User Guide | docs/USER_GUIDE.md | ⏳ | ⏳ |
| Deployment Guide | docs/DEPLOYMENT.md | ⏳ | ⏳ |
| Incident Response | docs/INCIDENT_RESPONSE.md | ⏳ | ⏳ |
| Monitoring Guide | docs/MONITORING.md | ⏳ | ⏳ |

### 10.2 Support Readiness

| Item | Status |
|------|--------|
| Support contact defined | ⏳ |
| Escalation path documented | ⏳ |
| On-call schedule set | ⏳ |

**Section 10 Status:** ⏳ PENDING

**Validator:** _________________ **Date:** _________________

---

## Final Validation Summary

| Section | Status | Validator | Date |
|---------|--------|-----------|------|
| 1. Environment Configuration | ⏳ | | |
| 2. Build Validation | ⏳ | | |
| 3. API Endpoints | ⏳ | | |
| 4. Core Functionality | ⏳ | | |
| 5. Authentication | ⏳ | | |
| 6. Security Validation | ⏳ | | |
| 7. Monitoring & Alerting | ⏳ | | |
| 8. Browser Compatibility | ⏳ | | |
| 9. Performance | ⏳ | | |
| 10. Documentation | ⏳ | | |

---

## Launch Authorization

### All Sections Must Pass

**Total Sections Passed:** ___/10

**Launch Decision:**

- [ ] **GO** - All sections pass (10/10)
- [ ] **CONDITIONAL GO** - 8+/10 pass, failures are non-critical
- [ ] **NO-GO** - Critical failures require resolution

**Final Approver:** _______________________________

**Signature:** _______________________________

**Date:** _______________________________

---

## Appendix: Quick Validation Commands

```bash
# 1. Build check
npm run build && echo "BUILD: PASS" || echo "BUILD: FAIL"

# 2. Health check
curl -s https://your-domain.vercel.app/api/health | grep -q "healthy" && echo "HEALTH: PASS" || echo "HEALTH: FAIL"

# 3. Security headers
curl -sI https://your-domain.vercel.app/ | grep -q "strict-transport-security" && echo "HSTS: PASS" || echo "HSTS: WARN"

# 4. Bundle size
du -h dist/assets/*.js 2>/dev/null | awk '{print "BUNDLE: " $1}'

# 5. Sentry test
echo "Run in browser console: throw new Error('Test')"
```

---

*This checklist must be completed and signed before production launch.*

*Any FAIL status blocks launch until resolved.*

*WARN status items must be documented with accepted risk.*
