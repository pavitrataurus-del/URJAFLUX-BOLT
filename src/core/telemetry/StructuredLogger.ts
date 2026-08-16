export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

export class StructuredLogger {
  private static instance: StructuredLogger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 500;
  private currentCorrelationId: string | null = null;
  private subscribers: Array<(entry: LogEntry) => void> = [];

  private constructor() {}

  public static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  public setCorrelationId(correlationId: string | null) {
    this.currentCorrelationId = correlationId;
  }

  public getCorrelationId(): string {
    if (!this.currentCorrelationId) {
      this.currentCorrelationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    return this.currentCorrelationId;
  }

  public subscribe(listener: (entry: LogEntry) => void): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== listener);
    };
  }

  public log(level: LogLevel, component: string, message: string, metadata?: Record<string, any>, error?: Error): LogEntry {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      correlationId: this.getCorrelationId(),
      metadata,
      stack: error?.stack,
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output with structured formatting
    const consoleMsg = `[${entry.timestamp}] [${level}] [${component}] [${entry.correlationId}]: ${message}`;
    if (level === 'ERROR' || level === 'FATAL') {
      console.error(consoleMsg, metadata || '', error || '');
    } else if (level === 'WARN') {
      console.warn(consoleMsg, metadata || '');
    } else if (level === 'INFO') {
      console.info(consoleMsg, metadata || '');
    } else {
      console.debug(consoleMsg, metadata || '');
    }

    this.subscribers.forEach((sub) => sub(entry));
    return entry;
  }

  public debug(component: string, message: string, metadata?: Record<string, any>) {
    return this.log('DEBUG', component, message, metadata);
  }

  public info(component: string, message: string, metadata?: Record<string, any>) {
    return this.log('INFO', component, message, metadata);
  }

  public warn(component: string, message: string, metadata?: Record<string, any>) {
    return this.log('WARN', component, message, metadata);
  }

  public error(component: string, message: string, metadata?: Record<string, any>, error?: Error) {
    return this.log('ERROR', component, message, metadata, error);
  }

  public fatal(component: string, message: string, metadata?: Record<string, any>, error?: Error) {
    return this.log('FATAL', component, message, metadata, error);
  }

  public getLogs(limit: number = 100, levelFilter?: LogLevel): LogEntry[] {
    let logs = [...this.logBuffer];
    if (levelFilter) {
      logs = logs.filter((l) => l.level === levelFilter);
    }
    return logs.slice(-limit).reverse();
  }

  public clearLogs() {
    this.logBuffer = [];
  }
}

export const structuredLogger = StructuredLogger.getInstance();
