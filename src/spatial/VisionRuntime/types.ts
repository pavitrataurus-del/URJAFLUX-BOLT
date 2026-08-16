import { BlueprintData } from "../../components/CadBlueprintWorkspace";

/**
 * ============================================================================
 * VISION RUNTIME - TYPES & CONTRACTS
 * ============================================================================
 * Standard Spatial JSON output and runtime state types.
 *
 * COORDINATE SYSTEM STANDARD:
 * All normalized spatial coordinates use the 0-1000 integer coordinate space.
 * (0,0) = Top-Left, (1000,1000) = Bottom-Right.
 */

export interface Point2D {
  x: number; // 0 to 1000
  y: number; // 0 to 1000
}

export interface NormalizedPolygon {
  vertices: Point2D[]; // Vertices in 0-1000 coordinate space
}

export interface NormalizedBoundingBox {
  minX: number; // 0 to 1000
  minY: number; // 0 to 1000
  maxX: number; // 0 to 1000
  maxY: number; // 0 to 1000
}

export type WallTypeCandidate =
  | "EXTERIOR"
  | "INTERIOR"
  | "LOAD_BEARING"
  | "PARTITION"
  | "CURTAIN"
  | "UNKNOWN";

export interface WallCandidateData {
  id: string;
  start: Point2D; // 0 to 1000
  end: Point2D; // 0 to 1000
  thicknessNormalized?: number; // Normalized relative to 0-1000 grid
  wallType?: WallTypeCandidate;
  confidence: number; // 0 to 1 confidence score
  metadata?: Record<string, unknown>;
}

export interface RoomCandidateData {
  id: string;
  name: string;
  polygon: NormalizedPolygon;
  boundaryWallIds: string[];
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface OpeningCandidateData {
  id: string;
  type: "DOOR" | "WINDOW" | "ARCHWAY" | "OPENING";
  start: Point2D; // 0 to 1000
  end: Point2D; // 0 to 1000
  hostWallId?: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface TextAnnotationData {
  id: string;
  text: string;
  location: Point2D; // 0 to 1000
  category: "DIMENSION" | "ROOM_NAME" | "LABEL" | "NORTH_INDICATOR" | "OTHER";
  confidence: number;
}

export interface VisionRecognitionResult {
  readonly blueprintId: string;
  readonly providerId: string;
  readonly providerVersion: string;
  readonly metadata: {
    readonly processedAtISO: string;
    readonly executionTimeMs: number;
    readonly imageWidth: number;
    readonly imageHeight: number;
    readonly coordinateSpace: "0-1000";
  };
  readonly orientation: {
    readonly northAngleDegrees: number;
    readonly confidence: number;
  };
  readonly scale: {
    readonly pixelsPerMeter?: number;
    readonly scaleTextDetected?: string;
    readonly confidence: number;
  };
  readonly walls: readonly WallCandidateData[];
  readonly rooms: readonly RoomCandidateData[];
  readonly openings: readonly OpeningCandidateData[];
  readonly annotations: readonly TextAnnotationData[];
  readonly diagnostics: {
    readonly warnings: readonly string[];
    readonly overallConfidence: number;
  };
}

export type RecognitionSessionStatus =
  | "CREATED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface ExecutionTraceEntry {
  readonly timestampISO: string;
  readonly phase: string;
  readonly message: string;
  readonly status: RecognitionSessionStatus;
  readonly details?: Record<string, unknown>;
}

export interface RecognitionSessionOptions {
  readonly timeoutMs?: number;
  readonly minimumConfidence?: number;
  readonly customSettings?: Record<string, unknown>;
}

export interface VisionProviderCapabilities {
  readonly providerId: string;
  readonly displayName: string;
  readonly version: string;
  readonly supportsWalls: boolean;
  readonly supportsRooms: boolean;
  readonly supportsOpenings: boolean;
  readonly supportsText: boolean;
  readonly supportsOrientation: boolean;
  readonly supportsScale: boolean;
  readonly isOfflineCapable: boolean;
}

export interface VisionRuntimeConfig {
  defaultProviderId?: string;
  requestTimeoutMs: number;
  retryCount: number;
  minimumWallConfidence: number;
  minimumRoomConfidence: number;
  minimumDoorConfidence: number;
  minimumWindowConfidence: number;
}
