/**
 * Structured Logging Utility
 * Replaces console.log/warn/error statements with production-safe logging
 */

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private isDevelopment = process.env.NODE_ENV === 'development';

  private createEntry(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context
    };
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string) {
    const entry = this.createEntry(level, message, data, context);
    this.logs.push(entry);

    // In development, also log to console for debugging
    if (this.isDevelopment) {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
      if (data) {
        console.log(prefix, message, data);
      } else {
        console.log(prefix, message);
      }
    }

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  /**
   * Log informational message
   */
  info(message: string, data?: unknown, context?: string) {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown, context?: string) {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: string) {
    const errorData = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;
    this.log(LogLevel.ERROR, message, errorData, context);
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, data?: unknown, context?: string) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, data, context);
    }
  }

  /**
   * Get all logs (for debugging/reporting)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
export const logger = new Logger();
