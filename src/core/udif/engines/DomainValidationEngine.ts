// ============================================================================
// URJAFLUX AI OS - UDIF Engine 11: Domain Validation Engine
// Orchestrates structural and schema validation across domain packages
// ============================================================================

import { DomainValidator } from '../validation/DomainValidator';
import { UniversalDomainSchemaEngine } from './UniversalDomainSchemaEngine';
import { IDomainValidationReport, ExtendedSupportedDomain } from '../types/udif.types';

export class DomainValidationEngine {
  private validator: DomainValidator;

  constructor(schemaEngine: UniversalDomainSchemaEngine) {
    this.validator = new DomainValidator(schemaEngine);
  }

  public validatePackage(
    domainCode: ExtendedSupportedDomain,
    candidatePackage: Record<string, any>
  ): IDomainValidationReport {
    return this.validator.validateCandidatePackage(domainCode, candidatePackage);
  }
}
