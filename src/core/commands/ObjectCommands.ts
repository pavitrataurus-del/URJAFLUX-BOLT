import { BaseCommand } from '../types/BaseCommand';
import { USOMBaseObject, USOMId } from '../usom/types';
import { ObjectEngine } from '../engines/ObjectEngine';
import { generateId } from '../utils/id';

function getObjectEngine(engine: any): any {
  if (engine && typeof engine._add === 'function') {
    return engine;
  }
  if (engine && engine.objects && typeof engine.objects._add === 'function') {
    return engine.objects;
  }
  return engine;
}

export class AddObjectCommand implements BaseCommand<ObjectEngine, void> {
  public readonly id = generateId();
  public readonly name = 'AddObjectCommand';
  public readonly timestamp = Date.now();
  
  constructor(private object: USOMBaseObject) {}
  
  async execute(engine: any): Promise<void> {
    const targetEngine = getObjectEngine(engine);
    targetEngine._add(this.object);
  }
  
  async undo(engine: any): Promise<void> {
    const targetEngine = getObjectEngine(engine);
    targetEngine._remove(this.object.id);
  }
}

export class RemoveObjectCommand implements BaseCommand<ObjectEngine, void> {
  public readonly id = generateId();
  public readonly name = 'RemoveObjectCommand';
  public readonly timestamp = Date.now();
  
  private removedObject?: USOMBaseObject;

  constructor(private objectId: USOMId) {}
  
  async execute(engine: any): Promise<void> {
    const targetEngine = getObjectEngine(engine);
    this.removedObject = targetEngine.getObject(this.objectId);
    if (this.removedObject) {
      targetEngine._remove(this.objectId);
    }
  }
  
  async undo(engine: any): Promise<void> {
    const targetEngine = getObjectEngine(engine);
    if (this.removedObject) {
      targetEngine._add(this.removedObject);
    }
  }
}

export class UpdateObjectCommand implements BaseCommand<ObjectEngine, void> {
  public readonly id = generateId();
  public readonly name = 'UpdateObjectCommand';
  public readonly timestamp = Date.now();
  
  private previousState?: USOMBaseObject;

  constructor(private objectId: USOMId, private updates: Partial<USOMBaseObject>) {}
  
  async execute(engine: any): Promise<void> {
    const targetEngine = getObjectEngine(engine);
    const obj = targetEngine.getObject(this.objectId);
    if (obj) {
      // Store full previous state for undo
      this.previousState = JSON.parse(JSON.stringify(obj));
      targetEngine._update(this.objectId, this.updates);
    }
  }
  
  async undo(engine: any): Promise<void> {
    const targetEngine = getObjectEngine(engine);
    if (this.previousState) {
      // Restore previous state by updating everything
      targetEngine._update(this.objectId, this.previousState);
    }
  }
}
