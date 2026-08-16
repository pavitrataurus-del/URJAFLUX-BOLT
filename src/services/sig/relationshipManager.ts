import { ISIGRepository, ISIGFactory, ISIGValidator } from "./types";
import { SIGBaseEdge, SIGRelationshipType, EntityID, RelationshipID, TransactionID } from "../../types/sig";
import { TenantID } from "../../types/rules";
import { NodeNotFoundError, InvalidRelationshipError, ConstraintViolationError } from "./errors";
import { SIGEventDispatcher } from "./events";

/**
 * Cohesive manager class dedicated strictly to managing directed semantic relationships (edges)
 * between spatial intelligence vertices (nodes).
 */
export class RelationshipManager {
  constructor(
    private readonly repository: ISIGRepository,
    private readonly factory: ISIGFactory,
    private readonly validator: ISIGValidator
  ) {}

  /**
   * Connects two graph nodes with a semantic edge.
   */
  public async connect(
    tenantId: TenantID,
    type: SIGRelationshipType,
    sourceId: EntityID,
    targetId: EntityID,
    userId: string,
    weight: number = 1.0,
    properties: Record<string, any> = {},
    transactionId?: TransactionID
  ): Promise<SIGBaseEdge> {
    // 1. Fetch source and target node to confirm existence and active states
    const sourceNode = await this.repository.findNodeById(sourceId, tenantId);
    if (!sourceNode) {
      throw new NodeNotFoundError(sourceId, tenantId);
    }

    const targetNode = await this.repository.findNodeById(targetId, tenantId);
    if (!targetNode) {
      throw new NodeNotFoundError(targetId, tenantId);
    }

    // 2. Validate semantic relationship logic
    if (!this.validator.isValidRelationship(type, sourceNode.type, targetNode.type)) {
      throw new InvalidRelationshipError(`Relationship '${type}' is not logically permitted from '${sourceNode.type}' to '${targetNode.type}'.`);
    }

    // 3. Build the Edge model via Factory
    const edge = this.factory.createEdge(
      tenantId,
      type,
      sourceId,
      targetId,
      userId,
      weight,
      properties,
      transactionId
    );

    // 4. Perform schema validation of the created edge
    const validation = this.validator.validateEdge(edge, sourceNode, targetNode);
    if (!validation.isValid) {
      throw new ConstraintViolationError(`Edge validation failed: ${validation.errors.join(", ")}`);
    }

    // 5. Save to Repository
    const savedEdge = await this.repository.saveEdge(edge);

    // 6. Dispatch Domain Event
    SIGEventDispatcher.getInstance().dispatch({
      id: `evt_edge_conn_${savedEdge.id}_${Date.now()}`,
      type: "NODES_CONNECTED",
      tenantId,
      timestamp: new Date().toISOString(),
      payload: { edge: savedEdge, userId }
    });

    return savedEdge;
  }

  /**
   * Purges a directed connection by ID.
   */
  public async disconnect(edgeId: RelationshipID, tenantId: TenantID): Promise<boolean> {
    const edge = await this.repository.findEdgeById(edgeId, tenantId);
    if (!edge) {
      return false;
    }
    const success = await this.repository.deleteEdge(edgeId, tenantId);
    if (success) {
      SIGEventDispatcher.getInstance().dispatch({
        id: `evt_edge_disc_${edgeId}_${Date.now()}`,
        type: "NODES_DISCONNECTED",
        tenantId,
        timestamp: new Date().toISOString(),
        payload: { edgeId, userId: "system" }
      });
    }
    return success;
  }
}
