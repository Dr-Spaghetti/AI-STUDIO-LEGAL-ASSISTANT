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

export interface ReceptionistSettings {
  aiName: string;
  firmName: string;
  tone: string;
  languageStyle: string;
  responseDelay: number;
  openingLine: string;
  urgencyKeywords: string[];
  voiceName: string;
  firmBio: string;
  // Branding Section
  logoUrl?: string;
  practiceArea?: string;
  firmTagline?: string;
  // AI Behavior Section
  demoMode?: boolean;
  conversationTone?: 'Formal' | 'Professional' | 'Casual';
  responseLength?: 'Concise' | 'Balanced' | 'Detailed';
  empathyLevel?: 'Low' | 'Medium' | 'High';
  // Call Handling Section
  callRecording?: boolean;
  waveformStyle?: 'Minimal' | 'Standard' | 'Detailed';
  afterHoursMode?: boolean;
  warmTransfer?: boolean;
  voiceMailTranscription?: boolean;
  callbackQueue?: boolean;
}

export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  caseDetails: string;
  appointment: string;
  requestedDocuments?: string[];
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

// Analytics & Metrics
export interface CallMetrics {
  totalCalls: number;
  appointmentsBooked: number;
  conversionRate: number;
  avgCallDuration: number; // in minutes
  pipelineValue: number; // in dollars
  retainedValue: number; // in dollars
  lastUpdated: string;
}

// Case History & CRM
export interface CaseRecord {
  id: string;
  clientName: string;
  date: string;
  bookingStatus: 'BOOKED' | 'PENDING' | 'FOLLOW-UP' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  caseDetails?: string;
  appointmentDate?: string;
}

// Workflow Automation
export interface WorkflowItem {
  id: string;
  type: 'conflict_check' | 'follow_up' | 'ai_analysis';
  clientId: string;
  clientName: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  dueDate?: string;
}

// Compliance & Audit
export interface ComplianceSettings {
  hipaaMode: boolean;
  phiRedaction: boolean;
  legalDisclaimer: boolean;
  auditLogging: boolean;
  twoPartyConsentStates: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user?: string;
  details?: Record<string, unknown>;
}