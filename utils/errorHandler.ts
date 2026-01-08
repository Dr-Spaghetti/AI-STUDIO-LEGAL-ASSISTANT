/**
 * Comprehensive error handling utility
 * Provides user-friendly error messages for common issues
 */

export const ErrorMessages = {
  API: {
    MISSING_KEY: "❌ API Key Missing: Please set VITE_API_KEY in environment variables",
    INVALID_KEY: "❌ Invalid API Key: The Gemini API key is not valid",
    RATE_LIMIT: "❌ Rate Limited: Too many requests. Please wait before trying again",
    SERVICE_DOWN: "❌ Service Unavailable: Gemini API is currently down",
  },
  NETWORK: {
    OFFLINE: "❌ Network Error: No internet connection detected",
    TIMEOUT: "❌ Connection Timeout: Request took too long to complete",
    CORS_ERROR: "❌ CORS Error: Server rejected the request",
  },
  MICROPHONE: {
    PERMISSION_DENIED: "❌ Microphone Permission Denied: Please allow microphone access in browser settings",
    NOT_FOUND: "❌ No Microphone Found: Please check your audio device",
    NOT_READABLE: "❌ Microphone Error: Could not access audio device",
    GENERIC: "❌ Microphone Error: Could not initialize audio",
  },
  AUDIO: {
    CONTEXT_FAIL: "❌ Audio Engine Error: Browser does not support AudioContext",
    WORKLET_FAIL: "❌ Audio Processing Error: Could not initialize audio processor",
  },
  DATA: {
    INVALID_DATA: "❌ Invalid Data: Could not process response",
    MISSING_DATA: "❌ Missing Data: Required information is incomplete",
  },
  GENERIC: "❌ An unexpected error occurred. Please try again.",
};

export const getErrorMessage = (errorCode: string, defaultMessage?: string): string => {
  // Check if error code matches a known pattern
  for (const category of Object.values(ErrorMessages) as Record<string, string>[]) {
    for (const [key, message] of Object.entries(category)) {
      if (errorCode.toUpperCase().includes(key)) {
        return message;
      }
    }
  }

  // Return custom message or generic fallback
  return defaultMessage || ErrorMessages.GENERIC;
};

/**
 * Determine the appropriate error message based on error object
 */
export const parseError = (error: any): string => {
  if (!error) return ErrorMessages.GENERIC;

  // Handle error names (from browser APIs)
  if (error.name) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return ErrorMessages.MICROPHONE.PERMISSION_DENIED;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return ErrorMessages.MICROPHONE.NOT_FOUND;
      case 'NotReadableError':
      case 'TrackStartError':
        return ErrorMessages.MICROPHONE.NOT_READABLE;
      case 'NetworkError':
        return ErrorMessages.NETWORK.GENERIC || "❌ Network Error: Please check your connection";
      case 'TimeoutError':
        return ErrorMessages.NETWORK.TIMEOUT;
      default:
        break;
    }
  }

  // Handle error messages
  if (typeof error.message === 'string') {
    const msg = error.message.toLowerCase();
    if (msg.includes('rate limit')) return ErrorMessages.API.RATE_LIMIT;
    if (msg.includes('401') || msg.includes('unauthorized')) return ErrorMessages.API.INVALID_KEY;
    if (msg.includes('503') || msg.includes('unavailable')) return ErrorMessages.API.SERVICE_DOWN;
    if (msg.includes('cors')) return ErrorMessages.NETWORK.CORS_ERROR;
    if (msg.includes('timeout')) return ErrorMessages.NETWORK.TIMEOUT;
  }

  // Default fallback
  return error.message || ErrorMessages.GENERIC;
};
