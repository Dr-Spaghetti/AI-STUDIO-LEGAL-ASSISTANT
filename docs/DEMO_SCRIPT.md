# Demo Presentation Script
## AI-Powered Legal Intake Assistant

**Duration:** 15-20 minutes
**Audience:** Executive stakeholders
**Presenter:** [Your Name]

---

## Pre-Demo Setup (5 minutes before)

### 1. Browser Setup
```javascript
// Open browser console (F12) and paste:
// This configures demo branding and settings

localStorage.setItem('receptionistSettings', JSON.stringify({
  aiName: 'Sarah',
  firmName: 'Sterling & Associates Law Firm',
  firmBio: 'Sterling & Associates is a premier full-service law firm. We specialize in Personal Injury, Family Law, Criminal Defense, and Estate Planning.',
  brandPrimaryColor: '#00FFC8',
  voiceName: 'Kore',
  tone: 'Professional and Empathetic',
  openingLine: 'Hi, thank you for calling Sterling & Associates Law Firm. My name is Sarah, how may I assist you today?',
  apiKeyConfigured: true,
  legalDisclaimer: true
}));
location.reload();
```

### 2. Environment Check
- [ ] Microphone connected and tested
- [ ] Speakers/headphones ready
- [ ] Stable internet connection
- [ ] Browser: Chrome (recommended)
- [ ] Screen resolution: 1920x1080 or higher

### 3. Tabs to Have Ready
1. Main application (Dashboard)
2. Settings page
3. Analytics page (optional)

---

## Demo Script

### Opening (1 minute)

> "Good morning/afternoon. Today I'm excited to show you our AI-Powered Legal Intake Assistant - a solution that transforms how law firms handle after-hours calls and client intake.
>
> This system uses Google's latest Gemini AI to conduct natural voice conversations with potential clients, gathering case information 24/7 while your team is unavailable."

---

### Part 1: Dashboard Overview (2 minutes)

**Action:** Show the main dashboard

> "This is the command center. You'll notice the clean, professional interface with three main areas:"

**Point out:**
1. **Left Panel - Live Intake**
   > "This is where voice calls happen. The AI assistant handles conversations in real-time."

2. **Right Panel - Recent Cases**
   > "Every intake is logged here with status, priority, and client details."

3. **Bottom - Analytics Preview**
   > "Quick stats showing call volume, conversion rates, and performance."

---

### Part 2: Voice Intake Demo (5 minutes) ⭐ KEY MOMENT

**Action:** Click "Start Call" button

> "Let me demonstrate the voice intake experience. I'll play the role of a potential client calling after hours."

**Before starting:**
> "Notice the consent modal - this ensures legal compliance and recording consent."

**Click Accept, then speak:**

> *"Hi, my name is David Miller. I was in a car accident last week and I think I need a lawyer. The other driver ran a red light and I've been having back pain ever since."*

**Let AI respond, then continue:**

> *"I went to the emergency room the day after. I have photos of the damage and a police report. I live in New York, and this happened on January 5th."*

**Point out during conversation:**
- Real-time transcription appearing
- AI asking follow-up questions
- Professional tone and empathy
- Information being captured

**End the call after 2-3 exchanges**

> "Notice how the AI captured all key details - contact info, incident details, injuries, and documentation available. This information would typically require a 15-minute intake call with a human receptionist."

---

### Part 3: Case History & Export (2 minutes)

**Action:** Navigate to Case History

> "Every intake creates a case record. Staff can review details, see priority levels, and take action."

**Demonstrate:**
1. Click on a case to view details
2. Show the filter tabs (All, Booked, Follow-up)
3. Click "Export CSV"
   > "One click exports all data for your CRM or case management system."

---

### Part 4: Settings & Customization (3 minutes)

**Action:** Navigate to Settings

> "The system is fully customizable to match your firm's brand and preferences."

**Show these tabs:**

1. **Branding**
   - Change firm name
   - Change primary color (show live preview)
   > "Your clients see your brand, not ours."

2. **Voice & AI**
   - Show voice selection grid
   - Select a different voice (e.g., "Charon - Male, Deep")
   > "Choose from 10 different AI voices to match your firm's personality."

3. **Team & Routing**
   - Show team member list
   > "Configure your team for intelligent call routing based on practice area."

4. **Compliance**
   - Show consent settings
   - Two-party consent states
   > "Built-in compliance for TCPA and state recording laws."

---

### Part 5: Analytics (2 minutes)

**Action:** Navigate to Analytics

> "Track performance with real-time analytics."

**Point out:**
- Total calls and trend
- Conversion rate
- Average call duration
- Case type distribution

> "These insights help you optimize staffing and marketing spend."

---

### Part 6: Security & Compliance (1 minute)

> "Security is built into every layer:"

- "AI disclaimers are always visible to callers"
- "Consent is captured before every conversation"
- "Two-party consent states trigger appropriate warnings"
- "No data is stored on our servers - everything goes to your Supabase database"
- "API keys are never exposed to the client"

---

### Closing & Q&A (3 minutes)

> "To summarize what you've seen today:"

**Key Benefits:**
1. ✅ **24/7 Availability** - Never miss a potential client
2. ✅ **Consistent Quality** - Every call handled professionally
3. ✅ **Instant Documentation** - Cases logged automatically
4. ✅ **Full Customization** - Your brand, your voice, your rules
5. ✅ **Compliance Built-In** - Legal disclaimers and consent handling
6. ✅ **Easy Integration** - Export to any CRM

> "The system is ready for production deployment. We have comprehensive documentation, monitoring, and support procedures in place."

**Open for questions**

---

## Handling Common Questions

### "What happens if the AI can't understand the caller?"
> "The AI is trained to ask clarifying questions. If it truly can't help, it gracefully suggests calling back during business hours or leaving contact info for a callback."

### "How much does it cost?"
> "The main cost is Google Gemini API usage - approximately $X per call. There's no per-seat licensing."

### "What about emergency situations?"
> "The system has built-in emergency detection. Keywords like 'suicide', 'danger', or 'emergency' trigger immediate alerts to designated contacts."

### "Can it handle multiple languages?"
> "Currently English, but the underlying Gemini model supports multiple languages. Adding more is on the roadmap."

### "How long to implement?"
> "For a basic deployment: 1-2 days. Full customization with integrations: 1-2 weeks."

### "Is it HIPAA compliant?"
> "The current version isn't designed for HIPAA. For medical-legal cases, we'd need additional safeguards."

---

## Demo Recovery Tips

### If voice doesn't work:
> "Let me show you the text-based interface while we troubleshoot audio..."
- Check microphone permissions
- Refresh the page

### If AI seems stuck:
> "The AI is processing - sometimes complex responses take a moment..."
- Wait 5-10 seconds
- If needed, end call and restart

### If settings don't save:
> "Let me clear the cache and reload..."
```javascript
localStorage.clear();
location.reload();
```

---

## Post-Demo Follow-Up

1. Send summary email with:
   - Key features demonstrated
   - Link to documentation
   - Proposed timeline
   - Cost estimate

2. Schedule technical deep-dive if requested

3. Prepare pilot program proposal

---

*Last Updated: January 12, 2026*
