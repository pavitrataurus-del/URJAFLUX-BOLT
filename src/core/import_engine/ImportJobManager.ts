// URJAFLUX Enterprise Streaming Import Engine - Import Job Manager & Event Emitter

import {
  ImportJobMetrics,
  ImportJobStatus,
  ImportEventType,
  ImportEvent,
  ParsedPageChunk,
  DuplicateDetectionResult
} from "./types";
import { MemoryTracker } from "./MemoryTracker";
import { CheckpointEngine } from "./CheckpointEngine";

type EventListener = (event: ImportEvent) => void;

export class ImportJobManager {
  private jobs: Map<string, ImportJobMetrics> = new Map();
  private eventListeners: Map<ImportEventType, Set<EventListener>> = new Map();
  private memoryTracker = new MemoryTracker();
  private checkpointEngine = new CheckpointEngine();

  constructor() {
    Object.values(ImportEventType).forEach(type => {
      this.eventListeners.set(type as ImportEventType, new Set());
    });
  }

  public addEventListener(type: ImportEventType, listener: EventListener): () => void {
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }
    let listeners = this.eventListeners.get(type);
    if (!listeners) {
      listeners = new Set();
      this.eventListeners.set(type, listeners);
    }
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => {
      this.eventListeners?.get(type)?.delete(listener);
    };
  }

  public addListener(type: ImportEventType, listener: EventListener): () => void {
    return this.addEventListener(type, listener);
  }

  public on(type: ImportEventType, listener: EventListener): () => void {
    return this.addEventListener(type, listener);
  }

  public emit(type: ImportEventType, jobId: string, payload?: any): void {
    const event: ImportEvent = {
      type,
      jobId,
      timestamp: new Date().toISOString(),
      payload
    };
    const listeners = this.eventListeners.get(type);
    listeners?.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error(`[ImportJobManager] Listener error for ${type}:`, err);
      }
    });
  }

  public createJob(
    jobId: string,
    fileName: string,
    fileSizeBytes: number,
    parserType: string,
    totalPages: number,
    duplicateInfo?: DuplicateDetectionResult
  ): ImportJobMetrics {
    const now = new Date().toISOString();
    const metrics: ImportJobMetrics = {
      jobId,
      fileName,
      fileSizeBytes,
      fileSizeMB: Number((fileSizeBytes / (1024 * 1024)).toFixed(2)),
      parserType,
      status: "QUEUED",
      currentPage: 0,
      totalPages,
      progressPercentage: 0,
      bytesProcessed: 0,
      speedPagesPerSec: 0,
      speedMBPerSec: 0,
      etaSeconds: 0,
      memoryUsageMB: this.memoryTracker.getMemoryUsageMB(),
      checkpointSavedCount: 0,
      lastCheckpointPage: 0,
      startedAt: now,
      updatedAt: now,
      duplicateInfo
    };

    this.jobs.set(jobId, metrics);
    this.emit(ImportEventType.IMPORT_STARTED, jobId, metrics);
    return metrics;
  }

  public updateJobStatus(jobId: string, status: ImportJobStatus, reason?: string): ImportJobMetrics | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.status = status;
    job.updatedAt = new Date().toISOString();

    if (status === "PAUSED") {
      job.pauseReason = reason || "Paused by administrator";
      this.emit(ImportEventType.JOB_PAUSED, jobId, job);
    } else if (status === "FAILED") {
      job.failureReason = reason || "Unknown import engine failure";
      this.emit(ImportEventType.JOB_FAILED, jobId, job);
    } else if (status === "CANCELLED") {
      this.emit(ImportEventType.IMPORT_CANCELLED, jobId, job);
    } else if (status === "COMPLETED") {
      job.completedAt = new Date().toISOString();
      job.progressPercentage = 100;
      this.emit(ImportEventType.JOB_COMPLETED, jobId, job);
    }

    return job;
  }

  public async recordPageProgress(
    jobId: string,
    pageChunk: ParsedPageChunk,
    startMs: number
  ): Promise<ImportJobMetrics | undefined> {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    const nowMs = Date.now();
    const elapsedSec = Math.max(0.1, (nowMs - startMs) / 1000);

    job.currentPage = pageChunk.pageNumber;
    job.progressPercentage = Number(((job.currentPage / job.totalPages) * 100).toFixed(1));
    job.bytesProcessed = Math.min(
      job.fileSizeBytes,
      Math.round((job.currentPage / job.totalPages) * job.fileSizeBytes)
    );

    job.speedPagesPerSec = Number((job.currentPage / elapsedSec).toFixed(2));
    const processedMB = job.bytesProcessed / (1024 * 1024);
    job.speedMBPerSec = Number((processedMB / elapsedSec).toFixed(2));

    const remainingPages = Math.max(0, job.totalPages - job.currentPage);
    job.etaSeconds = job.speedPagesPerSec > 0 ? Math.ceil(remainingPages / job.speedPagesPerSec) : 0;

    job.memoryUsageMB = this.memoryTracker.getMemoryUsageMB();
    job.updatedAt = new Date().toISOString();

    // Emit PAGE_STREAMED
    this.emit(ImportEventType.PAGE_STREAMED, jobId, {
      pageNumber: pageChunk.pageNumber,
      totalPages: job.totalPages,
      metrics: job
    });

    // Checkpoint save after every page
    job.checkpointSavedCount += 1;
    job.lastCheckpointPage = pageChunk.pageNumber;
    job.status = "CHECKPOINTING";

    await this.checkpointEngine.saveCheckpoint(job, pageChunk);
    job.status = "PAGE_STREAMING";

    this.emit(ImportEventType.CHECKPOINT_CREATED, jobId, {
      checkpointIndex: job.checkpointSavedCount,
      pageNumber: pageChunk.pageNumber
    });

    return job;
  }

  public getJob(jobId: string): ImportJobMetrics | undefined {
    return this.jobs.get(jobId);
  }

  public getAllJobs(): ImportJobMetrics[] {
    return Array.from(this.jobs.values());
  }

  public clearJobs(): void {
    this.jobs.clear();
  }
}
