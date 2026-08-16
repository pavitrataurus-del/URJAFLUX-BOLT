// ============================================================================
// URJAFLUX AI OS - RULE REGISTRY ENGINE (RRE) TYPES
// Domain-Independent Structural Rule Organization & Indexing Architecture
// ============================================================================

import { KnowledgeDomain } from "../../knowledge_ingestion/types/universalIngestion.types";
import { VaultKnowledgeCategory } from "../../knowledge_vault/types/vaultRecord.types";

export type { KnowledgeDomain, VaultKnowledgeCategory };

export interface IRuleRegistryRecord {
  ruleId: string;
  knowledgeRecordIds: string[];
  domain: KnowledgeDomain;
  ruleCategory: VaultKnowledgeCategory;
  
  // Dimensional Metadata Arrays
  objectTypes: string[];
  rooms: string[];
  directions: string[];
  zones: string[];
  elements: string[];
  planets: string[];
  chakras: string[];
  activities: string[];

  // Linked Structural Asset ID Sets
  conditionIds: string[];
  exceptionIds: string[];
  causeIds: string[];
  effectIds: string[];
  positiveFindingIds: string[];
  doshaIds: string[];
  remedyIds: string[];
  alternativeRemedyIds: string[];
  contraindicationIds: string[];
  relatedRuleIds: string[];
  relatedDomainIds: KnowledgeDomain[];
  citationIds: string[];
  evidenceIds: string[];

  version: string;
  registeredAt: string;
  updatedAt: string;
}

export interface IRegistryIndexQuery {
  domain?: KnowledgeDomain;
  category?: VaultKnowledgeCategory;
  objectType?: string;
  room?: string;
  direction?: string;
  zone?: string;
  element?: string;
  planet?: string;
  chakra?: string;
  activity?: string;
}

export interface IRegistryIndexStats {
  totalRegisteredRules: number;
  domainCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  objectIndexSize: number;
  directionIndexSize: number;
  roomIndexSize: number;
  zoneIndexSize: number;
  elementIndexSize: number;
  planetIndexSize: number;
  chakraIndexSize: number;
  activityIndexSize: number;
}
