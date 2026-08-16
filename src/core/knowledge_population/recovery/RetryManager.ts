import { RetryPolicy } from './RetryPolicy';
import { eventLogger } from '../monitoring/ImportEventLogger';

export interface IRetryRecordData {
  readonly retryId: string;
  readonly importId: string;
  readonly bookId: string;
  readonly attemptNumber: number;
  readonly delayMs: number;
  readonly reason: string;
  readonly timestamp: number;
  readonly success: boolean;
}

export interface IRetryMetricsData {
  readonly totalRetriesAttempted: number;
  readonly successfulRetries: number;
  readonly failedRetries: number;
  readonly averageDelayMs: number;
}

export class RetryManager {
  private static instance: RetryManager | null = null;
  private readonly defaultPolicy = RetryPolicy.defaultPolicy();
  private readonly retryHistories = new Map<string, IRetryRecordData[]>();

  private constructor() {}

  public static getInstance(): RetryManager {
    if (!RetryManager.instance) {
      RetryManager.instance = new RetryManager();
    }
    return RetryManager.instance;
  }

  public shouldRetry(importId: string, customPolicy?: RetryPolicy): boolean {
    const policy = customPolicy || this.defaultPolicy;
    const history = this.retryHistories.get(importId) || [];
    return policy.canRetry(history.length);
  }

  public getNextRetryDelay(importId: string, customPolicy?: RetryPolicy): number {
    const policy = customPolicy || this.defaultPolicy;
    const history = this.retryHistories.get(importId) || [];
    const attemptNumber = history.length + 1;
    return policy.calculateDelay(attemptNumber);
  }

  public recordRetryAttempt(
    importId: string,
    bookId: string,
    reason: string,
    customPolicy?: RetryPolicy
  ): IRetryRecordData {
    const policy = customPolicy || this.defaultPolicy;
    const history = this.retryHistories.get(importId) || [];
    const attemptNumber = history.length + 1;
    const delayMs = policy.calculateDelay(attemptNumber);

    const record: IRetryRecordData = Object.freeze({
      retryId: `rt_${importId}_${attemptNumber}_${Date.now()}`,
      importId,
      bookId,
      attemptNumber,
      delayMs,
      reason,
      timestamp: Date.now(),
      success: false
    });

    const updated = [...history, record];
    this.retryHistories.set(importId, updated);

    eventLogger.logEvent(
      'RETRY_STARTED',
      importId,
      bookId,
      `Retry attempt #${attemptNumber} scheduled after ${delayMs}ms delay. Reason: ${reason}`,
      undefined,
      { attemptNumber, delayMs, reason }
    );

    return record;
  }

  public markRetryResult(importId: string, retryId: string, success: boolean): void {
    const history = this.retryHistories.get(importId);
    if (!history) return;

    const idx = history.findIndex((r) => r.retryId === retryId);
    if (idx >= 0) {
      const updatedRecord = Object.freeze({ ...history[idx], success });
      const newHistory = [...history];
      newHistory[idx] = updatedRecord;
      this.retryHistories.set(importId, newHistory);

      if (success) {
        eventLogger.logEvent(
          'RETRY_COMPLETED',
          importId,
          history[idx].bookId,
          `Retry attempt #${history[idx].attemptNumber} succeeded!`,
          undefined,
          { retryId }
        );
      }
    }
  }

  public getRetryHistory(importId: string): readonly IRetryRecordData[] {
    return Object.freeze([...(this.retryHistories.get(importId) || [])]);
  }

  public getRetryMetrics(): IRetryMetricsData {
    let totalAttempts = 0;
    let successCount = 0;
    let totalDelay = 0;

    for (const list of this.retryHistories.values()) {
      for (const rec of list) {
        totalAttempts++;
        if (rec.success) successCount++;
        totalDelay += rec.delayMs;
      }
    }

    return Object.freeze({
      totalRetriesAttempted: totalAttempts,
      successfulRetries: successCount,
      failedRetries: totalAttempts - successCount,
      averageDelayMs: totalAttempts > 0 ? Math.round(totalDelay / totalAttempts) : 0
    });
  }

  public clear(importId?: string): void {
    if (importId) {
      this.retryHistories.delete(importId);
    } else {
      this.retryHistories.clear();
    }
  }
}

export const retryManager = RetryManager.getInstance();
