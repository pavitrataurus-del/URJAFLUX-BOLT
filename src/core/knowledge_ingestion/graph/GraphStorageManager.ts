// ============================================================================
// GRAPH STORAGE MANAGER & IN-MEMORY BACKEND (PHASE 4)
// Implements swappable graph storage backends (Future Ready: Neo4j, Memgraph, NetworkX, Neptune)
// ============================================================================

import { GraphNode, GraphEdge, IGraphStorageBackend } from "../types/graphKnowledge";

/**
 * DEFAULT IN-MEMORY GRAPH STORAGE BACKEND
 */
export class InMemoryGraphStorageBackend implements IGraphStorageBackend {
  public name = "In-Memory Graph Engine";

  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private outgoingIndex: Map<string, Set<string>> = new Map(); // nodeId -> Set of edgeIds
  private incomingIndex: Map<string, Set<string>> = new Map(); // nodeId -> Set of edgeIds

  public async addNode(node: GraphNode): Promise<void> {
    this.nodes.set(node.id, node);
    if (!this.outgoingIndex.has(node.id)) {
      this.outgoingIndex.set(node.id, new Set());
    }
    if (!this.incomingIndex.has(node.id)) {
      this.incomingIndex.set(node.id, new Set());
    }
  }

  public async addEdge(edge: GraphEdge): Promise<void> {
    this.edges.set(edge.id, edge);

    if (!this.outgoingIndex.has(edge.sourceNodeId)) {
      this.outgoingIndex.set(edge.sourceNodeId, new Set());
    }
    this.outgoingIndex.get(edge.sourceNodeId)!.add(edge.id);

    if (!this.incomingIndex.has(edge.targetNodeId)) {
      this.incomingIndex.set(edge.targetNodeId, new Set());
    }
    this.incomingIndex.get(edge.targetNodeId)!.add(edge.id);
  }

  public async getNode(id: string): Promise<GraphNode | null> {
    return this.nodes.get(id) || null;
  }

  public async getEdge(id: string): Promise<GraphEdge | null> {
    return this.edges.get(id) || null;
  }

  public async getOutgoingEdges(nodeId: string): Promise<GraphEdge[]> {
    const edgeIds = this.outgoingIndex.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  public async getIncomingEdges(nodeId: string): Promise<GraphEdge[]> {
    const edgeIds = this.incomingIndex.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  public async getAllNodes(): Promise<GraphNode[]> {
    return Array.from(this.nodes.values());
  }

  public async getAllEdges(): Promise<GraphEdge[]> {
    return Array.from(this.edges.values());
  }

  public async deleteNode(id: string): Promise<boolean> {
    const exists = this.nodes.has(id);
    this.nodes.delete(id);
    this.outgoingIndex.delete(id);
    this.incomingIndex.delete(id);
    return exists;
  }

  public async deleteEdge(id: string): Promise<boolean> {
    const edge = this.edges.get(id);
    if (!edge) return false;

    this.edges.delete(id);
    this.outgoingIndex.get(edge.sourceNodeId)?.delete(id);
    this.incomingIndex.get(edge.targetNodeId)?.delete(id);
    return true;
  }

  public async clear(): Promise<void> {
    this.nodes.clear();
    this.edges.clear();
    this.outgoingIndex.clear();
    this.incomingIndex.clear();
  }
}

/**
 * GRAPH STORAGE MANAGER
 * Controls active storage backend. Allows effortless dynamic switching to Neo4j, NetworkX, Memgraph, Neptune, Cosmos Graph.
 */
export class GraphStorageManager {
  private static backends: Map<string, IGraphStorageBackend> = new Map();
  private static activeBackendName = "IN_MEMORY";

  static {
    const memoryBackend = new InMemoryGraphStorageBackend();
    this.backends.set("IN_MEMORY", memoryBackend);
  }

  public static getActiveBackend(): IGraphStorageBackend {
    return this.backends.get(this.activeBackendName) || this.backends.get("IN_MEMORY")!;
  }

  public static setActiveBackend(backendKey: string): void {
    if (this.backends.has(backendKey)) {
      this.activeBackendName = backendKey;
    }
  }

  public static registerBackend(key: string, backend: IGraphStorageBackend): void {
    this.backends.set(key, backend);
  }

  public static getRegisteredBackends(): { key: string; name: string }[] {
    return Array.from(this.backends.entries()).map(([key, backend]) => ({
      key,
      name: backend.name
    }));
  }
}
