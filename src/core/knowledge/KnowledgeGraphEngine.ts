// Module 4: Knowledge Graph Engine
import { KnowledgeGraphNode, KnowledgeGraphEdge, GraphTriplet, GraphEdgeType } from "../../types/knowledgeIntelligence";

class KnowledgeGraphEngineStore {
  private nodes: Map<string, KnowledgeGraphNode> = new Map();
  private edges: Map<string, KnowledgeGraphEdge> = new Map();

  constructor() {
    this.seedClassicalGraph();
  }

  private seedClassicalGraph(): void {
    const defaultNodes: KnowledgeGraphNode[] = [
      { id: "NODE_CARDINAL_AXIS", tenantId: "global_tenant", type: "CONCEPT", label: "Cardinal Axis Alignment", description: "Orthogonal alignment with North-South poles", properties: {} },
      { id: "NODE_BRAHMASTHAN", tenantId: "global_tenant", type: "CONCEPT", label: "Brahmasthan Clearance", description: "Central 3x3 grid zone clearance rule", properties: {} },
      { id: "NODE_NORTHWEST_SANITY", tenantId: "global_tenant", type: "RULE", label: "Northwest Sanitary Placement", description: "Position toilets in Northwest Vayavya sector", properties: {} },
      { id: "NODE_NORTHEAST_WATER", tenantId: "global_tenant", type: "RULE", label: "Northeast Water Element", description: "Position clean water reservoirs in Ishanya sector", properties: {} },
      { id: "NODE_AYADI_AYA", tenantId: "global_tenant", type: "FORMULA", label: "Ayadi Aya Prosperity Formula", description: "(Width * Length * 8) % 12", properties: {} },
      { id: "NODE_AYADI_VYAYA", tenantId: "global_tenant", type: "FORMULA", label: "Ayadi Vyaya Expenditure Formula", description: "(Length * Width * 3) % 8", properties: {} }
    ];

    const defaultEdges: KnowledgeGraphEdge[] = [
      { id: "EDGE_1", tenantId: "global_tenant", sourceId: "NODE_CARDINAL_AXIS", targetId: "NODE_BRAHMASTHAN", type: "DEPENDS_ON", description: "Brahmasthan coordinates require cardinal alignment" },
      { id: "EDGE_2", tenantId: "global_tenant", sourceId: "NODE_NORTHWEST_SANITY", targetId: "NODE_BRAHMASTHAN", type: "COMPLEMENTS", description: "Sanitary drainage avoids central Brahmasthan" },
      { id: "EDGE_3", tenantId: "global_tenant", sourceId: "NODE_NORTHEAST_WATER", targetId: "NODE_AYADI_AYA", type: "CALCULATES", description: "Water volume correlates with Ayadi Aya multiplier" }
    ];

    defaultNodes.forEach(n => this.nodes.set(n.id, n));
    defaultEdges.forEach(e => this.edges.set(e.id, e));
  }

  public addNode(node: KnowledgeGraphNode): void {
    this.nodes.set(node.id, node);
  }

  public addEdge(edge: KnowledgeGraphEdge): void {
    this.edges.set(edge.id, edge);
  }

  public getNodes(tenantId: string): KnowledgeGraphNode[] {
    return Array.from(this.nodes.values()).filter(
      n => n.tenantId === tenantId || n.tenantId === "global_tenant"
    );
  }

  public getEdges(tenantId: string): KnowledgeGraphEdge[] {
    return Array.from(this.edges.values()).filter(
      e => e.tenantId === tenantId || e.tenantId === "global_tenant"
    );
  }

  public getTriplets(tenantId: string): GraphTriplet[] {
    const triplets: GraphTriplet[] = [];
    const validEdges = this.getEdges(tenantId);

    validEdges.forEach(edge => {
      const srcNode = this.nodes.get(edge.sourceId);
      const tgtNode = this.nodes.get(edge.targetId);

      if (srcNode && tgtNode) {
        triplets.push({
          subject: srcNode.label,
          predicate: edge.type,
          object: tgtNode.label,
          tenantId: edge.tenantId,
          confidence: edge.weight || 0.95
        });
      }
    });

    return triplets;
  }

  // Multi-hop graph traversal to expand context around query concepts
  public expandQueryContext(queryKeywords: string[], tenantId: string, maxHops: number = 2): GraphTriplet[] {
    const validNodes = this.getNodes(tenantId);
    const validEdges = this.getEdges(tenantId);

    const matchingNodeIds = new Set<string>();

    validNodes.forEach(node => {
      const labelLower = node.label.toLowerCase();
      if (queryKeywords.some(kw => labelLower.includes(kw))) {
        matchingNodeIds.add(node.id);
      }
    });

    const expandedNodeIds = new Set<string>(matchingNodeIds);

    // Hop expansion
    for (let hop = 0; hop < maxHops; hop++) {
      validEdges.forEach(edge => {
        if (expandedNodeIds.has(edge.sourceId)) expandedNodeIds.add(edge.targetId);
        if (expandedNodeIds.has(edge.targetId)) expandedNodeIds.add(edge.sourceId);
      });
    }

    const relevantTriplets: GraphTriplet[] = [];
    validEdges.forEach(edge => {
      if (expandedNodeIds.has(edge.sourceId) && expandedNodeIds.has(edge.targetId)) {
        const srcNode = this.nodes.get(edge.sourceId);
        const tgtNode = this.nodes.get(edge.targetId);
        if (srcNode && tgtNode) {
          relevantTriplets.push({
            subject: srcNode.label,
            predicate: edge.type,
            object: tgtNode.label,
            tenantId: edge.tenantId,
            confidence: 0.95
          });
        }
      }
    });

    return relevantTriplets;
  }
}

export const KnowledgeGraphEngine = new KnowledgeGraphEngineStore();
