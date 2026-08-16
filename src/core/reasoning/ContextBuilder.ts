import {
  IReasoningInput,
  IUnifiedReasoningContext,
  IReasoningGraphNode,
  IReasoningGraphEdge,
  KnowledgeDomain
} from './ReasoningTypes';

import { KnowledgeRetrievalEngine } from './KnowledgeRetrievalEngine';

export class ContextBuilder {
  private retrievalEngine: KnowledgeRetrievalEngine;

  constructor() {
    this.retrievalEngine = KnowledgeRetrievalEngine.getInstance();
  }

  public buildUnifiedContext(input: IReasoningInput): IUnifiedReasoningContext {
    const contextId = `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nodes: IReasoningGraphNode[] = [];
    const edges: IReasoningGraphEdge[] = [];

    // 1. Root User Input Node
    const userNodeId = `node-usr-root`;
    nodes.push({
      id: userNodeId,
      label: `User Query Context (${input.propertyType || 'General'})`,
      domain: 'UserContext',
      entityId: 'usr-001',
      canonicalName: input.problemStatement || 'Enterprise Spatial Alignment',
      sourceBook: 'User Project Metadata',
      confidenceScore: 100,
      verificationStatus: 'CANONICAL',
      attributes: { ...input }
    });

    // 2. Load Entities from All 5 Knowledge Libraries
    const vastuEntities = this.retrievalEngine.getVastuEntities();
    const chakraEntities = this.retrievalEngine.getChakraEntities();
    const lalkitabEntities = this.retrievalEngine.getLalKitabEntities();
    const numerologyEntities = this.retrievalEngine.getNumerologyEntities();
    const astrologyEntities = this.retrievalEngine.getAstrologyEntities();

    // Track Coverage
    const domainCoverage: Record<KnowledgeDomain, number> = {
      Vastu: 0,
      Chakra: 0,
      LalKitab: 0,
      Numerology: 0,
      Astrology: 0,
      UserContext: 1
    };

    // 3. Map Vastu Entities
    vastuEntities.forEach(v => {
      const nodeId = `node-vst-${v.id}`;
      nodes.push({
        id: nodeId,
        label: v.canonicalName,
        domain: 'Vastu',
        entityId: v.id,
        canonicalName: v.canonicalName,
        sourceBook: v.sourceBook,
        confidenceScore: v.confidenceScore,
        verificationStatus: v.verificationStatus,
        attributes: v.attributes
      });
      domainCoverage.Vastu++;

      // Edge from User Node to Vastu Node
      edges.push({
        id: `edge-usr-vst-${v.id}`,
        sourceNodeId: userNodeId,
        targetNodeId: nodeId,
        relationType: 'APPLIES_SPATIAL_RULE',
        weight: 0.95,
        description: `Vastu textual rule applied to room orientation`,
        isCrossDomain: false
      });
    });

    // 4. Map Chakra Entities
    chakraEntities.forEach(c => {
      const nodeId = `node-chk-${c.id}`;
      nodes.push({
        id: nodeId,
        label: c.canonicalName,
        domain: 'Chakra',
        entityId: c.id,
        canonicalName: c.canonicalName,
        sourceBook: c.sourceBook,
        confidenceScore: c.confidenceScore,
        verificationStatus: c.verificationStatus,
        attributes: c.attributes
      });
      domainCoverage.Chakra++;

      // Find cross-domain edge to Vastu
      if (c.attributes.associatedElement && input.primaryElement) {
        if (c.attributes.associatedElement.toLowerCase().includes(input.primaryElement.toLowerCase().split(' ')[0])) {
          edges.push({
            id: `edge-chk-vst-${c.id}`,
            sourceNodeId: userNodeId,
            targetNodeId: nodeId,
            relationType: 'ENERGETIC_SYNAPSE',
            weight: 0.92,
            description: `Chakra element resonates with room spatial element`,
            isCrossDomain: true
          });
        }
      }
    });

    // 5. Map Lal Kitab Entities
    lalkitabEntities.forEach(l => {
      const nodeId = `node-lkt-${l.id}`;
      nodes.push({
        id: nodeId,
        label: l.canonicalName,
        domain: 'LalKitab',
        entityId: l.id,
        canonicalName: l.canonicalName,
        sourceBook: l.sourceBook,
        confidenceScore: l.confidenceScore,
        verificationStatus: l.verificationStatus,
        attributes: l.attributes
      });
      domainCoverage.LalKitab++;

      edges.push({
        id: `edge-usr-lkt-${l.id}`,
        sourceNodeId: userNodeId,
        targetNodeId: nodeId,
        relationType: 'REMEDIAL_KARMIC_LINK',
        weight: 0.90,
        description: `Lal Kitab planetary house remedy`,
        isCrossDomain: false
      });
    });

    // 6. Map Numerology Entities
    numerologyEntities.forEach(n => {
      const nodeId = `node-num-${n.id}`;
      nodes.push({
        id: nodeId,
        label: n.canonicalName,
        domain: 'Numerology',
        entityId: n.id,
        canonicalName: n.canonicalName,
        sourceBook: n.sourceBook,
        confidenceScore: n.confidenceScore,
        verificationStatus: n.verificationStatus,
        attributes: n.attributes
      });
      domainCoverage.Numerology++;

      // Cross-Domain edge to Astrology/Chakra via Planet
      if (n.attributes.associatedPlanet && input.associatedPlanet) {
        edges.push({
          id: `edge-num-astro-${n.id}`,
          sourceNodeId: userNodeId,
          targetNodeId: nodeId,
          relationType: 'NUMERIC_PLANETARY_RESONANCE',
          weight: 0.94,
          description: `Chaldean numeric vibration matches planetary frequency`,
          isCrossDomain: true
        });
      }
    });

    // 7. Map Astrology Entities
    astrologyEntities.forEach(a => {
      const nodeId = `node-ast-${a.id}`;
      nodes.push({
        id: nodeId,
        label: a.canonicalName,
        domain: 'Astrology',
        entityId: a.id,
        canonicalName: a.canonicalName,
        sourceBook: a.sourceBook,
        confidenceScore: a.confidenceScore,
        verificationStatus: a.verificationStatus,
        attributes: a.attributes
      });
      domainCoverage.Astrology++;

      edges.push({
        id: `edge-usr-ast-${a.id}`,
        sourceNodeId: userNodeId,
        targetNodeId: nodeId,
        relationType: 'ASTROLOGICAL_CORRESPONDENCE',
        weight: 0.96,
        description: `Classical astrological Graha/Rashi/Bhava correspondence`,
        isCrossDomain: false
      });
    });

    return {
      contextId,
      timestamp: new Date().toISOString(),
      inputs: input,
      nodes,
      edges,
      domainCoverage,
      totalEntitiesLoaded: nodes.length
    };
  }
}
