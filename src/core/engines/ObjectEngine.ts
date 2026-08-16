import { BaseEngine } from '../types/BaseEngine';
import { Logger } from '../utils/logger';
import { USOMBaseObject, USOMId, Transform, USOMObjectType } from '../usom/types';
import { EventEngine } from '../events/EventEngine';
import { LibraryItem } from '../library/ObjectLibrary';
import { MasterChakraObject } from '../usom/MasterChakraObject';

export class ObjectEngine implements BaseEngine {
  public readonly name = 'ObjectEngine';
  private initialized = false;
  private objects: Map<USOMId, USOMBaseObject> = new Map();

  constructor(private eventEngine: EventEngine) {}

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.objects.clear();
    this.initialized = true;
    Logger.info(`${this.name} initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.objects.clear();
    this.initialized = false;
    Logger.info(`${this.name} shutdown.`);
  }

  public getObject(id: USOMId): USOMBaseObject | undefined {
    return this.objects.get(id);
  }

  public getAllObjects(): USOMBaseObject[] {
    return Array.from(this.objects.values());
  }

  /**
   * Factory method to create and register an object from a LibraryItem.
   * Single Source Geometry and Object Metadata are assigned here.
   */
  public createFromLibrary(
    item: LibraryItem,
    position: { x: number; y: number },
    customTransform?: Partial<Transform>
  ): USOMBaseObject {
    const instanceId = `${item.id}-${Date.now()}`;
    const initialTransform: Transform = {
      position: position,
      rotation: customTransform?.rotation ?? 0,
      scale: customTransform?.scale ?? { x: item.defaultScale, y: item.defaultScale }
    };

    let newObj: USOMBaseObject;

    if (item.category === 'chakras' || item.metadata.type === 'CHAKRA') {
      newObj = new MasterChakraObject(
        instanceId,
        item.name,
        initialTransform,
        420,
        item.metadata.numberOfSectors || 32
      );
    } else {
      newObj = {
        id: instanceId,
        type: USOMObjectType.CAD_ELEMENT,
        name: item.name,
        transform: initialTransform,
        metadata: { ...item.metadata, category: item.category, geometry: {}, boundingBox: { x: -50, y: -50, width: 100, height: 100 } },
        isVisible: true,
        isLocked: false,
        isSelected: false,
        zIndex: 50
      };
    }

    // Attach Versioning and Library Metadata
    newObj.metadata = {
      ...newObj.metadata,
      version: item.version,
      libraryId: item.id,
      category: item.category,
      geometrySource: item.geometrySource,
      tags: item.tags,
      createdViaEngine: true,
      timestamp: Date.now()
    };

    this._add(newObj);
    return newObj;
  }

  /**
   * INTERNAL methods for use by Commands.
   * UI components should NOT call these directly; they should dispatch Commands.
   */
  public _add(obj: USOMBaseObject): void {
    if (!this.initialized) return;
    // Deep clone to prevent external mutation
    this.objects.set(obj.id, JSON.parse(JSON.stringify(obj)));
    this.eventEngine.publish({
      type: 'OBJECT_ADDED',
      timestamp: Date.now(),
      payload: { objectId: obj.id, object: obj },
      source: this.name
    });
  }

  public _remove(id: USOMId): USOMBaseObject | undefined {
    if (!this.initialized) return undefined;
    const obj = this.objects.get(id);
    if (obj) {
      this.objects.delete(id);
      this.eventEngine.publish({
        type: 'OBJECT_REMOVED',
        timestamp: Date.now(),
        payload: { objectId: id, object: obj },
        source: this.name
      });
    }
    return obj;
  }

  public _update(id: USOMId, updates: Partial<USOMBaseObject>): void {
    if (!this.initialized) return;
    const obj = this.objects.get(id);
    if (obj) {
      const updatedObj = {
        ...obj,
        ...updates,
        transform: updates.transform ? { ...obj.transform, ...updates.transform } : obj.transform,
        metadata: updates.metadata ? { ...obj.metadata, ...updates.metadata } : obj.metadata
      };
      // Deep clone to prevent external mutation of reference
      this.objects.set(id, JSON.parse(JSON.stringify(updatedObj)));
      this.eventEngine.publish({
        type: 'OBJECT_UPDATED',
        timestamp: Date.now(),
        payload: { objectId: id, object: updatedObj },
        source: this.name
      });
    }
  }

  public _updateTransform(id: USOMId, transform: Transform): void {
    this._update(id, { transform });
  }
}
