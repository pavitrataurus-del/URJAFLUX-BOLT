// ============================================================================
// URJAFLUX AI OS - BLUEPRINT MATHEMATICAL UNDERSTANDING ENGINE (BMUE v1.0)
// Canonical Mathematical Blueprint Understanding Type Definitions
// ============================================================================

import { IPoint2D, IBoundingBox2D, ISpatialContextModelV3 } from "../../spatial_recognition/types/sre.v3.types";

// ----------------------------------------------------------------------------
// Step 1: Wall Types & Wall Graph
// ----------------------------------------------------------------------------
export type BmueWallType =
  | 'LOAD_BEARING'
  | 'PARTITION'
  | 'EXTERNAL'
  | 'INTERNAL'
  | 'UNKNOWN';

export interface IBmueWallVector {
  wallId: string;
  start: IPoint2D;
  end: IPoint2D;
  thicknessMeters: number;
  lengthMeters: number;
  directionDegrees: number;
  wallType: BmueWallType;
  isLoadBearing: boolean;
  isExternal: boolean;
  connectedVertexIds: string[];
}

export interface IWallGraph {
  walls: IBmueWallVector[];
  totalWallLengthMeters: number;
  wallTypeBreakdown: Record<BmueWallType, number>;
  repairedSegmentCount: number;
  mergedWallCount: number;
  splitIntersectionCount: number;
}

// ----------------------------------------------------------------------------
// Step 2: Vertex Types & Vertex Graph
// ----------------------------------------------------------------------------
export type BmueVertexType =
  | 'CORNER'
  | 'DEAD_END'
  | 'T_JUNCTION'
  | 'CROSS_JUNCTION'
  | 'WALL_ENDPOINT'
  | 'INTERSECTION';

export interface IBmueVertexNode {
  vertexId: string;
  point: IPoint2D;
  type: BmueVertexType;
  connectedWallIds: string[];
  degree: number;
}

export interface IVertexGraph {
  vertices: IBmueVertexNode[];
  junctionCount: number;
  cornerCount: number;
  deadEndCount: number;
  crossJunctionCount: number;
  tJunctionCount: number;
}

// ----------------------------------------------------------------------------
// Step 3: Closed Polygon Solver Types
// ----------------------------------------------------------------------------
export type BmuePolygonStatus =
  | 'VALID_CLOSED_LOOP'
  | 'NESTED'
  | 'OPEN'
  | 'INVALID'
  | 'COMPOUND';

export interface IBmuePolygonEdge {
  start: IPoint2D;
  end: IPoint2D;
  lengthMeters: number;
  wallId?: string;
}

export interface IBmuePolygon {
  polygonId: string;
  status: BmuePolygonStatus;
  vertices: IPoint2D[];
  edges: IBmuePolygonEdge[];
  centroid: IPoint2D;
  areaSqMeters: number;
  perimeterMeters: number;
  orientationDegrees: number;
  parentPolygonId?: string;
  childPolygonIds: string[];
  boundingBox: IBoundingBox2D;
}

export interface IPolygonGraph {
  polygons: IBmuePolygon[];
  closedLoopCount: number;
  nestedCount: number;
  openPolygonCount: number;
  invalidCount: number;
  outerBoundaryPolygonId?: string;
}

// ----------------------------------------------------------------------------
// Step 4: Room Mathematical Engine Types
// ----------------------------------------------------------------------------
export type BmueRoomCandidateType =
  | 'KITCHEN'
  | 'BEDROOM'
  | 'TOILET'
  | 'LIVING'
  | 'DINING'
  | 'TEMPLE'
  | 'UTILITY'
  | 'UNKNOWN';

export interface IBmueRoomCandidate {
  candidate: BmueRoomCandidateType;
  confidence: number;
  geometricReasoning: string;
}

export interface IRoomMathematicalNode {
  roomId: string;
  polygonId: string;
  polygonAreaSqMeters: number;
  geometricCentroid: IPoint2D;
  primaryType: BmueRoomCandidateType | string;
  roomConfidence: number;
  candidateTypes: IBmueRoomCandidate[];
  ocrConfirmedType?: string;
  ocrConfirmationStatus: 'GEOMETRY_CONFIRMED_BY_OCR' | 'GEOMETRY_ONLY_NO_OCR' | 'OCR_CONFLICT_RESOLVED_BY_GEOMETRY';
}

export interface IRoomGraph {
  rooms: IRoomMathematicalNode[];
  unknownRoomCount: number;
  geometryConfidenceAvg: number;
}

// ----------------------------------------------------------------------------
// Step 5: Door & Connectivity Types
// ----------------------------------------------------------------------------
export interface IDoorNode {
  doorId: string;
  location: IPoint2D;
  connectingRoomAId: string;
  connectingRoomBId: string;
  widthMeters: number;
  isMainEntrance: boolean;
}

export interface IDoorGraph {
  doors: IDoorNode[];
  totalDoors: number;
}

export interface IBmueConnectivityEdge {
  doorId: string;
  roomAId: string;
  roomBId: string;
  isTraversable: boolean;
}

export interface IConnectivityGraph {
  edges: IBmueConnectivityEdge[];
  deadEndRoomIds: string[];
  circulationPaths: string[][];
  disconnectedRoomIds: string[];
  graphConnectednessRatio: number;
}

