// ============================================================================
// URJAFLUX AI OS - SPATIAL RECOGNITION ENGINE V3 (SRE v3)
// Production Grade AI Vision System Type Definitions
// ============================================================================

import { 
  IPoint2D, 
  IBoundingBox2D, 
  IDimensions3D, 
  Vastu16Zone, 
  ISreRoomPolygon, 
  ISreSpatialObject, 
  ISreZoneAllocation, 
  ISreSpatialRelationship, 
  ISreGraphs, 
  ISreEvidenceMetadata, 
  ISreProofOfUnderstanding,
  ISpatialContextModel
} from "./sre.types";

export type { IPoint2D, IBoundingBox2D };

// ----------------------------------------------------------------------------
// Step 1: Asset Classification Types
// ----------------------------------------------------------------------------
export type SreAssetType =
  | 'ARCHITECTURAL_BLUEPRINT'
  | 'CAD_EXPORT'
  | 'SCANNED_BLUEPRINT'
  | 'HAND_DRAWN_PLAN'
  | 'OVERLAY_CHAKRA'
  | 'BLUEPRINT_WITH_OVERLAY'
  | 'GOOGLE_EARTH'
  | 'PROPERTY_PHOTO'
  | 'MIXED_INPUT'
  | 'UNKNOWN';

export type SreProcessingStrategy =
  | 'CAD_VECTOR_PIPELINE'
  | 'HIGH_RES_RASTER_VISION_PIPELINE'
  | 'HAND_DRAWN_SKETCH_CONSTRAINED_PIPELINE'
  | 'OVERLAY_ONLY_ALIGNMENT_PIPELINE'
  | 'SATELLITE_GEOSPATIAL_PIPELINE'
  | 'FALLBACK_UNKNOWN_ASSET_PIPELINE';

export interface IAssetClassificationResult {
  assetType: SreAssetType;
  confidence: number;
  processingStrategy: SreProcessingStrategy;
  detectedLayers: string[];
  fileFormat: string;
  hasOverlayChakra: boolean;
  hasOcrText: boolean;
  hasScaleLegend: boolean;
}

// ----------------------------------------------------------------------------
// Step 2: Image Preprocessing Types
// ----------------------------------------------------------------------------
export interface IPreprocessingResult {
  perspectiveCorrected: boolean;
  rotationDetectedDegrees: number;
  deskewAngleDegrees: number;
  noiseReduced: boolean;
  contrastEnhanced: boolean;
  wallLinesEnhanced: boolean;
  ocrEnhanced: boolean;
  separatedLayers: {
    blueprintLayer: string;
    overlayLayer?: string;
    textLayer?: string;
    dimensionLayer?: string;
  };
}

// ----------------------------------------------------------------------------
// Step 3: Architectural Segmentation Types
// ----------------------------------------------------------------------------
export type SegmentEntityType =
  | 'OUTER_BOUNDARY'
  | 'COMPOUND_WALL'
  | 'BUILDING_FOOTPRINT'
  | 'INTERNAL_WALL'
  | 'DOOR'
  | 'WINDOW'
  | 'COLUMN'
  | 'BEAM'
  | 'BALCONY'
  | 'TERRACE'
  | 'STAIRS'
  | 'LIFT'
  | 'VOID'
  | 'OPEN_SPACE'
  | 'PARKING'
  | 'UNKNOWN_SEGMENT';

