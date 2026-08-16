// ============================================================================
// URJAFLUX AI OS - UNIVERSAL DOMAIN INTELLIGENCE FRAMEWORK (UDIF v1.1)
// Core Domain Intelligence, Schema, Identity & Routing Contracts
// ============================================================================

export type CoreSupportedDomain = 'VASTU' | 'LAL_KITAB' | 'NUMEROLOGY';

export type ExtendedSupportedDomain =
  | CoreSupportedDomain
  | 'AYURVEDA'
  | 'FENG_SHUI'
  | 'PYRAMID_SCIENCE'
  | 'GEOPATHIC_STRESS'
  | 'REIKI'
  | 'AURA'
  | 'SACRED_GEOMETRY'
  | string;

export type DomainStatus = 'ACTIVE' | 'EXPERIMENTAL' | 'DEPRECATED' | 'REGISTERED';

export interface IDomainDefinition {
  domainId: string;
  code: ExtendedSupportedDomain;
  displayName: string;
  version: string;
  description: string;
  supportedLanguages: string[];
  supportedEntityTypes: string[];
  validationRules: string[];
  adapterReference: string;
  schemaReference: string;
  status: DomainStatus;
  registeredAt: string;
}

export interface IDomainRegistry {
  totalDomains: number;
  activeDomainsCount: number;
  domains: Record<string, IDomainDefinition>;
}

export interface ICanonicalEntity {
  canonicalId: string;
  canonicalType: string;
  canonicalName: string;
  description: string;
  domainMappings: Record<string, string>;
  metadata: Record<string, any>;
}

export interface ICanonicalRelationship {
  relationshipId: string;
  sourceCanonicalId: string;
  targetCanonicalId: string;
  relationshipType: 'ASSOCIATED_WITH' | 'GOVERNS' | 'ENHANCES' | 'NEUTRAL_TO';
  weight: number;
  metadata: Record<string, any>;
}

export interface IDomainSchema {
  schemaId: string;
  domainCode: ExtendedSupportedDomain;
  version: string;
  entities: Array<{
    entityType: string;
    attributes: Array<{ name: string; type: string; required: boolean }>;
  }>;
  relationships: Array<{
    relationshipType: string;
    sourceEntityType: string;
    targetEntityType: string;
  }>;
  validationRules: Array<{ ruleCode: string; severity: 'ERROR' | 'WARNING'; message: string }>;
}

export interface IDomainValidationReport {
  isSchemaValid: boolean;
  domainCode: ExtendedSupportedDomain;
  requiredFieldsCheck: { passed: boolean; missingFields: string[] };
  duplicateEntitiesCheck: { passed: boolean; duplicates: string[] };
  brokenRelationshipsCheck: { passed: boolean; broken: string[] };
  invalidReferencesCheck: { passed: boolean; invalid: string[] };
  unknownEntityTypesCheck: { passed: boolean; unknown: string[] };
  errors: string[];
  warnings: string[];
  timestamp: string;
}

export interface IDomainKnowledgePackage {
  packageId: string;
  domainCode: ExtendedSupportedDomain;
  rawCandidateId: string;
  extractedEntities: Array<{
    entityId: string;
    entityType: string;
    name: string;
    canonicalId?: string;
    attributes: Record<string, any>;
  }>;
  extractedRelationships: Array<{
    relationshipId: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationshipType: string;
  }>;
  canonicalMappingsCount: number;
  normalizedAt: string;
}

export interface IDomainAdapter {
  domainCode: ExtendedSupportedDomain;
  validate(candidatePackage: Record<string, any>): IDomainValidationReport;
  normalize(candidatePackage: Record<string, any>): IDomainKnowledgePackage;
  extractEntities(candidatePackage: Record<string, any>): Array<{
    entityId: string;
    entityType: string;
    name: string;
    attributes: Record<string, any>;
  }>;
  extractRelationships(candidatePackage: Record<string, any>): Array<{
    relationshipId: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationshipType: string;
  }>;
  mapCanonicalEntities(entities: Array<{ entityId: string; name: string; entityType: string }>): Array<{
    entityId: string;
    canonicalId: string;
  }>;
  exportKnowledge(knowledgePackage: IDomainKnowledgePackage): Record<string, any>;
}

export interface IKnowledgeRoutingPackage {
  routingId: string;
  candidatePackageId: string;
  detectedDomains: Array<{
    domainCode: ExtendedSupportedDomain;
    confidence: number;
    evidence: string[];
  }>;
  routingType: 'SINGLE_DOMAIN' | 'MULTI_DOMAIN' | 'UNKNOWN_DOMAIN';
  targetAdapters: string[];
  routedKnowledgePackages: IDomainKnowledgePackage[];
  routedAt: string;
}

export interface IUniversalDomainIntelligenceFrameworkReport {
  version: '1.1.0-UDIF-COMPLIANCE';
  timestamp: string;
  domainRegistry: IDomainRegistry;
  classificationEngine: {
    supportedClassificationTypes: string[];
    totalClassificationsPerformed: number;
  };
  canonicalEntityRegistry: {
    totalCanonicalEntities: number;
    totalCanonicalRelationships: number;
  };
  schemaEngine: {
    totalRegisteredSchemas: number;
  };
  domainValidationEngine: {
    validationMode: 'STRICT_ENTERPRISE';
  };
  knowledgeRoutingEngine: {
    registeredAdapters: string[];
  };
}
