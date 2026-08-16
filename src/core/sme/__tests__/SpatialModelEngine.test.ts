import { describe, it, expect, beforeEach } from 'vitest';
import { GeometryEngine } from '../../geometry/GeometryEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';
import { EventEngine } from '../../events/EventEngine';
import { CommandEngine } from '../../commands/CommandEngine';
import { ConstructionToolManager } from '../../tools/construction/ConstructionToolManager';
import { SpatialModelEngine } from '../SpatialModelEngine';
import { SMEEventType } from '../types';

describe('SpatialModelEngine (SME)', () => {
  let geometry: GeometryEngine;
  let objects: ObjectEngine;
  let events: EventEngine;
  let commands: CommandEngine;
  let constructionManager: ConstructionToolManager;
  let sme: SpatialModelEngine;

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

    sme = new SpatialModelEngine(geometry, objects, events);
    await sme.initialize();
  });

  it('initializes and shuts down cleanly', async () => {
    expect(sme.getAllWalls()).toHaveLength(0);
    expect(sme.getAllRooms()).toHaveLength(0);
    expect(sme.getAllDoors()).toHaveLength(0);
    expect(sme.getAllWindows()).toHaveLength(0);
  });

  describe('Wall Management', () => {
    it('creates a wall with valid start and end points', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 100, y: 0 };
      const wall = sme.createWall(p1, p2, 12, 'North Wall');

      expect(wall.id).toContain('wall_');
      expect(wall.name).toBe('North Wall');
      expect(wall.length).toBe(100);
      expect(wall.thickness).toBe(12);
      expect(wall.direction.x).toBe(1);
      expect(wall.direction.y).toBe(0);
      expect(sme.getWall(wall.id)).toEqual(wall);
      expect(sme.getAllWalls()).toHaveLength(1);
    });

    it('rejects wall creation with zero length', () => {
      const p1 = { x: 50, y: 50 };
      expect(() => sme.createWall(p1, p1, 10)).toThrow('Wall length cannot be zero');
    });

    it('rejects wall creation with non-positive thickness', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 100, y: 0 };
      expect(() => sme.createWall(p1, p2, 0)).toThrow('Thickness must be positive');
      expect(() => sme.createWall(p1, p2, -5)).toThrow('Thickness must be positive');
    });

    it('creates wall from raw construction line object', async () => {
      const lineObj = await constructionManager.lineTool.createLineBetween(
        { x: 0, y: 0 },
        { x: 0, y: 200 }
      );

      const wall = sme.createWallFromLine(lineObj, 15);
      expect(wall.length).toBe(200);
      expect(wall.thickness).toBe(15);
      expect(wall.direction.y).toBe(1);
    });
  });

  describe('Room Management', () => {
    it('creates a room from a closed polygon', () => {
      const vertices = [
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 150 },
        { x: 0, y: 150 }
      ];

      const room = sme.createRoom(vertices, 'Main Hall');
      expect(room.id).toContain('room_');
      expect(room.name).toBe('Main Hall');
      expect(room.area).toBe(30000);
      expect(room.perimeter).toBe(700);
      expect(room.center).toEqual({ x: 100, y: 75 });
      expect(sme.getRoomArea(room.id)).toBe(30000);
      expect(sme.getRoomCenter(room.id)).toEqual({ x: 100, y: 75 });
    });

    it('rejects room creation for open or invalid polygons', () => {
      expect(() => sme.createRoom([{ x: 0, y: 0 }, { x: 10, y: 10 }])).toThrow(
        'requires at least 3 vertices'
      );

      // Collinear points with zero area
      const collinear = [
        { x: 0, y: 0 },
        { x: 50, y: 0 },
        { x: 100, y: 0 }
      ];
      expect(() => sme.createRoom(collinear)).toThrow('positive non-zero area');
    });

    it('creates room from construction rectangle object', async () => {
      const rectObj = await constructionManager.rectangleTool.createRectangleFromCorners(
        { x: 0, y: 0 },
        { x: 100, y: 100 }
      );

      const room = sme.createRoomFromPolygon(rectObj, 'Square Room');
      expect(room.area).toBe(10000);
      expect(room.perimeter).toBe(400);
    });
  });

  describe('Door and Window Management', () => {
    it('creates door on an existing wall', () => {
      const wall = sme.createWall({ x: 0, y: 0 }, { x: 200, y: 0 }, 10);
      const door = sme.createDoor(wall.id, 50, 30, 'INSIDE_LEFT', 'Front Entrance');

      expect(door.id).toContain('door_');
      expect(door.attachedWallId).toBe(wall.id);
      expect(door.width).toBe(30);
      expect(door.position).toEqual({ x: 50, y: 0 });

      // Wall relationship synced
      expect(sme.getWallDoors(wall.id)).toContainEqual(door);
    });

    it('rejects door creation if attached wall does not exist or width <= 0', () => {
      expect(() => sme.createDoor('non_existent_wall', 50, 30)).toThrow('does not exist');

      const wall = sme.createWall({ x: 0, y: 0 }, { x: 100, y: 0 });
      expect(() => sme.createDoor(wall.id, 50, 0)).toThrow('Width must be positive');
    });

    it('creates window on an existing wall', () => {
      const wall = sme.createWall({ x: 0, y: 0 }, { x: 0, y: 200 }, 10);
      const windowObj = sme.createWindow(wall.id, 100, 40, 'Side Window');

      expect(windowObj.id).toContain('window_');
      expect(windowObj.attachedWallId).toBe(wall.id);
      expect(windowObj.width).toBe(40);
      expect(windowObj.position).toEqual({ x: 0, y: 100 });

      expect(sme.getWallWindows(wall.id)).toContainEqual(windowObj);
    });
  });

  describe('Object Relationships & Synchronization', () => {
    it('synchronizes wall and room relationships', () => {
      const w1 = sme.createWall({ x: 0, y: 0 }, { x: 200, y: 0 });
      const w2 = sme.createWall({ x: 200, y: 0 }, { x: 200, y: 200 });
      const room = sme.createRoom([
        { x: 0, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 200 },
        { x: 0, y: 200 }
      ]);

      sme.assignWallToRoom(w1.id, room.id);
      sme.assignWallToRoom(w2.id, room.id);

      expect(sme.getConnectedWalls(room.id)).toHaveLength(2);
      expect(sme.getConnectedRooms(w1.id)).toContainEqual(room);
    });

    it('propagates door and window relationships through wall assignment', () => {
      const wall = sme.createWall({ x: 0, y: 0 }, { x: 100, y: 0 });
      const door = sme.createDoor(wall.id, 50, 30);
      const windowObj = sme.createWindow(wall.id, 80, 20);

      const room = sme.createRoom([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ]);

      sme.assignWallToRoom(wall.id, room.id);

      expect(sme.getRoomDoors(room.id)).toContainEqual(door);
      expect(sme.getRoomWindows(room.id)).toContainEqual(windowObj);
    });

    it('reassigns door to a new wall cleanly', () => {
      const w1 = sme.createWall({ x: 0, y: 0 }, { x: 100, y: 0 });
      const w2 = sme.createWall({ x: 0, y: 100 }, { x: 100, y: 100 });
      const door = sme.createDoor(w1.id, 50, 30);

      sme.assignDoorToWall(door.id, w2.id);

      expect(sme.getWallDoors(w1.id)).toHaveLength(0);
      expect(sme.getWallDoors(w2.id)).toContainEqual(door);
      expect(door.attachedWallId).toBe(w2.id);
    });
  });

  describe('Event Publishing', () => {
    it('publishes events on semantic element creation and relationship update', () => {
      const publishedEvents: string[] = [];

      events.subscribe(SMEEventType.WALL_CREATED, () => { publishedEvents.push('WALL_CREATED'); });
      events.subscribe(SMEEventType.ROOM_CREATED, () => { publishedEvents.push('ROOM_CREATED'); });
      events.subscribe(SMEEventType.DOOR_CREATED, () => { publishedEvents.push('DOOR_CREATED'); });
      events.subscribe(SMEEventType.WINDOW_CREATED, () => { publishedEvents.push('WINDOW_CREATED'); });
      events.subscribe(SMEEventType.RELATIONSHIP_UPDATED, () => { publishedEvents.push('RELATIONSHIP_UPDATED'); });

      const wall = sme.createWall({ x: 0, y: 0 }, { x: 100, y: 0 });
      const room = sme.createRoom([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ]);
      sme.createDoor(wall.id, 50, 30);
      sme.createWindow(wall.id, 80, 20);
      sme.assignWallToRoom(wall.id, room.id);

      expect(publishedEvents).toContain('WALL_CREATED');
      expect(publishedEvents).toContain('ROOM_CREATED');
      expect(publishedEvents).toContain('DOOR_CREATED');
      expect(publishedEvents).toContain('WINDOW_CREATED');
      expect(publishedEvents).toContain('RELATIONSHIP_UPDATED');
    });
  });
});
