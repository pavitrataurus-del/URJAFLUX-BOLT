/**
 * ============================================================================
 *               URJAFLUX AI OS — SPRINT #30
 *             SPATIAL INTELLIGENCE ENGINE ONTOLOGY
 * ============================================================================
 * 
 * Defines the core data structures, classification models, building element registries,
 * topological relationship graphs, explainable reasoning traces, spatial validation rules,
 * vision model abstractions, and certification schemas for the URJAFLUX Spatial Intelligence Engine.
 */

export type CapabilityStatus = 
  | "Implemented" 
  | "Prototype" 
  | "Requires AI Model" 
  | "Requires External Vision Model" 
  | "Future Enhancement";

export interface SystemCapabilityDeclaration {
  id: string;
  moduleName: string;
  capabilityName: string;
  description: string;
  status: CapabilityStatus;
  externalDependency?: string;
  validationMethod: string;
}

// ============================================================================
// 1. GEOMETRY & SPATIAL CORE
// ============================================================================

export interface Point2D {
  x: number;
  y: number;
}

export interface Vector2D {
  dx: number;
  dy: number;
}

export interface BoundingBox2D {
  min: Point2D;
  max: Point2D;
}

export interface Polygon2D {
  vertices: Point2D[];
  isClosed: boolean;
  area: number; // in sq meters
  perimeter: number; // in meters
  centroid: Point2D;
}

export interface LineSegment2D {
  id: string;
  start: Point2D;
  end: Point2D;
  length: number; // in meters
  angleDegrees: number;
}

// ============================================================================
// 2. BUILDING ELEMENT REGISTRY
// ============================================================================

export type BuildingElementType = 
  | "ROOM" 
  | "WALL" 
  | "DOOR" 
  | "WINDOW" 
  | "COLUMN" 
  | "BEAM" 
  | "STAIRCASE" 
  | "BALCONY" 
  | "OPEN_SPACE" 
  | "UTILITY_AREA" 
  | "PARKING" 
  | "CORRIDOR" 
  | "TERRACE" 
  | "SERVICE_SHAFT" 
  | "BUILDING_BOUNDARY" 
  | "FURNITURE" 
  | "FIXTURE" 
  | "UTILITY";

export type RoomCategory = 
  | "LIVING" 
  | "BEDROOM" 
  | "KITCHEN" 
  | "SANITATION" 
  | "CIRCULATION" 
  | "UTILITY" 
  | "OUTDOOR" 
  | "STRUCTURAL" 
  | "UNCLASSIFIED";

export type DetectionOrigin = "Detected" | "Inferred" | "User Confirmed";

export interface BuildingElement {
  id: string;
  type: BuildingElementType;
  name: string;
  category?: RoomCategory;
  origin: DetectionOrigin;
  confidence: number; // 0.0 to 1.0
  geometry: {
    polygon?: Polygon2D;
    line?: LineSegment2D;
    center?: Point2D;
    boundingBox?: BoundingBox2D;
    thicknessMeters?: number;
    widthMeters?: number;
    heightMeters?: number;
  };
  properties: {
    material?: string;
    isLoadBearing?: boolean;
    isExterior?: boolean;
    isOpen?: boolean;
    fireRatingMinutes?: number;
    areaMeters?: number;
    perimeterMeters?: number;
    widthMeters?: number;
    customTags?: string[];
  };
  relationships: {
    parentBoundaryId?: string;
    connectedElementIds: string[];
    adjacentRoomIds: string[];
    containsElementIds: string[];
  };
  evidence: SpatialEvidence;
}

// ============================================================================
// 3. EVIDENCE & EXPLAINABLE REASONING
// ============================================================================

export interface SpatialEvidence {
  id: string;
  sourceType: "VECTOR_CAD_LINE" | "OCR_TEXT_LABEL" | "VISION_PREDICTION" | "GEOMETRIC_INFERENCE" | "HUMAN_INPUT";
  description: string;
  confidence: number;
  supportingGeometryRef?: string; // ID of vector line, OCR box, etc.
  rawScore?: number;
  timestamp: string;
}

