// URJAFLUX Enterprise Streaming Import Engine - Data Types & Event Definitions

export type ImportJobStatus =
  | "QUEUED"
  | "VALIDATING"
  | "HASHING"
  | "DUPLICATE_CHECK"
  | "DUPLICATE_DETECTED"
  | "READING_METADATA"
  | "PAGE_STREAMING"
  | "CHECKPOINTING"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type DuplicateType = "EXACT_HASH" | "SAME_FILENAME" | "NEW_EDITION" | "NONE";

export type DuplicateResolution = "SKIP" | "REPLACE" | "NEW_VERSION";

export enum ImportEventType {
  IMPORT_STARTED = "IMPORT_STARTED",
  PAGE_STREAMED = "PAGE_STREAMED",
  CHECKPOINT_CREATED = "CHECKPOINT_CREATED",
  JOB_PAUSED = "JOB_PAUSED",
  JOB_RESUMED = "JOB_RESUMED",
  JOB_COMPLETED = "JOB_COMPLETED",
  JOB_FAILED = "JOB_FAILED",
  IMPORT_CANCELLED = "IMPORT_CANCELLED"
}

export interface ImportEvent {
  type: ImportEventType;
  jobId: string;
  timestamp: string;
  payload?: any;
}

export interface DocumentMetadata {
  title: string;
  author?: string;
  publisher?: string;
  edition?: string;
  language?: string;
  category?: string;
  totalPages: number;
  fileSizeBytes: number;
  mimeType: string;
  checksumSha256: string;
  isEncrypted?: boolean;
  format: string;
}

export interface ParsedPageChunk {
  pageNumber: number;
  totalPages: number;
  pageType: "text" | "image" | "pdf_page" | "structured";
  extractedText?: string;
  rawBuffer?: ArrayBuffer;
  dimensions?: { width: number; height: number };
  hasImages?: boolean;
  imageCount?: number;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicateType: DuplicateType;
  existingBookId?: string;
  existingBookTitle?: string;
  existingBookVersion?: string;
  checksumSha256: string;
}

export interface ImportJobMetrics {
  jobId: string;
  fileName: string;
  fileSizeBytes: number;
  fileSizeMB: number;
  parserType: string;
  status: ImportJobStatus;
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  bytesProcessed: number;
  speedPagesPerSec: number;
  speedMBPerSec: number;
  etaSeconds: number;
  memoryUsageMB: number;
  checkpointSavedCount: number;
  lastCheckpointPage: number;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  pauseReason?: string;
  failureReason?: string;
  duplicateInfo?: DuplicateDetectionResult;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: "MAX_SIZE_EXCEEDED" | "CORRUPTED_FILE" | "ENCRYPTED_PDF" | "UNSUPPORTED_FORMAT" | "EMPTY_DOCUMENT" | "PASSWORD_PROTECTED";
  details?: any;
}
