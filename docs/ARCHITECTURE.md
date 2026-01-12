# System Architecture
## AI-Powered Legal Intake Assistant

**Version:** 1.0
**Last Updated:** January 11, 2026

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     React SPA (Vite)                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │   │
│  │  │Dashboard│ │Analytics│ │ History │ │Settings │            │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │   │
│  │  ┌─────────────────────────────────────────────┐            │   │
│  │  │          State Management (React Hooks)      │            │   │
│  │  │          + localStorage persistence          │            │   │
│  │  └─────────────────────────────────────────────┘            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER (Vercel)                           │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                 │
│  │   /api/chat  │ │/api/emergency│ │ /api/webhooks │                │
│  │   (Gemini)   │ │   /detect    │ │ (Calendly,    │                │
│  │              │ │              │ │  Twilio)      │                │
│  └──────────────┘ └──────────────┘ └──────────────┘                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               OAuth Callbacks (Calendly, Clio)                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Google    │ │  Supabase   │ │   Twilio    │ │  SendGrid   │   │
│  │   Gemini    │ │  (Postgres) │ │    SMS      │ │    Email    │   │
│  │  Live API   │ │             │ │             │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│  ┌─────────────┐ ┌─────────────┐                                    │
│  │  Calendly   │ │    Clio     │                                    │
│  │  Scheduling │ │  Practice   │                                    │
│  └─────────────┘ └─────────────┘                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI framework |
| TypeScript | 5.6.2 | Type safety |
| Vite | 5.4.10 | Build tool |
| Tailwind CSS | 3.4.14 | Styling |
| lucide-react | 0.453.0 | Icons |

### 2.2 Backend (Serverless)

| Technology | Version | Purpose |
|------------|---------|---------|
| Vercel Functions | Node 20 | API endpoints |
| @google/genai | 0.7.0 | Gemini AI integration |
| @supabase/supabase-js | 2.46.1 | Database client |

### 2.3 Infrastructure

| Service | Purpose |
|---------|---------|
| Vercel | Hosting & serverless functions |
| Supabase | PostgreSQL database |
| Google Cloud | Gemini AI services |

---

## 3. Component Architecture

### 3.1 Core Components

```
src/
├── App.tsx                    # Main application container
├── main.tsx                   # React entry point
├── types.ts                   # TypeScript definitions
├── index.css                  # Global styles
│
├── components/
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── StatusBar.tsx          # Bottom status bar
│   ├── AIDisclaimerBanner.tsx # Persistent AI disclosure
│   ├── ConsentModal.tsx       # Pre-call consent form
│   ├── ThemeProvider.tsx      # Dynamic theming
│   │
│   ├── LiveIntakePanel.tsx    # Voice intake interface
│   ├── AnalyticsPanel.tsx     # Metrics dashboard
│   ├── CaseHistoryPanel.tsx   # Case management
│   ├── WorkflowPanel.tsx      # Automation controls
│   ├── CompliancePanel.tsx    # Legal/security settings
│   ├── SettingsPanel.tsx      # Configuration hub
│   │
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx  # Full-page analytics
│   │
│   ├── admin/
│   │   └── AdminDashboard.tsx      # Admin controls
│   │
│   └── layout/
│       └── AppLayout.tsx           # Page layout wrapper
│
├── lib/
│   ├── supabase.ts            # Supabase client & operations
│   ├── types.ts               # Database types
│   └── scoring/
│       └── leadScoring.ts     # Lead qualification logic
│
└── api/
    ├── chat.ts                # AI chat endpoint
    ├── emergency/
    │   └── detect.ts          # Crisis detection
    ├── integrations/
    │   ├── calendly/
    │   │   └── callback.ts    # OAuth callback
    │   └── clio/
    │       └── callback.ts    # OAuth callback
    ├── webhooks/
    │   ├── calendly.ts        # Appointment webhook
    │   └── twilio.ts          # SMS webhook
    └── cron/
        └── follow-ups.ts      # Scheduled tasks
```

