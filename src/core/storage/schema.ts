// URJAFLUX Enterprise Knowledge Base V2 - Schema Definitions
// Database: URJAFLUX_KB_V2

export const DB_NAME = "URJAFLUX_KB_V2";
export const DB_VERSION = 1;
export const STORAGE_ENGINE_VERSION = "URJAFLUX_KB_V2_ENGINE_1.0";

export enum KBStoreName {
  BOOKS = "books",
  CHAPTERS = "chapters",
  SECTIONS = "sections",
  TOPICS = "topics",
  RULES = "rules",
  FORMULAS = "formulas",
  EVIDENCE = "evidence",
  IMAGES = "images",
  OCR_PAGES = "ocr_pages",
  GRAPH_NODES = "graph_nodes",
  GRAPH_EDGES = "graph_edges",
  SEARCH_INDEX = "search_index",
  EMBEDDINGS = "embeddings",
  IMPORT_JOBS = "import_jobs",
  KNOWLEDGE_VERSIONS = "knowledge_versions",
  AUDIT_LOGS = "audit_logs",
  PDF_BINARIES = "pdf_binaries"
}

export type KnowledgeVisibility = "PRIVATE" | "INTERNAL" | "PUBLIC";
export type KnowledgeApprovalStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "DEPRECATED";

// ============================================================================
// 1. STORE ITEM INTERFACES
// ============================================================================

