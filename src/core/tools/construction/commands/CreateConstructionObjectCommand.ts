import { BaseCommand } from '../../../types/BaseCommand';
import { USOMBaseObject, USOMId } from '../../../usom/types';
import { ObjectEngine } from '../../../engines/ObjectEngine';
import { generateId } from '../../../utils/id';

function resolveObjectEngine(engineContext: any): ObjectEngine {
  if (engineContext && typeof engineContext._add === 'function') {
    return engineContext as ObjectEngine;
  }
  if (engineContext && engineContext.objects && typeof engineContext.objects._add === 'function') {
    return engineContext.objects as ObjectEngine;
  }
  throw new Error('Invalid engine context provided to CreateConstructionObjectCommand');
}

export class CreateConstructionObjectCommand implements BaseCommand<ObjectEngine, USOMBaseObject> {
  public readonly id: string;
  public readonly name = 'CreateConstructionObjectCommand';
  public readonly timestamp = Date.now();

  constructor(private readonly object: USOMBaseObject) {
    this.id = generateId();
  }

  public getCreatedObject(): USOMBaseObject {
    return this.object;
  }

  public async execute(engineContext: any): Promise<USOMBaseObject> {
    const objectEngine = resolveObjectEngine(engineContext);
    objectEngine._add(this.object);
    return this.object;
  }

  public async undo(engineContext: any): Promise<void> {
    const objectEngine = resolveObjectEngine(engineContext);
    objectEngine._remove(this.object.id);
  }

  public async redo(engineContext: any): Promise<USOMBaseObject> {
    const objectEngine = resolveObjectEngine(engineContext);
    objectEngine._add(this.object);
    return this.object;
  }
}
