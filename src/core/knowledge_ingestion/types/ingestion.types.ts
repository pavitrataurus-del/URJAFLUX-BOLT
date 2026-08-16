export enum ProcessingStage {
  QUEUED = 'QUEUED',
  VALIDATING = 'VALIDATING',
  REGISTERING = 'REGISTERING',
  UPLOADING = 'UPLOADING',
  OCR_PENDING = 'OCR_PENDING',
  OCR_PROCESSING = 'OCR_PROCESSING',
  PARSING = 'PARSING',
  KNOWLEDGE_EXTRACTION = 'KNOWLEDGE_EXTRACTION',
  NORMALIZING = 'NORMALIZING',
  INDEXING = 'INDEXING',
  READY = 'READY'
}

export enum LifecycleStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export type SupportedFileExtension = 'pdf' | 'epub' | 'docx' | 'txt' | 'md' | 'jpg' | 'jpeg' | 'png' | 'tiff' | 'tif';

export interface FileMetadata {
  readonly fileId: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly fileType: string;
  readonly extension: SupportedFileExtension;
  readonly packageHash: string;
  readonly uploadedAt: number;
}

export interface IngestionQueueItem {
  readonly id: string;
  readonly metadata: FileMetadata;
  readonly processingStage: ProcessingStage;
  readonly lifecycleStatus: LifecycleStatus;
  readonly progressPercentage: number;
  readonly bytesProcessed: number;
  readonly totalBytes: number;
  readonly errorMessage?: string;
  readonly retryCount: number;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly rawFileRef?: File;
}

export interface ValidationRuleResult {
  readonly isValid: boolean;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

export interface FileValidationResult {
  readonly file: File;
  readonly isValid: boolean;
  readonly errors: readonly ValidationRuleResult[];
  readonly metadata?: FileMetadata;
}

export interface QueueValidationResult {
  readonly isValid: boolean;
  readonly totalFiles: number;
  readonly validFiles: readonly FileValidationResult[];
  readonly invalidFiles: readonly FileValidationResult[];
  readonly duplicatesDetected: number;
}

export interface VaultSystemMetrics {
  readonly knowledgeStatus: 'ONLINE' | 'DEGRADED' | 'MAINTENANCE';
  readonly knowledgePackages: number;
  readonly pendingPackages: number;
  readonly failedPackages: number;
  readonly readyPackages: number;
  readonly totalKnowledgePackages: number; // Backward compatibility
  readonly processingQueueCount: number; // Backward compatibility
  readonly importHealthPercentage: number;
  readonly storageUsedBytes: number;
  readonly storageCapacityBytes: number;
  readonly queueHealth: number;
  readonly storageHealth: number;
  readonly integrityHealth: number;
  readonly processingHealth: number;
  readonly systemReady: boolean;
  readonly lastUpdateTimestamp: number;
}

export interface ImportHistoryEntry {
  readonly id: string;
  readonly packageHash: string;
  readonly extension: SupportedFileExtension;
  readonly sizeBytes: number;
  readonly lifecycleStatus: LifecycleStatus;
  readonly processingStage: ProcessingStage;
  readonly startedAt?: number;
  readonly completedAt: number;
  readonly processingDuration?: number;
  readonly processorVersion?: string;
  readonly pipelineVersion?: string;
}

export type LogLevel = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  readonly timestamp: number;
  readonly level: LogLevel;
  readonly event: string;
  readonly details: Record<string, unknown>;
}

export type IngestionListener = (queue: readonly IngestionQueueItem[], metrics: VaultSystemMetrics) => void;