### 3.2 State Management

```typescript
// App.tsx - Global State Container
interface AppState {
  callState: CallState;           // IDLE | CONNECTING | ACTIVE | etc.
  currentClient: ClientInfo;       // Name, email, phone, case details
  transcription: Message[];        // Conversation history
  settings: ReceptionistSettings;  // User preferences
  consentData: ConsentData | null; // Pre-call consent
}

// State Flow
localStorage <──► React.useState <──► Components
                       │
                       ▼
              ThemeProvider (CSS Variables)
```

### 3.3 Component Communication

```
┌──────────────────────────────────────────────────────────┐
│                        App.tsx                            │
│                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Sidebar   │◄───│   Props     │───►│  StatusBar  │  │
│  └──────┬──────┘    │  (settings, │    └──────┬──────┘  │
│         │           │   handlers) │           │         │
│         ▼           └──────┬──────┘           ▼         │
│  ┌─────────────┐           │           ┌─────────────┐  │
│  │ Navigation  │           │           │   Toggles   │  │
│  │   Events    │           ▼           │   Events    │  │
│  └─────────────┘    ┌─────────────┐    └─────────────┘  │
│                     │   Content   │                      │
│                     │   Panels    │                      │
│                     └─────────────┘                      │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Data Architecture

### 4.1 Database Schema (Supabase)

```sql
-- Core Tables
tenants           -- Multi-tenant configuration
leads             -- Client intake records
conversations     -- Call/chat sessions
messages          -- Transcript storage
audit_logs        -- Compliance tracking
emergency_events  -- Crisis detection records
follow_ups        -- Scheduled outreach
integrations      -- Third-party connections

-- Relationships
tenants 1:N leads
leads 1:N conversations
conversations 1:N messages
leads 1:N follow_ups
leads 1:1 emergency_events
tenants 1:N integrations
```

### 4.2 Key Data Models

```typescript
// Lead (Client Intake)
interface Lead {
  id: string;
  tenant_id: string;
  status: 'in_progress' | 'completed' | 'abandoned' | 'emergency';
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  case_info: {
    type: string;
    summary: string;
    incident_date: string;
    state: string;
  };
  qualification: {
    tier: 'hot' | 'warm' | 'cold' | 'disqualified';
    score: number;
    reasons: string[];
  };
  consent: {
    disclaimer_accepted: boolean;
    recording_consent: boolean;
    sms_opt_in: boolean;
  };
}

// Settings (localStorage)
interface ReceptionistSettings {
  firmName: string;
  brandPrimaryColor: string;
  aiName: string;
  voiceName: string;
  tone: string;
  openingLine: string;
  urgencyKeywords: string[];
  hipaaMode: boolean;
  callRecording: boolean;
  employees: Employee[];
  // ... 30+ additional settings
}
```

### 4.3 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────►│   React     │────►│ localStorage│
│  Interacts  │     │   State     │     │  Persist    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Gemini AI  │
                    │   Voice     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Supabase   │
                    │  Database   │ (future integration)
                    └─────────────┘
```

---

## 5. Voice Intake Architecture

### 5.1 Audio Pipeline

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│ Microphone │───►│AudioWorklet│───►│   Gemini   │───►│  Speaker   │
│   Input    │    │ Processing │    │  Live API  │    │   Output   │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                                           │
                                           ▼
                                    ┌────────────┐
                                    │ Transcript │
                                    │   State    │
                                    └────────────┘
```

### 5.2 Gemini Integration

```typescript
// Live API Configuration
const config = {
  model: 'gemini-2.0-flash-live-001',
  generationConfig: {
    responseModalities: 'audio',
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName } }
    }
  },
  systemInstruction: {
    parts: [{ text: systemPrompt }]
  },
  tools: [
    { functionDeclarations: [
      { name: 'update_client_info', ... },
      { name: 'update_case_details', ... },
      { name: 'flag_case_as_urgent', ... },
      { name: 'book_appointment', ... }
    ]}
  ]
};
```

### 5.3 Tool Calling

```
User speaks ──► Gemini processes ──► Tool call detected
                                           │
                                           ▼
                                    ┌────────────┐
                                    │ Tool:      │
                                    │ update_    │
                                    │ client_    │
                                    │ info       │
                                    └─────┬──────┘
                                          │
                                          ▼
                                    ┌────────────┐
                                    │ React      │
                                    │ State      │
                                    │ Update     │
                                    └────────────┘
