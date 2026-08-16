import { BaseEngine } from '../types/BaseEngine';
import { BoundingBox } from '../usom/types';
import { Logger } from '../utils/logger';

export interface GridLine {
  id: string;
  isMajor: boolean;
  position: number; // x for vertical, y for horizontal
  isHorizontal: boolean;
}

export class GridEngine implements BaseEngine {
  public readonly name = 'GridEngine';
  private initialized = false;

  // Grid configuration
  private baseSpacing = 10;
  private majorFrequency = 10; // Every 10th line is a major line

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
   * Calculates the adaptive grid spacing based on current zoom level.
   * As you zoom out, the visual grid lines space further apart by a factor of 10.
   */
  public getAdaptiveSpacing(zoom: number): number {
    let spacing = this.baseSpacing;
    const visualSpacing = spacing * zoom;
    
    if (visualSpacing < 10) {
      // Zoomed out far enough that lines are too close. Scale up the spacing.
      const factor = Math.pow(10, Math.ceil(Math.log10(10 / visualSpacing)));
      spacing *= factor;
    } else if (visualSpacing >= 100) {
      // Zoomed in far enough that lines are too far apart. Scale down the spacing.
      const factor = Math.pow(10, Math.floor(Math.log10(visualSpacing / 10)));
      spacing /= Math.max(1, factor);
    }
    
    return spacing;
  }

  /**
   * Generates grid lines that cover the given visible bounds.
   */
  public generateGrid(bounds: BoundingBox, zoom: number): GridLine[] {
    const spacing = this.getAdaptiveSpacing(zoom);
    const majorSpacing = spacing * this.majorFrequency;

    const lines: GridLine[] = [];
    
    // Determine start and end points in world coordinates
    const startX = Math.floor(bounds.x / spacing) * spacing;
    const endX = bounds.x + bounds.width;
    
    const startY = Math.floor(bounds.y / spacing) * spacing;
    const endY = bounds.y + bounds.height;
    
    // Generate vertical lines
    for (let x = startX; x <= endX; x += spacing) {
      // Small epsilon to handle float precision issues when modulo
      const isMajor = Math.abs((x % majorSpacing) / majorSpacing) < 0.001 || 
                      Math.abs((x % majorSpacing) / majorSpacing) > 0.999;
      lines.push({
        id: `v_${x}`,
        isMajor,
        position: x,
        isHorizontal: false
      });
    }

    // Generate horizontal lines
    for (let y = startY; y <= endY; y += spacing) {
      const isMajor = Math.abs((y % majorSpacing) / majorSpacing) < 0.001 || 
                      Math.abs((y % majorSpacing) / majorSpacing) > 0.999;
      lines.push({
        id: `h_${y}`,
        isMajor,
        position: y,
        isHorizontal: true
      });
    }

    return lines;
  }
}
