import { ISIGFactory } from "./types";
import { 
  SIGNode, 
  SIGBaseEdge, 
  SIGEntityType, 
  SIGRelationshipType, 
  EntityID, 
  RelationshipID, 
  TransactionID, 
  SIGAuditTrail 
} from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Concrete Factory for building and versioning Spatial Intelligence Graph (SIG) assets.
 */
export class GraphFactory implements ISIGFactory {
  private schemaVersion = "1.0.0";

  /**
   * Generates a unique, structured identifier.
   */
  private generateUniqueId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const randomHex = Math.random().toString(36).substring(2, 10);
    return `${prefix}_${timestamp}_${randomHex}`;
  }

  /**
   * Instantiates a pristine SIG Node.
   */
  public createNode(
    tenantId: TenantID,
    type: SIGEntityType,
    properties: Record<string, any>,
    userId: string,
    transactionId?: TransactionID
  ): SIGNode {
    const id = this.generateUniqueId("node");
    const isoString = new Date().toISOString();

    const audit: SIGAuditTrail = {
      createdTimestamp: isoString,
      modifiedTimestamp: isoString,
      createdByUser: userId,
      modifiedByUser: userId,
      transactionId: transactionId || `tx_init_${id}`,
      schemaVersion: this.schemaVersion,
    };

    return {
      id,
      type,
      tenantId,
      version: 1,
      lifecycleState: "ACTIVE",
      properties: JSON.parse(JSON.stringify(properties)), // Ensure deep isolation
      audit,
    } as SIGNode;
  }

  /**
   * Creates an immutable new revision (version copy) of an existing SIG Node.
   */
  public createRevision(
    existing: SIGNode,
    updates: Partial<Record<string, any>>,
    userId: string,
    transactionId?: TransactionID
  ): SIGNode {
    const isoString = new Date().toISOString();

    const audit: SIGAuditTrail = {
      createdTimestamp: existing.audit.createdTimestamp,
      modifiedTimestamp: isoString,
      createdByUser: existing.audit.createdByUser,
      modifiedByUser: userId,
      transactionId: transactionId || `tx_rev_${existing.id}_${existing.version + 1}`,
      schemaVersion: this.schemaVersion,
    };

    const mergedProperties = {
      ...JSON.parse(JSON.stringify(existing.properties)),
      ...JSON.parse(JSON.stringify(updates)),
    };

    return {
      ...existing,
      version: existing.version + 1,
      properties: mergedProperties,
      audit,
    } as SIGNode;
  }

  /**
   * Instantiates a pristine directed SIG Edge.
   */
  public createEdge(
    tenantId: TenantID,
    type: SIGRelationshipType,
    sourceId: EntityID,
    targetId: EntityID,
    userId: string,
    weight: number = 1.0,
    properties: Record<string, any> = {},
    transactionId?: TransactionID
  ): SIGBaseEdge {
    const id = this.generateUniqueId("edge");
    const isoString = new Date().toISOString();

    const audit: SIGAuditTrail = {
      createdTimestamp: isoString,
      modifiedTimestamp: isoString,
      createdByUser: userId,
      modifiedByUser: userId,
      transactionId: transactionId || `tx_edge_init_${id}`,
      schemaVersion: this.schemaVersion,
    };

    return {
      id,
      type,
      tenantId,
      sourceId,
      targetId,
      weight,
      properties: JSON.parse(JSON.stringify(properties)),
      audit,
    };
  }
}
