import { BlueprintData } from "../../../../components/CadBlueprintWorkspace";
import {
  OpeningCandidateData,
  Point2D,
  RoomCandidateData,
  TextAnnotationData,
  VisionRecognitionResult,
  WallCandidateData,
  WallTypeCandidate
} from "../../types";
import { GeminiRawSpatialPayload, GeminiValidationResult } from "./types";

/**
 * ============================================================================
 * GEMINI SPATIAL JSON MAPPER
 * ============================================================================
 * Converts validated Gemini raw payload structures into standard VisionRecognitionResult
 * objects strictly abiding by the 0-1000 integer coordinate standard.
 */
export class GeminiSpatialJsonMapper {
  /**
   * Maps validated raw payload into frozen VisionRecognitionResult structure.
   */
  public mapToRecognitionResult(
    blueprint: BlueprintData,
    providerId: string,
    providerVersion: string,
    validationResult: GeminiValidationResult,
    executionTimeMs: number
  ): VisionRecognitionResult {
    const payload = validationResult.payload || {};

    const walls: WallCandidateData[] = (payload.walls || []).map((w, idx) => ({
      id: w.id || `gemini_wall_${idx}_${Date.now()}`,
      start: this.clampPoint(w.start),
      end: this.clampPoint(w.end),
      thicknessNormalized: w.thicknessNormalized || 20,
      wallType: this.normalizeWallType(w.wallType),
      confidence: Math.min(1.0, Math.max(0.0, w.confidence ?? 0.8)),
      metadata: { source: "GeminiVisionProvider" }
    }));

    const rooms: RoomCandidateData[] = (payload.rooms || []).map((r, idx) => ({
      id: r.id || `gemini_room_${idx}_${Date.now()}`,
      name: r.name || `ROOM_${idx + 1}`,
      polygon: {
        vertices: (r.polygonVertices || []).map((v) => this.clampPoint(v))
      },
      boundaryWallIds: r.boundaryWallIds || [],
      confidence: Math.min(1.0, Math.max(0.0, r.confidence ?? 0.8)),
      metadata: { source: "GeminiVisionProvider" }
    }));

    const openings: OpeningCandidateData[] = (payload.openings || []).map((o, idx) => ({
      id: o.id || `gemini_opening_${idx}_${Date.now()}`,
      type: o.type || "DOOR",
      start: this.clampPoint(o.start),
      end: this.clampPoint(o.end),
      hostWallId: o.hostWallId,
      confidence: Math.min(1.0, Math.max(0.0, o.confidence ?? 0.8)),
      metadata: { source: "GeminiVisionProvider" }
    }));

    const annotations: TextAnnotationData[] = (payload.annotations || []).map((a, idx) => ({
      id: a.id || `gemini_anno_${idx}_${Date.now()}`,
      text: a.text || "",
      location: this.clampPoint(a.location),
      category: a.category || "LABEL",
      confidence: Math.min(1.0, Math.max(0.0, a.confidence ?? 0.8))
    }));

    const warnings = [...validationResult.warnings, ...(payload.warnings || [])];

    return Object.freeze({
      blueprintId: blueprint.id,
      providerId,
      providerVersion,
      metadata: Object.freeze({
        processedAtISO: new Date().toISOString(),
        executionTimeMs,
        imageWidth: blueprint.naturalWidth || 1000,
        imageHeight: blueprint.naturalHeight || 1000,
        coordinateSpace: "0-1000" as const
      }),
      orientation: Object.freeze({
        northAngleDegrees: 0,
        confidence: 0.90
      }),
      scale: Object.freeze({
        pixelsPerMeter: payload.scalePixelsPerMeter ?? (blueprint.pixelsPerMeter || 40),
        scaleTextDetected: payload.scaleTextDetected ?? (blueprint.scaleText || "Uncalibrated"),
        confidence: 0.90
      }),
      walls: Object.freeze(walls),
      rooms: Object.freeze(rooms),
      openings: Object.freeze(openings),
      annotations: Object.freeze(annotations),
      diagnostics: Object.freeze({
        warnings: Object.freeze(warnings),
        overallConfidence: payload.overallConfidence ?? 0.90
      })
    });
  }

  private clampPoint(pt?: { x?: number; y?: number }): Point2D {
    if (!pt) return { x: 0, y: 0 };
    return {
      x: Math.round(Math.min(1000, Math.max(0, pt.x ?? 0))),
      y: Math.round(Math.min(1000, Math.max(0, pt.y ?? 0)))
    };
  }

  private normalizeWallType(wallTypeStr?: string): WallTypeCandidate {
    if (!wallTypeStr) return "UNKNOWN";
    const upper = wallTypeStr.toUpperCase();
    if (upper.includes("EXTERIOR") || upper.includes("OUTER")) return "EXTERIOR";
    if (upper.includes("INTERIOR") || upper.includes("INNER")) return "INTERIOR";
    if (upper.includes("LOAD")) return "LOAD_BEARING";
    if (upper.includes("PARTITION")) return "PARTITION";
    return "UNKNOWN";
  }
}
