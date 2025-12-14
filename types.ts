// FIX: The 'LiveSession' type is not exported from the "@google/genai" library.
// A custom interface is defined here based on its usage within the application to resolve the import error.
/**
 * Custom interface for Gemini Live API Session
 * FIX: The 'LiveSession' type is not exported from "@google/genai"
 * FIX: Proper typing replaces 'any' with specific types
 */
export interface LiveSession {
  close(): void;
  sendRealtimeInput(input: { media: { data: string; mimeType: string } }): void;
  sendToolResponse(response: {
    functionResponses: Array<{
      id: string;
      name: string;
      response: { result: FunctionCallResult };
    }>;
  }): void;
}

/**
 * Function call argument types - TIER 1 TYPE SAFETY FIXES
 */
export interface UpdateClientInfoArgs {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateCaseDetailsArgs {
  summary: string;
}

export interface RequestDocumentsArgs {
  documents: string[];
}

export interface FlagCaseAsUrgentArgs {
  reason: string;
}

export interface BookAppointmentArgs {
  fullName: string;
  dateTime: string;
}

export interface SendFollowUpEmailArgs {
  fullName: string;
  email: string;
}

/**
 * Union type for all function call arguments
 */
export type FunctionCallArgs =
  | UpdateClientInfoArgs
  | UpdateCaseDetailsArgs
  | RequestDocumentsArgs
  | FlagCaseAsUrgentArgs
  | BookAppointmentArgs
  | SendFollowUpEmailArgs;

/**
 * Function call result type
 */
export type FunctionCallResult = string | { success: boolean; message: string } | Record<string, unknown>;

/**
 * Consent management types
 */
export interface ConsentRecord {
  id: string;
  type: 'microphone' | 'recording' | 'data_storage' | 'crm_export' | 'hipaa' | 'terms' | 'privacy';
  obtained: boolean;
  timestamp: string;
  revokedAt?: string;
  userAgent: string;
  ipHash?: string;
}

export interface ConsentState {
  microphone: boolean;
  recording: boolean;
  dataStorage: boolean;
  crmExport: boolean;
  hipaa: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  consents: ConsentRecord[];
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
  tone: string; // e.g., 'Professional & Empathetic', 'Direct & Formal'
  languageStyle: string; // e.g., 'Calm', 'Fast-paced'
  responseDelay: number; // in milliseconds
  openingLine: string;
  urgencyKeywords: string[];
  voiceName: string;
  firmBio: string;
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