import { Point2D } from "../../types/aiVision";

export interface RoomNode {
  id: string;
  name: string;
  centroid: Point2D;
  area: number; // in square meters
  polygon: Point2D[];
  adjacencies: string[]; // room IDs that are adjacent
}

export interface RoomGraph {
  rooms: RoomNode[];
  adjacencyList: Record<string, string[]>; // Map room ID -> adjacent room IDs
}

export interface WallSegment {
  id: string;
  startPoint: Point2D;
  endPoint: Point2D;
  thickness: number; // in pixels or meters
  type: "exterior" | "interior";
  connectedRooms: string[]; // room IDs
}

export interface WallGraph {
  walls: WallSegment[];
}

export interface DoorNode {
  id: string;
  wallReferenceId?: string; // ID of the wall segment it sits on
  roomConnections: string[]; // room IDs that this door connects
  center: Point2D;
  width: number;
  swingDirection: string; // e.g., "inward-left", "outward-right", etc.
  isOpen: boolean;
}

export interface DoorGraph {
  doors: DoorNode[];
}

export interface WindowNode {
  id: string;
  wallReferenceId?: string; // ID of the wall segment it sits on
  center: Point2D;
  width: number;
  orientation: number; // angle in degrees
}

export interface WindowGraph {
  windows: WindowNode[];
}

export interface CompassGeometry {
  normalizedNorth: Point2D; // Normalized 2D vector pointing North
  northAngle: number; // Angle in degrees relative to canvas up (0 deg)
  globalRotationMatrix: [
    [number, number],
    [number, number]
  ]; // 2x2 rotation matrix to orient the geometry with North pointing up
}

export interface ScaleGeometry {
  pixelToMeterConversion: number; // scale ratio: meters per pixel
  pixelsPerUnit: number; // pixels representing 1 scale unit (e.g., 1 meter)
  isScaleLocked: boolean;
}

export interface BoundaryPoint {
  x: number;
  y: number;
}

export interface SpatialModel {
  roomGraph: RoomGraph;
  wallGraph: WallGraph;
  doorGraph: DoorGraph;
  windowGraph: WindowGraph;
  compassGeometry: CompassGeometry;
  scaleGeometry: ScaleGeometry;
  buildingBoundary: BoundaryPoint[];
  propertyBoundary: BoundaryPoint[];
}
