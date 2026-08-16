import { describe, it, expect, beforeEach } from 'vitest';
import { TransformEngine } from '../TransformEngine';
import { ObjectEngine } from '../ObjectEngine';
import { EventEngine } from '../../events/EventEngine';
import { CommandEngine } from '../../commands/CommandEngine';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';
import { AddObjectCommand } from '../../commands/ObjectCommands';

describe('TransformEngine', () => {
  let eventEngine: EventEngine;
  let objectEngine: ObjectEngine;
  let commandEngine: CommandEngine;
  let transformEngine: TransformEngine;
  
  const mockObject: USOMBaseObject = {
    id: 'test-1',
    type: USOMObjectType.ROOM,
    name: 'Test',
    transform: {
      position: { x: 10, y: 10 },
      rotation: 0,
      scale: { x: 1, y: 1 }
    },
    metadata: {},
    isVisible: true,
    isLocked: false, isSelected: false,
    zIndex: 0
  };

  beforeEach(async () => {
    eventEngine = new EventEngine();
    await eventEngine.initialize();
    
    objectEngine = new ObjectEngine(eventEngine);
    await objectEngine.initialize();
    
    commandEngine = new CommandEngine(eventEngine);
    await commandEngine.initialize();
    
    transformEngine = new TransformEngine(objectEngine, commandEngine);
    await transformEngine.initialize();
    
    // Add initial object
    const addCmd = new AddObjectCommand(mockObject);
    await commandEngine.execute(addCmd, objectEngine);
  });

  it('translates an object', async () => {
    await transformEngine.translate('test-1', { x: 5, y: -5 });
    
    const obj = objectEngine.getObject('test-1')!;
    expect(obj.transform.position.x).toBe(15);
    expect(obj.transform.position.y).toBe(5);
  });

  it('rotates an object', async () => {
    await transformEngine.rotate('test-1', 45);
    
    const obj = objectEngine.getObject('test-1')!;
    expect(obj.transform.rotation).toBe(45);
  });

  it('scales an object', async () => {
    await transformEngine.scale('test-1', { x: 2, y: 0.5 });
    
    const obj = objectEngine.getObject('test-1')!;
    expect(obj.transform.scale.x).toBe(2);
    expect(obj.transform.scale.y).toBe(0.5);
  });

  it('undoes a transformation', async () => {
    await transformEngine.translate('test-1', { x: 100, y: 100 });
    expect(objectEngine.getObject('test-1')!.transform.position.x).toBe(110);
    
    await commandEngine.undo(objectEngine);
    expect(objectEngine.getObject('test-1')!.transform.position.x).toBe(10);
  });
});
