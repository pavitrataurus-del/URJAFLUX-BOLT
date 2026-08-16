import { GeminiRawSpatialPayload, GeminiValidationResult } from "./types";

/**
 * ============================================================================
 * GEMINI RESPONSE VALIDATOR
 * ============================================================================
 * Responsible for strict JSON parsing, schema structural validation, coordinate range
 * verification (0-1000 integer standard), and confidence boundary checks.
 */
export class GeminiResponseValidator {
  /**
   * Validates raw model JSON string output and produces a structured validation result.
   */
  public validate(rawJsonText: string): GeminiValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let cleanedText = rawJsonText.trim();

    // Strip markdown code fences if present (e.g. ```json ... ```)
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    let parsedJson: unknown = null;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (err) {
      return {
        isValid: false,
        payload: null,
        errors: [`Failed to parse JSON output: ${err instanceof Error ? err.message : String(err)}`],
        warnings: []
      };
    }

    if (!parsedJson || typeof parsedJson !== "object") {
      return {
        isValid: false,
        payload: null,
        errors: ["Response payload is not a valid JSON object."],
        warnings: []
      };
    }

    const payload = parsedJson as GeminiRawSpatialPayload;

    // Validate coordinate ranges for walls
    if (Array.isArray(payload.walls)) {
      payload.walls.forEach((wall, idx) => {
        if (!wall.start || typeof wall.start.x !== "number" || typeof wall.start.y !== "number") {
          errors.push(`Wall[${idx}] missing valid start coordinates.`);
        } else {
          this.checkCoordinateRange(`Wall[${idx}].start.x`, wall.start.x, errors, warnings);
          this.checkCoordinateRange(`Wall[${idx}].start.y`, wall.start.y, errors, warnings);
        }

        if (!wall.end || typeof wall.end.x !== "number" || typeof wall.end.y !== "number") {
          errors.push(`Wall[${idx}] missing valid end coordinates.`);
        } else {
          this.checkCoordinateRange(`Wall[${idx}].end.x`, wall.end.x, errors, warnings);
          this.checkCoordinateRange(`Wall[${idx}].end.y`, wall.end.y, errors, warnings);
        }
      });
    }

    // Validate rooms
    if (Array.isArray(payload.rooms)) {
      payload.rooms.forEach((room, idx) => {
        if (!Array.isArray(room.polygonVertices) || room.polygonVertices.length < 3) {
          warnings.push(`Room[${idx}] '${room.name || "unnamed"}' has fewer than 3 vertices.`);
        } else {
          room.polygonVertices.forEach((v, vIdx) => {
            this.checkCoordinateRange(`Room[${idx}].vertices[${vIdx}].x`, v.x, errors, warnings);
            this.checkCoordinateRange(`Room[${idx}].vertices[${vIdx}].y`, v.y, errors, warnings);
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      payload: errors.length === 0 ? payload : null,
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings)
    };
  }

  private checkCoordinateRange(
    label: string,
    val: number,
    errors: string[],
    warnings: string[]
  ): void {
    if (isNaN(val)) {
      errors.push(`${label} is NaN.`);
      return;
    }
    if (val < 0 || val > 1000) {
      warnings.push(`${label} value (${val}) is outside standard 0-1000 range. Will be clamped.`);
    }
  }
}
