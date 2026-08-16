import { ImportStage } from '../orchestrator/ImportPipeline';

export interface ICheckpointData {
  readonly checkpointId: string;
  readonly importId: string;
  readonly bookId: string;
  readonly currentStage: ImportStage;
  readonly currentChapter: string;
  readonly currentPage: number;
  readonly timestamp: number;
  readonly processedObjectCounts: Record<string, number>;
  readonly repositoryCommitState: {
    readonly isCommitted: boolean;
    readonly transactionId?: string;
    readonly recordCount: number;
  };
  readonly metadata?: Record<string, unknown>;
}

export class ImportCheckpoint implements ICheckpointData {
  public readonly checkpointId: string;
  public readonly importId: string;
  public readonly bookId: string;
  public readonly currentStage: ImportStage;
  public readonly currentChapter: string;
  public readonly currentPage: number;
  public readonly timestamp: number;
  public readonly processedObjectCounts: Record<string, number>;
  public readonly repositoryCommitState: {
    readonly isCommitted: boolean;
    readonly transactionId?: string;
    readonly recordCount: number;
  };
  public readonly metadata?: Record<string, unknown>;

  constructor(data: Partial<ICheckpointData> & { importId: string; bookId: string; currentStage: ImportStage }) {
    this.checkpointId =
      data.checkpointId || `chk_${data.importId}_${data.currentStage}_${Date.now()}`;
    this.importId = data.importId;
    this.bookId = data.bookId;
    this.currentStage = data.currentStage;
    this.currentChapter = data.currentChapter || 'Chapter 1';
    this.currentPage = data.currentPage ?? 1;
    this.timestamp = data.timestamp ?? Date.now();
    this.processedObjectCounts = Object.freeze({ ...(data.processedObjectCounts || {}) });
    this.repositoryCommitState = Object.freeze({
      isCommitted: data.repositoryCommitState?.isCommitted ?? false,
      transactionId: data.repositoryCommitState?.transactionId,
      recordCount: data.repositoryCommitState?.recordCount ?? 0
    });
    this.metadata = data.metadata ? Object.freeze({ ...data.metadata }) : undefined;

    Object.freeze(this);
  }

  public toJSON(): ICheckpointData {
    return {
      checkpointId: this.checkpointId,
      importId: this.importId,
      bookId: this.bookId,
      currentStage: this.currentStage,
      currentChapter: this.currentChapter,
      currentPage: this.currentPage,
      timestamp: this.timestamp,
      processedObjectCounts: this.processedObjectCounts,
      repositoryCommitState: this.repositoryCommitState,
      metadata: this.metadata
    };
  }
}
