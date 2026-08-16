import { KnowledgeImportOrchestrator, IOrchestratorOptions } from '../orchestrator/KnowledgeImportOrchestrator';
import { ImportResult } from '../orchestrator/ImportResult';
import { ImportJob, JobPriority } from '../jobs/ImportJob';
import { ImportQueue, IQueueStateData } from '../jobs/ImportQueue';
import { ImportScheduler } from '../jobs/ImportScheduler';
import { ImportStatistics } from '../reports/ImportStatistics';
import { KnowledgeRepositoryService } from '../../knowledge_extraction/services/KnowledgeRepositoryService';

export interface IBatchImportItem {
  readonly file: File | Uint8Array;
  readonly fileName: string;
  readonly bookId: string;
  readonly priority?: JobPriority;
  readonly options?: IOrchestratorOptions;
}

export class KnowledgePopulationService {
  private static instance: KnowledgePopulationService | null = null;

  private readonly orchestrator: KnowledgeImportOrchestrator;
  private readonly queue: ImportQueue;
  private readonly scheduler: ImportScheduler;
  private readonly repositoryService: KnowledgeRepositoryService;

  private constructor() {
    // Proactively register instance before sub-services instantiate to prevent circular getInstance loops
    if (!KnowledgePopulationService.instance) {
      KnowledgePopulationService.instance = this;
    }
    this.orchestrator = new KnowledgeImportOrchestrator();
    this.queue = new ImportQueue();
    this.repositoryService = KnowledgeRepositoryService.getInstance();

    this.scheduler = new ImportScheduler(
      this.queue,
      async (job: ImportJob): Promise<ImportResult> => {
        return this.orchestrator.orchestrateImport(
          job.file,
          job.fileName,
          job.bookId
        );
      }
    );
  }

  public static getInstance(): KnowledgePopulationService {
    if (!KnowledgePopulationService.instance) {
      KnowledgePopulationService.instance = new KnowledgePopulationService();
    }
    return KnowledgePopulationService.instance;
  }

  public static resetInstance(): void {
    KnowledgePopulationService.instance = null;
  }

  public async importDocument(
    file: File | Uint8Array,
    fileName: string,
    bookId: string,
    priority: JobPriority = 'MEDIUM',
    options?: IOrchestratorOptions
  ): Promise<ImportResult> {
    const job = new ImportJob({
      bookId,
      fileName,
      file,
      priority
    });

    if (this.queue) {
      this.queue.enqueue(job);
    }
    
    // Execute job directly or via scheduler queue runner
    return new Promise<ImportResult>((resolve, reject) => {
      const removeListener = (this.queue && typeof this.queue.addListener === 'function')
        ? this.queue.addListener((event) => {
            if (event.job?.jobId === job.jobId) {
              if (event.job.status === 'COMPLETED' && event.job.result) {
                removeListener();
                resolve(event.job.result);
              } else if (event.job.status === 'FAILED') {
                removeListener();
                if (event.job.result) {
                  resolve(event.job.result);
                } else {
                  reject(new Error(event.job.error || 'Import job failed'));
                }
              } else if (event.job.status === 'CANCELLED') {
                removeListener();
                reject(new Error(`Import job ${job.jobId} was cancelled`));
              }
            }
          })
        : () => {};

      if (this.scheduler && typeof this.scheduler.triggerProcessing === 'function') {
        this.scheduler.triggerProcessing();
      }
    });
  }

  public async importBatch(
    items: readonly IBatchImportItem[]
  ): Promise<readonly ImportResult[]> {
    const results: ImportResult[] = [];
    for (const item of items) {
      const res = await this.importDocument(
        item.file,
        item.fileName,
        item.bookId,
        item.priority,
        item.options
      );
      results.push(res);
    }
    return Object.freeze(results);
  }

  public getJobStatus(jobId: string): ImportJob | null {
    return this.queue ? this.queue.getJob(jobId) : null;
  }

  public getQueueState(): IQueueStateData {
    if (!this.queue) {
      return {
        pendingCount: 0,
        runningCount: 0,
        pausedCount: 0,
        completedCount: 0,
        failedCount: 0,
        totalJobsCount: 0,
        isPaused: false
      };
    }
    return this.queue.getQueueState();
  }

  public cancelImport(jobId: string): boolean {
    return this.queue ? this.queue.cancel(jobId) : false;
  }

  public retryImport(jobId: string): boolean {
    const success = this.queue ? this.queue.retry(jobId) : false;
    if (success && this.scheduler && typeof this.scheduler.triggerProcessing === "function") {
      this.scheduler.triggerProcessing();
    }
    return success;
  }

  public pauseImport(): void {
    if (this.scheduler && typeof this.scheduler.pause === "function") {
      this.scheduler.pause();
    }
  }

  public resumeImport(): void {
    if (this.scheduler && typeof this.scheduler.resume === "function") {
      this.scheduler.resume();
    }
  }

  public getAggregatedStatistics(): ImportStatistics {
    let combined = ImportStatistics.empty();
    const completedJobs = this.queue.getJobsByStatus('COMPLETED');
    for (const job of completedJobs) {
      if (job.result?.report?.statistics) {
        combined = combined.combine(job.result.report.statistics);
      }
    }
    return combined;
  }

  public getRepositoryService(): KnowledgeRepositoryService {
    return this.repositoryService;
  }

  public getQueue(): ImportQueue {
    return this.queue;
  }

  public getOrchestrator(): KnowledgeImportOrchestrator {
    return this.orchestrator;
  }
}

export const knowledgePopulationService = KnowledgePopulationService.getInstance();
