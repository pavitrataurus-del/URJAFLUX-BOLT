// ============================================================================
// URJAFLUX AI OS - UDIF IDomainAdapter Interface
// Standard Domain Adapter Contract for Knowledge Packages
// ============================================================================

import {
  IDomainAdapter,
  IDomainValidationReport,
  IDomainKnowledgePackage,
  ExtendedSupportedDomain,
} from '../types/udif.types';

export abstract class BaseDomainAdapter implements IDomainAdapter {
  public abstract domainCode: ExtendedSupportedDomain;

  public abstract validate(candidatePackage: Record<string, any>): IDomainValidationReport;
  public abstract normalize(candidatePackage: Record<string, any>): IDomainKnowledgePackage;
  public abstract extractEntities(candidatePackage: Record<string, any>): Array<{
    entityId: string;
    entityType: string;
    name: string;
    attributes: Record<string, any>;
  }>;
  public abstract extractRelationships(candidatePackage: Record<string, any>): Array<{
    relationshipId: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationshipType: string;
  }>;
  public abstract mapCanonicalEntities(entities: Array<{ entityId: string; name: string; entityType: string }>): Array<{
    entityId: string;
    canonicalId: string;
  }>;
  public abstract exportKnowledge(knowledgePackage: IDomainKnowledgePackage): Record<string, any>;
}
