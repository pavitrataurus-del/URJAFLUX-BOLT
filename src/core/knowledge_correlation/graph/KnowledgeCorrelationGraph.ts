// ============================================================================
// URJAFLUX AI OS - KNOWLEDGE CORRELATION GRAPH (KCoE)
// High-Performance In-Memory Structural Knowledge Graph Storage & Traversal Engine
// ============================================================================

import { 
  IKCoEGraphNode, 
  IKCoERelationshipEdge, 
  IKCoETraversalQuery, 
  IKCoETraversalPath, 
  IKCoEGraphSnapshot,
  KnowledgeDomain
} from "../types/kcoe.types";

export class KnowledgeCorrelationGraph {
  private static instance: KnowledgeCorrelationGraph;

  private nodes: Map<string, IKCoEGraphNode> = new Map();
  private edges: Map<string, IKCoERelationshipEdge> = new Map();
  
  // Quick adjacency maps
  private outgoingMap: Map<string, Set<string>> = new Map();
  private incomingMap: Map<string, Set<string>> = new Map();

  private constructor() {}

  public static getInstance(): KnowledgeCorrelationGraph {
    if (!KnowledgeCorrelationGraph.instance) {
      KnowledgeCorrelationGraph.instance = new KnowledgeCorrelationGraph();
    }
    return KnowledgeCorrelationGraph.instance;
  }

  /**
   * Adds or updates a node in the graph
   */
  public addNode(node: IKCoEGraphNode): void {
    if (!this.nodes.has(node.nodeId)) {
      this.nodes.set(node.nodeId, {
        ...node,
        outgoingEdgeIds: [],
        incomingEdgeIds: []
      });
      this.outgoingMap.set(node.nodeId, new Set());
      this.incomingMap.set(node.nodeId, new Set());
    } else {
      const existing = this.nodes.get(node.nodeId)!;
      this.nodes.set(node.nodeId, {
        ...existing,
        ...node,
        outgoingEdgeIds: existing.outgoingEdgeIds,
        incomingEdgeIds: existing.incomingEdgeIds
      });
    }
  }

  /**
   * Adds or updates a relationship edge in the graph
   */
  public addEdge(edge: IKCoERelationshipEdge): void {
    if (this.edges.has(edge.relationshipId)) {
      return; // Already indexed
    }

    this.edges.set(edge.relationshipId, edge);

    // Ensure source and target nodes exist in node map
    if (!this.nodes.has(edge.sourceId)) {
      this.addNode({
        nodeId: edge.sourceId,
        nodeType: 'RECORD',
        domain: edge.metadata.sourceDomain,
        category: 'CONDITION',
        label: `Node-${edge.sourceId}`,
        dimensions: { directions: [], zones: [], elements: [], planets: [], rooms: [], objectTypes: [], chakras: [], activities: [] },
        outgoingEdgeIds: [],
        incomingEdgeIds: []
      });
    }

    if (!this.nodes.has(edge.targetId)) {
      this.addNode({
        nodeId: edge.targetId,
        nodeType: 'RECORD',
        domain: edge.metadata.targetDomain,
        category: 'CONDITION',
        label: `Node-${edge.targetId}`,
        dimensions: { directions: [], zones: [], elements: [], planets: [], rooms: [], objectTypes: [], chakras: [], activities: [] },
        outgoingEdgeIds: [],
        incomingEdgeIds: []
      });
    }

    // Update adjacency list
    const sourceNode = this.nodes.get(edge.sourceId)!;
    const targetNode = this.nodes.get(edge.targetId)!;

    if (!sourceNode.outgoingEdgeIds.includes(edge.relationshipId)) {
      sourceNode.outgoingEdgeIds.push(edge.relationshipId);
    }
    if (!targetNode.incomingEdgeIds.includes(edge.relationshipId)) {
      targetNode.incomingEdgeIds.push(edge.relationshipId);
    }

    if (!this.outgoingMap.has(edge.sourceId)) this.outgoingMap.set(edge.sourceId, new Set());
    if (!this.incomingMap.has(edge.targetId)) this.incomingMap.set(edge.targetId, new Set());

    this.outgoingMap.get(edge.sourceId)!.add(edge.relationshipId);
    this.incomingMap.get(edge.targetId)!.add(edge.relationshipId);
  }

