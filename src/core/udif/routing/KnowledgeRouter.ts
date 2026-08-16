// ============================================================================
// URJAFLUX AI OS - UDIF Knowledge Router
// Router component dispatching candidate packages to domain adapters
// ============================================================================

import {
  IDomainAdapter,
  IKnowledgeRoutingPackage,
  IDomainKnowledgePackage,
  ExtendedSupportedDomain,
} from '../types/udif.types';
import { DomainClassificationEngine } from '../engines/DomainClassificationEngine';

export class KnowledgeRouter {
  private adapters: Map<ExtendedSupportedDomain, IDomainAdapter> = new Map();
  private classifier: DomainClassificationEngine;

  constructor(classifier: DomainClassificationEngine) {
    this.classifier = classifier;
  }

  public registerAdapter(adapter: IDomainAdapter): void {
    this.adapters.set(adapter.domainCode, adapter);
  }

  public getAdapter(domainCode: ExtendedSupportedDomain): IDomainAdapter | undefined {
    return this.adapters.get(domainCode);
  }

  public listAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  public routeKnowledgePackage(candidatePackage: Record<string, any>): IKnowledgeRoutingPackage {
    const classification = this.classifier.classifyCandidatePackage(candidatePackage);
    const routedPackages: IDomainKnowledgePackage[] = [];
    const targetAdapters: string[] = [];

    if (classification.routingType === 'SINGLE_DOMAIN' || classification.routingType === 'MULTI_DOMAIN') {
      classification.detectedDomains.forEach((det) => {
        const adapter = this.adapters.get(det.domainCode);
        if (adapter) {
          targetAdapters.push(adapter.domainCode);
          const normalizedPkg = adapter.normalize(candidatePackage);
          routedPackages.push(normalizedPkg);
        }
      });
    }

    return {
      routingId: `ROUTE_${Date.now()}`,
      candidatePackageId: candidatePackage.packageId || candidatePackage.id || 'CANDIDATE_000',
      detectedDomains: classification.detectedDomains,
      routingType: classification.routingType,
      targetAdapters,
      routedKnowledgePackages: routedPackages,
      routedAt: new Date().toISOString(),
    };
  }
}
