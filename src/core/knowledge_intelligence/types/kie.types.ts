// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE INTELLIGENCE ENGINE (KIE) TYPES
// Applicable Knowledge Transformation & Client-Spatial Application Types
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory, IVaultCitation, IVaultEvidence } from "../../knowledge_vault/types/vaultRecord.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

/**
 * Client Context Profile Input
 */
export interface IClientContextProfile {
  clientId?: string;
  clientGoals?: string[];
  clientProblems?: string[];
  propertyType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'LAND' | 'APARTMENT' | string;
  ownership?: 'OWNED' | 'RENTED' | 'LEASED' | string;
  budgetLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'FLEXIBLE' | string;
  restrictions?: string[];
  preferences?: string[];
  familyStructure?: {
    membersCount?: number;
    childrenCount?: number;
    eldersCount?: number;
    occupations?: string[];
    [key: string]: any;
  };
  appointmentContext?: string;
  metadata?: Record<string, any>;
}

/**
 * Spatial Recognition & Recognition Context Input
 */
export interface ISpatialContextData {
  roomType?: string;
  objectType?: string;
  direction?: string;
  zone?: string;
  element?: string;
  planet?: string;
  chakra?: string;
  activity?: string;
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    area?: number;
    unit?: 'FEET' | 'METERS' | string;
  };
  distances?: Record<string, number>;
  adjacency?: string[];
  blueprintObjectRelationships?: Array<{
    objectId: string;
    relatedObjectId: string;
    relationType: string;
  }>;
  objectIntelligenceData?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Runtime Evaluation Session
 */
export interface IKieEvaluationSession {
  sessionId: string;
  clientId?: string;
  propertyId?: string;
  evaluationTimestamp: string;
  activeDomains: KnowledgeDomain[];
}

/**
 * Traceability and Explainability metadata for each applicable rule match
 */
export interface IKieRuleTraceability {
  knowledgeRecordId: string;
  citationId: string;
  evidenceHash: string;
  sourceHash: string;
  relationshipChain: string[];
  version: string;
  founderApprovalReference: string;
  explainability: {
    triggerSource: string;
    matchedObjects: string[];
    matchedDirection: string;
    matchedZone: string;
    matchedConditions: string[];
    matchedClientContext: string[];
    matchedSpatialContext: string[];
    relationshipPath: string[];
    knowledgeRecordId: string;
    evidenceHash: string;
    citationId: string;
    founderApprovalReference: string;
  };
}

/**
 * Individual Applicable Rule Match item
 */
export interface IApplicableRuleMatch {
  ruleId: string;
  knowledgeRecordId: string;
  domain: KnowledgeDomain;
  category: VaultKnowledgeCategory;
  matchTriggerReason: string;
  matchedDimensions: {
    matchedDirections: string[];
    matchedZones: string[];
    matchedElements: string[];
    matchedPlanets: string[];
    matchedRooms: string[];
    matchedObjects: string[];
  };
  trace: IKieRuleTraceability;
}

/**
 * Logical Intelligence Grouping: Issue Cluster
 */
export interface IIssueCluster {
  clusterId: string;
  issueName: string;
  domain: KnowledgeDomain;
  relatedRecordIds: string[];
  conditions: string[];
  exceptions: string[];
  remedyCandidateIds: string[];
}

/**
 * Logical Intelligence Grouping: Object Cluster
 */
export interface IObjectCluster {
  clusterId: string;
  objectType: string;
  triggeredRuleIds: string[];
  conditions: string[];
  exceptions: string[];
  doshas: string[];
  remedyCandidateIds: string[];
}

/**
 * Logical Intelligence Grouping: Direction/Zone Cluster
 */
export interface IDirectionCluster {
  clusterId: string;
  directionOrZone: string;
  triggeredRuleIds: string[];
  doshas: string[];
  remedies: string[];
  domains: KnowledgeDomain[];
}

/**
 * Logical Intelligence Grouping: Element Cluster
 */
export interface IElementCluster {
  clusterId: string;
  elementName: string;
  triggeredRuleIds: string[];
  remedies: string[];
}

/**
 * Logical Intelligence Grouping: Planet Cluster
 */
