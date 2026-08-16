import { ImportStage } from '../orchestrator/ImportPipeline';

export interface IProgressTrackerData {
  readonly importId: string;
  readonly bookId: string;
  readonly currentStage: ImportStage;
  readonly currentChapter: string;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly pagesProcessed: number;
  readonly pagesRemaining: number;
  readonly startTime: number;
  readonly lastUpdateTime: number;
  readonly executionSpeedPagesPerSec: number;
  readonly estimatedCompletionTimeMs: number;
  readonly progressPercent: number;
}

export class ImportProgressTracker implements IProgressTrackerData {
  public readonly importId: string;
  public readonly bookId: string;
  public readonly currentStage: ImportStage;
  public readonly currentChapter: string;
  public readonly currentPage: number;
  public readonly totalPages: number;
  public readonly pagesProcessed: number;
  public readonly pagesRemaining: number;
  public readonly startTime: number;
  public readonly lastUpdateTime: number;
  public readonly executionSpeedPagesPerSec: number;
  public readonly estimatedCompletionTimeMs: number;
  public readonly progressPercent: number;

  constructor(data: Partial<IProgressTrackerData> & { importId: string; bookId: string }) {
    this.importId = data.importId;
    this.bookId = data.bookId;
    this.currentStage = data.currentStage || 'REGISTER_DOCUMENT';
    this.currentChapter = data.currentChapter || 'Chapter 1';
    this.currentPage = data.currentPage ?? 0;
    this.totalPages = data.totalPages ?? 1;
    this.pagesProcessed = data.pagesProcessed ?? 0;
    this.pagesRemaining = Math.max(0, this.totalPages - this.pagesProcessed);
    this.startTime = data.startTime ?? Date.now();
    this.lastUpdateTime = data.lastUpdateTime ?? Date.now();

    const elapsedSec = (this.lastUpdateTime - this.startTime) / 1000;
    this.executionSpeedPagesPerSec =
      elapsedSec > 0 ? Number((this.pagesProcessed / elapsedSec).toFixed(2)) : 0;

    this.estimatedCompletionTimeMs =
      this.executionSpeedPagesPerSec > 0
        ? Math.round((this.pagesRemaining / this.executionSpeedPagesPerSec) * 1000)
        : 0;

    this.progressPercent =
      this.totalPages > 0
        ? Number(Math.min(100, Math.max(0, (this.pagesProcessed / this.totalPages) * 100)).toFixed(1))
        : 0;

    Object.freeze(this);
  }

  public updateStage(stage: ImportStage): ImportProgressTracker {
    return new ImportProgressTracker({
      ...this.toJSON(),
      currentStage: stage,
      lastUpdateTime: Date.now()
    });
  }

  public updatePageProgress(
    currentPage: number,
    totalPages?: number,
    currentChapter?: string
  ): ImportProgressTracker {
    const total = totalPages !== undefined ? totalPages : this.totalPages;
    const processed = Math.min(currentPage, total);
    return new ImportProgressTracker({
      ...this.toJSON(),
      currentPage,
      totalPages: total,
      pagesProcessed: processed,
      currentChapter: currentChapter || this.currentChapter,
      lastUpdateTime: Date.now()
    });
  }

  public toJSON(): IProgressTrackerData {
    return {
      importId: this.importId,
      bookId: this.bookId,
      currentStage: this.currentStage,
      currentChapter: this.currentChapter,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      pagesProcessed: this.pagesProcessed,
      pagesRemaining: this.pagesRemaining,
      startTime: this.startTime,
      lastUpdateTime: this.lastUpdateTime,
      executionSpeedPagesPerSec: this.executionSpeedPagesPerSec,
      estimatedCompletionTimeMs: this.estimatedCompletionTimeMs,
      progressPercent: this.progressPercent
    };
  }
}
