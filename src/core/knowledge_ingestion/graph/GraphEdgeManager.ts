// ============================================================================
// GRAPH EDGE MANAGER (PHASE 4)
// Enforces LOCK 46: Every Graph Edge must always contain evidence with supporting citations
// Relationships without supporting citations must NEVER exist
// ============================================================================

import { GraphEdge, GraphEdgeType } from "../types/graphKnowledge";
import { KnowledgeProvenance, SourceCitation } from "../../../types/semanticKnowledge";
import { GraphStorageManager } from "./GraphStorageManager";

export class GraphEdgeManager {
  private static typeIndex: Map<GraphEdgeType, Set<string>> = new Map();

  /**
   * Creates a graph edge enforcing LOCK 46 compliance.
   */
  public static async createEdge(params: {
    id?: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: GraphEdgeType;
    label: string;
    weight?: number;
    evidence: {
      citation: SourceCitation;
      provenance: KnowledgeProvenance;
      supportingText: string;
      confidenceScore?: number;
    };
    properties?: Record<string, any>;
  }): Promise<GraphEdge> {
    const storage = GraphStorageManager.getActiveBackend();
    const edgeId = params.id || `EDGE-${params.edgeType}-${params.sourceNodeId}->${params.targetNodeId}`;

    // Verify Lock 46 Requirements
    if (!params.evidence || !params.evidence.citation) {
      throw new Error(`LOCK 46 VIOLATION: Relationship edge ${edgeId} must contain evidence with a supporting Source Citation.`);
    }
    if (!params.evidence.provenance) {
      throw new Error(`LOCK 46 VIOLATION: Relationship edge ${edgeId} must contain evidence with Knowledge Provenance.`);
    }

    const edge: GraphEdge = {
      id: edgeId,
      sourceNodeId: params.sourceNodeId,
      targetNodeId: params.targetNodeId,
      edgeType: params.edgeType,
      label: params.label,
      weight: params.weight ?? 1.0,
      evidence: {
        citation: params.evidence.citation,
        provenance: params.evidence.provenance,
        supportingText: params.evidence.supportingText || params.label,
        confidenceScore: params.evidence.confidenceScore ?? 1.0
      },
      properties: params.properties || {},
      createdDate: new Date().toISOString()
    };

    await storage.addEdge(edge);

    if (!this.typeIndex.has(edge.edgeType)) {
      this.typeIndex.set(edge.edgeType, new Set());
    }
    this.typeIndex.get(edge.edgeType)!.add(edge.id);

    return edge;
  }

  public static async getEdgeById(id: string): Promise<GraphEdge | null> {
    return GraphStorageManager.getActiveBackend().getEdge(id);
  }

  public static async getOutgoingEdges(nodeId: string): Promise<GraphEdge[]> {
    return GraphStorageManager.getActiveBackend().getOutgoingEdges(nodeId);
  }

  public static async getIncomingEdges(nodeId: string): Promise<GraphEdge[]> {
    return GraphStorageManager.getActiveBackend().getIncomingEdges(nodeId);
  }

  public static async getEdgesBetweenNodes(sourceNodeId: string, targetNodeId: string): Promise<GraphEdge[]> {
    const outgoing = await this.getOutgoingEdges(sourceNodeId);
    return outgoing.filter(e => e.targetNodeId === targetNodeId);
  }

  public static async getEdgesByType(edgeType: GraphEdgeType): Promise<GraphEdge[]> {
    const edgeIds = this.typeIndex.get(edgeType);
    if (!edgeIds) return [];
    const storage = GraphStorageManager.getActiveBackend();
    const edges: GraphEdge[] = [];
    for (const id of edgeIds) {
      const edge = await storage.getEdge(id);
      if (edge) edges.push(edge);
    }
    return edges;
  }

  public static async getAllEdges(): Promise<GraphEdge[]> {
    return GraphStorageManager.getActiveBackend().getAllEdges();
  }

  public static clearIndexes(): void {
    this.typeIndex.clear();
  }
}
