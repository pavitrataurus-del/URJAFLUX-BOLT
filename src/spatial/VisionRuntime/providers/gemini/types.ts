import { BlueprintData } from "../../../../components/CadBlueprintWorkspace";

/**
 * ============================================================================
 * GEMINI VISION PROVIDER - TYPES & SCHEMAS
 * ============================================================================
 * Internal domain types, raw payload schemas, and transport contracts
 * for the Gemini Vision Provider package.
 */

export type GeminiTransportMode = "PROXY" | "SDK" | "MOCK";

export type GeminiPromptTemplateKey =
  | "BLUEPRINT_FULL"
  | "WALLS_ONLY"
  | "ROOMS_ONLY"
  | "OPENINGS_ONLY"
  | "OCR_ONLY"
  | "NORTH_SCALE";

export interface GeminiRecognitionRequest {
  readonly blueprintId: string;
  readonly imageDataUrl?: string;
  readonly promptText: string;
  readonly naturalWidth: number;
  readonly naturalHeight: number;
  readonly timeoutMs: number;
  readonly options?: Record<string, unknown>;
}

export interface GeminiTransportResponse {
  readonly rawJsonText: string;
  readonly executionTimeMs: number;
  readonly metadata?: Record<string, unknown>;
}

export interface GeminiRawPoint {
  x: number;
  y: number;
}

export interface GeminiRawWall {
  id: string;
  start: GeminiRawPoint;
  end: GeminiRawPoint;
  thicknessNormalized?: number;
  wallType?: string;
  confidence: number;
}

export interface GeminiRawRoom {
  id: string;
  name: string;
  polygonVertices: GeminiRawPoint[];
  boundaryWallIds?: string[];
  confidence: number;
}

export interface GeminiRawOpening {
  id: string;
  type: "DOOR" | "WINDOW" | "ARCHWAY" | "OPENING";
  start: GeminiRawPoint;
  end: GeminiRawPoint;
  hostWallId?: string;
  confidence: number;
}

export interface GeminiRawAnnotation {
  id: string;
  text: string;
  location: GeminiRawPoint;
  category: "DIMENSION" | "ROOM_NAME" | "LABEL" | "NORTH_INDICATOR" | "OTHER";
  confidence: number;
}

export interface GeminiRawSpatialPayload {
  northAngleDegrees?: number;
  scalePixelsPerMeter?: number;
  scaleTextDetected?: string;
  walls?: GeminiRawWall[];
  rooms?: GeminiRawRoom[];
  openings?: GeminiRawOpening[];
  annotations?: GeminiRawAnnotation[];
  warnings?: string[];
  overallConfidence?: number;
}

export interface GeminiValidationResult {
  readonly isValid: boolean;
  readonly payload: GeminiRawSpatialPayload | null;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
