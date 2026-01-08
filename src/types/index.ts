// Unified type definitions for entire application
import { ReactNode } from 'react';

// Call States
export enum CallState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  ACTIVE = 'active',
  PROCESSING = 'processing',
  ENDED = 'ended',
  ERROR = 'error'
}

// CRM Integration States
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

// Client Information
export interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  caseDetails: string;
  appointment: string;
  requestedDocuments?: string[];
}

// Transcription
export interface Transcription {
  speaker: 'user' | 'ai';
  text: string;
}

// Lawyer Report
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

// Branding Configuration
export interface BrandingConfig {
  firmName: string;
  logoUrl: string;
  primaryColor: string;
}

// Receptionist Settings
export interface ReceptionistSettings {
  // Identity
  aiName: string;
  firmName: string;

  // Voice Settings
  tone: string;
  languageStyle: string;
  voiceName: string;

  // Response Settings
  responseDelay: number;

  // Scripts
  openingLine: string;
  firmBio: string;
  urgencyKeywords: string[];

  // Branding
  logoUrl?: string;
  practiceArea?: string;
  firmTagline?: string;

  // AI Behavior
  demoMode?: boolean;
  conversationTone?: 'Formal' | 'Professional' | 'Casual';
  responseLength?: 'Concise' | 'Balanced' | 'Detailed';
  empathyLevel?: 'Low' | 'Medium' | 'High';

  // Call Handling
  callRecording?: boolean;
  waveformStyle?: 'Minimal' | 'Standard' | 'Detailed';
  afterHoursMode?: boolean;
  warmTransfer?: boolean;
  voiceMailTranscription?: boolean;
  callbackQueue?: boolean;
}

// Analytics & Metrics
export interface CallMetrics {
  totalCalls: number;
  appointmentsBooked: number;
  conversionRate: number;
  avgCallDuration: number;
  pipelineValue: number;
  retainedValue: number;
  lastUpdated: string;
}

// Case History
export interface CaseRecord {
  id: string;
  clientName: string;
  date: string;
  bookingStatus: 'BOOKED' | 'PENDING' | 'FOLLOW-UP' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  caseDetails?: string;
  appointmentDate?: string;
}

// Compliance
export interface ComplianceSettings {
  hipaaMode: boolean;
  phiRedaction: boolean;
  legalDisclaimer: boolean;
  auditLogging: boolean;
  twoPartyConsentStates: string[];
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user?: string;
  details?: Record<string, unknown>;
}

// Workflow Items
export interface WorkflowItem {
  id: string;
  type: 'conflict_check' | 'follow_up' | 'ai_analysis';
  clientId: string;
  clientName: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  dueDate?: string;
}

// Toast Notification
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Tab IDs (Unified)
export type TabId = 'LIVE_INTAKE' | 'ANALYTICS' | 'CASE_HISTORY' | 'COMPLIANCE' | 'SETTINGS';

// Settings Tab IDs
export type SettingsTabId = 'AI' | 'BRANDING' | 'BEHAVIOR' | 'CALLS';

// Component Props
export interface ChildrenProps {
  children: ReactNode;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Live Session (from Google Gemini)
export interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: { data: string; mimeType: string; } }): void;
  sendToolResponse(response: { functionResponses: { id: string; name: string; response: { result: any; }; } }): void;
}

export type LiveSessionPromise = Promise<LiveSession>;

// Function Call Arguments (from Gemini)
export interface UpdateClientInfoArgs {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateCaseDetailsArgs {
  caseDetails: string;
}

export interface RequestDocumentsArgs {
  documents: string[];
}

export interface FlagCaseAsUrgentArgs {
  reason: string;
}

export interface BookAppointmentArgs {
  date: string;
  time: string;
}

export interface SendFollowUpEmailArgs {
  to: string;
  subject: string;
  body: string;
}

export type FunctionCallArgs =
  | UpdateClientInfoArgs
  | UpdateCaseDetailsArgs
  | RequestDocumentsArgs
  | FlagCaseAsUrgentArgs
  | BookAppointmentArgs
  | SendFollowUpEmailArgs;
