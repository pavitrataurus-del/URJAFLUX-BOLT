import { describe, it, expect, beforeEach } from 'vitest';
import { GeometryEngine } from '../../../geometry/GeometryEngine';
import { ObjectEngine } from '../../../engines/ObjectEngine';
import { CommandEngine } from '../../../commands/CommandEngine';
import { EventEngine } from '../../../events/EventEngine';
import { ToolEngine } from '../../ToolEngine';
import { ConstructionToolManager } from '../ConstructionToolManager';
import { USOMObjectType } from '../../../usom/types';

describe('Construction Tools Layer', () => {
  let geometry: GeometryEngine;
  let objects: ObjectEngine;
  let commands: CommandEngine;
  let events: EventEngine;
  let toolEngine: ToolEngine;
  let manager: ConstructionToolManager;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();

    commands = new CommandEngine(events);
    await commands.initialize();

    geometry = new GeometryEngine();
    await geometry.initialize();

    objects = new ObjectEngine(events);
    await objects.initialize();

    toolEngine = new ToolEngine();
    await toolEngine.initialize();

    manager = new ConstructionToolManager(geometry, objects, commands);
    manager.registerWithToolEngine(toolEngine);
  });

  it('registers all 6 construction tools with ToolEngine', () => {
    const tools = toolEngine.getAllTools();
    expect(tools.length).toBe(6);
    expect(toolEngine.getTool('construction-point')).toBeDefined();
    expect(toolEngine.getTool('construction-line')).toBeDefined();
    expect(toolEngine.getTool('construction-rectangle')).toBeDefined();
    expect(toolEngine.getTool('construction-circle')).toBeDefined();
    expect(toolEngine.getTool('construction-polygon')).toBeDefined();
    expect(toolEngine.getTool('construction-diagonal')).toBeDefined();
  });

  it('creates construction point via PointTool and supports undo/redo', async () => {
    toolEngine.setActiveTool('construction-point');
    const pointTool = manager.pointTool;

    const createdObj = await pointTool.createPointAt(100, 200);
    expect(createdObj).toBeDefined();
    expect(createdObj.type).toBe(USOMObjectType.CONSTRUCTION_ELEMENT);
    expect(createdObj.transform.position).toEqual({ x: 100, y: 200 });
    expect(objects.getAllObjects().length).toBe(1);

    // Test Undo
    await commands.undo(objects);
    expect(objects.getAllObjects().length).toBe(0);

    // Test Redo
    await commands.redo(objects);
    expect(objects.getAllObjects().length).toBe(1);
  });

  it('creates construction line via LineTool', async () => {
    toolEngine.setActiveTool('construction-line');
    const lineTool = manager.lineTool;

    // First click sets start point
    const step1 = await lineTool.handlePointInput(0, 0);
    expect(step1).toBeNull();
    expect(lineTool.getStartPoint()).toEqual({ x: 0, y: 0 });

    // Second click finishes line
    const createdObj = await lineTool.handlePointInput(10, 0);
    expect(createdObj).toBeDefined();
    expect(createdObj!.metadata.constructionType).toBe('line');
    expect(createdObj!.metadata.data.length).toBe(10);
    expect(createdObj!.transform.position).toEqual({ x: 5, y: 0 }); // Midpoint
    expect(objects.getAllObjects().length).toBe(1);
  });

  it('creates construction rectangle via RectangleTool', async () => {
    toolEngine.setActiveTool('construction-rectangle');
    const rectTool = manager.rectangleTool;

    await rectTool.handleCornerInput(0, 0);
    const createdObj = await rectTool.handleCornerInput(100, 50);

    expect(createdObj).toBeDefined();
    expect(createdObj!.metadata.constructionType).toBe('rectangle');
    expect(createdObj!.metadata.data.rectangle.width).toBe(100);
    expect(createdObj!.metadata.data.rectangle.height).toBe(50);
    expect(createdObj!.transform.position).toEqual({ x: 50, y: 25 }); // Center
    expect(objects.getAllObjects().length).toBe(1);
  });

  it('creates construction circle via CircleTool', async () => {
    toolEngine.setActiveTool('construction-circle');
    const circleTool = manager.circleTool;

    await circleTool.handleInput(50, 50); // Center
    const createdObj = await circleTool.handleInput(50, 100); // Edge (radius = 50)

    expect(createdObj).toBeDefined();
    expect(createdObj!.metadata.constructionType).toBe('circle');
    expect(createdObj!.metadata.data.circle.radius).toBe(50);
    expect(createdObj!.transform.position).toEqual({ x: 50, y: 50 });
    expect(objects.getAllObjects().length).toBe(1);
  });

  it('creates construction polygon via PolygonTool', async () => {
    toolEngine.setActiveTool('construction-polygon');
    const polyTool = manager.polygonTool;

    await polyTool.addVertexAt(0, 0);
    await polyTool.addVertexAt(10, 0);
    await polyTool.addVertexAt(10, 10);
    await polyTool.addVertexAt(0, 10);

    const createdObj = await polyTool.finishPolygon();
    expect(createdObj).toBeDefined();
    expect(createdObj!.metadata.constructionType).toBe('polygon');
    expect(createdObj!.metadata.data.area).toBe(100);
    expect(createdObj!.transform.position).toEqual({ x: 5, y: 5 }); // Centroid
    expect(objects.getAllObjects().length).toBe(1);
  });

  it('creates construction diagonal via DiagonalTool', async () => {
    toolEngine.setActiveTool('construction-diagonal');
    const diagTool = manager.diagonalTool;

    await diagTool.handleCornerSelection(0, 0);
    const createdObj = await diagTool.handleCornerSelection(3, 4);

    expect(createdObj).toBeDefined();
    expect(createdObj!.metadata.constructionType).toBe('diagonal');
    expect(createdObj!.metadata.data.length).toBe(5);
    expect(createdObj!.transform.position).toEqual({ x: 1.5, y: 2 }); // Midpoint
    expect(objects.getAllObjects().length).toBe(1);
  });

  it('unregisters tools cleanly', () => {
    manager.unregisterFromToolEngine(toolEngine);
    expect(toolEngine.getAllTools().length).toBe(0);
  });
});
