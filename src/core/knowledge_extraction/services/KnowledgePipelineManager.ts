import { ParsedDocument } from '../../knowledge_parsing/types/document.types';
import { IKnowledgeEngineConfig } from '../types/config.types';
import { createKnowledgeConfig } from '../config/knowledge.config';
import { KnowledgeExtractionPipeline } from '../pipeline/KnowledgeExtractionPipeline';
import { CancellationToken } from '../pipeline/PipelineContext';
import { PipelineResult } from '../pipeline/PipelineResult';
import { IPipelineMetricsData } from '../pipeline/PipelineMetrics';
import { PipelineEventListener, PipelineEvent } from '../pipeline/PipelineEvents';

export class KnowledgePipelineManager {
  private static instance: KnowledgePipelineManager;
  private readonly activeExecutions: Map<
    string,
    {
      cancellationToken: CancellationToken;
      getMetrics: () => IPipelineMetricsData;
    }
  > = new Map();

  private readonly completedResultsBuffer: PipelineResult[] = [];
  private readonly maxCompletedHistory = 100;
  private readonly globalListeners: PipelineEventListener[] = [];

  private constructor() {}

  public static getInstance(): KnowledgePipelineManager {
    if (!KnowledgePipelineManager.instance) {
      KnowledgePipelineManager.instance = new KnowledgePipelineManager();
    }
    return KnowledgePipelineManager.instance;
  }

  public addEventListener(listener: PipelineEventListener): () => void {
    if (!this.globalListeners) (this as any).globalListeners = [];
    this.globalListeners.push(listener);
    return () => {
      if (!this.globalListeners) return;
      const idx = this.globalListeners.indexOf(listener);
      if (idx >= 0) this.globalListeners.splice(idx, 1);
    };
  }

  public addListener(listener: PipelineEventListener): () => void {
    return this.addEventListener(listener);
  }

  public on(event: string | PipelineEventListener, listener?: PipelineEventListener): () => void {
    if (typeof event === 'function') return this.addEventListener(event);
    if (typeof listener === 'function') return this.addEventListener(listener);
    return () => {};
  }

  public emit(event: PipelineEvent | string, data?: any): void {
    if (typeof event === 'object' && event !== null && 'type' in event) {
      this.dispatchEvent(event as PipelineEvent);
    }
  }

  private dispatchEvent(event: PipelineEvent): void {
    if (!this.globalListeners) return;
    this.globalListeners.forEach((listener) => {
      try {
        listener(event);
      } catch {
        // Safe listener execution
      }
    });
  }

  public async startPipeline(
    document: ParsedDocument,
    partialConfig?: Partial<IKnowledgeEngineConfig>
  ): Promise<PipelineResult> {
    const config = createKnowledgeConfig(partialConfig);
    const cancellationToken = new CancellationToken();
    const pipeline = new KnowledgeExtractionPipeline();

    pipeline.addEventListener((evt) => this.dispatchEvent(evt));

    let executionId = '';

    const executionPromise = (async () => {
      const execIdListener = pipeline.addEventListener((evt) => {
        if (evt.type === 'PIPELINE_STARTED') {
          executionId = evt.executionId;
          this.activeExecutions.set(executionId, {
            cancellationToken,
            getMetrics: () => {
              // Get current status if available
              return evt.executionId ? { executionId: evt.executionId } as IPipelineMetricsData : ({} as IPipelineMetricsData);
            }
          });
        }
      });

      try {
        const result = await pipeline.execute(document, config, cancellationToken);

        if (result.executionId) {
          this.activeExecutions.delete(result.executionId);
          this.recordCompletedResult(result);
        }
        execIdListener();
        return result;
      } catch (err) {
        if (executionId) {
          this.activeExecutions.delete(executionId);
        }
        execIdListener();
        throw err;
      }
    })();

    return executionPromise;
  }

  public cancelPipeline(executionId: string, reason = 'Cancelled by manager'): boolean {
    const active = this.activeExecutions.get(executionId);
    if (active) {
      active.cancellationToken.cancel(reason);
      return true;
    }
    return false;
  }

  public getPipelineStatus(executionId: string): IPipelineMetricsData | undefined {
    const completed = this.completedResultsBuffer.find((r) => r.executionId === executionId);
    if (completed) {
      return completed.metrics;
    }
    const active = this.activeExecutions.get(executionId);
    if (active) {
      return active.getMetrics();
    }
    return undefined;
  }

  public getActivePipelines(): readonly IPipelineMetricsData[] {
    const list: IPipelineMetricsData[] = [];
    this.activeExecutions.forEach((val, key) => {
      list.push({
        executionId: key,
        currentStage: 'RUNNING' as unknown as import('../pipeline/PipelineStage').PipelineStage,
        completedStages: [],
        stageTimings: [],
        totalExecutionTimeMs: 0,
        peakMemoryEstimateBytes: 0,
        objectsProcessedCount: 0,
        nodesProcessedCount: 0,
        warningsCount: 0,
        errorsCount: 0,
        startedAt: Date.now()
      });
    });
    return list;
  }

  public getCompletedPipelines(): readonly PipelineResult[] {
    return [...this.completedResultsBuffer];
  }

  public clearHistory(): void {
    this.completedResultsBuffer.length = 0;
  }

  private recordCompletedResult(result: PipelineResult): void {
    this.completedResultsBuffer.unshift(result);
    if (this.completedResultsBuffer.length > this.maxCompletedHistory) {
      this.completedResultsBuffer.pop();
    }
  }
}

export const knowledgePipelineManager = KnowledgePipelineManager.getInstance();
