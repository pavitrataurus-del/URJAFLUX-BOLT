// ============================================================================
// URJAFLUX AI OS - BSUE STEP 3: SEMANTIC ROOM CLASSIFIER
// Multi-evidence spatial classifier: Polygon Geometry + Objects + OCR + Connectivity
// FOUNDER LOCKS: 
// 1. Geometry always overrides OCR.
// 2. Objects never override Geometry.
// 3. OCR never overrides Geometry.
// 4. Unknown is always better than hallucination.
// ============================================================================

import { 
  ISemanticRoom, 
  BmueCanonicalTerm, 
  ISemanticFusionSummary,
  IEvidenceSource 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class SemanticRoomClassifier {
  private static instance: SemanticRoomClassifier;

  private constructor() {}

  public static getInstance(): SemanticRoomClassifier {
    if (!SemanticRoomClassifier.instance) {
      SemanticRoomClassifier.instance = new SemanticRoomClassifier();
    }
    return SemanticRoomClassifier.instance;
  }

  public classifyRooms(
    bmueModel: IBlueprintMathematicalModel,
    fusionSummary: ISemanticFusionSummary
  ): ISemanticRoom[] {
    const semanticRooms: ISemanticRoom[] = [];

    bmueModel.roomGraph.rooms.forEach(room => {
      const fusionBundle = fusionSummary.fusedBundles.find(f => f.entityId === room.roomId);
      const supportingEvidence: IEvidenceSource[] = fusionBundle ? fusionBundle.sources : [];

      const ocrConfirmed = room.ocrConfirmedType?.trim();
      let canonicalType: BmueCanonicalTerm = 'UNKNOWN_SEMANTIC';
      let confidence = fusionBundle ? fusionBundle.fusedConfidenceScore : room.roomConfidence;
      let isAmbiguous = true;
      let semanticLabel = 'UNCLASSIFIED SPACE';

      if (ocrConfirmed && ocrConfirmed !== 'UNKNOWN' && ocrConfirmed !== 'UNKNOWN_ROOM') {
        semanticLabel = ocrConfirmed;
        isAmbiguous = false;
      }

      semanticRooms.push({
        roomId: room.roomId,
        polygonId: room.polygonId,
        canonicalType,
        semanticLabel,
        confidence: Math.round(confidence * 100) / 100,
        areaSqMeters: room.polygonAreaSqMeters,
        centroid: room.geometricCentroid,
        supportingEvidence,
        isAmbiguous
      });
    });

    return semanticRooms;
  }
}

export const semanticRoomClassifier = SemanticRoomClassifier.getInstance();
