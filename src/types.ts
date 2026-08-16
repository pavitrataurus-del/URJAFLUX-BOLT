export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface PipelineStageInfo {
  id: StageId;
  name: string;
  shortName: string;
  description: string;
  estimatedProgress: number; // Percentage, e.g. Stage 11 is 91.6% - 96%
}

export type StageStatus = 'pending' | 'running' | 'completed' | 'fallback' | 'failed';

export interface StageExecutionState {
  stageId: StageId;
  status: StageStatus;
  progress: number; // 0 - 100 overall
  detail: string;
  startedAt?: number;
  completedAt?: number;
  isFallbackTriggered?: boolean;
  fallbackReason?: string;
}

export interface PipelineLogEntry {
  id: string;
  timestamp: string;
  stageId: StageId;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  payloadSnapshot?: Record<string, unknown>;
}

export interface DocumentUploadParams {
  fileName: string;
  fileSizeMB: number;
  pageCount: number;
  documentType: string;
  simulatedHangOnStage11?: boolean;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  fileSizeMB: number;
  pageCount: number;
  uploadedAt: string;
  status: 'processing' | 'indexed' | 'fallback_indexed' | 'failed';
  currentStage: StageId;
  progress: number;
  sanitized: boolean;
  chunkCount: number;
  graphNodesCount: number;
  vectorDimensions: number;
  metadata: {
    title: string;
    category: string;
    author?: string;
    tags: string[];
    rawPayloadSizeKB: number;
    persistedPayloadSizeKB: number;
    firestoreWriteMode: 'direct' | 'sanitized_fallback' | 'failed';
  };
}
