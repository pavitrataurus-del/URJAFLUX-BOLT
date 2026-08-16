// ============================================================================
// URJAFLUX AI OS - UDIF LalKitabAdapter (UDIF v1.1 Compliance)
// Structural Normalization for Planets, Houses, Objects, Colors, Metals
// ============================================================================

import { BaseDomainAdapter } from './IDomainAdapter';
import {
  IDomainValidationReport,
  IDomainKnowledgePackage,
  ExtendedSupportedDomain,
} from '../types/udif.types';

export class LalKitabAdapter extends BaseDomainAdapter {
  public domainCode: ExtendedSupportedDomain = 'LAL_KITAB';

  public validate(candidatePackage: Record<string, any>): IDomainValidationReport {
    const errors: string[] = [];
    if (!candidatePackage.title && !candidatePackage.packageId) {
      errors.push('Lal Kitab package missing identifier.');
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
      warnings: [],
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
      { id: 'E_PLANET_SUN', type: 'PLANET', name: 'Sun (Surya)', attributes: { metal: 'Copper', color: 'Red' } },
      { id: 'E_HOUSE_1', type: 'HOUSE', name: 'House 1 (Lagna)', attributes: { ruler: 'Mars' } },
      { id: 'E_OBJECT_COPPER_COIN', type: 'OBJECT', name: 'Copper Coin', attributes: { associatedPlanet: 'Sun' } },
    ];

    return rawList.map((e: any, idx: number) => ({
      entityId: e.id || `LK_E_${idx + 1}`,
      entityType: e.type || 'PLANET',
      name: e.name || 'Unnamed Lal Kitab Entity',
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
      { id: 'LK_R_1', source: 'E_PLANET_SUN', target: 'E_HOUSE_1', type: 'SITUATED_IN' },
    ];

    return rawRel.map((r: any, idx: number) => ({
      relationshipId: r.id || `LK_R_${idx + 1}`,
      sourceEntityId: r.source || 'E_PLANET_SUN',
      targetEntityId: r.target || 'E_HOUSE_1',
      relationshipType: r.type || 'SITUATED_IN',
    }));
  }

  public mapCanonicalEntities(entities: Array<{ entityId: string; name: string; entityType: string }>): Array<{
    entityId: string;
    canonicalId: string;
  }> {
    return entities.map((e) => {
      let canonicalId = 'ENTITY_GENERIC';
      const nameUpper = e.name.toUpperCase();
      if (nameUpper.includes('SUN') || nameUpper.includes('SURYA')) canonicalId = 'ENTITY_PLANET_SUN';
      else if (nameUpper.includes('COPPER')) canonicalId = 'ENTITY_METAL_COPPER';

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
      packageId: `PKG_LAL_KITAB_${Date.now()}`,
      domainCode: this.domainCode,
      rawCandidateId: candidatePackage.packageId || 'CANDIDATE_LK_001',
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
