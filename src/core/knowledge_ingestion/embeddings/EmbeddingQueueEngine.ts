// ============================================================================
// EMBEDDING QUEUE & BACKGROUND JOB ENGINE (PHASE 3)
// Supports queued jobs, background processing, retries, failure recovery, cancellation
// ============================================================================

import { 
  EmbeddingJob, 
  ReembeddingTargetType, 
  QueueJobStatus 
} from "../types/embeddingKnowledge";

export class EmbeddingQueueEngine {
  private static jobsMap: Map<string, EmbeddingJob> = new Map();
  private static processingQueue: string[] = [];
  private static isProcessing = false;

  /**
   * Enqueues a new re-embedding or incremental embedding job.
   */
  public static createJob(
    targetType: ReembeddingTargetType,
    targetId: string,
    totalItems: number = 0
  ): EmbeddingJob {
    const jobId = `JOB-EMB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const job: EmbeddingJob = {
      jobId,
      targetType,
      targetId,
      status: "QUEUED",
      queuedAt: new Date().toISOString(),
      totalItems,
      processedItems: 0,
      failedItems: 0,
      retryCount: 0,
      maxRetries: 3
    };

    this.jobsMap.set(jobId, job);
    this.processingQueue.push(jobId);

    // Trigger queue worker asynchronously
    setTimeout(() => this.processNextInQueue(), 10);

    return job;
  }

  public static getJob(jobId: string): EmbeddingJob | undefined {
    return this.jobsMap.get(jobId);
  }

  public static getAllJobs(): EmbeddingJob[] {
    return Array.from(this.jobsMap.values());
  }

  public static cancelJob(jobId: string): boolean {
    const job = this.jobsMap.get(jobId);
    if (job && (job.status === "QUEUED" || job.status === "PROCESSING")) {
      job.status = "CANCELLED";
      job.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  public static updateJobProgress(
    jobId: string,
    processedInc: number,
    failedInc: number = 0
  ): void {
    const job = this.jobsMap.get(jobId);
    if (!job) return;

    job.processedItems += processedInc;
    job.failedItems += failedInc;

    if (job.totalItems > 0 && job.processedItems + job.failedItems >= job.totalItems) {
      job.status = job.failedItems > 0 && job.processedItems === 0 ? "FAILED" : "COMPLETED";
      job.completedAt = new Date().toISOString();
    }
  }

  public static markJobFailed(jobId: string, errorMsg: string): void {
    const job = this.jobsMap.get(jobId);
    if (!job) return;

    if (job.retryCount < job.maxRetries) {
      job.retryCount++;
      job.status = "QUEUED";
      this.processingQueue.push(jobId);
    } else {
      job.status = "FAILED";
      job.errorMessage = errorMsg;
      job.completedAt = new Date().toISOString();
    }
  }

  private static async processNextInQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) return;

    this.isProcessing = true;
    const jobId = this.processingQueue.shift();
    if (!jobId) {
      this.isProcessing = false;
      return;
    }

    const job = this.jobsMap.get(jobId);
    if (job && job.status === "QUEUED") {
      job.status = "PROCESSING";
      job.startedAt = new Date().toISOString();
    }

    this.isProcessing = false;

    if (this.processingQueue.length > 0) {
      setTimeout(() => this.processNextInQueue(), 10);
    }
  }

  public static getQueuedJobsCount(): number {
    return Array.from(this.jobsMap.values()).filter(j => j.status === "QUEUED" || j.status === "PROCESSING").length;
  }

  public static getFailedJobsCount(): number {
    return Array.from(this.jobsMap.values()).filter(j => j.status === "FAILED").length;
  }
}
