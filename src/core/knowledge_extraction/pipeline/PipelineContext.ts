import { ParsedDocument, BaseNode } from '../../knowledge_parsing/types/document.types';
import { IKnowledgeEngineConfig } from '../types/config.types';
import { KnowledgeObject } from '../models/KnowledgeObject';
import { KnowledgeRelationship } from '../models/KnowledgeRelationship';
import { KnowledgeEvidence } from '../models/KnowledgeEvidence';
import { PipelineStage } from './PipelineStage';
import { PipelineMetricsTracker, IPipelineMetricsData } from './PipelineMetrics';

export interface ICancellationToken {
  readonly isCancelled: boolean;
  readonly cancelReason?: string;
  cancel(reason?: string): void;
  onCancelled(callback: (reason: string) => void): () => void;
}

export class CancellationToken implements ICancellationToken {
  private _isCancelled = false;
  private _cancelReason?: string;
  private readonly listeners: Array<(reason: string) => void> = [];

  public get isCancelled(): boolean {
    return this._isCancelled;
  }

  public get cancelReason(): string | undefined {
    return this._cancelReason;
  }

  public cancel(reason = 'Operation cancelled by user'): void {
    if (this._isCancelled) return;
    this._isCancelled = true;
    this._cancelReason = reason;
    this.listeners.forEach((cb) => {
      try {
        cb(reason);
      } catch {
        // Safe callback execution
      }
    });
  }

  public onCancelled(callback: (reason: string) => void): () => void {
    this.listeners.push(callback);
    if (this._isCancelled && this._cancelReason) {
      callback(this._cancelReason);
    }
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }
}

export interface IPipelineWarning {
  readonly code: string;
  readonly message: string;
  readonly stage: PipelineStage;
  readonly timestamp: number;
  readonly details?: Record<string, unknown>;
}

export interface IPipelineError {
  readonly code: string;
  readonly message: string;
  readonly stage: PipelineStage;
  readonly isFatal: boolean;
  readonly timestamp: number;
  readonly cause?: unknown;
  readonly details?: Record<string, unknown>;
}

export interface IPipelineContextData {
  readonly executionId: string;
  readonly pipelineVersion: string;
  readonly document: ParsedDocument;
  readonly config: IKnowledgeEngineConfig;
  readonly cancellationToken: ICancellationToken;
  readonly createdAt: number;
  readonly currentStage: PipelineStage;
  readonly warnings: readonly IPipelineWarning[];
  readonly errors: readonly IPipelineError[];
  readonly intermediateObjects: readonly KnowledgeObject[];
  readonly intermediateRelationships: readonly KnowledgeRelationship[];
  readonly intermediateEvidence: readonly KnowledgeEvidence[];
  readonly collectedNodes: readonly BaseNode[];
  readonly sharedContext: ReadonlyMap<string, unknown>;
}

export class PipelineContext implements IPipelineContextData {
  public readonly executionId: string;
  public readonly pipelineVersion: string;
  public readonly document: ParsedDocument;
  public readonly config: IKnowledgeEngineConfig;
  public readonly cancellationToken: ICancellationToken;
  public readonly createdAt: number;
  public readonly currentStage: PipelineStage;
  public readonly warnings: readonly IPipelineWarning[];
  public readonly errors: readonly IPipelineError[];
  public readonly intermediateObjects: readonly KnowledgeObject[];
  public readonly intermediateRelationships: readonly KnowledgeRelationship[];
  public readonly intermediateEvidence: readonly KnowledgeEvidence[];
  public readonly collectedNodes: readonly BaseNode[];
  public readonly sharedContext: ReadonlyMap<string, unknown>;
  public readonly metricsTracker: PipelineMetricsTracker;

