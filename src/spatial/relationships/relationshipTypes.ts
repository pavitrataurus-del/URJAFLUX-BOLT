import { Point2D } from "../../types/aiVision";

export type SpatialRelationshipType =
  | "adjacent_to"
  | "contains"
  | "connected_to"
  | "shares_wall_with"
  | "north_of"
  | "south_of"
  | "east_of"
  | "west_of"
  | "door_connects"
  | "window_faces"
  | "main_entrance_faces"
  | "relative_position";

export interface SpatialRelationshipMeta {
  reason?: string;
  wallId?: string;
  wallType?: string;
  doorId?: string;
  swingDirection?: string;
  isOpen?: boolean;
  connectorId?: string;
  connectorType?: string;
  dx?: number;
  dy?: number;
  directionVector?: Point2D;
  distance?: number;
  rawAngle?: number;
  relativeAngle?: number;
  wallReferenceId?: string;
  facingDirection?: string;
  isExterior?: boolean;
}

export interface SpatialRelationship {
  id: string;
  type: SpatialRelationshipType;
  sourceId: string;      // Room, Wall, Door, Window, etc.
  targetId: string;      // Room, Wall, Door, Window, Direction, etc.
  confidence: number;    // Semantic certainty (0.0 to 1.0)
  meta?: SpatialRelationshipMeta; // Arbitrary geometric metadata (e.g., direction vector, distance)
}

export type EngineeringZone = "North" | "South" | "East" | "West" | "Center" | "Northeast" | "Northwest" | "Southeast" | "Southwest";

export interface ZoneMapping {
  roomId: string;
  normalizedCentroid: Point2D; // Normalized coordinates scaled from (0,0) to (1,1) within bounding box
  zone: EngineeringZone;       // Normalized engineering zone
}

export interface SpatialRelationshipModel {
  relationships: SpatialRelationship[];
  zoneMappings: ZoneMapping[];
  globalCentroid: Point2D;     // Global centroid of all combined rooms
}
