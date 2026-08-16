import { Point2D } from '../spatial/math';
import { CameraEngine } from './CameraEngine';
import { EventEngine } from '../events/EventEngine';
import { InfiniteCanvasEngine } from './InfiniteCanvasEngine';
import { CoordinateController } from './CoordinateController';

export interface NavEvent {
  clientX: number;
  clientY: number;
  deltaX?: number;
  deltaY?: number;
  ctrlKey?: boolean;
}

export class NavigationController {
  private isPanning = false;
  private lastPanPoint: Point2D | null = null;
  private panButton = 1; // Middle mouse by default

  constructor(
    private camera: CameraEngine,
    private canvas: InfiniteCanvasEngine,
    private coords: CoordinateController,
    private events: EventEngine
  ) {}

  public onPointerDown(e: NavEvent, button: number): void {
    if (button === this.panButton || (button === 0 && e.ctrlKey)) {
      this.isPanning = true;
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
    }
  }

  public onPointerMove(e: NavEvent): void {
    if (this.isPanning && this.lastPanPoint) {
      const dx = e.clientX - this.lastPanPoint.x;
      const dy = e.clientY - this.lastPanPoint.y;
      
      const zoom = this.camera.getZoom();
      
      // Moving mouse left means camera moves right
      this.camera.panBy(-dx / zoom, -dy / zoom);
      
      this.lastPanPoint = { x: e.clientX, y: e.clientY };
    }
  }

  public onPointerUp(e: NavEvent, button: number): void {
    if (button === this.panButton || button === 0) {
      this.isPanning = false;
      this.lastPanPoint = null;
    }
  }

  public onWheel(e: NavEvent): void {
    if (e.deltaY !== undefined) {
      // Determine zoom direction
      // Typical wheel behavior: scroll up (negative delta) = zoom in (scale > 1)
      const scaleFactor = e.deltaY < 0 ? 1.1 : (1 / 1.1);
      
      const cursorScreenPos = { x: e.clientX, y: e.clientY };
      this.camera.zoomToCursor(scaleFactor, cursorScreenPos);
    }
  }

  public zoomToFit(paddingRatio: number = 0.1): void {
    const bounds = this.canvas.getContentBounds();
    if (!bounds) {
      this.camera.resetCamera();
      return;
    }

    const viewport = this.camera.getViewportSize();
    if (viewport.width === 0 || viewport.height === 0) return;

    // Calculate zoom needed to fit bounds
    const zoomX = viewport.width / (bounds.width * (1 + paddingRatio * 2));
    const zoomY = viewport.height / (bounds.height * (1 + paddingRatio * 2));
    const zoom = Math.min(zoomX, zoomY);

    this.camera.setZoom(zoom);

    // Center camera on bounds
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    const camX = centerX - (viewport.width / zoom) / 2;
    const camY = centerY - (viewport.height / zoom) / 2;

    this.camera.setPosition(camX, camY);
  }
}
