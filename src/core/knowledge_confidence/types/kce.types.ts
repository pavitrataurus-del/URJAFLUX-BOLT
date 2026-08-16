// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE CONFIDENCE EVALUATION ENGINE (KCE) TYPES
// Domain-Independent Deterministic Confidence Evaluation Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory, IVaultCitation, IVaultEvidence } from "../../knowledge_vault/types/vaultRecord.types";
import { IApplicableKnowledgePackage, IApplicableRuleMatch, IRemedyCandidateItem } from "../../knowledge_intelligence/types/kie.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

/**
 * 15 Configurable Confidence Evaluation Dimensions
 */
export type ConfidenceDimensionType =
  | 'EVIDENCE_COMPLETENESS'
  | 'CITATION_COMPLETENESS'
  | 'TRACEABILITY_INTEGRITY'
  | 'FOUNDER_APPROVAL_INTEGRITY'
  | 'RELATIONSHIP_INTEGRITY'
  | 'CROSS_DOMAIN_SUPPORT'
  | 'CONDITION_MATCHING_QUALITY'
  | 'EXCEPTION_COVERAGE'
  | 'SPATIAL_MATCHING_QUALITY'
  | 'CLIENT_CONTEXT_MATCHING_QUALITY'
  | 'KNOWLEDGE_FRESHNESS'
  | 'EDITION_TRACKING'
  | 'SOURCE_AUTHENTICITY'
  | 'EVIDENCE_CONTINUITY'
  | 'GRAPH_CONSISTENCY';

/**
 * Configurable Confidence Band Level
 */
export type ConfidenceBandLevel =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MODERATE'
  | 'LIMITED'
  | 'INSUFFICIENT_EVIDENCE';

/**
 * Score breakdown per confidence dimension
 */
export interface IDimensionScore {
  dimension: ConfidenceDimensionType;
  rawScore: number;     // 0.0 to 1.0
  weightedScore: number; // rawScore * weight
  weight: number;       // Configurable weight (default sums to 1.0)
  explanation: string;
}

/**
 * Perspective slice within a complete Confidence Profile
 */
export interface IConfidenceProfilePerspective {
  score: number; // 0.0 to 1.0
  band: ConfidenceBandLevel;
  explanation: string;
}

/**
 * Founder Correction 1: Complete Multi-Dimensional Confidence Profile
 */
export interface IConfidenceProfile {
  evidenceConfidence: IConfidenceProfilePerspective;
  citationConfidence: IConfidenceProfilePerspective;
  spatialConfidence: IConfidenceProfilePerspective;
  clientContextConfidence: IConfidenceProfilePerspective;
  relationshipConfidence: IConfidenceProfilePerspective;
  crossDomainConfidence: IConfidenceProfilePerspective;
  knowledgeIntegrityConfidence: IConfidenceProfilePerspective;
  founderIntegrityConfidence: IConfidenceProfilePerspective;
  overallConfidence: IConfidenceProfilePerspective;
}

/**
 * Founder Correction 3: Dedicated Confidence Warning Layer
 */
export type ConfidenceWarningType =
  | 'LIMITED_CITATIONS'
  | 'EXCEPTION_EXISTS'
  | 'CROSS_DOMAIN_DIFFERENCE'
  | 'FOUNDER_NOTE_AVAILABLE'
  | 'PARTIAL_SPATIAL_MATCH'
  | 'UNVERIFIED_EVIDENCE_HASH'
  | 'REMEDY_MATERIAL_SPECIFICITY_NOTE';

export interface IConfidenceWarning {
  warningCode: string;
  warningType: ConfidenceWarningType;
  severity: 'INFO' | 'WARNING' | 'CRITICAL_ATTENTION';
  message: string;
  contextualNotes?: string;
}

/**
 * Founder Correction 4: Expandable Confidence Explanation Tree Node
 */
export interface IConfidenceExplanationNode {
  nodeId: string;
  label: string;
  status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LIMITED' | 'ATTENTION';
  score: number;
  explanation: string;
  children?: IConfidenceExplanationNode[];
}

/**
 * Configurable Rules & Weights for Confidence Engine
 */
