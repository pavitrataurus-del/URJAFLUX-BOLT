export interface IPerformanceMetricsSnapshot {
  readonly averageImportSpeedMs: number;
  readonly objectsPerSecond: number;
  readonly pagesPerMinute: number;
  readonly validationPassRate: number;
  readonly repositoryWriteSpeedRecordsPerSec: number;
  readonly indexBuildSpeedEntriesPerSec: number;
  readonly totalDocumentsProcessed: number;
  readonly totalObjectsExtracted: number;
  readonly timestamp: number;
}

export class ImportPerformanceMetrics {
  private static instance: ImportPerformanceMetrics | null = null;

  private totalDocs = 0;
  private totalDurationMs = 0;
  private totalObjects = 0;
  private totalPages = 0;
  private totalValidated = 0;
  private totalInvalidated = 0;
  private totalRepoRecords = 0;
  private repoWriteTimeMs = 0;
  private totalIndexEntries = 0;
  private indexBuildTimeMs = 0;

  private constructor() {}

  public static getInstance(): ImportPerformanceMetrics {
    if (!ImportPerformanceMetrics.instance) {
      ImportPerformanceMetrics.instance = new ImportPerformanceMetrics();
    }
    return ImportPerformanceMetrics.instance;
  }

  public recordImportRun(data: {
    durationMs: number;
    pagesCount: number;
    objectsCount: number;
    validObjectsCount: number;
    invalidObjectsCount: number;
    repoRecordsCount: number;
    repoWriteDurationMs: number;
    indexEntriesCount: number;
    indexBuildDurationMs: number;
  }): void {
    this.totalDocs += 1;
    this.totalDurationMs += data.durationMs;
    this.totalPages += data.pagesCount;
    this.totalObjects += data.objectsCount;
    this.totalValidated += data.validObjectsCount;
    this.totalInvalidated += data.invalidObjectsCount;
    this.totalRepoRecords += data.repoRecordsCount;
    this.repoWriteTimeMs += data.repoWriteDurationMs;
    this.totalIndexEntries += data.indexEntriesCount;
    this.indexBuildTimeMs += data.indexBuildDurationMs;
  }

  public getSnapshot(): IPerformanceMetricsSnapshot {
    const totalSec = this.totalDurationMs > 0 ? this.totalDurationMs / 1000 : 0;
    const repoSec = this.repoWriteTimeMs > 0 ? this.repoWriteTimeMs / 1000 : 0;
    const indexSec = this.indexBuildTimeMs > 0 ? this.indexBuildTimeMs / 1000 : 0;
    const totalValidationAttempts = this.totalValidated + this.totalInvalidated;

    return Object.freeze({
      averageImportSpeedMs:
        this.totalDocs > 0 ? Math.round(this.totalDurationMs / this.totalDocs) : 0,
      objectsPerSecond:
        totalSec > 0 ? Number((this.totalObjects / totalSec).toFixed(1)) : 0,
      pagesPerMinute:
        totalSec > 0 ? Number(((this.totalPages / totalSec) * 60).toFixed(1)) : 0,
      validationPassRate:
        totalValidationAttempts > 0
          ? Number((this.totalValidated / totalValidationAttempts).toFixed(3))
          : 1.0,
      repositoryWriteSpeedRecordsPerSec:
        repoSec > 0 ? Number((this.totalRepoRecords / repoSec).toFixed(1)) : 0,
      indexBuildSpeedEntriesPerSec:
        indexSec > 0 ? Number((this.totalIndexEntries / indexSec).toFixed(1)) : 0,
      totalDocumentsProcessed: this.totalDocs,
      totalObjectsExtracted: this.totalObjects,
      timestamp: Date.now()
    });
  }

  public reset(): void {
    this.totalDocs = 0;
    this.totalDurationMs = 0;
    this.totalObjects = 0;
    this.totalPages = 0;
    this.totalValidated = 0;
    this.totalInvalidated = 0;
    this.totalRepoRecords = 0;
    this.repoWriteTimeMs = 0;
    this.totalIndexEntries = 0;
    this.indexBuildTimeMs = 0;
  }
}

export const performanceMetrics = ImportPerformanceMetrics.getInstance();
