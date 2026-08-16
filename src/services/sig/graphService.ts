import { 
  ISIGService, 
  ISIGRepository, 
  ISIGFactory, 
  ISIGValidator, 
  ISIGTraversalEngine, 
  ISIGQueryEngine,
  ExtendedTraversalOptions,
  ShortestPathResult
} from "./types";
import { RelationshipManager } from "./relationshipManager";
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
import { NodeNotFoundError, ConstraintViolationError } from "./errors";
import { SIGEventDispatcher } from "./events";

/**
 * Core Production-ready Spatial Intelligence Graph (SIG) service.
 * Handles end-to-end node, connection, traversal, and query operations.
 */
export class GraphService implements ISIGService {
  private repository: ISIGRepository;
  private factory: ISIGFactory;
  private validator: ISIGValidator;
  private traversalEngine: ISIGTraversalEngine;
  private queryEngine: ISIGQueryEngine;
  private relationshipManager: RelationshipManager;

  constructor(
    repository: ISIGRepository,
    factory: ISIGFactory,
    validator: ISIGValidator,
    traversalEngine: ISIGTraversalEngine,
    queryEngine: ISIGQueryEngine
  ) {
    this.repository = repository;
    this.factory = factory;
    this.validator = validator;
    this.traversalEngine = traversalEngine;
    this.queryEngine = queryEngine;
    this.relationshipManager = new RelationshipManager(repository, factory, validator);
  }

  /**
   * Registers a brand-new Node (vertex) inside the spatial graph.
   */
  public async registerNode(
    tenantId: TenantID,
    type: SIGEntityType,
    properties: Record<string, any>,
    userId: string,
    transactionId?: TransactionID
  ): Promise<SIGNode> {
    // 1. Instantiate the Node using the factory
    const node = this.factory.createNode(tenantId, type, properties, userId, transactionId);

    // 2. Validate Node Invariants
    const validation = this.validator.validateNode(node);
    if (!validation.isValid) {
      throw new ConstraintViolationError(`Node validation failed: ${validation.errors.join(", ")}`);
    }

    // 3. Persist
    const saved = await this.repository.saveNode(node);

    // 4. Dispatch Domain Event
    SIGEventDispatcher.getInstance().dispatch({
      id: `evt_node_reg_${saved.id}_${Date.now()}`,
      type: "NODE_REGISTERED",
      tenantId,
      timestamp: new Date().toISOString(),
      payload: { node: saved, userId }
    });

    return saved;
  }

  /**
   * Updates an existing node by merging property updates and producing a versioned revision copy.
   */
  public async updateNode(
    id: EntityID,
    tenantId: TenantID,
    updates: Partial<Record<string, any>>,
    userId: string,
    transactionId?: TransactionID
  ): Promise<SIGNode> {
    // 1. Retrieve current state
    const existing = await this.repository.findNodeById(id, tenantId);
    if (!existing) {
      throw new NodeNotFoundError(id, tenantId);
    }

    // 2. Generate updated revision from factory
    const updatedNode = this.factory.createRevision(existing, updates, userId, transactionId);

    // 3. Validate new state invariants
    const validation = this.validator.validateNode(updatedNode);
    if (!validation.isValid) {
      throw new ConstraintViolationError(`Revision validation failed: ${validation.errors.join(", ")}`);
    }

    // 4. Save
    const saved = await this.repository.saveNode(updatedNode);

    // 5. Dispatch Domain Event
    SIGEventDispatcher.getInstance().dispatch({
      id: `evt_node_upd_${saved.id}_${Date.now()}`,
      type: "NODE_UPDATED",
      tenantId,
      timestamp: new Date().toISOString(),
      payload: { newNode: saved, userId }
    });

    return saved;
  }

  /**
   * Retrieves a node securely verifying tenant scope bounds.
   */
  public async getNode(id: EntityID, tenantId: TenantID): Promise<SIGNode> {
    const node = await this.repository.findNodeById(id, tenantId);
    if (!node) {
      throw new NodeNotFoundError(id, tenantId);
    }
    return node;
  }

