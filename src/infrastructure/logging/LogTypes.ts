export enum LogLevel {
  TRACE = "TRACE",
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | Record<string, any>;
  correlationId?: string;
  requestId?: string;
  workerId?: string;
  pipelineId?: string;
}

export interface ILogProvider {
  log(entry: LogEntry): void;
}
