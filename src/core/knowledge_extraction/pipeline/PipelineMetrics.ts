import { PipelineStage } from './PipelineStage';

export interface IPipelineStageTiming {
  readonly stage: PipelineStage;
  readonly startTime: number;
  readonly endTime?: number;
  readonly durationMs?: number;
  readonly status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  readonly error?: string;
}

export interface IPipelineMetricsData {
  readonly executionId: string;
  readonly currentStage: PipelineStage;
  readonly completedStages: readonly PipelineStage[];
  readonly failedStage?: PipelineStage;
  readonly stageTimings: readonly IPipelineStageTiming[];
  readonly totalExecutionTimeMs: number;
  readonly peakMemoryEstimateBytes: number;
  readonly objectsProcessedCount: number;
  readonly nodesProcessedCount: number;
  readonly warningsCount: number;
  readonly errorsCount: number;
  readonly startedAt: number;
  readonly completedAt?: number;
}

export class PipelineMetricsTracker {
  private readonly executionId: string;
  private currentStage: PipelineStage = PipelineStage.INITIALIZED;
  private readonly completedStagesList: PipelineStage[] = [];
  private failedStage?: PipelineStage;
  private readonly stageTimingsMap: Map<PipelineStage, IPipelineStageTiming> = new Map();
  private readonly startedAt: number;
  private completedAt?: number;
  private objectsProcessedCount = 0;
  private nodesProcessedCount = 0;
  private warningsCount = 0;
  private errorsCount = 0;
  private peakMemoryEstimateBytes = 0;

  constructor(executionId: string) {
    this.executionId = executionId;
    this.startedAt = Date.now();
    this.updateMemoryEstimate();
  }

  public startStage(stage: PipelineStage): void {
    this.currentStage = stage;
    this.stageTimingsMap.set(stage, {
      stage,
      startTime: Date.now(),
      status: 'RUNNING'
    });
    this.updateMemoryEstimate();
  }

  public completeStage(stage: PipelineStage): void {
    const existing = this.stageTimingsMap.get(stage);
    const now = Date.now();
    const startTime = existing ? existing.startTime : now;
    const durationMs = now - startTime;

    this.stageTimingsMap.set(stage, {
      stage,
      startTime,
      endTime: now,
      durationMs,
      status: 'COMPLETED'
    });

    if (!this.completedStagesList.includes(stage)) {
      this.completedStagesList.push(stage);
    }
    this.updateMemoryEstimate();
  }

  public failStage(stage: PipelineStage, errorMsg: string): void {
    const existing = this.stageTimingsMap.get(stage);
    const now = Date.now();
    const startTime = existing ? existing.startTime : now;
    const durationMs = now - startTime;

    this.stageTimingsMap.set(stage, {
      stage,
      startTime,
      endTime: now,
      durationMs,
      status: 'FAILED',
      error: errorMsg
    });

    this.failedStage = stage;
    this.completedAt = now;
    this.updateMemoryEstimate();
  }

  public incrementObjectsProcessed(count = 1): void {
    this.objectsProcessedCount += count;
  }

  public incrementNodesProcessed(count = 1): void {
    this.nodesProcessedCount += count;
  }

  public incrementWarnings(count = 1): void {
    this.warningsCount += count;
  }

  public incrementErrors(count = 1): void {
    this.errorsCount += count;
  }

  public finish(finalStage: PipelineStage = PipelineStage.COMPLETED): void {
    this.currentStage = finalStage;
    this.completedAt = Date.now();
    this.updateMemoryEstimate();
  }

  private updateMemoryEstimate(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      try {
        const mem = process.memoryUsage();
        if (mem.heapUsed > this.peakMemoryEstimateBytes) {
          this.peakMemoryEstimateBytes = mem.heapUsed;
        }
      } catch {
        // Fallback if memoryUsage fails
      }
    }
  }

  public snapshot(): IPipelineMetricsData {
    const now = Date.now();
    const endTime = this.completedAt || now;
    const stageTimings: IPipelineStageTiming[] = Array.from(this.stageTimingsMap.values());

    return {
      executionId: this.executionId,
      currentStage: this.currentStage,
      completedStages: [...this.completedStagesList],
      failedStage: this.failedStage,
      stageTimings,
      totalExecutionTimeMs: endTime - this.startedAt,
      peakMemoryEstimateBytes: this.peakMemoryEstimateBytes,
      objectsProcessedCount: this.objectsProcessedCount,
      nodesProcessedCount: this.nodesProcessedCount,
      warningsCount: this.warningsCount,
      errorsCount: this.errorsCount,
      startedAt: this.startedAt,
      completedAt: this.completedAt
    };
  }
}
