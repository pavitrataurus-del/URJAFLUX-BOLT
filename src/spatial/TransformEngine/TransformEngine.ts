import { engineAdapter } from '../../core/adapters/EngineAdapter';

export class TransformEngine {
  /**
   * Calculates the new rotation angle based on a drag interaction around a center point.
   */
  public static calculateRotation(
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    centerX: number,
    centerY: number,
    initialRotation: number
  ): number {
    try {
      const dirEngine = engineAdapter.getDirectionEngine();
      if (dirEngine) {
        const startBearing = dirEngine.screenToBearing({ x: startX, y: startY }, { x: centerX, y: centerY });
        const currentBearing = dirEngine.screenToBearing({ x: currentX, y: currentY }, { x: centerX, y: centerY });
        const deltaAngle = currentBearing - startBearing;
        return (initialRotation + deltaAngle + 360) % 360;
      }
    } catch {
      // fallback if engine not initialized
    }

    const startAngle = Math.atan2(startY - centerY, startX - centerX);
    const currentAngle = Math.atan2(currentY - centerY, currentX - centerX);
    const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
    
    // Normalize to 0-360
    return (initialRotation + deltaAngle + 360) % 360;
  }

  /**
   * Calculates a new scale based on a pinch or drag distance.
   */
  public static calculateScale(
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    centerX: number,
    centerY: number,
    initialScale: number
  ): number {
    const startDist = Math.hypot(startX - centerX, startY - centerY);
    const currentDist = Math.hypot(currentX - centerX, currentY - centerY);
    if (startDist === 0) return initialScale;
    
    return initialScale * (currentDist / startDist);
  }

  /**
   * Translates a point by an offset.
   */
  public static translate(x: number, y: number, dx: number, dy: number) {
    return { x: x + dx, y: y + dy };
  }
}
