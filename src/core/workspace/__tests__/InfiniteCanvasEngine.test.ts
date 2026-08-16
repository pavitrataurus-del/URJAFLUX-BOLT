import { describe, it, expect, beforeEach } from 'vitest';
import { InfiniteCanvasEngine } from '../InfiniteCanvasEngine';
import { EventEngine } from '../../events/EventEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';

describe('InfiniteCanvasEngine', () => {
  let events: EventEngine;
  let objects: ObjectEngine;
  let canvas: InfiniteCanvasEngine;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();
    
    objects = new ObjectEngine(events);
    await objects.initialize();
    
    canvas = new InfiniteCanvasEngine(objects);
    await canvas.initialize();
  });

  it('computes content bounds correctly', () => {
    const obj1: USOMBaseObject = {
      id: '1', type: USOMObjectType.ROOM,
      transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
      zIndex: 0, isVisible: true, isLocked: false, isSelected: false, metadata: {}, name: 'test'
    };
    
    const obj2: USOMBaseObject = {
      id: '2', type: USOMObjectType.ROOM,
      transform: { position: { x: 100, y: 100 }, rotation: 0, scale: { x: 2, y: 2 } },
      zIndex: 0, isVisible: true, isLocked: false, isSelected: false, metadata: {}, name: 'test'
    };
    
    objects._add(obj1);
    objects._add(obj2);
    
    const bounds = canvas.getContentBounds();
    
    expect(bounds).toBeDefined();
    if (bounds) {
      // For obj1: x=0, r=50 -> minX = -50, maxX = 50
      // For obj2: x=100, r=100 -> minX = 0, maxX = 200
      // Overall minX = -50, maxX = 200, width = 250
      expect(bounds.x).toBe(-50);
      expect(bounds.y).toBe(-50);
      expect(bounds.width).toBe(250);
      expect(bounds.height).toBe(250);
    }
  });

  it('returns null if no visible objects', () => {
    const obj1: USOMBaseObject = {
      id: '1', type: USOMObjectType.ROOM,
      transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
      zIndex: 0, isVisible: false, isLocked: false, isSelected: false, metadata: {}, name: 'test'
    };
    
    objects._add(obj1);
    
    expect(canvas.getContentBounds()).toBeNull();
  });
});