export interface ExplainableReasoningTrace {
  id: string;
  targetElementId: string;
  targetElementName: string;
  question: "WHY_ROOM_CLASSIFIED" | "WHY_SPACE_CONNECTED" | "WHY_WALL_DETECTED" | "WHY_BOUNDARY_INFERRED";
  conclusion: string;
  evidenceChain: SpatialEvidence[];
  overallConfidence: number;
  supportingGeometry: {
    points?: Point2D[];
    lines?: LineSegment2D[];
    textMatched?: string;
  };
  timestamp: string;
}

// ============================================================================
// 4. DIRECTION & COMPASS ENGINE
// ============================================================================

export type NorthSourceType = "Manual North" | "Detected North" | "Unknown North";

export type CardinalDirection = 
  | "N" | "NNE" | "NE" | "ENE" 
  | "E" | "ESE" | "SE" | "SSE" 
  | "S" | "SSW" | "SW" | "WSW" 
  | "W" | "WNW" | "NW" | "NNW";

export interface OrientationAnalysis {
  northSource: NorthSourceType;
  northAngleDegrees: number; // 0 to 360, 0 = Up (+Y)
  cardinalZones: Record<CardinalDirection, { startAngle: number; endAngle: number }>;
  roomOrientations: Array<{
    roomId: string;
    roomName: string;
    centroid: Point2D;
    bearingDegrees: number;
    cardinalDirection: CardinalDirection;
  }>;
}

// ============================================================================
// 5. SPATIAL RELATIONSHIPS & TOPOLOGY GRAPH
// ============================================================================

export interface RoomAdjacencyEdge {
  id: string;
  roomAId: string;
  roomBId: string;
  sharedWallLengthMeters: number;
  hasDoorConnection: boolean;
  connectingDoorIds: string[];
}

export interface DoorConnectivityEdge {
  id: string;
  doorId: string;
  connectsRoomAId: string;
  connectsRoomBId: string;
  clearWidthMeters: number;
}

export interface TravelPath {
  id: string;
  startRoomId: string;
  endRoomId: string;
  routeRoomIds: string[];
  totalDistanceMeters: number;
  doorCount: number;
  isAccessible: boolean;
}

export interface SpatialGraphModel {
  nodes: Array<{
    id: string;
    name: string;
    type: BuildingElementType;
    area: number;
    centroid: Point2D;
  }>;
  adjacencies: RoomAdjacencyEdge[];
  doorConnectivities: DoorConnectivityEdge[];
  travelPaths: TravelPath[];
}

// ============================================================================
// 6. SPATIAL VALIDATION ENGINE
// ============================================================================

export type SpatialValidationErrorType = 
  | "OPEN_POLYGON" 
  | "DISCONNECTED_WALL" 
  | "IMPOSSIBLE_GEOMETRY" 
  | "DUPLICATE_ELEMENT" 
  | "LANDLOCKED_ROOM" 
  | "OVERLAPPING_ROOMS" 
  | "MISSING_BUILDING_BOUNDARY";

export interface SpatialValidationIssue {
  id: string;
  type: SpatialValidationErrorType;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  description: string;
  affectedElementIds: string[];
  suggestedFix: string;
}

export interface SpatialValidationReport {
  integrityScore: number; // 0 to 100
  isValid: boolean;
  totalIssuesCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: SpatialValidationIssue[];
  validatedAt: string;
}

// ============================================================================
// 7. AI MODEL ABSTRACTION
// ============================================================================

export interface VisionModelCapabilities {
  supportsFloorPlanSegmentation: boolean;
  supportsOCRTextRecognition: boolean;
  supportsDoorWindowDetection: boolean;
  supportsVectorOutput: boolean;
  averageLatencyMs: number;
  requiresCloudAPIKey: boolean;
}

export interface VisionModelProvider {
  id: string;
  name: string;
  version: string;
  type: "GEMINI_VISION" | "OPENAI_VISION" | "OPENCV_PIPELINE" | "YOLO_DETECTOR" | "SAM_SEGMENTER" | "CUSTOM_VISION";
  capabilities: VisionModelCapabilities;
  status: "ACTIVE" | "AVAILABLE_EXTERNAL" | "PLANNED";
  description: string;
}

// ============================================================================
// 8. HUMAN REVIEW & CORRECTION AUDIT TRAIL
// ============================================================================

