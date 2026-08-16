export interface IRetryPolicyConfig {
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly backoffMultiplier: number;
  readonly jitter: boolean;
}

export class RetryPolicy implements IRetryPolicyConfig {
  public readonly maxRetries: number;
  public readonly initialDelayMs: number;
  public readonly maxDelayMs: number;
  public readonly backoffMultiplier: number;
  public readonly jitter: boolean;

  constructor(config?: Partial<IRetryPolicyConfig>) {
    this.maxRetries = config?.maxRetries ?? 3;
    this.initialDelayMs = config?.initialDelayMs ?? 1000;
    this.maxDelayMs = config?.maxDelayMs ?? 30000;
    this.backoffMultiplier = config?.backoffMultiplier ?? 2.0;
    this.jitter = config?.jitter ?? true;
    Object.freeze(this);
  }

  public static defaultPolicy(): RetryPolicy {
    return new RetryPolicy();
  }

  public calculateDelay(retryCount: number): number {
    if (retryCount <= 0) return 0;

    let delay = this.initialDelayMs * Math.pow(this.backoffMultiplier, retryCount - 1);
    delay = Math.min(delay, this.maxDelayMs);

    if (this.jitter) {
      const jitterFactor = 0.8 + Math.random() * 0.4; // 80% to 120%
      delay = Math.round(delay * jitterFactor);
    }

    return Math.round(delay);
  }

  public canRetry(retryCount: number): boolean {
    return retryCount < this.maxRetries;
  }
}
