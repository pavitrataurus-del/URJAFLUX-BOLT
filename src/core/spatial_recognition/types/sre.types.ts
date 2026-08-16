// ============================================================================
// URJAFLUX AI OS - SPATIAL RECOGNITION ENGINE V2 (SRE v2)
// Production-Grade Spatial Context Model & Output Contracts
// ============================================================================

import { ISpatialContextData } from "../../knowledge_intelligence/types/kie.types";
export * from "./sre.v3.types";

export type Vastu16Zone = 
  | 'NORTH' | 'NNE' | 'NE' | 'ENE'
  | 'EAST' | 'ESE' | 'SE' | 'SSE'
  | 'SOUTH' | 'SSW' | 'SW' | 'WSW'
  | 'WEST' | 'WNW' | 'NW' | 'NNW'
  | 'BRAHMASTHAN';

export type Vastu32Pada = 
  | 'N1_SHIKHI' | 'N2_PARJANYA' | 'N3_JAYANTA' | 'N4_INDRA'
  | 'N5_SURYA' | 'N6_SATYA' | 'N7_BHRISHA' | 'N8_ANTARIKSHA'
  | 'E1_ANILA' | 'E2_PUSHA' | 'E3_VITATHA' | 'E4_GRIHAKSHATA'
  | 'E5_YAMA' | 'E6_GANDHARVA' | 'E7_BHRINGARAJA' | 'E8_MRIGA'
  | 'S1_PITRI' | 'S2_DAUVARIKA' | 'S3_SUGRIVA' | 'S4_PUSHPADANTA'
  | 'S5_VARUNA' | 'S6_ASURA' | 'S7_SHOSHA' | 'S8_PAPA'
  | 'W1_ROGA' | 'W2_NAGA' | 'W3_MUKHYA' | 'W4_BHALLATA'
  | 'W5_SOMA' | 'W6_BHUJANGA' | 'W7_ADITI' | 'W8_DITI';

export interface IPoint2D {
  x: number;
  y: number;
}

export interface IBoundingBox2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface IDimensions3D {
  width: number;
  length: number;
  height?: number;
  unit: 'METERS' | 'FEET' | 'MILLIMETERS';
}

// ----------------------------------------------------------------------------
// Founder Correction 2: Mathematical Room Polygon
// ----------------------------------------------------------------------------
export interface ISreZoneIntersection {
  zone: Vastu16Zone;
  percentage: number; // e.g., 68.5%
  areaSqMeters: number;
}

export interface ISreRoomPolygon {
  roomId: string;
  roomType: string; // e.g., 'KITCHEN', 'MASTER_BEDROOM', 'LIVING_ROOM'
  customName?: string;
  vertices: IPoint2D[];
  boundingBox: IBoundingBox2D;
  centroid: IPoint2D;
  areaSqMeters: number;
  perimeterMeters: number;
  rotationDegrees: number;
  confidence: number;
  primaryZone: Vastu16Zone;
  secondaryZone?: Vastu16Zone;
  zoneIntersections: ISreZoneIntersection[];
  associatedWallIds: string[];
  associatedDoorIds: string[];
  associatedWindowIds: string[];
  associatedObjectIds: string[];
}

// ----------------------------------------------------------------------------
// Founder Correction 3 & 7: Independent Architectural Spatial Objects & Coordinates
// ----------------------------------------------------------------------------
export interface ISreSpatialCoordinates {
  absolute: IPoint2D;
  relativeToRoomCentroid: IPoint2D;
  relativeToBrahmasthan: IPoint2D;
}

export interface ISreSpatialDistances {
  distanceFromBrahmasthanMeters: number;
  distanceFromNearestWallMeters: number;
  distanceFromNearestDoorMeters: number;
  distanceFromNearestWindowMeters: number;
  nearestZoneBoundaryDistanceMeters: number;
  nearestZoneBoundaryAngleDegrees: number;
}

