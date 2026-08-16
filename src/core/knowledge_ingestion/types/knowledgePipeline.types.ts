// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE INGESTION & VALIDATION PIPELINE TYPES (PHASE 1)
// ============================================================================

import { KnowledgeDomain } from "./universalIngestion.types";

export type { KnowledgeDomain };

export type SourceFormat = 
  | 'BOOK'
  | 'EBOOK'
  | 'PDF'
  | 'SCANNED_PDF'
  | 'DOC'
  | 'VIDEO_TRANSCRIPT'
  | 'AUDIO_TRANSCRIPT';

export type FounderApprovalStatus = 
  | 'DRAFT'
  | 'PENDING_FOUNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUEST_RECLEANING';

export type EvidencePriority = 
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'STANDARD';

export type KnowledgeItemType = 
  | 'RULE'
  | 'CONDITION'
  | 'EXCEPTION'
  | 'POSITIVE_FINDING'
  | 'DOSHA'
  | 'REMEDY'
  | 'DEFINITION'
  | 'CITATION';

export interface IKnowledgeSourceRegistration {
  sourceId: string;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  publicationYear?: number;
  language: string; // Sanskrit, Hindi, English, Hinglish
  domain: KnowledgeDomain;
  sourceFormat: SourceFormat;
  isbnOrRef?: string;
  fileSizeBytes: number;
  uploadedAt: string;
  founderStatus: FounderApprovalStatus;
  sourceQualityScore: number;
  checksum: string;
  mediaDurationSeconds?: number; // For video/audio transcripts
}

export interface IOCRValidationResult {
  sourceId: string;
  isScanned: boolean;
  usedOcr: boolean;
  overallConfidence: number;
  languageDetected: string;
  pageCount: number;
  extractedImagesCount: number;
  extractedTablesCount: number;
  rawExtractedText: string;
}

export interface ILineDetail {
  lineIndex: number;
  pageNumber: number;
  rawText: string;
  cleanText: string;
  isValid: boolean;
  confidence: number;
  noiseScore: number;
  isHeading?: boolean;
  isVerseMarker?: boolean;
}

export interface ILineValidationReport {
  sourceId: string;
  totalLines: number;
  validLinesCount: number;
  corruptedLinesCount: number;
  overallNoiseRatio: number;
  lines: ILineDetail[];
}

export interface IPageDetail {
  pageNumber: number;
  lineCount: number;
  characterCount: number;
  hasHeadersFooters: boolean;
  densityScore: number;
  isValid: boolean;
}

export interface IPageValidationReport {
  sourceId: string;
  totalPages: number;
  validPagesCount: number;
  missingPagesDetected: number[];
  pages: IPageDetail[];
}

export interface ICleanedContent {
  sourceId: string;
  rawText: string;
  cleanText: string;
  strippedHeadersCount: number;
  strippedFootersCount: number;
  normalizedWhitespaceRatio: number;
  sanitizedCharacterCount: number;
}

export interface ICitationMapping {
  citationId: string;
  sourceId: string;
  sourceTitle: string;
  author: string;
  edition: string;
  pageNumber: number;
  lineStart: number;
  lineEnd: number;
  paragraphRef: number;
  chapterSection: string;
  exactEvidenceQuote: string;
  traceabilityHash: string;
}

export interface IStructuredKnowledgeItem {
  id: string;
  sourceId: string;
  itemType: KnowledgeItemType;
  title: string;
  content: string;
  rawQuote: string;
  domain: KnowledgeDomain;
  targetZones: string[];
  targetPlanets: string[];
  targetChakras: string[];
  conditions: string[];
  exceptions: string[];
  remedies: string[];
  evidencePriority: EvidencePriority;
  confidenceScore: number;
  pageNumber: number;
  lineStart: number;
  lineEnd: number;
  chapterSection: string;
  citation: ICitationMapping;
}

export interface IKnowledgeMetadata {
  domain: KnowledgeDomain;
  author: string;
  edition: string;
  publicationYear: number;
  language: string;
  chapterTopics: string[];
  extractedRulesCount: number;
  extractedDoshasCount: number;
  extractedRemediesCount: number;
}

export interface IFounderReviewItem {
  reviewId: string;
  sourceId: string;
  knowledgeItem: IStructuredKnowledgeItem;
  founderStatus: FounderApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewer: string;
  founderComments?: string;
  editedContent?: Partial<IStructuredKnowledgeItem>;
}

export interface IVaultKnowledgeRecord {
  recordId: string;
  sourceId: string;
  knowledgeItem: IStructuredKnowledgeItem;
  version: string;
  vaultApprovedAt: string;
  approvedBy: string;
  immutableHash: string;
  provenanceChain: string[];
}

export interface IPipelineExecutionResult {
  source: IKnowledgeSourceRegistration;
  ocrResult: IOCRValidationResult;
  lineValidation: ILineValidationReport;
  pageValidation: IPageValidationReport;
  cleanedContent: ICleanedContent;
  extractedMetadata: IKnowledgeMetadata;
  parsedItems: IStructuredKnowledgeItem[];
  reviewQueueItems: IFounderReviewItem[];
  pipelineQualityScore: number;
  executionTimeMs: number;
  status: 'COMPLETED' | 'PENDING_FOUNDER_APPROVAL' | 'FAILED';
  warnings: string[];
  errors: string[];
}
