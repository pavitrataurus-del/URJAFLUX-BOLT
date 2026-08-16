import { ImportStage } from './ImportPipeline';
import { ImportReport, IImportReportData } from '../reports/ImportReport';

export interface IImportResultData {
  readonly importId: string;
  readonly bookId: string;
  readonly documentId: string;
  readonly success: boolean;
  readonly stage: ImportStage;
  readonly report: IImportReportData;
  readonly executionTimeMs: number;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly completedAt: number;
}

export class ImportResult implements IImportResultData {
  public readonly importId: string;
  public readonly bookId: string;
  public readonly documentId: string;
  public readonly success: boolean;
  public readonly stage: ImportStage;
  public readonly report: ImportReport;
  public readonly executionTimeMs: number;
  public readonly warnings: readonly string[];
  public readonly errors: readonly string[];
  public readonly completedAt: number;

  constructor(data: {
    importId: string;
    bookId: string;
    documentId: string;
    success: boolean;
    stage: ImportStage;
    report: ImportReport;
    executionTimeMs: number;
    warnings?: readonly string[];
    errors?: readonly string[];
    completedAt?: number;
  }) {
    this.importId = data.importId;
    this.bookId = data.bookId;
    this.documentId = data.documentId;
    this.success = data.success;
    this.stage = data.stage;
    this.report = data.report;
    this.executionTimeMs = data.executionTimeMs;
    this.warnings = Object.freeze([...(data.warnings || [])]);
    this.errors = Object.freeze([...(data.errors || [])]);
    this.completedAt = data.completedAt ?? Date.now();
    Object.freeze(this);
  }

  public toJSON(): IImportResultData {
    return {
      importId: this.importId,
      bookId: this.bookId,
      documentId: this.documentId,
      success: this.success,
      stage: this.stage,
      report: this.report.toJSON(),
      executionTimeMs: this.executionTimeMs,
      warnings: this.warnings,
      errors: this.errors,
      completedAt: this.completedAt
    };
  }
}
