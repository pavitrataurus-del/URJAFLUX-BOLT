import { Point2D, Polygon2D, Sector2D } from '../spatial/math';

/**
 * Universal Spatial Object Model (USOM)
 * Base Types
 */

export type USOMId = string;

export enum USOMObjectType {
  CHAKRA = 'CHAKRA',
  DEVTA = 'DEVTA',
  ZONES = 'ZONES',
  ENTRANCE = 'ENTRANCE',
  PANCHATATTVA = 'PANCHATATTVA',
  ROOM = 'ROOM',
  DOOR = 'DOOR',
  WINDOW = 'WINDOW',
  CUSTOM_ANNOTATION = 'CUSTOM_ANNOTATION',
  CAD_ELEMENT = 'CAD_ELEMENT',
  CONSTRUCTION_ELEMENT = 'CONSTRUCTION_ELEMENT',
  WALL = 'WALL'
}

export interface Size2D {
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Transform {
  position: Point2D;
  rotation: number; // in degrees
  scale: Point2D;
}

export interface USOMBaseObject {
  id: USOMId;
  type: USOMObjectType;
  name: string;
  transform: Transform;
  metadata: Record<string, any>;
  isVisible: boolean;
  isLocked: boolean;
  isSelected: boolean;
  zIndex: number;
}

// Ensure the types from spatial math are exported for USOM consumers
export type { Point2D, Polygon2D, Sector2D };
