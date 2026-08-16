import { ImportQueue, IQueueStateData } from './ImportQueue';
import { ImportJob } from './ImportJob';
import { ImportResult } from '../orchestrator/ImportResult';

export type JobExecutor = (job: ImportJob) => Promise<ImportResult>;

export interface ISchedulerConfig {
  readonly autoStart: boolean;
  readonly maxConcurrency: number; // Set to 1 for strict sequential execution
  readonly pollingIntervalMs: number;
}

export class ImportScheduler {
  private readonly queue: ImportQueue;
  private readonly executor: JobExecutor;
  private config: ISchedulerConfig;
  private isProcessing = false;
  private activeJobsCount = 0;

  constructor(
    queue: ImportQueue,
    executor: JobExecutor,
    config?: Partial<ISchedulerConfig>
  ) {
    this.queue = queue;
    this.executor = executor;
    this.config = {
      autoStart: config?.autoStart ?? true,
      maxConcurrency: 1, // Enforce strict sequential execution per enterprise spec
      pollingIntervalMs: config?.pollingIntervalMs ?? 100
    };
  }

  public setParallelismConfig(maxConcurrency: number): void {
    // Interface stub for future expansion - locked to 1 per sprint mandate
    this.config = {
      ...this.config,
      maxConcurrency: Math.max(1, Math.min(1, maxConcurrency))
    };
  }

  public scheduleBatch(jobs: readonly ImportJob[]): void {
    for (const job of jobs) {
      this.queue.enqueue(job);
    }
    if (this.config.autoStart) {
      this.triggerProcessing();
    }
  }

  public triggerProcessing(): void {
    if (this.isProcessing || this.queue.isPaused) return;
    this.processNextLoop();
  }

  private async processNextLoop(): Promise<void> {
    if (this.isProcessing || this.queue.isPaused) return;
    this.isProcessing = true;

    try {
      while (!this.queue.isPaused) {
        const nextJob = this.queue.dequeue();
        if (!nextJob) {
          break; // Queue exhausted or paused
        }

        this.activeJobsCount = 1;
        try {
          const result = await this.executor(nextJob);
          const updatedJob = nextJob.withResult(result);
          this.queue.updateJob(updatedJob);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const failedJob = nextJob.withStatus('FAILED', errMsg);
          this.queue.updateJob(failedJob);
        } finally {
          this.activeJobsCount = 0;
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  public pause(): void {
    this.queue.pause();
  }

  public resume(): void {
    this.queue.resume();
    this.triggerProcessing();
  }

  public getQueueState(): IQueueStateData {
    return this.queue.getQueueState();
  }

  public get isRunning(): boolean {
    return this.isProcessing || this.activeJobsCount > 0;
  }
}
