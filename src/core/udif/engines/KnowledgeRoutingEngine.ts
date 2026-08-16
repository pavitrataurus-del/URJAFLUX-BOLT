// ============================================================================
// URJAFLUX AI OS - UDIF Engine 12: Knowledge Routing Engine
// Orchestrates automatic domain detection and adapter dispatching
// ============================================================================

import { KnowledgeRouter } from '../routing/KnowledgeRouter';
import { DomainClassificationEngine } from './DomainClassificationEngine';
import {
  IDomainAdapter,
  IKnowledgeRoutingPackage,
} from '../types/udif.types';

export class KnowledgeRoutingEngine {
  private router: KnowledgeRouter;

  constructor(classifier: DomainClassificationEngine) {
    this.router = new KnowledgeRouter(classifier);
  }

  public registerAdapter(adapter: IDomainAdapter): void {
    this.router.registerAdapter(adapter);
  }

  public routePackage(candidatePackage: Record<string, any>): IKnowledgeRoutingPackage {
    return this.router.routeKnowledgePackage(candidatePackage);
  }

  public getRegisteredAdapters(): string[] {
    return this.router.listAdapters();
  }
}
