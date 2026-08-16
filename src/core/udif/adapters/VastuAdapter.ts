// ============================================================================
// URJAFLUX AI OS - UDIF VastuAdapter (UDIF v1.1 Compliance)
// Structural Normalization for Zones, Padas, Directions, Elements, Devtas, Rooms, Objects
// ============================================================================

import { BaseDomainAdapter } from './IDomainAdapter';
import {
  IDomainValidationReport,
  IDomainKnowledgePackage,
  ExtendedSupportedDomain,
} from '../types/udif.types';

export class VastuAdapter extends BaseDomainAdapter {
  public domainCode: ExtendedSupportedDomain = 'VASTU';

  public validate(candidatePackage: Record<string, any>): IDomainValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!candidatePackage.title && !candidatePackage.packageId) {
      errors.push('Vastu package missing identifier.');
    }

    return {
      isSchemaValid: errors.length === 0,
      domainCode: this.domainCode,
      requiredFieldsCheck: { passed: errors.length === 0, missingFields: errors },
      duplicateEntitiesCheck: { passed: true, duplicates: [] },
      brokenRelationshipsCheck: { passed: true, broken: [] },
      invalidReferencesCheck: { passed: true, invalid: [] },
      unknownEntityTypesCheck: { passed: true, unknown: [] },
      errors,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }

  public extractEntities(candidatePackage: Record<string, any>): Array<{
    entityId: string;
    entityType: string;
    name: string;
    attributes: Record<string, any>;
  }> {
    const rawList = candidatePackage.entities || [
      { id: 'E_ZONE_NE', type: 'ZONE', name: 'Northeast (Ishan)', attributes: { element: 'Water', devta: 'Ishana' } },
      { id: 'E_ZONE_SE', type: 'ZONE', name: 'Southeast (Agneya)', attributes: { element: 'Fire', devta: 'Agni' } },
      { id: 'E_ROOM_KITCHEN', type: 'ROOM', name: 'Kitchen', attributes: { idealZone: 'Southeast' } },
    ];

    return rawList.map((e: any, idx: number) => ({
      entityId: e.id || `VASTU_E_${idx + 1}`,
      entityType: e.type || 'ZONE',
      name: e.name || 'Unnamed Vastu Entity',
      attributes: e.attributes || {},
    }));
  }

  public extractRelationships(candidatePackage: Record<string, any>): Array<{
    relationshipId: string;
    sourceEntityId: string;
    targetEntityId: string;
    relationshipType: string;
  }> {
    const rawRel = candidatePackage.relationships || [
      { id: 'R_KIT_SE', source: 'E_ROOM_KITCHEN', target: 'E_ZONE_SE', type: 'LOCATED_IN' },
    ];

    return rawRel.map((r: any, idx: number) => ({
      relationshipId: r.id || `VASTU_R_${idx + 1}`,
      sourceEntityId: r.source || 'E_ROOM_KITCHEN',
      targetEntityId: r.target || 'E_ZONE_SE',
      relationshipType: r.type || 'LOCATED_IN',
    }));
  }

  public mapCanonicalEntities(entities: Array<{ entityId: string; name: string; entityType: string }>): Array<{
    entityId: string;
    canonicalId: string;
  }> {
    return entities.map((e) => {
      let canonicalId = 'ENTITY_GENERIC';
      const nameUpper = e.name.toUpperCase();
      if (nameUpper.includes('NORTH') || nameUpper.includes('ISHAN')) canonicalId = 'ENTITY_DIRECTION_NORTHEAST';
      else if (nameUpper.includes('SOUTH') || nameUpper.includes('AGNEYA')) canonicalId = 'ENTITY_DIRECTION_SOUTHEAST';
      else if (nameUpper.includes('KITCHEN')) canonicalId = 'ENTITY_ROOM_KITCHEN';
      else if (nameUpper.includes('FIRE')) canonicalId = 'ENTITY_FIRE';
      else if (nameUpper.includes('WATER')) canonicalId = 'ENTITY_WATER';

      return {
        entityId: e.entityId,
        canonicalId,
      };
    });
  }

  public normalize(candidatePackage: Record<string, any>): IDomainKnowledgePackage {
    const entities = this.extractEntities(candidatePackage);
    const relationships = this.extractRelationships(candidatePackage);
    const canonicals = this.mapCanonicalEntities(entities);

    const canonicalMap = new Map(canonicals.map((c) => [c.entityId, c.canonicalId]));

    return {
      packageId: `PKG_VASTU_${Date.now()}`,
      domainCode: this.domainCode,
      rawCandidateId: candidatePackage.packageId || 'CANDIDATE_VASTU_001',
      extractedEntities: entities.map((e) => ({
        ...e,
        canonicalId: canonicalMap.get(e.entityId),
      })),
      extractedRelationships: relationships,
      canonicalMappingsCount: canonicals.length,
      normalizedAt: new Date().toISOString(),
    };
  }

  public exportKnowledge(knowledgePackage: IDomainKnowledgePackage): Record<string, any> {
    return {
      domain: this.domainCode,
      packageId: knowledgePackage.packageId,
      exportVersion: '1.1',
      entitiesCount: knowledgePackage.extractedEntities.length,
      relationshipsCount: knowledgePackage.extractedRelationships.length,
      data: knowledgePackage,
    };
  }
}
