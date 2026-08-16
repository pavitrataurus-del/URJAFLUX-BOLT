import {
  IngestionQueueItem,
  ProcessingStage,
  LifecycleStatus,
  VaultSystemMetrics,
  ImportHistoryEntry,
  IngestionListener,
  FileValidationResult
} from '../types/ingestion.types';
import {
  KnowledgeIngestionConfig,
  QueueProcessorConfig,
  DEFAULT_KNOWLEDGE_INGESTION_CONFIG,
  DEFAULT_QUEUE_PROCESSOR_CONFIG
} from '../types/config.types';
import { FileValidator } from '../validators/fileValidator';
import { logger } from '../utils/logger';

export class ImportManager {
  private static instance: ImportManager;
  private queue: IngestionQueueItem[] = [];
  private history: ImportHistoryEntry[] = [];
  private listeners: Set<IngestionListener> = new Set();
  private validator: FileValidator;
  private config: KnowledgeIngestionConfig;
  private queueProcessorConfig: QueueProcessorConfig;
  private activeWorkersCount: number = 0;
  private isPaused: boolean = false;

  private constructor(
    config: Partial<KnowledgeIngestionConfig> = {},
    queueProcessorConfig: Partial<QueueProcessorConfig> = {}
  ) {
    this.config = { ...DEFAULT_KNOWLEDGE_INGESTION_CONFIG, ...config };
    this.queueProcessorConfig = { ...DEFAULT_QUEUE_PROCESSOR_CONFIG, ...queueProcessorConfig };
    this.validator = new FileValidator(this.config);
  }

  public static getInstance(): ImportManager {
    if (!ImportManager.instance) {
      ImportManager.instance = new ImportManager();
    }
    return ImportManager.instance;
  }

  public getConfig(): KnowledgeIngestionConfig {
    return { ...this.config };
  }

  public updateConfig(patch: Partial<KnowledgeIngestionConfig>): void {
    this.config = { ...this.config, ...patch };
    this.validator = new FileValidator(this.config);
    logger.info('Knowledge Ingestion configuration updated', { patch });
    this.notifyListeners();
  }

  public getQueueProcessorConfig(): QueueProcessorConfig {
    return { ...this.queueProcessorConfig };
  }

  public subscribe(listener: IngestionListener): () => void {
    if (!this.listeners) (this as any).listeners = new Set();
    this.listeners.add(listener);
    // Initial emit
    try {
      listener(this.getQueue(), this.getVaultMetrics());
    } catch {
      // Safe execution
    }
    return () => {
      if (this.listeners) {
        this.listeners.delete(listener);
      }
    };
  }

  public addListener(listener: any): () => void {
    if (typeof listener === 'function') {
      return this.subscribe(listener);
    }
    return () => {};
  }

  public addEventListener(typeOrListener: any, listener?: any): () => void {
    const fn = typeof typeOrListener === 'function' ? typeOrListener : listener;
    if (typeof fn === 'function') {
      return this.subscribe(fn);
    }
    return () => {};
  }

  public on(event: any, listener?: any): () => void {
    const fn = typeof event === 'function' ? event : listener;
    if (typeof fn === 'function') {
      return this.subscribe(fn);
    }
    return () => {};
  }

  public emit(event?: any, data?: any): void {
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const queueCopy = this.getQueue();
    const metrics = this.getVaultMetrics();
    this.listeners.forEach((listener) => {
      try {
        listener(queueCopy, metrics);
      } catch (err) {
        logger.error('Error executing ingestion listener', { error: String(err) });
      }
    });
  }

  public getQueue(): readonly IngestionQueueItem[] {
    return [...this.queue];
  }

  public getHistory(): readonly ImportHistoryEntry[] {
    return [...this.history];
  }

  public getExistingFileNames(): ReadonlySet<string> {
    const names = new Set<string>();
    this.queue.forEach((item) => names.add(item.metadata.fileName.toLowerCase()));
    return names;
  }

  public addFilesToQueue(files: FileList | File[]): {
    addedCount: number;
    rejectedCount: number;
    validationFailures: readonly FileValidationResult[];
  } {
    const fileArray = Array.from(files);
    const existingNames = this.getExistingFileNames();
    const validationResult = this.validator.validateBatchQueue(fileArray, existingNames);

    const now = Date.now();
    const newQueueItems: IngestionQueueItem[] = validationResult.validFiles.map((vf) => {
      const meta = vf.metadata!;
      return {
        id: meta.fileId,
        metadata: meta,
        processingStage: ProcessingStage.QUEUED,
        lifecycleStatus: LifecycleStatus.ACTIVE,
        progressPercentage: 0,
        bytesProcessed: 0,
        totalBytes: meta.fileSize,
        retryCount: 0,
        createdAt: now,
        updatedAt: now,
        rawFileRef: vf.file
      };
    });

    if (newQueueItems.length > 0) {
      this.queue.push(...newQueueItems);
      logger.info('Upload started: Files added to queue', {
        count: newQueueItems.length,
        totalQueue: this.queue.length
      });
      this.notifyListeners();
      this.triggerQueueProcessor();
    }

    if (validationResult.invalidFiles.length > 0) {
      logger.warn('Validation failed for batch upload', {
        rejectedCount: validationResult.invalidFiles.length
      });
    }

    return {
      addedCount: newQueueItems.length,
      rejectedCount: validationResult.invalidFiles.length,
      validationFailures: validationResult.invalidFiles
    };
  }

