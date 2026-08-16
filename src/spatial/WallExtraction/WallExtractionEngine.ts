import { BlueprintData } from "../../components/CadBlueprintWorkspace";
import {
  NormalizedWallGeometry,
  Point2D,
  WallCandidate,
  WallEntity,
  WallExtractionResult,
  WallValidationIssue,
  WallValidationOptions
} from "./types";
import { WallValidator } from "./WallValidator";

export class WallExtractionEngine {
  /**
   * Processes raw wall candidates against blueprint metadata to construct normalized wall entities.
   */
  public processCandidates(
    blueprint: BlueprintData,
    rawCandidates: WallCandidate[],
    options?: WallValidationOptions
  ): WallExtractionResult {
    const issues: WallValidationIssue[] = [];

    // 1. Deduplicate candidates
    const { uniqueCandidates, duplicateIssues } = WallValidator.deduplicateCandidates(rawCandidates, options);
    issues.push(...duplicateIssues);

    const validEntities: WallEntity[] = [];

    // 2. Validate and normalize candidates
    for (let index = 0; index < uniqueCandidates.length; index++) {
      const candidate = uniqueCandidates[index];
      const candId = candidate.id || `wall_${blueprint.id}_${index + 1}`;
      const candidateWithId = { ...candidate, id: candId };

      const validationIssues = WallValidator.validateCandidate(candidateWithId, options);
      const hasFatalErrors = validationIssues.some((issue) => issue.severity === "ERROR");

      issues.push(...validationIssues);

      if (!hasFatalErrors) {
        const entity = this.normalizeWallEntity(blueprint.id, candidateWithId);
        validEntities.push(Object.freeze(entity));
      }
    }

    const totalLength = validEntities.reduce((sum, w) => sum + w.geometry.lengthMeters, 0);

    return Object.freeze({
      blueprintId: blueprint.id,
      walls: Object.freeze(validEntities),
      issues: Object.freeze(issues),
      summary: Object.freeze({
        rawCandidateCount: rawCandidates.length,
        validWallCount: validEntities.length,
        totalLengthMeters: Number(totalLength.toFixed(3)),
        processedAtISO: new Date().toISOString()
      })
    });
  }

  /**
   * Normalizes geometric properties (center point, length in meters, thickness, angle).
   */
  private normalizeWallEntity(blueprintId: string, candidate: WallCandidate & { id: string }): WallEntity {
    const start = candidate.start;
    const end = candidate.end;

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    const lengthMeters = Math.sqrt(dx * dx + dy * dy);
    const angleRad = Math.atan2(dy, dx);
    let angleDegrees = (angleRad * 180) / Math.PI;
    if (angleDegrees < 0) angleDegrees += 360;

    const center: Point2D = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    };

    const thicknessMeters = candidate.thicknessMeters ?? 0.23;

    const geometry: NormalizedWallGeometry = Object.freeze({
      start: Object.freeze({ ...start }),
      end: Object.freeze({ ...end }),
      center: Object.freeze({ ...center }),
      lengthMeters: Number(lengthMeters.toFixed(4)),
      thicknessMeters: Number(thicknessMeters.toFixed(4)),
      angleDegrees: Number(angleDegrees.toFixed(2))
    });

    return {
      id: candidate.id,
      blueprintId,
      wallType: candidate.wallType || "EXTERIOR",
      geometry,
      confidence: candidate.confidence ?? 1.0,
      metadata: Object.freeze(candidate.metadata ? { ...candidate.metadata } : {}),
      createdAtISO: new Date().toISOString()
    };
  }

  /**
   * Creates a pipeline hook handler for Stage 2 (Wall Extraction) registration in BlueprintEngine.
   * This decoupled factory method adheres to Constraint 2 (BlueprintEngine remains unaware of concrete implementation).
   */
  public createPipelineStageHook(): (blueprint: BlueprintData) => Promise<void> {
    return async (blueprint: BlueprintData): Promise<void> => {
      // Stage hook registration endpoint.
      // Passive processing boundary for future candidate sources.
      console.log(`[WallExtractionEngine] Stage 2 hook invoked for blueprint: ${blueprint.id}`);
    };
  }
}

export const wallExtractionEngine = new WallExtractionEngine();
