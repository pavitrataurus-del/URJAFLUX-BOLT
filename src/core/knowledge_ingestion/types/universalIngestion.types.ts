export type DocumentFormat = 
  | 'PDF' 
  | 'SCANNED_PDF' 
  | 'DOCX' 
  | 'TXT' 
  | 'MARKDOWN' 
  | 'HTML' 
  | 'EPUB' 
  | 'IMAGE' 
  | 'AUDIO_TRANSCRIPT' 
  | 'VIDEO_TRANSCRIPT';

export type KnowledgeDomain = 
  | 'Vastu' 
  | 'Chakra' 
  | 'LalKitab' 
  | 'Numerology' 
  | 'Astrology' 
  | 'ResearchPaper' 
  | 'Book' 
  | 'Article' 
  | 'ReferenceManual' 
  | 'ExpertNotes' 
  | 'Unknown';

export type OCRLanguage = 'English' | 'Hindi' | 'Sanskrit' | 'Mixed';

export interface OCRPageMap {
  pageNumber: number;
  text: string;
  paragraphCount: number;
  lineCount: number;
  confidence: number;
  imagesExtracted: number;
  tablesExtracted: number;
}

export interface IOCRResult {
  language: OCRLanguage;
  overallConfidence: number;
  pageMappings: OCRPageMap[];
  paragraphMappings: { page: number; index: number; text: string }[];
  lineMappings: { page: number; line: number; text: string }[];
  extractedImages: { id: string; page: number; caption: string; base64Ref?: string }[];
  extractedTables: { id: string; page: number; title: string; rows: string[][] }[];
}

export interface IDocumentMetadata {
  title: string;
  author: string;
  publisher: string;
  edition: string;
  publicationYear: number;
  language: string;
  isbn?: string;
  documentType: string;
  domain: KnowledgeDomain;
  keywords: string[];
  sourceQuality: number;
  evidencePriority: 'HIGH' | 'MEDIUM' | 'LOW';
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  version: string;
}

export type ChunkType = 
  | 'RULE' 
  | 'TABLE' 
  | 'REMEDY' 
  | 'DEFINITION' 
  | 'ALGORITHM' 
  | 'MANTRA' 
  | 'NARRATIVE';

export interface ISmartChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  startPage: number;
  endPage: number;
  chunkType: ChunkType;
  startChar: number;
  endChar: number;
  parentChunkId?: string;
  childChunkIds: string[];
  crossChunkLinks: string[];
}

export type EntityType = 
  | 'OBJECT' 
  | 'ROOM' 
  | 'DIRECTION' 
  | 'ZONE' 
  | 'CHAKRA' 
  | 'ELEMENT' 
  | 'YANTRA' 
  | 'MANTRA' 
  | 'REMEDY' 
  | 'PLANET' 
  | 'NUMBER' 
  | 'DEITY' 
  | 'SYMBOL' 
  | 'COLOR' 
  | 'SHAPE' 
  | 'CRYSTAL' 
  | 'METAL' 
  | 'PLANT' 
  | 'DISEASE';

export interface IExtractedEntity {
  id: string;
  documentId: string;
  chunkId: string;
  name: string;
  canonicalName: string;
  entityType: EntityType;
  confidence: number;
  rawText: string;
  pageRef: number;
  paragraphRef: number;
  attributes: Record<string, string>;
  approvalStatus: 'Candidate' | 'Approved' | 'Rejected';
}

export type IngestionRelationshipType = 
  | 'SUPPORTS' 
  | 'BALANCES' 
  | 'BLOCKS' 
  | 'AFFECTS' 
  | 'LOCATED_IN' 
  | 'ASSOCIATED_WITH' 
  | 'CONNECTED_TO' 
  | 'CONFLICTS_WITH' 
  | 'INTERACTS_WITH' 
  | 'DEPENDS_ON' 
  | 'REMEDIED_BY' 
  | 'INFLUENCES' 
  | 'RELATED_TO';

