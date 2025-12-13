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