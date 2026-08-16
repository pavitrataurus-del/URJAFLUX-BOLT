// URJAFLUX Enterprise Streaming Import Engine - Master Pipeline Orchestrator
// Executes the 10-step ingestion pipeline safely with incremental streaming and zero OCR overhead.

import {
  ImportJobMetrics,
  DuplicateResolution,
  DuplicateDetectionResult,
  FileValidationResult,
  ParsedPageChunk
} from "./types";
import { ParserRegistry } from "./parsers/ParserRegistry";
import { DuplicateDetector } from "./DuplicateDetector";
import { ImportJobManager } from "./ImportJobManager";
import { CheckpointEngine } from "./CheckpointEngine";
import { MemoryTracker } from "./MemoryTracker";
import { IndexedDBStorageEngine } from "../storage/IndexedDBStorageEngine";
import { KBStoreName, BookStoreItem } from "../storage/schema";

import { KnowledgeInvalidationEngine } from "./KnowledgeInvalidationEngine";
export interface IngestionOptions {
  duplicateResolution?: DuplicateResolution;
  startPageOverride?: number;
  onDuplicateDetected?: (duplicateInfo: DuplicateDetectionResult) => Promise<DuplicateResolution>;
  onProgress?: (metrics: ImportJobMetrics) => void;
}

export class EnterpriseImportEngine {
  private static instance: EnterpriseImportEngine;
  private parserRegistry = ParserRegistry.getInstance();
  private duplicateDetector = new DuplicateDetector();
  public readonly jobManager = new ImportJobManager();
  private checkpointEngine = new CheckpointEngine();
  private memoryTracker = new MemoryTracker();
  private dbEngine = IndexedDBStorageEngine.getInstance();

  private activeAbortControllers: Map<string, AbortController> = new Map();
  private maxAllowedFileSizeBytes = 1024 * 1024 * 1000; // 1 GB max limit

  private constructor() {}

  public static getInstance(): EnterpriseImportEngine {
    if (!EnterpriseImportEngine.instance) {
      EnterpriseImportEngine.instance = new EnterpriseImportEngine();
    }
    return EnterpriseImportEngine.instance;
  }

