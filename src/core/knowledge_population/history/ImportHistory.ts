import { IImportStatisticsData } from '../reports/ImportStatistics';

export type ImportResultStatus = 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PARTIAL';

export interface IImportHistoryRecordData {
  readonly historyId: string;
  readonly importId: string;
  readonly bookId: string;
  readonly documentId: string;
  readonly version: string;
  readonly startedAt: number;
  readonly completedAt: number;
  readonly durationMs: number;
  readonly status: ImportResultStatus;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly statistics: IImportStatisticsData;
  readonly metadata?: Record<string, unknown>;
}

export class ImportHistoryRecord implements IImportHistoryRecordData {
  public readonly historyId: string;
  public readonly importId: string;
  public readonly bookId: string;
  public readonly documentId: string;
  public readonly version: string;
  public readonly startedAt: number;
  public readonly completedAt: number;
  public readonly durationMs: number;
  public readonly status: ImportResultStatus;
  public readonly warnings: readonly string[];
  public readonly errors: readonly string[];
  public readonly statistics: IImportStatisticsData;
  public readonly metadata?: Record<string, unknown>;

  constructor(data: Partial<IImportHistoryRecordData> & { importId: string; bookId: string }) {
    this.historyId = data.historyId || `hist_${data.importId}_${Date.now()}`;
    this.importId = data.importId;
    this.bookId = data.bookId;
    this.documentId = data.documentId || `doc_${data.bookId}`;
    this.version = data.version || '1.0.0-BUILD-018B';
    this.startedAt = data.startedAt ?? Date.now();
    this.completedAt = data.completedAt ?? Date.now();
    this.durationMs = data.durationMs ?? Math.max(0, this.completedAt - this.startedAt);
    this.status = data.status || 'SUCCESS';
    this.warnings = Object.freeze([...(data.warnings || [])]);
    this.errors = Object.freeze([...(data.errors || [])]);
    this.statistics = Object.freeze({
      booksImported: data.statistics?.booksImported ?? 1,
      pagesParsed: data.statistics?.pagesParsed ?? 0,
      knowledgeObjects: data.statistics?.knowledgeObjects ?? 0,
      canonicalEntities: data.statistics?.canonicalEntities ?? 0,
      relationships: data.statistics?.relationships ?? 0,
      duplicates: data.statistics?.duplicates ?? 0,
      conflicts: data.statistics?.conflicts ?? 0,
      warningsCount: data.statistics?.warningsCount ?? this.warnings.length,
      errorsCount: data.statistics?.errorsCount ?? this.errors.length,
      executionTimeMs: data.statistics?.executionTimeMs ?? this.durationMs
    });
    this.metadata = data.metadata ? Object.freeze({ ...data.metadata }) : undefined;

    Object.freeze(this);
  }

  public toJSON(): IImportHistoryRecordData {
    return {
      historyId: this.historyId,
      importId: this.importId,
      bookId: this.bookId,
      documentId: this.documentId,
      version: this.version,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      durationMs: this.durationMs,
      status: this.status,
      warnings: this.warnings,
      errors: this.errors,
      statistics: this.statistics,
      metadata: this.metadata
    };
  }
}
