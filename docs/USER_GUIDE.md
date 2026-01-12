# User Guide
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Last Updated:** January 11, 2026

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Live Voice Intake](#3-live-voice-intake)
4. [Case Management](#4-case-management)
5. [Analytics & Reporting](#5-analytics--reporting)
6. [Workflow Automation](#6-workflow-automation)
7. [Compliance & Security](#7-compliance--security)
8. [Settings & Configuration](#8-settings--configuration)
9. [Troubleshooting](#9-troubleshooting)
10. [FAQ](#10-faq)

---

## 1. Getting Started

### 1.1 System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Browser | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ | Latest version |
| Display | 1280x720 | 1920x1080 or higher |
| Internet | 5 Mbps | 25 Mbps or higher |
| Microphone | Built-in or USB | Headset with mic |
| Operating System | Windows 10, macOS 10.15, Chrome OS | Latest version |

### 1.2 First-Time Setup

1. **Access the Application**
   - Navigate to your organization's URL
   - No login required for single-tenant deployment

2. **Configure Branding**
   - Go to Settings > Branding
   - Enter your firm name
   - Upload your logo
   - Set primary brand color

3. **Add Team Members**
   - Go to Settings > Team & Routing
   - Click "Add Team Member"
   - Fill in attorney/staff details
   - Save for call routing

4. **Review Compliance Settings**
   - Go to Compliance
   - Enable HIPAA mode if handling health data
   - Configure legal disclaimers
   - Enable audit logging

---

## 2. Dashboard Overview

The dashboard provides a real-time view of your intake operations.

### 2.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    AI DISCLAIMER BANNER                     │
├──────────────┬────────────────────────┬─────────────────────┤
│              │                        │                     │
│   SIDEBAR    │     LIVE INTAKE        │    CASE HISTORY     │
│              │        PANEL           │       PANEL         │
│  Navigation  │                        │                     │
│              │                        │                     │
│              ├────────────────────────┼─────────────────────┤
│              │                        │                     │
│              │   ANALYTICS PANEL      │                     │
│              │                        │                     │
├──────────────┴────────────────────────┴─────────────────────┤
│                       STATUS BAR                            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Navigation Sidebar

| Icon | Section | Description |
|------|---------|-------------|
| 📊 | Dashboard | Main view with all panels |
| 📈 | Analytics | Full-page performance metrics |
| 📋 | History | Complete case history |
| ⚙️ | Workflow | Automation settings |
| 🛡️ | Compliance | Legal & security settings |
| 🔧 | Settings | System configuration |

### 2.3 Status Bar

The bottom status bar shows:
- **AI Persona Toggle**: Enable/disable AI personality
- **Privacy Mode Toggle**: Enable enhanced privacy
- **System Status**: Connection indicator (green = ready)

---

## 3. Live Voice Intake

### 3.1 Starting a Call

1. Click the **Start** button in the Live Intake panel
2. Complete the consent form:
   - Select your state
   - Accept the AI disclaimer
   - Accept terms of service
   - (Two-party states) Consent to recording
3. Grant microphone permission when prompted
4. Begin speaking with the AI

### 3.2 During the Call

**Visual Indicators:**
- **Orb Animation**: Shows AI is listening/speaking
- **Waveform**: Displays audio activity
- **Transcript**: Real-time text of conversation

**AI Capabilities:**
- Collect client name, email, phone
- Capture case details and incident information
- Schedule appointments
- Flag urgent cases
- Provide crisis resources for emergencies

### 3.3 Ending a Call

1. Click the **End Call** button
2. Call summary is displayed
3. Client information is saved
4. Case appears in Case History

### 3.4 Emergency Detection

The AI automatically detects crisis situations:
- Suicide risk indicators
- Domestic violence mentions
- Child abuse concerns
- Immediate danger statements

**Response:** System provides crisis hotline information and flags the case.

---

## 4. Case Management

### 4.1 Viewing Cases

**Dashboard View:**
- Shows 5 most recent cases
- Quick status indicators
- Click any case for details

**Full History View:**
1. Click "View All Cases" or navigate to History
2. Use filter tabs: All / Booked / Follow-Up
3. Click any row to view details

### 4.2 Case Details Modal

Each case shows:
- Client name and contact info
- Case type and practice area
- Status (Booked, Follow-up, Pending, Closed)
- Priority level (High, Medium, Low)
- Date of intake

### 4.3 Actions

| Action | How | Result |
|--------|-----|--------|
| View Details | Click case row | Opens detail modal |
| Call Client | Click "Call Client" button | Opens phone dialer |
| Export Data | Click "Export CSV" | Downloads spreadsheet |
| Refresh List | Click refresh icon | Updates case list |

### 4.4 Status Definitions

| Status | Meaning | Next Action |
|--------|---------|-------------|
| 🟢 Booked | Appointment scheduled | Prepare for meeting |
| 🟡 Follow-up | Needs outreach | Contact client |
| ⚪ Pending | Awaiting response | Wait or re-contact |
| ⚫ Closed | Case complete | Archive |

---

## 5. Analytics & Reporting

### 5.1 Key Metrics

| Metric | Description |
|--------|-------------|
| Total Calls | Number of completed intakes |
| Conversion Rate | Percentage of leads to appointments |
| Avg Duration | Average call length |
| Weekly Trend | Call volume over 7 days |

### 5.2 Charts

**Weekly Trend Chart:**
- Bar chart showing daily call volume
- Identifies busy periods
- Tracks growth trends

**Case Type Distribution:**
- Horizontal bars by practice area
- Shows most common case types
- Helps resource allocation

### 5.3 Exporting Reports

1. Click the menu icon (⋮) in Analytics panel
2. Select export option
3. Download CSV or PDF

---

## 6. Workflow Automation

### 6.1 Available Workflows

**Conflict Checks:**
- Automated screening of new clients
- Checks against existing client database
- Flags potential conflicts

**Follow-up Queue:**
- Tracks pending follow-ups
- Schedules reminders
- Prioritizes outreach

**AI Call Analysis:**
- Analyzes call transcripts
- Extracts key information
- Identifies sentiment patterns

### 6.2 Enabling Workflows

1. Navigate to Workflow
2. Toggle each workflow ON/OFF
3. Monitor status in quick stats

---

## 7. Compliance & Security

### 7.1 HIPAA Mode

When enabled:
- Enhanced data encryption
- Access logging activated
- Breach notification ready
- PHI handling protocols

### 7.2 Legal Disclaimers

Configure automatic disclaimers:
1. Go to Compliance
2. Toggle "Legal Disclaimer" ON
3. Edit default disclosure text
4. Click "Save Disclosure"

### 7.3 Two-Party Consent States

The system automatically detects callers from:
CA, CT, FL, IL, MD, MA, MT, NH, PA, WA

These states require explicit recording consent, which is captured in the consent modal.

### 7.4 Audit Logging

When enabled:
- All system actions logged
- User interactions tracked
- Exportable CSV format
- Compliance-ready records

---

## 8. Settings & Configuration

### 8.1 Branding

| Setting | Description |
|---------|-------------|
| Firm Name | Displayed in header and AI greeting |
| Logo | Upload PNG, JPG, SVG, or WebP (max 5MB) |
| Primary Color | Main brand color for UI elements |
| Secondary Color | Background accent color |

### 8.2 Voice & AI

| Setting | Options |
|---------|---------|
| AI Name | Custom name (e.g., "Sarah") |
| Voice | Kore, Aoede, Charon, Fenrir, Puck |
| Tone | Professional, Friendly, Formal, Warm |
| Opening Line | First words AI speaks |
| Closing Line | Farewell message |

### 8.3 Notifications

| Type | Description |
|------|-------------|
| Email Alerts | New intake notifications |
| SMS Alerts | Urgent case texts |
| Urgent Alerts | Push for high-priority |

### 8.4 Integrations

Supported integrations:
- **CRM:** Clio, MyCase, Lawmatics, Salesforce, HubSpot
- **Calendar:** Google Calendar, Outlook, Calendly
- **Email:** Gmail, Office 365, Custom SMTP
- **SMS:** Twilio, MessageBird, Vonage

---

## 9. Troubleshooting

### 9.1 Common Issues

**Microphone not working:**
1. Check browser permissions (Settings > Privacy > Microphone)
2. Ensure correct microphone selected
3. Test microphone in system settings
4. Try a different browser

**Call won't start:**
1. Check internet connection
2. Ensure consent form completed
3. Clear browser cache
4. Refresh the page

**Settings not saving:**
1. Check localStorage isn't disabled
2. Clear browser cache
3. Try incognito mode
4. Check console for errors

**Slow performance:**
1. Close unnecessary tabs
2. Clear browser cache
3. Check internet speed
4. Try a different browser

### 9.2 Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Connection failed" | Network issue | Check internet, retry |
| "Microphone denied" | Permission blocked | Allow mic in browser |
| "Session expired" | Long inactivity | Refresh page |
| "Storage full" | localStorage limit | Clear browser data |

---

## 10. FAQ

**Q: Is this replacing human staff?**
A: No. The AI assists with initial intake, but all cases are reviewed by your legal team.

**Q: Are calls recorded?**
A: Call transcripts are stored locally. Full audio recording requires additional configuration.

**Q: How is client data protected?**
A: Data is encrypted in transit (TLS 1.3) and at rest (AES-256). HIPAA mode adds additional protections.

**Q: Can I customize the AI's responses?**
A: Yes. Go to Settings > Voice & Dialogue to customize tone, opening lines, and behavior.

**Q: What happens during a system outage?**
A: The system gracefully handles errors and provides user-friendly messages. No data is lost.

**Q: How do I get help?**
A: Contact support at [support email] or visit [help center URL].

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + 1` | Go to Dashboard |
| `Alt + 2` | Go to Analytics |
| `Alt + 3` | Go to History |
| `Alt + 4` | Go to Workflow |
| `Alt + 5` | Go to Compliance |
| `Alt + S` | Go to Settings |
| `Esc` | Close modal |

---

## Support

**Documentation:** [docs URL]
**Help Center:** [help URL]
**Email Support:** [support email]
**Phone Support:** [phone number]

---

*© 2026 AI-Powered Legal Intake Assistant. All rights reserved.*
