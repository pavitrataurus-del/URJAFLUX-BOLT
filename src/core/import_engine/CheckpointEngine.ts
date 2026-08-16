// URJAFLUX Enterprise Streaming Import Engine - Checkpoint Engine
// Auto-saves import job progress and raw page chunks after every page.
// Enables seamless recovery from crashes, refreshes, power failures, or network interruptions.

import { ImportJobMetrics, ParsedPageChunk } from "./types";
import { IndexedDBStorageEngine } from "../storage/IndexedDBStorageEngine";
import { KBStoreName, ImportJobStoreItem, OCRPageStoreItem } from "../storage/schema";

export class CheckpointEngine {
  private dbEngine = IndexedDBStorageEngine.getInstance();

  /**
   * Saves atomic checkpoint after every page streamed
   */
  public async saveCheckpoint(
    metrics: ImportJobMetrics,
    pageChunk?: ParsedPageChunk
  ): Promise<void> {
    const now = new Date().toISOString();

    await this.dbEngine.executeTransaction(
      [KBStoreName.IMPORT_JOBS, KBStoreName.OCR_PAGES],
      "readwrite",
      async (stores) => {
        const jobStore = stores[KBStoreName.IMPORT_JOBS];
        const ocrStore = stores[KBStoreName.OCR_PAGES];

        // 1. Update Import Job Record
        const jobItem: ImportJobStoreItem = {
          id: metrics.jobId,
          fileName: metrics.fileName,
          fileSizeBytes: metrics.fileSizeBytes,
          status: metrics.status as any,
          progressPercentage: metrics.progressPercentage,
          currentPage: metrics.currentPage,
          totalPages: metrics.totalPages,
          errorMessage: metrics.failureReason,
          stageTimingsMs: {
            etaSeconds: metrics.etaSeconds,
            speedPagesPerSec: metrics.speedPagesPerSec,
            memoryUsageMB: metrics.memoryUsageMB,
            lastCheckpointPage: metrics.currentPage
          },
          createdAt: metrics.startedAt || now,
          updatedAt: now
        };

        if ("put" in jobStore) {
          (jobStore as IDBObjectStore).put(jobItem);
        } else {
          (jobStore as Map<string, any>).set(metrics.jobId, jobItem);
        }

        // 2. Persist Raw Page Record
        if (pageChunk) {
          const pageItem: OCRPageStoreItem = {
            id: `PAGE-${metrics.jobId}-P${pageChunk.pageNumber}`,
            bookId: metrics.jobId, // Links page to job/book
            pageNumber: pageChunk.pageNumber,
            extractedText: pageChunk.extractedText || "",
            ocrConfidence: 1.0,
            language: "eng",
            wordCount: pageChunk.extractedText ? pageChunk.extractedText.split(/\s+/).length : 0,
            processedAt: now
          };

          if ("put" in ocrStore) {
            (ocrStore as IDBObjectStore).put(pageItem);
          } else {
            (ocrStore as Map<string, any>).set(pageItem.id, pageItem);
          }
        }
      }
    );
  }

  /**
   * Retrieves the latest checkpoint for a job ID
   */
  public async getCheckpoint(jobId: string): Promise<ImportJobStoreItem | null> {
    let result: ImportJobStoreItem | null = null;

    await this.dbEngine.executeTransaction(
      [KBStoreName.IMPORT_JOBS],
      "readonly",
      async (stores) => {
        const jobStore = stores[KBStoreName.IMPORT_JOBS];
        if ("get" in jobStore) {
          const req = (jobStore as IDBObjectStore).get(jobId);
          result = await new Promise((resolve) => {
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
          });
        } else {
          result = (jobStore as Map<string, any>).get(jobId) || null;
        }
      }
    );

    return result;
  }

  /**
   * Checks whether a job can be resumed from its last saved page checkpoint
   */
  public async canResume(jobId: string): Promise<{ resumable: boolean; lastPage: number; totalPages: number }> {
    const job = await this.getCheckpoint(jobId);
    if (!job) return { resumable: false, lastPage: 0, totalPages: 0 };

    const isPending = job.status !== "COMPLETED" && job.status !== "FAILED";
    const hasUnfinishedPages = job.currentPage < job.totalPages;

    return {
      resumable: isPending && hasUnfinishedPages,
      lastPage: job.currentPage,
      totalPages: job.totalPages
    };
  }
}
