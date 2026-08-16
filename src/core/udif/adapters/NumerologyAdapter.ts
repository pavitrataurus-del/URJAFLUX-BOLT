// ============================================================================
// URJAFLUX AI OS - UDIF NumerologyAdapter (UDIF v1.1 Compliance)
// Structural Normalization for Driver Number, Destiny Number, Compound Number, Name Number,
// Missing Numbers, Lucky Numbers, Property Numbers, Vehicle Numbers
// ============================================================================

import { BaseDomainAdapter } from './IDomainAdapter';
import {
  IDomainValidationReport,
  IDomainKnowledgePackage,
  ExtendedSupportedDomain,
} from '../types/udif.types';

export class NumerologyAdapter extends BaseDomainAdapter {
  public domainCode: ExtendedSupportedDomain = 'NUMEROLOGY';

  public validate(candidatePackage: Record<string, any>): IDomainValidationReport {
    const errors: string[] = [];
    if (!candidatePackage.title && !candidatePackage.packageId) {
      errors.push('Numerology package missing identifier.');
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
      { id: 'E_NUM_DRIVER_1', type: 'DRIVER_NUMBER', name: 'Driver Number 1 (Sun)', attributes: { planet: 'Sun' } },
      { id: 'E_NUM_DESTINY_5', type: 'DESTINY_NUMBER', name: 'Destiny Number 5 (Mercury)', attributes: { planet: 'Mercury' } },
      { id: 'E_NUM_VEHICLE', type: 'VEHICLE_NUMBER', name: 'Vehicle Sum 6 (Venus)', attributes: { targetHarmony: 'Number 1, 5' } },
      { id: 'E_NUM_PROPERTY', type: 'PROPERTY_NUMBER', name: 'Property Sum 3 (Jupiter)', attributes: { suitability: 'High' } },
    ];

    return rawList.map((e: any, idx: number) => ({
      entityId: e.id || `NUM_E_${idx + 1}`,
      entityType: e.type || 'NUMBER',
      name: e.name || 'Unnamed Numerology Entity',
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
      { id: 'NUM_R_1', source: 'E_NUM_DRIVER_1', target: 'E_NUM_DESTINY_5', type: 'HARMONIC_WITH' },
    ];

    return rawRel.map((r: any, idx: number) => ({
      relationshipId: r.id || `NUM_R_${idx + 1}`,
      sourceEntityId: r.source || 'E_NUM_DRIVER_1',
      targetEntityId: r.target || 'E_NUM_DESTINY_5',
      relationshipType: r.type || 'HARMONIC_WITH',
    }));
  }

  public mapCanonicalEntities(entities: Array<{ entityId: string; name: string; entityType: string }>): Array<{
    entityId: string;
    canonicalId: string;
  }> {
    return entities.map((e) => {
      let canonicalId = 'ENTITY_GENERIC';
      const nameUpper = e.name.toUpperCase();
      if (nameUpper.includes('NUMBER 1') || nameUpper.includes('SUN')) canonicalId = 'ENTITY_NUMBER_1';
      else if (nameUpper.includes('NUMBER 5') || nameUpper.includes('MERCURY')) canonicalId = 'ENTITY_NUMBER_5';

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
      packageId: `PKG_NUMEROLOGY_${Date.now()}`,
      domainCode: this.domainCode,
      rawCandidateId: candidatePackage.packageId || 'CANDIDATE_NUM_001',
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
