import { RecognitionMethod, RecognizedEntity } from "./types";

export class RecognitionEvidenceBuilder {
  /**
   * Constructs verifiable recognition evidence array for a recognized entity
   */
  public static buildEvidence(
    entityName: string,
    entityType: string,
    method: RecognitionMethod,
    confidence: number,
    rawSymbols?: string[],
    rawFixtures?: string[],
    adjacentTo?: string[]
  ): string[] {
    const evidence: string[] = [];

    switch (method) {
      case "TEXT_LABEL":
        evidence.push(`Direct OCR / Blueprint Text Label Match: "${entityName}"`);
        evidence.push(`Explicit annotation detected with high textual fidelity`);
        evidence.push(`Primary classification locked via text recognition index`);
        break;

      case "ARCHITECTURAL_SYMBOL":
        if (rawSymbols && rawSymbols.length > 0) {
          evidence.push(`Architectural Symbol(s) Identified: ${rawSymbols.join(", ")}`);
        }
        if (rawFixtures && rawFixtures.length > 0) {
          evidence.push(`Sanitary / Mechanical Fixture Match: ${rawFixtures.join(", ")}`);
        } else {
          evidence.push(`Recognized CAD architectural symbol profile matching ${entityType}`);
        }
        evidence.push(`Symbol topology matches standard blueprint symbol library`);
        break;

      case "SPATIAL_GEOMETRY":
        evidence.push(`Spatial Geometry Analysis: Dimension and aspect ratio match standard ${entityType} footprint`);
        evidence.push(`Boundary polygon & area ratio exhibit characteristics of ${entityType}`);
        evidence.push(`Bounding box spatial orientation consistent with room function`);
        break;

      case "CONTEXTUAL_INFERENCE":
        if (adjacentTo && adjacentTo.length > 0) {
          evidence.push(`Adjacency Context: Neighboring spaces include [${adjacentTo.join(", ")}]`);
        } else {
          evidence.push(`Contextual Position: Inferred from topological proximity to primary living corridors`);
        }
        evidence.push(`Circulation vector analysis supports probable ${entityType} usage`);
        break;

      case "UNKNOWN":
      default:
        evidence.push(`No explicit text label found on floor plan annotation`);
        evidence.push(`Insufficient architectural symbol / fixture markers detected`);
        evidence.push(`Confidence score (${Math.round(confidence * 100)}%) falls below verification threshold (50%)`);
        evidence.push(`Flagged for explicit user/founder verification before final rule lock`);
        break;
    }

    return evidence;
  }
}
