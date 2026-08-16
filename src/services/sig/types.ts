import { 
  SIGNode, 
  SIGBaseEdge, 
  SIGEntityType, 
  SIGRelationshipType, 
  EntityID, 
  RelationshipID, 
  TransactionID, 
  SIGQueryFilter, 
  SIGTraversalOptions, 
  SIGGraphQueryResult 
} from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Result structure for graph validation checks.
 */
export interface SIGValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Factory Interface following the Factory Pattern.
 * Handles primary instantiation and version revision of graph vertices (Nodes) and edges (Edges).
 */
export interface ISIGFactory {
  createNode(
    tenantId: TenantID,
    type: SIGEntityType,
    properties: Record<string, any>,
    userId: string,
    transactionId?: TransactionID
  ): SIGNode;

  createRevision(
    existing: SIGNode,
    updates: Partial<Record<string, any>>,
    userId: string,
    transactionId?: TransactionID
  ): SIGNode;

  createEdge(
    tenantId: TenantID,
    type: SIGRelationshipType,
    sourceId: EntityID,
    targetId: EntityID,
    userId: string,
    weight?: number,
    properties?: Record<string, any>,
    transactionId?: TransactionID
  ): SIGBaseEdge;
}

/**
 * Validator Interface following the Specification Pattern.
 * Enforces schema compliance, multi-tenant boundaries, and topological integrity rules.
 */
export interface ISIGValidator {
  validateNode(node: SIGNode): SIGValidationResult;
  validateEdge(edge: SIGBaseEdge, sourceNode: SIGNode, targetNode: SIGNode): SIGValidationResult;
  verifyMultiTenantConstraint(tenantId: TenantID, nodes: SIGNode[], edges: SIGBaseEdge[]): boolean;
  hasDirectedCycle(nodes: SIGNode[], edges: SIGBaseEdge[]): boolean;
  findOrphanNodes(nodes: SIGNode[], edges: SIGBaseEdge[]): SIGNode[];
  verifyUniqueIds(nodes: SIGNode[], edges: SIGBaseEdge[]): boolean;
  isValidRelationship(type: SIGRelationshipType, sourceClass: SIGEntityType, targetClass: SIGEntityType): boolean;
}

/**
 * Repository Interface following the DDD / Repository Pattern.
 * Manages atomic persistence, version histories, and indexing of vertices and edges.
 */
export interface ISIGRepository {
  saveNode(node: SIGNode): Promise<SIGNode>;
  saveEdge(edge: SIGBaseEdge): Promise<SIGBaseEdge>;
  
  findNodeById(id: EntityID, tenantId: TenantID): Promise<SIGNode | null>;
  findEdgeById(id: RelationshipID, tenantId: TenantID): Promise<SIGBaseEdge | null>;
  
  findNodesByType(type: SIGEntityType, tenantId: TenantID): Promise<SIGNode[]>;
  findEdgesBySource(sourceId: EntityID, tenantId: TenantID): Promise<SIGBaseEdge[]>;
  findEdgesByTarget(targetId: EntityID, tenantId: TenantID): Promise<SIGBaseEdge[]>;
  findEdgesByType(type: SIGRelationshipType, tenantId: TenantID): Promise<SIGBaseEdge[]>;
  
  deleteNode(id: EntityID, tenantId: TenantID): Promise<boolean>;
  deleteEdge(id: RelationshipID, tenantId: TenantID): Promise<boolean>;
  
  getNodeHistory(id: EntityID, tenantId: TenantID): Promise<Array<{
    version: number;
    modifiedTimestamp: string;
    modifiedByUser: string;
    transactionId: TransactionID;
    properties: Record<string, any>;
  }>>;
}

/**
 * Extended options that include strategy customization for the general traverse method.
 */
export interface ExtendedTraversalOptions extends SIGTraversalOptions {
  strategy?: "BFS" | "DFS";
}

/**
 * Result structure representing retrieved shortest path pathways.
 */
export interface ShortestPathResult {
  pathExists: boolean;
  nodes: SIGNode[];
  edges: SIGBaseEdge[];
  totalWeight: number;
  executionTimeMs: number;
}

/**
 * Traversal Interface for high-performance multi-hop graph queries.
 * Leveraged by explanation engines to construct reasoning justification paths.
 */
export interface ISIGTraversalEngine {
  traverse(
    pivotId: EntityID,
    tenantId: TenantID,
    options: ExtendedTraversalOptions,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult>;

  traverseDFS(
    pivotId: EntityID,
    tenantId: TenantID,
    options: SIGTraversalOptions,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult>;

  findShortestPath(
    startId: EntityID,
    endId: EntityID,
    tenantId: TenantID,
    weighted: boolean,
    repository: ISIGRepository
  ): Promise<ShortestPathResult>;

  traverseMultiHop(
    pivotId: EntityID,
    tenantId: TenantID,
    hops: number,
    repository: ISIGRepository
  ): Promise<SIGGraphQueryResult>;
}

/**
 * Query Engine Interface for Cypher/GraphQL-style property matching.
 */
export interface ISIGQueryEngine {
  search(
    filters: SIGQueryFilter[],
    tenantId: TenantID,
    repository: ISIGRepository
  ): Promise<SIGNode[]>;
}

/**
 * Service Layer coordinating atomic operations, relationship configurations, and multi-tenant constraints.
 */
export interface ISIGService {
  // Vertex Operations
  registerNode(
    tenantId: TenantID,
    type: SIGEntityType,
    properties: Record<string, any>,
    userId: string,
    transactionId?: TransactionID
  ): Promise<SIGNode>;

  updateNode(
    id: EntityID,
    tenantId: TenantID,
    updates: Partial<Record<string, any>>,
    userId: string,
    transactionId?: TransactionID
  ): Promise<SIGNode>;

  getNode(id: EntityID, tenantId: TenantID): Promise<SIGNode>;
  removeNode(id: EntityID, tenantId: TenantID): Promise<boolean>;

  // Edge / Relationship Operations
  connectNodes(
    tenantId: TenantID,
    type: SIGRelationshipType,
    sourceId: EntityID,
    targetId: EntityID,
    userId: string,
    weight?: number,
    properties?: Record<string, any>,
    transactionId?: TransactionID
  ): Promise<SIGBaseEdge>;

  disconnectNodes(edgeId: RelationshipID, tenantId: TenantID): Promise<boolean>;

  // Graph Traversal & Semantic Searches
  getReasoningChain(pivotId: EntityID, tenantId: TenantID): Promise<SIGGraphQueryResult>;
  queryGraph(filters: SIGQueryFilter[], tenantId: TenantID): Promise<SIGNode[]>;
  traverseGraph(pivotId: EntityID, tenantId: TenantID, options: ExtendedTraversalOptions): Promise<SIGGraphQueryResult>;
  traverseDFS(pivotId: EntityID, tenantId: TenantID, options: SIGTraversalOptions): Promise<SIGGraphQueryResult>;
  findShortestPath(startId: EntityID, endId: EntityID, tenantId: TenantID, weighted: boolean): Promise<ShortestPathResult>;
  traverseMultiHop(pivotId: EntityID, tenantId: TenantID, hops: number): Promise<SIGGraphQueryResult>;
}
