import { Point2D, Polygon, BoundingBox } from '../geometry/types';
import { USOMBaseObject } from '../usom/types';

export interface WallObject {
  id: string;
  name: string;
  startPoint: Point2D;
  endPoint: Point2D;
  thickness: number;
  length: number;
  direction: {
    x: number;
    y: number;
    angleDegrees: number;
  };
  roomIds: string[];
  doorIds: string[];
  windowIds: string[];
  usomObject: USOMBaseObject;
}

export interface RoomObject {
  id: string;
  name: string;
  polygon: Polygon;
  area: number;
  perimeter: number;
  center: Point2D;
  boundingBox: BoundingBox;
  wallIds: string[];
  doorIds: string[];
  windowIds: string[];
  usomObject: USOMBaseObject;
}

export interface DoorObject {
  id: string;
  name: string;
  attachedWallId: string;
  width: number;
  position: Point2D;
  swingDirection?: string;
  roomId?: string;
  usomObject: USOMBaseObject;
}

export interface WindowObject {
  id: string;
  name: string;
  attachedWallId: string;
  width: number;
  position: Point2D;
  roomId?: string;
  usomObject: USOMBaseObject;
}

export enum SMEEventType {
  ROOM_CREATED = 'sme:room:created',
  WALL_CREATED = 'sme:wall:created',
  DOOR_CREATED = 'sme:door:created',
  WINDOW_CREATED = 'sme:window:created',
  RELATIONSHIP_UPDATED = 'sme:relationship:updated'
}

export interface RoomCreatedPayload {
  room: RoomObject;
}

export interface WallCreatedPayload {
  wall: WallObject;
}

export interface DoorCreatedPayload {
  door: DoorObject;
}

export interface WindowCreatedPayload {
  window: WindowObject;
}

export interface RelationshipUpdatedPayload {
  type: 'WALL_ROOM' | 'DOOR_WALL' | 'WINDOW_WALL';
  sourceId: string;
  targetId: string;
  action: 'ASSIGN' | 'REMOVE';
}
