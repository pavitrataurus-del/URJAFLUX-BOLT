import { RecognitionMethod, VerificationStatus } from "./types";

export class RecognitionConfidenceService {
  /**
   * Calculates confidence rating (0.0 to 1.0) based on recognition method and matching cues
   */
  public static calculateConfidence(
    method: RecognitionMethod,
    hasSymbols: boolean,
    hasFixtures: boolean,
    hasAdjacency: boolean
  ): number {
    switch (method) {
      case "TEXT_LABEL":
        return 1.0; // 100% confidence for explicit text labels

      case "ARCHITECTURAL_SYMBOL":
        if (hasSymbols && hasFixtures) return 0.95;
        if (hasSymbols) return 0.90;
        return 0.85;

      case "SPATIAL_GEOMETRY":
        if (hasFixtures) return 0.82;
        return 0.75;

      case "CONTEXTUAL_INFERENCE":
        if (hasAdjacency) return 0.65;
        return 0.55;

      case "UNKNOWN":
      default:
        return 0.42; // Below 50% threshold
    }
  }

  /**
   * Assigns verification status based on confidence score
   */
  public static determineVerificationStatus(confidence: number): VerificationStatus {
    if (confidence >= 0.88) {
      return "VERIFIED";
    }
    if (confidence >= 0.50) {
      return "NEEDS_CONFIRMATION";
    }
    return "UNVERIFIED";
  }
}
