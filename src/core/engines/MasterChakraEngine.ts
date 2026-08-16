import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { Point2D, Polygon2D, Sector2D, SpatialMath } from '../spatial/math';
import { SpatialReferenceMatrix } from '../spatial/SpatialReferenceMatrix';

export interface MasterChakraConfig {
  numberOfSectors: number;
  startingAngleOffset: number; // Offset from 0 degrees (e.g., if North is 0, and we want to shift sectors)
}

/**
 * Purely mathematical spatial partitioning engine.
 * Generates geometric sectors (slices) from a centroid over a polygon.
 * STRICTLY forbidden from containing Vastu knowledge, Devta mapping, or names.
 */
export class MasterChakraEngine implements BaseEngine {
  public readonly name = 'MasterChakraEngine';
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  /**
   * Partitions a polygon into equal angular sectors from its centroid.
   * Uses the provided SpatialReferenceMatrix to align the mathematical 0-degree 
   * with the global coordinate system's rotational offset.
   */
  public generateGeometricSectors(
    boundary: Polygon2D,
    referenceMatrix: SpatialReferenceMatrix,
    config: MasterChakraConfig
  ): Sector2D[] {
    if (!this.initialized) {
      throw new Error(`${this.name} is not initialized.`);
    }

    if (!boundary || !boundary.vertices || boundary.vertices.length < 3) {
      throw new Error("Invalid boundary polygon. Must have at least 3 vertices.");
    }

    // 1. Calculate centroid of the boundary polygon in global space
    const centroidGlobal = SpatialMath.calculateCentroid(boundary);

    // 2. Determine the starting angle for sector generation.
    // We start from referenceMatrix's rotation offset (which defines the principal axis, e.g., North)
    // and apply the specific configuration offset.
    const baseAngle = referenceMatrix.getRotationOffset();
    const effectiveStartAngle = (baseAngle + config.startingAngleOffset) % 360;

    // 3. Generate pure geometric sectors
    // Radius should be large enough to cover the bounding box of the polygon.
    // For safety, we use a very large arbitrary radius, or we could calculate max distance from centroid.
    let maxRadius = 0;
    for (const v of boundary.vertices) {
      const dist = SpatialMath.distance(centroidGlobal, v);
      if (dist > maxRadius) {
        maxRadius = dist;
      }
    }
    // Add 10% padding to radius to ensure full coverage
    maxRadius *= 1.1;

    const sectors = SpatialMath.generateEqualSectors(
      centroidGlobal,
      config.numberOfSectors,
      effectiveStartAngle,
      maxRadius
    );

    // Note: We are returning the mathematical slices (Sector2D). 
    // In a more advanced implementation, we could calculate the exact intersection
    // polygon of each sector with the boundary polygon. For v1.0 architecture,
    // returning the sector definition (center, angles, radius) is sufficient for 
    // down-stream systems (like Devta Engine) to do point-in-sector testing.

    return sectors;
  }
}
