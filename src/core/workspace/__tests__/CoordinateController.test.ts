import { describe, it, expect, beforeEach } from 'vitest';
import { CoordinateController } from '../CoordinateController';
import { CameraEngine } from '../CameraEngine';
import { GridEngine } from '../GridEngine';
import { EventEngine } from '../../events/EventEngine';

describe('CoordinateController', () => {
  let events: EventEngine;
  let camera: CameraEngine;
  let grid: GridEngine;
  let coords: CoordinateController;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();
    camera = new CameraEngine(events);
    await camera.initialize();
    grid = new GridEngine();
    await grid.initialize();
    coords = new CoordinateController(camera, grid);
  });

  it('converts screen to world coordinates correctly', () => {
    camera.setPosition(10, 20);
    camera.setZoom(2);
    
    // Screen (100, 100) -> World: 10 + 100/2 = 60, 20 + 100/2 = 70
    expect(coords.screenToWorld({ x: 100, y: 100 })).toEqual({ x: 60, y: 70 });
  });

  it('converts world to screen coordinates correctly', () => {
    camera.setPosition(10, 20);
    camera.setZoom(2);
    
    // World (60, 70) -> Screen: (60 - 10) * 2 = 100, (70 - 20) * 2 = 100
    expect(coords.worldToScreen({ x: 60, y: 70 })).toEqual({ x: 100, y: 100 });
  });

  it('snaps point to grid correctly', () => {
    // Zoom 1 -> adaptive grid spacing = 10
    camera.setZoom(1);
    
    expect(coords.snapToGrid({ x: 12, y: 18 })).toEqual({ x: 10, y: 20 });
    
    // Zoom 0.1 -> spacing = 100
    camera.setZoom(0.1);
    expect(coords.snapToGrid({ x: 12, y: 55 })).toEqual({ x: 0, y: 100 });
  });
});
