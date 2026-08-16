export class ConstraintEngine {
  /**
   * Clamps an X/Y coordinate within a specified bounding box.
   */
  public static clampToBounds(
    x: number, 
    y: number, 
    minX: number, 
    minY: number, 
    maxX: number, 
    maxY: number
  ) {
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }

  /**
   * Applies grid snapping to a coordinate.
   */
  public static snapToGrid(
    value: number, 
    gridSize: number
  ) {
    if (gridSize <= 0) return value;
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Snaps a rotation angle to common 15 or 45 degree increments if close.
   */
  public static snapRotation(
    angle: number,
    threshold: number = 2,
    snapIncrement: number = 45
  ) {
    const remainder = angle % snapIncrement;
    if (remainder < threshold) {
      return angle - remainder;
    } else if (snapIncrement - remainder < threshold) {
      return angle + (snapIncrement - remainder);
    }
    return angle;
  }
}