export interface IExtractedRelationship {
  id: string;
  documentId: string;
  chunkId: string;
  sourceEntityId: string;
  sourceEntityName: string;
  targetEntityId: string;
  targetEntityName: string;
  relationshipType: IngestionRelationshipType;
  weight: number;
  evidenceText: string;
  pageRef: number;
  confidence: number;
  approvalStatus: 'Candidate' | 'Approved' | 'Rejected';
}

export interface INormalizationCandidate {
  id: string;
  rawTerm: string;
  suggestedCanonicalTerm: string;
  domain: KnowledgeDomain;
  similarityScore: number;
  synonyms: string[];
  status: 'Pending' | 'Approved' | 'Merged' | 'Rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface IDuplicateCandidate {
  id: string;
  itemType: 'Document' | 'Rule' | 'Remedy' | 'Mantra' | 'Entity' | 'Relationship';
  sourceId: string;
  sourceTitle: string;
  targetId: string;
  targetTitle: string;
  similarityScore: number;
  matchReason: string;
  status: 'Pending' | 'Merged' | 'Dismissed';
}

export interface IIngestionConflict {
  id: string;
  topic: string;
  sourceA: { id: string; title: string; claim: string; page: number };
  sourceB: { id: string; title: string; claim: string; page: number };
  conflictType: 'Contradictory Claim' | 'Scriptural Variance' | 'Clinical Difference';
  reviewStatus: 'Pending' | 'Approved' | 'Needs Revision' | 'Resolved';
  reviewerNotes?: string;
  reviewer?: string;
  resolvedAt?: string;
}

export interface IEvidencePayload {
  primarySource: string;
  supportingSources: string[];
  pageRef: number;
  paragraphRef: number;
  confidenceScore: number;
  evidenceCount: number;
  knowledgePriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  approvalStatus: 'DRAFT' | 'PENDING' | 'APPROVED';
}

export interface IIngestionQualityBreakdown {
  ocrQualityScore: number;
  metadataCompletenessScore: number;
  ontologyCompletenessScore: number;
  relationshipCompletenessScore: number;
  evidenceCompletenessScore: number;
  duplicateDeduction: number;
  conflictDeduction: number;
  overallQualityScore: number;
  qualityGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
}

export interface IExpertReviewAction {
  id: string;
  targetType: 'Document' | 'Chunk' | 'Entity' | 'Relationship' | 'Normalization' | 'Conflict' | 'Duplicate';
  targetId: string;
  action: 'Approve' | 'Reject' | 'Merge' | 'Split' | 'Edit' | 'Archive' | 'Restore' | 'Comment';
  actor: string;
  timestamp: string;
  comment: string;
  previousState?: string;
  newState?: string;
}

export interface IKnowledgeGraphSyncNode {
  id: string;
  entityId: string;
  canonicalName: string;
  entityType: EntityType;
  domain: KnowledgeDomain;
  isSyncApproved: boolean;
  syncedAt?: string;
  provenanceRef: string;
  bidirectionalEdgesCount: number;
}

export interface IAuditLogEntry {
  id: string;
  timestamp: string;
  importer: string;
  reviewer?: string;
  actionType: string;
  documentTitle: string;
  details: string;
  version: string;
  rollbackAvailable: boolean;
}

export interface IIngestionPipelinePackage {
  id: string;
  fileName: string;
  format: DocumentFormat;
  uploadedAt: string;
  fileSizeBytes: number;
  rawText?: string;
  ocrResult?: IOCRResult;
  metadata: IDocumentMetadata;
  chunks: ISmartChunk[];
  entities: IExtractedEntity[];
  relationships: IExtractedRelationship[];
  normalizations: INormalizationCandidate[];
  duplicates: IDuplicateCandidate[];
  conflicts: IIngestionConflict[];
  evidence: IEvidencePayload;
  quality: IIngestionQualityBreakdown;
  graphSyncNodes: IKnowledgeGraphSyncNode[];
  auditLogs: IAuditLogEntry[];
  reviewHistory: IExpertReviewAction[];
}
