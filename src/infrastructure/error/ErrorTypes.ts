export enum ErrorCategory {
  SYSTEM = "SYSTEM",
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  CONFLICT = "CONFLICT",
  INTERNAL = "INTERNAL",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
  FATAL = "FATAL",
}

export enum RetryPolicy {
  NONE = "NONE",
  IMMEDIATE = "IMMEDIATE",
  EXPONENTIAL_BACKOFF = "EXPONENTIAL_BACKOFF",
}

export interface ErrorContext {
  correlationId?: string;
  requestId?: string;
  workerId?: string;
  pipelineId?: string;
  [key: string]: any;
}
