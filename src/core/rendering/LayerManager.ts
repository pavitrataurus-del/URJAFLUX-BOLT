import { Logger } from '../utils/logger';

export enum DefaultRenderLayers {
  GRID = 0,
  BLUEPRINT = 10,
  MASTER_CHAKRA = 20,
  OBJECTS = 30,
  ANNOTATIONS = 40,
  SELECTION = 50,
  GUIDES = 60
}

export interface LayerConfig {
  id: string;
  zIndex: number;
  name: string;
  visible: boolean;
}

/**
 * LayerManager
 * 
 * Manages rendering layers and their ordering.
 * Determines the z-index order of rendered elements.
 * 
 * IMPORTANT: This module controls draw order only. It never owns objects.
 */
export class LayerManager {
  private layers: Map<string, LayerConfig> = new Map();

  constructor() {
    this.registerLayer({ id: 'grid', zIndex: DefaultRenderLayers.GRID, name: 'Grid', visible: true });
    this.registerLayer({ id: 'blueprint', zIndex: DefaultRenderLayers.BLUEPRINT, name: 'Blueprint', visible: true });
    this.registerLayer({ id: 'master_chakra', zIndex: DefaultRenderLayers.MASTER_CHAKRA, name: 'Master Chakra', visible: true });
    this.registerLayer({ id: 'objects', zIndex: DefaultRenderLayers.OBJECTS, name: 'Objects', visible: true });
    this.registerLayer({ id: 'annotations', zIndex: DefaultRenderLayers.ANNOTATIONS, name: 'Annotations', visible: true });
    this.registerLayer({ id: 'selection', zIndex: DefaultRenderLayers.SELECTION, name: 'Selection', visible: true });
    this.registerLayer({ id: 'guides', zIndex: DefaultRenderLayers.GUIDES, name: 'Guides', visible: true });
  }

  public registerLayer(config: LayerConfig): void {
    this.layers.set(config.id, config);
  }

  public setLayerVisibility(id: string, visible: boolean): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.visible = visible;
    }
  }

  public isLayerVisible(id: string): boolean {
    const layer = this.layers.get(id);
    return layer ? layer.visible : true;
  }

  public getSortedLayerIds(): string[] {
    return Array.from(this.layers.values())
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(l => l.id);
  }
  
  public getZIndex(layerId: string): number {
     const layer = this.layers.get(layerId);
     return layer ? layer.zIndex : DefaultRenderLayers.OBJECTS;
  }
}
