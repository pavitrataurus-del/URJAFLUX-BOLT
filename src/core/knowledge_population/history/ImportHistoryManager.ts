import { ImportHistoryRecord, ImportResultStatus } from './ImportHistory';

export interface IHistorySummaryData {
  readonly totalImportsCount: number;
  readonly successfulImportsCount: number;
  readonly failedImportsCount: number;
  readonly cancelledImportsCount: number;
  readonly averageDurationMs: number;
  readonly totalPagesProcessed: number;
  readonly totalKnowledgeObjectsCreated: number;
}

export class ImportHistoryManager {
  private static instance: ImportHistoryManager | null = null;
  private readonly historyStore: ImportHistoryRecord[] = [];
  private readonly maxRecordsLimit = 5000;

  private constructor() {}

  public static getInstance(): ImportHistoryManager {
    if (!ImportHistoryManager.instance) {
      ImportHistoryManager.instance = new ImportHistoryManager();
    }
    return ImportHistoryManager.instance;
  }

  public recordHistory(record: ImportHistoryRecord): void {
    this.historyStore.unshift(record); // newest first
    if (this.historyStore.length > this.maxRecordsLimit) {
      this.historyStore.pop();
    }
  }

  public getHistoryByImportId(importId: string): ImportHistoryRecord | null {
    return this.historyStore.find((r) => r.importId === importId) || null;
  }

  public getHistoryByBookId(bookId: string): readonly ImportHistoryRecord[] {
    return Object.freeze(this.historyStore.filter((r) => r.bookId === bookId));
  }

  public getRecentHistory(limit = 50): readonly ImportHistoryRecord[] {
    return Object.freeze(this.historyStore.slice(0, limit));
  }

  public getHistoryByStatus(status: ImportResultStatus): readonly ImportHistoryRecord[] {
    return Object.freeze(this.historyStore.filter((r) => r.status === status));
  }

  public getHistorySummary(): IHistorySummaryData {
    const total = this.historyStore.length;
    let success = 0;
    let failed = 0;
    let cancelled = 0;
    let totalDuration = 0;
    let totalPages = 0;
    let totalObjects = 0;

    for (const item of this.historyStore) {
      if (item.status === 'SUCCESS') success++;
      else if (item.status === 'FAILED') failed++;
      else if (item.status === 'CANCELLED') cancelled++;

      totalDuration += item.durationMs;
      totalPages += item.statistics.pagesParsed;
      totalObjects += item.statistics.knowledgeObjects;
    }

    return Object.freeze({
      totalImportsCount: total,
      successfulImportsCount: success,
      failedImportsCount: failed,
      cancelledImportsCount: cancelled,
      averageDurationMs: total > 0 ? Math.round(totalDuration / total) : 0,
      totalPagesProcessed: totalPages,
      totalKnowledgeObjectsCreated: totalObjects
    });
  }

  public clearHistory(): void {
    this.historyStore.length = 0;
  }
}

export const historyManager = ImportHistoryManager.getInstance();
