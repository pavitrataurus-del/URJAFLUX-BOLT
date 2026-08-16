import { Point2D, SpatialMath } from './math';

/**
 * Handles transformations between local and global spaces.
 * This is crucial for managing rotational offsets (e.g., true North vs grid North)
 * and spatial origin translations.
 */
export class SpatialReferenceMatrix {
  private origin: Point2D;
  private rotationOffset: number; // In degrees

  constructor(origin: Point2D = { x: 0, y: 0 }, rotationOffset: number = 0) {
    this.origin = origin;
    this.rotationOffset = rotationOffset;
  }

  public getOrigin(): Point2D {
    return { ...this.origin };
  }

  public getRotationOffset(): number {
    return this.rotationOffset;
  }

  public setOrigin(origin: Point2D): void {
    this.origin = { ...origin };
  }

  public setRotationOffset(offsetDegrees: number): void {
    this.rotationOffset = ((offsetDegrees % 360) + 360) % 360;
  }

  /**
   * Translates a point from local space (relative to origin) to global space.
   */
  public localToGlobalPoint(localPoint: Point2D): Point2D {
    // 1. Rotate
    const rad = this.rotationOffset * SpatialMath.DEG2RAD;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const rx = localPoint.x * cos - localPoint.y * sin;
    const ry = localPoint.x * sin + localPoint.y * cos;

    // 2. Translate
    return {
      x: rx + this.origin.x,
      y: ry + this.origin.y
    };
  }

  /**
   * Translates a point from global space to local space (relative to origin).
   */
  public globalToLocalPoint(globalPoint: Point2D): Point2D {
    // 1. Translate
    const tx = globalPoint.x - this.origin.x;
    const ty = globalPoint.y - this.origin.y;

    // 2. Rotate (inverse)
    const rad = -this.rotationOffset * SpatialMath.DEG2RAD;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return {
      x: tx * cos - ty * sin,
      y: tx * sin + ty * cos
    };
  }

  /**
   * Converts a global angle to a local angle.
   */
  public globalToLocalAngle(globalAngle: number): number {
    return ((globalAngle - this.rotationOffset) % 360 + 360) % 360;
  }

  /**
   * Converts a local angle to a global angle.
   */
  public localToGlobalAngle(localAngle: number): number {
    return ((localAngle + this.rotationOffset) % 360 + 360) % 360;
  }
}