// ----------------------------------------------------------------------------
// Step 6: Window Graph Types
// ----------------------------------------------------------------------------
export interface IWindowNode {
  windowId: string;
  wallId: string;
  location: IPoint2D;
  isExternal: boolean;
  facingDirectionDegrees: number;
  facingCardinalZone: string;
  associatedRoomId: string;
  widthMeters: number;
}

export interface ICrossVentilationPair {
  roomAId: string;
  roomBId: string;
  windowAId: string;
  windowBId: string;
}

export interface IFutureDaylightSimHooks {
  sunlightExposureHoursEstimate?: number;
  glareIndexEstimate?: number;
  daylightAutonomyPercentage?: number;
}

export interface IWindowGraph {
  windows: IWindowNode[];
  externalWindowCount: number;
  internalWindowCount: number;
  crossVentilationPairs: ICrossVentilationPair[];
  futureDaylightSimHooks: IFutureDaylightSimHooks;
}

// ----------------------------------------------------------------------------
// Step 7: Object Containment Types
// ----------------------------------------------------------------------------
export type BmueContainmentStatus =
  | 'CONTAINED_IN_SINGLE_POLYGON'
  | 'OUTSIDE_ROOM'
  | 'UNKNOWN_CONTAINER';

export interface IBmueObjectContainment {
  objectId: string;
  objectType: string;
  centerPoint: IPoint2D;
  assignedPolygonId: string;
  assignedRoomId: string;
  containmentStatus: BmueContainmentStatus;
  containmentConfidence: number;
}

export interface IContainmentGraph {
  containments: IBmueObjectContainment[];
  uncontainedObjectCount: number;
}

// ----------------------------------------------------------------------------
// Step 8: Boundary Validation Types
// ----------------------------------------------------------------------------
export interface IBoundaryValidation {
  outerBoundaryValid: boolean;
  buildingFootprintValid: boolean;
  compoundWallPresent: boolean;
  extensionsDetected: boolean;
  cutsDetected: boolean;
  missingCornersDetected: boolean;
  multipleBuildingsDetected: boolean;
  courtyardsDetected: boolean;
  detectedCourtyardPolygons: IPoint2D[][];
  boundaryWarnings: string[];
}

// ----------------------------------------------------------------------------
// Step 9: Geometric Consistency Types
// ----------------------------------------------------------------------------
export interface IConsistencyCheckResult {
  checkName: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  message: string;
}

export interface IGeometricConsistency {
  isGeometricallyConsistent: boolean;
  hasClosedBoundaries: boolean;
  hasGraphConnectivity: boolean;
  hasWallContainment: boolean;
  hasPositiveAreas: boolean;
  hasCentroidsCalculated: boolean;
  hasZeroImpossibleOverlaps: boolean;
  consistencyChecks: IConsistencyCheckResult[];
}

// ----------------------------------------------------------------------------
// Step 10: Blueprint Health Score Types
// ----------------------------------------------------------------------------
export interface IHealthDeduction {
  category: string;
  pointsDeducted: number;
  reason: string;
}

export interface IBlueprintHealth {
  overallConfidence: number;
  geometryScore: number;
  wallQualityScore: number;
  ocrQualityScore: number;
  polygonQualityScore: number;
  connectivityQualityScore: number;
  recognitionQualityScore: number;
  deductions: IHealthDeduction[];
}

// ----------------------------------------------------------------------------
// Step 11: Mathematical Proof Package Types
// ----------------------------------------------------------------------------
export interface IMathematicalProofPackage {
  proofHash: string;
  isVerified: boolean;
  auditTimestamp: string;
  machineReadableSummary: {
    totalWalls: number;
    totalVertices: number;
    totalPolygons: number;
    totalRooms: number;
    totalDoors: number;
    totalWindows: number;
    totalObjects: number;
    healthScore: number;
    zeroHallucinationAuditStatus: string;
  };
  zeroHallucinationAuditPassed: boolean;
}

// ----------------------------------------------------------------------------
// Future Reserved Hooks (BMUE)
// ----------------------------------------------------------------------------
export interface IBmueFutureReservedHooks {
  openCvData?: any;
  sam2SegmentationMasks?: any;
  yoloDetections?: any;
  detectronModels?: any;
  dwgDxfVectorLayers?: any;
  ifcBimMetadata?: any;
  mesh3DRef?: any;
  lidarScanRef?: any;
}

// ----------------------------------------------------------------------------
// Canonical Output Contract
// ----------------------------------------------------------------------------
export interface IBlueprintMathematicalModel {
  propertyId: string;
  propertyName: string;
  version: '1.0.0-BMUE-MATHEMATICAL-CANONICAL';
  timestamp: string;
  
  wallGraph: IWallGraph;
  vertexGraph: IVertexGraph;
  polygonGraph: IPolygonGraph;
  roomGraph: IRoomGraph;
  doorGraph: IDoorGraph;
  windowGraph: IWindowGraph;
  connectivityGraph: IConnectivityGraph;
  containmentGraph: IContainmentGraph;
  
  boundaryValidation: IBoundaryValidation;
  geometricConsistency: IGeometricConsistency;
  blueprintHealth: IBlueprintHealth;
  mathematicalProof: IMathematicalProofPackage;
  
  futureHooks?: IBmueFutureReservedHooks;
}
