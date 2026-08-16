import { ErrorCategory, ErrorSeverity, RetryPolicy, ErrorContext } from "./ErrorTypes";

export class EnterpriseError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly retryPolicy: RetryPolicy;
  public readonly context: ErrorContext;
  public readonly rootCause?: Error;
  public readonly timestamp: number;

  constructor(
    message: string,
    options: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      retryPolicy?: RetryPolicy;
      context?: ErrorContext;
      rootCause?: Error;
    } = {}
  ) {
    super(message);
    this.name = "EnterpriseError";
    this.category = options.category || ErrorCategory.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.MEDIUM;
    this.retryPolicy = options.retryPolicy || RetryPolicy.NONE;
    this.context = options.context || {};
    this.rootCause = options.rootCause;
    this.timestamp = Date.now();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      retryPolicy: this.retryPolicy,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
      rootCause: this.rootCause ? this.rootCause.message : undefined,
    };
  }
}
