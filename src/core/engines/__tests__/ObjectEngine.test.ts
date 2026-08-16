import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectEngine } from '../ObjectEngine';
import { EventEngine } from '../../events/EventEngine';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';
import { AddObjectCommand, RemoveObjectCommand, UpdateObjectCommand } from '../../commands/ObjectCommands';
import { CommandEngine } from '../../commands/CommandEngine';

describe('ObjectEngine & Commands', () => {
  let eventEngine: EventEngine;
  let objectEngine: ObjectEngine;
  let commandEngine: CommandEngine;
  
  const mockObject: USOMBaseObject = {
    id: 'test-1',
    type: USOMObjectType.ROOM,
    name: 'Living Room',
    transform: {
      position: { x: 0, y: 0 },
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
  });

  it('adds an object via command', async () => {
    const cmd = new AddObjectCommand(mockObject);
    await commandEngine.execute(cmd, objectEngine);
    
    expect(objectEngine.getObject('test-1')).toBeDefined();
    expect(objectEngine.getObject('test-1')?.name).toBe('Living Room');
  });

  it('undoes adding an object', async () => {
    const cmd = new AddObjectCommand(mockObject);
    await commandEngine.execute(cmd, objectEngine);
    await commandEngine.undo(objectEngine);
    
    expect(objectEngine.getObject('test-1')).toBeUndefined();
  });

  it('removes an object via command', async () => {
    const addCmd = new AddObjectCommand(mockObject);
    await commandEngine.execute(addCmd, objectEngine);
    
    const rmCmd = new RemoveObjectCommand('test-1');
    await commandEngine.execute(rmCmd, objectEngine);
    
    expect(objectEngine.getObject('test-1')).toBeUndefined();
  });

  it('updates an object via command', async () => {
    const addCmd = new AddObjectCommand(mockObject);
    await commandEngine.execute(addCmd, objectEngine);
    
    const updateCmd = new UpdateObjectCommand('test-1', { name: 'Updated Room' });
    await commandEngine.execute(updateCmd, objectEngine);
    
    expect(objectEngine.getObject('test-1')?.name).toBe('Updated Room');
  });

  it('undoes an object update', async () => {
    const addCmd = new AddObjectCommand(mockObject);
    await commandEngine.execute(addCmd, objectEngine);
    
    const updateCmd = new UpdateObjectCommand('test-1', { name: 'Updated Room' });
    await commandEngine.execute(updateCmd, objectEngine);
    
    await commandEngine.undo(objectEngine);
    expect(objectEngine.getObject('test-1')?.name).toBe('Living Room');
  });
});
