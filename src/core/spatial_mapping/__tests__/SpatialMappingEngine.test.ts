import { describe, it, expect, beforeEach } from 'vitest';
import { GeometryEngine } from '../../geometry/GeometryEngine';
import { EventEngine } from '../../events/EventEngine';
import { SpatialMappingEngine } from '../SpatialMappingEngine';
import { SpatialMappingEventType } from '../types';
import { SpatialModelEngine } from '../../sme/SpatialModelEngine';
import { ObjectEngine } from '../../engines/ObjectEngine';

describe('SpatialMappingEngine', () => {
  let geometry: GeometryEngine;
  let events: EventEngine;
  let objects: ObjectEngine;
  let sme: SpatialModelEngine;
  let mapper: SpatialMappingEngine;

  beforeEach(async () => {
    events = new EventEngine();
    await events.initialize();

    geometry = new GeometryEngine();
    await geometry.initialize();

    objects = new ObjectEngine(events);
    await objects.initialize();

    sme = new SpatialModelEngine(geometry, objects, events);
    await sme.initialize();

    mapper = new SpatialMappingEngine(geometry, events);
    await mapper.initialize();
  });

  it('initializes and shuts down cleanly with default configuration', async () => {
    expect(mapper.getBrahmasthan()).toEqual({ x: 0, y: 0 });
    expect(mapper.getNorthOrientation()).toBe(0);
    expect(mapper.getBrahmasthanRadius()).toBe(50);
  });

  it('updates configuration and publishes config update events', () => {
    const configEvents: any[] = [];
    events.subscribe(SpatialMappingEventType.CONFIG_UPDATED, (evt) => {
      configEvents.push(evt.payload);
    });

    mapper.setBrahmasthan({ x: 100, y: 200 }, 75);
    expect(mapper.getBrahmasthan()).toEqual({ x: 100, y: 200 });
    expect(mapper.getBrahmasthanRadius()).toBe(75);

    mapper.setNorthOrientation(45);
    expect(mapper.getNorthOrientation()).toBe(45);

    expect(configEvents.length).toBeGreaterThanOrEqual(2);
  });

  describe('Point Mapping & Angle Calculations', () => {
    it('calculates bearing degrees correctly for cardinal directions from Brahmasthan (0,0)', () => {
      // Brahmasthan at (0,0), North is along -Y (screen coordinates)
      mapper.setBrahmasthan({ x: 0, y: 0 });
      mapper.setNorthOrientation(0);

      const northPoint = { x: 0, y: -100 };
      const eastPoint = { x: 100, y: 0 };
      const southPoint = { x: 0, y: 100 };
      const westPoint = { x: -100, y: 0 };

      expect(mapper.calculateBearing(northPoint)).toBeCloseTo(0, 1);
      expect(mapper.calculateBearing(eastPoint)).toBeCloseTo(90, 1);
      expect(mapper.calculateBearing(southPoint)).toBeCloseTo(180, 1);
      expect(mapper.calculateBearing(westPoint)).toBeCloseTo(270, 1);
    });

    it('respects custom north orientation angle offset', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 });
      mapper.setNorthOrientation(45); // North rotated 45° clockwise

      const topPoint = { x: 0, y: -100 };
      // Standard top point was 0°, rotated 45° north offset makes it 315°
      expect(mapper.calculateBearing(topPoint)).toBeCloseTo(315, 1);
    });

    it('maps a point inside Brahmasthan radius to Center zone and Space element', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 50);

      const centerPoint = { x: 10, y: 10 }; // distance ~ 14.14 <= 50
      const result = mapper.mapPoint(centerPoint);

      expect(result.isBrahmasthanZone).toBe(true);
      expect(result.directionName).toBe('Center (Brahmasthan)');
      expect(result.zone16.id).toBe('Center');
      expect(result.panchatattvaRegion.element).toBe('Space');
      expect(result.devtaCell45.name).toBe('Brahma');
    });

    it('maps points to 16 Vastu Zones correctly', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 10);
      mapper.setNorthOrientation(0);

      // North-East point (x: 100, y: -100) -> 45° bearing -> NE zone
      const nePoint = { x: 100, y: -100 };
      const neResult = mapper.mapPoint(nePoint);
      expect(neResult.zone16.id).toBe('NE');
      expect(neResult.panchatattvaRegion.element).toBe('Water');

      // South-East point (x: 100, y: 100) -> 135° bearing -> SE zone
      const sePoint = { x: 100, y: 100 };
      const seResult = mapper.mapPoint(sePoint);
      expect(seResult.zone16.id).toBe('SE');
      expect(seResult.panchatattvaRegion.element).toBe('Fire');

      // South-West point (x: -100, y: 100) -> 225° bearing -> SW zone
      const swPoint = { x: -100, y: 100 };
      const swResult = mapper.mapPoint(swPoint);
      expect(swResult.zone16.id).toBe('SW');
      expect(swResult.panchatattvaRegion.element).toBe('Earth');

      // North-West point (x: -100, y: -100) -> 315° bearing -> NW zone
      const nwPoint = { x: -100, y: -100 };
      const nwResult = mapper.mapPoint(nwPoint);
      expect(nwResult.zone16.id).toBe('NW');
      expect(nwResult.panchatattvaRegion.element).toBe('Space');
    });

    it('maps points to 32 Entrance Sectors correctly', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 10);
      mapper.setNorthOrientation(0);

      // East point (100, 0) -> bearing 90° -> E3 (Jayanta, start 90.0, end 101.25)
      const e3Result = mapper.mapPoint({ x: 100, y: 0 });
      expect(e3Result.entranceSector32.id).toBe('E3');
      expect(e3Result.entranceSector32.devtaName).toBe('Jayanta');
      expect(e3Result.entranceSector32.quality).toBe('FAVORABLE');

      // North main entrance point (0, -100) -> bearing 0° -> N3 (Mukhya)
      const n3Result = mapper.mapPoint({ x: 0, y: -100 });
      expect(n3Result.entranceSector32.id).toBe('N3');
      expect(n3Result.entranceSector32.devtaName).toBe('Mukhya');
      expect(n3Result.entranceSector32.quality).toBe('FAVORABLE');
    });
  });

  describe('Semantic Building Object Mapping', () => {
    it('maps RoomObject into spatial mapping result without modifying SME room', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 20);

      const room = sme.createRoom([
        { x: 100, y: -100 },
        { x: 300, y: -100 },
        { x: 300, y: -300 },
        { x: 100, y: -300 }
      ], 'Master Bedroom');

      const roomMapping = mapper.mapRoom(room);

      expect(roomMapping.objectId).toBe(room.id);
      expect(roomMapping.objectType).toBe('ROOM');
      expect(roomMapping.objectName).toBe('Master Bedroom');
      expect(roomMapping.position).toEqual({ x: 200, y: -200 }); // Centroid
      expect(roomMapping.distanceFromBrahmasthan).toBeCloseTo(282.84, 1);
      expect(roomMapping.zone16.id).toBe('NE');
    });

    it('maps WallObject into spatial mapping result using midpoint', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 20);

      const wall = sme.createWall({ x: 0, y: 100 }, { x: 200, y: 100 }, 10, 'South Wall');
      const wallMapping = mapper.mapWall(wall);

      expect(wallMapping.objectId).toBe(wall.id);
      expect(wallMapping.objectType).toBe('WALL');
      expect(wallMapping.position).toEqual({ x: 100, y: 100 });
      expect(wallMapping.zone16.id).toBe('SE');
      expect(wallMapping.panchatattvaRegion.element).toBe('Fire');
    });

    it('maps DoorObject into spatial mapping result identifying entrance sector', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 20);

      const wall = sme.createWall({ x: 0, y: -200 }, { x: 200, y: -200 }, 10);
      const door = sme.createDoor(wall.id, { x: 100, y: -200 }, 30, 'INSIDE_LEFT', 'Main Entrance Door');

      const doorMapping = mapper.mapDoor(door);

      expect(doorMapping.objectId).toBe(door.id);
      expect(doorMapping.objectType).toBe('DOOR');
      expect(doorMapping.objectName).toBe('Main Entrance Door');
      expect(doorMapping.entranceSector32.id).toBe('N5');
      expect(doorMapping.entranceSector32.quality).toBe('FAVORABLE');
    });

    it('maps WindowObject into spatial mapping result', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 20);

      const wall = sme.createWall({ x: 200, y: -100 }, { x: 200, y: 100 }, 10);
      const windowObj = sme.createWindow(wall.id, { x: 200, y: 0 }, 40, 'East Window');

      const windowMapping = mapper.mapWindow(windowObj);

      expect(windowMapping.objectId).toBe(windowObj.id);
      expect(windowMapping.objectType).toBe('WINDOW');
      expect(windowMapping.zone16.id).toBe('E');
      expect(windowMapping.entranceSector32.id).toBe('E3');
    });

    it('maps batch array of mixed building objects cleanly', () => {
      mapper.setBrahmasthan({ x: 0, y: 0 }, 20);

      const room = sme.createRoom([
        { x: 50, y: 50 },
        { x: 150, y: 50 },
        { x: 150, y: 150 },
        { x: 50, y: 150 }
      ]);
      const wall = sme.createWall({ x: 0, y: 0 }, { x: 100, y: 0 });
      const door = sme.createDoor(wall.id, 50, 30);

      const batchResults = mapper.mapObjects([room, wall, door]);

      expect(batchResults).toHaveLength(3);
      expect(batchResults[0].objectType).toBe('ROOM');
      expect(batchResults[1].objectType).toBe('WALL');
      expect(batchResults[2].objectType).toBe('DOOR');
    });
  });
});
