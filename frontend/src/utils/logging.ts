export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  component?: string;
  stack?: string;
}

export class ReactLoggingMiddleware {
  private static instance: ReactLoggingMiddleware;
  private logs: LogEntry[] = [];

  private constructor() {}

  public static getInstance(): ReactLoggingMiddleware {
    if (!ReactLoggingMiddleware.instance) {
      ReactLoggingMiddleware.instance = new ReactLoggingMiddleware();
    }
    return ReactLoggingMiddleware.instance;
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, component?: string, stack?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      stack
    };

    this.logs.push(logEntry);
    
    // Output to console for development
    const logMessage = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}${component ? ` (${component})` : ''}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage);
        if (stack) console.error(stack);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  public info(message: string, component?: string): void {
    this.log('info', message, component);
  }

  public warn(message: string, component?: string): void {
    this.log('warn', message, component);
  }

  public error(message: string, component?: string, error?: Error): void {
    this.log('error', message, component, error?.stack);
  }

  public debug(message: string, component?: string): void {
    this.log('debug', message, component);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = ReactLoggingMiddleware.getInstance();
