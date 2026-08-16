import { PipelineStage } from '../pipeline/PipelineStage';
import { PipelineContext } from '../pipeline/PipelineContext';
import { IPipelineMetricsData } from '../pipeline/PipelineMetrics';

export function generateExecutionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `kex-exec-${timestamp}-${randomPart}`;
}

export function generatePackageId(documentId: string): string {
  const timestamp = Date.now().toString(36);
  return `kpkg-${documentId}-${timestamp}`;
}

export function safeStageTransition(
  context: PipelineContext,
  targetStage: PipelineStage
): PipelineContext {
  context.throwIfCancelled();
  return context.withStage(targetStage);
}

export function calculateMemoryEstimate(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    try {
      return process.memoryUsage().heapUsed;
    } catch {
      return 0;
    }
  }
  return 0;
}

export function aggregateMetrics(
  metricsList: readonly IPipelineMetricsData[]
): {
  readonly totalPipelines: number;
  readonly successfulPipelines: number;
  readonly failedPipelines: number;
  readonly avgExecutionTimeMs: number;
  readonly totalObjectsExtracted: number;
} {
  if (metricsList.length === 0) {
    return {
      totalPipelines: 0,
      successfulPipelines: 0,
      failedPipelines: 0,
      avgExecutionTimeMs: 0,
      totalObjectsExtracted: 0
    };
  }

  let totalTime = 0;
  let totalObjects = 0;
  let failed = 0;
  let successful = 0;

  for (const m of metricsList) {
    totalTime += m.totalExecutionTimeMs;
    totalObjects += m.objectsProcessedCount;
    if (m.failedStage) {
      failed++;
    } else {
      successful++;
    }
  }

  return {
    totalPipelines: metricsList.length,
    successfulPipelines: successful,
    failedPipelines: failed,
    avgExecutionTimeMs: Math.round(totalTime / metricsList.length),
    totalObjectsExtracted: totalObjects
  };
}