export interface IConfidenceEvaluationConfig {
  configVersion: string;
  dimensionWeights: Record<ConfidenceDimensionType, number>;
  bandThresholds: {
    veryHigh: number; // e.g., >= 0.85
    high: number;     // e.g., >= 0.70
    moderate: number; // e.g., >= 0.50
    limited: number;  // e.g., >= 0.30
  };
  customRulesEnabled?: boolean;
}

/**
 * Evaluated Confidence Record for an Applicable Rule Candidate
 */
export interface IEvaluatedRuleConfidence {
  ruleId: string;
  knowledgeRecordId: string;
  domain: KnowledgeDomain;
  category: VaultKnowledgeCategory;
  
  overallConfidenceScore: number; // 0.0 to 1.0
  confidenceBand: ConfidenceBandLevel;
  
  // Founder Corrections 1, 3, 4
  confidenceProfile: IConfidenceProfile;
  confidenceWarnings: IConfidenceWarning[];
  explanationTree: IConfidenceExplanationNode;
  
  dimensionScores: IDimensionScore[];
  explainabilityReasons: string[];
  
  supportingEvidenceHashes: string[];
  citationReferences: string[];
  
  // Founder Correction 5: Original Evidence & Citations for Consultant Transparency
  originalEvidence: IVaultEvidence[];
  originalCitations: IVaultCitation[];
  
  // Founder Correction 7: Immutable Auditability
  trace: {
    knowledgeRecordId: string;
    ruleId: string;
    evidenceHash: string;
    citationId: string;
    relationshipChain: string[];
    founderApprovalReference: string;
    engineVersion: string;
    evaluationVersion: string;
    evaluationTimestamp: string;
    confidenceConfigurationVersion: string;
  };
}

/**
 * Founder Correction 2: Independent Evaluated Confidence Record for a Remedy Candidate
 */
export interface IEvaluatedRemedyConfidence {
  remedyCandidateId: string;
  primaryRemedyText: string;
  originatingRecordId: string;
  originatingRuleId: string;
  
  overallConfidenceScore: number; // 0.0 to 1.0
  confidenceBand: ConfidenceBandLevel;
  
  // Founder Corrections 1, 3, 4: Independent Remedy Profile & Tree
  confidenceProfile: IConfidenceProfile;
  confidenceWarnings: IConfidenceWarning[];
  explanationTree: IConfidenceExplanationNode;
  
  dimensionScores: IDimensionScore[];
  explainabilityReasons: string[];
  
  supportingEvidenceHashes: string[];
  citationReferences: string[];
  
  // Consultant Transparency
  originalEvidence: IVaultEvidence[];
  originalCitations: IVaultCitation[];
  
  // Immutable Auditability
  trace: {
    remedyCandidateId: string;
    originatingRecordId: string;
    originatingRuleId: string;
    evidenceHash: string;
    citationId: string;
    relationshipChain: string[];
    founderApprovalReference: string;
    engineVersion: string;
    evaluationVersion: string;
    evaluationTimestamp: string;
    confidenceConfigurationVersion: string;
  };
}

/**
 * Immutable Confidence Evaluation Package Output
 */
export interface IConfidenceEvaluationPackage {
  packageId: string;
  kiePackageId: string;
  evaluationTimestamp: string;
  
  // Evaluated Rule Candidates Confidence
  evaluatedRuleConfidences: IEvaluatedRuleConfidence[];
  
  // Evaluated Remedy Candidates Confidence (Independent Profiles)
  evaluatedRemedyConfidences: IEvaluatedRemedyConfidence[];
  
  // Summary Stats
  summaryStats: {
    totalEvaluatedRules: number;
    totalEvaluatedRemedies: number;
    veryHighCount: number;
    highCount: number;
    moderateCount: number;
    limitedCount: number;
    insufficientEvidenceCount: number;
    averageConfidenceScore: number;
  };
  
  // Evaluation Metadata
  evaluationMetadata: {
    evaluationConfigUsed: IConfidenceEvaluationConfig;
    engineVersion: string;
    evaluationVersion: string;
    pipelineDurationMs: number;
  };
}

