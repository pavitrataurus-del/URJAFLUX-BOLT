import { describe, it, expect, beforeEach } from 'vitest';
import { GeometryEngine } from '../../geometry/GeometryEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { EventEngine } from '../../events/EventEngine';
import { CommandEngine } from '../../commands/CommandEngine';
import { ConstructionToolManager } from '../../tools/construction/ConstructionToolManager';
import { SnapEngine } from '../SnapEngine';
import { SnapMode } from '../types';

describe('SnapEngine Layer', () => {
  let geometry: GeometryEngine;
  let objects: ObjectEngine;
  let events: EventEngine;
  let commands: CommandEngine;
  let constructionManager: ConstructionToolManager;
  let snapEngine: SnapEngine;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();

    commands = new CommandEngine(events);
    await commands.initialize();

    geometry = new GeometryEngine();
    await geometry.initialize();

    objects = new ObjectEngine(events);
    await objects.initialize();

    constructionManager = new ConstructionToolManager(geometry, objects, commands);

    snapEngine = new SnapEngine(geometry, objects, {
      tolerance: 10,
      gridSpacing: 20
    });
    await snapEngine.initialize();
  });

  it('initializes with default config and snap modes enabled', () => {
    expect(snapEngine.getSnapTolerance()).toBe(10);
    expect(snapEngine.getGridSpacing()).toBe(20);
    expect(snapEngine.isSnapModeEnabled(SnapMode.ENDPOINT)).toBe(true);
    expect(snapEngine.isSnapModeEnabled(SnapMode.MIDPOINT)).toBe(true);
    expect(snapEngine.isSnapModeEnabled(SnapMode.CENTER)).toBe(true);
    expect(snapEngine.isSnapModeEnabled(SnapMode.INTERSECTION)).toBe(true);
    expect(snapEngine.isSnapModeEnabled(SnapMode.GRID)).toBe(true);
  });

  it('snaps to Grid intersections when no objects exist', () => {
    // Cursor at (18, 22) near grid point (20, 20) with grid spacing 20
    const res = snapEngine.resolveSnap({ x: 18, y: 22 });
    expect(res.snapped).toBe(true);
    expect(res.mode).toBe(SnapMode.GRID);
    expect(res.point).toEqual({ x: 20, y: 20 });
  });

  it('snaps to Line Endpoints (Endpoint Snap)', async () => {
    // Create line from (0,0) to (100,0)
    await constructionManager.lineTool.createLineBetween(
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    );

    // Cursor near start endpoint (2, 3)
    const res = snapEngine.resolveSnap({ x: 2, y: 3 });
    expect(res.snapped).toBe(true);
    expect(res.mode).toBe(SnapMode.ENDPOINT);
    expect(res.point).toEqual({ x: 0, y: 0 });
  });

  it('snaps to Line Midpoint (Midpoint Snap)', async () => {
    // Create line from (0,0) to (100,0)
    await constructionManager.lineTool.createLineBetween(
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    );

    // Cursor near midpoint (50, 0)
    const res = snapEngine.resolveSnap({ x: 48, y: 2 });
    expect(res.snapped).toBe(true);
    expect(res.mode).toBe(SnapMode.MIDPOINT);
    expect(res.point).toEqual({ x: 50, y: 0 });
  });

  it('snaps to Circle Center and Rectangle Center (Center Snap)', async () => {
    // Create Circle centered at (200, 200) with radius 50
    await constructionManager.circleTool.createCircleWithCenterAndEdge(
      { x: 200, y: 200 },
      { x: 250, y: 200 }
    );

    // Cursor near circle center (202, 198)
    const resCircle = snapEngine.resolveSnap({ x: 202, y: 198 });
    expect(resCircle.snapped).toBe(true);
    expect(resCircle.mode).toBe(SnapMode.CENTER);
    expect(resCircle.point).toEqual({ x: 200, y: 200 });

    // Create Rectangle from (0,0) to (100,100) -> Center is (50,50)
    await constructionManager.rectangleTool.createRectangleFromCorners(
      { x: 0, y: 0 },
      { x: 100, y: 100 }
    );

    // Cursor near rectangle center (49, 51)
    const resRect = snapEngine.resolveSnap({ x: 49, y: 51 });
    expect(resRect.snapped).toBe(true);
    expect(resRect.mode).toBe(SnapMode.CENTER);
    expect(resRect.point).toEqual({ x: 50, y: 50 });
  });

  it('snaps to Intersection between two lines (Intersection Snap)', async () => {
    // Horizontal line from (0, 50) to (100, 50)
    await constructionManager.lineTool.createLineBetween(
      { x: 0, y: 50 },
      { x: 100, y: 50 }
    );

    // Vertical line from (50, 0) to (50, 100)
    await constructionManager.lineTool.createLineBetween(
      { x: 50, y: 0 },
      { x: 50, y: 100 }
    );

    // Intersection is at (50, 50)
    // Cursor near intersection (51, 49)
    const res = snapEngine.resolveSnap({ x: 51, y: 49 });
    expect(res.snapped).toBe(true);
    // Endpoint vs Intersection priority
    expect(res.point).toEqual({ x: 50, y: 50 });
  });

  it('respects snap tolerance settings', async () => {
    await constructionManager.pointTool.createPointAt(100, 100);

    // Cursor at (120, 100) - distance 20 (tolerance is 10)
    let res = snapEngine.resolveSnap({ x: 120, y: 100 }, { enabledModes: { [SnapMode.GRID]: false } });
    expect(res.snapped).toBe(false);

    // Increase tolerance to 25
    snapEngine.setSnapTolerance(25);
    res = snapEngine.resolveSnap({ x: 120, y: 100 }, { enabledModes: { [SnapMode.GRID]: false } });
    expect(res.snapped).toBe(true);
    expect(res.point).toEqual({ x: 100, y: 100 });
  });

  it('respects enabled/disabled snap modes', async () => {
    await constructionManager.lineTool.createLineBetween(
      { x: 0, y: 0 },
      { x: 100, y: 0 }
    );

    // Disable Endpoint snap
    snapEngine.setSnapModeEnabled(SnapMode.ENDPOINT, false);

    // Cursor at (1, 1) near start endpoint (0,0)
    // Since Endpoint is disabled, it shouldn't snap to endpoint (0,0)
    const res = snapEngine.resolveSnap({ x: 1, y: 1 }, { enabledModes: { [SnapMode.GRID]: false } });
    expect(res.mode).not.toBe(SnapMode.ENDPOINT);
  });

  it('respects priority ranking between candidates', async () => {
    // Point at (0,0) -> Endpoint
    await constructionManager.pointTool.createPointAt(0, 0);

    // Endpoint priority is 1, Grid priority is 5
    // Cursor at (1, 1) near both Endpoint (0,0) and Grid (0,0)
    const res = snapEngine.resolveSnap({ x: 1, y: 1 });
    expect(res.snapped).toBe(true);
    expect(res.mode).toBe(SnapMode.ENDPOINT);
  });

  it('supports excludedObjectIds option during resolution', async () => {
    const ptObj = await constructionManager.pointTool.createPointAt(50, 50);

    // Cursor near point (51, 51)
    let res = snapEngine.resolveSnap({ x: 51, y: 51 }, { enabledModes: { [SnapMode.GRID]: false } });
    expect(res.snapped).toBe(true);
    expect(res.candidate?.targetObjectId).toBe(ptObj.id);

    // Exclude this point object
    res = snapEngine.resolveSnap({ x: 51, y: 51 }, { excludedObjectIds: [ptObj.id], enabledModes: { [SnapMode.GRID]: false } });
    expect(res.snapped).toBe(false);
  });
});
