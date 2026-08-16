// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE QUERY ENGINE (KQE) TYPES
// Domain-Independent Structured Knowledge Query & Assembly Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory, IVaultCitation, IVaultEvidence } from "../../knowledge_vault/types/vaultRecord.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

export type KqeQueryType =
  | 'OBJECT'
  | 'DIRECTION'
  | 'ROOM'
  | 'ZONE'
  | 'ELEMENT'
  | 'PLANET'
  | 'CHAKRA'
  | 'ACTIVITY'
  | 'RULE'
  | 'KNOWLEDGE_RECORD'
  | 'CITATION'
  | 'CROSS_REFERENCE'
  | 'COMPOUND_MULTI_FIELD';

/**
 * Structured Query Input schema
 */
export interface IKqeStructuredQuery {
  queryId?: string;
  domain?: KnowledgeDomain;
  queryType?: KqeQueryType;
  
  // Dimensional Filters
  objectType?: string;
  room?: string;
  direction?: string;
  zone?: string;
  element?: string;
  planet?: string;
  chakra?: string;
  activity?: string;
  spaceUsageType?: 'RESIDENTIAL' | 'COMMERCIAL' | 'APARTMENT' | 'INDUSTRIAL' | 'LAND' | string;
  
  // Specific Identifiers
  category?: VaultKnowledgeCategory;
  ruleId?: string;
  knowledgeRecordId?: string;
  citationId?: string;
  
  // Expansion options
  expandRelationships?: boolean; // Defaults to true
  maxExpansionDepth?: number;   // Defaults to 1 (direct links)
}

/**
 * Normalized Query representation after normalization step
 */
export interface IKqeNormalizedQuery extends Required<Omit<IKqeStructuredQuery, 'queryId'>> {
  queryId: string;
  normalizedTimestamp: string;
}

/**
 * Structured Data Output Package for Knowledge Intelligence Engine
 */
export interface IKqeQueryResultPackage {
  queryId: string;
  queryTimestamp: string;
  originalQuery: IKqeStructuredQuery;
  normalizedQuery: Partial<IKqeStructuredQuery>;
  
  // Discovered Identifiers
  matchingRuleIds: string[];
  matchingKnowledgeRecordIds: string[];
  matchingCategories: VaultKnowledgeCategory[];
  
  // Assembled Structured Knowledge Collections
  conditions: string[];
  exceptions: string[];
  positiveFindings: string[];
  doshas: string[];
  remedies: string[];
  alternativeRemedies: string[];
  contraindications: string[];
  
  // Citations & Evidence
  citations: IVaultCitation[];
  evidence: IVaultEvidence[];
  evidenceHashes: string[];
  
  // Cross References & Relations
  crossReferences: string[];
  relatedDomains: KnowledgeDomain[];
  
  // Version Information
  versionInformation: Array<{
    recordId: string;
    version: string;
    isDeprecated: boolean;
  }>;

  // Pipeline Execution Metadata
  executionMetadata: {
    totalRecordsEvaluated: number;
    matchingCount: number;
    pipelineDurationMs: number;
    relationshipExpandedCount: number;
    engineVersion: string;
  };
}
