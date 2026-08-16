import { 
  SpatialKnowledgeObjectEntity, 
  EntityID, 
  TransactionID 
} from "../../types/sig";
import { TenantID } from "../../types/rules";

/**
 * Parameters needed to instantiate a brand-new Spatial Knowledge Object (SKO).
 */
export interface CreateSKOParams {
  tenantId: TenantID;
  label: string;
  functionalZoneType: string;
  geometricalType: "POLYGON" | "POINT" | "POLYLINE" | "CIRCLE";
  coordinates: Array<{ x: number; y: number; z?: number }>;
  rotationAngleDegrees?: number;
  createdByUser: string;
  transactionId?: TransactionID;
}

/**
 * Result structure for SKO validation checks.
 */
export interface SKOValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Repository Interface following standard DDD / Repository Pattern.
 * Manages the persistence boundary for SKOs.
 */
export interface ISKORepository {
  save(sko: SpatialKnowledgeObjectEntity): Promise<SpatialKnowledgeObjectEntity>;
  findById(id: EntityID, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity | null>;
  findByTenant(tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]>;
  findByFloor(floorId: string, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]>;
  delete(id: EntityID, tenantId: TenantID): Promise<boolean>;
}

/**
 * Factory Interface following the Factory Pattern.
 * Isolates creation and versioning complexity of SKO structures.
 */
export interface ISKOFactory {
  createSKO(params: CreateSKOParams): SpatialKnowledgeObjectEntity;
  createRevision(
    existing: SpatialKnowledgeObjectEntity,
    updates: Partial<SpatialKnowledgeObjectEntity["properties"]>,
    modifiedByUser: string,
    transactionId?: TransactionID
  ): SpatialKnowledgeObjectEntity;
}

/**
 * Validator Interface following the Specification / Strategy Pattern.
 * Enforces structural, geometrical, and security invariants.
 */
export interface ISKOValidator {
  validate(sko: SpatialKnowledgeObjectEntity): SKOValidationResult;
  validateCoordinates(
    coordinates: Array<{ x: number; y: number; z?: number }>,
    geometricalType: "POLYGON" | "POINT" | "POLYLINE" | "CIRCLE"
  ): SKOValidationResult;
}

/**
 * Service Layer coordinating structural geometries, energetic calculations, and repository persistence.
 * This is where core spatial metrics (shoelace area, polygon centroids, compass alignments) are calculated.
 */
export interface ISKOService {
  registerSKO(params: CreateSKOParams, floorId?: string): Promise<SpatialKnowledgeObjectEntity>;
  updateSKOProperties(
    id: EntityID,
    tenantId: TenantID,
    updates: Partial<SpatialKnowledgeObjectEntity["properties"]>,
    userId: string,
    transactionId?: TransactionID
  ): Promise<SpatialKnowledgeObjectEntity>;
  getSKO(id: EntityID, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity>;
  listSKOs(tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]>;
  listSKOsByFloor(floorId: string, tenantId: TenantID): Promise<SpatialKnowledgeObjectEntity[]>;
  removeSKO(id: EntityID, tenantId: TenantID): Promise<boolean>;

  // Mathematical Geometry & Energetic Helpers
  calculateCentroid(coordinates: Array<{ x: number; y: number; z?: number }>): { x: number; y: number; z?: number };
  calculateArea(
    coordinates: Array<{ x: number; y: number; z?: number }>,
    geometricalType: "POLYGON" | "POINT" | "POLYLINE" | "CIRCLE"
  ): number;
  determineCardinalSector(
    centroid: { x: number; y: number; z?: number },
    origin?: { x: number; y: number; z?: number },
    compassOffsetDegrees?: number
  ): "NORTH" | "NORTHEAST" | "EAST" | "SOUTHEAST" | "SOUTH" | "SOUTHWEST" | "WEST" | "NORTHWEST" | "CENTER" | "UNKNOWN";
  determinePrimaryElement(
    sector: "NORTH" | "NORTHEAST" | "EAST" | "SOUTHEAST" | "SOUTH" | "SOUTHWEST" | "WEST" | "NORTHWEST" | "CENTER" | "UNKNOWN"
  ): "Water" | "Fire" | "Earth" | "Air" | "Space" | "None";
}
