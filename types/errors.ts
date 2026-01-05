/**
 * Error codes for different types of application errors
 */
export type ErrorCode =
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'MICROPHONE_NOT_FOUND'
  | 'MICROPHONE_NOT_READABLE'
  | 'AUDIO_CONTEXT_ERROR'
  | 'API_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Base class for application errors
 */
export class AppError extends Error {
  code: ErrorCode;
  context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Error thrown when microphone permission is denied by the user
 */
export class MicrophonePermissionError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      'MICROPHONE_PERMISSION_DENIED',
      context
    );
    Object.setPrototypeOf(this, MicrophonePermissionError.prototype);
  }
}

/**
 * Error thrown when no microphone device is found
 */
export class MicrophoneNotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      'MICROPHONE_NOT_FOUND',
      context
    );
    Object.setPrototypeOf(this, MicrophoneNotFoundError.prototype);
  }
}

/**
 * Error thrown when microphone exists but is not readable/accessible
 */
export class MicrophoneNotReadableError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      'MICROPHONE_NOT_READABLE',
      context
    );
    Object.setPrototypeOf(this, MicrophoneNotReadableError.prototype);
  }
}

/**
 * Error thrown when AudioContext fails to initialize or is unavailable
 */
export class AudioContextError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      'AUDIO_CONTEXT_ERROR',
      context
    );
    Object.setPrototypeOf(this, AudioContextError.prototype);
  }
}

/**
 * Error thrown when an API call fails
 */
export class APIError extends AppError {
  statusCode?: number;

  constructor(
    message: string,
    context?: Record<string, unknown>,
    statusCode?: number
  ) {
    super(message, 'API_ERROR', context);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Maps error codes to user-friendly error messages
 */
export const getUserFriendlyMessage = (code: ErrorCode): string => {
  const messages: Record<ErrorCode, string> = {
    MICROPHONE_PERMISSION_DENIED:
      'Microphone Access Denied: Please allow microphone access in your browser settings to use this application.',
    MICROPHONE_NOT_FOUND:
      'No Microphone Detected: Please connect a microphone and try again.',
    MICROPHONE_NOT_READABLE:
      'Microphone Error: Your microphone appears to be in use or unavailable. Please check your device settings.',
    AUDIO_CONTEXT_ERROR:
      'Audio Engine Error: Your browser does not fully support audio features. Please use a modern browser like Chrome, Firefox, or Safari.',
    API_ERROR:
      'Service Error: Unable to connect to the AI service. Please check your internet connection and try again.',
    NETWORK_ERROR:
      'Network Error: No internet connection detected. Please check your connectivity.',
    UNKNOWN_ERROR:
      'An unexpected error occurred. Please try again or contact support if the problem persists.',
  };

  return messages[code] || messages.UNKNOWN_ERROR;
};
