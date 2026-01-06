/**
 * Custom Error Types for AI Legal Receptionist
 * Provides type-safe error handling throughout the application
 */

export enum ErrorCode {
  // Microphone/Audio Errors
  MIC_PERMISSION_DENIED = 'MIC_PERMISSION_DENIED',
  MIC_NOT_FOUND = 'MIC_NOT_FOUND',
  MIC_NOT_READABLE = 'MIC_NOT_READABLE',
  MIC_ABORT = 'MIC_ABORT',
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  AUDIO_WORKLET_ERROR = 'AUDIO_WORKLET_ERROR',
  AUDIO_DECODE_ERROR = 'AUDIO_DECODE_ERROR',

  // API Errors
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_KEY_INVALID = 'API_KEY_INVALID',
  API_NETWORK_ERROR = 'API_NETWORK_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  API_INVALID_RESPONSE = 'API_INVALID_RESPONSE',

  // Session Errors
  SESSION_INITIALIZATION_FAILED = 'SESSION_INITIALIZATION_FAILED',
  SESSION_CONNECTION_LOST = 'SESSION_CONNECTION_LOST',
  SESSION_ALREADY_ACTIVE = 'SESSION_ALREADY_ACTIVE',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',

  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_NAME = 'INVALID_NAME',
  INVALID_DATETIME = 'INVALID_DATETIME',

  // CRM Errors
  CRM_EXPORT_FAILED = 'CRM_EXPORT_FAILED',
  CRM_INVALID_CREDENTIALS = 'CRM_INVALID_CREDENTIALS',
  CRM_API_ERROR = 'CRM_API_ERROR',

  // Consent Errors
  CONSENT_NOT_OBTAINED = 'CONSENT_NOT_OBTAINED',
  CONSENT_REVOKED = 'CONSENT_REVOKED',

  // Storage Errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_ERROR = 'STORAGE_ERROR',

  // Report Generation Errors
  REPORT_GENERATION_FAILED = 'REPORT_GENERATION_FAILED',
  INVALID_REPORT_STRUCTURE = 'INVALID_REPORT_STRUCTURE',

