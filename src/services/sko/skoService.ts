import { 
  ISKOService, 
  ISKORepository, 
  ISKOFactory, 
  ISKOValidator, 
  CreateSKOParams 
} from "./types";
import { SpatialKnowledgeObjectEntity, EntityID, TransactionID } from "../../types/sig";
import { TenantID } from "../../types/rules";
import { defaultZoneEngine } from "../../core/spatial/zoneEngine";
import { CanonicalSpatialCalculationEngine } from "../../core/spatial/CanonicalSpatialCalculationEngine";

/**
 * Concrete Core Service managing Spatial Knowledge Object lifecycle, geometric computations,
 * and energetic/classical physics alignments.
 */
export class SKOService implements ISKOService {
  private repository: ISKORepository;
  private factory: ISKOFactory;
  private validator: ISKOValidator;

  constructor(
    repository: ISKORepository,
    factory: ISKOFactory,
    validator: ISKOValidator
  ) {
    this.repository = repository;
    this.factory = factory;
    this.validator = validator;
  }

  /**
   * Instantiates, processes geometric matrices, validates invariants, and saves an SKO.
   */
  public async registerSKO(params: CreateSKOParams, floorId?: string): Promise<SpatialKnowledgeObjectEntity> {
    // 1. Create pristine instance from Factory
    const sko = this.factory.createSKO(params);

    // 2. Associate floor ID if present
    if (floorId) {
      (sko.properties as any).floorId = floorId;
    }

    // 3. Process coordinate metrics
    this.enrichGeometricProperties(sko);

    // 4. Validate domain constraints
    const validation = this.validator.validate(sko);
    if (!validation.isValid) {
      throw new Error(`SKO_VALIDATION_FAILED: Invariant violation. Errors: ${validation.errors.join(", ")}`);
    }

    // 5. Persist through repository
    return await this.repository.save(sko);
  }

  /**
   * Merges updates, recalculates geometric metrics, increments logical version, and saves the revision.
   */
  public async updateSKOProperties(
    id: EntityID,
    tenantId: TenantID,
    updates: Partial<SpatialKnowledgeObjectEntity["properties"]>,
    userId: string,
    transactionId?: TransactionID
  ): Promise<SpatialKnowledgeObjectEntity> {
    // 1. Fetch current version
    const existing = await this.repository.findById(id, tenantId);
    if (!existing) {
      throw new Error(`SKO_NOT_FOUND: Entity with ID ${id} does not exist in tenant ${tenantId}.`);
    }

    // 2. Create the revision model using the Factory
    const updatedSko = this.factory.createRevision(existing, updates, userId, transactionId);

    // 3. Recalculate geometrical/energetic states based on potentially updated coordinates or rotation angles
    this.enrichGeometricProperties(updatedSko);

    // 4. Re-validate invariants on the new revision
    const validation = this.validator.validate(updatedSko);
    if (!validation.isValid) {
      throw new Error(`SKO_REVISION_VALIDATION_FAILED: Updated states violate invariants. Errors: ${validation.errors.join(", ")}`);
    }

    // 5. Save the updated version
    return await this.repository.save(updatedSko);
  }

