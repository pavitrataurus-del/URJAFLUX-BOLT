export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'FIELD_ENGINEER' | 'END_USER';

export type MeasurementUnit = 'mm' | 'cm' | 'm' | 'ft' | 'inch';

export type EntityStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'VALIDATED';

export type Direction8Zone = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'BRAHMASTHAN';

export type LayerType =
  | 'WALLS'
  | 'ROOMS'
  | 'DOORS'
  | 'WINDOWS'
  | 'STAIRS'
  | 'STRUCTURAL'
  | 'FURNITURE'
  | 'GRID'
  | 'DIMENSIONS'
  | 'ANNOTATIONS';

export interface AuditRecord {
  createdBy: string;
  updatedBy: string;
  changeLog: string[];
}

export interface Coordinate {
  x: number;
  y: number;
  z?: number;
}

export interface Dimension {
  width: number;
  length: number;
  height?: number;
  unit: MeasurementUnit;
}

export interface Boundary {
  points: Coordinate[];
  isClosed: boolean;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface Orientation {
  northAngleDegrees: number; // 0° = Grid Top is True North
  magneticDeclination: number;
  gridRotation: number;
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  isVisible: boolean;
  isLocked: boolean;
  colorHex: string;
  opacity: number;
}

export interface BaseSpatialEntity {
  id: string; // Permanent Spatial UUID or ID
  version: number;
  name: string;
  metadata: Record<string, any>;
  owner: string;
  status: EntityStatus;
  audit: AuditRecord;
  createdAt: string;
  updatedAt: string;
}

export interface Room extends BaseSpatialEntity {
  floorId: string;
  roomType: string; // e.g. 'Living', 'Master Bedroom', 'Kitchen', 'Foyer', 'Bathroom'
  boundary: Boundary;
  areaSqMeters: number;
  perimeterMeters: number;
  centroid: Coordinate;
  cardinalDirection: Direction8Zone;
  connectedDoorIds: string[];
  connectedWindowIds: string[];
  adjacentRoomIds: string[];
}

export interface Wall extends BaseSpatialEntity {
  floorId: string;
  startPoint: Coordinate;
  endPoint: Coordinate;
  thicknessMm: number;
  heightMeters: number;
  lengthMeters: number;
  isLoadBearing: boolean;
  isExternal: boolean;
  cardinalDirection: Direction8Zone;
  openingIds: string[]; // Door or Window IDs breaking this wall
}

export interface Door extends BaseSpatialEntity {
  wallId: string;
  location: Coordinate;
  widthMeters: number;
  heightMeters: number;
  swingDirection: 'INWARD_LEFT' | 'INWARD_RIGHT' | 'OUTWARD_LEFT' | 'OUTWARD_RIGHT' | 'SLIDING';
  connectsRoomIds: [string, string] | [string];
  cardinalDirection: Direction8Zone;
}

export interface Window extends BaseSpatialEntity {
  wallId: string;
  location: Coordinate;
  widthMeters: number;
  heightMeters: number;
  sillHeightMeters: number;
  cardinalDirection: Direction8Zone;
  connectsRoomIds?: string[];
}

export interface Stair extends BaseSpatialEntity {
  floorId: string;
  boundary: Boundary;
  riserCount: number;
  stepWidthMeters: number;
  directionUp: Direction8Zone;
  connectsToFloorId?: string;
}

export interface Column extends BaseSpatialEntity {
  floorId: string;
  location: Coordinate;
  widthMeters: number;
  depthMeters: number;
  isLoadBearing: boolean;
}

export interface Beam extends BaseSpatialEntity {
  floorId: string;
  startPoint: Coordinate;
  endPoint: Coordinate;
  depthMeters: number;
}

export interface Balcony extends BaseSpatialEntity {
  floorId: string;
  boundary: Boundary;
  areaSqMeters: number;
  cardinalDirection: Direction8Zone;
}

export interface Void extends BaseSpatialEntity {
  floorId: string;
  boundary: Boundary;
  areaSqMeters: number;
}

export interface FurniturePlaceholder extends BaseSpatialEntity {
  roomId: string;
  itemCategory: string; // e.g. 'Bed', 'Desk', 'Stove', 'Sofa'
  boundary: Boundary;
  center: Coordinate;
  cardinalDirection: Direction8Zone;
}

export interface SpatialObject {
  id: string;
  type: 'ROOM' | 'WALL' | 'DOOR' | 'WINDOW' | 'STAIR' | 'COLUMN' | 'BEAM' | 'BALCONY' | 'VOID' | 'FURNITURE';
  entityId: string;
  name: string;
  layerType: LayerType;
  coordinate: Coordinate;
  cardinalDirection: Direction8Zone;
  metadata?: Record<string, any>;
}

export interface Grid {
  majorSpacingMeters: number;
  minorSpacingMeters: number;
  isSnapToGrid: boolean;
  isGridVisible: boolean;
  origin: Coordinate;
}

export interface FloorPlan extends BaseSpatialEntity {
  buildingId: string;
  floorNumber: number;
  floorName: string; // e.g., 'Ground Floor', 'First Floor'
  fileFormat: 'PDF' | 'PNG' | 'JPG' | 'SVG' | 'DXF' | 'DWG' | 'IFC' | 'JSON';
  sourceFileUrl?: string;
  scalePixelsPerMeter: number;
  unit: MeasurementUnit;
  orientation: Orientation;
  grid: Grid;
  layers: Layer[];
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  stairs: Stair[];
  columns: Column[];
  beams: Beam[];
  balconies: Balcony[];
  voids: Void[];
  furniture: FurniturePlaceholder[];
  totalAreaSqMeters: number;
  outerBoundary: Boundary;
}

export interface Building extends BaseSpatialEntity {
  code: string;
  address: string;
  floorsCount: number;
  floorPlans: FloorPlan[];
  siteBoundary: Boundary;
  overallDimensions: Dimension;
}

export interface GeometryValidationResult {
  isValid: boolean;
  validationTimestamp: string;
  errors: {
    code: string;
    message: string;
    objectId?: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
  }[];
  warnings: {
    code: string;
    message: string;
    objectId?: string;
  }[];
  metrics: {
    totalRooms: number;
    closedPolygons: number;
    openPolygons: number;
    totalWallLengthMeters: number;
    unconnectedWallsCount: number;
    duplicateObjectsCount: number;
  };
}

export interface TopologyGraph {
  nodes: { id: string; name: string; type: string; direction: Direction8Zone }[];
  edges: { source: string; target: string; relationship: 'ADJACENT' | 'CONNECTED_DOOR' | 'CONTAINS' }[];
}
