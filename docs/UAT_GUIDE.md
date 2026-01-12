# User Acceptance Testing (UAT) Guide
## AI-Powered Legal Intake Assistant

**Document Version:** 1.0
**Created:** January 11, 2026
**Test Environment:** https://ai-studio-legal-assistant.vercel.app/

---

## Introduction

This guide provides step-by-step test scenarios for stakeholders to validate the Legal Intake Assistant before production launch. Each scenario represents a realistic user journey that a law firm administrator would perform.

### Before You Begin

**Requirements:**
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Desktop or laptop computer (1280x720 minimum resolution)
- Microphone access (for voice testing)
- Stable internet connection

**Test Account:**
- Demo mode: No login required by default
- To test with login: Set `requireAuth=true` in localStorage
- Staff login available with demo credentials (any email/password in demo mode)
- Settings persist in your browser's localStorage

---

## Test Scenarios

### Scenario 1: Initial Setup & Branding Configuration
**Persona:** Law Firm Administrator
**Goal:** Configure the system with firm branding and basic settings

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1.1 | Navigate to the application URL | Dashboard loads with 3-column layout | | |
| 1.2 | Click "Settings" in the sidebar | Settings panel opens with Branding tab | | |
| 1.3 | Enter your firm name (e.g., "Johnson & Associates") | Text appears in input field | | |
| 1.4 | Click the color picker for Primary Brand Color | Color picker opens | | |
| 1.5 | Select a new color (e.g., blue #3B82F6) | Live Preview updates immediately | | |
| 1.6 | Observe the Live Preview section | Button and text show new color | | |
| 1.7 | Navigate to Dashboard (sidebar) | Dashboard uses new brand color | | |
| 1.8 | Refresh the page | Settings are retained after refresh | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 2: Team Member Management
**Persona:** Law Firm Administrator
**Goal:** Add team members for call routing

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 2.1 | Click "Settings" in sidebar | Settings panel opens | | |
| 2.2 | Click "Team & Routing" tab | Team management section appears | | |
| 2.3 | Click "Add Team Member" button | Modal dialog opens with form | | |
| 2.4 | Fill in: Name = "John Smith" | Text entered | | |
| 2.5 | Select Role = "Attorney" | Dropdown selection made | | |
| 2.6 | Enter Title = "Senior Partner" | Text entered | | |
| 2.7 | Select Practice Area = "Personal Injury" | Dropdown selection made | | |
| 2.8 | Enter Email = "john@firm.com" | Text entered | | |
| 2.9 | Enter Phone = "(555) 123-4567" | Text entered | | |
| 2.10 | Ensure "Active" checkbox is checked | Checkbox is checked | | |
| 2.11 | Click "Save" | Modal closes, employee in list | | |
| 2.12 | Click edit icon on John Smith | Modal opens with pre-filled data | | |
| 2.13 | Change title to "Managing Partner" | Text updated | | |
| 2.14 | Click "Save" | Changes saved, toast confirms | | |
| 2.15 | Click delete icon on John Smith | Confirmation dialog appears | | |
| 2.16 | Confirm deletion | Employee removed from list | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 3: Voice Intake Experience (with Microphone)
**Persona:** Law Firm Staff Member
**Goal:** Test the AI voice intake system

#### Prerequisites:
- Microphone connected and working
- Browser has microphone permissions

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 3.1 | Navigate to Dashboard | Live Intake panel visible on left | | |
| 3.2 | Click "Start" or microphone button | Consent modal appears | | |
| 3.3 | Select your state from dropdown | State selected | | |
| 3.4 | Check "I understand..." checkbox | Checkbox checked | | |
| 3.5 | Check "I agree to Terms..." checkbox | Checkbox checked | | |
| 3.6 | Click "Continue to Intake" | Modal closes, call starts | | |
| 3.7 | Grant microphone permission if prompted | Browser grants access | | |
| 3.8 | Observe the orb animation | Animated orb visible | | |
| 3.9 | Say "Hello, my name is Sarah Johnson" | AI responds with greeting | | |
| 3.10 | Observe transcript area | Your words and AI response appear | | |
| 3.11 | Say "I was in a car accident last week" | AI asks follow-up questions | | |
| 3.12 | Click "End Call" button | Call ends, state returns to idle | | |
| 3.13 | Check transcript | Full conversation recorded | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 4: Case History & Export
**Persona:** Law Firm Administrator
**Goal:** Review client intakes and export data

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 4.1 | Navigate to Dashboard | Case History panel visible on right | | |
| 4.2 | Observe the case list | Shows recent client intakes | | |
| 4.3 | Click "View All Cases →" link | Full-page history view opens | | |
| 4.4 | Click "All Cases" filter tab | Shows all cases (count in badge) | | |
| 4.5 | Click "Booked" filter tab | Shows only booked cases | | |
| 4.6 | Click "Follow-Up" filter tab | Shows only follow-up cases | | |
| 4.7 | Click "Export CSV" button | CSV file downloads | | |
| 4.8 | Open the downloaded CSV | Contains headers and case data | | |
| 4.9 | Click on any case row | Case details modal opens | | |
| 4.10 | Review modal content | Shows name, email, phone, status | | |
| 4.11 | Click "Call Client" button | Phone link activates (tel:) | | |
| 4.12 | Click "Close" to dismiss modal | Modal closes | | |
| 4.13 | Click refresh button (circular arrow) | Toast confirms "Data refreshed" | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 5: Analytics Review
**Persona:** Law Firm Manager
**Goal:** Review performance metrics and trends

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 5.1 | Click "Analytics" in sidebar | Full analytics page loads | | |
| 5.2 | Review the 4 metric cards at top | Shows calls, conversion, avg duration | | |
| 5.3 | Observe weekly trend chart | Bar chart with 7 days visible | | |
| 5.4 | Hover over chart bars | Data tooltips appear (if enabled) | | |
| 5.5 | Review case type distribution | Horizontal bar chart visible | | |
| 5.6 | Click the menu icon (3 dots) | Dropdown menu appears | | |
| 5.7 | Note available export options | Export options visible | | |
| 5.8 | Return to Dashboard | Dashboard loads correctly | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 6: Workflow Automation Setup
**Persona:** Law Firm Administrator
**Goal:** Configure automated workflows

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 6.1 | Click "Workflow" in sidebar | Workflow panel loads | | |
| 6.2 | Toggle "Conflict Checks" ON | Toggle activates, toast shows | | |
| 6.3 | Toggle "Follow-up Queue" ON | Toggle activates, toast shows | | |
| 6.4 | Toggle "AI Call Analysis" ON | Toggle activates, toast shows | | |
| 6.5 | Observe quick stats at bottom | Shows 0 pending for each | | |
| 6.6 | Toggle each workflow OFF | All toggles deactivate | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 7: Compliance Configuration
**Persona:** Law Firm Compliance Officer
**Goal:** Configure legal compliance settings

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 7.1 | Click "Compliance" in sidebar | Compliance panel loads | | |
| 7.2 | Toggle "HIPAA Mode" ON | Shows PHI protection features | | |
| 7.3 | Toggle "Legal Disclaimer" ON | Status shows "Auto-inserted" | | |
| 7.4 | Toggle "Audit Logging" ON | Shows event count | | |
| 7.5 | Click "Export Audit Log" button | CSV file downloads | | |
| 7.6 | Open downloaded audit log | Contains timestamp, event, user | | |
| 7.7 | Review Two-Party Consent states | Shows CA, CT, FL, IL, MD, MA, MT, NH, PA, WA | | |
| 7.8 | Review Data Security section | Shows AES-256, OAuth 2.0, TLS 1.3 | | |
| 7.9 | Edit the Default Disclosure text | Text is editable | | |
| 7.10 | Click "Save Disclosure" | Toast confirms save | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 8: Voice & AI Configuration
**Persona:** Law Firm Administrator
**Goal:** Customize AI assistant behavior

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 8.1 | Go to Settings > Voice & Dialogue | Voice settings section loads | | |
| 8.2 | Change AI Assistant Name to "Emily" | Text updated | | |
| 8.3 | Select Voice = "Aoede (Female, Warm)" | Dropdown selection made | | |
| 8.4 | Change Tone = "Warm and Reassuring" | Dropdown selection made | | |
| 8.5 | Edit Opening Line to custom message | Text updated in textarea | | |
| 8.6 | Edit Closing Line to custom message | Text updated | | |
| 8.7 | Toast shows "Settings saved" | Confirmation appears | | |
| 8.8 | Go to Settings > AI Behavior | AI behavior section loads | | |
| 8.9 | Update Firm Bio text | Text updated | | |
| 8.10 | Add urgency keywords | Keywords saved | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 9: Demo Mode & Reset
**Persona:** Sales Demo Presenter
**Goal:** Prepare system for client demonstration

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 9.1 | Go to Settings > Demo Scenarios | Demo settings section loads | | |
| 9.2 | Toggle "Demo Mode" ON | Demo mode enabled | | |
| 9.3 | Select scenario = "Personal Injury Intake" | Scenario selected | | |
| 9.4 | Click "Generate Demo Data" | Toast confirms generation | | |
| 9.5 | Navigate to Dashboard | Dashboard shows demo data | | |
| 9.6 | Go to Settings > Admin | Admin section loads | | |
| 9.7 | Click "Reset All Settings to Default" | Confirmation dialog appears | | |
| 9.8 | Confirm reset | Settings return to defaults | | |
| 9.9 | Verify firm name is reset | Shows default "Ted Law Firm" | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

### Scenario 10: Two-Party Consent Flow
**Persona:** Law Firm Staff Member
**Goal:** Verify consent handling for two-party consent states

#### Steps:

| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 10.1 | Clear browser localStorage | Fresh session | | |
| 10.2 | Navigate to application | Consent modal appears | | |
| 10.3 | Select state = "California" | State selected | | |
| 10.4 | Observe warning message | Two-party consent warning shows | | |
| 10.5 | Note "Recording Consent" section | Extra checkbox appears | | |
| 10.6 | Check disclaimer checkbox | Checked | | |
| 10.7 | Check recording consent checkbox | Checked | | |
| 10.8 | Check terms checkbox | Checked | | |
| 10.9 | Click "Continue to Intake" | Modal closes, consent recorded | | |
| 10.10 | Refresh page | Consent modal does NOT reappear | | |

**Notes/Issues:**
```
_____________________________________________
_____________________________________________
```

---

## Feedback Collection Template

### Overall Experience

**Rating (1-5, 5 being best):**

| Aspect | Rating | Comments |
|--------|--------|----------|
| Ease of Use | | |
| Visual Design | | |
| Speed/Performance | | |
| Feature Completeness | | |
| Documentation Clarity | | |

### What Works Well?
```
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________
```

### What's Confusing or Broken?
```
1. _____________________________________________
   Priority: [ ] Critical [ ] High [ ] Medium [ ] Low

2. _____________________________________________
   Priority: [ ] Critical [ ] High [ ] Medium [ ] Low

3. _____________________________________________
   Priority: [ ] Critical [ ] High [ ] Medium [ ] Low
```

### What's Missing?
```
1. _____________________________________________
   Priority: [ ] Critical [ ] High [ ] Medium [ ] Low

2. _____________________________________________
   Priority: [ ] Critical [ ] High [ ] Medium [ ] Low

3. _____________________________________________
   Priority: [ ] Critical [ ] High [ ] Medium [ ] Low
```

### Additional Comments
```
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## UAT Sign-Off

### Test Summary

| Scenario | Pass | Fail | Blocked | Notes |
|----------|------|------|---------|-------|
| 1. Branding Setup | | | | |
| 2. Team Management | | | | |
| 3. Voice Intake | | | | |
| 4. Case History | | | | |
| 5. Analytics | | | | |
| 6. Workflow | | | | |
| 7. Compliance | | | | |
| 8. Voice/AI Config | | | | |
| 9. Demo/Reset | | | | |
| 10. Consent Flow | | | | |

### Final Approval

**Tester Information:**
- Name: _________________________
- Role: _________________________
- Date: _________________________

**Recommendation:**
- [ ] **APPROVED** - Ready for production launch
- [ ] **APPROVED WITH CONDITIONS** - Launch with documented issues
- [ ] **NOT APPROVED** - Critical issues must be resolved

**Signature:** _________________________

---

## Contact Information

For questions or issues during UAT:
- **Engineering Lead:** [Name] - [email]
- **Product Owner:** [Name] - [email]
- **UAT Coordinator:** [Name] - [email]

**Issue Reporting:**
Please report critical issues immediately via [preferred channel]
