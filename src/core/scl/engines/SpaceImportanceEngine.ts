// ============================================================================
// URJAFLUX AI OS - SCL v1.0 ENGINE 6: SPACE IMPORTANCE ENGINE
// Pure architectural & structural importance solver
// Ranks spaces: Primary, Supporting, Critical, Optional, Inactive, Future Expansion
// No knowledge judgement. Only architectural centrality, area footprint, and degree.
// ============================================================================

import { 
  ISpaceImportanceModel, 
  ISpaceImportanceRecord, 
  SpaceImportanceCategory 
} from "../types/scl.types";

import { IBlueprintSemanticModel } from "../../bsue/types/bsue.types";

export class SpaceImportanceEngine {
  private static instance: SpaceImportanceEngine;

  private constructor() {}

  public static getInstance(): SpaceImportanceEngine {
    if (!SpaceImportanceEngine.instance) {
      SpaceImportanceEngine.instance = new SpaceImportanceEngine();
    }
    return SpaceImportanceEngine.instance;
  }

  public calculateImportance(semanticModel: IBlueprintSemanticModel): ISpaceImportanceModel {
    const importanceRecords: ISpaceImportanceRecord[] = [];
    const totalAreaSqM = semanticModel.semanticRooms.reduce((sum, r) => sum + r.areaSqMeters, 0) || 100;

    const categoryBreakdown: Record<SpaceImportanceCategory, string[]> = {
      PRIMARY: [],
      SUPPORTING: [],
      CRITICAL: [],
      OPTIONAL: [],
      INACTIVE: [],
      FUTURE_EXPANSION: []
    };

    let highestImportanceScore = -1;
    let primaryCentroidRoomId: string | undefined = undefined;

    semanticModel.semanticRooms.forEach(room => {
      const type = room.canonicalType;
      const areaPercentage = Math.round((room.areaSqMeters / totalAreaSqM) * 1000) / 10;

      // Degree centrality
      const edgeCount = semanticModel.relationshipGraph.edges.filter(
        e => e.sourceRoomId === room.roomId || e.targetRoomId === room.roomId
      ).length;
      const centralityIndex = Math.round((edgeCount / Math.max(1, semanticModel.semanticRooms.length - 1)) * 100) / 100;

      let category: SpaceImportanceCategory = 'SUPPORTING';
      let importanceScore = 50.0;
      let rationale = 'Secondary space providing functional support.';

      if (type === 'LIVING_ROOM' || type === 'MASTER_BEDROOM') {
        category = 'PRIMARY';
        importanceScore = 90.0 + (areaPercentage * 0.2);
        rationale = 'Primary residential anchor space with large area footprint and high connectivity.';
      } else if (type === 'KITCHEN' || type === 'TOILET') {
        category = 'CRITICAL';
        importanceScore = 85.0 + (edgeCount * 5);
        rationale = 'Critical plumbing/utility node required for habitability standards.';
      } else if (type === 'CIRCULATION' || type === 'DINING_ROOM') {
        category = 'SUPPORTING';
        importanceScore = 70.0 + (centralityIndex * 20);
        rationale = 'Essential supporting circulation and dining space.';
      } else if (type === 'STORE_ROOM' || type === 'BALCONY') {
        category = 'OPTIONAL';
        importanceScore = 40.0;
        rationale = 'Auxiliary storage or outdoor balcony amenity space.';
      } else {
        category = 'SUPPORTING';
        importanceScore = 55.0;
        rationale = 'Standard architectural functional space.';
      }

      importanceScore = Math.min(100.0, Math.round(importanceScore * 10) / 10);

      if (importanceScore > highestImportanceScore) {
        highestImportanceScore = importanceScore;
        primaryCentroidRoomId = room.roomId;
      }

      categoryBreakdown[category].push(room.roomId);

      importanceRecords.push({
        roomId: room.roomId,
        roomName: room.semanticLabel || room.canonicalType,
        category,
        architecturalImportanceScore: importanceScore,
        centralityIndex,
        areaPercentage,
        rationale
      });
    });

    importanceRecords.sort((a, b) => b.architecturalImportanceScore - a.architecturalImportanceScore);

    return {
      importanceRecords,
      categoryBreakdown,
      primaryCentroidRoomId
    };
  }
}

export const spaceImportanceEngine = SpaceImportanceEngine.getInstance();
