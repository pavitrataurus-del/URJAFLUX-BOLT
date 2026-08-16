// ============================================================================
// URJAFLUX AI OS - UDIF Domain Validator
// Strict Rule & Structure Validation Logic
// ============================================================================

import { IDomainValidationReport, ExtendedSupportedDomain } from '../types/udif.types';
import { UniversalDomainSchemaEngine } from '../engines/UniversalDomainSchemaEngine';

export class DomainValidator {
  private schemaEngine: UniversalDomainSchemaEngine;

  constructor(schemaEngine: UniversalDomainSchemaEngine) {
    this.schemaEngine = schemaEngine;
  }

  public validateCandidatePackage(
    domainCode: ExtendedSupportedDomain,
    candidatePackage: Record<string, any>
  ): IDomainValidationReport {
    const errors: string[] = [];
    const warnings: string[] = [];

    const missingFields: string[] = [];
    const duplicates: string[] = [];
    const broken: string[] = [];
    const invalid: string[] = [];
    const unknown: string[] = [];

    // 1. Required Fields Check
    if (!candidatePackage.packageId && !candidatePackage.id) {
      missingFields.push('packageId');
    }
    if (!candidatePackage.title) {
      missingFields.push('title');
    }

    // 2. Duplicate Entities Check
    const entities = candidatePackage.entities || [];
    const entityIds = new Set<string>();

    entities.forEach((ent: any, idx: number) => {
      const eId = ent.id || ent.entityId || `ENT_${idx}`;
      if (entityIds.has(eId)) {
        duplicates.push(eId);
      } else {
        entityIds.add(eId);
      }
    });

    // 3. Broken Relationships Check
    const relationships = candidatePackage.relationships || [];
    relationships.forEach((rel: any, idx: number) => {
      const src = rel.source || rel.sourceEntityId;
      const tgt = rel.target || rel.targetEntityId;
      if (!src || !entityIds.has(src)) {
        broken.push(`Rel #${idx + 1}: Source entity '${src}' missing`);
      }
      if (!tgt || !entityIds.has(tgt)) {
        broken.push(`Rel #${idx + 1}: Target entity '${tgt}' missing`);
      }
    });

    // 4. Schema Compliance & Unknown Entity Types Check
    const schemaCheck = this.schemaEngine.validateAgainstSchema(
      domainCode,
      entities.map((e: any) => ({
        entityType: e.type || e.entityType || 'UNKNOWN',
        attributes: e.attributes || {},
      }))
    );

    if (!schemaCheck.isValid) {
      schemaCheck.errors.forEach((err) => unknown.push(err));
    }

    if (missingFields.length > 0) errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    if (duplicates.length > 0) errors.push(`Duplicate entity IDs detected: ${duplicates.join(', ')}`);
    if (broken.length > 0) errors.push(`Broken relationships detected: ${broken.join('; ')}`);
    if (unknown.length > 0) errors.push(`Schema validation issues: ${unknown.join('; ')}`);

    return {
      isSchemaValid: errors.length === 0,
      domainCode,
      requiredFieldsCheck: { passed: missingFields.length === 0, missingFields },
      duplicateEntitiesCheck: { passed: duplicates.length === 0, duplicates },
      brokenRelationshipsCheck: { passed: broken.length === 0, broken },
      invalidReferencesCheck: { passed: invalid.length === 0, invalid },
      unknownEntityTypesCheck: { passed: unknown.length === 0, unknown },
      errors,
      warnings,
      timestamp: new Date().toISOString(),
    };
  }
}