export interface IPlanetCluster {
  clusterId: string;
  planetName: string;
  triggeredRuleIds: string[];
  remedies: string[];
}

/**
 * Logical Intelligence Grouping: Room Cluster
 */
export interface IRoomCluster {
  clusterId: string;
  roomType: string;
  triggeredRuleIds: string[];
  remedies: string[];
}

/**
 * Logical Intelligence Grouping: Activity Cluster
 */
export interface IActivityCluster {
  clusterId: string;
  activityName: string;
  triggeredRuleIds: string[];
}

/**
 * Logical Intelligence Grouping: Domain Cluster
 */
export interface IDomainCluster {
  domain: KnowledgeDomain;
  ruleIds: string[];
  recordIds: string[];
  doshas: string[];
  remedies: string[];
}

/**
 * Cross-Domain Intelligence Package
 */
export interface ICrossDomainPackage {
  packageId: string;
  spatialScope: {
    direction?: string;
    zone?: string;
    room?: string;
    object?: string;
  };
  involvedDomains: KnowledgeDomain[];
  domainKnowledgeRecords: Array<{
    domain: KnowledgeDomain;
    recordId: string;
    dosha?: string;
    remedy?: string;
  }>;
  interDomainRelationships: Array<{
    sourceDomain: KnowledgeDomain;
    targetDomain: KnowledgeDomain;
    relType: string;
  }>;
}

/**
 * Remedy Candidate Collection Item (Unfiltered, unprioritized)
 */
export interface IRemedyCandidateItem {
  remedyCandidateId: string;
  primaryRemedyText: string;
  alternativeRemedies: string[];
  originatingRecordId: string;
  originatingRuleId: string;
  applicableDomains: KnowledgeDomain[];
  conditions: string[];
  exceptions: string[];
  relationshipChain: string[];
  evidenceReferences: string[];
  citationReferences: string[];
}

/**
 * Immutable Intelligence Preparation Package Output (Knowledge Intelligence Package)
 */
export interface IApplicableKnowledgePackage {
  packageId: string;
  timestamp: string;
  evaluationSessionId: string;
  clientContextSummary: IClientContextProfile;
  spatialContextSummary: ISpatialContextData;

  // Applicable Knowledge Collections
  applicableRules: IApplicableRuleMatch[];
  applicableKnowledgeIds: string[];
  applicableConditions: string[];
  applicableExceptions: string[];
  applicablePositiveFindings: string[];
  applicableDoshas: string[];
  applicableRemedies: string[];
  applicableAlternativeRemedies: string[];

  // Logical Intelligence Clusters
  issueClusters: IIssueCluster[];
  objectClusters: IObjectCluster[];
  directionClusters: IDirectionCluster[];
  zoneClusters: IDirectionCluster[];
  elementClusters: IElementCluster[];
  planetClusters: IPlanetCluster[];
  roomClusters: IRoomCluster[];
  activityClusters: IActivityCluster[];
  domainClusters: IDomainCluster[];

  // Cross-Domain & Remedy Candidates
  crossDomainPackages: ICrossDomainPackage[];
  remedyCandidateCollections: IRemedyCandidateItem[];

  // Citations & Evidence
  applicableEvidence: IVaultEvidence[];
  applicableCitations: IVaultCitation[];

  // Cross-Domain Relationships & Chains
  applicableCrossDomainRelationships: Array<{
    sourceDomain: KnowledgeDomain;
    targetDomain: KnowledgeDomain;
    relationshipType: string;
    sourceRecordId: string;
    targetRecordId: string;
  }>;
  relationshipChains: string[];
  triggerChains: string[];

  // Metadata
  executionMetadata: {
    totalEvaluatedRecords: number;
    applicableRulesCount: number;
    executionDurationMs: number;
    engineVersion: string;
  };
  ruleTriggerMetadata: Array<{
    ruleId: string;
    triggerConditions: string[];
    triggerDomain: KnowledgeDomain;
  }>;
  contextMetadata: {
    evaluatedDomains: KnowledgeDomain[];
    activePropertyType: string;
  };
}

export type IKnowledgeIntelligencePackage = IApplicableKnowledgePackage;
