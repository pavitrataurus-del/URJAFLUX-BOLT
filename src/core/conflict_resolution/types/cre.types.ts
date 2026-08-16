// ============================================================================
// URJAFLUX AI OS - CONFLICT RESOLUTION ENGINE (CRE) TYPES
// Intellectual Honesty & Preserved Multi-School Conflict Classification Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory, IVaultCitation, IVaultEvidence } from "../../knowledge_vault/types/vaultRecord.types";
import { IApplicableKnowledgePackage, IApplicableRuleMatch, IRemedyCandidateItem } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage, IEvaluatedRuleConfidence, IEvaluatedRemedyConfidence, IConfidenceProfile } from "../../knowledge_confidence/types/kce.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

/**
 * Supported Conflict Categories in Founder-Approved Knowledge
 */
export type ConflictType =
  | 'RULE_CONFLICT'
  | 'REMEDY_CONFLICT'
  | 'CONDITION_CONFLICT'
  | 'EXCEPTION_CONFLICT'
  | 'PRIORITY_CONFLICT'
  | 'SEQUENCE_CONFLICT'
  | 'DOMAIN_CONFLICT'
  | 'SPATIAL_CONFLICT'
  | 'MEASUREMENT_CONFLICT'
  | 'TERMINOLOGY_CONFLICT'
  | 'INTERPRETATION_CONFLICT'
  | 'CROSS_DOMAIN_CONFLICT'
  | 'FOUNDER_NOTE_CONFLICT';

/**
 * Severity Level of Detected Conflict
 */
export type ConflictSeverity =
  | 'DIRECT_CONTRADICTION'      // Direct opposing remedies or rules (e.g., Red vs Green marble)
  | 'PARTIAL_DIVERGENCE'        // Differing conditions or exceptions in different classical books
  | 'SCHOOL_DIFFERENCE'          // Different traditional classical schools of thought
  | 'CROSS_DOMAIN_VARIANCE'      // Variance across Vastu vs LalKitab vs Numerology vs Astrology
  | 'INFORMATIONAL_ALTERNATIVE'; // Alternative valid approach without strict opposition

/**
 * Scope of Conflict Impact
 */
export type ConflictScope =
  | 'PROPERTY_WIDE'
  | 'ZONE_SPECIFIC'
  | 'OBJECT_SPECIFIC'
  | 'ELEMENT_SPECIFIC'
  | 'PLANET_SPECIFIC'
  | 'CLIENT_GOAL_SPECIFIC';

/**
 * Detailed Explanation of a Detected Conflict
 */
export interface IConflictExplainability {
  reasonWhyConflictExists: string;
  participatingKnowledgeRecordIds: string[];
  contributingBookTitles: string[];
  contributingCitations: string[];
  differingConditions: string[];
  differingExceptions: string[];
  differingSpatialContexts: string[];
  differingClientContexts: string[];
}

/**
 * Individual Detected Conflict Record
 */
export interface IConflictRecord {
  conflictId: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  scope: ConflictScope;
  conflictTitle: string;
  
  affectedDomains: KnowledgeDomain[];
  affectedRuleIds: string[];
  affectedRemedyCandidateIds: string[];
  affectedKnowledgeRecordIds: string[];
  
  affectedObjects: string[];
  affectedDirections: string[];
  affectedZones: string[];
  affectedElements: string[];
  affectedPlanets: string[];
  
  explainability: IConflictExplainability;
  
  participatingRuleConfidences: IEvaluatedRuleConfidence[];
  participatingRemedyConfidences: IEvaluatedRemedyConfidence[];
  
  evidenceHashes: string[];
  citationIds: string[];
  relationshipChains: string[];
  founderApprovalReferences: string[];
}

/**
 * Logical Grouping of Related Conflicts (e.g. Zone-level or Object-level)
 */
export interface IConflictGroup {
  groupId: string;
  groupTitle: string;
  scope: ConflictScope;
  conflicts: IConflictRecord[];
  primaryDomain: KnowledgeDomain;
  involvedDomains: KnowledgeDomain[];
}

/**
 * Conflict Matrix Cell representing comparison between two rules/remedies
 */
export interface IConflictMatrixCell {
  cellId: string;
  sourceId: string; // Rule ID or Remedy ID
  targetId: string; // Rule ID or Remedy ID
  conflictType: ConflictType;
  severity: ConflictSeverity;
  divergenceSummary: string;
  isDirectContradiction: boolean;
}

/**
 * Preserved Alternative Knowledge Path (Intellectual Honesty)
 */
export interface IAlternativeKnowledgePath {
  pathId: string;
  pathTitle: string;
  classicalSchoolOrAuthor: string;
  sourceBookTitle: string;
  primaryDomain: KnowledgeDomain;
  recommendedRules: string[];
  recommendedRemedies: string[];
  associatedConfidence: number;
  reasoningAndContext: string;
  citations: IVaultCitation[];
}

/**
 * Immutable Conflict Resolution Package Output (CRE Output)
 */
export interface IConflictResolutionPackage {
  packageId: string;
  kiePackageId: string;
  kcePackageId: string;
  timestamp: string;
  
  // Conflicts & Groupings
  detectedConflicts: IConflictRecord[];
  conflictGroups: IConflictGroup[];
  conflictMatrix: IConflictMatrixCell[];
  alternativeKnowledgePaths: IAlternativeKnowledgePath[];
  
  // Auditable Evidence & Citation Sets
  evidenceSets: IVaultEvidence[];
  citationSets: IVaultCitation[];
  
  // Summaries & Statistics
  summaryStats: {
    totalConflictsDetected: number;
    directContradictionsCount: number;
    partialDivergencesCount: number;
    schoolDifferencesCount: number;
    crossDomainVariancesCount: number;
    affectedRulesCount: number;
    affectedRemediesCount: number;
  };
  
  // Execution Metadata
  executionMetadata: {
    engineVersion: string;
    pipelineDurationMs: number;
    rulesEvaluatedCount: number;
    remediesEvaluatedCount: number;
  };
}
