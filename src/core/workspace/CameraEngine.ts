import { BaseEngine } from '../types/BaseEngine';
import { EventEngine } from '../events/EventEngine';
import { Point2D } from '../spatial/math';
import { BoundingBox } from '../usom/types';
import { Logger } from '../utils/logger';

export class CameraEngine implements BaseEngine {
  public readonly name = 'CameraEngine';
  private initialized = false;

  private position: Point2D = { x: 0, y: 0 };
  private zoom: number = 1;
  private viewportSize: { width: number, height: number } = { width: 800, height: 600 };

  // config
  private minZoom = 0.01;
  private maxZoom = 100;

  constructor(private eventEngine: EventEngine) {}

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

  public setViewportSize(width: number, height: number): void {
    this.viewportSize = { width, height };
    this.publishChange();
  }

  public getViewportSize(): { width: number, height: number } {
    return { ...this.viewportSize };
  }

  public setPosition(x: number, y: number): void {
    this.position = { x, y };
    this.publishChange();
  }

  public getPosition(): Point2D {
    return { ...this.position };
  }

  public panBy(dx: number, dy: number): void {
    this.position.x += dx;
    this.position.y += dy;
    this.publishChange();
  }

  public setZoom(zoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.publishChange();
  }

  public getZoom(): number {
    return this.zoom;
  }

  public zoomToCursor(delta: number, cursorScreenPos: Point2D): void {
    const oldZoom = this.zoom;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * delta));
    
    // The point in world space under the cursor should remain at the same screen space coordinate.
    const scaleChange = newZoom - oldZoom;
    const dx = (cursorScreenPos.x / oldZoom) - (cursorScreenPos.x / newZoom);
    const dy = (cursorScreenPos.y / oldZoom) - (cursorScreenPos.y / newZoom);

    this.position.x += dx;
    this.position.y += dy;
    this.zoom = newZoom;
    
    this.publishChange();
  }

  public resetCamera(): void {
    this.position = { x: 0, y: 0 };
    this.zoom = 1;
    this.publishChange();
  }

  public getVisibleBounds(): BoundingBox {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.viewportSize.width / this.zoom,
      height: this.viewportSize.height / this.zoom
    };
  }

  private publishChange(): void {
    if (!this.initialized) return;
    this.eventEngine.publish({
      type: 'CAMERA_CHANGED',
      timestamp: Date.now(),
      payload: {
        position: this.position,
        zoom: this.zoom,
        bounds: this.getVisibleBounds()
      },
      source: this.name
    });
  }
}
