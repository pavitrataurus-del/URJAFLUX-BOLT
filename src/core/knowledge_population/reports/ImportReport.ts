import { ImportStatistics, IImportStatisticsData } from './ImportStatistics';
import { ImportWarnings, IImportWarningsCollectionData } from './ImportWarnings';

export interface IImportReportData {
  readonly importId: string;
  readonly bookId: string;
  readonly documentId: string;
  readonly status: string;
  readonly statistics: IImportStatisticsData;
  readonly warnings: IImportWarningsCollectionData;
  readonly errors: readonly string[];
  readonly executionTime: number;
  readonly completedAt: number;
  readonly summary: string;
}

export class ImportReport implements IImportReportData {
  public readonly importId: string;
  public readonly bookId: string;
  public readonly documentId: string;
  public readonly status: string;
  public readonly statistics: ImportStatistics;
  public readonly warnings: ImportWarnings;
  public readonly errors: readonly string[];
  public readonly executionTime: number;
  public readonly completedAt: number;
  public readonly summary: string;

  constructor(data: {
    importId: string;
    bookId: string;
    documentId: string;
    status: string;
    statistics: ImportStatistics;
    warnings: ImportWarnings;
    errors?: readonly string[];
    executionTime: number;
    completedAt?: number;
    summary?: string;
  }) {
    this.importId = data.importId;
    this.bookId = data.bookId;
    this.documentId = data.documentId;
    this.status = data.status;
    this.statistics = data.statistics;
    this.warnings = data.warnings;
    this.errors = Object.freeze([...(data.errors || [])]);
    this.executionTime = data.executionTime;
    this.completedAt = data.completedAt ?? Date.now();
    this.summary =
      data.summary ||
      `Import ${data.importId} for Book ${data.bookId} (${data.status}). ${data.statistics.knowledgeObjects} objects, ${data.statistics.canonicalEntities} entities persisted.`;
    Object.freeze(this);
  }

  public toJSON(): IImportReportData {
    return {
      importId: this.importId,
      bookId: this.bookId,
      documentId: this.documentId,
      status: this.status,
      statistics: this.statistics.toJSON(),
      warnings: this.warnings.toJSON(),
      errors: this.errors,
      executionTime: this.executionTime,
      completedAt: this.completedAt,
      summary: this.summary
    };
  }
}
