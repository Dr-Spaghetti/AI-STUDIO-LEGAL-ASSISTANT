// ============================================
// Sentry Error Tracking Integration
// ============================================
// Client-side error tracking and performance monitoring
// Configure VITE_SENTRY_DSN in environment variables

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

interface SentryBreadcrumb {
  category: string;
  message: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

interface SentryContext {
  user?: {
    id?: string;
    email?: string;
    tenantId?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

// In-memory breadcrumb store for debugging
const breadcrumbs: SentryBreadcrumb[] = [];
const MAX_BREADCRUMBS = 100;

// Current context
let currentContext: SentryContext = {};

// Check if Sentry DSN is configured
const SENTRY_DSN = typeof window !== 'undefined'
  ? (import.meta.env?.VITE_SENTRY_DSN as string)
  : (process.env.SENTRY_DSN as string);

const IS_PRODUCTION = typeof window !== 'undefined'
  ? import.meta.env?.PROD
  : process.env.NODE_ENV === 'production';

/**
 * Initialize Sentry (lightweight implementation)
 * For full Sentry SDK, install @sentry/react and @sentry/node
 */
export function initSentry(config?: Partial<SentryConfig>): void {
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured. Error tracking disabled.');
    return;
  }

  const defaultConfig: SentryConfig = {
    dsn: SENTRY_DSN,
    environment: IS_PRODUCTION ? 'production' : 'development',
    release: typeof window !== 'undefined'
      ? (import.meta.env?.VITE_APP_VERSION as string) || '1.0.0'
      : process.env.VERCEL_GIT_COMMIT_SHA || '1.0.0',
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ...config,
  };

  console.log('[Sentry] Initialized with config:', {
    environment: defaultConfig.environment,
    release: defaultConfig.release,
  });

  // Set up global error handler
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      captureException(error || new Error(String(message)), {
        extra: { source, lineno, colno },
      });
      return false;
    };

    window.onunhandledrejection = (event) => {
      captureException(event.reason, {
        tags: { type: 'unhandledrejection' },
      });
    };
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: SentryContext['user']): void {
  currentContext.user = user;
  addBreadcrumb({
    category: 'auth',
    message: user ? `User identified: ${user.id || 'unknown'}` : 'User cleared',
    level: 'info',
    data: user ? { tenantId: user.tenantId } : undefined,
  });
}

/**
 * Set tags for categorizing errors
 */
export function setTags(tags: Record<string, string>): void {
  currentContext.tags = { ...currentContext.tags, ...tags };
}

/**
 * Set extra context data
 */
export function setExtra(key: string, value: unknown): void {
  if (!currentContext.extra) {
    currentContext.extra = {};
  }
  currentContext.extra[key] = value;
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: SentryBreadcrumb): void {
  breadcrumbs.push({
    ...breadcrumb,
    data: {
      ...breadcrumb.data,
      timestamp: new Date().toISOString(),
    },
  });

  // Trim old breadcrumbs
  while (breadcrumbs.length > MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(
  error: Error | unknown,
  context?: Partial<SentryContext>
): string {
  const eventId = generateEventId();
  const errorObj = error instanceof Error ? error : new Error(String(error));

  const eventPayload = {
    eventId,
    timestamp: new Date().toISOString(),
    error: {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack,
    },
    context: {
      ...currentContext,
      ...context,
    },
    breadcrumbs: [...breadcrumbs],
    environment: IS_PRODUCTION ? 'production' : 'development',
  };

  // Log to console in development
  if (!IS_PRODUCTION) {
    console.error('[Sentry] Captured exception:', eventPayload);
  }

  // Send to Sentry if DSN is configured
  if (SENTRY_DSN) {
    sendToSentry(eventPayload);
  }

  // Also log to audit trail
  logToAuditTrail('error', errorObj.message, eventPayload);

  return eventId;
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Partial<SentryContext>
): string {
  const eventId = generateEventId();

  const eventPayload = {
    eventId,
    timestamp: new Date().toISOString(),
    message,
    level,
    context: {
      ...currentContext,
      ...context,
    },
    breadcrumbs: [...breadcrumbs],
    environment: IS_PRODUCTION ? 'production' : 'development',
  };

  if (!IS_PRODUCTION || level === 'error') {
    console.log(`[Sentry] Captured ${level}:`, message);
  }

  if (SENTRY_DSN) {
    sendToSentry(eventPayload);
  }

  return eventId;
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string): {
  finish: () => void;
  setTag: (key: string, value: string) => void;
  setData: (key: string, value: unknown) => void;
} {
  const startTime = performance.now();
  const transactionData: Record<string, unknown> = {};
  const transactionTags: Record<string, string> = {};

  addBreadcrumb({
    category: 'transaction',
    message: `Started: ${name}`,
    level: 'debug',
    data: { op },
  });

  return {
    finish: () => {
      const duration = performance.now() - startTime;
      addBreadcrumb({
        category: 'transaction',
        message: `Finished: ${name}`,
        level: 'debug',
        data: { op, durationMs: duration, ...transactionData },
      });

      if (!IS_PRODUCTION) {
        console.log(`[Sentry] Transaction ${name} completed in ${duration.toFixed(2)}ms`);
      }
    },
    setTag: (key: string, value: string) => {
      transactionTags[key] = value;
    },
    setData: (key: string, value: unknown) => {
      transactionData[key] = value;
    },
  };
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: { name?: string; tags?: Record<string, string> }
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const transaction = startTransaction(options?.name || fn.name || 'anonymous', 'function');

    if (options?.tags) {
      Object.entries(options.tags).forEach(([key, value]) => {
        transaction.setTag(key, value);
      });
    }

    try {
      const result = await fn(...args);
      transaction.finish();
      return result as ReturnType<T>;
    } catch (error) {
      captureException(error, { tags: options?.tags });
      transaction.finish();
      throw error;
    }
  }) as T;
}

// ============================================
// Internal helpers
// ============================================

function generateEventId(): string {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

async function sendToSentry(payload: Record<string, unknown>): Promise<void> {
  if (!SENTRY_DSN) return;

  try {
    // Parse DSN to get the endpoint
    // Format: https://<key>@<org>.ingest.sentry.io/<project>
    const dsnMatch = SENTRY_DSN.match(/https:\/\/([^@]+)@([^/]+)\/(.+)/);
    if (!dsnMatch) {
      console.error('[Sentry] Invalid DSN format');
      return;
    }

    const [, publicKey, host, projectId] = dsnMatch;
    const endpoint = `https://${host}/api/${projectId}/store/?sentry_key=${publicKey}&sentry_version=7`;

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        platform: 'javascript',
        sdk: {
          name: 'custom-sentry-client',
          version: '1.0.0',
        },
      }),
    });
  } catch (err) {
    // Silently fail - don't want error tracking to cause errors
    console.error('[Sentry] Failed to send event:', err);
  }
}

async function logToAuditTrail(
  eventType: string,
  description: string,
  metadata: Record<string, unknown>
): Promise<void> {
  // This will be replaced with actual Supabase logging
  if (!IS_PRODUCTION) {
    console.log('[Audit]', { eventType, description, metadata });
  }
}

// Export for use across the app
export default {
  init: initSentry,
  setUser,
  setTags,
  setExtra,
  addBreadcrumb,
  captureException,
  captureMessage,
  startTransaction,
  withErrorTracking,
};
