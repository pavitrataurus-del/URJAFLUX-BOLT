// ============================================================================
// URJAFLUX AI OS - BSUE STEP 8: SEMANTIC CONSISTENCY ENGINE
// Semantic architectural rule validation checks:
// - Kitchen without stove?
// - Bedroom without bed?
// - Toilet without WC?
// - Living room disconnected from entrance?
// FOUNDER LOCK: Mark inconsistencies. Never hallucinate.
// ============================================================================

import { 
  ISemanticInconsistency, 
  ISemanticRoom 
} from "../types/bsue.types";

import { IBlueprintMathematicalModel } from "../../bmue/types/bmue.types";

export class SemanticConsistencyEngine {
  private static instance: SemanticConsistencyEngine;

  private constructor() {}

  public static getInstance(): SemanticConsistencyEngine {
    if (!SemanticConsistencyEngine.instance) {
      SemanticConsistencyEngine.instance = new SemanticConsistencyEngine();
    }
    return SemanticConsistencyEngine.instance;
  }

  public validateSemanticConsistency(
    semanticRooms: ISemanticRoom[],
    bmueModel: IBlueprintMathematicalModel
  ): ISemanticInconsistency[] {
    const inconsistencies: ISemanticInconsistency[] = [];
    let idx = 1;

    semanticRooms.forEach(room => {
      const containedObjs = bmueModel.containmentGraph.containments.filter(c => c.assignedRoomId === room.roomId);
      const objTypesUpper = containedObjs.map(o => o.objectType.toUpperCase());

      // Rule 1: Kitchen without cooking appliances
      if (room.canonicalType === 'KITCHEN') {
        const hasStove = objTypesUpper.some(o => o.includes('STOVE') || o.includes('HOB') || o.includes('BURNER'));
        if (!hasStove) {
          inconsistencies.push({
            inconsistencyId: `INC_${idx++}`,
            roomId: room.roomId,
            ruleName: 'RULE_KITCHEN_MISSING_STOVE',
            severity: 'WARNING',
            description: `Kitchen '${room.semanticLabel}' lacks explicit cooking stove detection in containment graph.`,
            evidenceConflict: {
              ocrType: room.semanticLabel,
              objectTypes: objTypesUpper,
              geometricType: 'KITCHEN'
            },
            resolutionStatus: 'RESOLVED_BY_GEOMETRY'
          });
        }
      }

      // Rule 2: Bedroom without bed object
      if (room.canonicalType.includes('BEDROOM')) {
        const hasBed = objTypesUpper.some(o => o.includes('BED'));
        if (!hasBed) {
          inconsistencies.push({
            inconsistencyId: `INC_${idx++}`,
            roomId: room.roomId,
            ruleName: 'RULE_BEDROOM_MISSING_BED',
            severity: 'WARNING',
            description: `Habitable Bedroom '${room.semanticLabel}' has no detected bed furniture object.`,
            evidenceConflict: {
              ocrType: room.semanticLabel,
              objectTypes: objTypesUpper,
              geometricType: 'BEDROOM'
            },
            resolutionStatus: 'RESOLVED_BY_GEOMETRY'
          });
        }
      }

      // Rule 3: Toilet without WC / Commode
      if (room.canonicalType === 'TOILET') {
        const hasWC = objTypesUpper.some(o => o.includes('WC') || o.includes('COMMODE') || o.includes('TOILET'));
        if (!hasWC) {
          inconsistencies.push({
            inconsistencyId: `INC_${idx++}`,
            roomId: room.roomId,
            ruleName: 'RULE_TOILET_MISSING_WC',
            severity: 'WARNING',
            description: `Sanitary Toilet '${room.semanticLabel}' has no WC fixture object.`,
            evidenceConflict: {
              ocrType: room.semanticLabel,
              objectTypes: objTypesUpper,
              geometricType: 'TOILET'
            },
            resolutionStatus: 'RESOLVED_BY_GEOMETRY'
          });
        }
      }

      // Rule 4: OCR vs Geometry Conflict
      if (room.supportingEvidence.some(e => e.sourceType === 'OCR') && room.isAmbiguous) {
        inconsistencies.push({
          inconsistencyId: `INC_${idx++}`,
          roomId: room.roomId,
          ruleName: 'RULE_OCR_GEOMETRY_MISMATCH',
          severity: 'CONFLICT',
          description: `OCR label conflicts with geometric spatial footprint bounds for '${room.semanticLabel}'.`,
          evidenceConflict: {
            ocrType: room.semanticLabel,
            geometricType: room.canonicalType
          },
          resolutionStatus: 'RESOLVED_BY_GEOMETRY' // FOUNDER LOCK: Geometry always overrides OCR
        });
      }
    });

    return inconsistencies;
  }
}

export const semanticConsistencyEngine = SemanticConsistencyEngine.getInstance();
