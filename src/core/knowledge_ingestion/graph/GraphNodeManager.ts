// ============================================================================
// GRAPH NODE MANAGER (PHASE 4)
// Enforces LOCK 45: Permanent reference to Semantic Object, Document, Citation, Provenance, Knowledge Version
// Graph never owns knowledge; Knowledge Brain remains Single Source of Truth
// ============================================================================

import { GraphNode, GraphNodeType } from "../types/graphKnowledge";
import { KnowledgeProvenance, SourceCitation } from "../../../types/semanticKnowledge";
import { GraphStorageManager } from "./GraphStorageManager";

export class GraphNodeManager {
  private static semanticObjectIndex: Map<string, string> = new Map(); // semanticObjectId -> nodeId
  private static documentIndex: Map<string, Set<string>> = new Map(); // documentId -> Set of nodeIds
  private static typeIndex: Map<GraphNodeType, Set<string>> = new Map(); // GraphNodeType -> Set of nodeIds

  /**
   * Creates a graph node ensuring LOCK 45 compliance.
   */
  public static async createNode(params: {
    id?: string;
    label: string;
    nodeType: GraphNodeType;
    semanticObjectId: string;
    documentId: string;
    citation: SourceCitation;
    provenance: KnowledgeProvenance;
    knowledgeVersion?: string;
    properties?: Record<string, any>;
  }): Promise<GraphNode> {
    const storage = GraphStorageManager.getActiveBackend();
    const nodeId = params.id || `NODE-${params.nodeType}-${params.semanticObjectId}`;

    // Verify Lock 45 Requirements
    if (!params.semanticObjectId) throw new Error(`LOCK 45 VIOLATION: Node ${nodeId} must reference a Semantic Object.`);
    if (!params.documentId) throw new Error(`LOCK 45 VIOLATION: Node ${nodeId} must reference a Document.`);
    if (!params.citation) throw new Error(`LOCK 45 VIOLATION: Node ${nodeId} must contain a Source Citation.`);
    if (!params.provenance) throw new Error(`LOCK 45 VIOLATION: Node ${nodeId} must contain Knowledge Provenance.`);

    const node: GraphNode = {
      id: nodeId,
      label: params.label,
      nodeType: params.nodeType,
      semanticObjectId: params.semanticObjectId,
      documentId: params.documentId,
      citation: params.citation,
      provenance: params.provenance,
      knowledgeVersion: params.knowledgeVersion || "Phase-4-KnowledgeBrain-v1",
      properties: params.properties || {},
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    await storage.addNode(node);

    // Indexing
    this.semanticObjectIndex.set(node.semanticObjectId, node.id);

    if (!this.documentIndex.has(node.documentId)) {
      this.documentIndex.set(node.documentId, new Set());
    }
    this.documentIndex.get(node.documentId)!.add(node.id);

    if (!this.typeIndex.has(node.nodeType)) {
      this.typeIndex.set(node.nodeType, new Set());
    }
    this.typeIndex.get(node.nodeType)!.add(node.id);

    return node;
  }

  public static async getNodeById(id: string): Promise<GraphNode | null> {
    return GraphStorageManager.getActiveBackend().getNode(id);
  }

  public static async getNodeBySemanticObjectId(semanticObjectId: string): Promise<GraphNode | null> {
    const nodeId = this.semanticObjectIndex.get(semanticObjectId);
    if (!nodeId) return null;
    return this.getNodeById(nodeId);
  }

  public static async getNodesByDocument(documentId: string): Promise<GraphNode[]> {
    const nodeIds = this.documentIndex.get(documentId);
    if (!nodeIds) return [];
    const storage = GraphStorageManager.getActiveBackend();
    const nodes: GraphNode[] = [];
    for (const id of nodeIds) {
      const node = await storage.getNode(id);
      if (node) nodes.push(node);
    }
    return nodes;
  }

  public static async getNodesByType(nodeType: GraphNodeType): Promise<GraphNode[]> {
    const nodeIds = this.typeIndex.get(nodeType);
    if (!nodeIds) return [];
    const storage = GraphStorageManager.getActiveBackend();
    const nodes: GraphNode[] = [];
    for (const id of nodeIds) {
      const node = await storage.getNode(id);
      if (node) nodes.push(node);
    }
    return nodes;
  }

  public static async getAllNodes(): Promise<GraphNode[]> {
    return GraphStorageManager.getActiveBackend().getAllNodes();
  }

  public static clearIndexes(): void {
    this.semanticObjectIndex.clear();
    this.documentIndex.clear();
    this.typeIndex.clear();
  }

  public static removeDocumentFromIndex(documentId: string): void {
    const nodeIds = this.documentIndex.get(documentId);
    if (!nodeIds) return;

    for (const nodeId of nodeIds) {
      this.semanticObjectIndex.forEach((mappedNodeId, semanticId) => {
        if (mappedNodeId === nodeId) {
          this.semanticObjectIndex.delete(semanticId);
        }
      });
      for (const typeSet of this.typeIndex.values()) {
        typeSet.delete(nodeId);
      }
    }

    this.documentIndex.delete(documentId);
  }
}
