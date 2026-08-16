import { ISKOFactory, CreateSKOParams } from "./types";
import { SpatialKnowledgeObjectEntity, SIGEntityType, SIGAuditTrail, TransactionID } from "../../types/sig";

/**
 * Concrete Factory for Spatial Knowledge Objects.
 * Handles primary instantiation, immutable cloning, and standard audit stamping.
 */
export class SKOFactory implements ISKOFactory {
  private schemaVersion = "1.0.0";

  /**
   * Generates a unique, structured identifier.
   */
  private generateUniqueId(): string {
    const timestamp = Date.now().toString(36);
    const randomHex = Math.random().toString(36).substring(2, 10);
    return `sko_${timestamp}_${randomHex}`;
  }

  /**
   * Instantiates a pristine Spatial Knowledge Object Entity.
   */
  public createSKO(params: CreateSKOParams): SpatialKnowledgeObjectEntity {
    const id = this.generateUniqueId();
    const isoString = new Date().toISOString();

    const audit: SIGAuditTrail = {
      createdTimestamp: isoString,
      modifiedTimestamp: isoString,
      createdByUser: params.createdByUser,
      modifiedByUser: params.createdByUser,
      transactionId: params.transactionId || `tx_init_${id}`,
      schemaVersion: this.schemaVersion,
    };

    return {
      id,
      type: SIGEntityType.SPATIAL_KNOWLEDGE_OBJECT,
      tenantId: params.tenantId,
      version: 1,
      lifecycleState: "ACTIVE",
      properties: {
        label: params.label,
        functionalZoneType: params.functionalZoneType,
        geometricalType: params.geometricalType,
        coordinates: JSON.parse(JSON.stringify(params.coordinates)), // Deep clone coordinates
        centerOfMass: { x: 0, y: 0, z: 0 },
        rotationAngleDegrees: params.rotationAngleDegrees ?? 0,
        cardinalSector: "UNKNOWN",
        primaryElement: "None",
        calculatedGridAreaSqMeters: 0,
      },
      audit,
    };
  }

  /**
   * Creates an immutable new revision (version copy) of an existing SKO.
   * Promotes the Palantir Ontology versioning strategy.
   */
  public createRevision(
    existing: SpatialKnowledgeObjectEntity,
    updates: Partial<SpatialKnowledgeObjectEntity["properties"]>,
    modifiedByUser: string,
    transactionId?: TransactionID
  ): SpatialKnowledgeObjectEntity {
    const isoString = new Date().toISOString();

    // Preserve the original audit timestamps while updating modification indicators
    const audit: SIGAuditTrail = {
      createdTimestamp: existing.audit.createdTimestamp,
      modifiedTimestamp: isoString,
      createdByUser: existing.audit.createdByUser,
      modifiedByUser: modifiedByUser,
      transactionId: transactionId || `tx_rev_${existing.id}_${existing.version + 1}`,
      schemaVersion: this.schemaVersion,
    };

    // Deep merge and clone properties to keep instances immutable
    const mergedProperties = {
      ...JSON.parse(JSON.stringify(existing.properties)),
      ...JSON.parse(JSON.stringify(updates)),
    };

    return {
      ...existing,
      version: existing.version + 1,
      properties: mergedProperties,
      audit,
    };
  }
}