export interface BookStoreItem {
  id: string; // KeyPath: id (e.g. BOOK-1001-A1B2)
  title: string;
  author: string;
  publisher: string;
  edition: string;
  language: string;
  category: string;
  subCategory?: string;
  tags: string[];
  status: "draft" | "active" | "archived" | "deprecated";
  version: string;
  visibility: KnowledgeVisibility;
  pageCount?: number;
  fileSizeBytes?: number;
  format: string;
  checksum?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterStoreItem {
  id: string; // CH-2001-C3D4
  bookId: string;
  title: string;
  chapterNumber: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionStoreItem {
  id: string; // SECTION-3001-E5F6
  bookId: string;
  chapterId: string;
  title: string;
  sectionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface TopicStoreItem {
  id: string; // TOPIC-4001-G7H8
  bookId: string;
  chapterId: string;
  sectionId?: string;
  topicName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleStoreItem {
  id: string; // RULE-5001-I9J0
  bookId: string;
  chapterId?: string;
  topicId?: string;
  title: string;
  statement: string;
  category: string;
  direction?: string; // N, NE, E, SE, S, SW, W, NW, Center
  version: string;
  approvalStatus: KnowledgeApprovalStatus;
  visibility: KnowledgeVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface FormulaStoreItem {
  id: string; // FORMULA-6001-K1L2
  bookId: string;
  ruleId?: string;
  formulaName: string;
  expression: string;
  variables: { name: string; symbol: string; description: string; unit?: string }[];
  outputType: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceStoreItem {
  id: string; // EVIDENCE-9001-M3N4
  ruleId: string;
  bookId: string;
  chapter: string;
  page: number;
  paragraph: string;
  confidence: number; // 0.0 - 1.0
  evidenceNotes: string;
  sanskritVerse?: string;
  translation?: string;
  createdAt: string;
}

export interface ImageStoreItem {
  id: string;
  bookId: string;
  pageNumber: number;
  imageBlobUrl?: string;
  base64Data?: string;
  mimeType: string;
  caption?: string;
  createdAt: string;
}

export interface OCRPageStoreItem {
  id: string;
  bookId: string;
  pageNumber: number;
  extractedText: string;
  ocrConfidence: number;
  language: string;
  wordCount: number;
  processedAt: string;
}

export interface GraphNodeStoreItem {
  id: string;
  bookId: string;
  type: "book" | "chapter" | "section" | "topic" | "rule" | "formula" | "concept" | "remedy" | "object" | "direction" | "planet" | "element";
  label: string;
  properties: Record<string, unknown>;
  createdAt: string;
}

export interface GraphEdgeStoreItem {
  id: string;
  sourceId: string;
  targetId: string;
  relationshipType: "references" | "depends_on" | "explains" | "derived_from" | "related_to" | "contradicts" | "supports" | "used_in" | "mentioned_in";
  weight?: number;
  properties?: Record<string, unknown>;
  createdAt: string;
}

export interface SearchIndexStoreItem {
  id: string;
  bookId: string;
  token: string;
  entityType: "rule" | "formula" | "chapter" | "topic" | "evidence";
  entityId: string;
  tfIdfScore: number;
  contextSnippet: string;
  createdAt: string;
}

export interface EmbeddingStoreItem {
  id: string;
  bookId: string;
  entityId: string;
  provider: string; // e.g., "google" | "local"
  model: string;    // e.g., "text-embedding-004"
  dimensions: number;
  vector: number[];
  textChunk: string;
  createdAt: string;
}

export interface ImportJobStoreItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  bookId?: string;
  status: "QUEUED" | "PARSING" | "OCR" | "CHUNKING" | "EMBEDDING" | "COMPLETED" | "FAILED";
  progressPercentage: number;
  currentPage: number;
  totalPages: number;
  errorMessage?: string;
  stageTimingsMs?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeVersionStoreItem {
  id: string;
  entityId: string;
  entityType: string;
  versionNumber: number;
  previousVersionId?: string;
  changeReason: string;
  administratorNotes?: string;
  snapshot: Record<string, unknown>;
  createdDate: string;
  updatedDate: string;
}

export interface AuditLogStoreItem {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  details: Record<string, unknown>;
}

export type StorageStatusType = "STORED" | "ARCHIVED" | "CORRUPTED" | "DELETED";
export type ArchivalTierType = "HOT" | "WARM" | "COLD" | "GLACIER";

export interface PdfBinaryRetentionMetadata {
  retentionPolicy: string;
  immutableArchive: boolean;
  expirationDate?: string;
  archivalTier: ArchivalTierType;
}

export interface PdfBinaryStoreItem {
  id: string; // Storage ID (e.g., PDF-ARCHIVE-<hash>)
  fileName: string;
  fileSizeBytes: number;
  sha256Hash: string;
  mimeType: string;
  binaryData?: ArrayBuffer | Uint8Array | string; // Base64 or ArrayBuffer
  storageStatus: StorageStatusType;
  storageDriver: string; // "INDEXED_DB" | "LOCAL_FILE" | "CLOUD_STORAGE"
  uploadTimestamp: string;
  lastVerifiedTimestamp: string;
  retentionMetadata: PdfBinaryRetentionMetadata;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// 2. STORE METADATA FOR INDEXEDDB INITIALIZATION
// ============================================================================

export interface IndexDefinition {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
}

export interface StoreDefinition {
  name: KBStoreName;
  keyPath: string;
  autoIncrement?: boolean;
  indexes: IndexDefinition[];
}

export const KB_STORE_DEFINITIONS: StoreDefinition[] = [
  {
    name: KBStoreName.BOOKS,
    keyPath: "id",
    indexes: [
      { name: "title", keyPath: "title" },
      { name: "author", keyPath: "author" },
      { name: "version", keyPath: "version" },
      { name: "updatedAt", keyPath: "updatedAt" },
      { name: "visibility", keyPath: "visibility" },
      { name: "status", keyPath: "status" }
    ]
  },
  {
    name: KBStoreName.CHAPTERS,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "chapterNumber", keyPath: "chapterNumber" },
      { name: "title", keyPath: "title" }
    ]
  },
  {
    name: KBStoreName.SECTIONS,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "chapterId", keyPath: "chapterId" },
      { name: "sectionNumber", keyPath: "sectionNumber" }
    ]
  },
  {
    name: KBStoreName.TOPICS,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "chapterId", keyPath: "chapterId" },
      { name: "topicName", keyPath: "topicName" }
    ]
  },
  {
    name: KBStoreName.RULES,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "category", keyPath: "category" },
      { name: "direction", keyPath: "direction" },
      { name: "version", keyPath: "version" },
      { name: "approvalStatus", keyPath: "approvalStatus" },
      { name: "visibility", keyPath: "visibility" }
    ]
  },
  {
    name: KBStoreName.FORMULAS,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "ruleId", keyPath: "ruleId" },
      { name: "formulaName", keyPath: "formulaName" }
    ]
  },
  {
    name: KBStoreName.EVIDENCE,
    keyPath: "id",
    indexes: [
      { name: "ruleId", keyPath: "ruleId" },
      { name: "bookId", keyPath: "bookId" },
      { name: "confidence", keyPath: "confidence" }
    ]
  },
  {
    name: KBStoreName.IMAGES,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "pageNumber", keyPath: "pageNumber" }
    ]
  },
  {
    name: KBStoreName.OCR_PAGES,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "pageNumber", keyPath: "pageNumber" },
      { name: "ocrConfidence", keyPath: "ocrConfidence" }
    ]
  },
  {
    name: KBStoreName.GRAPH_NODES,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "type", keyPath: "type" },
      { name: "label", keyPath: "label" }
    ]
  },
  {
    name: KBStoreName.GRAPH_EDGES,
    keyPath: "id",
    indexes: [
      { name: "sourceId", keyPath: "sourceId" },
      { name: "targetId", keyPath: "targetId" },
      { name: "relationshipType", keyPath: "relationshipType" }
    ]
  },
  {
    name: KBStoreName.SEARCH_INDEX,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "token", keyPath: "token" },
      { name: "entityType", keyPath: "entityType" }
    ]
  },
  {
    name: KBStoreName.EMBEDDINGS,
    keyPath: "id",
    indexes: [
      { name: "bookId", keyPath: "bookId" },
      { name: "entityId", keyPath: "entityId" },
      { name: "provider", keyPath: "provider" },
      { name: "model", keyPath: "model" }
    ]
  },
  {
    name: KBStoreName.IMPORT_JOBS,
    keyPath: "id",
    indexes: [
      { name: "status", keyPath: "status" },
      { name: "createdAt", keyPath: "createdAt" },
      { name: "bookId", keyPath: "bookId" }
    ]
  },
  {
    name: KBStoreName.KNOWLEDGE_VERSIONS,
    keyPath: "id",
    indexes: [
      { name: "entityId", keyPath: "entityId" },
      { name: "entityType", keyPath: "entityType" },
      { name: "versionNumber", keyPath: "versionNumber" }
    ]
  },
  {
    name: KBStoreName.AUDIT_LOGS,
    keyPath: "id",
    indexes: [
      { name: "timestamp", keyPath: "timestamp" },
      { name: "action", keyPath: "action" },
      { name: "actorId", keyPath: "actorId" }
    ]
  },
  {
    name: KBStoreName.PDF_BINARIES,
    keyPath: "id",
    indexes: [
      { name: "sha256Hash", keyPath: "sha256Hash", unique: true },
      { name: "fileName", keyPath: "fileName" },
      { name: "storageStatus", keyPath: "storageStatus" },
      { name: "uploadTimestamp", keyPath: "uploadTimestamp" }
    ]
  }
];