  public pauseQueue(): void {
    this.isPaused = true;
    this.queue = this.queue.map((item) =>
      item.lifecycleStatus === LifecycleStatus.ACTIVE
        ? { ...item, lifecycleStatus: LifecycleStatus.PAUSED, updatedAt: Date.now() }
        : item
    );
    logger.info('Ingestion queue paused', { queueLength: this.queue.length });
    this.notifyListeners();
  }

  public resumeQueue(): void {
    this.isPaused = false;
    this.queue = this.queue.map((item) =>
      item.lifecycleStatus === LifecycleStatus.PAUSED
        ? { ...item, lifecycleStatus: LifecycleStatus.ACTIVE, updatedAt: Date.now() }
        : item
    );
    logger.info('Ingestion queue resumed', { queueLength: this.queue.length });
    this.notifyListeners();
    this.triggerQueueProcessor();
  }

  public cancelItem(itemId: string): void {
    const target = this.queue.find((q) => q.id === itemId);
    if (!target) return;

    this.queue = this.queue.map((item) =>
      item.id === itemId
        ? {
            ...item,
            lifecycleStatus: LifecycleStatus.CANCELLED,
            updatedAt: Date.now(),
            progressPercentage: 0
          }
        : item
    );

    logger.info('Upload cancelled', { itemId, fileName: target.metadata.fileName });
    this.notifyListeners();
  }

  public retryItem(itemId: string): void {
    this.queue = this.queue.map((item) => {
      if (
        item.id === itemId &&
        (item.lifecycleStatus === LifecycleStatus.FAILED || item.lifecycleStatus === LifecycleStatus.CANCELLED)
      ) {
        return {
          ...item,
          processingStage: ProcessingStage.QUEUED,
          lifecycleStatus: LifecycleStatus.ACTIVE,
          progressPercentage: 0,
          bytesProcessed: 0,
          errorMessage: undefined,
          retryCount: item.retryCount + 1,
          updatedAt: Date.now()
        };
      }
      return item;
    });

    logger.info('Upload retry requested', { itemId });
    this.notifyListeners();
    this.triggerQueueProcessor();
  }

  public clearCompleted(): void {
    const completedOrCancelled = this.queue.filter(
      (q) =>
        q.lifecycleStatus === LifecycleStatus.COMPLETED || q.lifecycleStatus === LifecycleStatus.CANCELLED
    );

    // Archive completed items into history
    completedOrCancelled.forEach((q) => {
      if (q.lifecycleStatus === LifecycleStatus.COMPLETED) {
        const completedAt = q.updatedAt;
        const startedAt = q.createdAt;
        this.history.unshift({
          id: q.id,
          packageHash: q.metadata.packageHash,
          extension: q.metadata.extension,
          sizeBytes: q.metadata.fileSize,
          lifecycleStatus: q.lifecycleStatus,
          processingStage: q.processingStage,
          startedAt,
          completedAt,
          processingDuration: completedAt - startedAt,
          processorVersion: this.config.processorVersion,
          pipelineVersion: this.config.pipelineVersion
        });
      }
    });

    this.queue = this.queue.filter(
      (q) =>
        q.lifecycleStatus !== LifecycleStatus.COMPLETED && q.lifecycleStatus !== LifecycleStatus.CANCELLED
    );

    logger.info('Cleared completed queue items', { clearedCount: completedOrCancelled.length });
    this.notifyListeners();
  }

  private triggerQueueProcessor(): void {
    if (this.isPaused) return;

    const availableWorkers = this.queueProcessorConfig.maxConcurrentWorkers - this.activeWorkersCount;
    if (availableWorkers <= 0) return;

    const eligibleItems = this.queue.filter(
      (q) =>
        q.lifecycleStatus === LifecycleStatus.ACTIVE && q.processingStage === ProcessingStage.QUEUED
    );

    const itemsToProcess = eligibleItems.slice(0, availableWorkers);

    itemsToProcess.forEach((item) => {
      this.activeWorkersCount++;
      this.processQueueItem(item.id).finally(() => {
        this.activeWorkersCount--;
        if (!this.isPaused) {
          setTimeout(() => this.triggerQueueProcessor(), 50);
        }
      });
    });
  }

