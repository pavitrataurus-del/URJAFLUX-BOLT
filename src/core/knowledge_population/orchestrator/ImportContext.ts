import { ImportStage, ImportPipeline } from './ImportPipeline';

export interface IImportContextData {
  readonly importId: string;
  readonly bookId: string;
  readonly documentId: string;
  readonly version: string;
  readonly currentStage: ImportStage;
  readonly progress: number;
  readonly stageTimings: Record<string, number>;
  readonly stageCounts: Record<string, number>;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly metadata: Record<string, unknown>;
}

export class ImportContext implements IImportContextData {
  public readonly importId: string;
  public readonly bookId: string;
  public readonly documentId: string;
  public readonly version: string;
  public readonly currentStage: ImportStage;
  public readonly progress: number;
  public readonly stageTimings: Record<string, number>;
  public readonly stageCounts: Record<string, number>;
  public readonly warnings: readonly string[];
  public readonly errors: readonly string[];
  public readonly createdAt: number;
  public readonly updatedAt: number;
  public readonly metadata: Record<string, unknown>;

  constructor(data: Partial<IImportContextData> & { importId: string; bookId: string }) {
    this.importId = data.importId;
    this.bookId = data.bookId;
    this.documentId = data.documentId || `doc_${data.bookId}`;
    this.version = data.version || '1.0.0-BUILD-018A';
    this.currentStage = data.currentStage || 'REGISTER_DOCUMENT';
    this.progress = data.progress ?? ImportPipeline.getStageProgress(this.currentStage);
    this.stageTimings = Object.freeze({ ...(data.stageTimings || {}) });
    this.stageCounts = Object.freeze({ ...(data.stageCounts || {}) });
    this.warnings = Object.freeze([...(data.warnings || [])]);
    this.errors = Object.freeze([...(data.errors || [])]);
    this.createdAt = data.createdAt ?? Date.now();
    this.updatedAt = data.updatedAt ?? Date.now();
    this.metadata = Object.freeze({ ...(data.metadata || {}) });
    Object.freeze(this);
  }

  public setStage(stage: ImportStage, progress?: number): ImportContext {
    return new ImportContext({
      ...this.toJSON(),
      currentStage: stage,
      progress: progress ?? ImportPipeline.getStageProgress(stage),
      updatedAt: Date.now()
    });
  }

  public recordStageTiming(stage: string, durationMs: number): ImportContext {
    return new ImportContext({
      ...this.toJSON(),
      stageTimings: {
        ...this.stageTimings,
        [stage]: durationMs
      },
      updatedAt: Date.now()
    });
  }

  public setStageCount(metricName: string, count: number): ImportContext {
    return new ImportContext({
      ...this.toJSON(),
      stageCounts: {
        ...this.stageCounts,
        [metricName]: count
      },
      updatedAt: Date.now()
    });
  }

  public addWarning(warning: string): ImportContext {
    return new ImportContext({
      ...this.toJSON(),
      warnings: [...this.warnings, warning],
      updatedAt: Date.now()
    });
  }

  public addError(error: string): ImportContext {
    return new ImportContext({
      ...this.toJSON(),
      errors: [...this.errors, error],
      updatedAt: Date.now()
    });
  }

  public setMetadata(key: string, value: unknown): ImportContext {
    return new ImportContext({
      ...this.toJSON(),
      metadata: {
        ...this.metadata,
        [key]: value
      },
      updatedAt: Date.now()
    });
  }

  public toJSON(): IImportContextData {
    return {
      importId: this.importId,
      bookId: this.bookId,
      documentId: this.documentId,
      version: this.version,
      currentStage: this.currentStage,
      progress: this.progress,
      stageTimings: this.stageTimings,
      stageCounts: this.stageCounts,
      warnings: this.warnings,
      errors: this.errors,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }
}
