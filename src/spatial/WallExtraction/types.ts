import { BuildingElement } from "../../types/spatialIntelligence";
import { CadEntity } from "../../components/CadBlueprintWorkspace";

export interface Point2D {
  x: number;
  y: number;
}

export type WallType =
  | "EXTERIOR"
  | "INTERIOR"
  | "LOAD_BEARING"
  | "PARTITION"
  | "CURTAIN"
  | "UNKNOWN";

export interface WallCandidate {
  id?: string;
  start: Point2D;
  end: Point2D;
  thicknessMeters?: number;
  wallType?: WallType;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface NormalizedWallGeometry {
  start: Point2D;
  end: Point2D;
  center: Point2D;
  lengthMeters: number;
  thicknessMeters: number;
  angleDegrees: number;
}

export interface WallEntity {
  readonly id: string;
  readonly blueprintId: string;
  readonly wallType: WallType;
  readonly geometry: NormalizedWallGeometry;
  readonly confidence: number;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAtISO: string;
}

export interface WallValidationOptions {
  minLengthMeters?: number;
  maxLengthMeters?: number;
  minThicknessMeters?: number;
  maxThicknessMeters?: number;
  deduplicationToleranceMeters?: number;
}

export interface WallValidationIssue {
  readonly wallId: string;
  readonly code: "ZERO_LENGTH" | "INVALID_THICKNESS" | "DUPLICATE_WALL" | "INVALID_COORDINATES" | "OUT_OF_BOUNDS";
  readonly message: string;
  readonly severity: "ERROR" | "WARNING";
}

export interface WallExtractionResult {
  readonly blueprintId: string;
  readonly walls: readonly WallEntity[];
  readonly issues: readonly WallValidationIssue[];
  readonly summary: {
    readonly rawCandidateCount: number;
    readonly validWallCount: number;
    readonly totalLengthMeters: number;
    readonly processedAtISO: string;
  };
}
