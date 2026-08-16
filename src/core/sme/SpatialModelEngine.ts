import { BaseEngine } from '../types/BaseEngine';
import { GeometryEngine } from '../geometry/GeometryEngine';
import { ObjectEngine } from '../engines/ObjectEngine';
import { EventEngine } from '../events/EventEngine';
import { Point2D, Polygon } from '../geometry/types';
import { USOMBaseObject, USOMObjectType } from '../usom/types';
import { Logger } from '../utils/logger';
import {
  WallObject,
  RoomObject,
  DoorObject,
  WindowObject,
  SMEEventType,
  RoomCreatedPayload,
  WallCreatedPayload,
  DoorCreatedPayload,
  WindowCreatedPayload,
  RelationshipUpdatedPayload
} from './types';

/**
 * SpatialModelEngine (SME)
 * Converts raw construction geometry into semantic building elements.
 * Consumes ObjectEngine and GeometryEngine.
 * Does NOT perform geometry calculations itself (all math via GeometryEngine).
 * Does NOT contain Vastu rules or AI logic.
 */
export class SpatialModelEngine implements BaseEngine {
  public readonly name = 'SpatialModelEngine';
  private initialized = false;

  private walls: Map<string, WallObject> = new Map();
  private rooms: Map<string, RoomObject> = new Map();
  private doors: Map<string, DoorObject> = new Map();
  private windows: Map<string, WindowObject> = new Map();

