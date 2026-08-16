// Enterprise Knowledge Intelligence Platform Domain Types
// Covers Modules 1 through 15 for URJAFLUX AI OS

export type AccessLevel = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
export type DocumentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED" | "DEPRECATED";
export type ChunkType = "PARAGRAPH" | "HEADING" | "CODE" | "FORMULA" | "TABLE" | "VERSE";

export interface KnowledgeDocumentMetadata {
  author?: string;
  publisher?: string;
  edition?: string;
  language?: string;
  category: string;
  subCategory?: string;
  tags: string[];
  accessLevel: AccessLevel;
  tenantId: string; // Tenant isolation boundary
  isGlobalCanon?: boolean; // Shared classical canon flag
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  tenantId: string;
  chunkIndex: number;
  content: string;
  type: ChunkType;
  headingPath?: string[]; // E.g. ["Chapter 1", "Section 1.2", "Topic Axis"]
  pageNumber?: number;
  verseNumber?: string;
  metadata: Record<string, unknown>;
  denseVector?: number[]; // Vector embedding
  sparseTokens?: Record<string, number>; // BM25 term frequencies
  tokenCount: number;
  createdAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: string; // e.g., "1.0.0"
  changeSummary: string;
  author: string;
  timestamp: string;
  snapshotContent: string;
  snapshotMetadata: KnowledgeDocumentMetadata;
}

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  summary?: string;
  content: string;
  metadata: KnowledgeDocumentMetadata;
  status: DocumentStatus;
  currentVersion: string;
  chunksCount: number;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
}

// Module 2: Ingestion Pipeline Types
export interface IngestionJob {
  id: string;
  tenantId: string;
  documentTitle: string;
  sourceType: "MARKDOWN" | "TXT" | "PDF" | "JSON" | "WEBHOOK" | "OCR_SCAN";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progressPercentage: number;
  extractedChunksCount: number;
  piiRedactedCount: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

// Module 3 & 11: Vector Embedding, Hybrid Search & Re-ranking
export interface VectorSearchParams {
  query: string;
  tenantId: string;
  topK?: number;
  categories?: string[];
  accessLevels?: AccessLevel[];
  minScoreThreshold?: number;
  useHybridSearch?: boolean;
  rrfK?: number; // Reciprocal Rank Fusion constant (default 60)
}

export interface SearchResultChunk {
  chunk: DocumentChunk;
  documentTitle: string;
  denseScore: number;
  sparseScore: number;
  rrfScore: number; // Combined Reciprocal Rank Fusion score
  rerankScore: number; // Final weighted score
  matchedKeywords: string[];
}

// Module 4: Knowledge Graph
export type GraphNodeType = "DOCUMENT" | "TOPIC" | "CONCEPT" | "RULE" | "FORMULA" | "EVIDENCE" | "EXCEPTION";
export type GraphEdgeType = "CONTAINS" | "DEFINES" | "REFERENCES" | "CALCULATES" | "COMPLEMENTS" | "CONTRADICTS" | "DEPENDS_ON";

export interface KnowledgeGraphNode {
  id: string;
  tenantId: string;
  type: GraphNodeType;
  label: string;
  description?: string;
  properties: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  id: string;
  tenantId: string;
  sourceId: string;
  targetId: string;
  type: GraphEdgeType;
  weight?: number;
  description?: string;
}

export interface GraphTriplet {
  subject: string;
  predicate: GraphEdgeType;
  object: string;
  tenantId: string;
  confidence: number;
}

// Module 5 & 6: RAG Retrieval, XAI & Citation Engine
export interface InlineCitation {
  id: string;
  citationIndex: number; // e.g., [1]
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chapter?: string;
  section?: string;
  pageNumber?: number;
  verseNumber?: string;
  snippet: string;
  confidenceScore: number;
}

export interface XAiReasoningStep {
  stepIndex: number;
  stageName: string; // E.g., "Query Disambiguation", "Context Retrieval", "Graph Triplet Expansion", "Claim Verification"
  description: string;
  evidenceUsed: string[];
  confidence: number;
}

export interface XAiResponse {
  query: string;
  tenantId: string;
  answerText: string;
  citations: InlineCitation[];
  reasoningChain: XAiReasoningStep[];
  groundingScore: number; // 0.0 - 1.0 score verifying claim vs source context
  overallConfidence: "HIGH" | "MEDIUM" | "LOW" | "UNSUPPORTED";
  retrievedChunksCount: number;
  graphTripletsExplored: number;
  executionTimeMs: number;
}

// Module 7: Governance & Audit Trail
export interface GovernanceAuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userRole: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "INGEST" | "EXPORT" | "SEARCH";
  resourceType: "DOCUMENT" | "CHUNK" | "GRAPH_NODE" | "KNOWLEDGE_PACK" | "REASONING_QUERY";
  resourceId: string;
  details: string;
  piiMasked: boolean;
  ipAddress?: string;
  timestamp: string;
}

// Module 8: Knowledge Feedback & RLHF Loop
export interface CitationFeedback {
  id: string;
  tenantId: string;
  query: string;
  responseId: string;
  citationId: string;
  userId: string;
  rating: "POSITIVE" | "NEGATIVE";
  feedbackType: "INACCURATE_CITATION" | "OUTDATED_SOURCE" | "HALLUCINATED_CLAIM" | "HELPFUL" | "PERFECT_MATCH";
  userCorrectionText?: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// Module 9: Custom Knowledge Pack
export interface KnowledgePackManifest {
  packId: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  createdDate: string;
  documentsCount: number;
  rulesCount: number;
  formulasCount: number;
  graphTripletsCount: number;
}

export interface KnowledgePackExport {
  manifest: KnowledgePackManifest;
  documents: KnowledgeDocument[];
  chunks: DocumentChunk[];
  graphNodes: KnowledgeGraphNode[];
  graphEdges: KnowledgeGraphEdge[];
}

// Module 12: Knowledge Analytics & Coverage
export interface KnowledgeAnalyticsOverview {
  totalDocuments: number;
  totalChunks: number;
  totalGraphNodes: number;
  totalGraphEdges: number;
  categoryDistribution: Record<string, number>;
  totalSearchQueries: number;
  averageRetrievalTimeMs: number;
  averageGroundingScore: number;
  knowledgeGapsDetected: {
    queryTopic: string;
    queryCount: number;
    avgConfidence: number;
    recommendation: string;
  }[];
  topReferencedSources: {
    documentTitle: string;
    citationCount: number;
  }[];
}

// Module 13: Auto-Sync & Webhooks
export interface AutoSyncSourceConfig {
  id: string;
  tenantId: string;
  sourceName: string;
  type: "REST_API" | "S3_BUCKET" | "GOOGLE_DRIVE" | "WEBHOOK";
  endpointUrl?: string;
  syncFrequencyMinutes: number;
  lastSyncAt?: string;
  nextSyncAt?: string;
  status: "ACTIVE" | "PAUSED" | "ERROR";
  documentsIngested: number;
  createdAt: string;
}
