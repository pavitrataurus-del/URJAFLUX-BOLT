import { structuredLogger } from '../telemetry/StructuredLogger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  retryableErrors?: Array<string | RegExp>;
  onRetry?: (attempt: number, error: Error, nextDelayMs: number) => void;
}

export class RetryManager {
  private static defaultOptions: Required<Omit<RetryOptions, 'onRetry' | 'retryableErrors'>> = {
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    backoffFactor: 2,
  };

  /**
   * Execute an asynchronous task with exponential backoff retry logic.
   */
  public static async executeWithRetry<T>(
    operationName: string,
    task: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const maxAttempts = options?.maxAttempts ?? RetryManager.defaultOptions.maxAttempts;
    const initialDelay = options?.initialDelayMs ?? RetryManager.defaultOptions.initialDelayMs;
    const maxDelay = options?.maxDelayMs ?? RetryManager.defaultOptions.maxDelayMs;
    const factor = options?.backoffFactor ?? RetryManager.defaultOptions.backoffFactor;

    let attempt = 1;
    let currentDelay = initialDelay;

    while (attempt <= maxAttempts) {
      try {
        return await task();
      } catch (error: any) {
        const isLastAttempt = attempt >= maxAttempts;

        if (isLastAttempt) {
          structuredLogger.error(
            'RetryManager',
            `Operation '${operationName}' failed permanently after ${maxAttempts} attempts.`,
            { attempt, error: error.message },
            error
          );
          throw error;
        }

        // Add randomized jitter to prevent thundering herd
        const jitter = Math.random() * 0.2 * currentDelay;
        const actualDelay = Math.min(maxDelay, currentDelay + jitter);

        structuredLogger.warn(
          'RetryManager',
          `Operation '${operationName}' failed (Attempt ${attempt}/${maxAttempts}). Retrying in ${Math.round(actualDelay)}ms...`,
          { error: error.message, nextDelayMs: Math.round(actualDelay) }
        );

        if (options?.onRetry) {
          options.onRetry(attempt, error, Math.round(actualDelay));
        }

        await new Promise((resolve) => setTimeout(resolve, actualDelay));

        attempt++;
        currentDelay *= factor;
      }
    }

    throw new Error(`Operation '${operationName}' failed after maximum retries.`);
  }
}
