import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  stack?: string;
  package?: string;
}

export class LoggingMiddleware {
  private static instance: LoggingMiddleware;
  private logs: LogEntry[] = [];

  private constructor() {}

  public static getInstance(): LoggingMiddleware {
    if (!LoggingMiddleware.instance) {
      LoggingMiddleware.instance = new LoggingMiddleware();
    }
    return LoggingMiddleware.instance;
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, packageName?: string, stack?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      package: packageName,
      stack
    };

    this.logs.push(logEntry);
    
    // Output to console for development
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}${packageName ? ` (${packageName})` : ''}`;
      console.log(logMessage);
      if (stack) {
        console.log(stack);
      }
    }
  }

  public info(message: string, packageName?: string): void {
    this.log('info', message, packageName);
  }

  public warn(message: string, packageName?: string): void {
    this.log('warn', message, packageName);
  }

  public error(message: string, packageName?: string, stack?: string): void {
    this.log('error', message, packageName, stack);
  }

  public debug(message: string, packageName?: string): void {
    this.log('debug', message, packageName);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  // Express middleware function for HTTP request/response logging
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const start = Date.now();
      
      this.info(`${req.method} ${req.path} - Request started`, 'HTTP');
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const message = `${req.method} ${req.path} - ${statusCode} - ${duration}ms`;
        
        if (statusCode >= 400) {
          this.error(message, 'HTTP');
        } else {
          this.info(message, 'HTTP');
        }
      });

      next();
    };
  }
}

// Export singleton instance
export const logger = LoggingMiddleware.getInstance();
