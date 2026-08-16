// ============================================================================
// URJAFLUX AI OS - BSUE STEP 9: SEMANTIC SELF-CORRECTION ENGINE
// Conflict resolution & ambiguity handling engine
// FOUNDER LOCKS: 
// 1. Geometry always overrides OCR.
// 2. Objects never override Geometry.
// 3. OCR never overrides Geometry.
// 4. Unknown is always better than hallucination.
// 5. Never fabricate labels when evidence conflicts.
// ============================================================================

import { 
  IAmbiguityRecord, 
  ISemanticInconsistency, 
  ISemanticSelfCorrectionReport, 
  ISemanticRoom 
} from "../types/bsue.types";

export class SemanticSelfCorrectionEngine {
  private static instance: SemanticSelfCorrectionEngine;

  private constructor() {}

  public static getInstance(): SemanticSelfCorrectionEngine {
    if (!SemanticSelfCorrectionEngine.instance) {
      SemanticSelfCorrectionEngine.instance = new SemanticSelfCorrectionEngine();
    }
    return SemanticSelfCorrectionEngine.instance;
  }

  public processSelfCorrection(
    semanticRooms: ISemanticRoom[],
    inconsistencies: ISemanticInconsistency[]
  ): ISemanticSelfCorrectionReport {
    const ambiguityRegistry: IAmbiguityRecord[] = [];
    let consultantReviewRequested = false;

    semanticRooms.forEach(room => {
      // Check if room has severe evidence conflict or ambiguity
      if (room.isAmbiguous || room.confidence < 0.60) {
        ambiguityRegistry.push({
          entityId: room.roomId,
          reason: `High variance in multi-evidence fusion for room ${room.semanticLabel} (Confidence: ${room.confidence})`,
          suggestedAction: room.confidence < 0.40 ? 'CONSULTANT_REVIEW_REQUIRED' : 'GEOMETRY_OVERRIDE_APPLIED',
          conflictingLabels: [room.canonicalType, room.semanticLabel]
        });

        if (room.confidence < 0.40) {
          consultantReviewRequested = true;
        }
      }
    });

    inconsistencies.forEach(inc => {
      if (inc.severity === 'CONFLICT') {
        ambiguityRegistry.push({
          entityId: inc.roomId,
          reason: inc.description,
          suggestedAction: 'GEOMETRY_OVERRIDE_APPLIED', // FOUNDER LOCK: Geometry overrides OCR
          conflictingLabels: [inc.evidenceConflict.ocrType || 'UNKNOWN', inc.evidenceConflict.geometricType || 'UNKNOWN']
        });
      }
    });

    return {
      inconsistencies,
      ambiguityRegistry,
      consultantReviewRequested
    };
  }
}

export const semanticSelfCorrectionEngine = SemanticSelfCorrectionEngine.getInstance();