  // Generic Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

/**
 * Base custom error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Microphone permission denied error
 */
export class MicrophonePermissionError extends AppError {
  constructor(message: string = 'Microphone permission denied', context?: Record<string, unknown>) {
    super(ErrorCode.MIC_PERMISSION_DENIED, message, context);
    this.name = 'MicrophonePermissionError';
    Object.setPrototypeOf(this, MicrophonePermissionError.prototype);
  }
}

/**
 * Microphone not found error
 */
export class MicrophoneNotFoundError extends AppError {
  constructor(message: string = 'Microphone not found', context?: Record<string, unknown>) {
    super(ErrorCode.MIC_NOT_FOUND, message, context);
    this.name = 'MicrophoneNotFoundError';
    Object.setPrototypeOf(this, MicrophoneNotFoundError.prototype);
  }
}

/**
 * Microphone not readable error
 */
export class MicrophoneNotReadableError extends AppError {
  constructor(message: string = 'Microphone is not readable', context?: Record<string, unknown>) {
    super(ErrorCode.MIC_NOT_READABLE, message, context);
    this.name = 'MicrophoneNotReadableError';
    Object.setPrototypeOf(this, MicrophoneNotReadableError.prototype);
  }
}

/**
 * Audio context error
 */
export class AudioContextError extends AppError {
  constructor(message: string = 'Audio context initialization failed', context?: Record<string, unknown>) {
    super(ErrorCode.AUDIO_CONTEXT_ERROR, message, context);
    this.name = 'AudioContextError';
    Object.setPrototypeOf(this, AudioContextError.prototype);
  }
}

/**
 * API error
 */
export class APIError extends AppError {
  constructor(
    code: ErrorCode,
    message: string,
    public statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(code, message, context);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Network error (offline, timeout, etc.)
 */
export class NetworkError extends APIError {
  constructor(message: string = 'Network error', context?: Record<string, unknown>) {
    super(ErrorCode.API_NETWORK_ERROR, message, undefined, context);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * API rate limit error (429)
 */
export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(ErrorCode.API_RATE_LIMIT, message, 429, { retryAfter });
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * API quota exceeded error (403/429)
 */
export class QuotaExceededError extends APIError {
  constructor(message: string = 'Quota exceeded', context?: Record<string, unknown>) {
    super(ErrorCode.API_QUOTA_EXCEEDED, message, 429, context);
    this.name = 'QuotaExceededError';
    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}

/**
 * Session error
 */
export class SessionError extends AppError {
  constructor(code: ErrorCode, message: string, context?: Record<string, unknown>) {
    super(code, message, context);
    this.name = 'SessionError';
    Object.setPrototypeOf(this, SessionError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation failed',
    public field?: string,
    context?: Record<string, unknown>
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, { field, ...context });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Consent error
 */
export class ConsentError extends AppError {
  constructor(message: string = 'Consent required', context?: Record<string, unknown>) {
    super(ErrorCode.CONSENT_NOT_OBTAINED, message, context);
    this.name = 'ConsentError';
    Object.setPrototypeOf(this, ConsentError.prototype);
  }
}

/**
 * CRM error
 */
export class CRMError extends AppError {
  constructor(
    message: string = 'CRM operation failed',
    public platform?: string,
    context?: Record<string, unknown>
  ) {
    super(ErrorCode.CRM_EXPORT_FAILED, message, { platform, ...context });
    this.name = 'CRMError';
    Object.setPrototypeOf(this, CRMError.prototype);
  }
}

/**
 * Report generation error
 */
export class ReportGenerationError extends AppError {
  constructor(message: string = 'Failed to generate report', context?: Record<string, unknown>) {
    super(ErrorCode.REPORT_GENERATION_FAILED, message, context);
    this.name = 'ReportGenerationError';
    Object.setPrototypeOf(this, ReportGenerationError.prototype);
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get user-friendly error message based on error code
 */
export function getUserFriendlyMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.MIC_PERMISSION_DENIED]: 'Microphone access denied. Please check your browser permissions.',
    [ErrorCode.MIC_NOT_FOUND]: 'No microphone found. Please connect a microphone and try again.',
    [ErrorCode.MIC_NOT_READABLE]: 'Microphone is not responding. Please try a different microphone.',
    [ErrorCode.MIC_ABORT]: 'Microphone access was aborted. Please try again.',
    [ErrorCode.AUDIO_CONTEXT_ERROR]: 'Audio system failed to initialize. Please refresh the page.',
    [ErrorCode.AUDIO_WORKLET_ERROR]: 'Audio processing failed. Please refresh the page.',
    [ErrorCode.AUDIO_DECODE_ERROR]: 'Audio playback failed. Please try again.',
    [ErrorCode.API_KEY_MISSING]: 'API key is missing. Please contact your administrator.',
    [ErrorCode.API_KEY_INVALID]: 'API key is invalid. Please contact your administrator.',
    [ErrorCode.API_NETWORK_ERROR]: 'Network error. Please check your internet connection.',
    [ErrorCode.API_TIMEOUT]: 'Request timed out. Please try again.',
    [ErrorCode.API_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
    [ErrorCode.API_QUOTA_EXCEEDED]: 'Service quota exceeded. Please try again later.',
    [ErrorCode.API_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
    [ErrorCode.API_INVALID_RESPONSE]: 'Invalid response from service. Please try again.',
    [ErrorCode.SESSION_INITIALIZATION_FAILED]: 'Failed to start session. Please try again.',
    [ErrorCode.SESSION_CONNECTION_LOST]: 'Connection lost. Please try again.',
    [ErrorCode.SESSION_ALREADY_ACTIVE]: 'A session is already active. Please end it first.',
    [ErrorCode.SESSION_NOT_FOUND]: 'Session not found. Please start a new session.',
    [ErrorCode.VALIDATION_ERROR]: 'Invalid input. Please check and try again.',
    [ErrorCode.INVALID_EMAIL]: 'Please enter a valid email address.',
    [ErrorCode.INVALID_PHONE]: 'Please enter a valid phone number.',
    [ErrorCode.INVALID_NAME]: 'Please enter a valid name.',
    [ErrorCode.INVALID_DATETIME]: 'Please select a valid date and time.',
    [ErrorCode.CRM_EXPORT_FAILED]: 'Failed to export to CRM. Please try again.',
    [ErrorCode.CRM_INVALID_CREDENTIALS]: 'CRM credentials are invalid. Please contact your administrator.',
    [ErrorCode.CRM_API_ERROR]: 'CRM service error. Please try again later.',
    [ErrorCode.CONSENT_NOT_OBTAINED]: 'Please accept the terms to continue.',
    [ErrorCode.CONSENT_REVOKED]: 'Your consent has been revoked. Please re-accept.',
    [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded. Please clear some data.',
    [ErrorCode.STORAGE_ERROR]: 'Storage error occurred. Please try again.',
    [ErrorCode.REPORT_GENERATION_FAILED]: 'Failed to generate report. Please try again.',
    [ErrorCode.INVALID_REPORT_STRUCTURE]: 'Invalid report structure. Please contact support.',
    [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    [ErrorCode.NOT_IMPLEMENTED]: 'This feature is not yet implemented.',
  };

  return messages[code] || messages[ErrorCode.UNKNOWN_ERROR];
}
