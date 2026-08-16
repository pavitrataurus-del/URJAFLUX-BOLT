import { Renderer } from './RendererContracts';
import { USOMBaseObject } from '../usom/types';
import { Logger } from '../utils/logger';

/**
 * RenderRegistry
 * 
 * Responsible for mapping USOM object types to their corresponding renderer implementations.
 * Enables dynamic registration to follow the Open/Closed Principle.
 */
export class RenderRegistry {
  private renderers: Set<Renderer> = new Set();

  public registerRenderer(renderer: Renderer): void {
    this.renderers.add(renderer);
    Logger.info(`RenderRegistry: Registered new renderer.`);
  }

  public unregisterRenderer(renderer: Renderer): void {
    this.renderers.delete(renderer);
    Logger.info(`RenderRegistry: Unregistered renderer.`);
  }

  public getRendererForObject(object: USOMBaseObject): Renderer | undefined {
    for (const renderer of this.renderers) {
      if (renderer.canRender(object)) {
        return renderer;
      }
    }
    return undefined;
  }
  
  public clear(): void {
    for (const renderer of this.renderers) {
      renderer.dispose();
    }
    this.renderers.clear();
  }
}