export interface ISegmentationEntity {
  entityId: string;
  entityType: SegmentEntityType;
  polygon: IPoint2D[];
  boundingBox: IBoundingBox2D;
  confidence: number;
  attributes?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// Step 4: Room Detection Types
// ----------------------------------------------------------------------------
export type SreRoomTypeV3 =
  | 'LIVING_ROOM'
  | 'DRAWING_ROOM'
  | 'DINING'
  | 'KITCHEN'
  | 'STORE'
  | 'BEDROOM'
  | 'MASTER_BEDROOM'
  | 'CHILDREN_ROOM'
  | 'GUEST_ROOM'
  | 'TOILET'
  | 'BATHROOM'
  | 'WASH_AREA'
  | 'TEMPLE'
  | 'OFFICE'
  | 'GARAGE'
  | 'BALCONY'
  | 'UTILITY'
  | 'UNKNOWN_ROOM';

export interface IRoomCandidate {
  candidateRoomType: SreRoomTypeV3;
  confidence: number;
  reasoning: string;
}

// ----------------------------------------------------------------------------
// Step 5: Object Detection Types
// ----------------------------------------------------------------------------
export type SreObjectTypeV3 =
  | 'GAS_STOVE'
  | 'KITCHEN_SINK'
  | 'WC'
  | 'WASH_BASIN'
  | 'SHOWER'
  | 'BED'
  | 'SOFA'
  | 'DINING_TABLE'
  | 'TEMPLE'
  | 'LOCKER'
  | 'MIRROR'
  | 'WATER_TANK'
  | 'SEPTIC_TANK'
  | 'BOREWELL'
  | 'ELECTRICAL_PANEL'
  | 'TRANSFORMER'
  | 'LIFT'
  | 'SOLAR_PANEL'
  | 'HEAVY_STORAGE'
  | 'UNKNOWN_OBJECT';

export interface ISreSpatialObjectV3 extends ISreSpatialObject {
  objectType: SreObjectTypeV3 | string;
  polygon?: IPoint2D[];
}

// ----------------------------------------------------------------------------
// Step 6: Blueprint OCR Types
// ----------------------------------------------------------------------------
export interface IBlueprintOcrResult {
  extractedRoomNames: Array<{ text: string; confidence: number; location: IPoint2D }>;
  extractedDimensions: Array<{ rawText: string; parsedMeters?: number; location: IPoint2D; confidence: number }>;
  notes: string[];
  scale?: { text: string; ratioNumerator: number; ratioDenominator: number; confidence: number };
  northArrow?: { angleDegrees: number; confidence: number; isManualOverride?: boolean };
  legends: Array<{ symbol: string; meaning: string }>;
  symbols: Array<{ symbolId: string; category: string; location: IPoint2D }>;
  doorLabels: Array<{ label: string; location: IPoint2D }>;
  windowLabels: Array<{ label: string; location: IPoint2D }>;
  floorLabels: Array<{ label: string; location: IPoint2D }>;
  overallOcrConfidence: number;
}

// ----------------------------------------------------------------------------
// Step 7: Geometry Engine Computation Types
// ----------------------------------------------------------------------------
export interface IGeometryComputation {
  closedPolygons: Array<{ polygonId: string; vertices: IPoint2D[]; areaSqMeters: number }>;
  centroids: Record<string, IPoint2D>;
  wallSharing: Array<{ wallId: string; roomAId: string; roomBId: string; lengthMeters: number }>;
  doorConnectivity: Array<{ doorId: string; connectingRoomIds: string[] }>;
  objectContainment: Array<{ objectId: string; containingRoomId: string; isContained: boolean }>;
  roomContainment: Array<{ roomId: string; isWithinBuildingFootprint: boolean }>;
}

// ----------------------------------------------------------------------------
// Step 8: Spatial Zone Engine Types
// ----------------------------------------------------------------------------
export interface ISpatialZoneState {
  usingOverlayChakra: boolean;
  overlayChakraSource: 'IMAGE_OVERLAY_PROVIDED' | 'AUTO_GENERATED_CHAKRA';
  trueNorthAngleDegrees: number;
  northSource: 'GPS_CALCULATED' | 'FOUNDER_MANUAL_OVERRIDE' | 'OCR_DETECTED' | 'DEFAULT_NORTH';
  isFounderOverrideActive: boolean;
  zoneAllocations: ISreZoneAllocation[];
}

// ----------------------------------------------------------------------------
// Step 9: Measurement Engine Types
// ----------------------------------------------------------------------------
export interface IMeasurementResult {
  scaleExists: boolean;
  scaleRatio?: number; // e.g., 0.01 for 1:100
  measurementMode: 'ABSOLUTE_METRIC_AND_IMPERIAL' | 'RELATIVE_GEOMETRY_ONLY';
  units?: {
    meters?: number;
    feet?: number;
    areaSqMeters?: number;
    areaSqFeet?: number;
    perimeterMeters?: number;
    perimeterFeet?: number;
  };
  relativeGeometrySummary: {
    aspectRatio: number;
    roomAreaPercentages: Record<string, number>;
    relativeDistances: Record<string, number>;
  };
}

// ----------------------------------------------------------------------------
// Step 10: Spatial Proof Engine Types
// ----------------------------------------------------------------------------
export interface IRecognitionStatistics {
  totalEntitiesDetected: number;
  highConfidenceCount: number;
  lowConfidenceCount: number;
  unknownObjectCount: number;
  unknownRoomCount: number;
}

export interface IConfidenceDistribution {
  averageConfidence: number;
  roomsConfidence: number;
  objectsConfidence: number;
  ocrConfidence: number;
  segmentationConfidence: number;
}

export interface ISpatialProofV3 {
  isProofValid: boolean;
  graphs: ISreGraphs;
  recognitionStatistics: IRecognitionStatistics;
  confidenceDistribution: IConfidenceDistribution;
  missingObjects: string[];
  unknownObjects: string[];
  validationResult: {
    status: 'PASSED_ZERO_HALLUCINATION_AUDIT' | 'WARNINGS_DETECTED' | 'FAILED_PROOFS';
    checksPassed: string[];
    warnings: string[];
  };
}

// ----------------------------------------------------------------------------
// Future Reserved Hooks
// ----------------------------------------------------------------------------
export interface IFutureReservedHooks {
  googleEarthGeospatialData?: {
    satelliteImageUrl?: string;
    coordinates?: { latitude: number; longitude: number };
    elevationMeters?: number;
  };
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    altitudeMeters?: number;
  };
  model3DRef?: {
    modelUrl?: string;
    format?: 'GLTF' | 'OBJ' | 'USDZ';
  };
  droneMappingData?: {
    pointCloudUrl?: string;
    orthomosaicUrl?: string;
  };
  lidarScanData?: {
    rawPointCloudData?: any;
  };
  bimIfcMetadata?: {
    ifcGuid?: string;
    buildingStorey?: string;
  };
  cadDwgDxfLayers?: Array<{
    layerName: string;
    entityCount: number;
  }>;
}

// ----------------------------------------------------------------------------
// Extended Spatial Context Model v3
// ----------------------------------------------------------------------------
export interface ISpatialContextModelV3 extends ISpatialContextModel {
  version: '3.0.0-PRODUCTION-GRADE-VISION';
  assetClassification: IAssetClassificationResult;
  preprocessing: IPreprocessingResult;
  segmentation: ISegmentationEntity[];
  ocr: IBlueprintOcrResult;
  measurements: IMeasurementResult;
  spatialProofV3: ISpatialProofV3;
  futureHooks?: IFutureReservedHooks;
}
