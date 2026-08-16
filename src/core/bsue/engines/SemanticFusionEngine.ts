// ============================================================================
// URJAFLUX AI OS - BSUE STEP 1: SEMANTIC FUSION ENGINE
// Multi-evidence fusion solver combining Geometry, OCR, Objects, Connectivity,
// Windows, Doors, Orientation, and Spatial Context
// FOUNDER LOCK: Never use only one source. Always use multi-evidence fusion.
// ============================================================================

import { 
  IEvidenceSource, 
  IFusedEvidenceBundle, 
  ISemanticFusionSummary 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class SemanticFusionEngine {
  private static instance: SemanticFusionEngine;

  private constructor() {}

  public static getInstance(): SemanticFusionEngine {
    if (!SemanticFusionEngine.instance) {
      SemanticFusionEngine.instance = new SemanticFusionEngine();
    }
    return SemanticFusionEngine.instance;
  }

  public fuseEvidence(bmueModel: IBlueprintMathematicalModel): ISemanticFusionSummary {
    const fusedBundles: IFusedEvidenceBundle[] = [];
    let conflictingEntityCount = 0;

    bmueModel.roomGraph.rooms.forEach(room => {
      const sources: IEvidenceSource[] = [];

      // Source 1: GEOMETRY Evidence (Weight: 0.45) - FOUNDER LOCK: Highest Priority
      sources.push({
        sourceType: 'GEOMETRY',
        evidenceKey: `AREA_${room.polygonAreaSqMeters}SQM_CENTROID_${Math.round(room.geometricCentroid.x)}_${Math.round(room.geometricCentroid.y)}`,
        weight: 0.45,
        description: `Room geometric footprint is ${room.polygonAreaSqMeters}m² with centroid at (${room.geometricCentroid.x}, ${room.geometricCentroid.y})`,
        rawConfidence: room.roomConfidence
      });

      // Source 2: OCR Evidence (Weight: 0.25)
      if (room.ocrConfirmedType) {
        sources.push({
          sourceType: 'OCR',
          evidenceKey: `OCR_LABEL_${room.ocrConfirmedType.toUpperCase()}`,
          weight: 0.25,
          description: `Blueprint OCR text label detected: '${room.ocrConfirmedType}'`,
          rawConfidence: room.ocrConfirmationStatus === 'GEOMETRY_CONFIRMED_BY_OCR' ? 0.95 : 0.60
        });
      }

      // Source 3: OBJECT Evidence (Weight: 0.20)
      const containedObjs = bmueModel.containmentGraph.containments.filter(c => c.assignedRoomId === room.roomId);
      if (containedObjs.length > 0) {
        const objTypes = containedObjs.map(o => o.objectType).join(', ');
        sources.push({
          sourceType: 'OBJECT',
          evidenceKey: `OBJECTS_${objTypes.toUpperCase()}`,
          weight: 0.20,
          description: `Detected ${containedObjs.length} object(s): [${objTypes}] inside room polygon`,
          rawConfidence: 0.90
        });
      }

      // Source 4: CONNECTIVITY Evidence (Weight: 0.10)
      const doorEdges = bmueModel.connectivityGraph.edges.filter(e => e.roomAId === room.roomId || e.roomBId === room.roomId);
      if (doorEdges.length > 0) {
        sources.push({
          sourceType: 'CONNECTIVITY',
          evidenceKey: `DOOR_CONNECTIONS_${doorEdges.length}`,
          weight: 0.10,
          description: `Connected to ${doorEdges.length} doors in circulation network`,
          rawConfidence: 0.85
        });
      }

      // Compute Weighted Multi-Evidence Fusion Confidence Score
      let totalWeight = 0;
      let weightedConfidenceSum = 0;
      sources.forEach(s => {
        totalWeight += s.weight;
        weightedConfidenceSum += s.rawConfidence * s.weight;
      });

      const fusedConfidenceScore = totalWeight > 0 
        ? Math.round((weightedConfidenceSum / totalWeight) * 100) / 100 
        : room.roomConfidence;

      const hasConflictingEvidence = room.ocrConfirmationStatus === 'OCR_CONFLICT_RESOLVED_BY_GEOMETRY';
      if (hasConflictingEvidence) {
        conflictingEntityCount++;
      }

      fusedBundles.push({
        entityId: room.roomId,
        primaryTypeCandidate: room.primaryType,
        sources,
        fusedConfidenceScore,
        dominantSource: 'GEOMETRY', // FOUNDER LOCK: Geometry is always dominant
        hasConflictingEvidence
      });
    });

    return {
      fusedBundles,
      totalEntitiesFused: fusedBundles.length,
      conflictingEntityCount
    };
  }
}

export const semanticFusionEngine = SemanticFusionEngine.getInstance();
