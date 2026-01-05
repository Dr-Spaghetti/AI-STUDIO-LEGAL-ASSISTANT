type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getMinLogLevel = (): number => {
  const env = import.meta.env.MODE;
  return env === 'production' ? LOG_LEVELS.info : LOG_LEVELS.debug;
};

const formatLogEntry = (entry: LogEntry): string => {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.context ? `[${entry.context}]` : '',
    entry.message,
  ].filter(Boolean);

  return parts.join(' ');
};

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= getMinLogLevel();
};

const createLogEntry = (
  level: LogLevel,
  message: string,
  data?: unknown,
  context?: string
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  context,
  data,
});

const logToConsole = (entry: LogEntry): void => {
  const formatted = formatLogEntry(entry);
  const consoleMethod = entry.level === 'debug' ? 'log' : entry.level;

  if (entry.data !== undefined) {
    console[consoleMethod](formatted, entry.data);
  } else {
    console[consoleMethod](formatted);
  }
};

export const logger = {
  debug: (message: string, data?: unknown, context?: string): void => {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', message, data, context);
    logToConsole(entry);
  },

  info: (message: string, data?: unknown, context?: string): void => {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, data, context);
    logToConsole(entry);
  },

  warn: (message: string, data?: unknown, context?: string): void => {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, data, context);
    logToConsole(entry);
  },

  error: (message: string, error?: unknown, context?: string): void => {
    if (!shouldLog('error')) return;
    const entry = createLogEntry('error', message, error, context);
    logToConsole(entry);

    if (error instanceof Error && import.meta.env.MODE !== 'production') {
      console.error(error.stack);
    }
  },
};

export default logger;