export interface ISreSpatialObject {
  objectId: string;
  objectType: string; // e.g., 'GAS_STOVE', 'SINK', 'BED', 'TOILET_SEAT', 'DINING_TABLE', 'TEMPLE'
  displayName: string;
  boundingBox: IBoundingBox2D;
  centerPoint: IPoint2D;
  rotationDegrees: number;
  dimensions: IDimensions3D;
  confidence: number;
  roomId: string;
  primaryZone: Vastu16Zone;
  secondaryZone?: Vastu16Zone;
  pada?: Vastu32Pada | string;
  coordinates: ISreSpatialCoordinates;
  distances: ISreSpatialDistances;
  isLoadBearing?: boolean;
  elementCategory?: string;
}

// ----------------------------------------------------------------------------
// Founder Correction 4: Zone Allocation Schema
// ----------------------------------------------------------------------------
export interface ISreZoneAllocation {
  zone: Vastu16Zone;
  angleRangeDegrees: { start: number; end: number };
  centerAngleDegrees: number;
  totalZoneAreaSqMeters: number;
  occupiedAreaSqMeters: number;
  occupyingRoomIds: string[];
  occupyingObjectIds: string[];
  element: 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'SPACE';
  governingDeityOrAttribute: string;
}

// ----------------------------------------------------------------------------
// Founder Correction 6: Spatial Relationship
// ----------------------------------------------------------------------------
export interface ISreSpatialRelationship {
  relationshipId: string;
  sourceId: string;
  targetId: string;
  relationshipType: 
    | 'BELONGS_TO_ROOM'
    | 'ADJACENT_TO_ROOM'
    | 'CONNECTED_BY_DOOR'
    | 'ATTACHED_TO_WALL'
    | 'PLACED_UPON_SURFACE'
    | 'CROSSES_ZONE_BOUNDARY';
  directionalVector: { x: number; y: number; angleDegrees: number };
  confidence: number;
  description: string;
}

// ----------------------------------------------------------------------------
// Founder Correction 8: Evidence Layer
// ----------------------------------------------------------------------------
export interface ISreEvidenceMetadata {
  detectionMethod: 'CAD_VECTOR_EXTRACTION' | 'RASTER_SEPARATION_AI' | 'CONTOUR_POLYGON_ANALYSIS' | 'HYBRID_VISION_RULE';
  detectionConfidence: number;
  recognitionAlgorithm: string;
  sourceLayer: 'BLUEPRINT_UNDERLAY' | 'OVERLAY_CHAKRA_SEPARATED' | 'VECTOR_CAD';
  imageBoundingBox: IBoundingBox2D;
  geometryValidationStatus: 'VALIDATED_CLOSED_POLYGONS' | 'PARTIALLY_CONSTRAINED' | 'MANUALLY_VERIFIED';
  ocrTextExtracted: Array<{ text: string; location: IPoint2D; confidence: number }>;
}

// ----------------------------------------------------------------------------
// Founder Correction 9: Proof of Blueprint Understanding (4 Structural Graphs)
// ----------------------------------------------------------------------------
export interface IRoomGraphNode {
  roomId: string;
  roomType: string;
  centroid: IPoint2D;
  areaSqMeters: number;
  primaryZone: Vastu16Zone;
}

export interface IRoomGraphEdge {
  sourceRoomId: string;
  targetRoomId: string;
  relationship: 'ADJACENT' | 'CONNECTED';
  sharedWallLengthMeters: number;
}

export interface ISreRoomGraph {
  nodes: IRoomGraphNode[];
  edges: IRoomGraphEdge[];
}

export interface IObjectGraphNode {
  objectId: string;
  objectType: string;
  roomId: string;
  zone: Vastu16Zone;
}

export interface IObjectGraphEdge {
  sourceObjectId: string;
  targetObjectId: string;
  relationship: 'NEAR_TO' | 'OPPOSITE_TO' | 'CONCEALED_WITHIN';
  distanceMeters: number;
}

export interface ISreObjectGraph {
  nodes: IObjectGraphNode[];
  edges: IObjectGraphEdge[];
}

export interface IConnectivityNode {
  entityId: string;
  entityType: 'ROOM' | 'DOOR' | 'PASSAGE' | 'ENTRANCE';
  name: string;
}

export interface IConnectivityEdge {
  fromEntityId: string;
  toEntityId: string;
  accessType: 'DIRECT_DOOR' | 'OPEN_THRESHOLD' | 'STAIRCASE';
}

export interface ISreConnectivityGraph {
  nodes: IConnectivityNode[];
  edges: IConnectivityEdge[];
}

