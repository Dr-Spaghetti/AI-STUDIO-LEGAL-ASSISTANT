# Quick Start Demo Guide
## AI-Powered Legal Intake Assistant

**Time to setup:** 2 minutes

---

## Step 1: Start the Application

```bash
# In terminal:
npm run dev
```

Then open: **http://localhost:5173**

---

## Step 2: Configure Demo Settings

Open browser console (F12) and paste this:

```javascript
// Demo Configuration - Copy and paste this entire block
localStorage.setItem('receptionistSettings', JSON.stringify({
  aiName: 'Sarah',
  firmName: 'Sterling & Associates Law Firm',
  firmBio: 'Premier law firm specializing in Personal Injury, Family Law, Criminal Defense, and Estate Planning. Over 5,000 cases handled with 94% success rate.',
  brandPrimaryColor: '#00FFC8',
  brandSecondaryColor: '#1A1D24',
  voiceName: 'Kore',
  tone: 'Professional and Empathetic',
  languageStyle: 'calm, clear, and natural human voice',
  openingLine: 'Hi, thank you for calling Sterling & Associates Law Firm. My name is Sarah, how may I assist you today?',
  closingLine: 'Thank you for contacting Sterling & Associates. Have a wonderful day!',
  urgencyKeywords: ['court date', 'deadline', 'arrested', 'emergency'],
  legalDisclaimer: true,
  auditLogging: true,
  apiKeyConfigured: true
}));

// Reload to apply
location.reload();
```

---

## Step 3: Demo Flow

### 3.1 Dashboard (30 seconds)
- Show 3-column layout
- Point out Live Intake, Analytics, Case History

### 3.2 Voice Demo (3-5 minutes) ⭐
1. Click **"Start Call"**
2. Accept consent modal
3. Speak: *"Hi, I'm calling about a car accident I was in last week"*
4. Let AI respond and follow up
5. Click **"End Call"**

### 3.3 Settings (2 minutes)
1. Go to **Settings** → **Branding**
2. Change color (show live preview)
3. Go to **Voice & AI**
4. Show 10 voice options

### 3.4 Case History (1 minute)
1. Go to **Case History**
2. Click a case row
3. Click **Export CSV**

---

## Troubleshooting

### Microphone not working?
1. Check browser permissions (click lock icon in URL bar)
2. Allow microphone access
3. Refresh page

### AI not responding?
1. Check console for errors (F12)
2. Verify API key is set in .env
3. Check internet connection

### Settings not saving?
```javascript
// Clear and reload
localStorage.clear();
location.reload();
```

---

## Key Talking Points

| Feature | Benefit |
|---------|---------|
| 24/7 Voice AI | Never miss a lead |
| Real-time transcription | Instant documentation |
| 10 AI voices | Match your brand |
| One-click export | CRM integration ready |
| Built-in compliance | Legal disclaimers included |
| White-label ready | Your brand, not ours |

---

## Demo Checklist

Before presenting:
- [ ] `npm run dev` running
- [ ] Microphone tested
- [ ] Demo settings applied
- [ ] Chrome browser (recommended)
- [ ] Stable internet
- [ ] docs/DEMO_SCRIPT.md open for reference

---

**Good luck with your demo!** 🚀
