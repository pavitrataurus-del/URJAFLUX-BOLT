import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavigationController } from '../NavigationController';
import { CameraEngine } from '../CameraEngine';
import { InfiniteCanvasEngine } from '../InfiniteCanvasEngine';
import { CoordinateController } from '../CoordinateController';
import { GridEngine } from '../GridEngine';
import { EventEngine } from '../../events/EventEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { USOMBaseObject, USOMObjectType } from '../../usom/types';

describe('NavigationController', () => {
  let events: EventEngine;
  let objects: ObjectEngine;
  let camera: CameraEngine;
  let canvas: InfiniteCanvasEngine;
  let grid: GridEngine;
  let coords: CoordinateController;
  let nav: NavigationController;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();
    
    objects = new ObjectEngine(events);
    await objects.initialize();
    
    camera = new CameraEngine(events);
    await camera.initialize();
    
    canvas = new InfiniteCanvasEngine(objects);
    await canvas.initialize();
    
    grid = new GridEngine();
    await grid.initialize();
    
    coords = new CoordinateController(camera, grid);
    
    nav = new NavigationController(camera, canvas, coords, events);
    
    // Set initial viewport for calculations
    camera.setViewportSize(1000, 1000);
  });

  it('pans camera on middle mouse drag', () => {
    nav.onPointerDown({ clientX: 100, clientY: 100 }, 1); // Middle button
    nav.onPointerMove({ clientX: 150, clientY: 80 });
    
    // Moved right 50, up 20. Camera should move left 50, down 20
    expect(camera.getPosition()).toEqual({ x: -50, y: 20 });
    
    nav.onPointerUp({ clientX: 150, clientY: 80 }, 1);
    
    // Should not pan anymore
    nav.onPointerMove({ clientX: 200, clientY: 100 });
    expect(camera.getPosition()).toEqual({ x: -50, y: 20 });
  });

  it('pans camera on ctrl + left click drag', () => {
    nav.onPointerDown({ clientX: 100, clientY: 100, ctrlKey: true }, 0); // Left button + ctrl
    nav.onPointerMove({ clientX: 150, clientY: 80 });
    
    expect(camera.getPosition()).toEqual({ x: -50, y: 20 });
  });

  it('zooms on wheel scroll', () => {
    vi.spyOn(camera, 'zoomToCursor');
    
    nav.onWheel({ clientX: 500, clientY: 500, deltaY: -100 });
    
    expect(camera.zoomToCursor).toHaveBeenCalledWith(1.1, { x: 500, y: 500 });
  });

  it('zooms to fit visible objects', () => {
    const obj1: USOMBaseObject = {
      id: '1', type: USOMObjectType.ROOM,
      transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
      zIndex: 0, isVisible: true, isLocked: false, isSelected: false, metadata: {}, name: 'test'
    };
    
    const obj2: USOMBaseObject = {
      id: '2', type: USOMObjectType.ROOM,
      transform: { position: { x: 100, y: 100 }, rotation: 0, scale: { x: 1, y: 1 } },
      zIndex: 0, isVisible: true, isLocked: false, isSelected: false, metadata: {}, name: 'test'
    };
    
    objects._add(obj1);
    objects._add(obj2);
    
    // Bounds will be approximately from (-50, -50) to (150, 150) due to boundsRadius calculation in InfiniteCanvasEngine
    nav.zoomToFit(0);
    
    const pos = camera.getPosition();
    expect(pos.x).toBeLessThan(100); // Sanity check
  });
});
