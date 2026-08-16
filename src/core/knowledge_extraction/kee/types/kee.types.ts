// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE EXTRACTION ENGINE (KEE) TYPES
// Domain-Independent Deterministic Knowledge Extraction Architecture
// ============================================================================

import { KnowledgeDomain } from "../../../knowledge_ingestion/types/universalIngestion.types";
import { RelationshipType } from "../../../knowledge_vault/types/vaultRecord.types";

/**
 * 29 Standardized Domain-Independent Knowledge Categories
 */
export type KeeKnowledgeCategory = 
  | 'DEFINITION'
  | 'PRINCIPLE'
  | 'RULE'
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
  | 'CAUTION'
  | 'LIMITATION'
  | 'EXAMPLE'
  | 'ILLUSTRATION_REFERENCE'
  | 'FORMULA'
  | 'MEASUREMENT'
  | 'DIRECTION'
  | 'ELEMENT'
  | 'PLANET'
  | 'CHAKRA'
  | 'OBJECT'
  | 'ROOM'
  | 'ACTIVITY'
  | 'REFERENCE'
  | 'CROSS_REFERENCE'
  | 'FUTURE_RESEARCH_MARKER';

export interface IKeeSourceReference {
  sourceId: string;
  bookTitle: string;
  authorName: string;
  edition: string;
  language: string; // Sanskrit, Hindi, Hinglish, English, etc.
  domain: KnowledgeDomain;
  chapterSection: string;
  pageNumber: number;
  lineStart: number;
  lineEnd: number;
  paragraphRef: number;
  traceabilityHash: string;
}

export interface IKeeInputContent {
  contentId: string;
  sourceReference: IKeeSourceReference;
  rawVerbatimText: string;
  mediaType: 'BOOK' | 'PDF' | 'SCANNED_PDF' | 'DOCUMENT' | 'VIDEO_TRANSCRIPT' | 'AUDIO_TRANSCRIPT';
  founderApprovalStatus: 'APPROVED';
  approvedBy: string;
  approvedAt: string;
}

export interface IKeeExtractedRelationship {
  relationshipId: string;
  sourceItemId: string;
  targetItemId: string;
  relationshipType: RelationshipType | string;
  weight: number;
  contextNote: string;
}

export interface IKeeExtractedItem {
  itemId: string;
  category: KeeKnowledgeCategory;
  verbatimSnippet: string; // Unaltered original text fragment
  originalFullContext: string; // Full paragraph context
  sourceReference: IKeeSourceReference;
  domainAttributes: {
    directions?: string[];
    elements?: string[];
    planets?: string[];
    chakras?: string[];
    objects?: string[];
    rooms?: string[];
    activities?: string[];
    formulas?: string[];
    measurements?: string[];
  };
  relationships: IKeeExtractedRelationship[];
  extractionTimestamp: string;
  extractionVersion: string;
  isLiteralUnmodified: boolean; // Guaranteed true - zero rewriting or interpretation
}

export interface IKeeExtractionResult {
  contentId: string;
  sourceId: string;
  domain: KnowledgeDomain;
  extractedItemsCount: number;
  extractedItems: IKeeExtractedItem[];
  relationships: IKeeExtractedRelationship[];
  extractionTimestamp: string;
  keeEngineVersion: string;
  traceabilityHash: string;
}
