import { ISIGRepository } from "./types";
import { 
  SIGNode, 
  SIGBaseEdge, 
  SIGEntityType, 
  SIGRelationshipType, 
  EntityID, 
  RelationshipID, 
  TransactionID 
} from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * High-performance, memory-isolated Property Graph Repository for SIG.
 * Manages full CRUD operations with indexed traversals and audit logging.
 */
export class SKIGraphRepository implements ISIGRepository {
  private nodes: Map<EntityID, SIGNode> = new Map();
  private edges: Map<RelationshipID, SIGBaseEdge> = new Map();

  // Historical state tracking for node audits
  private nodeHistory: Map<EntityID, Array<{
    version: number;
    modifiedTimestamp: string;
    modifiedByUser: string;
    transactionId: TransactionID;
    properties: Record<string, any>;
  }>> = new Map();

  // Graph indices for high-performance multi-hop traversals
  private outEdgesIndex: Map<EntityID, Set<RelationshipID>> = new Map();
  private inEdgesIndex: Map<EntityID, Set<RelationshipID>> = new Map();

  /**
   * Helper to perform a deep-clone on any entity.
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  /**
   * Persists a Node. Automatically updates audit history logs.
   */
  public async saveNode(node: SIGNode): Promise<SIGNode> {
    const cloned = this.deepClone(node);
    this.nodes.set(node.id, cloned);

    // Track node version history for explanation trace logs
    let history = this.nodeHistory.get(node.id);
    if (!history) {
      history = [];
      this.nodeHistory.set(node.id, history);
    }

    // Append to audit tracking if not a duplicate version
    if (!history.some(h => h.version === cloned.version)) {
      history.push({
        version: cloned.version,
        modifiedTimestamp: cloned.audit.modifiedTimestamp,
        modifiedByUser: cloned.audit.modifiedByUser,
        transactionId: cloned.audit.transactionId,
        properties: this.deepClone(cloned.properties),
      });
      // Sort history descending by version
      history.sort((a, b) => b.version - a.version);
    }

    return this.deepClone(cloned);
  }

  /**
   * Persists an Edge. Automatically registers relationships in forward/backward indices.
   */
  public async saveEdge(edge: SIGBaseEdge): Promise<SIGBaseEdge> {
    const cloned = this.deepClone(edge);
    this.edges.set(edge.id, cloned);

    // Register Source Index (outgoing path)
    if (!this.outEdgesIndex.has(edge.sourceId)) {
      this.outEdgesIndex.set(edge.sourceId, new Set());
    }
    this.outEdgesIndex.get(edge.sourceId)!.add(edge.id);

    // Register Target Index (incoming path)
    if (!this.inEdgesIndex.has(edge.targetId)) {
      this.inEdgesIndex.set(edge.targetId, new Set());
    }
    this.inEdgesIndex.get(edge.targetId)!.add(edge.id);

    return this.deepClone(cloned);
  }

  /**
   * Retrieves a node by ID, verifying tenant scope.
   */
  public async findNodeById(id: EntityID, tenantId: TenantID): Promise<SIGNode | null> {
    const node = this.nodes.get(id);
    if (!node) return null;

    if (node.tenantId !== tenantId) {
      throw new Error(`SECURITY_ACCESS_VIOLATION: Cross-tenant node query block for tenant '${tenantId}' on node '${id}'.`);
    }

    return node.lifecycleState === "DELETED" ? null : this.deepClone(node);
  }

  /**
   * Retrieves an edge by ID, verifying tenant scope.
   */
  public async findEdgeById(id: RelationshipID, tenantId: TenantID): Promise<SIGBaseEdge | null> {
    const edge = this.edges.get(id);
    if (!edge) return null;

    if (edge.tenantId !== tenantId) {
      throw new Error(`SECURITY_ACCESS_VIOLATION: Cross-tenant edge query block for tenant '${tenantId}' on edge '${id}'.`);
    }

    return this.deepClone(edge);
  }

