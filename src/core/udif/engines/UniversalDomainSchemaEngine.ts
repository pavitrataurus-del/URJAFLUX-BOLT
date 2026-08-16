// ============================================================================
// URJAFLUX AI OS - UDIF Engine 4: Universal Domain Schema Engine
// Manages and Validates Domain Schemas across all registered domains
// ============================================================================

import { DomainSchemaRegistry } from '../schemas/DomainSchemaRegistry';
import { IDomainSchema, ExtendedSupportedDomain } from '../types/udif.types';

export class UniversalDomainSchemaEngine {
  private schemaRegistry: DomainSchemaRegistry;

  constructor() {
    this.schemaRegistry = new DomainSchemaRegistry();
  }

  public registerSchema(schema: IDomainSchema): boolean {
    return this.schemaRegistry.registerSchema(schema);
  }

  public getSchema(domainCode: ExtendedSupportedDomain): IDomainSchema | undefined {
    return this.schemaRegistry.getSchema(domainCode);
  }

  public listSchemas(): IDomainSchema[] {
    return this.schemaRegistry.listSchemas();
  }

  public validateAgainstSchema(
    domainCode: ExtendedSupportedDomain,
    candidateEntities: Array<{ entityType: string; attributes: Record<string, any> }>
  ): { isValid: boolean; errors: string[] } {
    const schema = this.getSchema(domainCode);
    if (!schema) {
      return { isValid: false, errors: [`No schema registered for domain ${domainCode}`] };
    }

    const errors: string[] = [];
    const validEntityTypes = new Set(schema.entities.map((e) => e.entityType));

    candidateEntities.forEach((ent, idx) => {
      if (!validEntityTypes.has(ent.entityType)) {
        errors.push(`Entity #${idx + 1} type '${ent.entityType}' not defined in schema for ${domainCode}.`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
