import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RenderingEngine } from '../RenderingEngine';
import { CameraEngine } from '../../workspace/CameraEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { SelectionEngine } from '../../engines/SelectionEngine';
import { EventEngine } from '../../events/EventEngine';
import { RenderingBackend, RenderStyle } from '../RenderingBackend';
import { Point2D, Polygon2D } from '../../spatial/math';
import { BoundingBox, USOMBaseObject, USOMObjectType } from '../../usom/types';
import { Renderer } from '../RendererContracts';

// Mock Backend
class MockBackend implements RenderingBackend {
  calls: string[] = [];
  async initialize() {}
  clear() { this.calls.push('clear'); }
  drawLine() { this.calls.push('drawLine'); }
  drawRect() { this.calls.push("drawRect"); }
  drawCircle() { this.calls.push('drawCircle'); }
  drawPolygon() { this.calls.push('drawPolygon'); }
  drawText() { this.calls.push('drawText'); }
  drawImage() { this.calls.push('drawImage'); }
  save() { this.calls.push('save'); }
  restore() { this.calls.push('restore'); }
  translate() { this.calls.push('translate'); }
  rotate() { this.calls.push('rotate'); }
  scale() { this.calls.push('scale'); }
  dispose() {}
}

// Mock Renderer
class MockRenderer implements Renderer {
  canRender(obj: USOMBaseObject) { return obj.type === USOMObjectType.ROOM; }
  render() {}
  dispose() {}
}

describe('RenderingEngine', () => {
  let events: EventEngine;
  let objects: ObjectEngine;
  let selection: SelectionEngine;
  let camera: CameraEngine;
  let rendering: RenderingEngine;
  let backend: MockBackend;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();
    
    objects = new ObjectEngine(events);
    await objects.initialize();
    
    selection = new SelectionEngine(events, objects);
    await selection.initialize();
    
    camera = new CameraEngine(events);
    await camera.initialize();
    
    rendering = new RenderingEngine(camera, objects, selection);
    backend = new MockBackend();
    await rendering.initialize(backend);
  });

  it('initializes correctly', () => {
    expect(rendering.name).toBe('RenderingEngine');
    expect(rendering.registry).toBeDefined();
    expect(rendering.layers).toBeDefined();
  });

  it('renders a frame correctly', () => {
    // Add mock object
    const mockObj: USOMBaseObject = {
      id: 'obj1',
      name: 'Mock Room',
      type: USOMObjectType.ROOM,
      transform: { position: { x: 10, y: 10 }, rotation: 0, scale: { x: 1, y: 1 } },
      zIndex: 0,
      isVisible: true,
      isLocked: false, isSelected: false,
      metadata: {}
    };
    
    objects._add(mockObj);
    
    // Register mock renderer
    const renderer = new MockRenderer();
    vi.spyOn(renderer, 'render');
    rendering.registry.registerRenderer(renderer);
    
    // Render
    rendering.renderFrame();
    
    // Check backend calls
    expect(backend.calls).toContain('clear');
    expect(backend.calls).toContain('save');
    expect(backend.calls).toContain('restore');
    expect(backend.calls).toContain('translate'); // For camera and object
    
    // Check renderer was called
    expect(renderer.render).toHaveBeenCalledWith(mockObj, backend, camera);
  });
  
  it('does not render invisible objects', () => {
    const mockObj: USOMBaseObject = {
      id: 'obj1',
      name: 'Mock Room',
      type: USOMObjectType.ROOM,
      transform: { position: { x: 10, y: 10 }, rotation: 0, scale: { x: 1, y: 1 } },
      zIndex: 0,
      isVisible: false,
      isLocked: false, isSelected: false,
      metadata: {}
    };
    
    objects._add(mockObj);
    
    const renderer = new MockRenderer();
    vi.spyOn(renderer, 'render');
    rendering.registry.registerRenderer(renderer);
    
    rendering.renderFrame();
    
    expect(renderer.render).not.toHaveBeenCalled();
  });
});