  constructor(
    data: IPipelineContextData,
    metricsTracker?: PipelineMetricsTracker
  ) {
    this.executionId = data.executionId;
    this.pipelineVersion = data.pipelineVersion;
    this.document = data.document;
    this.config = data.config;
    this.cancellationToken = data.cancellationToken;
    this.createdAt = data.createdAt;
    this.currentStage = data.currentStage;
    this.warnings = data.warnings;
    this.errors = data.errors;
    this.intermediateObjects = data.intermediateObjects;
    this.intermediateRelationships = data.intermediateRelationships;
    this.intermediateEvidence = data.intermediateEvidence;
    this.collectedNodes = data.collectedNodes;
    this.sharedContext = data.sharedContext;
    this.metricsTracker = metricsTracker || new PipelineMetricsTracker(data.executionId);
  }

  public get metrics(): IPipelineMetricsData {
    return this.metricsTracker.snapshot();
  }

  public throwIfCancelled(): void {
    if (this.cancellationToken.isCancelled) {
      throw new Error(`Pipeline execution cancelled: ${this.cancellationToken.cancelReason || 'Cancelled'}`);
    }
  }

  public withStage(stage: PipelineStage): PipelineContext {
    return new PipelineContext(
      {
        ...this.toData(),
        currentStage: stage
      },
      this.metricsTracker
    );
  }

  public addWarning(code: string, message: string, details?: Record<string, unknown>): PipelineContext {
    const warning: IPipelineWarning = {
      code,
      message,
      stage: this.currentStage,
      timestamp: Date.now(),
      details
    };
    this.metricsTracker.incrementWarnings(1);
    return new PipelineContext(
      {
        ...this.toData(),
        warnings: [...this.warnings, warning]
      },
      this.metricsTracker
    );
  }

  public addError(code: string, message: string, isFatal: boolean, cause?: unknown, details?: Record<string, unknown>): PipelineContext {
    const error: IPipelineError = {
      code,
      message,
      stage: this.currentStage,
      isFatal,
      timestamp: Date.now(),
      cause,
      details
    };
    this.metricsTracker.incrementErrors(1);
    return new PipelineContext(
      {
        ...this.toData(),
        errors: [...this.errors, error]
      },
      this.metricsTracker
    );
  }

  public addObjects(objects: readonly KnowledgeObject[]): PipelineContext {
    this.metricsTracker.incrementObjectsProcessed(objects.length);
    return new PipelineContext(
      {
        ...this.toData(),
        intermediateObjects: [...this.intermediateObjects, ...objects]
      },
      this.metricsTracker
    );
  }

  public addRelationships(relationships: readonly KnowledgeRelationship[]): PipelineContext {
    return new PipelineContext(
      {
        ...this.toData(),
        intermediateRelationships: [...this.intermediateRelationships, ...relationships]
      },
      this.metricsTracker
    );
  }

  public addEvidence(evidenceList: readonly KnowledgeEvidence[]): PipelineContext {
    return new PipelineContext(
      {
        ...this.toData(),
        intermediateEvidence: [...this.intermediateEvidence, ...evidenceList]
      },
      this.metricsTracker
    );
  }

  public setCollectedNodes(nodes: readonly BaseNode[]): PipelineContext {
    this.metricsTracker.incrementNodesProcessed(nodes.length);
    return new PipelineContext(
      {
        ...this.toData(),
        collectedNodes: nodes
      },
      this.metricsTracker
    );
  }

  public setShared(key: string, value: unknown): PipelineContext {
    const nextMap = new Map(this.sharedContext);
    nextMap.set(key, value);
    return new PipelineContext(
      {
        ...this.toData(),
        sharedContext: nextMap
      },
      this.metricsTracker
    );
  }

  private toData(): IPipelineContextData {
    return {
      executionId: this.executionId,
      pipelineVersion: this.pipelineVersion,
      document: this.document,
      config: this.config,
      cancellationToken: this.cancellationToken,
      createdAt: this.createdAt,
      currentStage: this.currentStage,
      warnings: this.warnings,
      errors: this.errors,
      intermediateObjects: this.intermediateObjects,
      intermediateRelationships: this.intermediateRelationships,
      intermediateEvidence: this.intermediateEvidence,
      collectedNodes: this.collectedNodes,
      sharedContext: this.sharedContext
    };
  }
}
