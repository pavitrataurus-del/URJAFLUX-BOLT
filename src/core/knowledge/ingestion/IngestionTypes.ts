import { ApprovalStatus } from "../namespace/NamespaceTypes";

export enum DocumentFormat {
  PDF = "PDF",
  DOCX = "DOCX",
  TXT = "TXT",
  MD = "MD",
  HTML = "HTML",
  UNKNOWN = "UNKNOWN"
}

export enum ImportStatus {
  PENDING = "PENDING",
  VALIDATING = "VALIDATING",
  EXTRACTING_METADATA = "EXTRACTING_METADATA",
  PROCESSING = "PROCESSING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface IDocumentMetadata {
  title?: string;
  author?: string;
  edition?: string;
  publisher?: string;
  language?: string;
  creationDate?: string;
  modificationDate?: string;
  namespaceId: string;
  sourceType: string;
  checksum: string;
  pageCount?: number;
  documentSize: number;
}

export interface IRegisteredDocument {
  id: string;
  fileId: string; // Reference to stored file
  version: string;
  format: DocumentFormat;
  metadata: IDocumentMetadata;
  approvalStatus: ApprovalStatus;
  importStatus: ImportStatus;
  processingProgress: number; // 0-100
  checkpoint?: string;
  errorMessage?: string;
}

export interface IChunk {
  id: string;
  documentId: string;
  index: number;
  content: string;
  startChar: number;
  endChar: number;
  metadata: Record<string, any>;
}

export interface IChunkingStrategy {
  type: "PAGE" | "PARAGRAPH" | "SECTION" | "HEADING" | "CUSTOM";
  maxSize?: number;
  overlap?: number;
}
