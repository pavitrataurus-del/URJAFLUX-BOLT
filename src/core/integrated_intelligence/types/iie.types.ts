// ============================================================================
// URJAFLUX AI OS - INTEGRATED INTELLIGENCE ENGINE (IIE) TYPES
// Master Consultation Integration & Best Remedy Selection Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory, IVaultCitation, IVaultEvidence } from "../../knowledge_vault/types/vaultRecord.types";
import { IApplicableKnowledgePackage, IApplicableRuleMatch, IRemedyCandidateItem } from "../../knowledge_intelligence/types/kie.types";
import { IConfidenceEvaluationPackage, IEvaluatedRuleConfidence, IEvaluatedRemedyConfidence, IConfidenceProfile } from "../../knowledge_confidence/types/kce.types";
import { IConflictResolutionPackage, IConflictRecord, IAlternativeKnowledgePath } from "../../conflict_resolution/types/cre.types";
import { IClientContextProfile, ISpatialContextData } from "../../knowledge_intelligence/types/kie.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

/**
 * Priority Tier for Integrated Recommendations
 */
export type RecommendationPriority =
  | 'CRITICAL_IMMEDIATE'  // Highest priority (e.g. major energy blockage or severe Vastu dosha)
  | 'HIGH_PRIORITY'       // Major improvement impact
  | 'MEDIUM_PRIORITY'     // Moderate impact or secondary zone
  | 'LOW_PRIORITY'        // Minor optimization
  | 'OPTIONAL_ENHANCEMENT';

/**
 * Execution Roadmap Time Horizon Phase
 */
export type ExecutionPhase =
  | 'IMMEDIATE_ACTION'      // 0 - 7 Days (e.g. non-structural relocation or color therapy)
  | 'SHORT_TERM_ACTION'     // 1 - 4 Weeks (e.g. elemental strips, copper/brass installation)
  | 'MEDIUM_TERM_ACTION'    // 1 - 3 Months (e.g. room repurposing or pyramid installations)
  | 'LONG_TERM_ACTION'      // 3 - 12 Months (e.g. major structural adjustments)
  | 'OPTIONAL_PATH';

/**
 * Structural Intervention Category
 */
export type StructuralCategory =
  | 'NON_STRUCTURAL'  // Zero demolition/alteration (e.g. strips, colors, symbols, mirrors)
  | 'SEMI_STRUCTURAL' // Minor additions (e.g. partitions, wall treatments)
  | 'STRUCTURAL'      // Construction or architectural change
  | 'LOW_BUDGET'      // Cost-effective alternative
  | 'PREMIUM';        // High-end material solution

/**
 * Selected Best Remedy Candidate
 */
export interface IBestRemedyCandidate {
  remedyId: string;
  candidateId: string;
  primaryRemedyText: string;
  alternativeRemedies: string[];
  
  targetDomain: KnowledgeDomain;
  targetZoneOrDirection: string;
  targetObjectOrRoom?: string;
  
  selectionRationale: string;
  priority: RecommendationPriority;
  executionPhase: ExecutionPhase;
  structuralCategory: StructuralCategory;
  
  confidenceScore: number;
  confidenceBand: string;
  confidenceProfile: IConfidenceProfile;
  
  originatingRecordId: string;
  originatingRuleId: string;
  evidenceHashes: string[];
  citationIds: string[];
  relationshipChain: string[];
  founderApprovalReference: string;
}

/**
 * Compatibility Relationship between Remedies
 */
export interface IRemedyCompatibilityLink {
  sourceRemedyId: string;
  targetRemedyId: string;
  relationshipType: 
    | 'COMPATIBLE_SYNERGY'
    | 'SEQUENTIAL_PREREQUISITE'
    | 'MUTUALLY_EXCLUSIVE'
    | 'CONDITIONAL_ALTERNATIVE'
    | 'CROSS_DOMAIN_ENHANCEMENT';
  explanation: string;
}

/**
 * Comprehensive Remedy Compatibility Matrix
 */
