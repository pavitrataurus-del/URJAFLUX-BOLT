import { ImportJob, JobStatus } from './ImportJob';

export type QueueEventListener = (event: { type: string; job?: ImportJob; queueSize: number }) => void;

export interface IQueueStateData {
  readonly pendingCount: number;
  readonly runningCount: number;
  readonly pausedCount: number;
  readonly completedCount: number;
  readonly failedCount: number;
  readonly totalJobsCount: number;
  readonly isPaused: boolean;
}

export class ImportQueue {
  private jobsMap: Map<string, ImportJob>;
  private isPausedState: boolean;
  private readonly listeners: QueueEventListener[];

  constructor() {
    this.jobsMap = new Map<string, ImportJob>();
    this.isPausedState = false;
    this.listeners = [];
  }

  public addListener(listener: QueueEventListener): () => void {
    if (!this.listeners) (this as any).listeners = [];
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
    return () => {
      if (!this.listeners) return;
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  public addEventListener(listener: QueueEventListener): () => void {
    return this.addListener(listener);
  }

  public on(event: string, listener: QueueEventListener): () => void {
    return this.addListener(listener);
  }

  public emit(type: string, job?: ImportJob): void {
    this.notify(type, job);
  }

  private notify(type: string, job?: ImportJob): void {
    const queueSize = this.jobsMap ? this.jobsMap.size : 0;
    if (!this.listeners) return;
    this.listeners.forEach((fn) => {
      try {
        if (typeof fn === 'function') {
          fn({ type, job, queueSize });
        }
      } catch {
        // Safe dispatch
      }
    });
  }

  public enqueue(job: ImportJob): void {
    this.jobsMap.set(job.jobId, job);
    this.notify('ENQUEUE', job);
  }

  public dequeue(): ImportJob | null {
    if (this.isPausedState) return null;

    const pendingJobs = Array.from(this.jobsMap.values())
      .filter((j) => j.status === 'PENDING')
      .sort((a, b) => {
        if (b.priorityWeight !== a.priorityWeight) {
          return b.priorityWeight - a.priorityWeight;
        }
        return a.createdTime - b.createdTime;
      });

    if (pendingJobs.length === 0) return null;

    const nextJob = pendingJobs[0].withStarted();
    this.jobsMap.set(nextJob.jobId, nextJob);
    this.notify('DEQUEUE', nextJob);
    return nextJob;
  }

  public peek(): ImportJob | null {
    if (this.isPausedState) return null;

    const pendingJobs = Array.from(this.jobsMap.values())
      .filter((j) => j.status === 'PENDING')
      .sort((a, b) => {
        if (b.priorityWeight !== a.priorityWeight) {
          return b.priorityWeight - a.priorityWeight;
        }
        return a.createdTime - b.createdTime;
      });

    return pendingJobs.length > 0 ? pendingJobs[0] : null;
  }

  public updateJob(job: ImportJob): void {
    if (this.jobsMap.has(job.jobId)) {
      this.jobsMap.set(job.jobId, job);
      this.notify('UPDATE', job);
    }
  }

  public cancel(jobId: string): boolean {
    const existing = this.jobsMap.get(jobId);
    if (!existing || existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      return false;
    }
    const cancelled = existing.withStatus('CANCELLED');
    this.jobsMap.set(jobId, cancelled);
    this.notify('CANCEL', cancelled);
    return true;
  }

  public retry(jobId: string): boolean {
    const existing = this.jobsMap.get(jobId);
    if (!existing || existing.status !== 'FAILED' || existing.retries >= existing.maxRetries) {
      return false;
    }
    const retried = existing.withRetry();
    this.jobsMap.set(jobId, retried);
    this.notify('RETRY', retried);
    return true;
  }

  public pause(): void {
    this.isPausedState = true;
    this.notify('PAUSE');
  }

  public resume(): void {
    this.isPausedState = false;
    this.notify('RESUME');
  }

  public get isPaused(): boolean {
    return this.isPausedState;
  }

  public getJob(jobId: string): ImportJob | null {
    return this.jobsMap.get(jobId) || null;
  }

  public getAllJobs(): readonly ImportJob[] {
    return Object.freeze(Array.from(this.jobsMap.values()));
  }

  public getJobsByStatus(status: JobStatus): readonly ImportJob[] {
    return Object.freeze(Array.from(this.jobsMap.values()).filter((j) => j.status === status));
  }

  public clear(): void {
    this.jobsMap.clear();
    this.notify('CLEAR');
  }

  public getQueueState(): IQueueStateData {
    const jobs = Array.from(this.jobsMap.values());
    return {
      pendingCount: jobs.filter((j) => j.status === 'PENDING').length,
      runningCount: jobs.filter((j) => j.status === 'RUNNING').length,
      pausedCount: jobs.filter((j) => j.status === 'PAUSED').length,
      completedCount: jobs.filter((j) => j.status === 'COMPLETED').length,
      failedCount: jobs.filter((j) => j.status === 'FAILED').length,
      totalJobsCount: jobs.length,
      isPaused: this.isPausedState
    };
  }
}
