import { structuredLogger } from './StructuredLogger';
import { metricsCollector } from './MetricsCollector';

export interface CapturedError {
  id: string;
  errorId: string; // e.g. ERR-A8C3F1B9
  message: string;
  stack?: string;
  componentStack?: string;
  source: 'UNHANDLED_PROMISE' | 'WINDOW_ERROR' | 'REACT_ERROR_BOUNDARY' | 'CAD_ENGINE' | 'API_FAILURE';
  timestamp: string;
  userContext?: {
    userId?: string;
    role?: string;
    tenantId?: string;
  };
}

export class GlobalErrorTracker {
  private static instance: GlobalErrorTracker;
  private capturedErrors: CapturedError[] = [];
  private subscribers: Array<(err: CapturedError) => void> = [];

  private constructor() {
    this.initGlobalListeners();
  }

  public static getInstance(): GlobalErrorTracker {
    if (!GlobalErrorTracker.instance) {
      GlobalErrorTracker.instance = new GlobalErrorTracker();
    }
    return GlobalErrorTracker.instance;
  }

  public captureError(
    error: Error | string,
    source: CapturedError['source'],
    componentStack?: string,
    userContext?: CapturedError['userContext']
  ): CapturedError {
    const rawMessage = typeof error === 'string' ? error : error.message || 'Unknown Runtime Exception';
    const rawStack = typeof error === 'string' ? undefined : error.stack;

    // Generate unique error correlation hash
    const hash = Array.from(rawMessage)
      .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      .toString(16)
      .replace('-', '9')
      .substring(0, 8)
      .toUpperCase();

    const errorId = `ERR-${hash.padStart(8, '0')}`;

    const captured: CapturedError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      errorId,
      message: rawMessage,
      stack: rawStack,
      componentStack,
      source,
      timestamp: new Date().toISOString(),
      userContext,
    };

    this.capturedErrors.push(captured);
    if (this.capturedErrors.length > 200) {
      this.capturedErrors.shift();
    }

    structuredLogger.error(
      'GlobalErrorTracker',
      `[${errorId}] ${source}: ${rawMessage}`,
      { errorId, source, componentStack },
      typeof error === 'string' ? new Error(error) : error
    );

    metricsCollector.recordMetric(`Error:${errorId}`, 'SYSTEM', 0, 'FAILURE', { errorId, source });

    this.notifySubscribers(captured);
    return captured;
  }

  public subscribe(listener: (err: CapturedError) => void): () => void {
    this.subscribers.push(listener);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== listener);
    };
  }

  public getErrors(limit = 50): CapturedError[] {
    return this.capturedErrors.slice(-limit).reverse();
  }

  private initGlobalListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.captureError(event.error || event.message, 'WINDOW_ERROR');
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason instanceof Error ? event.reason : String(event.reason);
      this.captureError(reason, 'UNHANDLED_PROMISE');
    });
  }

  private notifySubscribers(err: CapturedError) {
    this.subscribers.forEach((s) => s(err));
  }
}

export const globalErrorTracker = GlobalErrorTracker.getInstance();