export type CorrectionActionType = 
  | "ACCEPT_DETECTION" 
  | "REJECT_DETECTION" 
  | "RENAME_ROOM" 
  | "MERGE_ROOMS" 
  | "SPLIT_ROOMS" 
  | "ADJUST_GEOMETRY" 
  | "APPROVE_ANALYSIS";

export interface HumanCorrectionRecord {
  id: string;
  action: CorrectionActionType;
  performedBy: string;
  timestamp: string;
  targetElementId: string;
  previousState: any;
  newState: any;
  note?: string;
}

// ============================================================================
// 9. COMPLETE SPATIAL INTELLIGENCE ANALYSIS RESULT
// ============================================================================

export interface SpatialIntelligenceAnalysis {
  id: string;
  projectId: string;
  floorId: string;
  analyzedAt: string;
  executionTimeMs: number;
  
  elements: BuildingElement[];
  orientation: OrientationAnalysis;
  spatialGraph: SpatialGraphModel;
  reasoningTraces: ExplainableReasoningTrace[];
  validationReport: SpatialValidationReport;
  correctionsHistory: HumanCorrectionRecord[];
  
  statistics: {
    totalBuildingAreaM2: number;
    totalPerimeterMeters: number;
    roomCount: number;
    wallCount: number;
    doorCount: number;
    windowCount: number;
    columnCount: number;
    unknownElementCount: number;
    overallConfidenceScore: number;
  };
}

// ============================================================================
// 10. CANONICAL BUILDING MODEL CORE (BMC V1.0)
// ============================================================================

export interface BuildingEntityRef {
  id: string;
  label: string;
  source: string;
  confidence: number;
  polygon: Point2D[];
  centroid: Point2D;
  detectionEngine: string;
  reason: string;
  properties?: Record<string, any>;
}

export interface BuildingModelProperty {
  boundaryPolygon: Point2D[];
  centroid: Point2D;
  areaSqMeters: number;
  orientationDegrees: number;
  source: string;
  confidence: number;
  detectionEngine: string;
  reason: string;
}

export interface BuildingModelRoom extends BuildingEntityRef {
  areaSqMeters: number;
  category: string;
}

export interface BuildingModelWall extends BuildingEntityRef {
  isInterior: boolean;
  isExterior: boolean;
  thicknessMeters: number;
}

export interface BuildingModelOpening extends BuildingEntityRef {
  type: "DOOR" | "WINDOW" | "VENTILATION";
  widthMeters?: number;
}

export interface BuildingModelFixture extends BuildingEntityRef {
  fixtureType: "FURNITURE" | "WC" | "WASH_BASIN" | "KITCHEN_SINK" | "BED" | "DINING" | "OTHER";
}

export interface BuildingModelColumn extends BuildingEntityRef {
  widthMeters?: number;
  heightMeters?: number;
}

export interface BuildingModelOcrItem extends BuildingEntityRef {
  rawText: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}

export interface BuildingModelGeometry {
  north: {
    calibrationAngleDegrees: number;
    source: string;
  };
  chakra: {
    centerX: number;
    centerY: number;
    rotationDegrees: number;
    scale: number;
    aspectRatio: number;
  };
  brahmasthan: {
    polygon: Point2D[];
    centroid: Point2D;
    areaSqMeters: number;
    computedRule: "COMPUTED_STRICTLY_FROM_VASTU_CHAKRA_CENTER";
  };
  zones16: Array<{
    zoneName: string;
    startDegree: number;
    endDegree: number;
    element: string;
    rooms: string[];
    fixtures: string[];
  }>;
  zones32: Array<{
    zoneName: string;
    startDegree: number;
    endDegree: number;
    padaName: string;
    entrances: string[];
  }>;
}

export interface BuildingModelMetadata {
  version: "1.0";
  timestamp: string;
  blueprintId: string;
  blueprintName: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: string;
  approvedBy?: string;
}

export interface BuildingModel {
  property: BuildingModelProperty;
  rooms: BuildingModelRoom[];
  walls: BuildingModelWall[];
  openings: BuildingModelOpening[];
  fixtures: BuildingModelFixture[];
  columns: BuildingModelColumn[];
  ocr: BuildingModelOcrItem[];
  geometry: BuildingModelGeometry;
  metadata: BuildingModelMetadata;
  entityRegistry: any[];
}

