// ============================================================================
// KNOWLEDGE EMBEDDING ENGINE TYPES & INTERFACES (PHASE 3)
// Locks 39 (Indexes Only, Not Knowledge), 40 (Permanent Traceable Linkage), 41 (Never Replaces Retrieval)
// ============================================================================

import { KnowledgeProvenance, SourceCitation } from "../../../types/semanticKnowledge";

export type SemanticObjectType = 
  | "DYNAMIC_CONCEPT"
  | "CONCEPT"
  | "RULE"
  | "EXCEPTION"
  | "RELATIONSHIP"
  | "FORMULA"
  | "TABLE"
  | "CITATION"
  | "PARAGRAPH"
  | "CROSS_DOMAIN_LINK";

export interface EmbeddingObject {
  id: string;
  vector: number[];
  semanticObjectId: string;
  documentId: string;
  knowledgeDomain: string;
  version: number;
  embeddingModelVersion: string;
  knowledgeVersion: string;
  documentVersion: number;
  citation: SourceCitation;
  provenance: KnowledgeProvenance;
  objectType: SemanticObjectType;
  textHash: string;
  createdDate: string;
  lastUpdated: string;
}

export type ReembeddingTargetType = 
  | "DOCUMENT"
  | "CONCEPT"
  | "SEMANTIC_OBJECT"
  | "DOMAIN"
  | "EVERYTHING";

export type QueueJobStatus = 
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface EmbeddingJob {
  jobId: string;
  targetType: ReembeddingTargetType;
  targetId: string;
  status: QueueJobStatus;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
}

// ============================================================================
// PROVIDER ABSTRACTION INTERFACES
// ============================================================================

export interface IEmbeddingProvider {
  name: string;
  modelVersion: string;
  dimensions: number;
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}

// ============================================================================
// ADMIN EMBEDDING METRICS & ANALYTICS
// ============================================================================

export interface AdminEmbeddingMetrics {
  totalEmbeddings: number;
  queuedJobsCount: number;
  failedJobsCount: number;
  cacheHitRate: number; // percentage 0-100
  averageGenerationTimeMs: number;
  averageVectorSize: number;
  modelVersionDistribution: Record<string, number>;
  timestamp: string;
}
