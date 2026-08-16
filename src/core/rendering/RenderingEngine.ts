import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { RenderingBackend } from './RenderingBackend';
import { RenderRegistry } from './RenderRegistry';
import { CameraEngine } from '../workspace/CameraEngine';
import { LayerManager } from './LayerManager';
import { ObjectEngine } from '../engines/ObjectEngine';
import { SelectionEngine } from '../engines/SelectionEngine';

/**
 * RenderingEngine
 * 
 * Manages the rendering lifecycle, scheduling, and loop.
 * Coordinates rendering of objects using the RenderRegistry and RenderingBackend.
 * 
 * Architecture Law RE-001 (Mandatory):
 * Rendering Engine is a read-only consumer. It must never mutate application state.
 */
export class RenderingEngine implements BaseEngine {
  public readonly name = 'RenderingEngine';
  private initialized = false;
  private backend: RenderingBackend | null = null;
  private animationFrameId: number | null = null;
  private isInvalidated = false;

  public readonly registry: RenderRegistry;
  public readonly layers: LayerManager;

  constructor(
    public readonly camera: CameraEngine,
    private objectEngine: ObjectEngine,
    private selectionEngine: SelectionEngine
  ) {
    this.registry = new RenderRegistry();
    this.layers = new LayerManager();
  }

  public async initialize(backend?: RenderingBackend): Promise<void> {
    if (this.initialized) return;
    
    if (backend) {
      this.backend = backend;
      await this.backend.initialize();
    }
    
    this.initialized = true;
    this.invalidate();
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    
    this.stopRenderLoop();
    if (this.backend) {
      this.backend.dispose();
      this.backend = null;
    }
    this.registry.clear();
    
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  /**
   * Sets or replaces the rendering backend dynamically.
   */
  public async setBackend(backend: RenderingBackend): Promise<void> {
    if (this.backend) {
      this.backend.dispose();
    }
    this.backend = backend;
    await this.backend.initialize();
    this.invalidate();
  }

  /**
   * Schedules a render for the next frame.
   */
  public invalidate(): void {
    if (!this.isInvalidated && this.initialized && this.backend) {
      this.isInvalidated = true;
      // In a browser environment we would use requestAnimationFrame.
      // Fallback for tests or non-browser environments.
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
         this.animationFrameId = window.requestAnimationFrame(() => this.renderFrame());
      } else {
         Promise.resolve().then(() => this.renderFrame());
      }
    }
  }

  /**
   * Renders a single frame. Usually called internally via requestAnimationFrame,
   * but can be called manually.
   */
  public renderFrame(): void {
    if (!this.initialized || !this.backend) {
      this.isInvalidated = false;
      return;
    }
    
    this.isInvalidated = false;
    if (this.animationFrameId !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 1. Clear backend
    this.backend.clear();

    // 2. Setup global camera transform
    this.backend.save();
    
    const camPos = this.camera.getPosition();
    const zoom = this.camera.getZoom();
    
    this.backend.scale(zoom, zoom);
    this.backend.translate(-camPos.x, -camPos.y);

    // 3. Retrieve and sort objects
    const allObjects = this.objectEngine.getAllObjects();
    const visibleObjects = allObjects.filter(obj => obj.isVisible);
    
    // Simple z-index sort. In a full implementation, this could map objects to specific layers.
    visibleObjects.sort((a, b) => a.zIndex - b.zIndex);
    
    // 4. Render objects
    // Each renderer is responsible for drawing the object geometry, selection state, handles, and indicators
    for (const obj of visibleObjects) {
       const renderer = this.registry.getRendererForObject(obj);
       if (renderer) {
           this.backend.save();
           
           // Apply object transform
           this.backend.translate(obj.transform.position.x, obj.transform.position.y);
           this.backend.rotate(obj.transform.rotation);
           this.backend.scale(obj.transform.scale.x, obj.transform.scale.y);
           
           renderer.render(obj, this.backend, this.camera);
           
           this.backend.restore();
       }
    }

    // 5. Restore global transform
    this.backend.restore();
  }
  
  /**
   * Starts an active render loop (e.g., for continuous animations).
   */
  public startRenderLoop(): void {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      const loop = () => {
         this.renderFrame();
         this.animationFrameId = window.requestAnimationFrame(loop);
      };
      this.animationFrameId = window.requestAnimationFrame(loop);
    }
  }

  /**
   * Stops an active render loop.
   */
  public stopRenderLoop(): void {
    if (this.animationFrameId !== null && typeof window !== 'undefined') {
       window.cancelAnimationFrame(this.animationFrameId);
       this.animationFrameId = null;
    }
  }
}
