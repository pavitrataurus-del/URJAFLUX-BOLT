// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE VAULT DATA MODEL & TYPES (PHASE 2)
// Domain-Independent Single Source of Truth Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";

export type { KnowledgeDomain };

export type VaultApprovalStatus = 
  | 'DRAFT'
  | 'PENDING_FOUNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DEPRECATED';

export type VaultKnowledgeCategory = 
  | 'RULE'
  | 'PRINCIPLE'
  | 'OBSERVATION'
  | 'POSITIVE_FINDING'
  | 'DOSHA'
  | 'CAUSE'
  | 'EFFECT'
  | 'CONDITION'
  | 'EXCEPTION'
  | 'REMEDY'
  | 'ALTERNATIVE_REMEDY'
  | 'CONTRAINDICATION'
  | 'DEFINITION'
  | 'CITATION';

export type QualitativeConfidenceLevel = 
  | 'ABSOLUTE_CANONICAL'
  | 'HIGH_AUTHORITY'
  | 'MODERATE_CONSENSUS'
  | 'TENTATIVE_OPINION';

export type RelationshipType = 
  | 'RULE_TO_EXCEPTION'
  | 'RULE_TO_REMEDY'
  | 'RULE_TO_POSITIVE_FINDING'
  | 'RULE_TO_RELATED_RULE'
  | 'RULE_TO_RELATED_DOMAIN'
  | 'RULE_TO_SUPPORTING_EVIDENCE'
  | 'RULE_TO_CONTRADICTORY_OPINION'
  | 'RULE_TO_FOUNDER_NOTE'
  | 'RULE_TO_FUTURE_RESEARCH';

export type PrivacyLevel = 
  | 'INTERNAL_EVIDENCE_ONLY'
  | 'PUBLIC_CONCLUSION_ONLY'
  | 'FULL_ACCESS';

export interface IVaultAuthorInfo {
  authorId: string;
  authorName: string;
  credibilityScore: number; // 0.0 - 100.0
  primaryAffiliation?: string;
  historicalEra?: string;
}

export interface IVaultSourceMetadata {
  sourceId: string;
  bookTitle: string;
  authorInfo: IVaultAuthorInfo;
  edition: string;
  publicationYear?: number;
  publicationPlace?: string;
  publisher?: string;
  language: string; // Sanskrit, Hindi, English, Hinglish, etc.
  domain: KnowledgeDomain;
  isbnOrRef?: string;
  fileSizeBytes?: number;
  checksum: string;
}

export interface IKnowledgeHierarchyNode {
  domain: KnowledgeDomain;
  bookTitle: string;
  chapter: string;
  topic: string;
  subtopic: string;
  nodePath: string; // e.g., "Vastu/Brihat Samhita/Chapter 53/Vastu Vidya/Ishan Zone"
}

export interface IVaultKnowledgePayload {
  title: string;
  statement: string; // Structured statement of knowledge
  rule?: string;
  principle?: string;
  observation?: string;
  positiveFinding?: string;
  dosha?: string;
  cause?: string;
  effect?: string;
  remedy?: string;
  conditions: string[];
  exceptions: string[];
  remedies: string[];
  alternativeRemedies: string[];
  contraindications: string[];
  targetZones: string[];
  targetPlanets: string[];
  targetChakras: string[];
  targetElements: string[];
}

export interface IVaultConfidenceScore {
  score: number; // 0.0 to 1.0
  qualitativeLevel: QualitativeConfidenceLevel;
  evidencePriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';
}

export interface IVaultEvidence {
  verbatimQuote: string;
  rawSnippet: string;
  pageNumber: number;
  lineStart: number;
  lineEnd: number;
  paragraphRef: number;
  chapterSection: string;
}

export interface IVaultCitation {
  citationId: string;
  sourceId: string;
  bookTitle: string;
  authorName: string;
  edition: string;
  pageNumber: number;
  lineStart: number;
  lineEnd: number;
  paragraphRef: number;
  chapterSection: string;
  exactEvidenceQuote: string;
  traceabilityHash: string;
}

export interface IKnowledgeRelationship {
  relationshipId: string;
  sourceRecordId: string;
  targetRecordId: string;
  relationshipType: RelationshipType;
  weight: number; // 0.0 to 1.0 strength indicator
  notes?: string;
  createdAt: string;
}

export interface IFounderNote {
  approvedBy: string;
  approvedAt: string;
  founderComments?: string;
  privacyLevel: PrivacyLevel;
  editHistory: Array<{
    timestamp: string;
    editor: string;
    fieldChanged: string;
    previousValue: string;
    newValue: string;
  }>;
}

export interface IVaultVersionInfo {
  version: string; // e.g. "1.0.0"
  createdAt: string;
  replacesRecordId?: string;
  isDeprecated: boolean;
  deprecationReason?: string;
  replacementRecordId?: string;
  versionHistory: Array<{
    version: string;
    timestamp: string;
    changedBy: string;
    summary: string;
  }>;
}

export interface IAuditTrailEntry {
  auditId: string;
  timestamp: string;
  action: string;
  actor: string;
  notes: string;
  recordHashAtAction: string;
}

/**
 * Universal Knowledge Vault Record — Single Source of Truth
 */
export interface IVaultKnowledgeRecord {
  recordId: string;
  immutableHash: string;
  approvalStatus: VaultApprovalStatus;
  versionInfo: IVaultVersionInfo;
  auditHistory: IAuditTrailEntry[];
  sourceMetadata: IVaultSourceMetadata;
  hierarchyLocation: IKnowledgeHierarchyNode;
  category: VaultKnowledgeCategory;
  knowledgePayload: IVaultKnowledgePayload;
  confidence: IVaultConfidenceScore;
  evidence: IVaultEvidence;
  citation: IVaultCitation;
  relationships: IKnowledgeRelationship[];
  founderNotes: IFounderNote;
  crossReferences: string[]; // List of related Vault Record IDs
  relatedDomains: KnowledgeDomain[];
}

/**
 * Public Presentation Record — Founder Rule Masking Layer
 * Mask internal book details, preserving conclusion & evidence hash for user reports.
 */
export interface IPublicVaultRecordView {
  recordId: string;
  domain: KnowledgeDomain;
  category: VaultKnowledgeCategory;
  title: string;
  statement: string;
  rule?: string;
  dosha?: string;
  cause?: string;
  effect?: string;
  conditions: string[];
  exceptions: string[];
  remedies: string[];
  alternativeRemedies: string[];
  contraindications: string[];
  confidenceLevel: QualitativeConfidenceLevel;
  evidenceHash: string;
  version: string;
}
