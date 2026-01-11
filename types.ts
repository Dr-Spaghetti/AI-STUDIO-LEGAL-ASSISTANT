// FIX: The 'LiveSession' type is not exported from the "@google/genai" library.
// A custom interface is defined here based on its usage within the application to resolve the import error.
export interface LiveSession {
  // FIX: The `close` method on the Gemini API Session object returns `void`, not a `Promise<void>`.
  close(): void;
  sendRealtimeInput(input: { media: { data: string; mimeType: string; } }): void;
  sendToolResponse(response: { functionResponses: { id: string; name: string; response: { result: any; }; } }): void;
}

export enum CallState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  PROCESSING = 'processing',
  ENDED = 'ended',
  ERROR = 'error'
}

export enum CRMExportStatus {
  IDLE = 'idle',
  EXPORTING = 'exporting',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface CRMIntegrationsState {
  clio: CRMExportStatus;
  myCase: CRMExportStatus;
  lawmatics: CRMExportStatus;
}

export interface BrandingConfig {
  firmName: string;
  logoUrl: string;
  primaryColor: string;
}

// Extended Settings Interface with all 12+ categories
export interface ReceptionistSettings {
  // Branding
  aiName: string;
  firmName: string;
  logoUrl?: string;
  primaryPracticeArea?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;

  // Voice & Dialogue
  tone: string;
  languageStyle: string;
  voiceName: string;
  openingLine: string;
  closingLine?: string;

  // AI Behavior
  responseDelay: number;
  urgencyKeywords: string[];
  firmBio: string;
  maxCallDuration?: number;
  autoFollowUp?: boolean;

  // Call Handling
  callRecording?: boolean;
  voicemailEnabled?: boolean;
  callTransferEnabled?: boolean;
  transferNumber?: string;
  holdMusic?: string;

  // Scheduling
  businessHours?: {
    start: string;
    end: string;
    timezone: string;
    daysOpen: string[];
  };
  appointmentDuration?: number;
  bufferTime?: number;

  // Notifications
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  notificationEmail?: string;
  notificationPhone?: string;
  urgentAlerts?: boolean;

  // Language
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;

  // Compliance
  hipaaMode?: boolean;
  legalDisclaimer?: boolean;
  disclaimerText?: string;
  auditLogging?: boolean;
  twoPartyConsentStates?: string[];
  dataRetentionDays?: number;

  // Accessibility
  highContrast?: boolean;
  largeText?: boolean;
  screenReaderOptimized?: boolean;

  // Demo Scenarios
  demoMode?: boolean;
  demoScenario?: string;

  // Integrations
  defaultCRM?: string;
  emailService?: string;
  calendarIntegration?: string;
  smsProvider?: string;

  // Admin
  adminEmail?: string;
  apiKeyConfigured?: boolean;

  // Legacy fields for backward compatibility
  recordCalls?: boolean;
  practiceAreas?: string;
}

// Compliance State for the Compliance page
export interface ComplianceState {
  hipaaEnabled: boolean;
  legalDisclaimerEnabled: boolean;
  auditLoggingEnabled: boolean;
  auditEventCount: number;
  twoPartyConsentStates: string[];
  defaultDisclosure: string;
  dataEncryption: string;
  authentication: string;
}

// Workflow State
export interface WorkflowState {
  conflictChecks: {
    enabled: boolean;
    pendingCount: number;
    lastCheck?: string;
  };
  followUpQueue: {
    enabled: boolean;
    pendingCount: number;
    items: FollowUpItem[];
  };
  aiCallAnalysis: {
    enabled: boolean;
    analyzedCount: number;
    insights: string[];
  };
}

export interface FollowUpItem {
  id: string;
  clientName: string;
  reason: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
}

// Case History Types
export interface CaseHistoryItem {
  id: string;
  date: string;
  clientName: string;
  email?: string;
  phone?: string;
  status: 'booked' | 'follow-up' | 'pending' | 'closed';
  priority: 'high' | 'medium' | 'low';
  caseType?: string;
  notes?: string;
}

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  caseDetails: string;
  appointment: string;
  requestedDocuments?: string[];
  // Consent & Jurisdiction
  jurisdiction?: string;
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  recordingConsent?: boolean;
}

export interface Transcription {
  speaker: 'user' | 'ai';
  text: string;
}

export interface LawyerReport {
  clientDetails: {
    name: string;
    email: string;
    phone: string;
  };
  caseSummary: string;
  initialAssessment: string;
  actionableNextSteps: string;
  urgencyLevel: 'High' | 'Medium' | 'Low';
  documentCollection: {
    documentsRequested: string[];
    uploadLink: string;
  };
}

export type LiveSessionPromise = Promise<LiveSession>;

// Settings Category Type for navigation
export type SettingsCategory =
  | 'branding'
  | 'graphs'
  | 'voice'
  | 'ai-behavior'
  | 'call-handling'
  | 'scheduling'
  | 'notifications'
  | 'language'
  | 'compliance'
  | 'accessibility'
  | 'demo'
  | 'integrations'
  | 'admin';
