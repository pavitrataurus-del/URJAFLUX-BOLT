import { describe, it, expect, beforeEach } from 'vitest';
import { CameraEngine } from '../CameraEngine';
import { EventEngine } from '../../events/EventEngine';

describe('CameraEngine', () => {
  let events: EventEngine;
  let camera: CameraEngine;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();
    camera = new CameraEngine(events);
    await camera.initialize();
  });

  it('sets initial size and camera position', () => {
    expect(camera.getViewportSize()).toEqual({ width: 800, height: 600 });
    expect(camera.getPosition()).toEqual({ x: 0, y: 0 });
    expect(camera.getZoom()).toBe(1);
  });

  it('pans camera relative and absolute', () => {
    camera.setPosition(100, 50);
    expect(camera.getPosition()).toEqual({ x: 100, y: 50 });
    
    camera.panBy(-20, 30);
    expect(camera.getPosition()).toEqual({ x: 80, y: 80 });
  });

  it('zooms correctly and respects limits', () => {
    camera.setZoom(2);
    expect(camera.getZoom()).toBe(2);
    
    camera.setZoom(-1);
    expect(camera.getZoom()).toBe(0.01);

    camera.setZoom(200);
    expect(camera.getZoom()).toBe(100);
  });
  
  it('zooms to cursor keeping screen point invariant', () => {
    camera.setPosition(0, 0);
    camera.setZoom(1);
    // Cursor at (100, 100) screen -> (100, 100) world
    // Zoom by 2x -> new zoom is 2.
    // We want world (100, 100) to still be at screen (100, 100).
    // newScreen = (world - newCam) * 2
    // 100 = (100 - newCam.x) * 2 => 50 = 100 - newCam.x => newCam.x = 50.
    
    camera.zoomToCursor(2, { x: 100, y: 100 });
    
    expect(camera.getZoom()).toBe(2);
    expect(camera.getPosition()).toEqual({ x: 50, y: 50 });
  });
});
