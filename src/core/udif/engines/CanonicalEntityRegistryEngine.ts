// ============================================================================
// URJAFLUX AI OS - UDIF Engine 3: Canonical Entity Registry Engine (CER)
// Universal Identity Layer ensuring permanent IDs for universal concepts
// ============================================================================

import { ICanonicalEntity, ICanonicalRelationship } from '../types/udif.types';

export class CanonicalEntityRegistryEngine {
  private entities: Map<string, ICanonicalEntity> = new Map();
  private relationships: Map<string, ICanonicalRelationship> = new Map();

  constructor() {
    this.seedCanonicalIdentityLayer();
  }

  private seedCanonicalIdentityLayer(): void {
    const defaults: ICanonicalEntity[] = [
      {
        canonicalId: 'ENTITY_DIRECTION_NORTH',
        canonicalType: 'DIRECTION',
        canonicalName: 'North Direction',
        description: 'Cardinal direction North.',
        domainMappings: { VASTU: 'Uttara', LAL_KITAB: 'Budh Sthan', NUMEROLOGY: 'Number 5 Zone' },
        metadata: { degrees: '337.5 - 22.5' },
      },
      {
        canonicalId: 'ENTITY_DIRECTION_NORTHEAST',
        canonicalType: 'DIRECTION',
        canonicalName: 'Northeast Direction',
        description: 'Ordinal direction Northeast (Ishan corner).',
        domainMappings: { VASTU: 'Ishan' },
        metadata: { degrees: '22.5 - 67.5' },
      },
      {
        canonicalId: 'ENTITY_DIRECTION_SOUTHEAST',
        canonicalType: 'DIRECTION',
        canonicalName: 'Southeast Direction',
        description: 'Ordinal direction Southeast (Agneya corner).',
        domainMappings: { VASTU: 'Agneya' },
        metadata: { degrees: '112.5 - 157.5' },
      },
      {
        canonicalId: 'ENTITY_FIRE',
        canonicalType: 'ELEMENT',
        canonicalName: 'Fire Element (Agni Tattva)',
        description: 'Transformative heat and energy element.',
        domainMappings: { VASTU: 'Agni Tattva', NUMEROLOGY: 'Number 1 & 9 Fire Vibration' },
        metadata: { color: 'Red / Orange' },
      },
      {
        canonicalId: 'ENTITY_WATER',
        canonicalType: 'ELEMENT',
        canonicalName: 'Water Element (Jal Tattva)',
        description: 'Fluidity, clarity and financial flow element.',
        domainMappings: { VASTU: 'Jal Tattva', NUMEROLOGY: 'Number 2 & 7 Water Vibration' },
        metadata: { color: 'Blue / Black' },
      },
      {
        canonicalId: 'ENTITY_PLANET_MERCURY',
        canonicalType: 'PLANET',
        canonicalName: 'Mercury (Budh)',
        description: 'Mercurial concept.',
        domainMappings: { LAL_KITAB: 'Budh Dev', NUMEROLOGY: 'Number 5', VASTU: 'North Governor' },
        metadata: { metal: 'Bronze' },
      },
      {
        canonicalId: 'ENTITY_PLANET_SUN',
        canonicalType: 'PLANET',
        canonicalName: 'Sun (Surya)',
        description: 'Solar concept.',
        domainMappings: { LAL_KITAB: 'Surya Dev', NUMEROLOGY: 'Number 1', VASTU: 'East Governor' },
        metadata: { metal: 'Copper' },
      },
      {
        canonicalId: 'ENTITY_NUMBER_1',
        canonicalType: 'NUMBER',
        canonicalName: 'Number 1',
        description: 'Solar leadership and pioneering vibration.',
        domainMappings: { NUMEROLOGY: 'Number 1', LAL_KITAB: 'House 1 Energy' },
        metadata: { planet: 'Sun' },
      },
      {
        canonicalId: 'ENTITY_NUMBER_5',
        canonicalType: 'NUMBER',
        canonicalName: 'Number 5',
        description: 'Mercurial speed, agility and commerce vibration.',
        domainMappings: { NUMEROLOGY: 'Number 5' },
        metadata: { planet: 'Mercury' },
      },
      {
        canonicalId: 'ENTITY_ROOM_KITCHEN',
        canonicalType: 'ROOM',
        canonicalName: 'Kitchen',
        description: 'Cooking and hearth zone.',
        domainMappings: { VASTU: 'Rasoi Ghar', LAL_KITAB: 'Hearth' },
        metadata: { activity: 'Cooking' },
      },
    ];

    defaults.forEach((ent) => this.entities.set(ent.canonicalId, ent));

    const defaultRels: ICanonicalRelationship[] = [
      {
        relationshipId: 'REL_FIRE_SOUTHEAST',
        sourceCanonicalId: 'ENTITY_FIRE',
        targetCanonicalId: 'ENTITY_DIRECTION_SOUTHEAST',
        relationshipType: 'ASSOCIATED_WITH',
        weight: 1.0,
        metadata: { domain: 'VASTU' },
      },
    ];

    defaultRels.forEach((rel) => this.relationships.set(rel.relationshipId, rel));
  }

  public registerEntity(entity: ICanonicalEntity): boolean {
    this.entities.set(entity.canonicalId, entity);
    return true;
  }

  public getEntity(canonicalId: string): ICanonicalEntity | undefined {
    return this.entities.get(canonicalId);
  }

  public findCanonicalIdForTerm(domain: string, term: string): string | undefined {
    const termLower = term.toLowerCase();
    for (const ent of this.entities.values()) {
      const mappedTerm = ent.domainMappings[domain]?.toLowerCase();
      if (mappedTerm && mappedTerm.includes(termLower)) {
        return ent.canonicalId;
      }
      if (ent.canonicalName.toLowerCase().includes(termLower)) {
        return ent.canonicalId;
      }
    }
    return undefined;
  }

  public listEntities(): ICanonicalEntity[] {
    return Array.from(this.entities.values());
  }

  public listRelationships(): ICanonicalRelationship[] {
    return Array.from(this.relationships.values());
  }
}
