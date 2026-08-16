export type RecognitionMethod = 
  | "TEXT_LABEL"
  | "ARCHITECTURAL_SYMBOL"
  | "SPATIAL_GEOMETRY"
  | "CONTEXTUAL_INFERENCE"
  | "UNKNOWN";

export type VerificationStatus = 
  | "VERIFIED"
  | "NEEDS_CONFIRMATION"
  | "UNVERIFIED";

export interface RecognizedEntity {
  id: string;
  /** Verbatim OCR / blueprint label for UI display */
  name: string;
  displayName: string;
  /** Internal canonical category for Vastu rule evaluation */
  canonicalType: string;
  type: string; // legacy alias: canonical type for rooms, structural key for fixtures
  category: "ROOM" | "FIXTURE" | "UTILITY" | "STRUCTURE" | "UNKNOWN";
  detectedBy: RecognitionMethod;
  confidence: number; // 0.0 to 1.0 (e.g. 1.0 = 100%, 0.85 = 85%)
  evidence: string[];
  verificationStatus: VerificationStatus;
  zone: string;
  coordinates: { x: number; y: number; width: number; height: number };
  polygon?: Array<{ x: number; y: number }>;
  metadata?: Record<string, any>;
}

export interface RecognitionValidationChecklist {
  propertyBoundaryFound: boolean;
  scaleAvailable: boolean;
  northLocked: boolean;
  allRoomsClassified: boolean;
  objectsClassified: boolean;
  zonesAssigned: boolean;
  confidenceCalculated: boolean;
  unknownRoomsFlagged: boolean;
  allPassed: boolean;
}

export interface RecognitionCoverageReport {
  textCoveragePercent: number;
  symbolCoveragePercent: number;
  geometryCoveragePercent: number;
  contextCoveragePercent: number;
  unknownCoveragePercent: number;
  unknownSpacesCount: number;
}

export interface PropertyRecognitionSummary {
  totalRoomsRecognized: number;
  totalObjectsRecognized: number;
  doorsCount: number;
  windowsCount: number;
  breakdown: {
    kitchens: number;
    bedrooms: number;
    toilets: number;
    staircases: number;
    septicTanks: number;
    waterTanks: number;
    parking: number;
    poojaRooms: number;
    livingRooms: number;
    unknownSpaces: number;
    otherElements: number;
  };
  coverage: RecognitionCoverageReport;
  validationChecklist: RecognitionValidationChecklist;
  entities: RecognizedEntity[];
}

export interface RawCadOrVisionEntity {
  id: string;
  name?: string;
  type?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  polygon?: Array<{ x: number; y: number }>;
  symbols?: string[];
  fixtures?: string[];
  adjacentTo?: string[];
  metadata?: Record<string, any>;
}
