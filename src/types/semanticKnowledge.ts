// ============================================================================
// SEMANTIC KNOWLEDGE ENGINE TYPES & MODELS (PHASE 2B)
// Locks 30 (Semantic Integrity), 31 (Knowledge Provenance), 32 (Cross Domain)
// ============================================================================

import { BoundingCoordinates } from "./documentStructure";

/**
 * LOCK 31 — KNOWLEDGE PROVENANCE
 * Every semantic object must permanently store full source provenance.
 */
export interface KnowledgeProvenance {
  documentId: string;
  documentVersion: number;
  edition?: string;
  author: string;
  publisher?: string;
  uploadDate: string;
  administrator: string;
  knowledgeDomain: string;
  language: string;
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  subSectionId?: string;
  paragraphId: string;
  pageNumber: number;
  citation: string;
  ocrConfidence: number;
  sourceConfidence: number;
}

/**
 * Full Source Citation object tracing exact location in classical treatise.
 */
export interface SourceCitation {
  documentId: string;
  sourceDocument: string;
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  subSectionId?: string;
  paragraphId: string;
  pageNumber: number;
  rawCitationText: string;
  formattedCitation: string;
}

/**
 * LOCK 32 — CROSS DOMAIN LINKS
 * Cross-domain mapping framework between Vastu, Lal Kitab, Numerology, Astrology & Building Codes.
 */
export type TargetKnowledgeDomain = 
  | "VASTU_SHASTRA" 
  | "LAL_KITAB" 
  | "NUMEROLOGY" 
  | "ASTROLOGY" 
  | "BUILDING_STANDARDS" 
  | "ARCHITECTURAL_CODES";

export interface CrossDomainLink {
  id: string;
  sourceDomain: TargetKnowledgeDomain;
  targetDomain: TargetKnowledgeDomain;
  relationshipType: string;
  sourceEntity: string;
  targetEntityOrConcept: string;
  mappingRules: string[];
  notes?: string;
}

/**
 * Semantic Relationship between concepts/entities.
 */
export type RelationshipType = 
  | "belongs_to" 
  | "associated_with" 
  | "supports" 
  | "conflicts_with" 
  | "governed_by" 
  | "remedied_by" 
  | "enhances" 
  | "requires" 
  | "cross_references";

export interface SemanticRelationship {
  id: string;
  subjectId: string;
  subjectName: string;
  relation: RelationshipType;
  objectId: string;
  objectName: string;
  domain: string;
  provenance: KnowledgeProvenance;
  citation: SourceCitation;
}

/**
 * Semantic Concept Categories
 */
export type ConceptCategory = 
  | "DIRECTION" 
  | "ZONE" 
  | "ROOM" 
  | "ELEMENT" 
  | "PLANET" 
  | "NUMBER" 
  | "COLOR" 
  | "SYMBOL" 
  | "ENERGY_GRID" 
  | "FORMULA" 
  | "MEASUREMENT" 
  | "REMEDY" 
  | "RULE" 
  | "EXCEPTION";

export interface SemanticConcept {
  id: string;
  name: string;
  canonicalName: string;
  synonyms: string[];
  domain: string;
  category: ConceptCategory;
  definition: string;
  provenance: KnowledgeProvenance;
  citation: SourceCitation;
  crossDomainLinks: CrossDomainLink[];
}

/**
 * LOCK 30 — SEMANTIC RULE & EXCEPTION
 * Never split exceptions, quotations, or citations.
 */
export interface SemanticRule {
  id: string;
  ruleText: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  directionOrZone?: string;
  isException: boolean;
  exceptionsNote?: string;
  provenance: KnowledgeProvenance;
  citation: SourceCitation;
  relationships: SemanticRelationship[];
}

/**
 * LOCK 30 — SEMANTIC FORMULA & TABLE (Atomic)
 * Never split formulas or tables.
 */
export interface SemanticFormula {
  id: string;
  formulaName: string;
  expression: string;
  variables: Record<string, string>;
  explanation?: string;
  provenance: KnowledgeProvenance;
  citation: SourceCitation;
}

export interface SemanticTable {
  id: string;
  caption?: string;
  headers: string[];
  rows: string[][];
  rawMarkdown?: string;
  provenance: KnowledgeProvenance;
  citation: SourceCitation;
}

/**
 * Complete Semantic Document Model
 */
export interface SemanticDocumentModel {
  documentId: string;
  provenance: KnowledgeProvenance;
  concepts: SemanticConcept[];
  relationships: SemanticRelationship[];
  rules: SemanticRule[];
  formulae: SemanticFormula[];
  tables: SemanticTable[];
  crossDomainLinks: CrossDomainLink[];
  synonymMap: Record<string, string[]>;
  totalSemanticNodes: number;
}

// ============================================================================
// PHASE 2C — KNOWLEDGE-DRIVEN INTELLIGENCE ENGINE TYPES (LOCK 33)
// ============================================================================

export interface SourceDocumentReference {
  documentId: string;
  documentTitle: string;
  statement?: string;
  citation: SourceCitation;
  provenance: KnowledgeProvenance;
}

export interface KnowledgeConsensus {
  conceptId: string;
  canonicalName: string;
  frequency: number;
  agreementScore: number; // 0 to 100%
  confidence: number;     // 0 to 100%
  evidenceCount: number;
  supportingDocuments: SourceDocumentReference[];
  contradictingDocuments: SourceDocumentReference[];
  isConflicted: boolean;
}

export interface KnowledgeConflict {
  conflictId: string;
  topicOrConcept: string;
  sourceA: SourceDocumentReference;
  sourceB: SourceDocumentReference;
  conflictType: "DIRECT_CONTRADICTION" | "DIRECTIONAL_MISMATCH" | "SEVERITY_DISCREPANCY";
  recordedAt: string;
  status: "AWAITING_FUTURE_REASONING" | "RESOLVED";
}

export interface DynamicLearnedConcept {
  id: string;
  canonicalName: string;
  primaryCategory: ConceptCategory;
  discoveredSynonyms: string[];
  definitions: { text: string; provenance: KnowledgeProvenance; citation: SourceCitation }[];
  provenances: KnowledgeProvenance[];
  consensus: KnowledgeConsensus;
  sourcePriority: "DYNAMIC_KNOWLEDGE_BRAIN" | "FALLBACK_BOOTSTRAP";
}

export interface AdminKnowledgeAnalytics {
  totalConcepts: number;
  newConceptsDiscovered: number;
  mergedConcepts: number;
  conflictingConcepts: number;
  averageConsensusScore: number;
  mostReferencedConcepts: { conceptName: string; count: number }[];
  totalBooksProcessed: number;
  knowledgeGrowthRate: number;
  timestamp: string;
}

