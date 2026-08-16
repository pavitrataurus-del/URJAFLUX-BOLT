import { LogLevel, LogEntry, ILogProvider } from "./LogTypes";

class ConsoleLogProvider implements ILogProvider {
  public log(entry: LogEntry): void {
    const formatted = JSON.stringify(entry);
    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }
  }
}

export class Logger {
  private static instance: Logger;
  private providers: ILogProvider[] = [];
  private currentLevel: LogLevel = LogLevel.INFO;

  private constructor() {
    this.addProvider(new ConsoleLogProvider());
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  public addProvider(provider: ILogProvider): void {
    this.providers.push(provider);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    return levels.indexOf(level) >= levels.indexOf(this.currentLevel);
  }

  private writeLog(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? { message: error.message, stack: error.stack, name: error.name } : undefined,
      correlationId: context?.correlationId,
      requestId: context?.requestId,
      workerId: context?.workerId,
      pipelineId: context?.pipelineId,
    };

    this.providers.forEach(p => p.log(entry));
  }

  public trace(message: string, context?: Record<string, any>): void {
    this.writeLog(LogLevel.TRACE, message, context);
  }

  public debug(message: string, context?: Record<string, any>): void {
    this.writeLog(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context?: Record<string, any>): void {
    this.writeLog(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>, error?: Error): void {
    this.writeLog(LogLevel.WARN, message, context, error);
  }

  public error(message: string, context?: Record<string, any>, error?: Error): void {
    this.writeLog(LogLevel.ERROR, message, context, error);
  }

  public fatal(message: string, context?: Record<string, any>, error?: Error): void {
    this.writeLog(LogLevel.FATAL, message, context, error);
  }
}