export interface IGeometryNode {
  polygonId: string;
  vertexCount: number;
  isClosed: boolean;
  centroid: IPoint2D;
}

export interface IGeometryEdge {
  polygonAId: string;
  polygonBId: string;
  intersectionType: 'DISJOINT' | 'TOUCHING_EDGE' | 'OVERLAPPING' | 'CONTAINED';
  intersectionAreaSqMeters: number;
}

export interface ISreGeometryGraph {
  nodes: IGeometryNode[];
  edges: IGeometryEdge[];
}

export interface ISreGraphs {
  roomGraph: ISreRoomGraph;
  objectGraph: ISreObjectGraph;
  connectivityGraph: ISreConnectivityGraph;
  geometryGraph: ISreGeometryGraph;
}

export interface ISreProofOfUnderstanding {
  isProofValid: boolean;
  totalRoomsRecognized: number;
  totalObjectsRecognized: number;
  totalClosedPolygons: number;
  geometryValidationStatus: string;
  understandingTimestamp: string;
}

// ----------------------------------------------------------------------------
// Founder Correction 1 & 5: Complete Primary Spatial Context JSON Model
// ----------------------------------------------------------------------------
export interface ISpatialContextModel {
  propertyId: string;
  propertyName: string;
  timestamp: string;
  version: '2.0.0-PRODUCTION-GRADE' | '3.0.0-PRODUCTION-GRADE-VISION' | string;
  
  propertyGeometry: {
    outerBoundary: IPoint2D[];
    boundingBox: IBoundingBox2D;
    totalAreaSqMeters: number;
    brahmasthanCentroid: IPoint2D;
    brahmasthanPolygon: IPoint2D[];
    northOrientationDegrees: number; // e.g. -28° or 332°
  };

  rooms: ISreRoomPolygon[];
  objects: ISreSpatialObject[];
  zones: ISreZoneAllocation[];
  relationships: ISreSpatialRelationship[];
  graphs: ISreGraphs;
  evidence: ISreEvidenceMetadata;
  proofOfUnderstanding: ISreProofOfUnderstanding;
}

/**
 * Utility function contract to bridge SRE v2 Spatial Context Model to legacy downstream ISpatialContextData
 */
export function convertSreModelToSpatialContextData(model: ISpatialContextModel): ISpatialContextData {
  const primaryRoom = model.rooms[0];
  const primaryObject = model.objects[0];

  const objectIntelligenceData: Record<string, any> = {};
  model.objects.forEach(obj => {
    objectIntelligenceData[obj.objectId] = {
      type: obj.objectType,
      room: obj.roomId,
      zone: obj.primaryZone,
      distances: obj.distances,
      coordinates: obj.coordinates
    };
  });

  return {
    roomType: primaryRoom ? primaryRoom.roomType : 'GENERAL_LAYOUT',
    objectType: primaryObject ? primaryObject.objectType : undefined,
    direction: primaryRoom ? primaryRoom.primaryZone : 'NORTH',
    zone: primaryRoom ? primaryRoom.primaryZone : 'NORTH',
    element: primaryRoom?.primaryZone === 'SE' ? 'FIRE' : primaryRoom?.primaryZone === 'NE' ? 'WATER' : 'EARTH',
    measurements: {
      length: Math.sqrt(model.propertyGeometry.totalAreaSqMeters),
      width: Math.sqrt(model.propertyGeometry.totalAreaSqMeters),
      area: model.propertyGeometry.totalAreaSqMeters,
      unit: 'METERS'
    },
    adjacency: model.graphs.roomGraph.edges.map(e => `${e.sourceRoomId}->${e.targetRoomId}`),
    blueprintObjectRelationships: model.relationships.map(rel => ({
      objectId: rel.sourceId,
      relatedObjectId: rel.targetId,
      relationType: rel.relationshipType
    })),
    objectIntelligenceData,
    metadata: {
      sreVersion: model.version,
      propertyId: model.propertyId,
      northAngle: model.propertyGeometry.northOrientationDegrees,
      brahmasthan: model.propertyGeometry.brahmasthanCentroid,
      proofValid: model.proofOfUnderstanding.isProofValid,
      fullSpatialModel: model
    }
  };
}
