import {
  IReasoningConflict,
  IReasoningGraphNode,
  KnowledgeDomain,
  ConflictResolutionStatus
} from './ReasoningTypes';

export class ConflictResolver {
  private static instance: ConflictResolver;
  private customOverrides: Map<string, IReasoningConflict> = new Map();

  public static getInstance(): ConflictResolver {
    if (!ConflictResolver.instance) {
      ConflictResolver.instance = new ConflictResolver();
    }
    return ConflictResolver.instance;
  }

  /**
   * Scans graph nodes for potential cross-domain conflicts
   */
  public detectConflicts(nodes: IReasoningGraphNode[]): IReasoningConflict[] {
    const conflicts: IReasoningConflict[] = [];

    // Group nodes by domain
    const nodesByDomain = new Map<KnowledgeDomain, IReasoningGraphNode[]>();
    nodes.forEach(n => {
      if (!nodesByDomain.has(n.domain)) {
        nodesByDomain.set(n.domain, []);
      }
      nodesByDomain.get(n.domain)!.push(n);
    });

    // Check Vastu vs Lal Kitab direction/element friction
    const vastuNodes = nodesByDomain.get('Vastu') || [];
    const lalkitabNodes = nodesByDomain.get('LalKitab') || [];

    if (vastuNodes.length > 0 && lalkitabNodes.length > 0) {
      vastuNodes.forEach(vn => {
        lalkitabNodes.forEach(ln => {
          if (
            vn.attributes.category?.includes('Water') &&
            ln.attributes.associatedPlanet === 'Surya (Sun)'
          ) {
            const conflictId = `conf-vst-lkt-${vn.id}-${ln.id}`;

            // Check if admin override exists
            if (this.customOverrides.has(conflictId)) {
              conflicts.push(this.customOverrides.get(conflictId)!);
            } else {
              conflicts.push({
                conflictId,
                domainA: 'Vastu',
                domainB: 'LalKitab',
                claimA: `Vastu prescribes Water placement in Northeast (Eeshan Corner).`,
                claimB: `Lal Kitab warns against Water placement when Surya is placed in 1st House.`,
                severity: 'HIGH',
                status: 'RESOLVED_PRIORITY',
                resolutionStrategy: 'Apply Vastu spatial boundary first, followed by brass container non-direct remedy for Lal Kitab.',
                winningDomain: 'Vastu'
              });
            }
          }
        });
      });
    }

    // Check Astrology vs Numerology planet/number resonance friction
    const astroNodes = nodesByDomain.get('Astrology') || [];
    const numNodes = nodesByDomain.get('Numerology') || [];

    if (astroNodes.length > 0 && numNodes.length > 0) {
      astroNodes.forEach(an => {
        numNodes.forEach(nn => {
          if (
            an.attributes.associatedPlanet === 'Shani (Saturn)' &&
            nn.attributes.numberValue === 1 // Surya vibration
          ) {
            const conflictId = `conf-ast-num-${an.id}-${nn.id}`;

            if (this.customOverrides.has(conflictId)) {
              conflicts.push(this.customOverrides.get(conflictId)!);
            } else {
              conflicts.push({
                conflictId,
                domainA: 'Astrology',
                domainB: 'Numerology',
                claimA: `Astrological chart highlights Saturn (Shani) prominence.`,
                claimB: `Chaldean Numerology highlights Number 1 (Sun) name vibration.`,
                severity: 'MEDIUM',
                status: 'CONTEXTUAL_SPLIT',
                resolutionStrategy: 'Maintain Number 1 for professional brand identity while using Blue Sapphire / Neutral tones for Saturn balance.',
                winningDomain: 'Astrology'
              });
            }
          }
        });
      });
    }

    return conflicts;
  }

  /**
   * Admin manual override for a conflict
   */
  public overrideConflict(
    conflictId: string,
    winningDomain: KnowledgeDomain,
    resolutionStrategy: string,
    overrideNotes: string,
    adminUser: string
  ): IReasoningConflict {
    const updated: IReasoningConflict = {
      conflictId,
      domainA: 'Vastu',
      domainB: 'LalKitab',
      claimA: 'Admin Overridden Conflict Claim A',
      claimB: 'Admin Overridden Conflict Claim B',
      severity: 'HIGH',
      status: 'ADMIN_OVERRIDDEN',
      winningDomain,
      resolutionStrategy,
      overrideNotes,
      resolvedBy: adminUser,
      resolvedTimestamp: new Date().toISOString()
    };

    this.customOverrides.set(conflictId, updated);
    return updated;
  }

  public getOverrides(): Map<string, IReasoningConflict> {
    return this.customOverrides;
  }
}
