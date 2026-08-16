import { Point2D } from '../spatial/math';
import { CameraEngine } from './CameraEngine';
import { GridEngine } from './GridEngine';

export class CoordinateController {
  
  constructor(
    private camera: CameraEngine,
    private grid: GridEngine
  ) {}

  /**
   * Converts a screen point to world coordinates.
   */
  public screenToWorld(screenPoint: Point2D): Point2D {
    const pos = this.camera.getPosition();
    const zoom = this.camera.getZoom();
    return {
      x: pos.x + screenPoint.x / zoom,
      y: pos.y + screenPoint.y / zoom
    };
  }

  /**
   * Converts a world point to screen coordinates.
   */
  public worldToScreen(worldPoint: Point2D): Point2D {
    const pos = this.camera.getPosition();
    const zoom = this.camera.getZoom();
    return {
      x: (worldPoint.x - pos.x) * zoom,
      y: (worldPoint.y - pos.y) * zoom
    };
  }

  /**
   * Snaps a world coordinate to the nearest grid intersection based on adaptive grid spacing.
   */
  public snapToGrid(worldPoint: Point2D): Point2D {
    const spacing = this.grid.getAdaptiveSpacing(this.camera.getZoom());
    return {
      x: Math.round(worldPoint.x / spacing) * spacing,
      y: Math.round(worldPoint.y / spacing) * spacing
    };
  }
}
