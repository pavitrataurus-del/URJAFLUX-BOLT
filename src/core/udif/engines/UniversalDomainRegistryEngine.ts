// ============================================================================
// URJAFLUX AI OS - UDIF Engine 1: Universal Domain Registry Engine
// Central Registry for Domain Definitions and Metadata (UDIF v1.1 Compliance)
// ============================================================================

import {
  IDomainDefinition,
  IDomainRegistry,
  ExtendedSupportedDomain,
} from '../types/udif.types';

export class UniversalDomainRegistryEngine {
  private registry: Map<string, IDomainDefinition> = new Map();

  constructor() {
    this.seedDefaultDomains();
  }

  private seedDefaultDomains(): void {
    const defaultDomains: IDomainDefinition[] = [
      {
        domainId: 'UDIF_DOM_001_VASTU',
        code: 'VASTU',
        displayName: 'Vastu Shastra Architecture & Energies',
        version: '1.1.0',
        description: 'Vedic spatial alignment, elemental balance, directional padas, and devtas.',
        supportedLanguages: ['EN', 'HI', 'SA'],
        supportedEntityTypes: ['ZONE', 'PADA', 'DIRECTION', 'ELEMENT', 'DEVTA', 'ROOM', 'OBJECT'],
        validationRules: ['REQ_DIRECTION_VALIDATION', 'REQ_DEVTA_CORRELATION'],
        adapterReference: 'VastuAdapter',
        schemaReference: 'VastuSchema_v1',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
      },
      {
        domainId: 'UDIF_DOM_002_LAL_KITAB',
        code: 'LAL_KITAB',
        displayName: 'Lal Kitab System Structural Framework',
        version: '1.1.0',
        description: 'House-based planetary positional structure, objects, colors, and metals.',
        supportedLanguages: ['EN', 'HI', 'UR'],
        supportedEntityTypes: ['PLANET', 'HOUSE', 'OBJECT', 'COLOR', 'METAL'],
        validationRules: ['REQ_HOUSE_BOUNDARY_CHECK', 'REQ_METAL_CORRELATION'],
        adapterReference: 'LalKitabAdapter',
        schemaReference: 'LalKitabSchema_v1',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
      },
      {
        domainId: 'UDIF_DOM_003_NUMEROLOGY',
        code: 'NUMEROLOGY',
        displayName: 'Chaldean & Pythagorean Numerology Structure',
        version: '1.1.0',
        description: 'Vibrational numbers, Driver/Destiny numbers, missing numbers, vehicle & property numbers.',
        supportedLanguages: ['EN', 'HI'],
        supportedEntityTypes: ['DRIVER_NUMBER', 'DESTINY_NUMBER', 'COMPOUND_NUMBER', 'NAME_NUMBER', 'MISSING_NUMBER', 'LUCKY_NUMBER', 'PROPERTY_NUMBER', 'VEHICLE_NUMBER'],
        validationRules: ['REQ_SINGLE_DIGIT_REDUCTION', 'REQ_GRID_COMPLETE_CHECK'],
        adapterReference: 'NumerologyAdapter',
        schemaReference: 'NumerologySchema_v1',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
      },
      {
        domainId: 'UDIF_DOM_004_AYURVEDA',
        code: 'AYURVEDA',
        displayName: 'Ayurvedic Structural Framework',
        version: '1.1.0',
        description: 'Tridosha structural analysis and Prakriti classifications.',
        supportedLanguages: ['EN', 'HI', 'SA'],
        supportedEntityTypes: ['DOSHA', 'PRAKRITI', 'HERB', 'DIET', 'THERAPY'],
        validationRules: ['REQ_DOSHA_BALANCE_CHECK'],
        adapterReference: 'AyurvedaAdapter',
        schemaReference: 'AyurvedaSchema_v1',
        status: 'REGISTERED',
        registeredAt: new Date().toISOString(),
      },
    ];

    defaultDomains.forEach((dom) => this.registerDomain(dom));
  }

  public registerDomain(domainDef: IDomainDefinition): boolean {
    this.registry.set(domainDef.code, domainDef);
    return true;
  }

  public getDomain(domainCode: ExtendedSupportedDomain): IDomainDefinition | undefined {
    return this.registry.get(domainCode);
  }

  public listDomains(): IDomainDefinition[] {
    return Array.from(this.registry.values());
  }

  public getRegistrySnapshot(): IDomainRegistry {
    const domainsObj: Record<string, IDomainDefinition> = {};
    let activeCount = 0;

    this.registry.forEach((def, key) => {
      domainsObj[key] = def;
      if (def.status === 'ACTIVE') activeCount++;
    });

    return {
      totalDomains: this.registry.size,
      activeDomainsCount: activeCount,
      domains: domainsObj,
    };
  }
}
