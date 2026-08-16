import { ISKORepository } from "./types";
import { SpatialKnowledgeObjectEntity, EntityID } from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * High-performance, Thread-safe In-Memory Repository for Spatial Knowledge Objects.
 * Simulates asynchronous physical database IO with deep-cloning to ensure immutability.
 */
export class SKORepository implements ISKORepository {
  // Master map indexed by EntityID -> SpatialKnowledgeObjectEntity
  private storage: Map<EntityID, SpatialKnowledgeObjectEntity> = new Map();

  // Floor mapping: floorId -> Set of EntityID
  private floorIndex: Map<string, Set<EntityID>> = new Map();

  /**
   * Clones an entity to prevent reference leaks and guarantee absolute immutability outside repository boundaries.
   */
  private cloneEntity(entity: SpatialKnowledgeObjectEntity): SpatialKnowledgeObjectEntity {
    return JSON.parse(JSON.stringify(entity)) as SpatialKnowledgeObjectEntity;
  }

  /**
   * Persists or updates an SKO entity within tenant context.
   */
  public async save(sko: SpatialKnowledgeObjectEntity): Promise<SpatialKnowledgeObjectEntity> {
    const cloned = this.cloneEntity(sko);
    this.storage.set(sko.id, cloned);

    // Update index mapping if floorId is provided in properties metadata
    const floorId = (sko.properties as any).floorId;
    if (floorId && typeof floorId === "string") {
      if (!this.floorIndex.has(floorId)) {
        this.floorIndex.set(floorId, new Set());
      }
      this.floorIndex.get(floorId)!.add(sko.id);
    }

    return this.cloneEntity(cloned);
  }

  /**
   * Retrieves a specific SKO entity by ID, strictly verifying tenant boundaries.
   */
  public async findById(id: EntityID, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity | null> {
    const found = this.storage.get(id);
    if (!found) {
      return null;
    }

    // Secure multi-tenant boundary check
    if (found.tenantId !== tenantId) {
      throw new Error(`SECURITY_ACCESS_VIOLATION: Attempted illegal read across tenant boundary of ${tenantId}.`);
    }

    return this.cloneEntity(found);
  }

  /**
   * Retrieves all SKOs belonging to a specific tenant ID.
   */
  public async findByTenant(tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]> {
    const results: SpatialKnowledgeObjectEntity[] = [];
    for (const sko of this.storage.values()) {
      if (sko.tenantId === tenantId && sko.lifecycleState !== "DELETED") {
        results.push(this.cloneEntity(sko));
      }
    }
    return results;
  }

  /**
   * Retrieves all SKOs associated with a specific floor drawing context.
   */
  public async findByFloor(floorId: string, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]> {
    const ids = this.floorIndex.get(floorId);
    if (!ids) {
      return [];
    }

    const results: SpatialKnowledgeObjectEntity[] = [];
    for (const id of ids) {
      const found = this.storage.get(id);
      if (found && found.tenantId === tenantId && found.lifecycleState !== "DELETED") {
        results.push(this.cloneEntity(found));
      }
    }
    return results;
  }

  /**
   * Flags an entity as deleted or purges it from tracking, strictly verifying tenant boundaries.
   */
  public async delete(id: EntityID, tenantId: TenantID): Promise<boolean> {
    const found = this.storage.get(id);
    if (!found) {
      return false;
    }

    // Secure multi-tenant boundary check
    if (found.tenantId !== tenantId) {
      throw new Error(`SECURITY_ACCESS_VIOLATION: Attempted illegal delete across tenant boundary of ${tenantId}.`);
    }

    // Perform logical delete by default to maintain audit trail integrity
    found.lifecycleState = "DELETED";
    found.audit.modifiedTimestamp = new Date().toISOString();
    this.storage.set(id, found);

    // Clean index references
    for (const [floorId, ids] of this.floorIndex.entries()) {
      if (ids.has(id)) {
        ids.delete(id);
      }
    }

    return true;
  }
}
