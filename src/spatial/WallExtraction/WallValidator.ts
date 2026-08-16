import { WallCandidate, WallValidationIssue, WallValidationOptions } from "./types";

export class WallValidator {
  private static DEFAULT_OPTIONS: Required<WallValidationOptions> = {
    minLengthMeters: 0.1,
    maxLengthMeters: 200,
    minThicknessMeters: 0.05,
    maxThicknessMeters: 2.0,
    deduplicationToleranceMeters: 0.05
  };

  /**
   * Validates a single wall candidate for geometric sanity.
   */
  public static validateCandidate(
    candidate: WallCandidate,
    customOptions?: WallValidationOptions
  ): WallValidationIssue[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...customOptions };
    const issues: WallValidationIssue[] = [];
    const wallId = candidate.id || "unassigned";

    // 1. Coordinate check
    if (
      isNaN(candidate.start.x) || isNaN(candidate.start.y) ||
      isNaN(candidate.end.x) || isNaN(candidate.end.y)
    ) {
      issues.push({
        wallId,
        code: "INVALID_COORDINATES",
        message: "Wall coordinates contain NaN or non-numeric values.",
        severity: "ERROR"
      });
      return issues;
    }

    // 2. Length check
    const dx = candidate.end.x - candidate.start.x;
    const dy = candidate.end.y - candidate.start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < opts.minLengthMeters) {
      issues.push({
        wallId,
        code: "ZERO_LENGTH",
        message: `Wall length (${length.toFixed(3)}m) is less than minimum allowable length (${opts.minLengthMeters}m).`,
        severity: "ERROR"
      });
    } else if (length > opts.maxLengthMeters) {
      issues.push({
        wallId,
        code: "OUT_OF_BOUNDS",
        message: `Wall length (${length.toFixed(2)}m) exceeds maximum allowable length (${opts.maxLengthMeters}m).`,
        severity: "WARNING"
      });
    }

    // 3. Thickness check
    const thickness = candidate.thicknessMeters ?? 0.23; // default 230mm standard brick wall
    if (thickness < opts.minThicknessMeters || thickness > opts.maxThicknessMeters) {
      issues.push({
        wallId,
        code: "INVALID_THICKNESS",
        message: `Wall thickness (${thickness}m) is outside standard range [${opts.minThicknessMeters}m - ${opts.maxThicknessMeters}m].`,
        severity: "WARNING"
      });
    }

    return issues;
  }

  /**
   * Deduplicates parallel or identical wall candidates.
   */
  public static deduplicateCandidates(
    candidates: WallCandidate[],
    customOptions?: WallValidationOptions
  ): { uniqueCandidates: WallCandidate[]; duplicateIssues: WallValidationIssue[] } {
    const opts = { ...this.DEFAULT_OPTIONS, ...customOptions };
    const uniqueCandidates: WallCandidate[] = [];
    const duplicateIssues: WallValidationIssue[] = [];

    for (const cand of candidates) {
      const isDuplicate = uniqueCandidates.some((existing) => {
        const dStart = Math.hypot(existing.start.x - cand.start.x, existing.start.y - cand.start.y);
        const dEnd = Math.hypot(existing.end.x - cand.end.x, existing.end.y - cand.end.y);
        const dStartRev = Math.hypot(existing.start.x - cand.end.x, existing.start.y - cand.end.y);
        const dEndRev = Math.hypot(existing.end.x - cand.start.x, existing.end.y - cand.start.y);

        const directMatch = dStart < opts.deduplicationToleranceMeters && dEnd < opts.deduplicationToleranceMeters;
        const reverseMatch = dStartRev < opts.deduplicationToleranceMeters && dEndRev < opts.deduplicationToleranceMeters;

        return directMatch || reverseMatch;
      });

      if (isDuplicate) {
        duplicateIssues.push({
          wallId: cand.id || "duplicate",
          code: "DUPLICATE_WALL",
          message: "Duplicate wall candidate detected and filtered out.",
          severity: "WARNING"
        });
      } else {
        uniqueCandidates.push(cand);
      }
    }

    return { uniqueCandidates, duplicateIssues };
  }
}
