import { describe, it, expect, beforeEach } from 'vitest';
import { SelectionEngine } from '../SelectionEngine';
import { EventEngine } from '../../events/EventEngine';
import { ObjectEngine } from '../ObjectEngine';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';

describe('SelectionEngine', () => {
  let eventEngine: EventEngine;
  let objectEngine: ObjectEngine;
  let selectionEngine: SelectionEngine;

  beforeEach(async () => {
    eventEngine = new EventEngine();
    await eventEngine.initialize();
    
    objectEngine = new ObjectEngine(eventEngine);
    await objectEngine.initialize();
    
    // Add dummy objects to avoid undefined issues
    const obj1: USOMBaseObject = { id: 'obj-1', type: USOMObjectType.ROOM, transform: { position: {x:0, y:0}, rotation: 0, scale: {x:1, y:1} }, isVisible: true, isLocked: false, isSelected: false, metadata: {}, zIndex: 0, name: '1' };
    const obj2: USOMBaseObject = { id: 'obj-2', type: USOMObjectType.ROOM, transform: { position: {x:0, y:0}, rotation: 0, scale: {x:1, y:1} }, isVisible: true, isLocked: false, isSelected: false, metadata: {}, zIndex: 0, name: '2' };
    objectEngine._add(obj1);
    objectEngine._add(obj2);

    selectionEngine = new SelectionEngine(eventEngine, objectEngine);
    await selectionEngine.initialize();
  });

  it('selects a single object', () => {
    selectionEngine.select('obj-1');
    expect(selectionEngine.isSelected('obj-1')).toBe(true);
    expect(selectionEngine.getSelection()).toEqual(['obj-1']);
    expect(objectEngine.getObject('obj-1')?.isSelected).toBe(true);
  });

  it('clears previous selection when selecting single object', () => {
    selectionEngine.select('obj-1');
    selectionEngine.select('obj-2', false);
    
    expect(selectionEngine.isSelected('obj-1')).toBe(false);
    expect(selectionEngine.isSelected('obj-2')).toBe(true);
    expect(objectEngine.getObject('obj-1')?.isSelected).toBe(false);
    expect(objectEngine.getObject('obj-2')?.isSelected).toBe(true);
  });

  it('allows multi-selection', () => {
    selectionEngine.select('obj-1');
    selectionEngine.select('obj-2', true);
    
    expect(selectionEngine.isSelected('obj-1')).toBe(true);
    expect(selectionEngine.isSelected('obj-2')).toBe(true);
    expect(selectionEngine.getSelection()).toContain('obj-1');
    expect(selectionEngine.getSelection()).toContain('obj-2');
  });

  it('deselects an object', () => {
    selectionEngine.select('obj-1');
    selectionEngine.deselect('obj-1');
    expect(selectionEngine.isSelected('obj-1')).toBe(false);
    expect(objectEngine.getObject('obj-1')?.isSelected).toBe(false);
  });

  it('clears all selections', () => {
    selectionEngine.select('obj-1', true);
    selectionEngine.select('obj-2', true);
    selectionEngine.clear();
    
    expect(selectionEngine.getSelection().length).toBe(0);
    expect(objectEngine.getObject('obj-1')?.isSelected).toBe(false);
  });

  it('publishes events on selection change', () => {
    let fired = false;
    eventEngine.subscribe('SELECTION_CHANGED', (e) => {
      fired = true;
      expect(e.payload.selectedIds).toContain('obj-1');
    });
    
    selectionEngine.select('obj-1');
    expect(fired).toBe(true);
  });
});
