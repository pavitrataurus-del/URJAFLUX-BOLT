import { USOMBaseObject } from '../usom/types';
import { RenderingBackend } from './RenderingBackend';
import { CameraEngine } from '../workspace/CameraEngine';

/**
 * Renderer Contract
 * 
 * Every object-specific renderer must implement this interface.
 * Renderers translate USOM object data into low-level backend drawing calls.
 */
export interface Renderer {
  /**
   * Determines if this renderer can render the given object.
   * @param object The USOM object to test
   * @returns true if the renderer supports the object type
   */
  canRender(object: USOMBaseObject): boolean;

  /**
   * Renders the object using the provided backend and camera.
   * Note: Global camera transforms and object-specific transforms (translation/rotation)
   * are already applied by the RenderingEngine before calling this method.
   * 
   * @param object The object to render
   * @param backend The rendering backend abstraction
   * @param camera The camera engine
   */
  render(object: USOMBaseObject, backend: RenderingBackend, camera: CameraEngine): void;

  /**
   * Cleans up resources if necessary.
   */
  dispose(): void;
}