  /**
   * Gets node by ID
   */
  public getNode(nodeId: string): IKCoEGraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Gets edge by ID
   */
  public getEdge(edgeId: string): IKCoERelationshipEdge | undefined {
    return this.edges.get(edgeId);
  }

  /**
   * Retrieves outgoing relationships for a node
   */
  public getOutgoingEdges(nodeId: string): IKCoERelationshipEdge[] {
    const edgeIds = this.outgoingMap.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  /**
   * Retrieves incoming relationships for a node
   */
  public getIncomingEdges(nodeId: string): IKCoERelationshipEdge[] {
    const edgeIds = this.incomingMap.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  /**
   * Graph Traversal Engine (Breadth-First Search up to maxDepth)
   */
  public traverse(query: IKCoETraversalQuery): IKCoETraversalPath[] {
    const maxDepth = query.maxDepth ?? 2;
    const direction = query.direction ?? 'BOTH';
    const allowedTypes = query.allowedRelationshipTypes ? new Set(query.allowedRelationshipTypes) : null;
    const targetDomains = query.targetDomains ? new Set(query.targetDomains) : null;

    const paths: IKCoETraversalPath[] = [];
    const queue: Array<{ currentNodeId: string; depth: number; currentPathNodes: IKCoEGraphNode[]; currentPathEdges: IKCoERelationshipEdge[] }> = [];

    const startNode = this.nodes.get(query.startNodeId);
    if (!startNode) return [];

    queue.push({
      currentNodeId: query.startNodeId,
      depth: 0,
      currentPathNodes: [startNode],
      currentPathEdges: []
    });

    const visitedEdges = new Set<string>();

    while (queue.length > 0) {
      const { currentNodeId, depth, currentPathNodes, currentPathEdges } = queue.shift()!;

      if (depth >= maxDepth) {
        continue;
      }

      let candidateEdges: IKCoERelationshipEdge[] = [];
      if (direction === 'OUTGOING' || direction === 'BOTH') {
        candidateEdges = candidateEdges.concat(this.getOutgoingEdges(currentNodeId));
      }
      if (direction === 'INCOMING' || direction === 'BOTH') {
        candidateEdges = candidateEdges.concat(this.getIncomingEdges(currentNodeId));
      }

      for (const edge of candidateEdges) {
        if (visitedEdges.has(edge.relationshipId)) continue;
        if (allowedTypes && !allowedTypes.has(edge.relationshipType)) continue;

        const neighborId = edge.sourceId === currentNodeId ? edge.targetId : edge.sourceId;
        const neighborNode = this.nodes.get(neighborId);
        if (!neighborNode) continue;

        if (targetDomains && !targetDomains.has(neighborNode.domain)) continue;

        visitedEdges.add(edge.relationshipId);

        const newPathNodes = [...currentPathNodes, neighborNode];
        const newPathEdges = [...currentPathEdges, edge];

        const traversalPath: IKCoETraversalPath = {
          nodes: newPathNodes,
          edges: newPathEdges,
          depth: depth + 1,
          startNodeId: query.startNodeId,
          endNodeId: neighborId
        };

        paths.push(traversalPath);

        queue.push({
          currentNodeId: neighborId,
          depth: depth + 1,
          currentPathNodes: newPathNodes,
          currentPathEdges: newPathEdges
        });
      }
    }

    return paths;
  }

  /**
   * Generates graph snapshot statistics
   */
  public getSnapshot(): IKCoEGraphSnapshot {
    const domainNodeDistribution: Record<string, number> = {};
    this.nodes.forEach(node => {
      domainNodeDistribution[node.domain] = (domainNodeDistribution[node.domain] || 0) + 1;
    });

    const relationshipTypeDistribution: Record<string, number> = {};
    this.edges.forEach(edge => {
      relationshipTypeDistribution[edge.relationshipType] = (relationshipTypeDistribution[edge.relationshipType] || 0) + 1;
    });

    return {
      totalNodes: this.nodes.size,
      totalEdges: this.edges.size,
      domainNodeDistribution,
      relationshipTypeDistribution,
      graphVersion: "1.0.0-CANONICAL",
      timestamp: new Date().toISOString()
    };
  }

  public clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.outgoingMap.clear();
    this.incomingMap.clear();
  }
}

export const knowledgeCorrelationGraph = KnowledgeCorrelationGraph.getInstance();
