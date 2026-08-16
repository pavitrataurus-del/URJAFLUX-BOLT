// ============================================================================
// URJAFLUX AI OS - UNIVERSAL DOMAIN INTELLIGENCE FRAMEWORK (UDIF v1.1)
// Main Framework Orchestrator and Public Interface (Founder Compliance Update)
// ============================================================================

import {
  IDomainDefinition,
  IDomainRegistry,
  ICanonicalEntity,
  IDomainSchema,
  IDomainValidationReport,
  IKnowledgeRoutingPackage,
  IUniversalDomainIntelligenceFrameworkReport,
  ExtendedSupportedDomain,
  IDomainAdapter,
} from './types/udif.types';

import { UniversalDomainRegistryEngine } from './engines/UniversalDomainRegistryEngine';
import { DomainClassificationEngine } from './engines/DomainClassificationEngine';
import { CanonicalEntityRegistryEngine } from './engines/CanonicalEntityRegistryEngine';
import { UniversalDomainSchemaEngine } from './engines/UniversalDomainSchemaEngine';
import { DomainValidationEngine } from './engines/DomainValidationEngine';
import { KnowledgeRoutingEngine } from './engines/KnowledgeRoutingEngine';

import { VastuAdapter } from './adapters/VastuAdapter';
import { LalKitabAdapter } from './adapters/LalKitabAdapter';
import { NumerologyAdapter } from './adapters/NumerologyAdapter';

export class UniversalDomainIntelligenceFramework {
  private domainRegistryEngine: UniversalDomainRegistryEngine;
  private domainClassificationEngine: DomainClassificationEngine;
  private canonicalEntityRegistryEngine: CanonicalEntityRegistryEngine;
  private domainSchemaEngine: UniversalDomainSchemaEngine;
  private domainValidationEngine: DomainValidationEngine;
  private knowledgeRoutingEngine: KnowledgeRoutingEngine;

  constructor() {
    this.domainRegistryEngine = new UniversalDomainRegistryEngine();
    this.domainClassificationEngine = new DomainClassificationEngine();
    this.canonicalEntityRegistryEngine = new CanonicalEntityRegistryEngine();
    this.domainSchemaEngine = new UniversalDomainSchemaEngine();
    this.domainValidationEngine = new DomainValidationEngine(this.domainSchemaEngine);
    this.knowledgeRoutingEngine = new KnowledgeRoutingEngine(this.domainClassificationEngine);

    this.registerDayOneAdapters();
  }

  private registerDayOneAdapters(): void {
    this.knowledgeRoutingEngine.registerAdapter(new VastuAdapter());
    this.knowledgeRoutingEngine.registerAdapter(new LalKitabAdapter());
    this.knowledgeRoutingEngine.registerAdapter(new NumerologyAdapter());
  }

  // --- Extension Hook for Future Domain Adapters ---
  public registerAdapter(adapter: IDomainAdapter): void {
    this.knowledgeRoutingEngine.registerAdapter(adapter);
  }

  // --- Engine 1: Domain Registry ---
  public registerDomain(domainDef: IDomainDefinition): boolean {
    return this.domainRegistryEngine.registerDomain(domainDef);
  }

  public getDomainRegistry(): IDomainRegistry {
    return this.domainRegistryEngine.getRegistrySnapshot();
  }

  // --- Engine 2: Classification ---
  public classifyPackage(candidatePackage: Record<string, any>) {
    return this.domainClassificationEngine.classifyCandidatePackage(candidatePackage);
  }

  // --- Engine 3: Canonical Entity Registry ---
  public registerCanonicalEntity(entity: ICanonicalEntity): boolean {
    return this.canonicalEntityRegistryEngine.registerEntity(entity);
  }

  public listCanonicalEntities(): ICanonicalEntity[] {
    return this.canonicalEntityRegistryEngine.listEntities();
  }

  // --- Engine 4: Schema Engine ---
  public registerDomainSchema(schema: IDomainSchema): boolean {
    return this.domainSchemaEngine.registerSchema(schema);
  }

  public getDomainSchema(domainCode: ExtendedSupportedDomain): IDomainSchema | undefined {
    return this.domainSchemaEngine.getSchema(domainCode);
  }

  // --- Engine 11: Validation ---
  public validateKnowledgePackage(
    domainCode: ExtendedSupportedDomain,
    candidatePackage: Record<string, any>
  ): IDomainValidationReport {
    return this.domainValidationEngine.validatePackage(domainCode, candidatePackage);
  }

  // --- Engine 12: Knowledge Routing ---
  public routeKnowledgePackage(candidatePackage: Record<string, any>): IKnowledgeRoutingPackage {
    return this.knowledgeRoutingEngine.routePackage(candidatePackage);
  }

  // --- Enterprise Health & Governance Report ---
  public getFrameworkReport(): IUniversalDomainIntelligenceFrameworkReport {
    return {
      version: '1.1.0-UDIF-COMPLIANCE',
      timestamp: new Date().toISOString(),
      domainRegistry: this.getDomainRegistry(),
      classificationEngine: {
        supportedClassificationTypes: ['SINGLE_DOMAIN', 'MULTI_DOMAIN', 'UNKNOWN_DOMAIN'],
        totalClassificationsPerformed: 1,
      },
      canonicalEntityRegistry: {
        totalCanonicalEntities: this.canonicalEntityRegistryEngine.listEntities().length,
        totalCanonicalRelationships: this.canonicalEntityRegistryEngine.listRelationships().length,
      },
      schemaEngine: {
        totalRegisteredSchemas: this.domainSchemaEngine.listSchemas().length,
      },
      domainValidationEngine: {
        validationMode: 'STRICT_ENTERPRISE',
      },
      knowledgeRoutingEngine: {
        registeredAdapters: this.knowledgeRoutingEngine.getRegisteredAdapters(),
      },
    };
  }
}

export const universalDomainIntelligenceFramework = new UniversalDomainIntelligenceFramework();
