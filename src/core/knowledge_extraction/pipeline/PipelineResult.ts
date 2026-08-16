import { KnowledgePackage } from '../models/KnowledgePackage';
import { IPipelineMetricsData } from './PipelineMetrics';
import { IPipelineWarning, IPipelineError } from './PipelineContext';

export interface IPipelineResultData {
  readonly success: boolean;
  readonly executionId: string;
  readonly knowledgePackage?: KnowledgePackage;
  readonly metrics: IPipelineMetricsData;
  readonly warnings: readonly IPipelineWarning[];
  readonly recoverableErrors: readonly IPipelineError[];
  readonly fatalErrors: readonly IPipelineError[];
  readonly executionTimeMs: number;
  readonly pipelineVersion: string;
  readonly completedAt: number;
}

export class PipelineResult implements IPipelineResultData {
  public readonly success: boolean;
  public readonly executionId: string;
  public readonly knowledgePackage?: KnowledgePackage;
  public readonly metrics: IPipelineMetricsData;
  public readonly warnings: readonly IPipelineWarning[];
  public readonly recoverableErrors: readonly IPipelineError[];
  public readonly fatalErrors: readonly IPipelineError[];
  public readonly executionTimeMs: number;
  public readonly pipelineVersion: string;
  public readonly completedAt: number;

  constructor(data: IPipelineResultData) {
    this.success = data.success;
    this.executionId = data.executionId;
    this.knowledgePackage = data.knowledgePackage;
    this.metrics = data.metrics;
    this.warnings = data.warnings;
    this.recoverableErrors = data.recoverableErrors;
    this.fatalErrors = data.fatalErrors;
    this.executionTimeMs = data.executionTimeMs;
    this.pipelineVersion = data.pipelineVersion;
    this.completedAt = data.completedAt;
  }

  public toJSON(): IPipelineResultData {
    return {
      success: this.success,
      executionId: this.executionId,
      knowledgePackage: this.knowledgePackage ? this.knowledgePackage.toJSON() as unknown as KnowledgePackage : undefined,
      metrics: this.metrics,
      warnings: this.warnings,
      recoverableErrors: this.recoverableErrors,
      fatalErrors: this.fatalErrors,
      executionTimeMs: this.executionTimeMs,
      pipelineVersion: this.pipelineVersion,
      completedAt: this.completedAt
    };
  }
}