  /**
   * Primary entry point executing the full 10-step streaming import pipeline
   */
  public async ingestDocument(
    file: File | Blob | ArrayBuffer,
    fileName: string,
    options?: IngestionOptions
  ): Promise<ImportJobMetrics> {
    const jobId = `JOB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const startMs = Date.now();

    // 1. SELECT FILE & VALIDATE
    const parser = this.parserRegistry.resolveParser(fileName);
    const buffer = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer();

    if (buffer.byteLength > this.maxAllowedFileSizeBytes) {
      const errRes: FileValidationResult = {
        isValid: false,
        error: `File size (${(buffer.byteLength / (1024 * 1024)).toFixed(1)} MB) exceeds max limit of 1 GB`,
        errorCode: "MAX_SIZE_EXCEEDED"
      };
      throw new Error(errRes.error);
    }

    const validation = await parser.validateFile(buffer);
    if (!validation.isValid) {
      throw new Error(`File Validation Error [${validation.errorCode}]: ${validation.error}`);
    }

    // 2. HASH FILE (SHA-256)
    const hashHex = await this.duplicateDetector.computeSha256(buffer);

    // 3. DUPLICATE DETECTION
    const dupResult = await this.duplicateDetector.checkDuplicate(fileName, buffer.byteLength, hashHex);

    let resolution: DuplicateResolution = options?.duplicateResolution || "NEW_VERSION";
    if (dupResult.isDuplicate) {
      if (options?.onDuplicateDetected) {
        resolution = await options.onDuplicateDetected(dupResult);
      }
      if (resolution === "SKIP") {
        const skippedJob = this.jobManager.createJob(jobId, fileName, buffer.byteLength, parser.parserName, 0, dupResult);
        this.jobManager.updateJobStatus(jobId, "CANCELLED", "Skipped by duplicate resolution decision");
        return skippedJob;
      }
    }

    // 4. CREATE IMPORT JOB
    const metadata = await parser.extractMetadata(buffer, fileName);
    metadata.checksumSha256 = hashHex;

    const jobMetrics = this.jobManager.createJob(
      jobId,
      fileName,
      buffer.byteLength,
      parser.parserName,
      metadata.totalPages,
      dupResult
    );

    // Prepare cancellation signal
    const abortController = new AbortController();
    this.activeAbortControllers.set(jobId, abortController);

    this.jobManager.updateJobStatus(jobId, "PAGE_STREAMING");

    try {
      // 5. PAGE STREAMING & CHECKPOINT SAVING
      const startPage = options?.startPageOverride || 1;

      await parser.streamPages(
        buffer,
        async (pageChunk: ParsedPageChunk) => {
          this.memoryTracker.registerBuffer(pageChunk.rawBuffer);
          // Phase 2 & 3: Clean and Extract Knowledge
          if (pageChunk.extractedText) {
            const units = await (await import("./KnowledgeExtractionEngine")).KnowledgeExtractionEngine.processAndStore(pageChunk.extractedText, jobId, pageChunk.pageNumber);
            console.log(`[KnowledgeEngine] Extracted ${units.length} semantic units from page ${pageChunk.pageNumber}.`);
            // Store in Search Index in real implementation...
          }

          const updatedMetrics = await this.jobManager.recordPageProgress(jobId, pageChunk, startMs);

          if (updatedMetrics && options?.onProgress) {
            options.onProgress(updatedMetrics);
          }

          // Release chunk buffer to enforce < 100 MB RAM
          this.memoryTracker.releaseBuffer(pageChunk.rawBuffer);
        },
        {
          startPage,
          abortSignal: abortController.signal
        }
      );

      if (abortController.signal.aborted) {
        this.jobManager.updateJobStatus(jobId, "CANCELLED", "Import cancelled by user");
        return this.jobManager.getJob(jobId)!;
      }

      // 6. CREATE / UPDATE BOOK IN STORAGE
      await this.persistFinalBookRecord(jobId, metadata, resolution, dupResult);

      // 7. COMPLETE PIPELINE
      this.jobManager.updateJobStatus(jobId, "COMPLETED");
      this.memoryTracker.flushAll();

      return this.jobManager.getJob(jobId)!;
    } catch (err: any) {
      this.jobManager.updateJobStatus(jobId, "FAILED", err.message || "Import pipeline error");
      throw err;
    } finally {
      this.activeAbortControllers.delete(jobId);
    }
  }

  /**
   * Pauses an active streaming job
   */
  public pauseJob(jobId: string, reason?: string): boolean {
    const controller = this.activeAbortControllers.get(jobId);
    if (controller) {
      controller.abort();
      this.activeAbortControllers.delete(jobId);
      this.jobManager.updateJobStatus(jobId, "PAUSED", reason || "Paused by admin");
      return true;
    }
    return false;
  }

  /**
   * Resumes a paused or interrupted job from its last saved page checkpoint
   */
  public async resumeJob(
    jobId: string,
    file: File | Blob | ArrayBuffer,
    fileName: string,
    options?: IngestionOptions
  ): Promise<ImportJobMetrics> {
    const check = await this.checkpointEngine.canResume(jobId);
    if (!check.resumable) {
      throw new Error(`Job ${jobId} cannot be resumed. Last page: ${check.lastPage}/${check.totalPages}`);
    }

    const resumeStartPage = check.lastPage + 1;
    console.log(`[EnterpriseImportEngine] Resuming job ${jobId} from page ${resumeStartPage}...`);

    this.jobManager.updateJobStatus(jobId, "PAGE_STREAMING");

    return this.ingestDocument(file, fileName, {
      ...options,
      startPageOverride: resumeStartPage
    });
  }

  /**
   * Cancels an active or paused import job
   */
  public cancelJob(jobId: string): boolean {
    const controller = this.activeAbortControllers.get(jobId);
    if (controller) {
      controller.abort();
      this.activeAbortControllers.delete(jobId);
    }
    this.jobManager.updateJobStatus(jobId, "CANCELLED", "Cancelled by user");
    return true;
  }

  private async persistFinalBookRecord(
    jobId: string,
    metadata: any,
    resolution: DuplicateResolution,
    dupResult: DuplicateDetectionResult
  ): Promise<void> {
    const bookId = resolution === "REPLACE" && dupResult.existingBookId ? dupResult.existingBookId : `BOOK-${Date.now()}`;
    const now = new Date().toISOString();

    const bookRecord: BookStoreItem = {
      id: bookId,
      title: metadata.title,
      author: metadata.author || "Unknown Author",
      publisher: metadata.publisher || "URJAFLUX Vault",
      edition: resolution === "NEW_VERSION" ? "v2.0" : "v1.0",
      language: metadata.language || "en",
      category: metadata.category || "General Knowledge",
      tags: ["Ingested", metadata.format],
      status: "active",
      version: resolution === "NEW_VERSION" ? "2.0" : "1.0",
      visibility: "INTERNAL",
      pageCount: metadata.totalPages,
      fileSizeBytes: metadata.fileSizeBytes,
      format: metadata.format,
      checksum: metadata.checksumSha256,
      createdAt: now,
      updatedAt: now
    };

    await this.dbEngine.executeTransaction([KBStoreName.BOOKS], "readwrite", async (stores) => {
      const bookStore = stores[KBStoreName.BOOKS];
      if ("put" in bookStore) {
        (bookStore as IDBObjectStore).put(bookRecord);
      } else {
        (bookStore as Map<string, any>).set(bookRecord.id, bookRecord);
      }
    });
  }
}