  /**
   * Retrieves all active nodes matching a specific entity type under a tenant.
   */
  public async findNodesByType(type: SIGEntityType, tenantId: TenantID): Promise<SIGNode[]> {
    const results: SIGNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.tenantId === tenantId && node.type === type && node.lifecycleState !== "DELETED") {
        results.push(this.deepClone(node));
      }
    }
    return results;
  }

  /**
   * Looks up all outgoing edges stemming from a specific source node.
   */
  public async findEdgesBySource(sourceId: EntityID, tenantId: TenantID): Promise<SIGBaseEdge[]> {
    const edgeIds = this.outEdgesIndex.get(sourceId);
    if (!edgeIds) return [];

    const results: SIGBaseEdge[] = [];
    for (const id of edgeIds) {
      const edge = this.edges.get(id);
      if (edge && edge.tenantId === tenantId) {
        results.push(this.deepClone(edge));
      }
    }
    return results;
  }

  /**
   * Looks up all incoming edges heading to a specific target node.
   */
  public async findEdgesByTarget(targetId: EntityID, tenantId: TenantID): Promise<SIGBaseEdge[]> {
    const edgeIds = this.inEdgesIndex.get(targetId);
    if (!edgeIds) return [];

    const results: SIGBaseEdge[] = [];
    for (const id of edgeIds) {
      const edge = this.edges.get(id);
      if (edge && edge.tenantId === tenantId) {
        results.push(this.deepClone(edge));
      }
    }
    return results;
  }

  /**
   * Retrieves all edges of a given semantic relationship type under a tenant.
   */
  public async findEdgesByType(type: SIGRelationshipType, tenantId: TenantID): Promise<SIGBaseEdge[]> {
    const results: SIGBaseEdge[] = [];
    for (const edge of this.edges.values()) {
      if (edge.tenantId === tenantId && edge.type === type) {
        results.push(this.deepClone(edge));
      }
    }
    return results;
  }

  /**
   * Marks a Node as deleted and cleans associated edges and index records.
   */
  public async deleteNode(id: EntityID, tenantId: TenantID): Promise<boolean> {
    const node = this.nodes.get(id);
    if (!node) return false;

    if (node.tenantId !== tenantId) {
      throw new Error(`SECURITY_ACCESS_VIOLATION: Cross-tenant node deletion block.`);
    }

    // Set logical state to DELETED
    node.lifecycleState = "DELETED";
    node.audit.modifiedTimestamp = new Date().toISOString();
    this.nodes.set(id, node);

    // Prune outgoing edges
    const outIds = this.outEdgesIndex.get(id);
    if (outIds) {
      for (const edgeId of outIds) {
        this.edges.delete(edgeId);
      }
      this.outEdgesIndex.delete(id);
    }

    // Prune incoming edges
    const inIds = this.inEdgesIndex.get(id);
    if (inIds) {
      for (const edgeId of inIds) {
        this.edges.delete(edgeId);
      }
      this.inEdgesIndex.delete(id);
    }

    return true;
  }

  /**
   * Purges a semantic edge and clears corresponding indexes.
   */
  public async deleteEdge(id: RelationshipID, tenantId: TenantID): Promise<boolean> {
    const edge = this.edges.get(id);
    if (!edge) return false;

    if (edge.tenantId !== tenantId) {
      throw new Error(`SECURITY_ACCESS_VIOLATION: Cross-tenant edge deletion block.`);
    }

    this.edges.delete(id);

    // Remove from index
    const outSet = this.outEdgesIndex.get(edge.sourceId);
    if (outSet) outSet.delete(id);

    const inSet = this.inEdgesIndex.get(edge.targetId);
    if (inSet) inSet.delete(id);

    return true;
  }

  /**
   * Retrieves history log lists of a specific Node.
   */
  public async getNodeHistory(id: EntityID, tenantId: TenantID): Promise<Array<{
    version: number;
    modifiedTimestamp: string;
    modifiedByUser: string;
    transactionId: TransactionID;
    properties: Record<string, any>;
  }>> {
    const node = this.nodes.get(id);
    if (!node || node.tenantId !== tenantId) {
      return [];
    }

    const history = this.nodeHistory.get(id);
    return history ? this.deepClone(history) : [];
  }
}
