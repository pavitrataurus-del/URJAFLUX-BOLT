import { LogEntry, LogLevel } from '../types/ingestion.types';

export class IngestionLogger {
  private static instance: IngestionLogger;
  private logsRingBuffer: LogEntry[] = [];
  private readonly maxLogCapacity: number = 250;

  private constructor() {}

  public static getInstance(): IngestionLogger {
    if (!IngestionLogger.instance) {
      IngestionLogger.instance = new IngestionLogger();
    }
    return IngestionLogger.instance;
  }

  public trace(event: string, details: Record<string, unknown> = {}): void {
    if (process.env.NODE_ENV !== 'production') {
      this.appendLog('TRACE', event, details);
    }
  }

  public debug(event: string, details: Record<string, unknown> = {}): void {
    if (process.env.NODE_ENV !== 'production') {
      this.appendLog('DEBUG', event, details);
    }
  }

  public info(event: string, details: Record<string, unknown> = {}): void {
    this.appendLog('INFO', event, details);
  }

  public warn(event: string, details: Record<string, unknown> = {}): void {
    this.appendLog('WARN', event, details);
  }

  public error(event: string, details: Record<string, unknown> = {}): void {
    this.appendLog('ERROR', event, details);
  }

  public fatal(event: string, details: Record<string, unknown> = {}): void {
    this.appendLog('FATAL', event, details);
  }

  private appendLog(level: LogLevel, event: string, details: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      event,
      details
    };

    this.logsRingBuffer.push(entry);
    if (this.logsRingBuffer.length > this.maxLogCapacity) {
      this.logsRingBuffer.shift();
    }

    if (level === 'ERROR' || level === 'FATAL' || level === 'WARN') {
      console.warn(`[KnowledgeIngestion][${level}] ${event}`, details);
    }
  }

  public getRecentLogs(): readonly LogEntry[] {
    return [...this.logsRingBuffer];
  }

  public clearLogs(): void {
    this.logsRingBuffer = [];
  }
}

export const logger = IngestionLogger.getInstance();
