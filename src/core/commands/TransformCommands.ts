import { BaseCommand } from '../types/BaseCommand';
import { USOMId } from '../usom/types';
import { Point2D } from '../spatial/math';
import { ObjectEngine } from '../engines/ObjectEngine';
import { generateId } from '../utils/id';

export class TranslateCommand implements BaseCommand<ObjectEngine, void> {
  public readonly id = generateId();
  public readonly name = 'TranslateCommand';
  public readonly timestamp = Date.now();
  
  constructor(private objectId: USOMId, private delta: Point2D) {}
  
  async execute(engine: ObjectEngine): Promise<void> {
    const obj = engine.getObject(this.objectId);
    if (obj) {
      engine._updateTransform(this.objectId, {
        ...obj.transform,
        position: {
          x: obj.transform.position.x + this.delta.x,
          y: obj.transform.position.y + this.delta.y
        }
      });
    }
  }
  
  async undo(engine: ObjectEngine): Promise<void> {
    const obj = engine.getObject(this.objectId);
    if (obj) {
      engine._updateTransform(this.objectId, {
        ...obj.transform,
        position: {
          x: obj.transform.position.x - this.delta.x,
          y: obj.transform.position.y - this.delta.y
        }
      });
    }
  }
}

export class RotateCommand implements BaseCommand<ObjectEngine, void> {
  public readonly id = generateId();
  public readonly name = 'RotateCommand';
  public readonly timestamp = Date.now();
  
  constructor(private objectId: USOMId, private deltaAngleDegrees: number) {}
  
  async execute(engine: ObjectEngine): Promise<void> {
    const obj = engine.getObject(this.objectId);
    if (obj) {
      engine._updateTransform(this.objectId, {
        ...obj.transform,
        rotation: (obj.transform.rotation + this.deltaAngleDegrees) % 360
      });
    }
  }
  
  async undo(engine: ObjectEngine): Promise<void> {
    const obj = engine.getObject(this.objectId);
    if (obj) {
      engine._updateTransform(this.objectId, {
        ...obj.transform,
        rotation: (obj.transform.rotation - this.deltaAngleDegrees) % 360
      });
    }
  }
}

export class ScaleCommand implements BaseCommand<ObjectEngine, void> {
  public readonly id = generateId();
  public readonly name = 'ScaleCommand';
  public readonly timestamp = Date.now();
  
  private previousScale?: Point2D;

  constructor(private objectId: USOMId, private scaleFactor: Point2D) {}
  
  async execute(engine: ObjectEngine): Promise<void> {
    const obj = engine.getObject(this.objectId);
    if (obj) {
      this.previousScale = { ...obj.transform.scale };
      engine._updateTransform(this.objectId, {
        ...obj.transform,
        scale: {
          x: obj.transform.scale.x * this.scaleFactor.x,
          y: obj.transform.scale.y * this.scaleFactor.y
        }
      });
    }
  }
  
  async undo(engine: ObjectEngine): Promise<void> {
    const obj = engine.getObject(this.objectId);
    if (obj && this.previousScale) {
      engine._updateTransform(this.objectId, {
        ...obj.transform,
        scale: this.previousScale
      });
    }
  }
}