export interface IRemedyCompatibilityMatrix {
  compatibilityLinks: IRemedyCompatibilityLink[];
  mutuallyExclusivePairs: Array<{ remedyA: string; remedyB: string; reason: string }>;
  synergisticClusters: Array<{ clusterName: string; remedyIds: string[]; expectedSynergy: string }>;
}

/**
 * Implementation Roadmap Action Item
 */
export interface IRoadmapActionItem {
  actionId: string;
  stepNumber: number;
  phase: ExecutionPhase;
  title: string;
  description: string;
  associatedRemedyIds: string[];
  structuralCategory: StructuralCategory;
  estimatedComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX' | 'PROFESSIONAL_REQUIRED';
  estimatedCostCategory: 'ZERO_COST' | 'LOW' | 'MEDIUM' | 'HIGH';
  prerequisiteActionIds: string[];
  expectedObjective: string;
}

/**
 * Structured Product Input Preparation Package (Not marketplace, pure product context)
 */
export interface IProductPreparationItem {
  productId: string;
  associatedRemedyId: string;
  requiredProductCategory: string;
  optionalProductCategory: string;
  materialList: string[];
  recommendedQuantity?: string;
  installationType: string;
  marketplaceTags: string[];
  affiliateCompatibility: boolean;
  internalProductCompatibility: boolean;
  specifications: Record<string, string>;
}

export interface IProductPreparationPackage {
  items: IProductPreparationItem[];
  totalRequiredProducts: number;
  totalOptionalProducts: number;
}

/**
 * Integrated Consultation Finding
 */
export interface IIntegratedFinding {
  findingId: string;
  title: string;
  domain: KnowledgeDomain;
  spatialZone: string;
  description: string;
  doshaOrEffect: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MINOR';
  associatedRuleIds: string[];
  associatedRecordIds: string[];
  confidenceScore: number;
}

/**
 * Consultant Decision Layer (Modifiable annotations by professional consultants without altering raw data)
 */
export interface IConsultantDecisionItem {
  remedyId: string;
  consultantStatus: 'ACCEPTED' | 'REJECTED' | 'REORDERED' | 'REPLACED' | 'ANNOTATED';
  consultantNotes?: string;
  customPriorityOverride?: RecommendationPriority;
  customSequenceOverride?: number;
  replacementRemedyText?: string;
}

export interface IConsultantDecisionLayer {
  consultantId?: string;
  evaluationTimestamp: string;
  decisions: IConsultantDecisionItem[];
  isLockedForClient: boolean;
}

/**
 * Immutable Integrated Consultation Package Output (IIE Output)
 */
export interface IIntegratedConsultationPackage {
  packageId: string;
  kiePackageId: string;
  kcePackageId: string;
  crePackageId: string;
  timestamp: string;
  
  // Primary Integrated Intelligence Output
  integratedFindings: IIntegratedFinding[];
  bestRemedyCandidates: IBestRemedyCandidate[];
  alternativeRemedyCandidates: IBestRemedyCandidate[];
  
  // Roadmap & Compatibility
  executionRoadmap: IRoadmapActionItem[];
  compatibilityMatrix: IRemedyCompatibilityMatrix;
  
  // Product Preparation
  productPreparationPackage: IProductPreparationPackage;
  
  // Consultant Decision Layer
  consultantDecisionLayer: IConsultantDecisionLayer;
  
  // Summaries & Summarized Inputs
  crossDomainSummary: {
    involvedDomains: KnowledgeDomain[];
    crossDomainSynergiesCount: number;
    crossDomainConflictsCount: number;
  };
  conflictSummary: {
    totalConflicts: number;
    directContradictions: number;
    alternativePathsCount: number;
    alternativePaths: IAlternativeKnowledgePath[];
  };
  
  // Auditable Evidence & Citations
  evidencePackage: IVaultEvidence[];
  citationPackage: IVaultCitation[];
  
  // Execution Metadata
  executionMetadata: {
    engineVersion: string;
    pipelineDurationMs: number;
    totalRulesProcessed: number;
    totalRemediesEvaluated: number;
    selectedBestRemediesCount: number;
  };
}