  /**
   * Logical deletion of a vertex and its adjacent edges.
   */
  public async removeNode(id: EntityID, tenantId: TenantID): Promise<boolean> {
    const exists = await this.repository.findNodeById(id, tenantId);
    if (!exists) {
      throw new NodeNotFoundError(id, tenantId);
    }
    const success = await this.repository.deleteNode(id, tenantId);
    if (success) {
      SIGEventDispatcher.getInstance().dispatch({
        id: `evt_node_rem_${id}_${Date.now()}`,
        type: "NODE_REMOVED",
        tenantId,
        timestamp: new Date().toISOString(),
        payload: { nodeId: id, userId: "system" }
      });
    }
    return success;
  }

  /**
   * Links two vertices via a directed property edge.
   */
  public async connectNodes(
    tenantId: TenantID,
    type: SIGRelationshipType,
    sourceId: EntityID,
    targetId: EntityID,
    userId: string,
    weight: number = 1.0,
    properties: Record<string, any> = {},
    transactionId?: TransactionID
  ): Promise<SIGBaseEdge> {
    return await this.relationshipManager.connect(
      tenantId,
      type,
      sourceId,
      targetId,
      userId,
      weight,
      properties,
      transactionId
    );
  }

  /**
   * Disconnects a directed edge.
   */
  public async disconnectNodes(edgeId: RelationshipID, tenantId: TenantID): Promise<boolean> {
    return await this.relationshipManager.disconnect(edgeId, tenantId);
  }

  /**
   * Traverses backward/forward relationships to construct an explanation context path.
   */
  public async getReasoningChain(pivotId: EntityID, tenantId: TenantID): Promise<SIGGraphQueryResult> {
    // Explanation chains follow structural relations up to a depth of 6
    const options: SIGTraversalOptions = {
      direction: "BOTH",
      maxDepth: 6,
      edgeTypes: [
        SIGRelationshipType.REFERENCES,
        SIGRelationshipType.SUPPORTS,
        SIGRelationshipType.HAS_EVIDENCE,
        SIGRelationshipType.GENERATED,
        SIGRelationshipType.BELONGS_TO,
        SIGRelationshipType.CONTRADICTS,
      ],
    };
    return await this.traverseGraph(pivotId, tenantId, options);
  }

  /**
   * Matches nodes matching specified payload query criteria.
   */
  public async queryGraph(filters: SIGQueryFilter[], tenantId: TenantID): Promise<SIGNode[]> {
    return await this.queryEngine.search(filters, tenantId, this.repository);
  }

  /**
   * Searches neighbor connections in specified traversal vectors (BFS or DFS).
   */
  public async traverseGraph(
    pivotId: EntityID,
    tenantId: TenantID,
    options: ExtendedTraversalOptions
  ): Promise<SIGGraphQueryResult> {
    return await this.traversalEngine.traverse(pivotId, tenantId, options, this.repository);
  }

  /**
   * Performs graph traversal utilizing an iterative Depth-First Search (DFS) algorithm.
   */
  public async traverseDFS(
    pivotId: EntityID,
    tenantId: TenantID,
    options: SIGTraversalOptions
  ): Promise<SIGGraphQueryResult> {
    return await this.traversalEngine.traverseDFS(pivotId, tenantId, options, this.repository);
  }

  /**
   * Identifies the shortest pathway between two nodes (Weighted or Unweighted).
   */
  public async findShortestPath(
    startId: EntityID,
    endId: EntityID,
    tenantId: TenantID,
    weighted: boolean
  ): Promise<ShortestPathResult> {
    return await this.traversalEngine.findShortestPath(startId, endId, tenantId, weighted, this.repository);
  }

  /**
   * Fetches sub-graph components exactly N hops away from a central pivot node.
   */
  public async traverseMultiHop(
    pivotId: EntityID,
    tenantId: TenantID,
    hops: number
  ): Promise<SIGGraphQueryResult> {
    return await this.traversalEngine.traverseMultiHop(pivotId, tenantId, hops, this.repository);
  }
}
