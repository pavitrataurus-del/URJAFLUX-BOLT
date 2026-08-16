import { SupportedFileExtension } from './ingestion.types';

export interface KnowledgeIngestionConfig {
  readonly allowedExtensions: readonly SupportedFileExtension[];
  readonly maxFileSizeBytes: number;
  readonly maxBatchFileCount: number;
  readonly storageCapacityBytes: number;
  readonly maxConcurrentImports: number;
  readonly retryLimits: number;
  readonly progressUpdateIntervalMs: number;
  readonly allowDuplicates: boolean;
  readonly futureOcrEnabled: boolean;
  readonly processorVersion: string;
  readonly pipelineVersion: string;
}

export interface QueueProcessorConfig {
  readonly maxConcurrentWorkers: number;
  readonly processingStrategy: 'FIFO' | 'LIFO' | 'PRIORITY' | 'ROUND_ROBIN';
  readonly retryPolicy: {
    readonly maxRetries: number;
    readonly backoffIntervalMs: number;
  };
}

export const DEFAULT_KNOWLEDGE_INGESTION_CONFIG: KnowledgeIngestionConfig = {
  allowedExtensions: ['pdf', 'epub', 'docx', 'txt', 'md', 'jpg', 'jpeg', 'png', 'tiff', 'tif'],
  maxFileSizeBytes: 52_428_800, // 50MB
  maxBatchFileCount: 100,
  storageCapacityBytes: 10 * 1024 * 1024 * 1024, // 10 GB
  maxConcurrentImports: 1,
  retryLimits: 3,
  progressUpdateIntervalMs: 100,
  allowDuplicates: false,
  futureOcrEnabled: true,
  processorVersion: '1.0.0-foundation',
  pipelineVersion: 'BUILD-019'
};

export const DEFAULT_QUEUE_PROCESSOR_CONFIG: QueueProcessorConfig = {
  maxConcurrentWorkers: 1,
  processingStrategy: 'FIFO',
  retryPolicy: {
    maxRetries: 3,
    backoffIntervalMs: 1000
  }
};
