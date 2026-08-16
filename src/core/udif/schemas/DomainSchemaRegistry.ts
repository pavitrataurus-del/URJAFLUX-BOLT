// ============================================================================
// URJAFLUX AI OS - UDIF Domain Schema Registry
// Defines Structural Schemas for Entities, Relationships, and Validation Rules (UDIF v1.1)
// ============================================================================

import { IDomainSchema, ExtendedSupportedDomain } from '../types/udif.types';

export class DomainSchemaRegistry {
  private schemas: Map<ExtendedSupportedDomain, IDomainSchema> = new Map();

  constructor() {
    this.seedDefaultSchemas();
  }

  private seedDefaultSchemas(): void {
    const defaultSchemas: IDomainSchema[] = [
      {
        schemaId: 'SCHEMA_VASTU_V1',
        domainCode: 'VASTU',
        version: '1.1.0',
        entities: [
          {
            entityType: 'ZONE',
            attributes: [
              { name: 'direction', type: 'string', required: true },
              { name: 'element', type: 'string', required: true },
              { name: 'devta', type: 'string', required: false },
            ],
          },
          {
            entityType: 'ROOM',
            attributes: [
              { name: 'roomType', type: 'string', required: true },
              { name: 'idealDirection', type: 'string', required: false },
            ],
          },
        ],
        relationships: [
          { relationshipType: 'LOCATED_IN', sourceEntityType: 'ROOM', targetEntityType: 'ZONE' },
        ],
        validationRules: [
          { ruleCode: 'VAL_VASTU_001', severity: 'ERROR', message: 'Zone must have a valid direction.' },
        ],
      },
      {
        schemaId: 'SCHEMA_LAL_KITAB_V1',
        domainCode: 'LAL_KITAB',
        version: '1.1.0',
        entities: [
          {
            entityType: 'PLANET',
            attributes: [
              { name: 'name', type: 'string', required: true },
              { name: 'metal', type: 'string', required: false },
            ],
          },
          {
            entityType: 'HOUSE',
            attributes: [{ name: 'houseNumber', type: 'number', required: true }],
          },
        ],
        relationships: [
          { relationshipType: 'SITUATED_IN', sourceEntityType: 'PLANET', targetEntityType: 'HOUSE' },
        ],
        validationRules: [
          { ruleCode: 'VAL_LK_001', severity: 'ERROR', message: 'House number must be between 1 and 12.' },
        ],
      },
      {
        schemaId: 'SCHEMA_NUMEROLOGY_V1',
        domainCode: 'NUMEROLOGY',
        version: '1.1.0',
        entities: [
          {
            entityType: 'NUMBER',
            attributes: [
              { name: 'value', type: 'number', required: true },
              { name: 'governingPlanet', type: 'string', required: true },
            ],
          },
        ],
        relationships: [
          { relationshipType: 'HARMONIC_WITH', sourceEntityType: 'NUMBER', targetEntityType: 'NUMBER' },
        ],
        validationRules: [
          { ruleCode: 'VAL_NUM_001', severity: 'ERROR', message: 'Single digit values must be 1 through 9.' },
        ],
      },
    ];

    defaultSchemas.forEach((sch) => this.schemas.set(sch.domainCode, sch));
  }

  public registerSchema(schema: IDomainSchema): boolean {
    this.schemas.set(schema.domainCode, schema);
    return true;
  }

  public getSchema(domainCode: ExtendedSupportedDomain): IDomainSchema | undefined {
    return this.schemas.get(domainCode);
  }

  public listSchemas(): IDomainSchema[] {
    return Array.from(this.schemas.values());
  }
}
