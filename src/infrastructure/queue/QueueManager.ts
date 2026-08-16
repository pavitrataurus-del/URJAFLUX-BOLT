import { IQueueProvider, IJob, JobStatus } from "./QueueTypes";

export class QueueManager {
  private static instance: QueueManager;
  private provider: IQueueProvider | null = null;

  private constructor() {}

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  public setProvider(provider: IQueueProvider): void {
    this.provider = provider;
  }

  private getProvider(): IQueueProvider {
    if (!this.provider) {
      throw new Error("Queue provider is not initialized.");
    }
    return this.provider;
  }

  public async enqueue<T>(job: Omit<IJob<T>, "id" | "status" | "attemptCount" | "createdAt">): Promise<string> {
    return this.getProvider().enqueue(job);
  }

  public async completeJob(jobId: string): Promise<void> {
    return this.getProvider().completeJob(jobId);
  }

  public async failJob(jobId: string, error: Error): Promise<void> {
    return this.getProvider().failJob(jobId, error);
  }
  
  public async cancelJob(jobId: string): Promise<void> {
    return this.getProvider().cancelJob(jobId);
  }

  public async getJob(jobId: string): Promise<IJob | null> {
    return this.getProvider().getJob(jobId);
  }
}
