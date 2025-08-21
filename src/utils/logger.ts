type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  duration?: number;
  error?: string;
  stack?: string;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  environment: string;
  service: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProd = process.env.NODE_ENV === 'production';
  private service = 'nity-api';

  private formatLog(level: LogLevel, message: string, context?: LogContext): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: process.env.NODE_ENV || 'development',
      service: this.service
    };
  }

  private output(logEntry: LogEntry) {
    if (!this.isDevelopment && logEntry.level === 'debug') {
      return;
    }

    if (this.isProd) {
      // In production, output structured JSON logs
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, output human-readable logs
      const { timestamp, level, message, context } = logEntry;
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
      
      switch (level) {
        case 'debug':
          console.debug(logMessage);
          break;
        case 'info':
          console.info(logMessage);
          break;
        case 'warn':
          console.warn(logMessage);
          break;
        case 'error':
          console.error(logMessage);
          break;
      }
    }
  }

  debug(message: string, context?: LogContext) {
    const logEntry = this.formatLog('debug', message, context);
    this.output(logEntry);
  }

  info(message: string, context?: LogContext) {
    const logEntry = this.formatLog('info', message, context);
    this.output(logEntry);
  }

  warn(message: string, context?: LogContext) {
    const logEntry = this.formatLog('warn', message, context);
    this.output(logEntry);
  }

  error(message: string, context?: LogContext) {
    const logEntry = this.formatLog('error', message, context);
    this.output(logEntry);
  }

  // Specific logging methods for common scenarios
  apiRequest(method: string, url: string, context?: LogContext) {
    this.info(`${method} ${url}`, {
      type: 'api_request',
      method,
      url,
      ...context
    });
  }

  apiResponse(method: string, url: string, statusCode: number, duration: number, context?: LogContext) {
    const level = statusCode >= 400 ? 'error' : 'info';
    this[level](`${method} ${url} - ${statusCode}`, {
      type: 'api_response',
      method,
      url,
      statusCode,
      duration,
      ...context
    });
  }

  authError(message: string, context?: LogContext) {
    this.error(message, {
      type: 'auth_error',
      ...context
    });
  }

  dbOperation(operation: string, collection: string, duration?: number, context?: LogContext) {
    this.debug(`DB ${operation} on ${collection}`, {
      type: 'db_operation',
      operation,
      collection,
      duration,
      ...context
    });
  }

  dbError(operation: string, collection: string, error: string, context?: LogContext) {
    this.error(`DB ${operation} failed on ${collection}: ${error}`, {
      type: 'db_error',
      operation,
      collection,
      error,
      ...context
    });
  }

  fileOperation(operation: string, filename: string, size?: number, context?: LogContext) {
    this.info(`File ${operation}: ${filename}`, {
      type: 'file_operation',
      operation,
      filename,
      size,
      ...context
    });
  }

  fileError(operation: string, filename: string, error: string, context?: LogContext) {
    this.error(`File ${operation} failed for ${filename}: ${error}`, {
      type: 'file_error',
      operation,
      filename,
      error,
      ...context
    });
  }

  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext) {
    const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
    this[level](`Security event: ${event}`, {
      type: 'security_event',
      event,
      severity,
      ...context
    });
  }

  performance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    this[level](`Performance: ${operation} took ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      ...context
    });
  }
}

export const logger = new Logger();
