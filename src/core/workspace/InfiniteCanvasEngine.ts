import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { ObjectEngine } from '../engines/ObjectEngine';
import { BoundingBox } from '../usom/types';

export class InfiniteCanvasEngine implements BaseEngine {
  public readonly name = 'InfiniteCanvasEngine';
  private initialized = false;

  constructor(private objectEngine: ObjectEngine) {}

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
   * Computes the bounding box of all currently visible objects.
   * Useful for "Zoom to Fit" functionality.
   */
  public getContentBounds(): BoundingBox | null {
    const objects = this.objectEngine.getAllObjects().filter(obj => obj.isVisible);
    if (objects.length === 0) {
      return null;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const obj of objects) {
      // Assuming point position for simplified bounds (a complete implementation would query actual geometry bounds)
      const x = obj.transform.position.x;
      const y = obj.transform.position.y;
      
      // We assume a default bounding radius if actual bounds aren't easily calculated
      // Since objects in this scope might not have full geometric querying yet
      const boundsRadius = 50 * obj.transform.scale.x; 

      if (x - boundsRadius < minX) minX = x - boundsRadius;
      if (x + boundsRadius > maxX) maxX = x + boundsRadius;
      if (y - boundsRadius < minY) minY = y - boundsRadius;
      if (y + boundsRadius > maxY) maxY = y + boundsRadius;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}