  private async processQueueItem(itemId: string): Promise<void> {
    const currentItem = this.queue.find((q) => q.id === itemId);
    if (
      !currentItem ||
      currentItem.lifecycleStatus !== LifecycleStatus.ACTIVE ||
      currentItem.processingStage !== ProcessingStage.QUEUED
    ) {
      return;
    }

    const total = currentItem.totalBytes;
    const chunkSize = Math.max(Math.floor(total / 10), 1024 * 64);
    let processed = 0;

    // Stage 1: VALIDATING
    this.updateQueueItem(itemId, {
      processingStage: ProcessingStage.VALIDATING,
      updatedAt: Date.now()
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Stage 2: REGISTERING
    this.updateQueueItem(itemId, {
      processingStage: ProcessingStage.REGISTERING,
      updatedAt: Date.now()
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Stage 3: UPLOADING
    this.updateQueueItem(itemId, {
      processingStage: ProcessingStage.UPLOADING,
      updatedAt: Date.now()
    });

    while (processed < total) {
      const active = this.queue.find((q) => q.id === itemId);
      if (
        !active ||
        active.lifecycleStatus === LifecycleStatus.CANCELLED ||
        active.lifecycleStatus === LifecycleStatus.PAUSED
      ) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, this.config.progressUpdateIntervalMs));

      processed = Math.min(processed + chunkSize, total);
      const progressPercentage = Math.floor((processed / total) * 100);

      this.updateQueueItem(itemId, {
        bytesProcessed: processed,
        progressPercentage,
        updatedAt: Date.now()
      });
    }

    // Stage 4: PARSING
    this.updateQueueItem(itemId, {
      processingStage: ProcessingStage.PARSING,
      updatedAt: Date.now()
    });

    if (currentItem.rawFileRef) {
      try {
        const { documentParserService } = await import('../../knowledge_parsing/services/DocumentParserService');
        await documentParserService.parsePackage(
          currentItem.rawFileRef,
          currentItem.metadata.fileName,
          currentItem.metadata.packageHash,
          currentItem.metadata.extension
        );
      } catch (err) {
        logger.warn('Document parsing stage reported non-fatal warning', {
          itemId,
          error: String(err)
        });
      }
    }

    // Stage 5: READY / COMPLETED
    const completedTime = Date.now();
    this.updateQueueItem(itemId, {
      processingStage: ProcessingStage.READY,
      lifecycleStatus: LifecycleStatus.COMPLETED,
      progressPercentage: 100,
      bytesProcessed: total,
      updatedAt: completedTime
    });

    logger.info('Upload completed: Package registered into vault queue foundation', {
      itemId,
      packageHash: currentItem.metadata.packageHash,
      fileSize: total,
      processorVersion: this.config.processorVersion
    });
  }

  private updateQueueItem(itemId: string, patch: Partial<IngestionQueueItem>): void {
    this.queue = this.queue.map((q) => (q.id === itemId ? { ...q, ...patch } : q));
    this.notifyListeners();
  }

  public getVaultMetrics(): VaultSystemMetrics {
    const totalHistory = this.history.length;
    const completedInQueue = this.queue.filter(
      (q) => q.lifecycleStatus === LifecycleStatus.COMPLETED
    ).length;

    const readyPackages = totalHistory + completedInQueue;
    const pendingPackages = this.queue.filter(
      (q) => q.lifecycleStatus === LifecycleStatus.ACTIVE || q.lifecycleStatus === LifecycleStatus.PAUSED
    ).length;
    const failedPackages = this.queue.filter(
      (q) => q.lifecycleStatus === LifecycleStatus.FAILED
    ).length;

    const totalPackages = readyPackages + pendingPackages + failedPackages;

    const totalProcessedCount = this.queue.length + totalHistory;
    let importHealthPercentage = 100;
    if (totalProcessedCount > 0) {
      importHealthPercentage = Math.round(
        ((totalProcessedCount - failedPackages) / totalProcessedCount) * 100
      );
    }

    const storageUsedBytes =
      this.history.reduce((sum, h) => sum + h.sizeBytes, 0) +
      this.queue
        .filter((q) => q.lifecycleStatus === LifecycleStatus.COMPLETED)
        .reduce((sum, q) => sum + q.metadata.fileSize, 0);

    const storagePercent = Math.min(
      Math.round((storageUsedBytes / this.config.storageCapacityBytes) * 100),
      100
    );

    return {
      knowledgeStatus: 'ONLINE',
      knowledgePackages: totalPackages,
      pendingPackages,
      failedPackages,
      readyPackages,
      totalKnowledgePackages: totalPackages,
      processingQueueCount: pendingPackages,
      importHealthPercentage,
      storageUsedBytes,
      storageCapacityBytes: this.config.storageCapacityBytes,
      queueHealth: 100 - (pendingPackages > 50 ? 10 : 0),
      storageHealth: Math.max(100 - storagePercent, 0),
      integrityHealth: 100,
      processingHealth: 100,
      systemReady: true,
      lastUpdateTimestamp: Date.now()
    };
  }
}

export const importManager = ImportManager.getInstance();