```

---

## 6. Security Architecture

### 6.1 Authentication Flow (Future)

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───►│ Supabase│───►│  JWT    │───►│   App   │
│  Login  │    │  Auth   │    │  Token  │    │ Access  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### 6.2 Data Protection

| Layer | Protection |
|-------|------------|
| Transport | TLS 1.3 |
| Storage | AES-256 encryption |
| Client | localStorage (sandboxed) |
| API | Rate limiting, CORS |
| Database | Row-Level Security (RLS) |

### 6.3 Environment Variables

```bash
# Public (exposed to client)
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_DEFAULT_TENANT_SLUG=demo

# Private (server-side only)
VITE_API_KEY=<gemini-api-key>
TWILIO_ACCOUNT_SID=<twilio-sid>
TWILIO_AUTH_TOKEN=<twilio-token>
SENDGRID_API_KEY=<sendgrid-key>
```

---

## 7. Deployment Architecture

### 7.1 Vercel Configuration

```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  }
}
```

### 7.2 CI/CD Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │───►│   Vercel    │───►│ Production  │
│   Push      │    │   Build     │    │   Deploy    │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Preview   │
                   │   Deploy    │
                   └─────────────┘
```

### 7.3 Environment Strategy

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | main | ai-studio-legal-assistant.vercel.app | Live users |
| Preview | PR branches | pr-*.vercel.app | Testing |
| Development | local | localhost:5173 | Development |

---

## 8. Performance Optimization

### 8.1 Bundle Optimization

- **Code Splitting**: React lazy loading for routes
- **Tree Shaking**: Unused code elimination
- **Minification**: Terser for production builds
- **Compression**: Brotli/Gzip via Vercel

### 8.2 Runtime Optimization

- **React 19**: Concurrent features
- **Memoization**: React.memo for expensive components
- **Virtualization**: For long lists (future)
- **Debouncing**: Input handlers

### 8.3 Caching Strategy

| Resource | Cache Duration | Strategy |
|----------|----------------|----------|
| Static assets | 1 year | Immutable |
| API responses | 0 | No cache |
| localStorage | Persistent | Client-side |

---

## 9. Monitoring & Observability

### 9.1 Current Monitoring

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Performance metrics |
| Console logs | Error tracking |
| Browser DevTools | Development debugging |

### 9.2 Recommended Additions

| Tool | Purpose | Priority |
|------|---------|----------|
| Sentry | Error tracking | High |
| LogRocket | Session replay | Medium |
| Datadog | APM | Low |

---

## 10. Scalability Considerations

### 10.1 Current Limits

| Component | Current | Scalable To |
|-----------|---------|-------------|
| Concurrent calls | 10 | 100+ (with Gemini quota) |
| Database | Supabase free tier | Pro tier |
| API requests | 100/sec | 1000+/sec |

### 10.2 Scaling Strategy

1. **Horizontal**: Vercel auto-scales functions
2. **Database**: Supabase connection pooling
3. **AI**: Gemini quota increases
4. **CDN**: Vercel Edge Network

---

## 11. Disaster Recovery

### 11.1 Backup Strategy

| Data | Backup | Frequency |
|------|--------|-----------|
| Database | Supabase automatic | Daily |
| Code | GitHub | Every commit |
| Settings | localStorage | Client-side |

### 11.2 Recovery Procedures

1. **Database**: Restore from Supabase backup
2. **Application**: Redeploy from GitHub
3. **DNS**: Vercel automatic failover

---

*Document maintained by Engineering Team*