  constructor(
    private readonly geometryEngine: GeometryEngine,
    private readonly objectEngine: ObjectEngine,
    private readonly eventEngine?: EventEngine
  ) {}

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.walls.clear();
    this.rooms.clear();
    this.doors.clear();
    this.windows.clear();
    this.initialized = true;
    Logger.info(`[${this.name}] Initialized.`);
  }

  public async shutdown(): Promise<void> {
    if (!this.initialized) return;
    this.walls.clear();
    this.rooms.clear();
    this.doors.clear();
    this.windows.clear();
    this.initialized = false;
    Logger.info(`[${this.name}] Shutdown.`);
  }

  // --- WALL CREATION & MANAGEMENT ---

  public createWall(
    startPoint: Point2D,
    endPoint: Point2D,
    thickness = 10,
    name?: string
  ): WallObject {
    this.ensureInitialized();

    if (thickness <= 0) {
      throw new Error(`Invalid wall thickness: ${thickness}. Thickness must be positive.`);
    }

    const length = this.geometryEngine.distancePointToPoint(startPoint, endPoint);
    if (length <= 0) {
      throw new Error(`Invalid wall geometry. Wall length cannot be zero.`);
    }

    // Direction vector and angle calculated via GeometryEngine
    const dx = (endPoint.x - startPoint.x) / length;
    const dy = (endPoint.y - startPoint.y) / length;
    const angleRad = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    const angleDegrees = (angleRad * 180) / Math.PI;

    const midPoint = this.geometryEngine.midpointBetweenPoints(startPoint, endPoint);

    const wallId = `wall_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const wallName = name || `Wall ${this.walls.size + 1}`;

    const usomObj: USOMBaseObject = {
      id: wallId,
      type: USOMObjectType.WALL,
      name: wallName,
      transform: {
        position: midPoint,
        rotation: angleDegrees,
        scale: { x: 1, y: 1 }
      },
      metadata: {
        smeType: 'WALL',
        startPoint,
        endPoint,
        thickness,
        length,
        direction: { x: dx, y: dy, angleDegrees },
        roomIds: [],
        doorIds: [],
        windowIds: []
      },
      isVisible: true,
      isLocked: false,
      isSelected: false,
      zIndex: 10
    };

    // Register with ObjectEngine
    this.objectEngine._add(usomObj);

    const wall: WallObject = {
      id: wallId,
      name: wallName,
      startPoint,
      endPoint,
      thickness,
      length,
      direction: { x: dx, y: dy, angleDegrees },
      roomIds: [],
      doorIds: [],
      windowIds: [],
      usomObject: usomObj
    };

    this.walls.set(wallId, wall);

    this.publishEvent<WallCreatedPayload>(SMEEventType.WALL_CREATED, { wall });
    Logger.info(`[${this.name}] Created Wall ${wallId} (${wallName}), length=${length.toFixed(2)}.`);

    return wall;
  }

  public createWallFromLine(lineObj: USOMBaseObject, thickness = 10): WallObject {
    this.ensureInitialized();

    const data = lineObj.metadata?.data || {};
    let p1: Point2D | undefined;
    let p2: Point2D | undefined;

    if (data.segment) {
      p1 = data.segment.p1;
      p2 = data.segment.p2;
    } else if (data.point) {
      p1 = data.point;
      p2 = lineObj.transform.position;
    }

    if (!p1 || !p2) {
      throw new Error(`Cannot create Wall from object ${lineObj.id}: missing line segment points.`);
    }

    return this.createWall(p1, p2, thickness, `Wall from ${lineObj.name}`);
  }

  // --- ROOM CREATION & MANAGEMENT ---

  public createRoom(polygonVertices: Point2D[], name?: string): RoomObject {
    this.ensureInitialized();

    if (!polygonVertices || polygonVertices.length < 3) {
      throw new Error('Invalid room polygon. A room requires at least 3 vertices to form a closed polygon.');
    }

    const poly: Polygon = this.geometryEngine.createPolygon(polygonVertices);
    const area = this.geometryEngine.polygonArea(poly);

    if (area <= 0) {
      throw new Error('Invalid room polygon. The polygon must be closed and have positive non-zero area.');
    }

    // Calculate perimeter using GeometryEngine for every edge distance
    let perimeter = 0;
    const count = polygonVertices.length;
    for (let i = 0; i < count; i++) {
      const v1 = polygonVertices[i];
      const v2 = polygonVertices[(i + 1) % count];
      perimeter += this.geometryEngine.distancePointToPoint(v1, v2);
    }

    const center = this.geometryEngine.polygonCentroid(poly);
    const boundingBox = this.geometryEngine.boundingBoxForPolygon(poly);

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomName = name || `Room ${this.rooms.size + 1}`;

    const usomObj: USOMBaseObject = {
      id: roomId,
      type: USOMObjectType.ROOM,
      name: roomName,
      transform: {
        position: center,
        rotation: 0,
        scale: { x: 1, y: 1 }
      },
      metadata: {
        smeType: 'ROOM',
        polygon: poly,
        area,
        perimeter,
        center,
        boundingBox,
        wallIds: [],
        doorIds: [],
        windowIds: []
      },
      isVisible: true,
      isLocked: false,
      isSelected: false,
      zIndex: 5
    };

    this.objectEngine._add(usomObj);

    const room: RoomObject = {
      id: roomId,
      name: roomName,
      polygon: poly,
      area,
      perimeter,
      center,
      boundingBox,
      wallIds: [],
      doorIds: [],
      windowIds: [],
      usomObject: usomObj
    };

    this.rooms.set(roomId, room);

    this.publishEvent<RoomCreatedPayload>(SMEEventType.ROOM_CREATED, { room });
    Logger.info(`[${this.name}] Created Room ${roomId} (${roomName}), area=${area.toFixed(2)}.`);

    return room;
  }

  public createRoomFromPolygon(polyObj: USOMBaseObject, name?: string): RoomObject {
    this.ensureInitialized();

    const data = polyObj.metadata?.data || {};
    let vertices: Point2D[] | undefined;

    if (data.polygon?.vertices) {
      vertices = data.polygon.vertices;
    } else if (data.rectangle) {
      const rect = data.rectangle;
      vertices = [
        this.geometryEngine.createPoint(rect.x, rect.y),
        this.geometryEngine.createPoint(rect.x + rect.width, rect.y),
        this.geometryEngine.createPoint(rect.x + rect.width, rect.y + rect.height),
        this.geometryEngine.createPoint(rect.x, rect.y + rect.height)
      ];
    } else if (polyObj.metadata?.boundingBox) {
      const bbox = polyObj.metadata.boundingBox;
      vertices = [
        this.geometryEngine.createPoint(bbox.x, bbox.y),
        this.geometryEngine.createPoint(bbox.x + bbox.width, bbox.y),
        this.geometryEngine.createPoint(bbox.x + bbox.width, bbox.y + bbox.height),
        this.geometryEngine.createPoint(bbox.x, bbox.y + bbox.height)
      ];
    }

    if (!vertices || vertices.length < 3) {
      throw new Error(`Cannot create Room from object ${polyObj.id}: no valid closed polygon vertices found.`);
    }

    return this.createRoom(vertices, name || polyObj.name || `Room from ${polyObj.id}`);
  }

  // --- DOOR CREATION & MANAGEMENT ---

  public createDoor(
    attachedWallId: string,
    position: Point2D | number,
    width: number,
    swingDirection = 'INSIDE_LEFT',
    name?: string
  ): DoorObject {
    this.ensureInitialized();

    const wall = this.walls.get(attachedWallId);
    if (!wall) {
      throw new Error(`Cannot create door: attached Wall with id '${attachedWallId}' does not exist.`);
    }

    if (width <= 0) {
      throw new Error(`Invalid door width: ${width}. Width must be positive.`);
    }

    let doorPos: Point2D;
    if (typeof position === 'number') {
      // Offset ratio or scalar distance along wall
      const ratio = position <= 1 && position >= 0 ? position : position / wall.length;
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      doorPos = this.geometryEngine.createPoint(
        wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * clampedRatio,
        wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * clampedRatio
      );
    } else {
      doorPos = position;
    }

    const doorId = `door_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const doorName = name || `Door ${this.doors.size + 1}`;

    const usomObj: USOMBaseObject = {
      id: doorId,
      type: USOMObjectType.DOOR,
      name: doorName,
      transform: {
        position: doorPos,
        rotation: wall.direction.angleDegrees,
        scale: { x: 1, y: 1 }
      },
      metadata: {
        smeType: 'DOOR',
        attachedWallId,
        width,
        position: doorPos,
        swingDirection
      },
      isVisible: true,
      isLocked: false,
      isSelected: false,
      zIndex: 15
    };

    this.objectEngine._add(usomObj);

    const door: DoorObject = {
      id: doorId,
      name: doorName,
      attachedWallId,
      width,
      position: doorPos,
      swingDirection,
      usomObject: usomObj
    };

    this.doors.set(doorId, door);

    // Sync relationship on attached wall
    if (!wall.doorIds.includes(doorId)) {
      wall.doorIds.push(doorId);
      wall.usomObject.metadata.doorIds = [...wall.doorIds];
    }

    this.publishEvent<DoorCreatedPayload>(SMEEventType.DOOR_CREATED, { door });
    this.publishEvent<RelationshipUpdatedPayload>(SMEEventType.RELATIONSHIP_UPDATED, {
      type: 'DOOR_WALL',
      sourceId: doorId,
      targetId: attachedWallId,
      action: 'ASSIGN'
    });

    Logger.info(`[${this.name}] Created Door ${doorId} on Wall ${attachedWallId}.`);

    return door;
  }

  public createDoorOnWall(
    wallId: string,
    position: Point2D | number,
    width: number,
    swingDirection?: string
  ): DoorObject {
    return this.createDoor(wallId, position, width, swingDirection);
  }

  // --- WINDOW CREATION & MANAGEMENT ---

  public createWindow(
    attachedWallId: string,
    position: Point2D | number,
    width: number,
    name?: string
  ): WindowObject {
    this.ensureInitialized();

    const wall = this.walls.get(attachedWallId);
    if (!wall) {
      throw new Error(`Cannot create window: attached Wall with id '${attachedWallId}' does not exist.`);
    }

    if (width <= 0) {
      throw new Error(`Invalid window width: ${width}. Width must be positive.`);
    }

    let winPos: Point2D;
    if (typeof position === 'number') {
      const ratio = position <= 1 && position >= 0 ? position : position / wall.length;
      const clampedRatio = Math.max(0, Math.min(1, ratio));
      winPos = this.geometryEngine.createPoint(
        wall.startPoint.x + (wall.endPoint.x - wall.startPoint.x) * clampedRatio,
        wall.startPoint.y + (wall.endPoint.y - wall.startPoint.y) * clampedRatio
      );
    } else {
      winPos = position;
    }

    const windowId = `window_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const windowName = name || `Window ${this.windows.size + 1}`;

    const usomObj: USOMBaseObject = {
      id: windowId,
      type: USOMObjectType.WINDOW,
      name: windowName,
      transform: {
        position: winPos,
        rotation: wall.direction.angleDegrees,
        scale: { x: 1, y: 1 }
      },
      metadata: {
        smeType: 'WINDOW',
        attachedWallId,
        width,
        position: winPos
      },
      isVisible: true,
      isLocked: false,
      isSelected: false,
      zIndex: 15
    };

    this.objectEngine._add(usomObj);

    const windowObj: WindowObject = {
      id: windowId,
      name: windowName,
      attachedWallId,
      width,
      position: winPos,
      usomObject: usomObj
    };

    this.windows.set(windowId, windowObj);

    // Sync relationship on attached wall
    if (!wall.windowIds.includes(windowId)) {
      wall.windowIds.push(windowId);
      wall.usomObject.metadata.windowIds = [...wall.windowIds];
    }

    this.publishEvent<WindowCreatedPayload>(SMEEventType.WINDOW_CREATED, { window: windowObj });
    this.publishEvent<RelationshipUpdatedPayload>(SMEEventType.RELATIONSHIP_UPDATED, {
      type: 'WINDOW_WALL',
      sourceId: windowId,
      targetId: attachedWallId,
      action: 'ASSIGN'
    });

    Logger.info(`[${this.name}] Created Window ${windowId} on Wall ${attachedWallId}.`);

    return windowObj;
  }

  public createWindowOnWall(
    wallId: string,
    position: Point2D | number,
    width: number
  ): WindowObject {
    return this.createWindow(wallId, position, width);
  }

  // --- RELATIONSHIP MANAGEMENT ---

  public assignWallToRoom(wallId: string, roomId: string): void {
    this.ensureInitialized();

    const wall = this.walls.get(wallId);
    if (!wall) {
      throw new Error(`Cannot assign wall: Wall '${wallId}' does not exist.`);
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Cannot assign wall to room: Room '${roomId}' does not exist.`);
    }

    if (!room.wallIds.includes(wallId)) {
      room.wallIds.push(wallId);
      room.usomObject.metadata.wallIds = [...room.wallIds];
    }

    if (!wall.roomIds.includes(roomId)) {
      wall.roomIds.push(roomId);
      wall.usomObject.metadata.roomIds = [...wall.roomIds];
    }

    // Synchronize doors/windows of wall into room
    for (const doorId of wall.doorIds) {
      const door = this.doors.get(doorId);
      if (door) {
        door.roomId = roomId;
        door.usomObject.metadata.roomId = roomId;
        if (!room.doorIds.includes(doorId)) {
          room.doorIds.push(doorId);
          room.usomObject.metadata.doorIds = [...room.doorIds];
        }
      }
    }

    for (const windowId of wall.windowIds) {
      const windowObj = this.windows.get(windowId);
      if (windowObj) {
        windowObj.roomId = roomId;
        windowObj.usomObject.metadata.roomId = roomId;
        if (!room.windowIds.includes(windowId)) {
          room.windowIds.push(windowId);
          room.usomObject.metadata.windowIds = [...room.windowIds];
        }
      }
    }

    this.publishEvent<RelationshipUpdatedPayload>(SMEEventType.RELATIONSHIP_UPDATED, {
      type: 'WALL_ROOM',
      sourceId: wallId,
      targetId: roomId,
      action: 'ASSIGN'
    });

    Logger.info(`[${this.name}] Assigned Wall ${wallId} to Room ${roomId}.`);
  }

  public assignDoorToWall(doorId: string, wallId: string): void {
    this.ensureInitialized();

    const door = this.doors.get(doorId);
    if (!door) {
      throw new Error(`Cannot assign door: Door '${doorId}' does not exist.`);
    }

    const newWall = this.walls.get(wallId);
    if (!newWall) {
      throw new Error(`Cannot assign door to wall: Wall '${wallId}' does not exist.`);
    }

    // Remove from old wall if changed
    if (door.attachedWallId && door.attachedWallId !== wallId) {
      const oldWall = this.walls.get(door.attachedWallId);
      if (oldWall) {
        oldWall.doorIds = oldWall.doorIds.filter((id) => id !== doorId);
        oldWall.usomObject.metadata.doorIds = [...oldWall.doorIds];
      }
    }

    door.attachedWallId = wallId;
    door.usomObject.metadata.attachedWallId = wallId;

    if (!newWall.doorIds.includes(doorId)) {
      newWall.doorIds.push(doorId);
      newWall.usomObject.metadata.doorIds = [...newWall.doorIds];
    }

    this.publishEvent<RelationshipUpdatedPayload>(SMEEventType.RELATIONSHIP_UPDATED, {
      type: 'DOOR_WALL',
      sourceId: doorId,
      targetId: wallId,
      action: 'ASSIGN'
    });

    Logger.info(`[${this.name}] Assigned Door ${doorId} to Wall ${wallId}.`);
  }

  public assignWindowToWall(windowId: string, wallId: string): void {
    this.ensureInitialized();

    const windowObj = this.windows.get(windowId);
    if (!windowObj) {
      throw new Error(`Cannot assign window: Window '${windowId}' does not exist.`);
    }

    const newWall = this.walls.get(wallId);
    if (!newWall) {
      throw new Error(`Cannot assign window to wall: Wall '${wallId}' does not exist.`);
    }

    if (windowObj.attachedWallId && windowObj.attachedWallId !== wallId) {
      const oldWall = this.walls.get(windowObj.attachedWallId);
      if (oldWall) {
        oldWall.windowIds = oldWall.windowIds.filter((id) => id !== windowId);
        oldWall.usomObject.metadata.windowIds = [...oldWall.windowIds];
      }
    }

    windowObj.attachedWallId = wallId;
    windowObj.usomObject.metadata.attachedWallId = wallId;

    if (!newWall.windowIds.includes(windowId)) {
      newWall.windowIds.push(windowId);
      newWall.usomObject.metadata.windowIds = [...newWall.windowIds];
    }

    this.publishEvent<RelationshipUpdatedPayload>(SMEEventType.RELATIONSHIP_UPDATED, {
      type: 'WINDOW_WALL',
      sourceId: windowId,
      targetId: wallId,
      action: 'ASSIGN'
    });

    Logger.info(`[${this.name}] Assigned Window ${windowId} to Wall ${wallId}.`);
  }

  // --- QUERY & GETTER METHODS ---

  public getWall(id: string): WallObject | null {
    return this.walls.get(id) || null;
  }

  public getRoom(id: string): RoomObject | null {
    return this.rooms.get(id) || null;
  }

  public getDoor(id: string): DoorObject | null {
    return this.doors.get(id) || null;
  }

  public getWindow(id: string): WindowObject | null {
    return this.windows.get(id) || null;
  }

  public getAllWalls(): WallObject[] {
    return Array.from(this.walls.values());
  }

  public getAllRooms(): RoomObject[] {
    return Array.from(this.rooms.values());
  }

  public getAllDoors(): DoorObject[] {
    return Array.from(this.doors.values());
  }

  public getAllWindows(): WindowObject[] {
    return Array.from(this.windows.values());
  }

  public getRoomArea(roomId: string): number {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room '${roomId}' not found.`);
    }
    return room.area;
  }

  public getRoomCenter(roomId: string): Point2D {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room '${roomId}' not found.`);
    }
    return room.center;
  }

  public getConnectedWalls(id: string): WallObject[] {
    // If id belongs to a room
    const room = this.rooms.get(id);
    if (room) {
      return room.wallIds
        .map((wId) => this.walls.get(wId))
        .filter((w): w is WallObject => w !== undefined);
    }

    // If id belongs to a wall
    const wall = this.walls.get(id);
    if (wall) {
      const connectedRooms = wall.roomIds
        .map((rId) => this.rooms.get(rId))
        .filter((r): r is RoomObject => r !== undefined);

      const wallSet = new Set<WallObject>();
      for (const r of connectedRooms) {
        for (const wId of r.wallIds) {
          if (wId !== id && this.walls.has(wId)) {
            wallSet.add(this.walls.get(wId)!);
          }
        }
      }
      return Array.from(wallSet);
    }

    return [];
  }

  public getConnectedRooms(wallId: string): RoomObject[] {
    const wall = this.walls.get(wallId);
    if (!wall) return [];

    return wall.roomIds
      .map((rId) => this.rooms.get(rId))
      .filter((r): r is RoomObject => r !== undefined);
  }

  public getWallDoors(wallId: string): DoorObject[] {
    const wall = this.walls.get(wallId);
    if (!wall) return [];

    return wall.doorIds
      .map((dId) => this.doors.get(dId))
      .filter((d): d is DoorObject => d !== undefined);
  }

  public getWallWindows(wallId: string): WindowObject[] {
    const wall = this.walls.get(wallId);
    if (!wall) return [];

    return wall.windowIds
      .map((wId) => this.windows.get(wId))
      .filter((w): w is WindowObject => w !== undefined);
  }

  public getRoomDoors(roomId: string): DoorObject[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.doorIds
      .map((dId) => this.doors.get(dId))
      .filter((d): d is DoorObject => d !== undefined);
  }

  public getRoomWindows(roomId: string): WindowObject[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return room.windowIds
      .map((wId) => this.windows.get(wId))
      .filter((w): w is WindowObject => w !== undefined);
  }

  // --- PRIVATE HELPER METHODS ---

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`[${this.name}] Engine must be initialized before operation.`);
    }
  }

  private publishEvent<T>(type: SMEEventType, payload: T): void {
    if (this.eventEngine) {
      this.eventEngine.publish({
        type,
        payload,
        timestamp: Date.now(),
        source: this.name
      });
    }
  }
}