  /**
   * Fetches an SKO by ID.
   */
  public async getSKO(id: EntityID, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity> {
    const sko = await this.repository.findById(id, tenantId);
    if (!sko || sko.lifecycleState === "DELETED") {
      throw new Error(`SKO_NOT_FOUND: Entity with ID ${id} does not exist in tenant ${tenantId}.`);
    }
    return sko;
  }

  /**
   * Lists all active SKOs for a tenant.
   */
  public async listSKOs(tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]> {
    return await this.repository.findByTenant(tenantId);
  }

  /**
   * Lists all active SKOs associated with a floor of a tenant.
   */
  public async listSKOsByFloor(floorId: string, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]> {
    return await this.repository.findByFloor(floorId, tenantId);
  }

  /**
   * Deletes an SKO, preserving logical audits.
   */
  public async removeSKO(id: EntityID, tenantId: TenantID): Promise<boolean> {
    return await this.repository.delete(id, tenantId);
  }

  // ============================================================================
  // MATHEMATICAL GEOMETRY & ENERGETIC CALCULATIONS
  // ============================================================================

  /**
   * Calculates the Center of Mass (Centroid) of a 2D coordinate polygon or points cluster.
   */
  public calculateCentroid(coordinates: Array<{ x: number; y: number; z?: number }>): { x: number; y: number; z?: number } {
    const res = CanonicalSpatialCalculationEngine.calculateCentroid(coordinates);
    const avgZ = coordinates && coordinates.length > 0
      ? coordinates.reduce((sum, c) => sum + (c.z ?? 0), 0) / coordinates.length
      : 0;
    return { x: res.x, y: res.y, z: avgZ };
  }

  /**
   * Calculates the absolute Area in square meters using the Surveyor's Shoelace formula.
   */
  public calculateArea(
    coordinates: Array<{ x: number; y: number; z?: number }>,
    geometricalType: "POLYGON" | "POINT" | "POLYLINE" | "CIRCLE"
  ): number {
    if (geometricalType !== "POLYGON" || !coordinates || coordinates.length < 3) {
      return 0;
    }

    const n = coordinates.length;
    let areaAccumulator = 0;

    for (let i = 0; i < n; i++) {
      const curr = coordinates[i];
      const next = coordinates[(i + 1) % n];
      areaAccumulator += curr.x * next.y - next.x * curr.y;
    }

    return Math.abs(areaAccumulator) / 2;
  }

  /**
   * Maps 2D coordinates and compass alignment angles onto the 8 traditional Vastu cardinal sectors.
   */
  public determineCardinalSector(
    centroid: { x: number; y: number; z?: number },
    origin: { x: number; y: number; z?: number } = { x: 0, y: 0, z: 0 },
    compassOffsetDegrees: number = 0
  ): "NORTH" | "NORTHEAST" | "EAST" | "SOUTHEAST" | "SOUTH" | "SOUTHWEST" | "WEST" | "NORTHWEST" | "CENTER" | "UNKNOWN" {
    defaultZoneEngine.setNorth(compassOffsetDegrees);
    defaultZoneEngine.setOrigin({ x: origin.x || 0, y: origin.y || 0 });
    const zone = defaultZoneEngine.getZone({ x: centroid.x, y: centroid.y }, 1.5);
    
    const mapping: Record<string, any> = {
      "Center": "CENTER",
      "N": "NORTH",
      "NE": "NORTHEAST",
      "E": "EAST",
      "SE": "SOUTHEAST",
      "S": "SOUTH",
      "SW": "SOUTHWEST",
      "W": "WEST",
      "NW": "NORTHWEST"
    };

    return mapping[zone.id] || "UNKNOWN";
  }

  /**
   * Maps traditional spatial cardinal sectors to active primordial elements (Pancha Bhootas).
   */
  public determinePrimaryElement(
    sector: "NORTH" | "NORTHEAST" | "EAST" | "SOUTHEAST" | "SOUTH" | "SOUTHWEST" | "WEST" | "NORTHWEST" | "CENTER" | "UNKNOWN"
  ): "Water" | "Fire" | "Earth" | "Air" | "Space" | "None" {
    switch (sector) {
      case "NORTH":
      case "NORTHEAST":
        return "Water";
      case "EAST":
      case "NORTHWEST":
        return "Air";
      case "SOUTHEAST":
      case "SOUTH":
        return "Fire";
      case "SOUTHWEST":
        return "Earth";
      case "WEST":
      case "CENTER":
        return "Space";
      default:
        return "None";
    }
  }

  // ============================================================================
  // INTERNAL UTILITIES
  // ============================================================================

  /**
   * Enriches the SKO properties object with evaluated mathematical spatial parameters.
   */
  private enrichGeometricProperties(sko: SpatialKnowledgeObjectEntity): void {
    const props = sko.properties;
    
    // 1. Calculate physical center of mass
    const centroid = this.calculateCentroid(props.coordinates);
    props.centerOfMass = centroid;

    // 2. Compute absolute metric area size
    const area = this.calculateArea(props.coordinates, props.geometricalType);
    props.calculatedGridAreaSqMeters = area;

    // 3. Resolve cardinal sector assignment based on structural compass angles
    const sector = this.determineCardinalSector(
      centroid,
      { x: 0, y: 0, z: 0 }, // Assuming standard calibration origin (0,0,0)
      props.rotationAngleDegrees || 0
    );
    props.cardinalSector = sector;

    // 4. Resolve elemental assignments
    const element = this.determinePrimaryElement(sector);
    props.primaryElement = element;
  }
}
